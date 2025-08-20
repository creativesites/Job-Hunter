"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { 
  Star, 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Zap,
  Brain,
  Heart,
  Trophy,
  RefreshCw
} from "lucide-react";
import type { Lead } from "@/lib/types";

interface CuratedLead extends Lead {
  curation_score: number;
  curation_reason: string;
  optimal_send_time: string;
  personalization_notes: string;
}

interface DailyCuration {
  date: string;
  total_leads: number;
  curated_leads: CuratedLead[];
  motivation_message: string;
  daily_goal: number;
  progress: {
    emails_sent: number;
    responses_received: number;
    positive_responses: number;
  };
  success_prediction: number;
  energy_level: 'high' | 'medium' | 'low';
}

export default function DailyCurationPanel() {
  const { user } = useUser();
  const [curation, setCuration] = useState<DailyCuration | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  useEffect(() => {
    fetchDailyCuration();
  }, []);

  const fetchDailyCuration = async () => {
    try {
      const response = await fetch('/api/daily-curation');
      if (response.ok) {
        const data = await response.json();
        setCuration(data);
      } else {
        console.error('Failed to fetch daily curation');
      }
    } catch (error) {
      console.error('Error fetching daily curation:', error);
    } finally {
      setLoading(false);
    }
  };

  const regenerateCuration = async () => {
    setRegenerating(true);
    try {
      const response = await fetch('/api/daily-curation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'regenerate' })
      });
      
      if (response.ok) {
        const data = await response.json();
        setCuration(data);
      }
    } catch (error) {
      console.error('Error regenerating curation:', error);
    } finally {
      setRegenerating(false);
    }
  };

  const sendCuratedEmails = async () => {
    const leadsToSend = selectedLeads.length > 0 
      ? selectedLeads 
      : curation?.curated_leads.slice(0, 3).map(l => l.id) || [];

    try {
      const response = await fetch('/api/send-curated-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds: leadsToSend })
      });

      if (response.ok) {
        alert('Batch emails queued successfully!');
        fetchDailyCuration(); // Refresh data
      }
    } catch (error) {
      console.error('Error sending curated emails:', error);
    }
  };

  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const getEnergyColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMotivationalIcon = (energyLevel: string) => {
    switch (energyLevel) {
      case 'high': return <Zap className="w-5 h-5 text-green-600" />;
      case 'medium': return <Target className="w-5 h-5 text-yellow-600" />;
      case 'low': return <Heart className="w-5 h-5 text-red-600" />;
      default: return <Brain className="w-5 h-5 text-blue-600" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!curation) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            AI Curation Unavailable
          </h3>
          <p className="text-gray-600 mb-4">
            Unable to generate daily lead curation. Please try again.
          </p>
          <Button onClick={fetchDailyCuration}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Motivational Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {getMotivationalIcon(curation.energy_level)}
            <div>
              <h2 className="text-xl font-bold">
                Daily AI Curation - {format(new Date(), 'EEEE, MMMM do')}
              </h2>
              <p className="text-blue-100 mt-1">
                Your personalized lead selection powered by AI
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={regenerateCuration}
              disabled={regenerating}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
              {regenerating ? 'Regenerating...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </div>

      {/* Motivation & Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Daily Motivation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Trophy className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Daily Motivation</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${getEnergyColor(curation.energy_level)}`}>
                {curation.energy_level.toUpperCase()} ENERGY
              </span>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
            <p className="text-gray-700 font-medium leading-relaxed">
              {curation.motivation_message}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {curation.success_prediction}%
              </div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {curation.daily_goal}
              </div>
              <div className="text-sm text-gray-600">Daily Goal</div>
            </div>
          </div>
        </div>

        {/* Progress Dashboard */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Today's Progress</h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Emails Sent</span>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900">
                  {curation.progress.emails_sent}/{curation.daily_goal}
                </span>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min((curation.progress.emails_sent / curation.daily_goal) * 100, 100)}%` 
                }}
              ></div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {curation.progress.responses_received}
                </div>
                <div className="text-xs text-gray-600">Total Responses</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {curation.progress.positive_responses}
                </div>
                <div className="text-xs text-gray-600">Positive</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Curated Leads */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  AI-Curated Leads ({curation.curated_leads.length})
                </h3>
                <p className="text-sm text-gray-600">
                  Optimized for highest response probability
                </p>
              </div>
            </div>
            <Button 
              onClick={sendCuratedEmails}
              className="bg-gradient-to-r from-blue-500 to-purple-600"
              disabled={curation.progress.emails_sent >= curation.daily_goal}
            >
              <Zap className="w-4 h-4 mr-2" />
              Send Selected ({selectedLeads.length || 3})
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {curation.curated_leads.map((lead, index) => (
              <div 
                key={lead.id}
                className={`border rounded-lg p-4 transition-all cursor-pointer ${
                  selectedLeads.includes(lead.id) 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleLeadSelection(lead.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-blue-600">
                          #{index + 1}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(lead.curation_score / 20) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm font-medium text-gray-700 ml-1">
                          {lead.curation_score}/100
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Best time: {lead.optimal_send_time}
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-semibold text-sm">
                        {lead.first_name?.charAt(0)}{lead.last_name?.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {lead.first_name} {lead.last_name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {lead.title} at {lead.company}
                      </p>
                      <p className="text-xs text-gray-500">
                        {lead.city}, {lead.state}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 grid md:grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded-md p-3">
                      <h5 className="text-xs font-medium text-blue-900 mb-1">
                        Why AI Selected This Lead
                      </h5>
                      <p className="text-xs text-blue-700">
                        {lead.curation_reason}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-md p-3">
                      <h5 className="text-xs font-medium text-green-900 mb-1">
                        Personalization Notes
                      </h5>
                      <p className="text-xs text-green-700">
                        {lead.personalization_notes}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {curation.curated_leads.length === 0 && (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                No leads available for curation today. Import more leads or adjust your criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}