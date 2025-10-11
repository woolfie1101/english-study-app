import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as readline from 'readline';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function resetAllData() {
  console.log('\n⚠️  WARNING: This will delete ALL data from the following tables:');
  console.log('   - user_expression_progress');
  console.log('   - user_session_progress');
  console.log('   - daily_study_stats');
  console.log('   - expressions');
  console.log('   - sessions');
  console.log('\n⚠️  This action CANNOT be undone!\n');

  const answer = await question('Are you sure you want to continue? (type "yes" to confirm): ');

  if (answer.toLowerCase() !== 'yes') {
    console.log('\n❌ Aborted. No data was deleted.');
    rl.close();
    return;
  }

  console.log('\n🗑️  Deleting data...\n');

  try {
    // 1. Delete user expression progress
    const { error: expr1Error } = await supabase
      .from('user_expression_progress')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (expr1Error) throw expr1Error;
    console.log('✅ Deleted user_expression_progress');

    // 2. Delete user session progress
    const { error: sess1Error } = await supabase
      .from('user_session_progress')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (sess1Error) throw sess1Error;
    console.log('✅ Deleted user_session_progress');

    // 3. Delete daily stats
    const { error: statsError } = await supabase
      .from('daily_study_stats')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (statsError) throw statsError;
    console.log('✅ Deleted daily_study_stats');

    // 4. Delete expressions
    const { error: exprError } = await supabase
      .from('expressions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (exprError) throw exprError;
    console.log('✅ Deleted expressions');

    // 5. Delete sessions
    const { error: sessError } = await supabase
      .from('sessions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (sessError) throw sessError;
    console.log('✅ Deleted sessions');

    // Verify counts
    console.log('\n📊 Verification:');

    const tables = [
      'sessions',
      'expressions',
      'user_expression_progress',
      'user_session_progress',
      'daily_study_stats'
    ];

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table as any)
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      console.log(`   ${table}: ${count} rows remaining`);
    }

    console.log('\n✅ All data has been reset successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Update Supabase categories table slugs');
    console.log('   2. Update Google Sheets names to match slugs');
    console.log('   3. Run sync from Admin page to import new data');

  } catch (error) {
    console.error('\n❌ Error resetting data:', error);
  } finally {
    rl.close();
  }
}

resetAllData().then(() => {
  process.exit(0);
});
