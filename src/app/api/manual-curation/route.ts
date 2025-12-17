import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { qualifyLead } from '@/lib/ai-service';

interface CurationCriteria {
  includeDigitalDealer?: boolean;
  minimumScore?: number;
  prioritizeRecentActivity?: boolean;
  excludeRecentlyContacted?: boolean;
  maxLeads?: number;
  states?: string[];
  titles?: string[];
}

interface CurationResult {
  highPriorityLeads: Array<{
    id: string;
    name: string;
    company: string;
    score: number;
    reasoning: string;
    urgency: 'immediate' | 'today' | 'this-week';
    contact_info: {
      email: string;
      title: string;
      location: string;
    };
  }>;
  insights: string[];
  recommendations: string[];
  totalProcessed: number;
  statistics: {
    averageScore: number;
    topStates: string[];
    digitalDealerPercentage: number;
    titleDistribution: Record<string, number>;
  };
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { criteria }: { criteria: CurationCriteria } = await request.json();

    // Set default criteria
    const curationCriteria: CurationCriteria = {
      includeDigitalDealer: true,
      minimumScore: 70,
      prioritizeRecentActivity: true,
      excludeRecentlyContacted: true,
      maxLeads: 50,
      ...criteria,
    };

    console.log('Starting manual AI curation with criteria:', curationCriteria);

    // Fetch leads from database
    // For now, get all leads since user_id column may not exist yet
    // TODO: Run the migration script to add user_id column to leads table
    let query = supabase
      .from('leads')
      .select('*');

    console.log('Note: Fetching all leads (user_id column may not exist yet)');

    // Apply filters based on criteria
    if (curationCriteria.states && curationCriteria.states.length > 0) {
      query = query.in('state', curationCriteria.states);
    }

    if (curationCriteria.includeDigitalDealer) {
      query = query.eq('digital_dealer', true);
    }

