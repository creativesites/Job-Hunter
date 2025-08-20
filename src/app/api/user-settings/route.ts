import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { UserSettingsService, UpdateUserSettingsData } from '@/lib/user-settings';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await UserSettingsService.getUserSettings(user.id);
    
    if (!settings) {
      return NextResponse.json({ error: 'Failed to get user settings' }, { status: 500 });
    }

    return NextResponse.json(settings);

  } catch (error) {
    console.error('Get user settings error:', error);
    return NextResponse.json({
      error: 'Failed to get user settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates: UpdateUserSettingsData = await request.json();

    // Validate the updates
    if (updates.daily_email_limit !== undefined && updates.daily_email_limit < 1) {
      return NextResponse.json({ 
        error: 'Daily email limit must be at least 1' 
      }, { status: 400 });
    }

    if (updates.email_provider && !['gmail', 'resend'].includes(updates.email_provider)) {
      return NextResponse.json({ 
        error: 'Email provider must be either "gmail" or "resend"' 
      }, { status: 400 });
    }

    const updatedSettings = await UserSettingsService.updateUserSettings(user.id, updates);
    
    if (!updatedSettings) {
      return NextResponse.json({ error: 'Failed to update user settings' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'User settings updated successfully',
      settings: updatedSettings,
    });

  } catch (error) {
    console.error('Update user settings error:', error);
    return NextResponse.json({
      error: 'Failed to update user settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}