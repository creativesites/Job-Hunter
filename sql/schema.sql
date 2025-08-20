-- Job Hunter CRM Database Schema
-- Run these commands in Supabase SQL Editor

-- Leads table (imported from CSV)
CREATE TABLE leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company text NOT NULL,
  industry text,
  title text,
  first_name text,
  last_name text,
  email text UNIQUE NOT NULL,
  phone text,
  address text,
  city text,
  state text,
  zip_code text,
  website text,
  digital_dealer boolean DEFAULT false,
  ai_score integer,
  qualification_notes text,
  status text DEFAULT 'pending',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Email campaigns
CREATE TABLE email_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  user_id text NOT NULL, -- Clerk user ID
  subject text NOT NULL,
  content text NOT NULL,
  template_id uuid REFERENCES email_templates(id),
  sent_at timestamp,
  opened_at timestamp,
  clicked_at timestamp,
  replied_at timestamp,
  delivery_status text DEFAULT 'pending',
  created_at timestamp DEFAULT now()
);

-- Email templates
CREATE TABLE email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  category text,
  user_id text NOT NULL, -- Clerk user ID
  performance_score decimal,
  usage_count integer DEFAULT 0,
  created_at timestamp DEFAULT now()
);

-- Responses and interactions
CREATE TABLE lead_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES email_campaigns(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  response_content text,
  sentiment text CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  interest_level text CHECK (interest_level IN ('hot', 'warm', 'cold', 'not_interested')),
  received_at timestamp DEFAULT now(),
  ai_analysis text
);

-- Analytics events
CREATE TABLE analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  event_type text NOT NULL, -- 'email_sent', 'email_opened', 'email_clicked', 'response_received'
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES email_campaigns(id) ON DELETE CASCADE,
  metadata jsonb,
  timestamp timestamp DEFAULT now()
);

-- Email queue for daily sending limits
CREATE TABLE email_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  subject text NOT NULL,
  content text NOT NULL,
  email_type text NOT NULL, -- 'introduction', 'follow-up'
  priority integer DEFAULT 0, -- Higher numbers = higher priority
  scheduled_for timestamp DEFAULT now(),
  status text DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed', 'cancelled')),
  attempts integer DEFAULT 0,
  max_attempts integer DEFAULT 3,
  error_message text,
  created_at timestamp DEFAULT now(),
  sent_at timestamp
);

-- Daily sending limits tracking
CREATE TABLE daily_send_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  date date NOT NULL,
  emails_sent integer DEFAULT 0,
  daily_limit integer DEFAULT 10,
  created_at timestamp DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create indexes for better performance
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_company ON leads(company);
CREATE INDEX idx_campaigns_user_id ON email_campaigns(user_id);
CREATE INDEX idx_campaigns_sent_at ON email_campaigns(sent_at);
CREATE INDEX idx_templates_user_id ON email_templates(user_id);
CREATE INDEX idx_responses_lead_id ON lead_responses(lead_id);
CREATE INDEX idx_analytics_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_timestamp ON analytics_events(timestamp);
CREATE INDEX idx_email_queue_user_id ON email_queue(user_id);
CREATE INDEX idx_email_queue_status ON email_queue(status);
CREATE INDEX idx_email_queue_scheduled_for ON email_queue(scheduled_for);
CREATE INDEX idx_daily_limits_user_date ON daily_send_limits(user_id, date);

-- Enable Row Level Security (RLS)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_send_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies (will need to be adjusted based on your auth setup)
-- For now, allowing all operations for authenticated users

-- Leads policies
CREATE POLICY "Enable read access for all users" ON leads FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON leads FOR UPDATE USING (true);

-- Email campaigns policies  
CREATE POLICY "Enable all access for email campaigns" ON email_campaigns FOR ALL USING (true);

-- Email templates policies
CREATE POLICY "Enable all access for email templates" ON email_templates FOR ALL USING (true);

-- Lead responses policies
CREATE POLICY "Enable all access for lead responses" ON lead_responses FOR ALL USING (true);

-- Analytics events policies
CREATE POLICY "Enable all access for analytics events" ON analytics_events FOR ALL USING (true);

-- User settings policies
CREATE POLICY "Enable all access for user settings" ON user_settings FOR ALL USING (true);

-- Email queue policies
CREATE POLICY "Enable all access for email queue" ON email_queue FOR ALL USING (true);

-- Daily send limits policies
CREATE POLICY "Enable all access for daily send limits" ON daily_send_limits FOR ALL USING (true);

-- User settings table
CREATE TABLE user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL UNIQUE, -- Clerk user ID
  full_name text DEFAULT 'Winston Zulu',
  email_signature text,
  daily_email_limit integer DEFAULT 10,
  email_provider text DEFAULT 'gmail', -- 'gmail' or 'resend'
  email_from_name text DEFAULT 'Winston Zulu',
  company_name text,
  job_title text,
  phone_number text,
  -- CV and professional information
  cv_file_url text, -- URL to uploaded CV file
  cv_file_name text, -- Original filename
  ai_context text, -- Up to 6000 characters for AI to use
  -- Professional details
  years_experience integer,
  current_location text,
  willing_to_relocate boolean DEFAULT false,
  salary_expectation text,
  availability text, -- 'immediate', '2_weeks', '1_month', etc.
  work_authorization text, -- 'citizen', 'permanent_resident', 'visa_required', etc.
  preferred_work_type text, -- 'full_time', 'part_time', 'contract', 'remote', etc.
  industry_focus text[], -- Array of industries
  skills text[], -- Array of key skills
  certifications text[], -- Array of certifications
  education_level text, -- 'high_school', 'associates', 'bachelors', 'masters', 'phd'
  linkedin_url text,
  portfolio_url text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  -- Constraints
  CONSTRAINT ai_context_length CHECK (char_length(ai_context) <= 6000)
);

-- Function to safely increment email count
CREATE OR REPLACE FUNCTION increment_emails_sent(user_id_param text, date_param date)
RETURNS integer AS $$
DECLARE
  current_count integer;
BEGIN
  -- Get current count and increment atomically
  UPDATE daily_send_limits 
  SET emails_sent = emails_sent + 1 
  WHERE user_id = user_id_param AND date = date_param
  RETURNING emails_sent INTO current_count;
  
  -- If no record exists, create one
  IF NOT FOUND THEN
    INSERT INTO daily_send_limits (user_id, date, emails_sent, daily_limit)
    VALUES (user_id_param, date_param, 1, 10)
    RETURNING emails_sent INTO current_count;
  END IF;
  
  RETURN current_count;
END;
$$ LANGUAGE plpgsql;