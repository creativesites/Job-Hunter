import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create default follow-up sequences
    const defaultSequences = [
      {
        name: 'Initial Outreach Sequence',
        description: 'A proven 3-step sequence for first-time contacts at automotive dealerships',
        steps: [
          {
            delay_days: 0,
            subject_template: 'Exploring Career Opportunities at [Company]',
            content_template: `Hi [FirstName],

I hope this message finds you well. I came across [Company] and was impressed by your operations in [City], [State].

As an automotive industry professional with extensive experience in dealership operations and customer relations, I'm actively exploring opportunities where I can contribute to continued success and growth.

My background includes:
• Sales and customer relationship management
• Dealership operations and process optimization
• Digital marketing and lead generation
• Team leadership and training

I would welcome the chance to discuss how my experience could benefit [Company]. Would you be open to a brief conversation about potential opportunities within your organization?

Thank you for your time and consideration.

Best regards,
Winston Zulu`,
            condition: 'always',
            active: true
          },
          {
            delay_days: 3,
            subject_template: 'Following Up: Career Opportunities at [Company]',
            content_template: `Hi [FirstName],

I wanted to follow up on my previous message from a few days ago regarding potential career opportunities at [Company].

I understand you're likely very busy managing daily operations, but I remain genuinely interested in exploring how I might contribute to your team's continued success.

If now isn't the right time, I completely understand. However, if you have just a few minutes for a brief conversation in the coming weeks, I would greatly appreciate the opportunity to learn more about [Company] and discuss how my background might align with your needs.

Would a quick 10-15 minute call be possible sometime this week or next?

Thank you for your consideration,
Winston Zulu`,
            condition: 'no_response',
            active: true
          },
          {
            delay_days: 7,
            subject_template: 'Final Follow-Up: [Company] Opportunities',
            content_template: `Hi [FirstName],

This will be my final message regarding opportunities at [Company]. I don't want to be pushy, but I wanted to reach out one last time.

I truly believe my automotive industry experience and passion for excellence would be a valuable addition to your team. If you ever have openings that might be a good fit, I would love to hear from you.

If not, I completely understand and wish you and [Company] continued success.

Thank you for your time,
Winston Zulu`,
            condition: 'no_response',
            active: true
          }
        ]
      },
      {
        name: 'Re-engagement Campaign',
        description: 'A gentle 2-step sequence to re-engage leads after 30+ days of no contact',
        steps: [
          {
            delay_days: 0,
            subject_template: 'Checking In: Still Interested in New Opportunities?',
            content_template: `Hi [FirstName],

I hope you're doing well. I wanted to check in and see if anything has changed regarding potential opportunities at [Company].

The automotive industry is constantly evolving, and I've been keeping up with the latest trends in digital marketing, customer experience, and operational efficiency that might be relevant to your business.

If you're still not looking to expand your team, no worries at all. But if circumstances have changed or you know of other dealerships who might benefit from my experience, I'd appreciate any guidance you could share.

Hope you're having a great week!

Best regards,
Winston Zulu`,
            condition: 'always',
            active: true
          },
          {
            delay_days: 5,
            subject_template: 'One Last Check-In: [Company]',
            content_template: `Hi [FirstName],

I don't want to keep bothering you, but I wanted to send one final note to thank you for your time and let you know that I'm still interested in opportunities within the automotive industry.

If anything changes at [Company] or you hear of other dealerships looking for experienced professionals, I'd be grateful if you kept me in mind.

Wishing you and your team all the best,
Winston Zulu`,
            condition: 'no_response',
            active: true
          }
        ]
      },
      {
        name: 'High-Value Leads Sequence',
        description: 'An intensive 4-step sequence for highly qualified leads and decision makers',
        steps: [
          {
            delay_days: 0,
            subject_template: 'Automotive Industry Partnership Opportunity - [Company]',
            content_template: `Hi [FirstName],

I've been researching successful automotive dealerships in [State], and [Company] consistently stands out as a leader in the market.

As someone with [YearsExperience]+ years in automotive sales and operations, I'm specifically looking to partner with forward-thinking dealerships like yours that value innovation and customer excellence.

I'd love to share some insights about recent industry trends that could benefit [Company], and discuss how my background in [Skills] might align with your strategic goals.

Would you be open to a brief 15-minute conversation this week? I believe we could explore some mutually beneficial opportunities.

Best regards,
Winston Zulu`,
            condition: 'always',
            active: true
          },
          {
            delay_days: 2,
            subject_template: 'Industry Insights for [Company] + Partnership Discussion',
            content_template: `Hi [FirstName],

Following up on my previous message - I wanted to share a quick insight that might be relevant to [Company].

Recent data shows that dealerships implementing advanced CRM systems and digital marketing strategies are seeing 23% higher customer retention and 31% improved lead conversion rates.

Given [Company]'s reputation for excellence, I thought this might align with your growth objectives. I'd love to discuss how my experience in these areas could contribute to your continued success.

Are you available for a brief call this week?

Best regards,
Winston Zulu`,
            condition: 'no_response',
            active: true
          },
          {
            delay_days: 5,
            subject_template: 'Specific Value Proposition for [Company]',
            content_template: `Hi [FirstName],

I wanted to reach out one more time with a specific value proposition for [Company].

Based on my research, I believe I could help [Company] in three key areas:
1. Enhanced customer experience programs
2. Digital marketing optimization
3. Sales process improvements

These initiatives typically result in 15-25% increased revenue within the first year. I have a proven track record of implementing similar strategies in the automotive sector.

Would you have 20 minutes this week to discuss how this might benefit [Company]?

Best regards,
Winston Zulu`,
            condition: 'no_response',
            active: true
          },
          {
            delay_days: 10,
            subject_template: 'Final Outreach: [Company] Partnership',
            content_template: `Hi [FirstName],

This will be my final outreach regarding potential opportunities with [Company].

I have tremendous respect for what you've built at [Company], and while the timing might not be right now, I wanted to leave my contact information in case circumstances change in the future.

If you ever need someone with deep automotive industry experience and a track record of driving results, please don't hesitate to reach out.

Thank you for your time, and I wish you continued success.

Best regards,
Winston Zulu`,
            condition: 'no_response',
            active: true
          }
        ]
      }
    ];

    // In a real implementation, these would be saved to the database
    // For now, we'll just return them as created
    return NextResponse.json({ 
      message: 'Default sequences created successfully',
      sequences: defaultSequences 
    });

  } catch (error) {
    console.error('Error creating default sequences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}