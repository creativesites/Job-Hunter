import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Lead } from './types';
import { UserSettingsService } from './user-settings';

// Initialize Gemini AI
const gemini = new GoogleGenerativeAI(process.env.GENKIT_API_KEY || '');
const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });

// xAI API using OpenAI-compatible endpoint
async function callXAI(prompt: string): Promise<string> {
  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`xAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('xAI API error:', error);
    throw error;
  }
}

// Lead qualification scoring system
export async function qualifyLead(lead: Lead): Promise<{ score: number; reasoning: string }> {
  const prompt = `
As an automotive industry recruitment specialist, analyze this dealership lead for job search outreach potential.

Lead Details:
- Company: ${lead.company}
- Title: ${lead.title || 'N/A'}
- Name: ${lead.first_name} ${lead.last_name}
- Location: ${lead.city}, ${lead.state}
- Industry: ${lead.industry || 'Automotive Dealership'}
- Digital Dealer Conference: ${lead.digital_dealer ? 'Yes' : 'No'}

Score this lead from 1-100 for job search outreach potential based on:
1. Title seniority (decision-making authority for hiring)
2. Company type and size indicators
3. Geographic desirability
4. Digital engagement (conference attendance)
5. Overall hiring likelihood

Provide:
1. A score (1-100)
2. Brief reasoning (2-3 sentences max)

Format your response as:
Score: [number]
Reasoning: [explanation]
`;

  try {
    // Try Gemini first
    if (process.env.GENKIT_API_KEY) {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      return parseAIResponse(text);
    }
    
    // Fallback to xAI if Gemini fails
    if (process.env.XAI_API_KEY) {
      const response = await callXAI(prompt);
      return parseAIResponse(response);
    }
    
    throw new Error('No AI API keys configured');
  } catch (error) {
    console.error('AI qualification error:', error);
    // Return a basic score based on title if AI fails
    return {
      score: getBasicScore(lead),
      reasoning: 'Basic scoring applied due to AI service unavailable'
    };
  }
}

// Parse AI response to extract score and reasoning
function parseAIResponse(text: string): { score: number; reasoning: string } {
  const scoreMatch = text.match(/Score:\s*(\d+)/i);
  const reasoningMatch = text.match(/Reasoning:\s*(.+?)(?:\n|$)/i);
  
  const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;
  const reasoning = reasoningMatch ? reasoningMatch[1].trim() : 'Standard evaluation based on profile';
  
  return {
    score: Math.max(1, Math.min(100, score)), // Ensure score is between 1-100
    reasoning
  };
}

// Basic scoring fallback
function getBasicScore(lead: Lead): number {
  let score = 50; // Base score
  
  const title = (lead.title || '').toLowerCase();
  
  // Title-based scoring
  if (title.includes('owner') || title.includes('president') || title.includes('ceo')) {
    score += 30;
  } else if (title.includes('general manager') || title.includes('gm')) {
    score += 25;
  } else if (title.includes('manager') || title.includes('director')) {
    score += 20;
  } else if (title.includes('dealer')) {
    score += 15;
  }
  
  // Digital engagement bonus
  if (lead.digital_dealer) {
    score += 10;
  }
  
  // Location considerations (can be expanded)
  const state = (lead.state || '').toLowerCase();
  if (['ca', 'tx', 'ny', 'fl'].includes(state)) {
    score += 5; // Major markets
  }
  
  return Math.max(1, Math.min(100, score));
}

// Generate personalized email content with user context
export async function generateEmailContent(
  lead: Lead, 
  emailType: 'introduction' | 'follow-up' = 'introduction',
  userId?: string
): Promise<string> {
  // Get user context if userId provided
  let userContext = '';
  if (userId) {
    try {
      userContext = await UserSettingsService.getAIContext(userId);
    } catch (error) {
      console.error('Error getting user context:', error);
    }
  }

  const prompt = `
You are writing a highly personalized, strategic cold outreach email for a job search in the automotive industry. This email must be crafted to maximize response rates by being genuinely personal, relevant, and compelling.

CANDIDATE PROFILE:
${userContext ? userContext : `
Name: Winston Zulu
Background: Automotive industry professional with experience in dealership operations, customer relations, and team leadership.
Skills: Sales, customer relationship management, dealership operations, digital marketing, team leadership
Experience: Several years in automotive industry
`}

TARGET LEAD:
- Name: ${lead.first_name} ${lead.last_name}
- Company: ${lead.company}
- Title: ${lead.title || 'Decision Maker'}
- Location: ${lead.city}, ${lead.state}
- Industry: Automotive Dealership
- Context: This is a ${emailType} email

STRATEGIC REQUIREMENTS:
1. **Position Matching**: Based on the candidate's profile, identify the MOST RELEVANT position this lead would likely be hiring for (Sales Manager, General Manager, F&I Manager, Service Manager, etc.)

2. **Value Proposition**: Create 2-3 specific value propositions that directly address common pain points for someone in the lead's position

3. **Local Connection**: Reference something specific about their market/location that shows research

4. **Credibility**: Include 1-2 specific achievements or experiences that would impress this particular lead

5. **Personalization**: Use the lead's actual name and company naturally throughout

6. **Strategic Timing**: If follow-up, reference a logical reason for following up

CRITICAL SUCCESS FACTORS:
- Must sound like it was written specifically for this person
- Should feel like you've researched their company and role
- Include specific numbers or achievements when possible  
- Address a real business need they likely have
- Show understanding of their industry challenges
- Professional but conversational tone
- Maximum 200 words
- End with a specific, low-pressure call to action

Generate ONLY the email body content (no subject, no signature). Make this email stand out from the hundreds of generic applications they receive.`;

  try {
    if (process.env.GENKIT_API_KEY) {
      const result = await model.generateContent(prompt);
      return result.response.text();
    }
    
    if (process.env.XAI_API_KEY) {
      return await callXAI(prompt);
    }
    
    // Fallback template
    return generateEmailTemplate(lead, emailType);
  } catch (error) {
    console.error('AI email generation error:', error);
    return generateEmailTemplate(lead, emailType);
  }
}

// Fallback email template
function generateEmailTemplate(lead: Lead, emailType: 'introduction' | 'follow-up'): string {
  const firstName = lead.first_name || 'there';
  
  if (emailType === 'introduction') {
    return `Dear ${firstName},

I hope this message finds you well. I came across ${lead.company} and was impressed by your operations in ${lead.city}.

As an automotive industry professional with a strong background in dealership operations, I'm actively exploring new opportunities where I can contribute to continued success and growth.

I would welcome the chance to discuss how my experience could benefit ${lead.company}. Would you be open to a brief conversation about potential opportunities within your organization?

Thank you for your time and consideration.

Best regards,
[Your Name]`;
  } else {
    return `Hi ${firstName},

I wanted to follow up on my previous message regarding potential opportunities at ${lead.company}.

I understand you're likely busy, but I remain very interested in exploring how I might contribute to your team's continued success.

Would you have a few minutes for a quick call this week?

Best regards,
[Your Name]`;
  }
}

// Analyze response sentiment and interest level
export async function analyzeResponse(responseText: string): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral';
  interestLevel: 'hot' | 'warm' | 'cold' | 'not_interested';
  aiAnalysis: string;
}> {
  const prompt = `
Analyze this email response for sentiment and interest level:

"${responseText}"

Classify:
1. Sentiment: positive, negative, or neutral
2. Interest Level: hot (very interested), warm (somewhat interested), cold (polite but uninterested), not_interested (clearly not interested)
3. Brief analysis (1-2 sentences)

Format:
Sentiment: [classification]
Interest: [classification]  
Analysis: [explanation]
`;

  try {
    let response = '';
    if (process.env.GENKIT_API_KEY) {
      const result = await model.generateContent(prompt);
      response = result.response.text();
    } else if (process.env.XAI_API_KEY) {
      response = await callXAI(prompt);
    }

    const sentimentMatch = response.match(/Sentiment:\s*(\w+)/i);
    const interestMatch = response.match(/Interest:\s*(\w+)/i);
    const analysisMatch = response.match(/Analysis:\s*(.+?)(?:\n|$)/i);

    return {
      sentiment: (sentimentMatch?.[1]?.toLowerCase() as any) || 'neutral',
      interestLevel: (interestMatch?.[1]?.toLowerCase() as any) || 'cold',
      aiAnalysis: analysisMatch?.[1]?.trim() || 'Standard response analysis'
    };
  } catch (error) {
    console.error('Response analysis error:', error);
    
    // Basic fallback analysis
    const text = responseText.toLowerCase();
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    let interestLevel: 'hot' | 'warm' | 'cold' | 'not_interested' = 'cold';

    if (text.includes('interested') || text.includes('discuss') || text.includes('call')) {
      sentiment = 'positive';
      interestLevel = 'warm';
    } else if (text.includes('not interested') || text.includes('no thank')) {
      sentiment = 'negative';
      interestLevel = 'not_interested';
    }

    return {
      sentiment,
      interestLevel,
      aiAnalysis: 'Basic keyword analysis applied'
    };
  }
}