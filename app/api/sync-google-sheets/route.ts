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
    const { sheetName } = await request.json();

    if (!sheetName) {
      return NextResponse.json(
        { error: 'Sheet name is required' },
        { status: 400 }
      );
    }

    // Initialize Google Sheets
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(
      process.env.GOOGLE_SPREADSHEET_ID!,
      serviceAccountAuth
    );

    await doc.loadInfo();

    // Get the specified sheet
    const sheet = doc.sheetsByTitle[sheetName];
    if (!sheet) {
      return NextResponse.json(
        { error: `Sheet "${sheetName}" not found` },
        { status: 404 }
      );
    }

    const rows = await sheet.getRows();

    // Filter rows where status is empty or 'pending'
    const pendingRows = rows.filter(row => {
      const status = row.get('status') || '';
      return status === '' || status.toLowerCase() === 'pending';
    });

    if (pendingRows.length === 0) {
      return NextResponse.json({
        message: 'No pending rows to sync',
        synced: 0
      });
    }

    // Get category by slug
    const categorySlug = pendingRows[0].get('audio-folder');
    console.log('Looking for category with slug:', categorySlug);

    const { data: category, error: categoryError } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();

    console.log('Category query result:', { category, error: categoryError });

    if (categoryError || !category) {
      return NextResponse.json(
        { error: `Category with slug "${categorySlug}" not found`, details: categoryError },
        { status: 404 }
      );
    }

    let syncedCount = 0;
    const errors: string[] = [];

    for (const row of pendingRows) {
      try {
        const sessionNumber = parseInt(row.get('number'));

        console.log('Processing row:', {
          number: sessionNumber,
          pattern_english: row.get('pattern_english'),
          pattern_korean: row.get('pattern_korean'),
          ex1_en: row.get('ex1_en'),
          ex1_kor: row.get('ex1_kor')
        });

        // Create or get session
        const { data: existingSession } = await supabaseAdmin
          .from('sessions')
          .select('id')
          .eq('category_id', category.id)
          .eq('session_number', sessionNumber)
          .single();

        let sessionId: string;

        if (existingSession) {
          sessionId = existingSession.id;
        } else {
          const { data: newSession, error: sessionError } = await supabaseAdmin
            .from('sessions')
            .insert({
              category_id: category.id,
              session_number: sessionNumber,
              title: row.get('pattern_english') || `Session ${sessionNumber}`,
              description: row.get('additional_explain') || null,
              pattern_english: row.get('pattern_english'),
              pattern_korean: row.get('pattern_korean')
            })
            .select('id')
            .single();

          if (sessionError) throw sessionError;
          sessionId = newSession.id;
        }

        // Insert expressions for this session (only examples, not the pattern itself)
        const expressions = [
          {
            session_id: sessionId,
            korean: row.get('ex1_kor'),
            english: row.get('ex1_en'),
            audio_url: row.get('ex1_filename'),
            display_order: 1,
            metadata: {}
          },
          {
            session_id: sessionId,
            korean: row.get('ex2_kor'),
            english: row.get('ex2_en'),
            audio_url: row.get('ex2_filename'),
            display_order: 2,
            metadata: {}
          }
        ].filter(exp => exp.english && exp.korean); // Only insert if both Korean and English exist

        // Delete existing expressions for this session
        await supabaseAdmin
          .from('expressions')
          .delete()
          .eq('session_id', sessionId);

        // Insert new expressions
        const { error: expressionsError } = await supabaseAdmin
          .from('expressions')
          .insert(expressions);

        if (expressionsError) throw expressionsError;

        // Update status to 'completed'
        row.set('status', 'completed');
        await row.save();

        syncedCount++;
      } catch (error) {
        console.error(`Error syncing row ${row.get('number')}:`, error);
        errors.push(`Row ${row.get('number')}: ${error}`);
      }
    }

    return NextResponse.json({
      message: `Successfully synced ${syncedCount} rows`,
      synced: syncedCount,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync data', details: String(error) },
      { status: 500 }
    );
  }
}
