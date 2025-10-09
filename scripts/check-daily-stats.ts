import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDailyStats() {
  console.log('\n=== Checking Daily Stats ===\n');

  // Get today's date in local timezone
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  console.log('Today:', today);
  console.log('Full timestamp:', now.toISOString());

  // Check all daily stats
  const { data: allStats, error: allError } = await supabase
    .from('daily_study_stats')
    .select('*')
    .order('study_date', { ascending: false });

  if (allError) {
    console.error('Error fetching stats:', allError);
    return;
  }

  console.log('\n=== All Daily Stats ===');
  allStats?.forEach(stat => {
    console.log(`Date: ${stat.study_date} | Category: ${stat.category_id} | Completed: ${stat.sessions_completed}/${stat.total_sessions}`);
  });

  // Check completed sessions
  const { data: completedSessions, error: sessionsError } = await supabase
    .from('user_session_progress')
    .select('completed_at, category_id, status')
    .eq('status', 'completed')
    .order('completed_at', { ascending: false });

  if (sessionsError) {
    console.error('Error fetching sessions:', sessionsError);
    return;
  }

  console.log('\n=== Completed Sessions ===');
  completedSessions?.forEach(session => {
    const completedDate = new Date(session.completed_at!);
    const dateStr = `${completedDate.getFullYear()}-${String(completedDate.getMonth() + 1).padStart(2, '0')}-${String(completedDate.getDate()).padStart(2, '0')}`;
    console.log(`Date: ${dateStr} | Category: ${session.category_id} | Completed at: ${session.completed_at}`);
  });

  // Count today's completed sessions by category
  const todayCompleted = completedSessions?.filter(session => {
    if (!session.completed_at) return false;
    const completedDate = new Date(session.completed_at);
    const dateStr = `${completedDate.getFullYear()}-${String(completedDate.getMonth() + 1).padStart(2, '0')}-${String(completedDate.getDate()).padStart(2, '0')}`;
    return dateStr === today;
  }) || [];

  console.log('\n=== Today\'s Completed Sessions ===');
  console.log('Count:', todayCompleted.length);
  todayCompleted.forEach(session => {
    console.log(`Category: ${session.category_id} | Completed at: ${session.completed_at}`);
  });
}

async function resetTodayStats() {
  console.log('\n=== Resetting Today\'s Stats ===\n');

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // Delete today's stats
  const { error } = await supabase
    .from('daily_study_stats')
    .delete()
    .eq('study_date', today);

  if (error) {
    console.error('Error deleting stats:', error);
    return;
  }

  console.log('✅ Today\'s stats have been reset');
}

// Run based on command line argument
const command = process.argv[2];

if (command === 'reset') {
  resetTodayStats().then(() => {
    console.log('\nDone!');
    process.exit(0);
  });
} else {
  checkDailyStats().then(() => {
    console.log('\nDone!');
    process.exit(0);
  });
}
