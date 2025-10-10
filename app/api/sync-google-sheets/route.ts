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

    // Map audio-folder to category slug
    const audioFolder = pendingRows[0].get('audio-folder');
    const categorySlugMap: Record<string, string> = {
      'daily': 'daily-expression',
      'news': 'news-expression'
    };
    const categorySlug = categorySlugMap[audioFolder] || audioFolder;
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

        const audioFolder = row.get('audio-folder');
        const isNewsCategory = audioFolder === 'news';
        // Construct full audio path: audio-folder/filename
        const patternAudioUrl = isNewsCategory
          ? `${audioFolder}/${row.get('filename')}`
          : null;

        if (existingSession) {
          sessionId = existingSession.id;
          // Update session with new data including pattern audio for News
          await supabaseAdmin
            .from('sessions')
            .update({
              title: row.get('pattern_english') || `Session ${sessionNumber}`,
              description: row.get('additional_explain') || null,
              pattern_english: row.get('pattern_english'),
              pattern_korean: row.get('pattern_korean'),
              metadata: patternAudioUrl ? { pattern_audio_url: patternAudioUrl } : {}
            })
            .eq('id', sessionId);
        } else {
          const { data: newSession, error: sessionError } = await supabaseAdmin
            .from('sessions')
            .insert({
              category_id: category.id,
              session_number: sessionNumber,
              title: row.get('pattern_english') || `Session ${sessionNumber}`,
              description: row.get('additional_explain') || null,
              pattern_english: row.get('pattern_english'),
              pattern_korean: row.get('pattern_korean'),
              metadata: patternAudioUrl ? { pattern_audio_url: patternAudioUrl } : {}
            })
            .select('id')
            .single();

          if (sessionError) throw sessionError;
          sessionId = newSession.id;
        }

        // Insert expressions for this session
        // For News: pattern-level audio, ex1-ex6 examples
        // For Daily: individual audio files per example
        const expressions = [];

        if (isNewsCategory) {
          // News Expression: 6 examples without individual audio
          for (let i = 1; i <= 6; i++) {
            const english = row.get(`ex${i}_en`);
            const korean = row.get(`ex${i}_kor`);
            if (english && korean) {
              expressions.push({
                session_id: sessionId,
                korean,
                english,
                audio_url: null, // No individual audio for News examples
                display_order: i,
                metadata: {}
              });
            }
          }
        } else {
          // Daily Expression: 2 examples with individual audio
          // Construct full audio path: audio-folder/filename
          const ex1Filename = row.get('ex1_filename');
          const ex2Filename = row.get('ex2_filename');

          expressions.push(
            {
              session_id: sessionId,
              korean: row.get('ex1_kor'),
              english: row.get('ex1_en'),
              audio_url: ex1Filename ? `${audioFolder}/${ex1Filename}` : null,
              display_order: 1,
              metadata: {}
            },
            {
              session_id: sessionId,
              korean: row.get('ex2_kor'),
              english: row.get('ex2_en'),
              audio_url: ex2Filename ? `${audioFolder}/${ex2Filename}` : null,
              display_order: 2,
              metadata: {}
            }
          );
        }

        const validExpressions = expressions.filter(exp => exp.english && exp.korean);

        // Delete existing expressions for this session
        await supabaseAdmin
          .from('expressions')
          .delete()
          .eq('session_id', sessionId);

        // Insert new expressions
        if (validExpressions.length > 0) {
          const { error: expressionsError } = await supabaseAdmin
            .from('expressions')
            .insert(validExpressions);

          if (expressionsError) throw expressionsError;
        }

        // Update status to 'completed'
        row.set('status', 'completed');
        await row.save();

        syncedCount++;
      } catch (error) {
        console.error(`Error syncing row ${row.get('number')}:`, error);
        errors.push(`Row ${row.get('number')}: ${error}`);
      }
    }

    // Update daily_study_stats after syncing
    if (syncedCount > 0) {
      try {
        // Get all categories with their session counts
        const { data: categories, error: categoriesError } = await supabaseAdmin
          .from('categories')
          .select('id');

        if (categoriesError) throw categoriesError;

        // Update stats for each category
        for (const cat of categories || []) {
          // Get total sessions for this category
          const { count: totalSessions } = await supabaseAdmin
            .from('sessions')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', cat.id);

          // Get completed sessions for this category
          const { count: completedSessions } = await supabaseAdmin
            .from('user_session_progress')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', '00000000-0000-0000-0000-000000000001')
            .eq('category_id', cat.id)
            .eq('status', 'completed');

          // Upsert daily stats for today
          await supabaseAdmin
            .from('daily_study_stats')
            .upsert({
              user_id: '00000000-0000-0000-0000-000000000001',
              category_id: cat.id,
              study_date: new Date().toISOString().split('T')[0],
              sessions_completed: completedSessions || 0,
              total_sessions: totalSessions || 0
            }, {
              onConflict: 'user_id,category_id,study_date'
            });
        }
      } catch (statsError) {
        console.error('Error updating daily stats:', statsError);
        // Don't fail the whole operation if stats update fails
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
