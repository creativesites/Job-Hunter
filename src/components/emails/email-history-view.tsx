"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface QueuedEmail {
  id: string;
  lead_id: string;
  subject: string;
  content: string;
  email_type: string;
  priority: number;
  scheduled_for: string;
  status: 'queued' | 'sent' | 'failed' | 'cancelled';
  attempts: number;
  error_message?: string;
  created_at: string;
  sent_at?: string;
}

interface SentEmail {
  id: string;
  lead_id: string;
  subject: string;
  content: string;
  sent_at: string;
  opened_at?: string;
  clicked_at?: string;
  replied_at?: string;
  delivery_status: string;
}

interface EmailQueueStatus {
  dailyLimit: {
    sent: number;
    remaining: number;
    limit: number;
    canSend: boolean;
  };
  queue: {
    total: number;
    byStatus: {
      queued: number;
      sent: number;
      failed: number;
      cancelled: number;
    };
    emails: {
      queued: QueuedEmail[];
      sent: QueuedEmail[];
      failed: QueuedEmail[];
      cancelled: QueuedEmail[];
    };
  };
}

export default function EmailHistoryView() {
  const [queueStatus, setQueueStatus] = useState<EmailQueueStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'queue' | 'sent' | 'failed'>('queue');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchEmailData();
    const interval = setInterval(fetchEmailData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchEmailData = async () => {
    try {
      const response = await fetch('/api/email-queue-status');
      if (response.ok) {
        const data = await response.json();
        setQueueStatus(data);
      }
    } catch (error) {
      console.error('Error fetching email data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processQueue = async () => {
    setProcessing(true);
    try {
      const response = await fetch('/api/process-email-queue', {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`Processed ${data.processed} emails from queue.`);
        fetchEmailData(); // Refresh data
      } else {
        const errorData = await response.json();
        alert(`Failed to process queue: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error processing queue:', error);
      alert('Error processing queue');
    } finally {
      setProcessing(false);
    }
  };

  const cancelEmail = async (emailId: string) => {
    if (!confirm('Are you sure you want to cancel this email?')) return;

    try {
      const response = await fetch(`/api/email-queue-status?queueId=${emailId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Email cancelled successfully');
        fetchEmailData();
      } else {
        alert('Failed to cancel email');
      }
    } catch (error) {
      console.error('Error cancelling email:', error);
      alert('Error cancelling email');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!queueStatus) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-gray-500">Failed to load email data</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'queued':
        return 'bg-blue-100 text-blue-800';
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-2xl font-bold text-blue-600">{queueStatus.queue.byStatus.queued}</div>
          <div className="text-sm text-gray-600">Queued</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-2xl font-bold text-green-600">{queueStatus.queue.byStatus.sent}</div>
          <div className="text-sm text-gray-600">Sent</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-2xl font-bold text-red-600">{queueStatus.queue.byStatus.failed}</div>
          <div className="text-sm text-gray-600">Failed</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-2xl font-bold text-gray-600">{queueStatus.dailyLimit.remaining}</div>
          <div className="text-sm text-gray-600">Remaining Today</div>
        </div>
      </div>

      {/* Daily Limit Progress */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Daily Sending Limit</h3>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">
            {queueStatus.dailyLimit.sent} / {queueStatus.dailyLimit.limit} emails sent today
          </span>
          <span className={`text-sm font-medium ${queueStatus.dailyLimit.canSend ? 'text-green-600' : 'text-red-600'}`}>
            {queueStatus.dailyLimit.remaining} remaining
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              queueStatus.dailyLimit.sent >= queueStatus.dailyLimit.limit ? 'bg-red-500' : 
              queueStatus.dailyLimit.sent >= queueStatus.dailyLimit.limit * 0.8 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min((queueStatus.dailyLimit.sent / queueStatus.dailyLimit.limit) * 100, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Email Lists */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between p-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('queue')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'queue'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Queue ({queueStatus.queue.byStatus.queued})
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'sent'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Sent ({queueStatus.queue.byStatus.sent})
              </button>
              <button
                onClick={() => setActiveTab('failed')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'failed'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Failed ({queueStatus.queue.byStatus.failed})
              </button>
            </nav>
            
            {activeTab === 'queue' && queueStatus.queue.byStatus.queued > 0 && (
              <Button
                onClick={processQueue}
                disabled={processing || !queueStatus.dailyLimit.canSend}
                size="sm"
              >
                {processing ? 'Processing...' : 'Process Queue'}
              </Button>
            )}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'queue' && (
            <div className="space-y-4">
              {queueStatus.queue.emails.queued.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No emails in queue</p>
              ) : (
                queueStatus.queue.emails.queued.map((email) => (
                  <div key={email.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{email.subject}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Type: {email.email_type} | Priority: {email.priority} | Attempts: {email.attempts}
                        </p>
                        <p className="text-sm text-gray-500">
                          Scheduled: {formatDate(email.scheduled_for)}
                        </p>
                        <div className="mt-2">
                          <p className="text-sm text-gray-700 line-clamp-3">
                            {email.content.substring(0, 200)}...
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(email.status)}`}>
                          {email.status}
                        </span>
                        <Button
                          onClick={() => cancelEmail(email.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'sent' && (
            <div className="space-y-4">
              {queueStatus.queue.emails.sent.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No sent emails</p>
              ) : (
                queueStatus.queue.emails.sent.map((email) => (
                  <div key={email.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{email.subject}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Type: {email.email_type}
                        </p>
                        <p className="text-sm text-gray-500">
                          Sent: {email.sent_at ? formatDate(email.sent_at) : 'N/A'}
                        </p>
                        <div className="mt-2">
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {email.content.substring(0, 150)}...
                          </p>
                        </div>
                      </div>
                      <div className="ml-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(email.status)}`}>
                          {email.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'failed' && (
            <div className="space-y-4">
              {queueStatus.queue.emails.failed.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No failed emails</p>
              ) : (
                queueStatus.queue.emails.failed.map((email) => (
                  <div key={email.id} className="border rounded-lg p-4 border-red-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{email.subject}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Type: {email.email_type} | Attempts: {email.attempts}
                        </p>
                        {email.error_message && (
                          <p className="text-sm text-red-600 mt-1">
                            Error: {email.error_message}
                          </p>
                        )}
                        <p className="text-sm text-gray-500">
                          Last attempt: {formatDate(email.created_at)}
                        </p>
                      </div>
                      <div className="ml-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(email.status)}`}>
                          {email.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}