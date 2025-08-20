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

    // Mock enrollments data
    const mockEnrollments = [
      {
        id: '1',
        lead_id: 'lead-1',
        sequence_id: '1',
        current_step: 1,
        status: 'active',
        next_send_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
        last_sent_date: new Date().toISOString(),
        lead: {
          first_name: 'John',
          last_name: 'Smith',
          company: 'Smith Auto Group',
          email: 'john.smith@smithauto.com'
        }
      },
      {
        id: '2',
        lead_id: 'lead-2',
        sequence_id: '1',
        current_step: 0,
        status: 'active',
        next_send_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
        last_sent_date: new Date().toISOString(),
        lead: {
          first_name: 'Sarah',
          last_name: 'Johnson',
          company: 'Johnson Motors',
          email: 'sarah@johnsonmotors.com'
        }
      },
      {
        id: '3',
        lead_id: 'lead-3',
        sequence_id: '1',
        current_step: 2,
        status: 'completed',
        next_send_date: new Date().toISOString(),
        last_sent_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        lead: {
          first_name: 'Mike',
          last_name: 'Davis',
          company: 'Davis Automotive',
          email: 'mike@davisauto.com'
        }
      },
      {
        id: '4',
        lead_id: 'lead-4',
        sequence_id: '2',
        current_step: 0,
        status: 'paused',
        next_send_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Overdue
        last_sent_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        lead: {
          first_name: 'Lisa',
          last_name: 'Wilson',
          company: 'Wilson Car Sales',
          email: 'lisa@wilsoncars.com'
        }
      }
    ];

    return NextResponse.json(mockEnrollments);
  } catch (error) {
    console.error('Error fetching sequence enrollments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}