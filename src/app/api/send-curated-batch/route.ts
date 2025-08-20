import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { EmailQueueService } from '@/lib/email-queue';
import { generateEmailContent } from '@/lib/ai-service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leadIds } = await request.json();

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ error: 'No leads provided' }, { status: 400 });
    }

    // Check daily limits
    const limitCheck = await EmailQueueService.canSendToday(user.id);
    if (!limitCheck.canSend) {
      return NextResponse.json({ 
        error: 'Daily email limit reached',
        limit: limitCheck.limit,
        sent: limitCheck.sent
      }, { status: 429 });
    }

    if (leadIds.length > limitCheck.remaining) {
      return NextResponse.json({ 
        error: `Can only send ${limitCheck.remaining} more emails today`,
        limit: limitCheck.limit,
        sent: limitCheck.sent,
        remaining: limitCheck.remaining
      }, { status: 429 });
    }

    // Get lead details
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .in('id', leadIds)
      .eq('user_id', user.id);

    if (leadsError || !leads) {
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 400 });
    }

    // Process each lead
    const results = [];
    const errors = [];

    for (const lead of leads) {
      try {
        // Generate AI-powered email content
        const emailContent = await generateEmailContent(lead, 'introduction', user.id);
        const subject = `Exploring Career Opportunities at ${lead.company}`;

        // Add to email queue with high priority for curated emails
        const queueResult = await EmailQueueService.addToQueue(
          user.id,
          lead.id,
          subject,
          emailContent,
          'introduction',
          10 // High priority for curated emails
        );

        if (queueResult.success) {
          results.push({
            leadId: lead.id,
            leadName: `${lead.first_name} ${lead.last_name}`,
            company: lead.company,
            queueId: queueResult.queueId,
            status: 'queued'
          });
        } else {
          errors.push({
            leadId: lead.id,
            leadName: `${lead.first_name} ${lead.last_name}`,
            error: queueResult.error
          });
        }
      } catch (error) {
        console.error(`Error processing lead ${lead.id}:`, error);
        errors.push({
          leadId: lead.id,
          leadName: `${lead.first_name} ${lead.last_name}`,
          error: 'Failed to generate email content'
        });
      }
    }

    // Update daily limits check
    const updatedLimitCheck = await EmailQueueService.canSendToday(user.id);

    return NextResponse.json({
      success: true,
      message: `Successfully queued ${results.length} emails`,
      results,
      errors,
      dailyLimit: {
        sent: updatedLimitCheck.sent,
        remaining: updatedLimitCheck.remaining,
        limit: updatedLimitCheck.limit
      }
    });

  } catch (error) {
    console.error('Error sending curated batch:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}