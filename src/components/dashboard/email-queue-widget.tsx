"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface QueueStatus {
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
  };
}

export default function EmailQueueWidget() {
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchQueueStatus();
    // Refresh status every 30 seconds
    const interval = setInterval(fetchQueueStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueueStatus = async () => {
    try {
      const response = await fetch('/api/email-queue-status');
      if (response.ok) {
        const data = await response.json();
        setQueueStatus(data);
      }
    } catch (error) {
      console.error('Error fetching queue status:', error);
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
        fetchQueueStatus(); // Refresh status
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!queueStatus) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Email Queue</h3>
        <p className="text-gray-500">Failed to load queue status</p>
      </div>
    );
  }

  const { dailyLimit, queue } = queueStatus;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Email Queue</h3>
        <Button
          onClick={processQueue}
          disabled={processing || queue.byStatus.queued === 0}
          size="sm"
          variant="outline"
        >
          {processing ? 'Processing...' : 'Process Queue'}
        </Button>
      </div>

      {/* Daily Limit */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900">Daily Sending Limit</h4>
          <span className={`text-sm font-medium ${dailyLimit.canSend ? 'text-green-600' : 'text-red-600'}`}>
            {dailyLimit.sent}/{dailyLimit.limit}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              dailyLimit.sent >= dailyLimit.limit ? 'bg-red-500' : 
              dailyLimit.sent >= dailyLimit.limit * 0.8 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min((dailyLimit.sent / dailyLimit.limit) * 100, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {dailyLimit.remaining} emails remaining today
        </p>
      </div>

      {/* Queue Status */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Queue Status</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{queue.byStatus.queued}</div>
            <div className="text-xs text-gray-500">Queued</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{queue.byStatus.sent}</div>
            <div className="text-xs text-gray-500">Sent Today</div>
          </div>
        </div>

        {(queue.byStatus.failed > 0 || queue.byStatus.cancelled > 0) && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="text-center">
              <div className="text-lg font-semibold text-red-600">{queue.byStatus.failed}</div>
              <div className="text-xs text-gray-500">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-600">{queue.byStatus.cancelled}</div>
              <div className="text-xs text-gray-500">Cancelled</div>
            </div>
          </div>
        )}
      </div>

      {/* Status Messages */}
      {queue.byStatus.queued > 0 && dailyLimit.canSend && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            📧 {queue.byStatus.queued} emails ready to send. Click "Process Queue" to send now.
          </p>
        </div>
      )}

      {queue.byStatus.queued > 0 && !dailyLimit.canSend && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">
            ⏳ {queue.byStatus.queued} emails queued for tomorrow (daily limit reached).
          </p>
        </div>
      )}

      {queue.byStatus.failed > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">
            ⚠️ {queue.byStatus.failed} emails failed to send. Check your email settings.
          </p>
        </div>
      )}
    </div>
  );
}