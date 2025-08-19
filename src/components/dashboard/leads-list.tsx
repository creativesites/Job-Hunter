"use client";

import { useEffect, useState } from "react";
import { getLeads } from "@/lib/csv-import";
import type { Lead } from "@/lib/types";

export default function LeadsList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeads() {
      try {
        const data = await getLeads(20); // Get first 20 leads
        setLeads(data);
      } catch (error) {
        console.error("Error fetching leads:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeads();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Recent Leads</h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">Recent Leads</h3>
      </div>
      <div className="p-6">
        {leads.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No leads found. Import your CSV file to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {(lead.first_name?.charAt(0) || '') + (lead.last_name?.charAt(0) || '')}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {lead.first_name} {lead.last_name}
                    </div>
                    <div className="text-sm text-gray-600">{lead.title} at {lead.company}</div>
                    <div className="text-sm text-gray-500">{lead.email}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    lead.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    lead.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                    lead.status === 'responded' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {lead.status}
                  </span>
                  {lead.digital_dealer && (
                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                      Digital Dealer
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}