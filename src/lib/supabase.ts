import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Database = {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string
          company: string
          industry: string | null
          title: string | null
          first_name: string | null
          last_name: string | null
          email: string
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          website: string | null
          digital_dealer: boolean | null
          ai_score: number | null
          qualification_notes: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company: string
          industry?: string | null
          title?: string | null
          first_name?: string | null
          last_name?: string | null
          email: string
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          website?: string | null
          digital_dealer?: boolean | null
          ai_score?: number | null
          qualification_notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company?: string
          industry?: string | null
          title?: string | null
          first_name?: string | null
          last_name?: string | null
          email?: string
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          website?: string | null
          digital_dealer?: boolean | null
          ai_score?: number | null
          qualification_notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}