"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ArrowLeft, Reply, Forward, MoreHorizontal, AlertCircle, CheckCircle, Clock } from "lucide-react";

interface EmailThread {
  id: string;
  lead_id: string;
  subject: string;
  content: string;
  email_type: string;
  status: string;
  sent_at?: string;
  created_at: string;
  lead: {
    first_name: string;
    last_name: string;
    company: string;
    email: string;
    title: string;
    city: string;
    state: string;
  };
  responses?: EmailResponse[];
}

interface EmailResponse {
  id: string;
  content: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  interest_level: 'hot' | 'warm' | 'cold' | 'not_interested';
  received_at: string;
  ai_analysis: string;
}

interface EmailDetailViewProps {
  emailId: string;
}

export default function EmailDetailView({ emailId }: EmailDetailViewProps) {
  const router = useRouter();
  const [emailThread, setEmailThread] = useState<EmailThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpContent, setFollowUpContent] = useState('');
  const [followUpSubject, setFollowUpSubject] = useState('');
  const [sendingFollowUp, setSendingFollowUp] = useState(false);

  useEffect(() => {
    fetchEmailDetails();
  }, [emailId]);

  const fetchEmailDetails = async () => {
    try {
      const response = await fetch(`/api/emails/${emailId}`);
      if (response.ok) {
        const data = await response.json();
        setEmailThread(data);
      } else {
        console.error('Failed to fetch email details');
      }
    } catch (error) {
      console.error('Error fetching email details:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateFollowUp = async () => {
    if (!emailThread) return;
    
    try {
      // Generate AI follow-up based on original email and any responses
      const prompt = `Generate a follow-up email for ${emailThread.lead.first_name} at ${emailThread.lead.company}`;
      
      // This would call your AI service to generate a follow-up
      // For now, we'll create a simple template
      setFollowUpSubject(`Following Up: ${emailThread.subject.replace('Exploring', 'Following Up on')}`);
      setFollowUpContent(`Hi ${emailThread.lead.first_name},

I wanted to follow up on my previous message regarding opportunities at ${emailThread.lead.company}.

I understand you're likely busy, but I remain very interested in exploring how I might contribute to your team's continued success.

Would you have time for a brief call this week to discuss potential opportunities?

Best regards,
Winston Zulu`);
      
      setShowFollowUp(true);
    } catch (error) {
      console.error('Error generating follow-up:', error);
    }
  };

  const sendFollowUp = async () => {
    if (!emailThread) return;
    
    setSendingFollowUp(true);
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId: emailThread.lead_id,
          subject: followUpSubject,
          content: followUpContent,
          emailType: 'follow-up',
        }),
      });

      if (response.ok) {
        alert('Follow-up email queued successfully!');
        setShowFollowUp(false);
        fetchEmailDetails(); // Refresh to show new email
      } else {
        const errorData = await response.json();
        alert(`Failed to send follow-up: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error sending follow-up:', error);
      alert('Error sending follow-up');
    } finally {
      setSendingFollowUp(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'queued':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-100';
      case 'negative':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getInterestColor = (level?: string) => {
    switch (level) {
      case 'hot':
        return 'text-red-600 bg-red-100';
      case 'warm':
        return 'text-orange-600 bg-orange-100';
      case 'cold':
        return 'text-blue-600 bg-blue-100';
      case 'not_interested':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!emailThread) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Email Not Found</h2>
          <p className="text-gray-600 mb-4">The email you're looking for doesn't exist or has been deleted.</p>
          <Link href="/emails">
            <Button>← Back to Emails</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 truncate max-w-md">
                  {emailThread.subject}
                </h1>
                <p className="text-sm text-gray-600">
                  {emailThread.lead.first_name} {emailThread.lead.last_name} • {emailThread.lead.company}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={generateFollowUp}
                className="flex items-center space-x-2"
              >
                <Reply className="w-4 h-4" />
                <span>Follow Up</span>
              </Button>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Lead Info Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">
                    {emailThread.lead.first_name?.charAt(0)}{emailThread.lead.last_name?.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {emailThread.lead.first_name} {emailThread.lead.last_name}
                  </h3>
                  <p className="text-gray-600">{emailThread.lead.title}</p>
                  <p className="text-gray-600">{emailThread.lead.company}</p>
                  <p className="text-sm text-gray-500">
                    {emailThread.lead.city}, {emailThread.lead.state}
                  </p>
                  <p className="text-sm text-blue-600">{emailThread.lead.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(emailThread.status)}
                <span className="text-sm text-gray-600 capitalize">{emailThread.status}</span>
              </div>
            </div>
          </div>

          {/* Email Thread */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="font-semibold text-gray-900">Email Thread</h3>
            </div>
            
            {/* Original Email */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">You</span>
                    <span className="text-sm text-gray-500">→</span>
                    <span className="text-sm text-gray-600">
                      {emailThread.lead.first_name} {emailThread.lead.last_name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-gray-500">
                      {emailThread.sent_at 
                        ? format(new Date(emailThread.sent_at), 'MMM dd, yyyy at HH:mm')
                        : format(new Date(emailThread.created_at), 'MMM dd, yyyy at HH:mm')}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      emailThread.email_type === 'introduction' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {emailThread.email_type}
                    </span>
                  </div>
                </div>
              </div>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {emailThread.content}
                </div>
              </div>
            </div>

            {/* Responses */}
            {emailThread.responses && emailThread.responses.length > 0 && (
              <div className="divide-y divide-gray-100">
                {emailThread.responses.map((response) => (
                  <div key={response.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            {emailThread.lead.first_name} {emailThread.lead.last_name}
                          </span>
                          <span className="text-sm text-gray-500">→</span>
                          <span className="text-sm text-gray-600">You</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-gray-500">
                            {format(new Date(response.received_at), 'MMM dd, yyyy at HH:mm')}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getSentimentColor(response.sentiment)}`}>
                            {response.sentiment}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getInterestColor(response.interest_level)}`}>
                            {response.interest_level.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="prose prose-sm max-w-none mb-4">
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                        {response.content}
                      </div>
                    </div>
                    {response.ai_analysis && (
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <h4 className="text-sm font-medium text-blue-900 mb-1">AI Analysis</h4>
                        <p className="text-sm text-blue-700">{response.ai_analysis}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* No Responses Message */}
            {(!emailThread.responses || emailThread.responses.length === 0) && emailThread.status === 'sent' && (
              <div className="p-6 text-center">
                <div className="text-gray-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No response yet</p>
                  <p className="text-xs mt-1">Keep following up or try a different approach</p>
                </div>
              </div>
            )}
          </div>

          {/* Follow-up Composer */}
          {showFollowUp && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Compose Follow-up</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={followUpSubject}
                    onChange={(e) => setFollowUpSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={followUpContent}
                    onChange={(e) => setFollowUpContent(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowFollowUp(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={sendFollowUp}
                    disabled={sendingFollowUp || !followUpContent.trim()}
                  >
                    {sendingFollowUp ? 'Sending...' : 'Send Follow-up'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}