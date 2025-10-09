import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkExpressionProgress() {
  console.log('\n=== Checking Expression Progress ===\n');

  // Get today's date in local timezone
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  console.log('Today:', today);

  // Check all expression progress
  const { data: allProgress, error: allError } = await supabase
    .from('user_expression_progress')
    .select('*, expressions(english), sessions(session_number)')
    .order('completed_at', { ascending: false });

  if (allError) {
    console.error('Error fetching progress:', allError);
    return;
  }

  console.log('\n=== All Expression Progress ===');
  allProgress?.forEach((progress: any) => {
    const completedDate = new Date(progress.completed_at);
    const dateStr = `${completedDate.getFullYear()}-${String(completedDate.getMonth() + 1).padStart(2, '0')}-${String(completedDate.getDate()).padStart(2, '0')}`;
    console.log(`Date: ${dateStr} | Session: ${progress.sessions?.session_number} | Expression: ${progress.expressions?.english?.substring(0, 50)}`);
  });

  // Count today's completed expressions
  const todayProgress = allProgress?.filter((progress: any) => {
    if (!progress.completed_at) return false;
    const completedDate = new Date(progress.completed_at);
    const dateStr = `${completedDate.getFullYear()}-${String(completedDate.getMonth() + 1).padStart(2, '0')}-${String(completedDate.getDate()).padStart(2, '0')}`;
    return dateStr === today;
  }) || [];

  console.log('\n=== Today\'s Expression Progress ===');
  console.log('Count:', todayProgress.length);
  todayProgress.forEach((progress: any) => {
    console.log(`Session: ${progress.sessions?.session_number} | Expression: ${progress.expressions?.english?.substring(0, 50)}`);
  });

  // Check session progress
  console.log('\n=== Session Progress ===');
  const { data: sessionProgress } = await supabase
    .from('user_session_progress')
    .select('*, sessions(session_number)')
    .eq('status', 'completed')
    .order('completed_at', { ascending: false });

  const todaySessions = sessionProgress?.filter((progress: any) => {
    if (!progress.completed_at) return false;
    const completedDate = new Date(progress.completed_at);
    const dateStr = `${completedDate.getFullYear()}-${String(completedDate.getMonth() + 1).padStart(2, '0')}-${String(completedDate.getDate()).padStart(2, '0')}`;
    return dateStr === today;
  }) || [];

  console.log('Today\'s completed sessions:', todaySessions.length);
  todaySessions.forEach((progress: any) => {
    console.log(`Session ${progress.sessions?.session_number} completed at ${progress.completed_at}`);
  });
}

checkExpressionProgress().then(() => {
  console.log('\nDone!');
  process.exit(0);
});
