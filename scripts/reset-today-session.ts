import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function resetTodaySession() {
  console.log('\n=== Resetting Today\'s Session Progress ===\n');

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  console.log('Today:', today);

  // Get today's session progress
  const { data: sessions } = await supabase
    .from('user_session_progress')
    .select('id, completed_at, sessions(session_number)')
    .eq('status', 'completed');

  const todaySessions = sessions?.filter((progress: any) => {
    if (!progress.completed_at) return false;
    const completedDate = new Date(progress.completed_at);
    const dateStr = `${completedDate.getFullYear()}-${String(completedDate.getMonth() + 1).padStart(2, '0')}-${String(completedDate.getDate()).padStart(2, '0')}`;
    return dateStr === today;
  }) || [];

  console.log('Found', todaySessions.length, 'sessions to reset');

  for (const session of todaySessions) {
    console.log(`Deleting session ${session.sessions?.session_number} progress (ID: ${session.id})`);
    await supabase
      .from('user_session_progress')
      .delete()
      .eq('id', session.id);
  }

  // Delete today's daily stats
  const { error: statsError } = await supabase
    .from('daily_study_stats')
    .delete()
    .eq('study_date', today);

  if (statsError) {
    console.error('Error deleting stats:', statsError);
  } else {
    console.log('Daily stats deleted');
  }

  console.log('\n✅ Reset complete!');
}

resetTodaySession().then(() => {
  console.log('\nDone!');
  process.exit(0);
});
