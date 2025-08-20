import { supabase } from './supabase';
import type { Lead } from './types';

export interface QueuedEmail {
  id: string;
  user_id: string;
  lead_id: string;
  subject: string;
  content: string;
  email_type: 'introduction' | 'follow-up';
  priority: number;
  scheduled_for: string;
  status: 'queued' | 'sent' | 'failed' | 'cancelled';
  attempts: number;
  max_attempts: number;
  error_message?: string;
  created_at: string;
  sent_at?: string;
}

export interface DailySendLimit {
  id: string;
  user_id: string;
  date: string;
  emails_sent: number;
  daily_limit: number;
  created_at: string;
}

export class EmailQueueService {
  private static DAILY_LIMIT = 10;

  /**
   * Add email to queue
   */
  static async addToQueue(
    userId: string,
    leadId: string,
    subject: string,
    content: string,
    emailType: 'introduction' | 'follow-up',
    priority: number = 0,
    scheduledFor?: Date
  ): Promise<{ success: boolean; queueId?: string; error?: string }> {
    try {
      // Check if we can send today
      const canSend = await this.canSendToday(userId);
      if (!canSend.canSend) {
        return {
          success: false,
          error: `Daily limit reached. ${canSend.remaining} emails remaining today.`
        };
      }

      const { data, error } = await supabase
        .from('email_queue')
        .insert({
          user_id: userId,
          lead_id: leadId,
          subject,
          content,
          email_type: emailType,
          priority,
          scheduled_for: scheduledFor?.toISOString() || new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding email to queue:', error);
        return { success: false, error: error.message };
      }

      return { success: true, queueId: data.id };
    } catch (error) {
      console.error('Error in addToQueue:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Check if user can send emails today
   */
  static async canSendToday(userId: string): Promise<{
    canSend: boolean;
    sent: number;
    remaining: number;
    limit: number;
  }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get or create today's limit record
      let { data: limitRecord, error } = await supabase
        .from('daily_send_limits')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (error && error.code === 'PGRST116') {
        // Record doesn't exist, create it
        const { data: newRecord, error: insertError } = await supabase
          .from('daily_send_limits')
          .insert({
            user_id: userId,
            date: today,
            emails_sent: 0,
            daily_limit: this.DAILY_LIMIT,
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating daily limit record:', insertError);
          return { canSend: false, sent: 0, remaining: 0, limit: this.DAILY_LIMIT };
        }
        limitRecord = newRecord;
      } else if (error) {
        console.error('Error fetching daily limit:', error);
        return { canSend: false, sent: 0, remaining: 0, limit: this.DAILY_LIMIT };
      }

      const sent = limitRecord.emails_sent;
      const limit = limitRecord.daily_limit;
      const remaining = Math.max(0, limit - sent);
      
      return {
        canSend: sent < limit,
        sent,
        remaining,
        limit,
      };
    } catch (error) {
      console.error('Error checking daily send limit:', error);
      return { canSend: false, sent: 0, remaining: 0, limit: this.DAILY_LIMIT };
    }
  }

  /**
   * Get queued emails for user
   */
  static async getQueuedEmails(userId: string, limit: number = 50): Promise<QueuedEmail[]> {
    try {
      const { data, error } = await supabase
        .from('email_queue')
        .select('*')
        .eq('user_id', userId)
        .order('priority', { ascending: false })
        .order('scheduled_for', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Error fetching queued emails:', error);
        return [];
      }

      return data as QueuedEmail[];
    } catch (error) {
      console.error('Error in getQueuedEmails:', error);
      return [];
    }
  }

  /**
   * Get next email to send (respects daily limits and priorities)
   */
  static async getNextEmailToSend(userId: string): Promise<QueuedEmail | null> {
    try {
      // Check if we can send today
      const canSend = await this.canSendToday(userId);
      if (!canSend.canSend) {
        return null;
      }

      const { data, error } = await supabase
        .from('email_queue')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'queued')
        .lte('scheduled_for', new Date().toISOString())
        .order('priority', { ascending: false })
        .order('scheduled_for', { ascending: true })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error getting next email:', error);
        return null;
      }

      return error ? null : (data as QueuedEmail);
    } catch (error) {
      console.error('Error in getNextEmailToSend:', error);
      return null;
    }
  }

  /**
   * Mark email as sent and update daily counter
   */
  static async markAsSent(queueId: string, userId: string): Promise<boolean> {
    try {
      // Update queue item
      const { error: queueError } = await supabase
        .from('email_queue')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', queueId);

      if (queueError) {
        console.error('Error marking email as sent:', queueError);
        return false;
      }

      // Increment daily counter
      const today = new Date().toISOString().split('T')[0];
      const { error: limitError } = await supabase.rpc('increment_emails_sent', {
        user_id_param: userId,
        date_param: today
      });

      if (limitError) {
        console.error('Error updating daily limit:', limitError);
        // Don't return false here as the email was still marked as sent
      }

      return true;
    } catch (error) {
      console.error('Error in markAsSent:', error);
      return false;
    }
  }

  /**
   * Mark email as failed
   */
  static async markAsFailed(
    queueId: string, 
    errorMessage: string, 
    incrementAttempts: boolean = true
  ): Promise<boolean> {
    try {
      const updates: any = {
        status: 'failed',
        error_message: errorMessage,
      };

      if (incrementAttempts) {
        // Get current attempts count first
        const { data: current, error: fetchError } = await supabase
          .from('email_queue')
          .select('attempts, max_attempts')
          .eq('id', queueId)
          .single();

        if (fetchError) {
          console.error('Error fetching current attempts:', fetchError);
          return false;
        }

        const newAttempts = (current.attempts || 0) + 1;
        updates.attempts = newAttempts;

        // If we haven't exceeded max attempts, keep it as queued
        if (newAttempts < current.max_attempts) {
          updates.status = 'queued';
          // Schedule retry for later (exponential backoff)
          const retryDelay = Math.pow(2, newAttempts) * 60 * 1000; // Start with 2 minutes
          updates.scheduled_for = new Date(Date.now() + retryDelay).toISOString();
        }
      }

      const { error } = await supabase
        .from('email_queue')
        .update(updates)
        .eq('id', queueId);

      if (error) {
        console.error('Error marking email as failed:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in markAsFailed:', error);
      return false;
    }
  }

  /**
   * Cancel queued email
   */
  static async cancelEmail(queueId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('email_queue')
        .update({ status: 'cancelled' })
        .eq('id', queueId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error cancelling email:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in cancelEmail:', error);
      return false;
    }
  }

  /**
   * Get daily sending stats
   */
  static async getDailyStats(userId: string, days: number = 7): Promise<DailySendLimit[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('daily_send_limits')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching daily stats:', error);
        return [];
      }

      return data as DailySendLimit[];
    } catch (error) {
      console.error('Error in getDailyStats:', error);
      return [];
    }
  }
}