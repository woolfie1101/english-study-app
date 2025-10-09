import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkCalendarData() {
  console.log('\n=== Calendar Data Check ===\n');

  // 1. Check categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, total_sessions');

  console.log('Categories:');
  categories?.forEach(cat => {
    console.log(`  ${cat.name}: ${cat.total_sessions} sessions (ID: ${cat.id})`);
  });

  // 2. Check daily_study_stats
  const { data: stats } = await supabase
    .from('daily_study_stats')
    .select('*')
    .order('study_date', { ascending: false });

  console.log('\nDaily Study Stats:');
  stats?.forEach(stat => {
    console.log(`  ${stat.study_date}: completed=${stat.sessions_completed}, total=${stat.total_sessions}, category=${stat.category_id}`);
  });

  // 3. Check actual session count
  const { data: sessions } = await supabase
    .from('sessions')
    .select('category_id')
    .order('category_id');

  const sessionCount = new Map<string, number>();
  sessions?.forEach(session => {
    sessionCount.set(session.category_id, (sessionCount.get(session.category_id) || 0) + 1);
  });

  console.log('\nActual Session Count:');
  sessionCount.forEach((count, categoryId) => {
    const cat = categories?.find(c => c.id === categoryId);
    console.log(`  ${cat?.name}: ${count} sessions`);
  });
}

checkCalendarData().then(() => {
  console.log('\nDone!');
  process.exit(0);
});
