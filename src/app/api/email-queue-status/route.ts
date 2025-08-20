import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { EmailQueueService } from '@/lib/email-queue';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get daily sending stats
    const canSend = await EmailQueueService.canSendToday(user.id);
    
    // Get queued emails
    const queuedEmails = await EmailQueueService.getQueuedEmails(user.id, 100);
    
    // Get daily stats for the past week
    const dailyStats = await EmailQueueService.getDailyStats(user.id, 7);

    // Organize queued emails by status
    const queueByStatus = {
      queued: queuedEmails.filter(email => email.status === 'queued'),
      sent: queuedEmails.filter(email => email.status === 'sent'),
      failed: queuedEmails.filter(email => email.status === 'failed'),
      cancelled: queuedEmails.filter(email => email.status === 'cancelled'),
    };

    return NextResponse.json({
      success: true,
      dailyLimit: {
        sent: canSend.sent,
        remaining: canSend.remaining,
        limit: canSend.limit,
        canSend: canSend.canSend,
      },
      queue: {
        total: queuedEmails.length,
        byStatus: {
          queued: queueByStatus.queued.length,
          sent: queueByStatus.sent.length,
          failed: queueByStatus.failed.length,
          cancelled: queueByStatus.cancelled.length,
        },
        emails: queueByStatus,
      },
      dailyStats: dailyStats,
    });

  } catch (error) {
    console.error('Email queue status error:', error);
    return NextResponse.json({
      error: 'Failed to get queue status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queueId = searchParams.get('queueId');

    if (!queueId) {
      return NextResponse.json({ error: 'queueId parameter required' }, { status: 400 });
    }

    const cancelled = await EmailQueueService.cancelEmail(queueId, user.id);
    
    if (!cancelled) {
      return NextResponse.json({ error: 'Failed to cancel email' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Email cancelled successfully',
    });

  } catch (error) {
    console.error('Cancel email error:', error);
    return NextResponse.json({
      error: 'Failed to cancel email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}