    // Exclude recently contacted leads if specified
    if (curationCriteria.excludeRecentlyContacted) {
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        // Get recently contacted lead IDs
        const { data: recentCampaigns, error: campaignError } = await supabase
          .from('email_campaigns')
          .select('lead_id')
          .eq('user_id', user.id)
          .gte('sent_at', thirtyDaysAgo.toISOString());

        if (!campaignError && recentCampaigns && recentCampaigns.length > 0) {
          const recentLeadIds = recentCampaigns.map(c => c.lead_id);
          query = query.not('id', 'in', `(${recentLeadIds.join(',')})`);
        }
      } catch (error) {
        console.log('Note: Could not filter recently contacted leads, proceeding without this filter');
      }
    }

    const { data: leads, error } = await query.limit(1000); // Reasonable limit

    if (error) {
      console.error('Error fetching leads:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch leads',
        details: error.message 
      }, { status: 500 });
    }

    if (!leads || leads.length === 0) {
      return NextResponse.json({
        highPriorityLeads: [],
        insights: ['No leads found matching the specified criteria'],
        recommendations: ['Consider importing more leads or adjusting filter criteria'],
        totalProcessed: 0,
        statistics: {
          averageScore: 0,
          topStates: [],
          digitalDealerPercentage: 0,
          titleDistribution: {},
        },
      });
    }

    // AI-powered lead analysis and scoring
    const analyzedLeads = [];
    const insights = [];
    const recommendations = [];

    console.log(`Analyzing ${leads.length} leads with AI...`);

    // Process leads in batches to avoid overwhelming the AI service
    const batchSize = 10;
    for (let i = 0; i < leads.length; i += batchSize) {
      const batch = leads.slice(i, i + batchSize);
      
      const batchResults = await Promise.all(
        batch.map(async (lead) => {
          try {
            const qualification = await qualifyLead(lead);
            return {
              ...lead,
              ai_score: qualification.score,
              ai_reasoning: qualification.reasoning,
            };
          } catch (error) {
            console.error(`Error qualifying lead ${lead.id}:`, error);
            return {
              ...lead,
              ai_score: lead.ai_score || 50,
              ai_reasoning: 'Basic evaluation due to AI service unavailable',
            };
          }
        })
      );

      analyzedLeads.push(...batchResults);

      // Add small delay between batches to be respectful to AI service
      if (i + batchSize < leads.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Filter by minimum score and sort by priority
    const qualifiedLeads = analyzedLeads
      .filter(lead => lead.ai_score >= curationCriteria.minimumScore!)
      .sort((a, b) => {
        // Prioritize by score, then by digital dealer status
        const scoreA = a.ai_score + (a.digital_dealer ? 10 : 0);
        const scoreB = b.ai_score + (b.digital_dealer ? 10 : 0);
        return scoreB - scoreA;
      });

    // Determine urgency based on score and other factors
    const getUrgency = (lead: any): 'immediate' | 'today' | 'this-week' => {
      if (lead.ai_score >= 90 || (lead.ai_score >= 85 && lead.digital_dealer)) {
        return 'immediate';
      } else if (lead.ai_score >= 80) {
        return 'today';
      } else {
        return 'this-week';
      }
    };

    // Format high priority leads
    const highPriorityLeads = qualifiedLeads
      .slice(0, curationCriteria.maxLeads)
      .map(lead => ({
        id: lead.id,
        name: `${lead.first_name} ${lead.last_name}`,
        company: lead.company,
        score: lead.ai_score,
        reasoning: lead.ai_reasoning,
        urgency: getUrgency(lead),
        contact_info: {
          email: lead.email,
          title: lead.title || 'Decision Maker',
          location: `${lead.city}, ${lead.state}`,
        },
      }));

    // Generate insights
    const avgScore = analyzedLeads.reduce((sum, lead) => sum + lead.ai_score, 0) / analyzedLeads.length;
    const digitalDealerCount = analyzedLeads.filter(lead => lead.digital_dealer).length;
    const digitalDealerPercentage = (digitalDealerCount / analyzedLeads.length) * 100;

    // State distribution
    const stateCount: Record<string, number> = {};
    analyzedLeads.forEach(lead => {
      stateCount[lead.state] = (stateCount[lead.state] || 0) + 1;
    });
    const topStates = Object.entries(stateCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([state]) => state);

    // Title distribution
    const titleCount: Record<string, number> = {};
    analyzedLeads.forEach(lead => {
      const title = lead.title || 'Unknown';
      titleCount[title] = (titleCount[title] || 0) + 1;
    });

    // Generate AI insights
    if (avgScore > 75) {
      insights.push(`Strong lead quality detected - average score of ${avgScore.toFixed(1)}/100`);
    } else {
      insights.push(`Lead quality is moderate - average score of ${avgScore.toFixed(1)}/100`);
    }

    if (digitalDealerPercentage > 50) {
      insights.push(`${digitalDealerPercentage.toFixed(1)}% of leads are digital-forward dealerships - excellent for tech-focused outreach`);
    }

    if (highPriorityLeads.filter(l => l.urgency === 'immediate').length > 0) {
      insights.push(`${highPriorityLeads.filter(l => l.urgency === 'immediate').length} leads require immediate attention`);
    }

    // Generate recommendations
    if (highPriorityLeads.length > 0) {
      recommendations.push(`Start with ${Math.min(5, highPriorityLeads.length)} highest-scoring leads for immediate outreach`);
    }

    if (digitalDealerCount > 0) {
      recommendations.push('Prioritize digital dealer leads - they show higher engagement rates');
    }

    if (topStates.length > 0) {
      recommendations.push(`Focus on ${topStates[0]} market - highest concentration of quality leads`);
    }

    recommendations.push('Schedule follow-up curation in 3-5 days to capture new opportunities');

    const result: CurationResult = {
      highPriorityLeads,
      insights,
      recommendations,
      totalProcessed: analyzedLeads.length,
      statistics: {
        averageScore: Math.round(avgScore * 10) / 10,
        topStates,
        digitalDealerPercentage: Math.round(digitalDealerPercentage * 10) / 10,
        titleDistribution: titleCount,
      },
    };

    console.log(`Manual curation completed: ${highPriorityLeads.length} priority leads identified from ${analyzedLeads.length} analyzed`);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Manual curation error:', error);
    return NextResponse.json({
      error: 'Manual curation failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// GET endpoint to retrieve last curation results
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, return a simple status - in production you might cache results
    return NextResponse.json({
      status: 'ready',
      lastRun: null,
      message: 'Manual curation is available'
    });

  } catch (error) {
    console.error('Get curation status error:', error);
    return NextResponse.json({
      error: 'Failed to get curation status',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}