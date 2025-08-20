import { supabase } from './supabase';

export interface UserSettings {
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
  // CV and professional information
  cv_file_url?: string;
  cv_file_name?: string;
  ai_context?: string;
  // Professional details
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

export interface UpdateUserSettingsData {
  full_name?: string;
  email_signature?: string;
  daily_email_limit?: number;
  email_provider?: 'gmail' | 'resend';
  email_from_name?: string;
  company_name?: string;
  job_title?: string;
  phone_number?: string;
  // CV and professional information
  cv_file_url?: string;
  cv_file_name?: string;
  ai_context?: string;
  // Professional details
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
}

export class UserSettingsService {
  /**
   * Get user settings, create default if doesn't exist
   */
  static async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      // Try to get existing settings
      let { data: settings, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Settings don't exist, create default
        const defaultSettings = {
          user_id: userId,
          full_name: 'Winston Zulu',
          email_signature: null,
          daily_email_limit: 10,
          email_provider: 'gmail' as const,
          email_from_name: 'Winston Zulu',
          company_name: null,
          job_title: null,
          phone_number: null,
        };

        const { data: newSettings, error: createError } = await supabase
          .from('user_settings')
          .insert(defaultSettings)
          .select()
          .single();

        if (createError) {
          console.error('Error creating default user settings:', createError);
          return null;
        }

        settings = newSettings;
      } else if (error) {
        console.error('Error fetching user settings:', error);
        return null;
      }

      return settings as UserSettings;
    } catch (error) {
      console.error('Error in getUserSettings:', error);
      return null;
    }
  }

  /**
   * Update user settings
   */
  static async updateUserSettings(
    userId: string, 
    updates: UpdateUserSettingsData
  ): Promise<UserSettings | null> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user settings:', error);
        return null;
      }

      return data as UserSettings;
    } catch (error) {
      console.error('Error in updateUserSettings:', error);
      return null;
    }
  }

  /**
   * Get user's email signature with name
   */
  static async getEmailSignature(userId: string): Promise<string> {
    try {
      const settings = await this.getUserSettings(userId);
      if (!settings) {
        return 'Best regards,\nWinston Zulu';
      }

      let signature = `Best regards,\n${settings.email_from_name || settings.full_name}`;
      
      if (settings.job_title || settings.company_name) {
        if (settings.job_title && settings.company_name) {
          signature += `\n${settings.job_title} at ${settings.company_name}`;
        } else if (settings.job_title) {
          signature += `\n${settings.job_title}`;
        } else if (settings.company_name) {
          signature += `\n${settings.company_name}`;
        }
      }

      if (settings.phone_number) {
        signature += `\n${settings.phone_number}`;
      }

      if (settings.email_signature) {
        signature += `\n\n${settings.email_signature}`;
      }

      return signature;
    } catch (error) {
      console.error('Error getting email signature:', error);
      return 'Best regards,\nWinston Zulu';
    }
  }

  /**
   * Get user's display name for emails
   */
  static async getEmailFromName(userId: string): Promise<string> {
    try {
      const settings = await this.getUserSettings(userId);
      return settings?.email_from_name || settings?.full_name || 'Winston Zulu';
    } catch (error) {
      console.error('Error getting email from name:', error);
      return 'Winston Zulu';
    }
  }

  /**
   * Get user's daily email limit
   */
  static async getDailyEmailLimit(userId: string): Promise<number> {
    try {
      const settings = await this.getUserSettings(userId);
      return settings?.daily_email_limit || 10;
    } catch (error) {
      console.error('Error getting daily email limit:', error);
      return 10;
    }
  }

  /**
   * Get user's preferred email provider
   */
  static async getEmailProvider(userId: string): Promise<'gmail' | 'resend'> {
    try {
      const settings = await this.getUserSettings(userId);
      return settings?.email_provider || 'gmail';
    } catch (error) {
      console.error('Error getting email provider:', error);
      return 'gmail';
    }
  }

  /**
   * Get user's AI context for email generation
   */
  static async getAIContext(userId: string): Promise<string> {
    try {
      const settings = await this.getUserSettings(userId);
      if (!settings) return '';

      let context = '';

      // Basic info
      if (settings.full_name) {
        context += `Name: ${settings.full_name}\n`;
      }

      if (settings.job_title) {
        context += `Current/Target Role: ${settings.job_title}\n`;
      }

      if (settings.years_experience) {
        context += `Years of Experience: ${settings.years_experience}\n`;
      }

      if (settings.current_location) {
        context += `Location: ${settings.current_location}\n`;
      }

      if (settings.education_level) {
        context += `Education: ${settings.education_level}\n`;
      }

      // Skills and industries
      if (settings.skills && settings.skills.length > 0) {
        context += `Key Skills: ${settings.skills.join(', ')}\n`;
      }

      if (settings.industry_focus && settings.industry_focus.length > 0) {
        context += `Industry Focus: ${settings.industry_focus.join(', ')}\n`;
      }

      if (settings.certifications && settings.certifications.length > 0) {
        context += `Certifications: ${settings.certifications.join(', ')}\n`;
      }

      // Work preferences
      if (settings.preferred_work_type) {
        context += `Preferred Work Type: ${settings.preferred_work_type}\n`;
      }

      if (settings.availability) {
        context += `Availability: ${settings.availability}\n`;
      }

      if (settings.work_authorization) {
        context += `Work Authorization: ${settings.work_authorization}\n`;
      }

      if (settings.salary_expectation) {
        context += `Salary Expectation: ${settings.salary_expectation}\n`;
      }

      // Custom AI context
      if (settings.ai_context) {
        context += `\nAdditional Context:\n${settings.ai_context}`;
      }

      return context;
    } catch (error) {
      console.error('Error getting AI context:', error);
      return '';
    }
  }

  /**
   * Get user's professional summary for AI
   */
  static async getProfessionalSummary(userId: string): Promise<{
    hasCV: boolean;
    skills: string[];
    experience: number | undefined;
    industries: string[];
    context: string;
  }> {
    try {
      const settings = await this.getUserSettings(userId);
      if (!settings) {
        return {
          hasCV: false,
          skills: [],
          experience: undefined,
          industries: [],
          context: '',
        };
      }

      return {
        hasCV: !!(settings.cv_file_url && settings.cv_file_name),
        skills: settings.skills || [],
        experience: settings.years_experience,
        industries: settings.industry_focus || [],
        context: await this.getAIContext(userId),
      };
    } catch (error) {
      console.error('Error getting professional summary:', error);
      return {
        hasCV: false,
        skills: [],
        experience: undefined,
        industries: [],
        context: '',
      };
    }
  }
}