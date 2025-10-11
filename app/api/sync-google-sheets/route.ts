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
    // For RealTalkExamples sheet, always use real-talk-examples category
    // even if audio-folder is 'conversational' (since they share the same audio folder)
    let categorySlug: string;
    if (sheetName === 'ConversationalEx') {
      categorySlug = 'real-talk-examples';
    } else if (sheetName === 'Shadowing') {
      categorySlug = 'shadowing';
    } else {
      const audioFolder = pendingRows[0].get('audio-folder');
      const categorySlugMap: Record<string, string> = {
        'daily': 'daily-phrases',
        'news': 'news-phrases',
        'conversational': 'real-talk',
        'shadowing': 'shadowing'
      };
      categorySlug = categorySlugMap[audioFolder] || audioFolder;
    }
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
        const audioFolder = row.get('audio-folder');
        const imageFolder = row.get('image-folder') || audioFolder; // Default to audio folder if not specified
        const isNewsCategory = audioFolder === 'news';
        const isConversationalCategory = audioFolder === 'conversational' && sheetName === 'Conversational';
        const isConversationalExCategory = sheetName === 'ConversationalEx';
        const isShadowingCategory = sheetName === 'Shadowing';

        console.log('Processing row:', {
          number: sessionNumber,
          category: row.get('category'),
          audio_folder: audioFolder,
          sheet_name: sheetName,
          isConversationalEx: isConversationalExCategory,
          pattern_english: row.get('pattern_english'),
          pattern_korean: row.get('pattern_korean'),
          contents_json: row.get('contents_json') ? 'present' : 'missing',
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

        // Construct metadata based on category type
        const metadata: any = {};

        // Add pattern audio for News, Conversational, ConversationalEx, and Shadowing
        if (isNewsCategory || isConversationalCategory || isConversationalExCategory || isShadowingCategory) {
          const filename = row.get('filename');
          if (filename) {
            metadata.pattern_audio_url = `${audioFolder}/${filename}`;
          }
        }

        // Add images for Conversational
        if (isConversationalCategory) {
          const images: string[] = [];
          const image1 = row.get('image1');
          const image2 = row.get('image2');

          if (image1) images.push(`${imageFolder}/${image1}`);
          if (image2) images.push(`${imageFolder}/${image2}`);

          if (images.length > 0) {
            metadata.images = images;
          }
        }

        // Add conversational_num for ConversationalEx
        if (isConversationalExCategory) {
          const conversationalNum = row.get('conversational_num');
          if (conversationalNum) {
            metadata.conversational_num = parseInt(conversationalNum);
          }
        }

        // For Conversational, ConversationalEx, and Shadowing, use category name as title since there's no pattern
        const sessionTitle = (isConversationalCategory || isConversationalExCategory || isShadowingCategory)
          ? row.get('category') || `Session ${sessionNumber}`
          : row.get('pattern_english') || `Session ${sessionNumber}`;

        const sessionData = {
          title: sessionTitle,
          description: row.get('additional_explain') || null,
          pattern_english: (isConversationalCategory || isConversationalExCategory || isShadowingCategory) ? null : row.get('pattern_english'),
          pattern_korean: (isConversationalCategory || isConversationalExCategory || isShadowingCategory) ? null : row.get('pattern_korean'),
          metadata
        };

        if (existingSession) {
          sessionId = existingSession.id;
          // Update session with new data
          await supabaseAdmin
            .from('sessions')
            .update(sessionData)
            .eq('id', sessionId);
        } else {
          const { data: newSession, error: sessionError } = await supabaseAdmin
            .from('sessions')
            .insert({
              category_id: category.id,
              session_number: sessionNumber,
              ...sessionData
            })
            .select('id')
            .single();

          if (sessionError) throw sessionError;
          sessionId = newSession.id;
        }

        // Insert expressions for this session
        // For News: pattern-level audio, ex1-ex6 examples
        // For Conversational: pattern-level audio, JSON contents_json
        // For ConversationalEx: pattern-level audio, JSON contents_json (similar to Conversational)
        // For Shadowing: pattern-level audio, JSON contents_json (similar to Conversational)
        // For Daily: individual audio files per example
        const expressions = [];

        if (isConversationalCategory || isConversationalExCategory || isShadowingCategory) {
          // Conversational/Shadowing Expression: parse JSON contents
          const contentsJson = row.get('contents_json');
          console.log('Raw contents_json:', contentsJson);

          if (contentsJson) {
            try {
              const contents = JSON.parse(contentsJson);
              console.log('Parsed contents:', contents);
              console.log('Contents type:', Array.isArray(contents) ? 'array' : typeof contents);
              console.log('Contents length:', contents.length);

              contents.forEach((item: any, index: number) => {
                console.log(`Item ${index}:`, item);
                // Each item in the array has one ex pair (ex1_en/ex1_kor, ex2_en/ex2_kor, etc.)
                // Find which ex number this item has
                for (let i = 1; i <= 10; i++) {
                  const enKey = `ex${i}_en`;
                  const korKey = `ex${i}_kor`;
                  if (item[enKey] && item[korKey]) {
                    console.log(`Found pair: ${enKey}, ${korKey}`);
                    expressions.push({
                      session_id: sessionId,
                      korean: item[korKey],
                      english: item[enKey],
                      audio_url: null, // No individual audio for Conversational examples
                      display_order: index + 1,
                      metadata: {}
                    });
                    break; // Only one ex pair per item
                  }
                }
              });
              console.log('Total expressions created:', expressions.length);
            } catch (error) {
              console.error('Failed to parse contents_json:', error);
              console.error('Error details:', error);
            }
          }
        } else if (isNewsCategory) {
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
