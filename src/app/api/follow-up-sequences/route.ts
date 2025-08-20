import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, return mock data since we haven't created the tables yet
    // In a real implementation, this would query the database
    const mockSequences = [
      {
        id: '1',
        name: 'Initial Outreach Sequence',
        description: 'A 3-step sequence for first-time contacts at automotive dealerships',
        active: true,
        steps: [
          {
            id: '1-1',
            sequence_id: '1',
            step_number: 1,
            delay_days: 0,
            subject_template: 'Exploring Career Opportunities at [Company]',
            content_template: 'Hi [FirstName], I\'m reaching out regarding potential opportunities at [Company]...',
            condition: 'always',
            active: true
          },
          {
            id: '1-2',
            sequence_id: '1',
            step_number: 2,
            delay_days: 3,
            subject_template: 'Following Up: Career Opportunities at [Company]',
            content_template: 'Hi [FirstName], I wanted to follow up on my previous message...',
            condition: 'no_response',
            active: true
          },
          {
            id: '1-3',
            sequence_id: '1',
            step_number: 3,
            delay_days: 7,
            subject_template: 'Final Follow-Up: [Company] Opportunities',
            content_template: 'Hi [FirstName], This will be my final message regarding opportunities...',
            condition: 'no_response',
            active: true
          }
        ],
        leads_enrolled: 45,
        completion_rate: 78.5,
        response_rate: 12.3,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Re-engagement Campaign',
        description: 'A 2-step sequence to re-engage cold leads after 30 days',
        active: false,
        steps: [
          {
            id: '2-1',
            sequence_id: '2',
            step_number: 1,
            delay_days: 0,
            subject_template: 'Checking In: Still Interested in New Opportunities?',
            content_template: 'Hi [FirstName], I hope you\'re doing well. I wanted to check in...',
            condition: 'always',
            active: true
          },
          {
            id: '2-2',
            sequence_id: '2',
            step_number: 2,
            delay_days: 5,
            subject_template: 'One Last Check-In at [Company]',
            content_template: 'Hi [FirstName], I don\'t want to be pushy, but...',
            condition: 'no_response',
            active: true
          }
        ],
        leads_enrolled: 23,
        completion_rate: 65.2,
        response_rate: 8.7,
        created_at: new Date().toISOString()
      }
    ];

    return NextResponse.json(mockSequences);
  } catch (error) {
    console.error('Error fetching follow-up sequences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, steps } = await request.json();

    // In a real implementation, this would create the sequence in the database
    const newSequence = {
      id: Date.now().toString(),
      name,
      description,
      active: true,
      steps: steps.map((step: any, index: number) => ({
        ...step,
        id: `${Date.now()}-${index}`,
        step_number: index + 1
      })),
      leads_enrolled: 0,
      completion_rate: 0,
      response_rate: 0,
      created_at: new Date().toISOString()
    };

    return NextResponse.json(newSequence, { status: 201 });
  } catch (error) {
    console.error('Error creating follow-up sequence:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}