import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { EmailQueueService } from '@/lib/email-queue';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leadId, subject, content, emailType } = await request.json();

    if (!leadId || !subject || !content) {
      return NextResponse.json({ 
        error: 'Missing required fields: leadId, subject, content' 
      }, { status: 400 });
    }

    // Get the lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Check if user can send emails today
    const canSend = await EmailQueueService.canSendToday(user.id);
    if (!canSend.canSend) {
      return NextResponse.json({
        error: `Daily email limit reached. You have sent ${canSend.sent}/${canSend.limit} emails today. Try again tomorrow.`,
      }, { status: 429 });
    }

    // Add email to queue instead of sending immediately
    const queueResult = await EmailQueueService.addToQueue(
      user.id,
      leadId,
      subject,
      content,
      emailType as 'introduction' | 'follow-up',
      0, // Default priority
      new Date() // Send immediately if possible
    );

    if (!queueResult.success) {
      return NextResponse.json({
        error: queueResult.error || 'Failed to queue email',
      }, { status: 500 });
    }

    // Create analytics event for queueing
    await supabase
      .from('analytics_events')
      .insert({
        user_id: user.id,
        event_type: 'email_queued',
        lead_id: leadId,
        metadata: {
          email_type: emailType,
          subject,
          queue_id: queueResult.queueId,
        },
      });

    return NextResponse.json({
      success: true,
      message: 'Email queued successfully and will be sent shortly',
      queueId: queueResult.queueId,
      remainingToday: canSend.remaining - 1,
    });

  } catch (error) {
    console.error('Send email API error:', error);
    return NextResponse.json({
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}