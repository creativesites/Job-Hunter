'use client';

import { useState, useEffect } from 'react';
import { useCopilotAction } from '@copilotkit/react-core';
import { CopilotTextarea } from '@copilotkit/react-textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Send, 
  RefreshCw, 
  Lightbulb, 
  Target, 
  Clock,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import type { Lead } from '@/lib/types';

interface IntelligentEmailComposerProps {
  lead: Lead;
  onSend?: (emailContent: string, subject: string) => void;
  initialContent?: string;
}

interface EmailSuggestion {
  type: 'opener' | 'closer' | 'value_prop' | 'cta' | 'subject';
  content: string;
  reasoning: string;
  impact: 'high' | 'medium' | 'low';
}

interface EmailAnalysis {
  score: number;
  sentiment: 'professional' | 'casual' | 'formal';
  readability: number;
  persuasiveness: number;
  personalization: number;
  suggestions: EmailSuggestion[];
}

export default function IntelligentEmailComposer({ 
  lead, 
  onSend, 
  initialContent = '' 
}: IntelligentEmailComposerProps) {
  const [emailContent, setEmailContent] = useState(initialContent);
  const [subject, setSubject] = useState('');
  const [analysis, setAnalysis] = useState<EmailAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeSuggestions, setActiveSuggestions] = useState<EmailSuggestion[]>([]);

  useCopilotAction({
    name: "analyzeEmail",
    description: "Analyze email content for effectiveness and provide improvement suggestions",
    parameters: [
      {
        name: "emailContent",
        type: "string",
        description: "The email content to analyze",
        required: true,
      },
      {
        name: "leadContext",
        type: "object",
        description: "Context about the lead receiving the email",
        required: true,
      }
    ],
    handler: async ({ emailContent, leadContext }) => {
      return await analyzeEmailContent(emailContent, leadContext);
    },
  });

  useCopilotAction({
    name: "generateSubjectLines",
    description: "Generate compelling subject lines for the email",
    parameters: [
      {
        name: "emailContent",
        type: "string",
        description: "The email content",
        required: true,
      },
      {
        name: "leadInfo",
        type: "object",
        description: "Information about the lead",
        required: true,
      }
    ],
    handler: async ({ emailContent, leadInfo }) => {
      return generateSubjectLines(emailContent, leadInfo);
    },
  });

  useCopilotAction({
    name: "improveEmailSection",
    description: "Improve a specific section of the email",
    parameters: [
      {
        name: "section",
        type: "string",
        description: "The section to improve (opener, body, closer)",
        required: true,
      },
      {
        name: "currentContent",
        type: "string",
        description: "Current content of the section",
        required: true,
      }
    ],
    handler: async ({ section, currentContent }) => {
      return improveEmailSection(section, currentContent);
    },
  });

  const analyzeEmailContent = async (content: string, leadContext: any): Promise<EmailAnalysis> => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const analysis: EmailAnalysis = {
      score: Math.floor(Math.random() * 30) + 70, // 70-100
      sentiment: 'professional',
      readability: Math.floor(Math.random() * 20) + 80,
      persuasiveness: Math.floor(Math.random() * 25) + 75,
      personalization: content.includes(lead.first_name) ? 85 : 45,
      suggestions: [
        {
          type: 'opener',
          content: `Hi ${lead.first_name}, I noticed ${lead.company} has been expanding in the ${lead.city} market...`,
          reasoning: 'More personal and shows research',
          impact: 'high'
        },
        {
          type: 'value_prop',
          content: 'My experience in automotive sales and digital transformation aligns perfectly with industry trends...',
          reasoning: 'Specific to automotive industry',
          impact: 'high'
        },
        {
          type: 'cta',
          content: 'Would you have 15 minutes this week for a brief conversation about opportunities at ${lead.company}?',
          reasoning: 'Specific time commitment and low pressure',
          impact: 'medium'
        }
      ]
    };
    
    setIsAnalyzing(false);
    return analysis;
  };

  const generateSubjectLines = (content: string, leadInfo: any) => {
    return [
      `Experienced Automotive Professional - ${leadInfo.city} Market`,
      `Quick Question About ${leadInfo.company}'s Growth`,
      `${leadInfo.first_name}, Your Thoughts on Current Market Trends?`,
      `Automotive Industry Experience + ${leadInfo.state} Market Knowledge`,
      `Brief Chat About Opportunities at ${leadInfo.company}?`
    ];
  };

  const improveEmailSection = (section: string, currentContent: string) => {
    const improvements = {
      opener: [
        "Add a specific reference to their company or industry",
        "Mention a recent achievement or news about their dealership",
        "Use their name and create immediate relevance"
      ],
      body: [
        "Include specific metrics or achievements",
        "Connect your experience to their business needs",
        "Reference industry trends they care about"
      ],
      closer: [
        "Use a soft call-to-action",
        "Suggest a specific next step",
        "Make it easy to respond"
      ]
    };
    
    return improvements[section as keyof typeof improvements] || [];
  };

  useEffect(() => {
    if (emailContent.length > 50) {
      const timer = setTimeout(() => {
        analyzeEmailContent(emailContent, lead).then(setAnalysis);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [emailContent, lead]);

  const applySuggestion = (suggestion: EmailSuggestion) => {
    if (suggestion.type === 'subject') {
      setSubject(suggestion.content);
    } else {
      setEmailContent(prev => prev + '\n\n' + suggestion.content);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            AI Email Composer
          </CardTitle>
          <CardDescription>
            Craft the perfect email for {lead.first_name} at {lead.company}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Subject Line */}
          <div>
            <label className="block text-sm font-medium mb-2">Subject Line</label>
            <CopilotTextarea
              className="w-full p-3 border rounded-lg resize-none"
              placeholder="Enter subject line..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              rows={1}
              autosuggestionsConfig={{
                textareaPurpose: `Generate compelling subject lines for job search email to ${lead.first_name} at ${lead.company}`,
                chatApiConfigs: {}
              }}
            />
          </div>

          {/* Email Content */}
          <div>
            <label className="block text-sm font-medium mb-2">Email Content</label>
            <CopilotTextarea
              className="w-full p-3 border rounded-lg min-h-[300px]"
              placeholder={`Dear ${lead.first_name},\n\nI hope this message finds you well...`}
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              autosuggestionsConfig={{
                textareaPurpose: `Write a personalized job search email to ${lead.first_name} ${lead.last_name}, ${lead.title} at ${lead.company} in ${lead.city}, ${lead.state}. Focus on automotive industry experience and professionalism.`,
                chatApiConfigs: {},
                onFinalizeAutosuggest: (suggestion: string) => {
                  setEmailContent(prev => prev + suggestion);
                }
              }}
            />
          </div>

          {/* Real-time Analysis */}
          {analysis && (
            <Card className="bg-gray-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Email Analysis
                  <Badge variant={analysis.score >= 85 ? "default" : "secondary"}>
                    Score: {analysis.score}/100
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(analysis.readability)}`}>
                      {analysis.readability}%
                    </div>
                    <div className="text-sm text-gray-600">Readability</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(analysis.persuasiveness)}`}>
                      {analysis.persuasiveness}%
                    </div>
                    <div className="text-sm text-gray-600">Persuasiveness</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(analysis.personalization)}`}>
                      {analysis.personalization}%
                    </div>
                    <div className="text-sm text-gray-600">Personalization</div>
                  </div>
                </div>

                {/* Suggestions */}
                {analysis.suggestions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      AI Suggestions
                    </h4>
                    {analysis.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                        <Badge variant={suggestion.impact === 'high' ? 'default' : 'secondary'}>
                          {suggestion.type.replace('_', ' ')}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-sm">{suggestion.content}</p>
                          <p className="text-xs text-gray-500 mt-1">{suggestion.reasoning}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => applySuggestion(suggestion)}
                          className="text-xs"
                        >
                          Apply
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => onSend?.(emailContent, subject)}
              className="flex items-center gap-2"
              disabled={!emailContent.trim() || !subject.trim()}
            >
              <Send className="h-4 w-4" />
              Send Email
            </Button>
            
            <Button
              variant="outline"
              onClick={() => analyzeEmailContent(emailContent, lead).then(setAnalysis)}
              disabled={isAnalyzing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              Re-analyze
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Quick Improvements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const suggestion = `Hi ${lead.first_name}, I came across ${lead.company} and was impressed by your position in the ${lead.city} automotive market.`;
                setEmailContent(prev => suggestion + '\n\n' + prev);
              }}
            >
              Add Personal Opener
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const suggestion = `Would you have 15 minutes this week for a brief conversation about potential opportunities at ${lead.company}?`;
                setEmailContent(prev => prev + '\n\n' + suggestion);
              }}
            >
              Add Soft CTA
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const suggestion = `My background in automotive sales and operations, combined with experience in digital transformation, aligns well with current industry trends.`;
                setEmailContent(prev => prev + '\n\n' + suggestion);
              }}
            >
              Add Value Prop
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSubject(`Quick Question About ${lead.company}'s Growth - ${lead.first_name}`);
              }}
            >
              Generate Subject
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}