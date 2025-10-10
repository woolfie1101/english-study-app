import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client with service role for bypassing RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: Request) {
  try {
    // Check if required environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Required environment variables not configured' },
        { status: 500 }
      );
    }

    const { sheetName } = await request.json();

    if (!sheetName) {
      return NextResponse.json(
        { error: 'Sheet name is required' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'API is working but Google Sheets integration is not fully configured',
      sheetName,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing'
    });

  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync data', details: String(error) },
      { status: 500 }
    );
  }
}
