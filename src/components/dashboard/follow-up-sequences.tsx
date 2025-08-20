"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { format, addDays, isAfter, isBefore } from "date-fns";
import {
  Clock,
  Play,
  Pause,
  Settings,
  Zap,
  Target,
  Calendar,
  Mail,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Edit3,
  Plus,
  Trash2
} from "lucide-react";

interface FollowUpSequence {
  id: string;
  name: string;
  description: string;
  active: boolean;
  steps: FollowUpStep[];
  leads_enrolled: number;
  completion_rate: number;
  response_rate: number;
  created_at: string;
}

interface FollowUpStep {
  id: string;
  sequence_id: string;
  step_number: number;
  delay_days: number;
  subject_template: string;
  content_template: string;
  condition: 'no_response' | 'negative_response' | 'always';
  active: boolean;
}

interface SequenceEnrollment {
  id: string;
  lead_id: string;
  sequence_id: string;
  current_step: number;
  status: 'active' | 'completed' | 'paused' | 'unsubscribed';
  next_send_date: string;
  last_sent_date?: string;
  lead: {
    first_name: string;
    last_name: string;
    company: string;
    email: string;
  };
}

export default function FollowUpSequences() {
  const { user } = useUser();
  const [sequences, setSequences] = useState<FollowUpSequence[]>([]);
  const [enrollments, setEnrollments] = useState<SequenceEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sequences' | 'enrollments' | 'create'>('sequences');
  const [selectedSequence, setSelectedSequence] = useState<string | null>(null);

  useEffect(() => {
    fetchSequences();
    fetchEnrollments();
  }, []);

  const fetchSequences = async () => {
    try {
      const response = await fetch('/api/follow-up-sequences');
      if (response.ok) {
        const data = await response.json();
        setSequences(data);
      }
    } catch (error) {
      console.error('Error fetching sequences:', error);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const response = await fetch('/api/follow-up-sequences/enrollments');
      if (response.ok) {
        const data = await response.json();
        setEnrollments(data);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSequence = async (sequenceId: string, active: boolean) => {
    try {
      const response = await fetch(`/api/follow-up-sequences/${sequenceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active })
      });

      if (response.ok) {
        fetchSequences();
      }
    } catch (error) {
      console.error('Error toggling sequence:', error);
    }
  };

  const createDefaultSequences = async () => {
    try {
      const response = await fetch('/api/follow-up-sequences/defaults', {
        method: 'POST'
      });

      if (response.ok) {
        fetchSequences();
        alert('Default follow-up sequences created successfully!');
      }
    } catch (error) {
      console.error('Error creating default sequences:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'unsubscribed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getNextActionDate = (enrollment: SequenceEnrollment) => {
    const sequence = sequences.find(s => s.id === enrollment.sequence_id);
    if (!sequence) return null;

    const nextStep = sequence.steps.find(s => s.step_number === enrollment.current_step + 1);
    if (!nextStep) return null;

    const lastSentDate = new Date(enrollment.last_sent_date || enrollment.next_send_date);
    return addDays(lastSentDate, nextStep.delay_days);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Automated Follow-Up Sequences</h2>
              <p className="text-gray-600">Intelligent email sequences that nurture leads automatically</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={createDefaultSequences}
              disabled={sequences.length > 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Defaults
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Sequence
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            {['sequences', 'enrollments'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'sequences' ? 'Sequences' : 'Active Enrollments'}
                {tab === 'enrollments' && enrollments.length > 0 && (
                  <span className="ml-2 bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full">
                    {enrollments.filter(e => e.status === 'active').length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Sequences Tab */}
      {activeTab === 'sequences' && (
        <div className="space-y-4">
          {sequences.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Follow-Up Sequences Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create automated email sequences to nurture your leads and improve response rates.
              </p>
              <Button onClick={createDefaultSequences}>
                <Plus className="w-4 h-4 mr-2" />
                Create Default Sequences
              </Button>
            </div>
          ) : (
            sequences.map((sequence) => (
              <div key={sequence.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{sequence.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        sequence.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {sequence.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{sequence.description}</p>

                    {/* Steps Preview */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Sequence Steps ({sequence.steps.length})
                      </h4>
                      <div className="flex items-center space-x-2 overflow-x-auto">
                        {sequence.steps.map((step, index) => (
                          <div key={step.id} className="flex items-center space-x-2 flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-semibold text-blue-600">
                                {step.step_number}
                              </span>
                            </div>
                            <div className="text-xs">
                              <div className="font-medium text-gray-900 truncate max-w-32">
                                {step.subject_template.split('[')[0]}...
                              </div>
                              <div className="text-gray-500">
                                {step.delay_days} days
                              </div>
                            </div>
                            {index < sequence.steps.length - 1 && (
                              <div className="w-4 h-px bg-gray-300"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-900">
                          {sequence.leads_enrolled}
                        </div>
                        <div className="text-xs text-gray-600">Leads Enrolled</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">
                          {sequence.response_rate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600">Response Rate</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">
                          {sequence.completion_rate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600">Completion Rate</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSequence(sequence.id, !sequence.active)}
                    >
                      {sequence.active ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Activate
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Enrollments Tab */}
      {activeTab === 'enrollments' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Active Enrollments</h3>
              <div className="text-sm text-gray-600">
                {enrollments.filter(e => e.status === 'active').length} active leads
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {enrollments.length === 0 ? (
              <div className="p-12 text-center">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No Active Enrollments</h4>
                <p className="text-gray-600">
                  Leads will appear here when they're enrolled in follow-up sequences.
                </p>
              </div>
            ) : (
              enrollments.map((enrollment) => {
                const sequence = sequences.find(s => s.id === enrollment.sequence_id);
                const nextActionDate = getNextActionDate(enrollment);
                
                return (
                  <div key={enrollment.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-gray-600">
                            {enrollment.lead.first_name?.charAt(0)}{enrollment.lead.last_name?.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {enrollment.lead.first_name} {enrollment.lead.last_name}
                          </h4>
                          <p className="text-sm text-gray-600 mb-1">
                            {enrollment.lead.company} • {enrollment.lead.email}
                          </p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-gray-600">
                              Sequence: {sequence?.name || 'Unknown'}
                            </span>
                            <span className="text-gray-600">
                              Step: {enrollment.current_step + 1} of {sequence?.steps.length || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(enrollment.status)}`}>
                          {enrollment.status.replace('_', ' ')}
                        </span>
                        
                        {nextActionDate && enrollment.status === 'active' && (
                          <div className="mt-2 text-sm">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-600">
                                Next: {format(nextActionDate, 'MMM dd, yyyy')}
                              </span>
                            </div>
                            {isAfter(new Date(), nextActionDate) && (
                              <div className="flex items-center space-x-1 mt-1">
                                <AlertCircle className="w-3 h-3 text-red-500" />
                                <span className="text-xs text-red-600">Overdue</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600">Progress</span>
                        <span className="text-xs text-gray-600">
                          {Math.round(((enrollment.current_step + 1) / (sequence?.steps.length || 1)) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${((enrollment.current_step + 1) / (sequence?.steps.length || 1)) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}