-- Add user_id column to leads table for multi-user support
-- Run this in Supabase SQL Editor

-- Add user_id column to leads table
ALTER TABLE leads 
ADD COLUMN user_id text;

-- Update existing leads to have a default user_id (you can update this to the actual user ID)
-- For now, we'll set it to null and handle this in the application
UPDATE leads 
SET user_id = null 
WHERE user_id IS NULL;

-- Add index for better performance
CREATE INDEX idx_leads_user_id ON leads(user_id);

-- Add index for user_id + status combination for faster queries
CREATE INDEX idx_leads_user_status ON leads(user_id, status);

-- Update Row Level Security policy if needed
-- Note: You may need to enable RLS and create policies based on your security requirements
-- Example:
-- ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view their own leads" ON leads FOR SELECT USING (user_id = auth.jwt()->>'sub');
-- CREATE POLICY "Users can insert their own leads" ON leads FOR INSERT WITH CHECK (user_id = auth.jwt()->>'sub');
-- CREATE POLICY "Users can update their own leads" ON leads FOR UPDATE USING (user_id = auth.jwt()->>'sub');