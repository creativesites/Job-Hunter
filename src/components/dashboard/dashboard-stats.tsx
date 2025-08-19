"use client";

import { useEffect, useState } from "react";
import { getLeadsCount } from "@/lib/csv-import";

interface Stats {
  totalLeads: number;
  pendingLeads: number;
  sentEmails: number;
  responseRate: number;
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalLeads: 0,
    pendingLeads: 0,
    sentEmails: 0,
    responseRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const totalLeads = await getLeadsCount();
        setStats({
          totalLeads,
          pendingLeads: totalLeads, // For now, assuming all are pending
          sentEmails: 0,
          responseRate: 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="text-sm font-medium text-gray-600">Total Leads</div>
        <div className="text-2xl font-bold text-gray-900 mt-1">
          {stats.totalLeads.toLocaleString()}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="text-sm font-medium text-gray-600">Pending</div>
        <div className="text-2xl font-bold text-orange-600 mt-1">
          {stats.pendingLeads.toLocaleString()}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="text-sm font-medium text-gray-600">Emails Sent</div>
        <div className="text-2xl font-bold text-blue-600 mt-1">
          {stats.sentEmails.toLocaleString()}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="text-sm font-medium text-gray-600">Response Rate</div>
        <div className="text-2xl font-bold text-green-600 mt-1">
          {stats.responseRate}%
        </div>
      </div>
    </div>
  );
}