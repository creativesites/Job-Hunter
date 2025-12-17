'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Sparkles, 
  MessageSquare, 
  Mic, 
  TrendingUp, 
  Search,
  Mail,
  Target,
  Zap,
  ArrowRight
} from 'lucide-react';

// Import all our AI components
import LeadResearchAssistant from '@/components/ai/lead-research-assistant';
import IntelligentEmailComposer from '@/components/ai/intelligent-email-composer';
import CRMAIAssistant from '@/components/ai/crm-ai-assistant';
import SmartLeadScoring from '@/components/ai/smart-lead-scoring';
import VoiceNotes from '@/components/ai/voice-notes';
import PredictiveAnalytics from '@/components/ai/predictive-analytics';
import ManualCurationButton from '@/components/dashboard/manual-curation-button';

// Mock data for demo
const mockLead = {
  id: '1',
  first_name: 'John',
  last_name: 'Smith',
  company: 'Premier Auto Group',
  title: 'General Manager',
  city: 'Los Angeles',
  state: 'CA',
  digital_dealer: true,
  ai_score: 85
};

const mockLeads = [
  mockLead,
  {
    id: '2',
    first_name: 'Sarah',
    last_name: 'Johnson',
    company: 'Digital Motors',
    title: 'Owner',
    city: 'Austin',
    state: 'TX',
    digital_dealer: true,
    ai_score: 92
  },
  {
    id: '3',
    first_name: 'Mike',
    last_name: 'Chen',
    company: 'Future Cars',
    title: 'Sales Director',
    city: 'Miami',
    state: 'FL',
    digital_dealer: false,
    ai_score: 78
  }
];

export default function AIFeaturesPage() {
  const [activeFeature, setActiveFeature] = useState<string>('overview');

  const features = [
    {
      id: 'overview',
      name: 'AI Features Overview',
      icon: Brain,
      description: 'Comprehensive AI-powered capabilities for your CRM',
      color: 'purple'
    },
    {
      id: 'research',
      name: 'Lead Research Assistant',
      icon: Search,
      description: 'AI-powered lead research and strategic insights',
      color: 'blue'
    },
    {
      id: 'composer',
      name: 'Intelligent Email Composer',
      icon: Mail,
      description: 'Real-time AI suggestions for email composition',
      color: 'green'
    },
    {
      id: 'chat',
      name: 'CRM AI Assistant',
      icon: MessageSquare,
      description: 'Conversational AI for CRM insights and actions',
      color: 'indigo'
    },
    {
      id: 'scoring',
      name: 'Smart Lead Scoring',
      icon: Target,
      description: 'Machine learning-powered lead qualification',
      color: 'pink'
    },
    {
      id: 'voice',
      name: 'Voice Notes',
      icon: Mic,
      description: 'Voice-to-text with AI analysis and insights',
      color: 'orange'
    },
    {
      id: 'analytics',
      name: 'Predictive Analytics',
      icon: TrendingUp,
      description: 'AI-powered performance predictions and optimization',
      color: 'cyan'
    },
    {
      id: 'curation',
      name: 'Manual AI Curation',
      icon: Sparkles,
      description: 'On-demand intelligent lead analysis and prioritization',
      color: 'purple'
    }
  ];

  const renderFeatureContent = () => {
    switch (activeFeature) {
      case 'research':
        return <LeadResearchAssistant lead={mockLead} />;
      case 'composer':
        return <IntelligentEmailComposer lead={mockLead} />;
      case 'chat':
        return <CRMAIAssistant currentView="dashboard" />;
      case 'scoring':
        return <SmartLeadScoring leads={mockLeads} />;
      case 'voice':
        return <VoiceNotes leadId={mockLead.id} />;
      case 'analytics':
        return <PredictiveAnalytics currentMetrics={{
          emailsSent: 45,
          responseRate: 12.5,
          conversationRate: 8.2,
          leadsContacted: 150
        }} />;
      case 'curation':
        return <ManualCurationButton />;
      default:
        return (
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Sparkles className="h-8 w-8 text-purple-600" />
                  AI-Powered Job Hunter CRM
                </CardTitle>
                <CardDescription className="text-lg">
                  Experience the future of job search with cutting-edge AI capabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {features.slice(1).map((feature) => {
                    const IconComponent = feature.icon;
                    return (
                      <Card key={feature.id} className="hover:shadow-lg transition-shadow cursor-pointer" 
                            onClick={() => setActiveFeature(feature.id)}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg bg-${feature.color}-100`}>
                              <IconComponent className={`h-6 w-6 text-${feature.color}-600`} />
                            </div>
                            <h3 className="font-semibold">{feature.name}</h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                          <Button size="sm" variant="outline" className="w-full">
                            Try Feature <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Key Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    Key Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">50% Faster Lead Research</p>
                        <p className="text-sm text-gray-600">AI-powered company insights and recommendations</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">23% Higher Response Rates</p>
                        <p className="text-sm text-gray-600">Intelligent email composition and timing</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Predictive Performance Insights</p>
                        <p className="text-sm text-gray-600">Know what&apos;s working before it happens</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Voice-Powered Efficiency</p>
                        <p className="text-sm text-gray-600">Convert conversations to actionable insights</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-500" />
                    AI Capabilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Lead Intelligence</span>
                      <Badge variant="default">Advanced</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Email Optimization</span>
                      <Badge variant="default">Real-time</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Performance Prediction</span>
                      <Badge variant="default">87% Accuracy</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Voice Processing</span>
                      <Badge variant="default">Multi-language</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Conversation AI</span>
                      <Badge variant="default">Context-aware</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Smart Scoring</span>
                      <Badge variant="default">ML-powered</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sample Use Cases */}
            <Card>
              <CardHeader>
                <CardTitle>Real-World Use Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">🚀 Scenario: New Lead Outreach</h4>
                    <ol className="text-sm space-y-1 list-decimal pl-4">
                      <li>AI Research Assistant gathers company intelligence</li>
                      <li>Smart Scoring evaluates lead potential (85/100)</li>
                      <li>Email Composer crafts personalized message</li>
                      <li>Predictive Analytics suggests optimal send time</li>
                      <li>Voice Notes capture follow-up strategy</li>
                    </ol>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">📈 Scenario: Performance Optimization</h4>
                    <ol className="text-sm space-y-1 list-decimal pl-4">
                      <li>CRM AI Assistant identifies response patterns</li>
                      <li>Predictive Analytics forecasts performance</li>
                      <li>Smart Scoring refines lead qualification</li>
                      <li>Email Composer optimizes messaging</li>
                      <li>Voice Notes track optimization results</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Features Showcase</h1>
          <p className="text-gray-600">
            Explore the cutting-edge AI capabilities that make Job Hunter CRM the most intelligent 
            job search platform for automotive professionals.
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {features.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <Button
                  key={feature.id}
                  variant={activeFeature === feature.id ? "default" : "outline"}
                  onClick={() => setActiveFeature(feature.id)}
                  className="flex items-center gap-2"
                >
                  <IconComponent className="h-4 w-4" />
                  {feature.name}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          {renderFeatureContent()}
        </div>

        {/* Footer */}
        <Card className="mt-8 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold mb-2">Ready to Transform Your Job Search?</h3>
            <p className="mb-4 text-gray-300">
              Experience the power of AI-driven job searching with Job Hunter CRM
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="secondary">
                Get Started
              </Button>
              <Button variant="outline" className="text-white border-white hover:bg-white hover:text-gray-900">
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}