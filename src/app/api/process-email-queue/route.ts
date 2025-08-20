import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { EmailQueueService } from '@/lib/email-queue';
import { supabase } from '@/lib/supabase';
import { GmailService } from '@/lib/gmail-service';
import { UserSettingsService } from '@/lib/user-settings';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const processedEmails = await processEmailsForUser(user.id);
    
    return NextResponse.json({
      success: true,
      processed: processedEmails.length,
      details: processedEmails,
    });

  } catch (error) {
    console.error('Process email queue error:', error);
    return NextResponse.json({
      error: 'Failed to process email queue',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function processEmailsForUser(userId: string): Promise<any[]> {
  const processedEmails = [];
  
  try {
    // Process up to 5 emails at once to avoid overwhelming the system
    for (let i = 0; i < 5; i++) {
      const nextEmail = await EmailQueueService.getNextEmailToSend(userId);
      if (!nextEmail) {
        break; // No more emails to send today or in queue
      }

      try {
        // Get lead details
        const { data: lead, error: leadError } = await supabase
          .from('leads')
          .select('*')
          .eq('id', nextEmail.lead_id)
          .single();

        if (leadError || !lead) {
          await EmailQueueService.markAsFailed(
            nextEmail.id, 
            `Lead not found: ${leadError?.message || 'Unknown error'}`
          );
          processedEmails.push({
            id: nextEmail.id,
            status: 'failed',
            error: 'Lead not found'
          });
          continue;
        }

        // Get user settings for email sending
        const fromName = await UserSettingsService.getEmailFromName(userId);
        const emailProvider = await UserSettingsService.getEmailProvider(userId);
        
        // Try to send the email
        const emailResult = await sendEmail(
          lead.email, 
          nextEmail.subject, 
          nextEmail.content,
          fromName,
          emailProvider
        );
        
        if (emailResult.success) {
          // Mark as sent and create campaign record
          await EmailQueueService.markAsSent(nextEmail.id, userId);
          
          // Create email campaign record
          const { data: campaign, error: campaignError } = await supabase
            .from('email_campaigns')
            .insert({
              lead_id: nextEmail.lead_id,
              user_id: userId,
              subject: nextEmail.subject,
              content: nextEmail.content,
              delivery_status: 'sent',
              sent_at: new Date().toISOString(),
            })
            .select()
            .single();

          // Update lead status
          await supabase
            .from('leads')
            .update({ status: 'sent' })
            .eq('id', nextEmail.lead_id);

          // Create analytics event
          await supabase
            .from('analytics_events')
            .insert({
              user_id: userId,
              event_type: 'email_sent',
              lead_id: nextEmail.lead_id,
              campaign_id: campaign?.id,
              metadata: {
                email_type: nextEmail.email_type,
                subject: nextEmail.subject,
                queue_id: nextEmail.id,
              },
            });

          processedEmails.push({
            id: nextEmail.id,
            leadId: nextEmail.lead_id,
            status: 'sent',
            campaignId: campaign?.id
          });

        } else {
          // Mark as failed
          await EmailQueueService.markAsFailed(nextEmail.id, emailResult.error || 'Unknown sending error');
          
          processedEmails.push({
            id: nextEmail.id,
            leadId: nextEmail.lead_id,
            status: 'failed',
            error: emailResult.error
          });
        }

      } catch (emailError) {
        console.error('Error processing individual email:', emailError);
        await EmailQueueService.markAsFailed(
          nextEmail.id, 
          emailError instanceof Error ? emailError.message : 'Processing error'
        );
        
        processedEmails.push({
          id: nextEmail.id,
          status: 'failed',
          error: emailError instanceof Error ? emailError.message : 'Processing error'
        });
      }
    }

    return processedEmails;
  } catch (error) {
    console.error('Error in processEmailsForUser:', error);
    return processedEmails;
  }
}

async function sendEmail(
  to: string, 
  subject: string, 
  content: string,
  fromName: string = 'Winston Zulu',
  emailProvider: 'gmail' | 'resend' = 'gmail'
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    // Choose email provider based on user preference and availability
    if (emailProvider === 'gmail' && GmailService.isConfigured()) {
      // Use Gmail API
      return await GmailService.sendEmailViaSmtp({
        to,
        subject,
        content,
        fromName,
      });
    } else if (emailProvider === 'resend' && process.env.RESEND_API_KEY) {
      // Use Resend
      const { data, error } = await resend.emails.send({
        from: `${fromName} <noreply@yourdomain.com>`, // Replace with your verified domain
        to: [to],
        subject: subject,
        text: content,
      });

      if (error) {
        console.error('Resend email error:', error);
        return {
          success: false,
          error: error.message || 'Failed to send email'
        };
      }

      return {
        success: true,
        messageId: data.id,
      };
    } else {
      // Fallback to simulation for development
      console.log('Simulating email send (no service configured):', {
        to,
        subject,
        from: fromName,
        provider: emailProvider,
        content: content.substring(0, 100) + '...',
      });
      
      // Add small delay to simulate real email sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        messageId: `simulated-${emailProvider}-${Date.now()}`,
      };
    }

  } catch (error) {
    console.error('Send email error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// GET endpoint to manually trigger processing for testing
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const processedEmails = await processEmailsForUser(user.id);
    
    return NextResponse.json({
      success: true,
      message: 'Email queue processed',
      processed: processedEmails.length,
      details: processedEmails,
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to process queue',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}