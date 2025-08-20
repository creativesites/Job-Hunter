-- Email Queue Migration
-- Run this in your Supabase SQL Editor to create the email queue tables

-- Email queue for daily sending limits
CREATE TABLE IF NOT EXISTS email_queue (
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
CREATE TABLE IF NOT EXISTS daily_send_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  date date NOT NULL,
  emails_sent integer DEFAULT 0,
  daily_limit integer DEFAULT 10,
  created_at timestamp DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_queue_user_id ON email_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled_for ON email_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_daily_limits_user_date ON daily_send_limits(user_id, date);

-- Enable Row Level Security (RLS)
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_send_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allowing all operations for authenticated users for now)
CREATE POLICY "Enable all access for email queue" ON email_queue FOR ALL USING (true);
CREATE POLICY "Enable all access for daily send limits" ON daily_send_limits FOR ALL USING (true);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
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

-- Enable RLS for user settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for user settings" ON user_settings FOR ALL USING (true);

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