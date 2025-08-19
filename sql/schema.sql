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

-- Enable Row Level Security (RLS)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

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