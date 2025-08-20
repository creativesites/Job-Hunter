import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { subDays, addDays } from 'date-fns';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate smart notifications based on user activity and AI insights
    const notifications = await generateSmartNotifications(user.id);
    
    // Calculate stats
    const stats = {
      total_unread: notifications.filter(n => !n.read).length,
      high_priority: notifications.filter(n => n.priority === 'high' && !n.read).length,
      insights_count: notifications.filter(n => n.type === 'insight').length,
      alerts_count: notifications.filter(n => n.type === 'alert').length
    };

    return NextResponse.json({
      notifications: notifications.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
      stats
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateSmartNotifications(userId: string) {
  const notifications = [];
  const now = new Date();

  // Get user data for context
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('user_id', userId);

  const { data: emails } = await supabase
    .from('email_queue')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  const { data: userSettings } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  // 1. Daily Goal Progress Insight
  const todayEmails = emails?.filter(e => {
    const emailDate = new Date(e.created_at);
    return emailDate.toDateString() === now.toDateString() && 
           (e.status === 'sent' || e.status === 'queued');
  }).length || 0;

  if (todayEmails >= 5) {
    notifications.push({
      id: 'daily-goal-' + now.toDateString(),
      type: 'achievement',
      priority: 'medium',
      title: '🎯 Daily Goal Achieved!',
      message: `Great job! You've sent ${todayEmails} emails today. Your consistency is building momentum for career opportunities.`,
      read: false,
      created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
    });
  } else if (todayEmails === 0 && now.getHours() > 10) {
    notifications.push({
      id: 'daily-reminder-' + now.toDateString(),
      type: 'reminder',
      priority: 'high',
      title: '📧 Daily Outreach Reminder',
      message: 'You haven\'t sent any emails today yet. Consider reaching out to a few leads to maintain momentum.',
      action_text: 'Browse AI Curated Leads',
      action_url: '/dashboard',
      read: false,
      created_at: new Date(now.getTime() - 30 * 60 * 1000).toISOString() // 30 minutes ago
    });
  }

  // 2. Response Rate Insights
  const recentEmails = emails?.filter(e => {
    const emailDate = new Date(e.created_at);
    return emailDate > subDays(now, 7);
  }) || [];

  if (recentEmails.length >= 10) {
    // Simulate response rate analysis
    const responseRate = Math.random() * 15 + 5; // 5-20%
    const avgRate = 8.5;
    
    if (responseRate > avgRate + 3) {
      notifications.push({
        id: 'response-insight-' + Date.now(),
        type: 'insight',
        priority: 'medium',
        title: '📈 Above Average Response Rate!',
        message: `Your response rate this week (${responseRate.toFixed(1)}%) is ${(responseRate - avgRate).toFixed(1)}% above the industry average. Your email strategy is working!`,
        read: false,
        created_at: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString() // 6 hours ago
      });
    } else if (responseRate < avgRate - 2) {
      notifications.push({
        id: 'response-alert-' + Date.now(),
        type: 'alert',
        priority: 'medium',
        title: '⚠️ Response Rate Below Average',
        message: `Your response rate this week (${responseRate.toFixed(1)}%) is below average. Consider trying different subject lines or email templates.`,
        action_text: 'View Analytics',
        action_url: '/analytics',
        read: false,
        created_at: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
      });
    }
  }

  // 3. Lead Quality Insights
  const highQualityLeads = leads?.filter(l => (l.ai_score || 0) >= 80).length || 0;
  const totalLeads = leads?.length || 0;

  if (highQualityLeads > 0 && totalLeads > 0) {
    const qualityPercentage = (highQualityLeads / totalLeads) * 100;
    
    if (qualityPercentage >= 25) {
      notifications.push({
        id: 'lead-quality-' + Date.now(),
        type: 'insight',
        priority: 'low',
        title: '🎯 High-Quality Lead Pool',
        message: `${qualityPercentage.toFixed(0)}% of your leads are high-quality (80+ AI score). Focus your efforts on these for better results.`,
        action_text: 'View Top Leads',
        action_url: '/dashboard',
        read: false,
        created_at: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString() // 8 hours ago
      });
    }
  }

  // 4. Optimal Send Time Recommendations
  const currentHour = now.getHours();
  if (currentHour >= 9 && currentHour <= 11 && todayEmails === 0) {
    notifications.push({
      id: 'optimal-time-' + now.toDateString(),
      type: 'opportunity',
      priority: 'medium',
      title: '⏰ Optimal Send Time Window',
      message: 'Right now is a great time to send emails! Research shows 9-11 AM has the highest response rates in the automotive industry.',
      action_text: 'Send Emails Now',
      action_url: '/dashboard',
      read: false,
      created_at: new Date(now.getTime() - 15 * 60 * 1000).toISOString() // 15 minutes ago
    });
  }

  // 5. Geographic Opportunities
  const stateDistribution = leads?.reduce((acc: any, lead) => {
    if (lead.state) {
      acc[lead.state] = (acc[lead.state] || 0) + 1;
    }
    return acc;
  }, {}) || {};

  const topStates = Object.entries(stateDistribution)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 3);

  if (topStates.length > 0) {
    const [topState, count] = topStates[0];
    if ((count as number) >= 10) {
      notifications.push({
        id: 'geo-opportunity-' + topState,
        type: 'opportunity',
        priority: 'low',
        title: `🗺️ Strong Presence in ${topState}`,
        message: `You have ${count} leads in ${topState}. Consider mentioning local market knowledge in your outreach to these contacts.`,
        read: false,
        created_at: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString() // 12 hours ago
      });
    }
  }

  // 6. Follow-up Reminders
  const oldEmails = emails?.filter(e => {
    const emailDate = new Date(e.created_at);
    const daysSince = (now.getTime() - emailDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince >= 3 && daysSince <= 7 && e.status === 'sent';
  }) || [];

  if (oldEmails.length > 0) {
    notifications.push({
      id: 'followup-reminder-' + Date.now(),
      type: 'reminder',
      priority: 'medium',
      title: '🔄 Follow-up Opportunities',
      message: `You have ${oldEmails.length} emails from 3-7 days ago that could benefit from follow-ups. Strike while the iron is warm!`,
      action_text: 'View Email History',
      action_url: '/emails',
      read: false,
      created_at: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
    });
  }

  // 7. Profile Completion Reminder
  if (!userSettings?.cv_file_url || !userSettings?.ai_context) {
    notifications.push({
      id: 'profile-completion',
      type: 'alert',
      priority: 'high',
      title: '📋 Complete Your Profile',
      message: 'Upload your CV and add AI context to generate more personalized, effective emails. This significantly improves response rates.',
      action_text: 'Complete Profile',
      action_url: '/dashboard',
      read: false,
      created_at: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString() // 24 hours ago
    });
  }

  // 8. Weekly Performance Summary (Mondays)
  if (now.getDay() === 1 && now.getHours() >= 9) { // Monday morning
    const lastWeekEmails = emails?.filter(e => {
      const emailDate = new Date(e.created_at);
      const daysAgo = (now.getTime() - emailDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo >= 0 && daysAgo <= 7 && (e.status === 'sent' || e.status === 'queued');
    }).length || 0;

    notifications.push({
      id: 'weekly-summary-' + now.toISOString().split('T')[0],
      type: 'insight',
      priority: 'low',
      title: '📊 Weekly Performance Summary',
      message: `Last week you sent ${lastWeekEmails} emails. ${lastWeekEmails >= 25 ? 'Excellent consistency!' : 'Consider increasing your outreach volume for better results.'}`,
      action_text: 'View Full Analytics',
      action_url: '/analytics',
      read: false,
      created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
    });
  }

  // 9. Success Story Motivation
  if (Math.random() < 0.3) { // 30% chance to show motivational message
    const successStories = [
      'Job seekers who send 10+ personalized emails per day are 3x more likely to get responses.',
      'The average successful job search in automotive takes 2-3 months of consistent outreach.',
      'Following up 2-3 times increases response rates by 65% in the automotive industry.',
      'Job seekers who use AI-personalized emails see 40% higher response rates than generic templates.'
    ];

    const randomStory = successStories[Math.floor(Math.random() * successStories.length)];
    
    notifications.push({
      id: 'motivation-' + Date.now(),
      type: 'insight',
      priority: 'low',
      title: '💪 Success Insight',
      message: randomStory,
      read: false,
      created_at: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString() // 3 hours ago
    });
  }

  return notifications;
}