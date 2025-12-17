import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
// File system imports removed - using simulated storage for demo

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.formData();
    const file: File | null = data.get('cv') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Please upload PDF, DOC, DOCX, or TXT files only.' 
      }, { status: 400 });
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 5MB.' 
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // For now, let's simulate file storage and store the file info in database
    // In production, you'd upload to cloud storage (AWS S3, Supabase Storage, etc.)
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `cv_${user.id}_${timestamp}.${fileExtension}`;
    
    // For demo purposes, we'll just store the file name and simulate the upload
    // In production, you would:
    // 1. Upload to Supabase Storage
    // 2. Get the public URL
    // 3. Store that URL in the database
    
    console.log('Simulating CV upload:', {
      originalName: file.name,
      size: file.size,
      type: file.type,
      simulatedFileName: fileName
    });

    // Simulate file URL (in production this would be the actual cloud storage URL)
    const fileUrl = `/api/placeholder-cv/${fileName}`;

    // Update user settings with CV information
    // First check if user settings exist
    const { data: existingSettings } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let updateError;
    if (existingSettings) {
      // Update existing record
      const { error } = await supabase
        .from('user_settings')
        .update({
          cv_file_url: fileUrl,
          cv_file_name: file.name,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
      updateError = error;
    } else {
      // Insert new record
      const { error } = await supabase
        .from('user_settings')
        .insert({
          user_id: user.id,
          cv_file_url: fileUrl,
          cv_file_name: file.name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      updateError = error;
    }

    if (updateError) {
      console.error('Error updating user settings:', updateError);
      return NextResponse.json({ 
        error: 'Failed to save CV information',
        details: updateError.message 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'CV uploaded successfully',
      fileName: file.name,
      fileUrl: fileUrl,
      fileSize: file.size,
    });

  } catch (error) {
    console.error('CV upload error:', error);
    return NextResponse.json({
      error: 'Failed to upload CV',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current CV info
    const { data: settings, error: fetchError } = await supabase
      .from('user_settings')
      .select('cv_file_url, cv_file_name')
      .eq('user_id', user.id)
      .single();

    if (fetchError || !settings?.cv_file_url) {
      return NextResponse.json({ error: 'No CV found to delete' }, { status: 404 });
    }

    // Update user settings to remove CV
    const { error: updateError } = await supabase
      .from('user_settings')
      .update({
        cv_file_url: null,
        cv_file_name: null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error removing CV from settings:', updateError);
      return NextResponse.json({ 
        error: 'Failed to remove CV information' 
      }, { status: 500 });
    }

    // Note: In production, you'd also delete the actual file from storage
    // For now, we'll just remove the reference

    return NextResponse.json({
      success: true,
      message: 'CV removed successfully',
    });

  } catch (error) {
    console.error('CV delete error:', error);
    return NextResponse.json({
      error: 'Failed to delete CV',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}