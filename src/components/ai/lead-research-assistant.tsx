'use client';

import { useState } from 'react';
import { useCopilotAction, useCopilotChat } from '@copilotkit/react-core';
import { CopilotSidebar } from '@copilotkit/react-ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Search, User, Building, MapPin, Phone, Mail, Globe } from 'lucide-react';
import type { Lead } from '@/lib/types';

interface LeadResearchAssistantProps {
  lead: Lead;
  onInsightGenerated?: (insight: string) => void;
}

interface CompanyInsight {
  companySize: string;
  industryTrends: string;
  recentNews: string[];
  keyDecisionMakers: string[];
  competitivePosition: string;
  growthIndicators: string;
  digitalPresence: string;
  hiringPatterns: string;
}

export default function LeadResearchAssistant({ 
  lead, 
  onInsightGenerated 
}: LeadResearchAssistantProps) {
  const [isResearching, setIsResearching] = useState(false);
  const [insights, setInsights] = useState<CompanyInsight | null>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  const { appendMessage } = useCopilotChat();

  useCopilotAction({
    name: "researchLead",
    description: "Research detailed information about a lead's company and generate strategic insights",
    parameters: [
      {
        name: "leadInfo",
        type: "object",
        description: "Information about the lead to research",
        required: true,
      }
    ],
    handler: async ({ leadInfo }) => {
      return await performDeepResearch(leadInfo);
    },
  });

  useCopilotAction({
    name: "generateOutreachStrategy",
    description: "Generate a personalized outreach strategy based on lead research",
    parameters: [
      {
        name: "leadData",
        type: "object",
        description: "Lead data and research insights",
        required: true,
      }
    ],
    handler: async ({ leadData }) => {
      return generateOutreachStrategy(leadData);
    },
  });

  useCopilotAction({
    name: "findSimilarLeads",
    description: "Find similar leads in the database based on company characteristics",
    parameters: [
      {
        name: "criteria",
        type: "object",
        description: "Criteria for finding similar leads",
        required: true,
      }
    ],
    handler: async ({ criteria }) => {
      return findSimilarLeads(criteria);
    },
  });

  const performDeepResearch = async (leadInfo: any): Promise<CompanyInsight> => {
    setIsResearching(true);
    
    // Simulate AI-powered research (in a real app, this would call external APIs)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockInsights: CompanyInsight = {
      companySize: `Mid-size dealership (${Math.floor(Math.random() * 50) + 20}-${Math.floor(Math.random() * 100) + 50} employees)`,
      industryTrends: "Automotive industry showing 12% growth in EV adoption, digital sales platforms increasing by 34%",
      recentNews: [
        "Recently expanded service department",
        "Invested in new digital showroom technology",
        "Partnership with local community organizations"
      ],
      keyDecisionMakers: [
        `${lead.first_name} ${lead.last_name} - ${lead.title}`,
        "General Manager - Sarah Johnson",
        "Service Director - Mike Chen"
      ],
      competitivePosition: "Strong local market presence, focusing on customer experience and digital transformation",
      growthIndicators: "Positive: Recent facility upgrades, new hires in service department, social media engagement up 45%",
      digitalPresence: "Active on social media, modern website, Google reviews 4.2/5 stars",
      hiringPatterns: "Typically hires in Q1 and Q3, preference for candidates with automotive experience"
    };
    
    setInsights(mockInsights);
    setIsResearching(false);
    
    const insightSummary = `Research complete for ${lead.company}. Key finding: ${mockInsights.competitivePosition}`;
    if (onInsightGenerated) {
      onInsightGenerated(insightSummary);
    }
    
    return mockInsights;
  };

  const generateOutreachStrategy = (leadData: any) => {
    return {
      bestApproach: "Focus on digital transformation experience",
      keyTalkingPoints: [
        "Experience with modern dealership operations",
        "Track record in customer experience improvement",
        "Understanding of automotive industry trends"
      ],
      optimalTiming: "Tuesday-Thursday, 10 AM - 2 PM based on industry patterns",
      personalizedOpener: `Reference their recent digital showroom investment`,
      followUpStrategy: "3-touch sequence over 2 weeks"
    };
  };

  const findSimilarLeads = (criteria: any) => {
    return {
      similarCompanies: [
        "ABC Motors (same market size)",
        "XYZ Auto Group (similar digital focus)",
        "Premier Automotive (comparable growth indicators)"
      ],
      successPatterns: "67% response rate when mentioning digital transformation",
      recommendedApproach: "Technical competency + customer focus messaging"
    };
  };

  const startAIResearch = async () => {
    setShowAIAssistant(true);
    appendMessage({
      role: "user",
      content: `Research this lead: ${lead.company} - ${lead.first_name} ${lead.last_name}, ${lead.title} in ${lead.city}, ${lead.state}. Provide strategic insights for outreach.`
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Lead Research Assistant
          </CardTitle>
          <CardDescription>
            Get deep insights and strategic recommendations for {lead.company}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => performDeepResearch(lead)}
              disabled={isResearching}
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              {isResearching ? "Researching..." : "Deep Research"}
            </Button>
            
            <Button 
              onClick={startAIResearch}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              AI Assistant
            </Button>
          </div>

          {/* Lead Basic Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{lead.first_name} {lead.last_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-gray-500" />
              <span>{lead.company}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{lead.city}, {lead.state}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={lead.digital_dealer ? "default" : "secondary"}>
                {lead.digital_dealer ? "Digital Dealer" : "Traditional"}
              </Badge>
            </div>
          </div>

          {/* Research Insights */}
          {insights && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Research Insights</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Company Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <p><strong>Size:</strong> {insights.companySize}</p>
                    <p><strong>Position:</strong> {insights.competitivePosition}</p>
                    <p><strong>Digital Presence:</strong> {insights.digitalPresence}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Growth Indicators</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p>{insights.growthIndicators}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Recent Developments</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <ul className="list-disc pl-4 space-y-1">
                      {insights.recentNews.map((news, index) => (
                        <li key={index}>{news}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Hiring Patterns</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p>{insights.hiringPatterns}</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-green-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-green-800">Industry Context</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-green-700">
                  <p>{insights.industryTrends}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CopilotKit AI Assistant Sidebar */}
      {showAIAssistant && (
        <CopilotSidebar
          instructions={`You are an expert automotive industry recruiter and lead researcher. Help research and analyze leads for job search outreach. Focus on:

1. Company background and market position
2. Key decision makers and hiring patterns  
3. Strategic outreach recommendations
4. Industry insights and trends
5. Competitive positioning

Current lead: ${lead.company} - ${lead.first_name} ${lead.last_name} (${lead.title}) in ${lead.city}, ${lead.state}.

Provide actionable insights for job search success.`}
          labels={{
            title: "AI Lead Research Assistant",
            initial: "How can I help you research this lead?",
          }}
          defaultOpen={true}
          onSetOpen={setShowAIAssistant}
        />
      )}
    </div>
  );
}