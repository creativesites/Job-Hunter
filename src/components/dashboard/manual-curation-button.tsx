'use client';

import { useState } from 'react';
import { useCopilotAction } from '@copilotkit/react-core';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  RefreshCw, 
  Target, 
  TrendingUp,
  Users,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Brain
} from 'lucide-react';

interface CurationResult {
  highPriorityLeads: Array<{
    id: string;
    name: string;
    company: string;
    score: number;
    reasoning: string;
    urgency: 'immediate' | 'today' | 'this-week';
  }>;
  insights: string[];
  recommendations: string[];
  totalProcessed: number;
  executionTime: number;
}

interface ManualCurationButtonProps {
  onCurationComplete?: (result: CurationResult) => void;
  disabled?: boolean;
}

export default function ManualCurationButton({ 
  onCurationComplete, 
  disabled = false 
}: ManualCurationButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<CurationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useCopilotAction({
    name: "runManualCuration",
    description: "Manually trigger AI-powered lead curation and analysis",
    parameters: [
      {
        name: "criteria",
        type: "object",
        description: "Curation criteria and preferences",
        required: false,
      }
    ],
    handler: async ({ criteria = {} }) => {
      return await performManualCuration(criteria);
    },
  });

  useCopilotAction({
    name: "analyzeCurationResults",
    description: "Analyze the results of the manual curation process",
    parameters: [
      {
        name: "results",
        type: "object",
        description: "Curation results to analyze",
        required: true,
      }
    ],
    handler: async ({ results }) => {
      return analyzeCurationResults(results);
    },
  });

  const performManualCuration = async (criteria: any = {}) => {
    const startTime = Date.now();
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/manual-curation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          criteria,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Curation failed: ${response.statusText}`);
      }

      const result = await response.json();
      const executionTime = Date.now() - startTime;

      const curationResult: CurationResult = {
        ...result,
        executionTime,
      };

      setLastResult(curationResult);
      onCurationComplete?.(curationResult);
      
      return curationResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const analyzeCurationResults = (results: CurationResult) => {
    const analysis = {
      summary: `Processed ${results.totalProcessed} leads in ${(results.executionTime / 1000).toFixed(1)}s`,
      topOpportunities: results.highPriorityLeads.slice(0, 3).map(lead => ({
        name: `${lead.name} at ${lead.company}`,
        score: lead.score,
        priority: lead.urgency
      })),
      keyInsights: results.insights,
      recommendations: results.recommendations,
      performance: {
        efficiency: results.executionTime < 5000 ? 'Excellent' : 'Good',
        coverage: results.totalProcessed > 100 ? 'Comprehensive' : 'Targeted',
        quality: results.highPriorityLeads.length > 5 ? 'High' : 'Standard'
      }
    };

    return analysis;
  };

  const runManualCuration = async () => {
    try {
      await performManualCuration({
        includeDigitalDealer: true,
        minimumScore: 70,
        prioritizeRecentActivity: true,
        excludeRecentlyContacted: true,
      });
    } catch (err) {
      console.error('Manual curation failed:', err);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return 'bg-red-100 text-red-800';
      case 'today': return 'bg-orange-100 text-orange-800';
      case 'this-week': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return <AlertCircle className="h-3 w-3" />;
      case 'today': return <Clock className="h-3 w-3" />;
      case 'this-week': return <Target className="h-3 w-3" />;
      default: return <Users className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Manual Curation Button */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Manual AI Curation
          </CardTitle>
          <CardDescription>
            Trigger intelligent lead analysis and prioritization on demand
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              onClick={runManualCuration}
              disabled={disabled || isProcessing}
              className="flex items-center gap-2"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Run AI Curation
                </>
              )}
            </Button>
            
            {lastResult && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Last run: {(lastResult.executionTime / 1000).toFixed(1)}s ago
              </div>
            )}
          </div>

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Curation Error</span>
              </div>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Curation Results */}
      {lastResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Curation Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {lastResult.highPriorityLeads.length}
                </div>
                <div className="text-sm text-gray-600">Priority Leads</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {lastResult.totalProcessed}
                </div>
                <div className="text-sm text-gray-600">Analyzed</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {(lastResult.executionTime / 1000).toFixed(1)}s
                </div>
                <div className="text-sm text-gray-600">Processing Time</div>
              </div>
            </div>

            {/* High Priority Leads */}
            {lastResult.highPriorityLeads.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  High Priority Leads
                </h4>
                <div className="space-y-2">
                  {lastResult.highPriorityLeads.slice(0, 5).map((lead, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{lead.name}</div>
                        <div className="text-sm text-gray-600">{lead.company}</div>
                        <div className="text-xs text-gray-500 mt-1">{lead.reasoning}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Score: {lead.score}
                        </Badge>
                        <Badge className={`text-xs flex items-center gap-1 ${getUrgencyColor(lead.urgency)}`}>
                          {getUrgencyIcon(lead.urgency)}
                          {lead.urgency}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Insights */}
            {lastResult.insights.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Insights
                </h4>
                <div className="space-y-2">
                  {lastResult.insights.map((insight, index) => (
                    <div key={index} className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                      <p className="text-sm text-blue-800">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {lastResult.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Action Recommendations
                </h4>
                <div className="space-y-2">
                  {lastResult.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-green-800">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}