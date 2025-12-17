'use client';

import { useState, useEffect } from 'react';
import { useCopilotAction, useCopilotChat } from '@copilotkit/react-core';
import { CopilotSidebar } from '@copilotkit/react-ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  BarChart3, 
  Users, 
  TrendingUp, 
  Calendar,
  Mail,
  Phone,
  FileText,
  Zap,
  Brain
} from 'lucide-react';

interface CRMAIAssistantProps {
  currentView?: 'dashboard' | 'leads' | 'emails' | 'analytics';
  onActionRequested?: (action: string, params: any) => void;
}

interface QuickInsight {
  type: 'performance' | 'opportunity' | 'reminder' | 'trend';
  title: string;
  description: string;
  action?: string;
  priority: 'high' | 'medium' | 'low';
}

interface CRMAction {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'lead' | 'email' | 'analytics' | 'scheduling';
}

export default function CRMAIAssistant({ 
  currentView = 'dashboard',
  onActionRequested 
}: CRMAIAssistantProps) {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [quickInsights, setQuickInsights] = useState<QuickInsight[]>([]);
  const [suggestedActions, setSuggestedActions] = useState<CRMAction[]>([]);

  const { appendMessage } = useCopilotChat();

  // Register CopilotKit Actions
  useCopilotAction({
    name: "analyzePerformance",
    description: "Analyze CRM performance metrics and provide insights",
    parameters: [
      {
        name: "timeframe",
        type: "string",
        description: "Time period to analyze (week, month, quarter)",
        required: true,
      }
    ],
    handler: async ({ timeframe }) => {
      return await analyzePerformance(timeframe);
    },
  });

  useCopilotAction({
    name: "findBestLeads",
    description: "Find the highest potential leads based on AI scoring",
    parameters: [
      {
        name: "criteria",
        type: "object",
        description: "Criteria for filtering leads",
        required: false,
      }
    ],
    handler: async ({ criteria = {} }) => {
      return await findBestLeads(criteria);
    },
  });

  useCopilotAction({
    name: "optimizeEmailTiming",
    description: "Suggest optimal times to send emails based on response patterns",
    parameters: [
      {
        name: "recipientType",
        type: "string",
        description: "Type of recipient (decision_maker, manager, etc.)",
        required: false,
      }
    ],
    handler: async ({ recipientType }) => {
      return optimizeEmailTiming(recipientType);
    },
  });

  useCopilotAction({
    name: "generateFollowUpStrategy",
    description: "Create a follow-up strategy for unresponsive leads",
    parameters: [
      {
        name: "leadIds",
        type: "array",
        description: "Array of lead IDs to create follow-up for",
        required: true,
      }
    ],
    handler: async ({ leadIds }) => {
      return generateFollowUpStrategy(leadIds);
    },
  });

  useCopilotAction({
    name: "predictResponseLikelihood",
    description: "Predict likelihood of getting a response from specific leads",
    parameters: [
      {
        name: "leadData",
        type: "object",
        description: "Lead information for prediction",
        required: true,
      }
    ],
    handler: async ({ leadData }) => {
      return predictResponseLikelihood(leadData);
    },
  });

  useCopilotAction({
    name: "scheduleOptimalOutreach",
    description: "Schedule outreach at optimal times based on AI recommendations",
    parameters: [
      {
        name: "leads",
        type: "array",
        description: "List of leads to schedule outreach for",
        required: true,
      }
    ],
    handler: async ({ leads }) => {
      return scheduleOptimalOutreach(leads);
    },
  });

  // Implementation functions
  const analyzePerformance = async (timeframe: string) => {
    // Simulate performance analysis
    const mockAnalysis = {
      emailsSent: Math.floor(Math.random() * 100) + 50,
      responseRate: (Math.random() * 15 + 5).toFixed(1) + '%',
      leadsContacted: Math.floor(Math.random() * 200) + 100,
      conversationRate: (Math.random() * 8 + 2).toFixed(1) + '%',
      topPerformingRegions: ['California', 'Texas', 'Florida'],
      bestResponseTimes: ['Tuesday 10-11 AM', 'Thursday 2-3 PM'],
      insights: [
        'Response rates are 23% higher on Tuesdays',
        'Emails mentioning digital transformation get 18% more responses',
        'Follow-up emails sent within 3 days see 34% better engagement'
      ]
    };
    return mockAnalysis;
  };

  const findBestLeads = async (criteria: any) => {
    return {
      highPotentialLeads: [
        { name: "John Smith", company: "ABC Motors", score: 92, reason: "Decision maker + recent expansion" },
        { name: "Sarah Johnson", company: "Premium Auto", score: 89, reason: "Digital focus + hiring indicators" },
        { name: "Mike Chen", company: "Future Cars", score: 87, reason: "Industry leader + growth signals" }
      ],
      totalHighScore: 23,
      recommendations: [
        "Focus on tech-forward dealerships",
        "Prioritize recent Digital Dealer conference attendees",
        "Target markets with population growth >5%"
      ]
    };
  };

  const optimizeEmailTiming = async (recipientType?: string) => {
    return {
      bestTimes: [
        { day: "Tuesday", time: "10:00 AM", responseRate: "18.5%" },
        { day: "Thursday", time: "2:00 PM", responseRate: "16.2%" },
        { day: "Wednesday", time: "11:00 AM", responseRate: "15.8%" }
      ],
      avoidTimes: ["Monday mornings", "Friday afternoons", "Weekend"],
      seasonalTrends: "Q1 and Q3 show highest response rates in automotive industry"
    };
  };

  const generateFollowUpStrategy = async (leadIds: string[]) => {
    return {
      strategy: "3-touch sequence over 2 weeks",
      sequence: [
        { day: 3, type: "value-add", subject: "Industry insight relevant to their market" },
        { day: 7, type: "social-proof", subject: "Success story from similar dealership" },
        { day: 14, type: "final-touch", subject: "Last attempt - direct and honest" }
      ],
      expectedResults: "12-15% response rate improvement"
    };
  };

  const predictResponseLikelihood = async (leadData: any) => {
    const score = Math.floor(Math.random() * 40) + 35; // 35-75%
    return {
      likelihood: score + '%',
      factors: {
        positive: ["Senior title", "Digital engagement", "Growing market"],
        negative: ["Recent contact attempt", "Industry downturn"],
        neutral: ["Company size", "Geographic location"]
      },
      recommendation: score > 60 ? "High priority - contact soon" : "Medium priority - personalize heavily"
    };
  };

  const scheduleOptimalOutreach = async (leads: any[]) => {
    return {
      scheduledCount: leads.length,
      optimalSchedule: [
        { time: "Tuesday 10:00 AM", count: Math.ceil(leads.length * 0.3) },
        { time: "Thursday 2:00 PM", count: Math.ceil(leads.length * 0.4) },
        { time: "Wednesday 11:00 AM", count: Math.floor(leads.length * 0.3) }
      ],
      estimatedResponse: "Expected 14-18% response rate based on timing optimization"
    };
  };

  useEffect(() => {
    // Generate quick insights based on current view
    const generateInsights = () => {
      const insights: QuickInsight[] = [
        {
          type: 'performance',
          title: 'Response Rate Trending Up',
          description: 'Your response rate increased 23% this week',
          priority: 'high'
        },
        {
          type: 'opportunity',
          title: '12 High-Value Leads Available',
          description: 'Decision makers at growing dealerships',
          action: 'Review leads',
          priority: 'high'
        },
        {
          type: 'reminder',
          title: 'Follow-up Reminders',
          description: '8 leads need follow-up this week',
          action: 'Schedule follow-ups',
          priority: 'medium'
        },
        {
          type: 'trend',
          title: 'Best Send Time Today',
          description: 'Thursday 2-3 PM shows highest response rates',
          priority: 'low'
        }
      ];
      setQuickInsights(insights);
    };

    generateInsights();
  }, [currentView]);

  const availableActions: CRMAction[] = [
    {
      id: 'analyze-leads',
      name: 'Analyze Lead Performance',
      description: 'Get insights on lead quality and conversion patterns',
      icon: <BarChart3 className="h-4 w-4" />,
      category: 'analytics'
    },
    {
      id: 'find-opportunities',
      name: 'Find New Opportunities',
      description: 'Discover high-potential leads in your database',
      icon: <TrendingUp className="h-4 w-4" />,
      category: 'lead'
    },
    {
      id: 'optimize-timing',
      name: 'Optimize Email Timing',
      description: 'Get recommendations for when to send emails',
      icon: <Calendar className="h-4 w-4" />,
      category: 'email'
    },
    {
      id: 'create-sequences',
      name: 'Create Follow-up Sequences',
      description: 'Generate automated follow-up strategies',
      icon: <Mail className="h-4 w-4" />,
      category: 'email'
    }
  ];

  return (
    <div className="space-y-6">
      {/* AI Assistant Trigger */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            CRM AI Assistant
          </CardTitle>
          <CardDescription>
            Get intelligent insights and automate your workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => setIsAssistantOpen(true)}
            className="w-full flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Start AI Conversation
          </Button>
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {quickInsights.map((insight, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Badge variant={insight.priority === 'high' ? 'default' : 'secondary'}>
                {insight.type}
              </Badge>
              <div className="flex-1">
                <p className="font-medium text-sm">{insight.title}</p>
                <p className="text-xs text-gray-600">{insight.description}</p>
              </div>
              {insight.action && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onActionRequested?.(insight.action!, {})}
                >
                  {insight.action}
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-green-500" />
            AI-Powered Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="flex items-center gap-2 h-auto p-3 text-left justify-start"
                onClick={() => {
                  setIsAssistantOpen(true);
                  appendMessage({
                    role: "user",
                    content: action.description
                  });
                }}
              >
                {action.icon}
                <div>
                  <div className="font-medium text-sm">{action.name}</div>
                  <div className="text-xs text-gray-500">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CopilotKit AI Assistant Sidebar */}
      {isAssistantOpen && (
        <CopilotSidebar
          instructions={`You are an expert CRM AI assistant for Job Hunter CRM, specializing in automotive industry job search and lead management. 

Your capabilities include:
- Analyzing lead performance and conversion patterns
- Optimizing email timing and content strategies  
- Identifying high-potential opportunities
- Creating follow-up sequences and workflows
- Predicting response likelihood
- Providing industry-specific insights for automotive dealerships

Current context: User is in the ${currentView} section.

Focus on:
1. Data-driven insights and recommendations
2. Actionable advice for improving job search success
3. Automotive industry expertise
4. CRM optimization strategies
5. Response rate improvement

Always provide specific, actionable recommendations with reasoning.`}
          labels={{
            title: "CRM AI Assistant",
            initial: "Hi! I'm your AI assistant. I can help you analyze performance, find opportunities, optimize timing, and improve your job search success. What would you like to explore?",
          }}
          defaultOpen={true}
          onSetOpen={setIsAssistantOpen}
        />
      )}
    </div>
  );
}