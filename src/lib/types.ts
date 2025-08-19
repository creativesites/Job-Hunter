export interface Lead {
  id: string
  company: string
  industry?: string
  title?: string
  first_name?: string
  last_name?: string
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  website?: string
  digital_dealer?: boolean
  ai_score?: number
  qualification_notes?: string
  status: 'pending' | 'sent' | 'responded' | 'interested' | 'not_interested'
  created_at: string
  updated_at: string
}

export interface EmailCampaign {
  id: string
  lead_id: string
  user_id: string
  subject: string
  content: string
  template_id?: string
  sent_at?: string
  opened_at?: string
  clicked_at?: string
  replied_at?: string
  delivery_status: 'pending' | 'sent' | 'delivered' | 'failed'
  created_at: string
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  category?: string
  user_id: string
  performance_score?: number
  usage_count: number
  created_at: string
}

export interface LeadResponse {
  id: string
  campaign_id: string
  lead_id: string
  response_content?: string
  sentiment: 'positive' | 'negative' | 'neutral'
  interest_level: 'hot' | 'warm' | 'cold' | 'not_interested'
  received_at: string
  ai_analysis?: string
}