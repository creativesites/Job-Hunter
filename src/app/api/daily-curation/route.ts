import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { generateAIInsight } from '@/lib/ai-service';

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

    // Get user's leads for curation
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .order('ai_score', { ascending: false })
      .limit(50);

    if (leadsError) {
      throw leadsError;
    }

    // Get today's email stats
    const today = new Date().toISOString().split('T')[0];
    const { data: emailStats, error: statsError } = await supabase
      .from('email_queue')
      .select('status, created_at')
      .eq('user_id', user.id)
      .gte('created_at', `${today}T00:00:00Z`)
      .lt('created_at', `${today}T23:59:59Z`);

    if (statsError) {
      throw statsError;
    }

    // Calculate daily stats
    const emailsSent = emailStats?.filter(e => e.status === 'sent' || e.status === 'queued').length || 0;
    const responsesReceived = 0; // Would come from email responses table
    const positiveResponses = 0; // Would come from sentiment analysis

    // Get user settings for personalization
    const { data: userSettings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // AI-powered lead curation
    const curatedLeads = await generateDailyCuration(leads || [], userSettings);

    // Generate motivational message based on progress and energy
    const energyLevel = determineEnergyLevel(emailsSent, responsesReceived);
    const motivationMessage = generateMotivationalMessage(energyLevel, emailsSent);

    const curation = {
      date: today,
      total_leads: leads?.length || 0,
      curated_leads: curatedLeads,
      motivation_message: motivationMessage,
      daily_goal: 10,
      progress: {
        emails_sent: emailsSent,
        responses_received: responsesReceived,
        positive_responses: positiveResponses
      },
      success_prediction: calculateSuccessPrediction(curatedLeads),
      energy_level: energyLevel
    };

    return NextResponse.json(curation);
  } catch (error) {
    console.error('Error generating daily curation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await request.json();

    if (action === 'regenerate') {
      // Simply call GET to regenerate curation
      return GET(request);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing curation action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateDailyCuration(leads: any[], userSettings: any) {
  const curatedLeads = [];
  const maxLeads = 8;

  for (let i = 0; i < Math.min(leads.length, maxLeads); i++) {
    const lead = leads[i];
    
    // Calculate curation score based on multiple factors
    const curationScore = calculateCurationScore(lead, userSettings);
    
    // Generate optimal send time (based on location, industry, etc.)
    const optimalSendTime = calculateOptimalSendTime(lead);
    
    // Generate AI reasoning and personalization notes
    const curationReason = generateCurationReason(lead, curationScore);
    const personalizationNotes = generatePersonalizationNotes(lead, userSettings);

    curatedLeads.push({
      ...lead,
      curation_score: curationScore,
      curation_reason: curationReason,
      optimal_send_time: optimalSendTime,
      personalization_notes: personalizationNotes
    });
  }

  // Sort by curation score descending
  return curatedLeads.sort((a, b) => b.curation_score - a.curation_score);
}

function calculateCurationScore(lead: any, userSettings: any): number {
  let score = lead.ai_score || 50;

  // Boost score based on company size indicators
  if (lead.company?.toLowerCase().includes('group') || 
      lead.company?.toLowerCase().includes('automotive')) {
    score += 10;
  }

  // Boost score for decision maker titles
  const title = lead.title?.toLowerCase() || '';
  if (title.includes('manager') || title.includes('director') || 
      title.includes('owner') || title.includes('president')) {
    score += 15;
  }

  // Geographic proximity bonus (if user has location)
  if (userSettings?.state === lead.state) {
    score += 5;
  }

  // Digital dealer bonus
  if (lead.digital_dealer) {
    score += 8;
  }

  return Math.min(Math.max(score, 0), 100);
}

function calculateOptimalSendTime(lead: any): string {
  const timeZones: { [key: string]: string } = {
    'CA': '9:00 AM PST',
    'NY': '10:00 AM EST',
    'TX': '9:30 AM CST',
    'FL': '10:00 AM EST'
  };

  return timeZones[lead.state] || '9:00 AM Local';
}

function generateCurationReason(lead: any, score: number): string {
  const reasons = [];

  if (score >= 80) {
    reasons.push("High AI qualification score indicates strong potential");
  }
  
  if (lead.title?.toLowerCase().includes('manager')) {
    reasons.push("Decision maker role with hiring authority");
  }
  
  if (lead.digital_dealer) {
    reasons.push("Digital-forward dealership likely values tech skills");
  }
  
  if (lead.company?.toLowerCase().includes('group')) {
    reasons.push("Multi-location group with expansion opportunities");
  }

  return reasons.length > 0 
    ? reasons.join('. ') + '.'
    : "Good baseline qualification with solid engagement potential.";
}

function generatePersonalizationNotes(lead: any, userSettings: any): string {
  const notes = [];

  if (lead.city && lead.state) {
    notes.push(`Mention local market knowledge for ${lead.city}, ${lead.state}`);
  }

  if (userSettings?.years_experience) {
    notes.push(`Highlight ${userSettings.years_experience}+ years of automotive experience`);
  }

  if (lead.digital_dealer) {
    notes.push("Emphasize digital marketing and CRM expertise");
  }

  return notes.length > 0 
    ? notes.join('. ') + '.'
    : "Use standard automotive industry talking points.";
}

function determineEnergyLevel(emailsSent: number, responsesReceived: number): 'high' | 'medium' | 'low' {
  if (responsesReceived > 2 || emailsSent >= 8) return 'high';
  if (responsesReceived > 0 || emailsSent >= 4) return 'medium';
  return 'low';
}

function generateMotivationalMessage(energyLevel: string, emailsSent: number): string {
  const messages = {
    high: [
      "🚀 You're on fire today! Your momentum is building incredible opportunities. Keep pushing forward - success loves persistence!",
      "⭐ Absolutely crushing it! Your consistent outreach is opening doors to amazing career opportunities. The automotive industry needs your talent!",
      "🔥 Outstanding progress! You're demonstrating the exact persistence that hiring managers love to see. Your next breakthrough is just emails away!"
    ],
    medium: [
      "💪 Solid progress today! You're building valuable connections in the automotive industry. Every email is a potential door to your dream role!",
      "🎯 Great momentum! Your professional approach is making an impression. Stay consistent - the right opportunity is coming your way!",
      "⚡ You're doing great! Each outreach email showcases your initiative and drive. Keep going - employers notice dedication like yours!"
    ],
    low: [
      "🌟 Every journey starts with a single step! Today is perfect for connecting with automotive leaders who need your skills. Let's make it happen!",
      "💎 Your potential is unlimited! The automotive industry is full of opportunities waiting for someone exactly like you. Start strong today!",
      "🚀 Ready to accelerate your career? Today's the day to show the automotive world what you can bring to their teams. Your time is now!"
    ]
  };

  const messageArray = messages[energyLevel] || messages.medium;
  return messageArray[Math.floor(Math.random() * messageArray.length)];
}

function calculateSuccessPrediction(curatedLeads: any[]): number {
  if (curatedLeads.length === 0) return 15;

  const avgScore = curatedLeads.reduce((sum, lead) => sum + lead.curation_score, 0) / curatedLeads.length;
  
  // Convert AI score to success prediction percentage
  // High-quality leads (80+) = 35-45% success rate
  // Medium leads (60-79) = 25-35% success rate  
  // Lower leads (40-59) = 15-25% success rate

  if (avgScore >= 80) return Math.floor(35 + (avgScore - 80) / 2);
  if (avgScore >= 60) return Math.floor(25 + (avgScore - 60) / 2);
  return Math.floor(15 + (avgScore - 40) / 3);
}