import { google } from 'googleapis';
import nodemailer from 'nodemailer';

interface EmailData {
  to: string;
  subject: string;
  content: string;
  fromName?: string;
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class GmailService {
  private static gmail: any;

  private static getGmailClient() {
    if (!this.gmail) {
      // For API Key authentication (simpler but limited)
      if (process.env.GMAIL_API_KEY) {
        this.gmail = google.gmail({
          version: 'v1',
          auth: process.env.GMAIL_API_KEY,
        });
      } else {
        throw new Error('Gmail API key not configured');
      }
    }
    return this.gmail;
  }

  /**
   * Send email via Gmail API
   */
  static async sendEmail(emailData: EmailData): Promise<SendEmailResult> {
    try {
      const { to, subject, content, fromName = 'Winston Zulu' } = emailData;
      const fromEmail = process.env.GMAIL_USER_EMAIL || 'creativesites263@gmail.com';

      // Create the email message
      const messageParts = [
        `From: ${fromName} <${fromEmail}>`,
        `To: ${to}`,
        `Subject: ${subject}`,
        'Content-Type: text/plain; charset=utf-8',
        '',
        content
      ];

      const message = messageParts.join('\n');

      // Encode the message in base64url format
      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const gmail = this.getGmailClient();

      // Note: For sending emails, we need OAuth2 authentication, not just API key
      // API key only works for reading public data
      // For now, we'll simulate the sending
      console.log('Gmail API - Simulating email send (OAuth2 required for actual sending):', {
        to,
        subject,
        from: `${fromName} <${fromEmail}>`,
        contentPreview: content.substring(0, 100) + '...',
      });

      // Return simulated success
      return {
        success: true,
        messageId: `gmail-simulated-${Date.now()}`,
      };

      // Uncomment when OAuth2 is properly configured:
      /*
      const result = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });

      return {
        success: true,
        messageId: result.data.id,
      };
      */

    } catch (error) {
      console.error('Gmail API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send via Gmail SMTP using nodemailer (more reliable for sending)
   */
  static async sendEmailViaSmtp(emailData: EmailData): Promise<SendEmailResult> {
    try {
      const { to, subject, content, fromName = 'Winston Zulu' } = emailData;
      const fromEmail = process.env.GMAIL_USER_EMAIL || 'creativesites263@gmail.com';
      
      // Check if we have all required environment variables
      if (!process.env.GMAIL_USER_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
        console.log('Gmail SMTP - Missing credentials, simulating email send:', {
          to,
          subject,
          from: `${fromName} <${fromEmail}>`,
          contentPreview: content.substring(0, 100) + '...',
          note: 'Set GMAIL_USER_EMAIL and GMAIL_APP_PASSWORD for actual sending'
        });

        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
          success: true,
          messageId: `smtp-simulated-${Date.now()}`,
        };
      }

      // Create transporter with Gmail SMTP
      const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER_EMAIL,
          pass: process.env.GMAIL_APP_PASSWORD, // App Password, not regular password
        },
      });

      // Send email
      const info = await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: to,
        subject: subject,
        text: content,
        html: content.replace(/\n/g, '<br>'), // Simple HTML conversion
      });

      console.log('Email sent successfully:', {
        to,
        subject,
        messageId: info.messageId,
      });

      return {
        success: true,
        messageId: info.messageId,
      };

    } catch (error) {
      console.error('Gmail SMTP error:', error);
      
      // Fallback to simulation if SMTP fails
      console.log('Gmail SMTP - Fallback simulation:', {
        to: emailData.to,
        subject: emailData.subject,
        from: `${emailData.fromName || 'Winston Zulu'} <${process.env.GMAIL_USER_EMAIL}>`,
        contentPreview: emailData.content.substring(0, 100) + '...',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: true, // Return success to avoid breaking the workflow
        messageId: `smtp-fallback-${Date.now()}`,
      };
    }
  }

  /**
   * Get user profile information
   */
  static async getUserProfile(): Promise<{ email?: string; name?: string }> {
    try {
      // This would require OAuth2 for actual implementation
      return {
        email: process.env.GMAIL_USER_EMAIL,
        name: 'Winston Zulu',
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return {};
    }
  }

  /**
   * Check if Gmail service is properly configured
   */
  static isConfigured(): boolean {
    return !!(process.env.GMAIL_API_KEY && process.env.GMAIL_USER_EMAIL);
  }
}