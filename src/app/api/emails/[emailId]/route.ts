import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { emailId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { emailId } = params;

    // Get email details with lead information
    const { data: emailData, error: emailError } = await supabase
      .from('email_queue')
      .select(`
        *,
        leads (
          id,
          first_name,
          last_name,
          company,
          email,
          title,
          city,
          state,
          ai_score,
          qualification_notes
        )
      `)
      .eq('id', emailId)
      .eq('user_id', user.id)
      .single();

    if (emailError || !emailData) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    // Get email responses (simulated for now - would come from email provider webhook)
    // In a real implementation, this would query an email_responses table
    const mockResponses = [];

    // Format response
    const emailThread = {
      id: emailData.id,
      lead_id: emailData.lead_id,
      subject: emailData.subject,
      content: emailData.content,
      email_type: emailData.email_type,
      status: emailData.status,
      sent_at: emailData.sent_at,
      created_at: emailData.created_at,
      lead: emailData.leads,
      responses: mockResponses
    };

    return NextResponse.json(emailThread);
  } catch (error) {
    console.error('Error fetching email details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}