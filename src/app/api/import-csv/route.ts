import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { qualifyLead } from '@/lib/ai-service';
import Papa from 'papaparse';
import fs from 'fs/promises';
import path from 'path';

interface CSVRow {
  company: string;
  Industry: string;
  Title: string;
  'First Name': string;
  'Last Name': string;
  Emails: string;
  Address: string;
  City: string;
  State: string;
  'Zip code': string;
  'Web Address': string;
  phone: string;
  'digital dealer': string;
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Import the CSV file from contacts directory
    const csvPath = path.join(process.cwd(), 'contacts', 'digital-dealer-donference-attendee.csv');
    
    try {
      const csvContent = await fs.readFile(csvPath, 'utf-8');
      
      const { data } = Papa.parse<CSVRow>(csvContent, {
        header: true,
        skipEmptyLines: true,
      });

      let importedCount = 0;
      let errorCount = 0;

      for (const row of data) {
        try {
          // Skip rows without email
          if (!row.Emails || row.Emails.trim() === '') {
            continue;
          }

          // Create lead object
          const leadData = {
            company: row.company || '',
            industry: row.Industry || null,
            title: row.Title || null,
            first_name: row['First Name'] || null,
            last_name: row['Last Name'] || null,
            email: row.Emails.trim(),
            phone: row.phone || null,
            address: row.Address || null,
            city: row.City || null,
            state: row.State || null,
            zip_code: row['Zip code'] || null,
            website: row['Web Address'] || null,
            digital_dealer: row['digital dealer'] === 'yes',
            status: 'pending' as const,
          };

          // Check if lead already exists
          const { data: existingLead } = await supabase
            .from('leads')
            .select('id')
            .eq('email', leadData.email)
            .single();

          if (existingLead) {
            continue; // Skip if lead already exists
          }

          // Insert lead first
          const { data: insertedLead, error: insertError } = await supabase
            .from('leads')
            .insert(leadData)
            .select()
            .single();

          if (insertError) {
            console.error('Error inserting lead:', insertError);
            errorCount++;
            continue;
          }

          // Get AI qualification (async, don't wait for it)
          qualifyLead(insertedLead).then(async ({ score, reasoning }) => {
            await supabase
              .from('leads')
              .update({
                ai_score: score,
                qualification_notes: reasoning,
              })
              .eq('id', insertedLead.id);
          }).catch(err => {
            console.error('AI qualification error for lead:', insertedLead.id, err);
          });

          importedCount++;
        } catch (rowError) {
          console.error('Error processing row:', rowError);
          errorCount++;
        }
      }

      return NextResponse.json({
        success: true,
        message: `Successfully imported ${importedCount} leads${errorCount > 0 ? ` (${errorCount} errors)` : ''}`,
        importedCount,
        errorCount,
      });

    } catch (fileError) {
      console.error('Error reading CSV file:', fileError);
      return NextResponse.json({
        error: 'CSV file not found or could not be read',
        details: fileError instanceof Error ? fileError.message : 'Unknown error'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Import API error:', error);
    return NextResponse.json({
      error: 'Failed to import CSV data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint to check import status
export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { count: totalLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });

    const { count: qualifiedLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .not('ai_score', 'is', null);

    return NextResponse.json({
      totalLeads: totalLeads || 0,
      qualifiedLeads: qualifiedLeads || 0,
      pendingQualification: (totalLeads || 0) - (qualifiedLeads || 0),
    });

  } catch (error) {
    console.error('Import status API error:', error);
    return NextResponse.json({
      error: 'Failed to get import status'
    }, { status: 500 });
  }
}