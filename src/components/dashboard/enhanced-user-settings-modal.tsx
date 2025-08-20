"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface UserSettings {
  id: string;
  user_id: string;
  full_name: string;
  email_signature?: string;
  daily_email_limit: number;
  email_provider: 'gmail' | 'resend';
  email_from_name: string;
  company_name?: string;
  job_title?: string;
  phone_number?: string;
  cv_file_url?: string;
  cv_file_name?: string;
  ai_context?: string;
  years_experience?: number;
  current_location?: string;
  willing_to_relocate?: boolean;
  salary_expectation?: string;
  availability?: string;
  work_authorization?: string;
  preferred_work_type?: string;
  industry_focus?: string[];
  skills?: string[];
  certifications?: string[];
  education_level?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  created_at: string;
  updated_at: string;
}

interface EnhancedUserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EnhancedUserSettingsModal({ isOpen, onClose }: EnhancedUserSettingsModalProps) {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'professional' | 'ai'>('basic');
  const [uploadingCV, setUploadingCV] = useState(false);
  const [deletingCV, setDeletingCV] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email_from_name: '',
    company_name: '',
    job_title: '',
    phone_number: '',
    email_provider: 'gmail' as 'gmail' | 'resend',
    daily_email_limit: 10,
    email_signature: '',
    years_experience: 0,
    current_location: '',
    willing_to_relocate: false,
    salary_expectation: '',
    availability: 'immediate',
    work_authorization: 'citizen',
    preferred_work_type: 'full_time',
    industry_focus: [] as string[],
    skills: [] as string[],
    certifications: [] as string[],
    education_level: 'bachelors',
    linkedin_url: '',
    portfolio_url: '',
    ai_context: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/user-settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setFormData({
          full_name: data.full_name || '',
          email_from_name: data.email_from_name || '',
          company_name: data.company_name || '',
          job_title: data.job_title || '',
          phone_number: data.phone_number || '',
          email_provider: data.email_provider || 'gmail',
          daily_email_limit: data.daily_email_limit || 10,
          email_signature: data.email_signature || '',
          years_experience: data.years_experience || 0,
          current_location: data.current_location || '',
          willing_to_relocate: data.willing_to_relocate || false,
          salary_expectation: data.salary_expectation || '',
          availability: data.availability || 'immediate',
          work_authorization: data.work_authorization || 'citizen',
          preferred_work_type: data.preferred_work_type || 'full_time',
          industry_focus: data.industry_focus || [],
          skills: data.skills || [],
          certifications: data.certifications || [],
          education_level: data.education_level || 'bachelors',
          linkedin_url: data.linkedin_url || '',
          portfolio_url: data.portfolio_url || '',
          ai_context: data.ai_context || '',
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayChange = (field: string, value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      [field]: items,
    }));
  };

  const handleCVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingCV(true);
    try {
      const formData = new FormData();
      formData.append('cv', file);

      const response = await fetch('/api/upload-cv', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        alert('CV uploaded successfully!');
        fetchSettings(); // Refresh settings
      } else {
        const error = await response.json();
        alert(`Failed to upload CV: ${error.error}`);
      }
    } catch (error) {
      console.error('Error uploading CV:', error);
      alert('Error uploading CV');
    } finally {
      setUploadingCV(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCVDelete = async () => {
    if (!confirm('Are you sure you want to delete your CV?')) return;

    setDeletingCV(true);
    try {
      const response = await fetch('/api/upload-cv', {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('CV deleted successfully!');
        fetchSettings(); // Refresh settings
      } else {
        const error = await response.json();
        alert(`Failed to delete CV: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting CV:', error);
      alert('Error deleting CV');
    } finally {
      setDeletingCV(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/user-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        alert('Settings updated successfully!');
        onClose();
      } else {
        const error = await response.json();
        alert(`Failed to update settings: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>User Settings</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Settings</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex space-x-4">
            {[
              { id: 'basic', label: 'Basic Info' },
              { id: 'professional', label: 'Professional' },
              { id: 'ai', label: 'AI Context' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-6 p-6">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Winston Zulu"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email From Name
                  </label>
                  <input
                    type="text"
                    value={formData.email_from_name}
                    onChange={(e) => handleInputChange('email_from_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Winston Zulu"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your Company"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={formData.job_title}
                    onChange={(e) => handleInputChange('job_title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your Job Title"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Provider
                  </label>
                  <select
                    value={formData.email_provider}
                    onChange={(e) => handleInputChange('email_provider', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="gmail">Gmail</option>
                    <option value="resend">Resend</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Email Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.daily_email_limit}
                    onChange={(e) => handleInputChange('daily_email_limit', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Signature
                </label>
                <textarea
                  value={formData.email_signature}
                  onChange={(e) => handleInputChange('email_signature', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional signature content..."
                />
              </div>
            </div>
          )}

          {/* Professional Tab */}
          {activeTab === 'professional' && (
            <div className="space-y-6">
              {/* CV Upload Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">CV/Resume</h3>
                {settings?.cv_file_name ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Current CV: {settings.cv_file_name}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingCV}
                      >
                        {uploadingCV ? 'Uploading...' : 'Replace CV'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCVDelete}
                        disabled={deletingCV}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        {deletingCV ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600 mb-3">Upload your CV/Resume (PDF, DOC, DOCX, TXT - Max 5MB)</p>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingCV}
                    >
                      {uploadingCV ? 'Uploading...' : 'Upload CV'}
                    </Button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleCVUpload}
                  className="hidden"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formData.years_experience}
                    onChange={(e) => handleInputChange('years_experience', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Location
                  </label>
                  <input
                    type="text"
                    value={formData.current_location}
                    onChange={(e) => handleInputChange('current_location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City, State/Country"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Education Level
                  </label>
                  <select
                    value={formData.education_level}
                    onChange={(e) => handleInputChange('education_level', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Education</option>
                    <option value="high_school">High School</option>
                    <option value="associates">Associates Degree</option>
                    <option value="bachelors">Bachelor's Degree</option>
                    <option value="masters">Master's Degree</option>
                    <option value="phd">PhD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Authorization
                  </label>
                  <select
                    value={formData.work_authorization}
                    onChange={(e) => handleInputChange('work_authorization', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="citizen">Citizen</option>
                    <option value="permanent_resident">Permanent Resident</option>
                    <option value="visa_required">Visa Required</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Work Type
                  </label>
                  <select
                    value={formData.preferred_work_type}
                    onChange={(e) => handleInputChange('preferred_work_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability
                  </label>
                  <select
                    value={formData.availability}
                    onChange={(e) => handleInputChange('availability', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="immediate">Immediate</option>
                    <option value="2_weeks">2 Weeks Notice</option>
                    <option value="1_month">1 Month</option>
                    <option value="3_months">3 Months</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary Expectation
                  </label>
                  <input
                    type="text"
                    value={formData.salary_expectation}
                    onChange={(e) => handleInputChange('salary_expectation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="$80k - $100k"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="willing_to_relocate"
                  checked={formData.willing_to_relocate}
                  onChange={(e) => handleInputChange('willing_to_relocate', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="willing_to_relocate" className="text-sm text-gray-700">
                  Willing to relocate
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.skills.join(', ')}
                    onChange={(e) => handleArrayChange('skills', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="React, TypeScript, Node.js, Python"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry Focus (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.industry_focus.join(', ')}
                    onChange={(e) => handleArrayChange('industry_focus', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Automotive, Technology, Healthcare"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certifications (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.certifications.join(', ')}
                    onChange={(e) => handleArrayChange('certifications', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="AWS Certified, PMP, Scrum Master"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Portfolio URL
                  </label>
                  <input
                    type="url"
                    value={formData.portfolio_url}
                    onChange={(e) => handleInputChange('portfolio_url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* AI Context Tab */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Context for Email Generation
                  <span className="text-xs text-gray-500 ml-2">
                    ({formData.ai_context.length}/6000 characters)
                  </span>
                </label>
                <textarea
                  value={formData.ai_context}
                  onChange={(e) => {
                    if (e.target.value.length <= 6000) {
                      handleInputChange('ai_context', e.target.value);
                    }
                  }}
                  rows={20}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Provide detailed information about your background, achievements, projects, and anything else relevant for AI to generate personalized emails. This could include:

• Your professional journey and career highlights
• Specific achievements and quantifiable results
• Key projects you've worked on
• Technical skills and expertise areas
• Industry knowledge and experience
• Personal attributes and working style
• Career goals and aspirations
• Notable accomplishments or awards
• Unique value propositions
• Relevant personal interests that relate to your career

The more detailed and specific information you provide here, the better the AI can craft personalized, compelling emails on your behalf."
                />
                <p className="text-xs text-gray-500 mt-2">
                  This information will be used by AI to generate more personalized and effective emails. 
                  All information is private and secure.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}