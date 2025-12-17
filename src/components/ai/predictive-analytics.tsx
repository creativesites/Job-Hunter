'use client';

import { useState, useEffect } from 'react';
import { useCopilotAction } from '@copilotkit/react-core';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Calendar, 
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  Zap
} from 'lucide-react';

interface PredictiveAnalyticsProps {
  currentMetrics?: {
    emailsSent: number;
    responseRate: number;
    conversationRate: number;
    leadsContacted: number;
  };
}

interface Prediction {
  metric: string;
  currentValue: number;
  predictedValue: number;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  timeframe: string;
  factors: string[];
}

interface OpportunityInsight {
  type: 'opportunity' | 'risk' | 'trend';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionRecommendation: string;
  urgency: 'immediate' | 'this-week' | 'this-month';
}

interface OptimalAction {
  action: string;
  timing: string;
  expectedImpact: string;
  confidence: number;
  reasoning: string;
}

export default function PredictiveAnalytics({ currentMetrics }: PredictiveAnalyticsProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityInsight[]>([]);
  const [optimalActions, setOptimalActions] = useState<OptimalAction[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('month');

  useCopilotAction({
    name: "generatePredictions",
    description: "Generate AI-powered predictions for CRM performance metrics",
    parameters: [
      {
        name: "currentData",
        type: "object",
        description: "Current performance data for prediction modeling",
        required: true,
      },
      {
        name: "timeframe",
        type: "string",
        description: "Prediction timeframe (week, month, quarter)",
        required: true,
      }
    ],
    handler: async ({ currentData, timeframe }) => {
      return await generatePredictions(currentData, timeframe);
    },
  });

  useCopilotAction({
    name: "identifyOpportunities",
    description: "Identify opportunities and risks in current CRM performance",
    parameters: [
      {
        name: "performanceData",
        type: "object",
        description: "Current performance metrics and trends",
        required: true,
      }
    ],
    handler: async ({ performanceData }) => {
      return await identifyOpportunities(performanceData);
    },
  });

  useCopilotAction({
    name: "optimizeActions",
    description: "Recommend optimal actions for improving performance",
    parameters: [
      {
        name: "currentState",
        type: "object",
        description: "Current CRM state and metrics",
        required: true,
      },
      {
        name: "goals",
        type: "object",
        description: "Target goals and objectives",
        required: true,
      }
    ],
    handler: async ({ currentState, goals }) => {
      return await optimizeActions(currentState, goals);
    },
  });

  useCopilotAction({
    name: "forecastOutcomes",
    description: "Forecast likely outcomes based on current trajectory",
    parameters: [
      {
        name: "currentTrends",
        type: "object",
        description: "Current performance trends",
        required: true,
      }
    ],
    handler: async ({ currentTrends }) => {
      return forecastOutcomes(currentTrends);
    },
  });

  const generatePredictions = async (currentData: any, timeframe: string) => {
    setIsGenerating(true);
    
    // Simulate AI prediction generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const mockPredictions: Prediction[] = [
      {
        metric: 'Response Rate',
        currentValue: currentData.responseRate || 12.5,
        predictedValue: (currentData.responseRate || 12.5) * (1 + (Math.random() * 0.4 - 0.1)),
        trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down',
        confidence: Math.random() * 20 + 75,
        timeframe: `Next ${timeframe}`,
        factors: ['Email timing optimization', 'Subject line A/B testing', 'Lead quality improvements']
      },
      {
        metric: 'Conversion Rate',
        currentValue: currentData.conversationRate || 8.2,
        predictedValue: (currentData.conversationRate || 8.2) * (1 + (Math.random() * 0.6 - 0.2)),
        trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down',
        confidence: Math.random() * 15 + 80,
        timeframe: `Next ${timeframe}`,
        factors: ['Follow-up sequence optimization', 'Personalization improvements', 'Market conditions']
      },
      {
        metric: 'Lead Volume',
        currentValue: currentData.leadsContacted || 150,
        predictedValue: (currentData.leadsContacted || 150) * (1 + (Math.random() * 0.3 - 0.1)),
        trend: Math.random() > 0.7 ? 'up' : 'stable',
        confidence: Math.random() * 10 + 85,
        timeframe: `Next ${timeframe}`,
        factors: ['Database expansion', 'Lead scoring refinement', 'Market research']
      }
    ];
    
    setPredictions(mockPredictions);
    setIsGenerating(false);
    return mockPredictions;
  };

  const identifyOpportunities = async (performanceData: any) => {
    const mockOpportunities: OpportunityInsight[] = [
      {
        type: 'opportunity',
        title: 'Peak Response Window Identified',
        description: 'Tuesday 10-11 AM shows 34% higher response rates than average',
        impact: 'high',
        actionRecommendation: 'Schedule bulk outreach for Tuesday mornings',
        urgency: 'this-week'
      },
      {
        type: 'opportunity',
        title: 'High-Value Lead Segment',
        description: 'Digital Dealer conference attendees show 67% higher conversion',
        impact: 'high',
        actionRecommendation: 'Prioritize digital-forward dealerships in outreach',
        urgency: 'immediate'
      },
      {
        type: 'risk',
        title: 'Follow-up Gap Detected',
        description: '23 leads have not been contacted in 14+ days',
        impact: 'medium',
        actionRecommendation: 'Implement automated follow-up sequence',
        urgency: 'this-week'
      },
      {
        type: 'trend',
        title: 'Geographic Performance Variance',
        description: 'California leads showing 18% higher response rates',
        impact: 'medium',
        actionRecommendation: 'Increase focus on California market',
        urgency: 'this-month'
      }
    ];
    
    setOpportunities(mockOpportunities);
    return mockOpportunities;
  };

  const optimizeActions = async (currentState: any, goals: any) => {
    const mockActions: OptimalAction[] = [
      {
        action: 'Implement AI-powered send time optimization',
        timing: 'This week',
        expectedImpact: '15-20% increase in response rates',
        confidence: 87,
        reasoning: 'Data shows significant timing variations in response patterns'
      },
      {
        action: 'Launch personalized follow-up sequences',
        timing: 'Next 2 weeks',
        expectedImpact: '12-18% improvement in conversion rates',
        confidence: 92,
        reasoning: 'Current follow-up gap represents largest opportunity for improvement'
      },
      {
        action: 'Refine lead scoring algorithm',
        timing: 'This month',
        expectedImpact: '8-12% better lead qualification accuracy',
        confidence: 78,
        reasoning: 'Recent response data indicates scoring model needs recalibration'
      }
    ];
    
    setOptimalActions(mockActions);
    return mockActions;
  };

  const forecastOutcomes = (currentTrends: any) => {
    return {
      thirtyDay: {
        responseRate: 14.2,
        conversationRate: 9.8,
        leadsProcessed: 180
      },
      ninetyDay: {
        responseRate: 16.8,
        conversationRate: 12.1,
        leadsProcessed: 520
      },
      confidence: 83
    };
  };

  const runFullAnalysis = async () => {
    setIsGenerating(true);
    
    const mockCurrentData = currentMetrics || {
      emailsSent: 45,
      responseRate: 12.5,
      conversationRate: 8.2,
      leadsContacted: 150
    };
    
    await Promise.all([
      generatePredictions(mockCurrentData, selectedTimeframe),
      identifyOpportunities(mockCurrentData),
      optimizeActions(mockCurrentData, { responseRate: 18, conversationRate: 12 })
    ]);
    
    setIsGenerating(false);
  };

  useEffect(() => {
    runFullAnalysis();
  }, [selectedTimeframe]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const getImpactColor = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  const getUrgencyIcon = (urgency: 'immediate' | 'this-week' | 'this-month') => {
    switch (urgency) {
      case 'immediate': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'this-week': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Calendar className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Predictive Analytics Dashboard
          </CardTitle>
          <CardDescription>
            AI-powered insights and predictions for your job search performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timeframe Selection */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Forecast Timeframe:</span>
            {(['week', 'month', 'quarter'] as const).map(timeframe => (
              <Button
                key={timeframe}
                variant={selectedTimeframe === timeframe ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTimeframe(timeframe)}
              >
                {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
              </Button>
            ))}
          </div>

          <Button
            onClick={runFullAnalysis}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            <Zap className={`h-4 w-4 ${isGenerating ? 'animate-pulse' : ''}`} />
            {isGenerating ? 'Generating Insights...' : 'Refresh Analysis'}
          </Button>
        </CardContent>
      </Card>

      {/* Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Performance Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {predictions.map((prediction, index) => (
              <Card key={index} className="border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{prediction.metric}</h4>
                    {getTrendIcon(prediction.trend)}
                  </div>
                  
                  <div className="mb-2">
                    <div className="text-2xl font-bold">
                      {prediction.predictedValue.toFixed(1)}
                      {prediction.metric.includes('Rate') ? '%' : ''}
                    </div>
                    <div className="text-sm text-gray-500">
                      Current: {prediction.currentValue.toFixed(1)}
                      {prediction.metric.includes('Rate') ? '%' : ''}
                    </div>
                  </div>
                  
                  <Badge variant="secondary" className="text-xs mb-2">
                    {prediction.confidence.toFixed(0)}% confident
                  </Badge>
                  
                  <div className="text-xs text-gray-600">
                    <p className="font-medium">{prediction.timeframe}</p>
                    <p>Key factors: {prediction.factors.slice(0, 2).join(', ')}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Opportunities & Risks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Opportunities & Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {opportunities.map((opportunity, index) => (
              <Card key={index} className={`border-l-4 ${
                opportunity.type === 'opportunity' ? 'border-l-green-500 bg-green-50' :
                opportunity.type === 'risk' ? 'border-l-red-500 bg-red-50' :
                'border-l-blue-500 bg-blue-50'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={opportunity.type === 'opportunity' ? 'default' : 
                                   opportunity.type === 'risk' ? 'destructive' : 'secondary'}>
                        {opportunity.type}
                      </Badge>
                      <span className={`text-sm font-medium ${getImpactColor(opportunity.impact)}`}>
                        {opportunity.impact} impact
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getUrgencyIcon(opportunity.urgency)}
                      <span className="text-xs text-gray-500">{opportunity.urgency}</span>
                    </div>
                  </div>
                  
                  <h4 className="font-medium mb-1">{opportunity.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{opportunity.description}</p>
                  <p className="text-sm font-medium text-blue-600">
                    💡 {opportunity.actionRecommendation}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Optimal Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Recommended Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {optimalActions.map((action, index) => (
              <Card key={index} className="border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{action.action}</h4>
                    <Badge variant="outline">
                      {action.confidence}% confidence
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Timing: </span>
                      <span className="text-gray-600">{action.timing}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Expected Impact: </span>
                      <span className="text-green-600 font-medium">{action.expectedImpact}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-medium">Reasoning: </span>
                    {action.reasoning}
                  </p>
                  
                  <Button size="sm" className="mt-3">
                    Implement Action
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">87%</div>
            <div className="text-sm text-gray-600">Prediction Accuracy</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">+23%</div>
            <div className="text-sm text-gray-600">Expected Growth</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{opportunities.filter(o => o.type === 'opportunity').length}</div>
            <div className="text-sm text-gray-600">Opportunities</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">{opportunities.filter(o => o.urgency === 'immediate').length}</div>
            <div className="text-sm text-gray-600">Urgent Actions</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}