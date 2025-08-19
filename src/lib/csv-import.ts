import Papa from 'papaparse';
import { supabase } from '@/lib/supabase';
import type { Lead } from '@/lib/types';

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

export async function importCSVFile(file: File): Promise<{ success: boolean; message: string; importedCount?: number }> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const leads: Omit<Lead, 'id' | 'created_at' | 'updated_at'>[] = results.data.map((row: any) => ({
            company: row.company || '',
            industry: row.Industry || null,
            title: row.Title || null,
            first_name: row['First Name'] || null,
            last_name: row['Last Name'] || null,
            email: row.Emails || '',
            phone: row.phone || null,
            address: row.Address || null,
            city: row.City || null,
            state: row.State || null,
            zip_code: row['Zip code'] || null,
            website: row['Web Address'] || null,
            digital_dealer: row['digital dealer'] === 'yes',
            ai_score: null,
            qualification_notes: null,
            status: 'pending' as const,
          }));

          // Filter out rows with empty emails
          const validLeads = leads.filter(lead => lead.email && lead.email.trim() !== '');

          if (validLeads.length === 0) {
            resolve({ success: false, message: 'No valid email addresses found in the CSV file' });
            return;
          }

          // Insert leads into Supabase
          const { data, error } = await supabase
            .from('leads')
            .insert(validLeads)
            .select();

          if (error) {
            console.error('Error inserting leads:', error);
            resolve({ success: false, message: `Database error: ${error.message}` });
            return;
          }

          resolve({ 
            success: true, 
            message: `Successfully imported ${validLeads.length} leads`,
            importedCount: validLeads.length 
          });
        } catch (error) {
          console.error('Error processing CSV:', error);
          resolve({ success: false, message: 'Error processing CSV file' });
        }
      },
      error: (error) => {
        console.error('Papa Parse error:', error);
        resolve({ success: false, message: `CSV parsing error: ${error.message}` });
      }
    });
  });
}

export async function getLeadsCount(): Promise<number> {
  const { count, error } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    console.error('Error getting leads count:', error);
    return 0;
  }
  
  return count || 0;
}

export async function getLeads(limit = 100, offset = 0): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching leads:', error);
    return [];
  }

  return data || [];
}