"use client";

import { useEffect, useState } from "react";
import { getLeads } from "@/lib/csv-import";
import type { Lead } from "@/lib/types";
import LeadDetailModal from "./lead-detail-modal";

export default function LeadsList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [scoreFilter, setScoreFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchLeads() {
      try {
        const data = await getLeads(50); // Get more leads for filtering
        setLeads(data);
        setFilteredLeads(data);
      } catch (error) {
        console.error("Error fetching leads:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeads();
  }, []);

  // Filter leads based on search term, status, and score
  useEffect(() => {
    let filtered = leads;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(lead =>
        lead.first_name?.toLowerCase().includes(term) ||
        lead.last_name?.toLowerCase().includes(term) ||
        lead.company?.toLowerCase().includes(term) ||
        lead.email?.toLowerCase().includes(term) ||
        lead.title?.toLowerCase().includes(term) ||
        lead.city?.toLowerCase().includes(term) ||
        lead.state?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    // Score filter
    if (scoreFilter !== 'all') {
      if (scoreFilter === 'high') {
        filtered = filtered.filter(lead => lead.ai_score && lead.ai_score >= 80);
      } else if (scoreFilter === 'medium') {
        filtered = filtered.filter(lead => lead.ai_score && lead.ai_score >= 60 && lead.ai_score < 80);
      } else if (scoreFilter === 'low') {
        filtered = filtered.filter(lead => lead.ai_score && lead.ai_score < 60);
      } else if (scoreFilter === 'unscored') {
        filtered = filtered.filter(lead => !lead.ai_score);
      }
    }

    setFilteredLeads(filtered);
  }, [leads, searchTerm, statusFilter, scoreFilter]);

  const openLeadModal = (lead: Lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const closeLeadModal = () => {
    setSelectedLead(null);
    setIsModalOpen(false);
  };

  const updateLead = (updatedLead: Lead) => {
    setLeads(prevLeads => 
      prevLeads.map(lead => 
        lead.id === updatedLead.id ? updatedLead : lead
      )
    );
  };

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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-600">Leads ({filteredLeads.length})</h3>
        </div>
        
        {/* Filters */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-gray-600 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 text-gray-600 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
              <option value="responded">Responded</option>
              <option value="interested">Interested</option>
              <option value="not_interested">Not Interested</option>
            </select>
            
            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
              className="px-3 text-gray-600 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Scores</option>
              <option value="high">High (80-100)</option>
              <option value="medium">Medium (60-79)</option>
              <option value="low">Low (&lt;60)</option>
              <option value="unscored">Unscored</option>
            </select>
          </div>
        </div>
      </div>
      <div className="p-6">
        {filteredLeads.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {leads.length === 0 ? 'No leads found. Import your CSV file to get started.' : 'No leads match your current filters.'}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLeads.map((lead) => (
              <div 
                key={lead.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => openLeadModal(lead)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {(lead.first_name?.charAt(0) || '') + (lead.last_name?.charAt(0) || '')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {lead.first_name} {lead.last_name}
                    </div>
                    <div className="text-sm text-gray-600">{lead.title} at {lead.company}</div>
                    <div className="text-sm text-gray-500">{lead.email}</div>
                    <div className="text-sm text-gray-400">{lead.city}, {lead.state}</div>
                    {lead.qualification_notes && (
                      <div className="text-xs text-gray-500 mt-1 italic">
                        {lead.qualification_notes}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {lead.ai_score && (
                    <div className={`px-2 py-1 text-xs rounded-full font-medium ${
                      lead.ai_score >= 80 ? 'bg-green-100 text-green-800' :
                      lead.ai_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      lead.ai_score >= 40 ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {lead.ai_score}/100
                    </div>
                  )}
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
                      Digital
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <LeadDetailModal
        lead={selectedLead}
        isOpen={isModalOpen}
        onClose={closeLeadModal}
        onUpdateLead={updateLead}
      />
    </div>
  );
}