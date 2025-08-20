"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { generateEmailContent } from "@/lib/ai-service";
import type { Lead } from "@/lib/types";

interface LeadDetailModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateLead?: (lead: Lead) => void;
}

type EmailType = 'introduction' | 'follow-up';

export default function LeadDetailModal({ 
  lead, 
  isOpen, 
  onClose,
  onUpdateLead 
}: LeadDetailModalProps) {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'details' | 'email'>('details');
  const [emailType, setEmailType] = useState<EmailType>('introduction');
  const [emailContent, setEmailContent] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [dailyLimit, setDailyLimit] = useState<{ sent: number; remaining: number; limit: number } | null>(null);
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [userSettings, setUserSettings] = useState<{ full_name: string; email_from_name: string } | null>(null);

  // Fetch daily limit info and user settings when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDailyLimit();
      fetchUserSettings();
    }
  }, [isOpen]);

  const fetchDailyLimit = async () => {
    try {
      const response = await fetch('/api/email-queue-status');
      if (response.ok) {
        const data = await response.json();
        setDailyLimit(data.dailyLimit);
      }
    } catch (error) {
      console.error('Error fetching daily limit:', error);
    }
  };

  const fetchUserSettings = async () => {
    try {
      const response = await fetch('/api/user-settings');
      if (response.ok) {
        const data = await response.json();
        setUserSettings(data);
      }
    } catch (error) {
      console.error('Error fetching user settings:', error);
      // Set default if API fails
      setUserSettings({ full_name: 'Winston Zulu', email_from_name: 'Winston Zulu' });
    }
  };

  if (!lead) return null;

  const generateAIEmail = async () => {
    setIsGeneratingEmail(true);
    try {
      // Use actual user ID from Clerk
      const userId = user?.id || undefined;
      const content = await generateEmailContent(lead, emailType, userId);
      setEmailContent(content);
      
      // Set appropriate subject line
      const subject = emailType === 'introduction' 
        ? `Exploring Career Opportunities at ${lead.company}`
        : `Following Up: Career Opportunities at ${lead.company}`;
      setEmailSubject(subject);
    } catch (error) {
      console.error('Error generating email:', error);
      // Fallback to template
      generateTemplateEmail();
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  const generateTemplateEmail = () => {
    const firstName = lead.first_name || 'Hiring Manager';
    const company = lead.company;
    const city = lead.city;
    const state = lead.state;
    const userName = userSettings?.email_from_name || userSettings?.full_name || 'Winston Zulu';
    
    let content = '';
    let subject = '';

    if (emailType === 'introduction') {
      subject = `Exploring Career Opportunities at ${company}`;
      content = `Dear ${firstName},

I hope this message finds you well. I came across ${company} and was impressed by your operations in ${city}${state ? `, ${state}` : ''}.

As an automotive industry professional with a strong background in dealership operations and customer relations, I'm actively exploring new opportunities where I can contribute to continued success and growth.

My experience includes:
• Sales and customer relationship management
• Dealership operations and process optimization
• Digital marketing and lead generation
• Team leadership and training

I would welcome the chance to discuss how my experience could benefit ${company}. Would you be open to a brief conversation about potential opportunities within your organization?

Thank you for your time and consideration. I look forward to hearing from you.

Best regards,
${userName}`;
    } else {
      subject = `Following Up: Career Opportunities at ${company}`;
      content = `Hi ${firstName},

I wanted to follow up on my previous message from last week regarding potential career opportunities at ${company}.

I understand you're likely very busy managing daily operations, but I remain genuinely interested in exploring how I might contribute to your team's continued success.

If now isn't the right time, I completely understand. However, if you have just a few minutes for a brief conversation in the coming weeks, I would greatly appreciate the opportunity to learn more about ${company} and discuss how my background might align with your needs.

Would a quick 10-15 minute call be possible sometime this week or next?

Thank you for your consideration,
${userName}`;
    }
    
    setEmailContent(content);
    setEmailSubject(subject);
  };

  const sendEmail = async () => {
    setIsSendingEmail(true);
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId: lead.id,
          subject: emailSubject,
          content: emailContent,
          emailType,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Show success message with queue info
        alert(`Email queued successfully! ${data.remainingToday || 0} emails remaining today.`);
        
        // Refresh daily limit info
        fetchDailyLimit();
        
        // Close modal
        onClose();
      } else {
        const errorData = await response.json();
        alert(`Failed to queue email: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBg = (score?: number) => {
    if (!score) return 'bg-gray-100';
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    if (score >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">
                  {(lead.first_name?.charAt(0) || '') + (lead.last_name?.charAt(0) || '')}
                </span>
              </div>
              <div>
                <h6 className="text-xl font-semibold py-6">
                  {lead.first_name} {lead.last_name}
                </h6>
                <p className="text-gray-600">{lead.title} at {lead.company}</p>
              </div>
            </div>
            {lead.ai_score && (
              <div className={`px-3 py-1 rounded-full font-medium ${getScoreBg(lead.ai_score)} ${getScoreColor(lead.ai_score)}`}>
                {lead.ai_score}/100
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="border-b">
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-2 px-4 border-b-2 transition-colors ${
                activeTab === 'details' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Lead Details
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`py-2 px-4 border-b-2 transition-colors ${
                activeTab === 'email' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Compose Email
            </button>
          </nav>
        </div>

        <div className="py-4">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="text-gray-500"><span className="font-medium text-gray-600">Email:</span> {lead.email}</div>
                    {lead.phone && <div className="text-gray-500"><span className="font-medium text-gray-600">Phone:</span> {lead.phone}</div>}
                    {lead.website && (
                      <div className="text-gray-500">
                        <span className="font-medium text-gray-600">Website:</span> 
                        <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 ml-1">
                          {lead.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    {lead.address && <div>{lead.address}</div>}
                    <div>{lead.city}, {lead.state} {lead.zip_code}</div>
                  </div>
                </div>
              </div>

              {/* AI Analysis */}
              {lead.ai_score && (
                <div className="text-gray-500">
                  <h3 className="font-semibold text-gray-900 mb-3">AI Analysis</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Qualification Score</span>
                      <span className={`font-semibold ${getScoreColor(lead.ai_score)}`}>
                        {lead.ai_score}/100
                      </span>
                    </div>
                    {lead.qualification_notes && (
                      <p className="text-sm text-gray-600 italic">{lead.qualification_notes}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Status & Tags */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Status & Tags</h3>
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
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-4">
              {/* Daily Limit Display */}
              {dailyLimit && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900">Daily Email Limit</h4>
                      <p className="text-sm text-blue-600">
                        {dailyLimit.sent}/{dailyLimit.limit} emails sent today
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${dailyLimit.remaining > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {dailyLimit.remaining} remaining
                      </div>
                      {dailyLimit.remaining === 0 && (
                        <p className="text-xs text-red-600">Limit reached for today</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(dailyLimit.sent / dailyLimit.limit) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Email Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Type
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setEmailType('introduction')}
                    className={`px-4 py-2 rounded-md border ${
                      emailType === 'introduction'
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700'
                    }`}
                  >
                    Introduction
                  </button>
                  <button
                    onClick={() => setEmailType('follow-up')}
                    className={`px-4 py-2 rounded-md border ${
                      emailType === 'follow-up'
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700'
                    }`}
                  >
                    Follow-up
                  </button>
                </div>
              </div>

              {/* Generation Buttons */}
              <div className="flex space-x-2">
                <Button
                  onClick={generateAIEmail}
                  disabled={isGeneratingEmail}
                  className="flex-1 text-gray-500"
                >
                  {isGeneratingEmail ? 'Generating AI Email...' : 'Generate AI Email'}
                </Button>
                <Button
                  onClick={generateTemplateEmail}
                  variant="outline"
                  className="flex-1"
                >
                  Use Template
                </Button>
              </div>

              {/* Subject Line */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full text-gray-700 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email subject..."
                />
              </div>

              {/* Email Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Content
                </label>
                <textarea
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  rows={12}
                  className="w-full text-gray-700 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email content will appear here..."
                />
              </div>

              {/* Send Button */}
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  onClick={sendEmail}
                  className="text-gray-700"
                  // @ts-ignore
                  disabled={!emailContent || !emailSubject || isSendingEmail || (dailyLimit && dailyLimit.remaining <= 0)}
                >
                  {isSendingEmail ? 'Queueing...' : 
                   (dailyLimit && dailyLimit.remaining <= 0) ? 'Daily Limit Reached' : 
                   'Queue Email'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}