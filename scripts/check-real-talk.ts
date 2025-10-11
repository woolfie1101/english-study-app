import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkRealTalk() {
  console.log('\n=== Checking Real Talk Category ===\n');

  // Get Real Talk category
  const { data: category } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('slug', 'conversational-expression')
    .single();

  if (!category) {
    console.log('Real Talk category not found');
    return;
  }

  console.log('Real Talk Category:', category.name);

  // Get first session
  const { data: session } = await supabase
    .from('sessions')
    .select('*')
    .eq('category_id', category.id)
    .eq('session_number', 1)
    .single();

  if (session) {
    console.log('\nSession 1:');
    console.log('  Title:', session.title);
    console.log('  Pattern English:', session.pattern_english);
    console.log('  Pattern Korean:', session.pattern_korean);
    console.log('  Metadata:', JSON.stringify(session.metadata, null, 2));
  }

  console.log('\n=== Checking Real Talk Examples Category ===\n');

  // Get Real Talk Examples category
  const { data: examplesCategory } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('slug', 'conversational-ex-expression')
    .single();

  if (!examplesCategory) {
    console.log('Real Talk Examples category not found');
    return;
  }

  console.log('Real Talk Examples Category:', examplesCategory.name);

  // Get first session
  const { data: examplesSession } = await supabase
    .from('sessions')
    .select('*')
    .eq('category_id', examplesCategory.id)
    .eq('session_number', 1)
    .single();

  if (examplesSession) {
    console.log('\nSession 1:');
    console.log('  Title:', examplesSession.title);
    console.log('  Pattern English:', examplesSession.pattern_english);
    console.log('  Pattern Korean:', examplesSession.pattern_korean);
    console.log('  Metadata:', JSON.stringify(examplesSession.metadata, null, 2));
  }
}

checkRealTalk().then(() => {
  console.log('\nDone!');
  process.exit(0);
});
