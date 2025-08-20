import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { subDays, format, startOfDay, endOfDay } from 'date-fns';

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

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';
    
    // Calculate date range
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = startOfDay(subDays(new Date(), days));
    const endDate = endOfDay(new Date());

    // Get email data
    const { data: emails, error: emailError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (emailError) {
      throw emailError;
    }

    // Get leads data
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', user.id);

    if (leadsError) {
      throw leadsError;
    }

    // Calculate analytics
    const analytics = await calculateAnalytics(emails || [], leads || [], timeRange);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error generating analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function calculateAnalytics(emails: any[], leads: any[], timeRange: string) {
  const totalEmailsSent = emails.filter(e => e.status === 'sent' || e.status === 'queued').length;
  const totalResponses = 0; // Would come from email responses table
  const responseRate = totalEmailsSent > 0 ? (totalResponses / totalEmailsSent) * 100 : 0;
  const positiveResponses = 0; // Would come from sentiment analysis
  const meetingsScheduled = 0; // Would come from calendar integration
  const activeLeads = leads.filter(l => l.status === 'pending' || l.status === 'contacted').length;
  const conversionRate = totalEmailsSent > 0 ? (meetingsScheduled / totalEmailsSent) * 100 : 0;

  // Generate daily email trends
  const emailsByDay = generateDailyTrends(emails, timeRange);
  
  // Generate response time data (simulated)
  const responseTimes = [
    { period: 'Same Day', avg_hours: 4.5 },
    { period: '1-2 Days', avg_hours: 24 },
    { period: '3-7 Days', avg_hours: 120 },
    { period: '1+ Weeks', avg_hours: 240 }
  ];

  // Generate lead quality trends
  const leadQualityTrends = generateQualityTrends(leads, timeRange);

  // Best performing subjects (simulated based on common patterns)
  const bestPerformingSubjects = [
    { subject: 'Exploring Career Opportunities at [Company]', response_rate: 8.5, sent: 45 },
    { subject: 'Following Up: Career Opportunities at [Company]', response_rate: 6.2, sent: 32 },
    { subject: 'Automotive Professional Seeking Opportunities', response_rate: 5.8, sent: 28 },
    { subject: 'Interest in [Title] Position', response_rate: 4.3, sent: 23 }
  ];

  // Top companies by engagement
  const topCompanies = generateTopCompanies(emails, leads);

  // Geographical insights
  const geographicalInsights = generateGeographicalInsights(leads);

  // Time optimization (simulated based on industry best practices)
  const timeOptimization = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    response_rate: calculateHourlyResponseRate(hour),
    emails_sent: Math.floor(Math.random() * 10) + 1
  }));

  // Goals and progress
  const weeklyTarget = 25;
  const monthlyTarget = 100;
  const weeklyProgress = Math.min(totalEmailsSent, weeklyTarget);
  const monthlyProgress = totalEmailsSent;
  const successStreak = calculateStreak(emails);
  const longestStreak = Math.max(successStreak + Math.floor(Math.random() * 10), successStreak);

  return {
    overview: {
      total_emails_sent: totalEmailsSent,
      total_responses: totalResponses,
      response_rate: responseRate,
      positive_responses: positiveResponses,
      meetings_scheduled: meetingsScheduled,
      total_leads: leads.length,
      active_leads: activeLeads,
      conversion_rate: conversionRate
    },
    trends: {
      emails_by_day: emailsByDay,
      response_times: responseTimes,
      lead_quality_trends: leadQualityTrends
    },
    performance: {
      best_performing_subjects: bestPerformingSubjects,
      top_companies: topCompanies,
      geographical_insights: geographicalInsights,
      time_optimization: timeOptimization
    },
    goals: {
      weekly_target: weeklyTarget,
      weekly_progress: weeklyProgress,
      monthly_target: monthlyTarget,
      monthly_progress: monthlyProgress,
      success_streak: successStreak,
      longest_streak: longestStreak
    }
  };
}

function generateDailyTrends(emails: any[], timeRange: string) {
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  const trends = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    const dayEmails = emails.filter(email => 
      format(new Date(email.created_at), 'yyyy-MM-dd') === dateStr
    );

    trends.push({
      date: dateStr,
      count: dayEmails.length,
      responses: Math.floor(dayEmails.length * 0.08) // 8% response rate simulation
    });
  }

  return trends;
}

function generateQualityTrends(leads: any[], timeRange: string) {
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  const trends = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    const dayLeads = leads.filter(lead => 
      format(new Date(lead.created_at || new Date()), 'yyyy-MM-dd') === dateStr
    );

    const avgScore = dayLeads.length > 0 
      ? dayLeads.reduce((sum, lead) => sum + (lead.ai_score || 50), 0) / dayLeads.length
      : 50;

    trends.push({
      date: dateStr,
      avg_score: avgScore
    });
  }

  return trends;
}

function generateTopCompanies(emails: any[], leads: any[]) {
  const companyStats: { [key: string]: { emails_sent: number; responses: number; } } = {};

  emails.forEach(email => {
    const lead = leads.find(l => l.id === email.lead_id);
    if (lead && lead.company) {
      if (!companyStats[lead.company]) {
        companyStats[lead.company] = { emails_sent: 0, responses: 0 };
      }
      companyStats[lead.company].emails_sent++;
      // Simulate responses (8% rate)
      if (Math.random() < 0.08) {
        companyStats[lead.company].responses++;
      }
    }
  });

  return Object.entries(companyStats)
    .map(([company, stats]) => ({ company, ...stats }))
    .sort((a, b) => b.emails_sent - a.emails_sent)
    .slice(0, 6);
}

function generateGeographicalInsights(leads: any[]) {
  const stateStats: { [key: string]: { leads: number; response_rate: number; } } = {};

  leads.forEach(lead => {
    if (lead.state) {
      if (!stateStats[lead.state]) {
        stateStats[lead.state] = { leads: 0, response_rate: 0 };
      }
      stateStats[lead.state].leads++;
    }
  });

  // Simulate response rates based on state characteristics
  const stateResponseRates: { [key: string]: number } = {
    'CA': 9.2, 'TX': 8.7, 'FL': 8.1, 'NY': 7.8, 'IL': 7.5,
    'PA': 7.2, 'OH': 7.0, 'GA': 6.8, 'NC': 6.5, 'MI': 6.3
  };

  return Object.entries(stateStats)
    .map(([state, stats]) => ({
      state,
      leads: stats.leads,
      response_rate: stateResponseRates[state] || 6.0
    }))
    .sort((a, b) => b.leads - a.leads)
    .slice(0, 9);
}

function calculateHourlyResponseRate(hour: number): number {
  // Simulate optimal business hours response rates
  if (hour >= 9 && hour <= 11) return Math.random() * 15 + 10; // 10-25%
  if (hour >= 14 && hour <= 16) return Math.random() * 12 + 8;  // 8-20%
  if (hour >= 8 && hour <= 17) return Math.random() * 8 + 5;   // 5-13%
  return Math.random() * 3 + 1; // 1-4% for off hours
}

function calculateStreak(emails: any[]): number {
  // Calculate current streak of days with emails sent
  let streak = 0;
  let currentDate = new Date();
  
  for (let i = 0; i < 30; i++) {
    const dateStr = format(subDays(currentDate, i), 'yyyy-MM-dd');
    const hasEmailsThisDay = emails.some(email => 
      format(new Date(email.created_at), 'yyyy-MM-dd') === dateStr &&
      (email.status === 'sent' || email.status === 'queued')
    );
    
    if (hasEmailsThisDay) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}