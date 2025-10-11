import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkCompletedSessions() {
  console.log('\n=== Checking Completed Sessions for Daily Phrases ===\n');

  const { data } = await supabase
    .from('user_session_progress')
    .select('session_id, category_id, completed_at, status')
    .eq('category_id', 'abf85bb6-9c15-4a0d-99c4-d1d2bc78814c')
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(10);

  console.log('Daily Phrases completed sessions:');
  data?.forEach(s => {
    const date = new Date(s.completed_at!);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    console.log(`  ${dateStr} | Session: ${s.session_id.substring(0, 8)}... | ${s.completed_at}`);
  });
}

checkCompletedSessions().then(() => {
  console.log('\nDone!');
  process.exit(0);
});
