# Job Hunter CRM - Project Planning Document

## Executive Summary
Job Hunter is a personal CRM application designed for targeted outreach to automotive dealership decision makers. The system will process an existing email list, qualify leads using AI, generate personalized outreach emails, and track performance through comprehensive analytics.

## System Architecture

### Core Components

#### 1. Lead Management System
- **Lead Import**: Bulk import from CSV/Excel files
- **AI Qualification Engine**: 
  - Score leads based on company size, location, engagement history
  - Generate qualification reasoning and notes
  - Priority ranking system
- **Lead Status Pipeline**: Pending → Sent → Responded → Interested/Not Interested
- **Contact Profile Management**: Store and update contact details, notes, interaction history

#### 2. Email Generation & Personalization
- **AI Email Generator**: 
  - Template-based generation with personalization tokens
  - Business-type specific messaging (luxury vs. volume dealers)
  - Subject line optimization
- **Template Library**: 
  - Introduction emails
  - Follow-up sequences
  - Re-engagement campaigns
- **Manual Editor**: Rich text editor for fine-tuning AI-generated content
- **A/B Testing Framework**: Test different approaches, subject lines, content variations

#### 3. Email Sending & Delivery Management
- **Daily Queue System**: Automated queue of next 10 leads to contact
- **Gmail API Integration**: 
  - OAuth authentication
  - Send emails through user's Gmail account
  - Maintain thread continuity
- **Rate Limiting**: Enforce 10 emails/day limit with configurable scheduling
- **Delivery Tracking**: 
  - Send confirmations
  - Bounce handling
  - Spam folder detection

#### 4. Response Management & Tracking
- **Automatic Response Detection**: Monitor inbox for replies to sent emails
- **Response Categorization**: 
  - Interest level (Hot, Warm, Cold, Not Interested)
  - Sentiment analysis
  - Intent classification
- **Thread Management**: Link responses to original outreach emails
- **Follow-up Scheduling**: Automated reminders for follow-up actions

#### 5. Analytics & Reporting Dashboard
- **Performance Metrics**:
  - Open rates, click rates, response rates
  - Conversion funnel analysis
  - Time-to-response tracking
- **A/B Testing Results**: Statistical significance testing, winning variations
- **Lead Source Analysis**: Performance by geographic region, company size, industry segment
- **Revenue Attribution**: Track leads through to closed deals
- **Reporting Dashboards**: Daily, weekly, monthly performance views

## Technical Architecture

### Full-Stack Next.js Application
```
app/
├── (dashboard)/
│   ├── leads/              # Lead management pages
│   ├── emails/             # Email composition & sending
│   ├── analytics/          # Performance dashboard
│   └── settings/           # User preferences
├── api/
│   ├── leads/              # CRUD operations via Supabase
│   ├── emails/             # Email sending via Resend
│   ├── ai/                 # CopilotKit AI integration
│   └── analytics/          # Performance metrics
├── auth/                   # Clerk authentication pages
└── components/             # Shared UI components
```

### Supabase Database Schema
```sql
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
  lead_id uuid REFERENCES leads(id),
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
  campaign_id uuid REFERENCES email_campaigns(id),
  lead_id uuid REFERENCES leads(id),
  response_content text,
  sentiment text, -- 'positive', 'negative', 'neutral'
  interest_level text, -- 'hot', 'warm', 'cold', 'not_interested'
  received_at timestamp DEFAULT now(),
  ai_analysis text
);

-- Analytics events
CREATE TABLE analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  event_type text NOT NULL, -- 'email_sent', 'email_opened', 'email_clicked', 'response_received'
  lead_id uuid REFERENCES leads(id),
  campaign_id uuid REFERENCES email_campaigns(id),
  metadata jsonb,
  timestamp timestamp DEFAULT now()
);
```

## Development Phases

### Phase 1: Foundation Setup (Week 1)
- Next.js project initialization with TypeScript
- Clerk authentication integration
- Supabase database setup and schema creation
- Basic UI components with shadcn/ui
- CSV import functionality for dealer contacts

### Phase 2: Core Lead Management (Week 2)
- Lead dashboard with filtering and search
- Lead detail views and profile management
- Basic CRUD operations via Supabase
- Import automation for the dealer CSV data
- Status pipeline implementation

### Phase 3: AI-Powered Features (Week 3)
- CopilotKit integration for AI assistance
- Lead qualification scoring system
- AI-powered email content generation
- Personalization token system
- Template library with React Email

### Phase 4: Email Automation (Week 4)
- Resend API integration for email sending
- Daily queue system (10 emails/day limit)
- Email template editor and preview
- Delivery tracking and status updates
- A/B testing framework setup

### Phase 5: Response Management (Week 5)
- Response detection and threading
- Sentiment analysis integration
- Interest level classification
- Follow-up scheduling and reminders
- Conversation history tracking

### Phase 6: Analytics & Optimization (Week 6)
- Performance dashboard with Recharts
- Open rates, response rates, conversion metrics
- A/B testing results and optimization
- Geographic and industry segment analysis
- Revenue attribution tracking

### Phase 7: Polish & SaaS Preparation (Week 7-8)
- User onboarding flow
- Multi-tenant architecture considerations
- Pricing and subscription management
- Advanced analytics and reporting
- Documentation and deployment to Vercel

## Success Metrics
- **Efficiency**: Reduce time spent on lead research and email creation by 70%
- **Response Rate**: Achieve >15% response rate on cold outreach
- **Conversion**: Track and optimize lead-to-meeting conversion rate
- **Deliverability**: Maintain >95% email delivery rate
- **User Experience**: Complete daily workflow in <30 minutes

## Risk Mitigation
- **Email Deliverability**: Gradual volume ramp-up, proper authentication
- **Gmail API Limits**: Implement proper rate limiting and error handling
- **Data Privacy**: Encrypt sensitive contact information
- **AI Accuracy**: Human review process for all AI-generated content
- **Compliance**: Ensure CAN-SPAM Act compliance with unsubscribe mechanisms