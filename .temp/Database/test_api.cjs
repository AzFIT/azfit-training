const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync('../../.env', 'utf8');
const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);

const url = urlMatch ? urlMatch[1].trim() : '';
const key = keyMatch ? keyMatch[1].trim() : '';

console.log('URL:', url);
console.log('Key length:', key.length);
console.log('Key prefix:', key.substring(0, 50));

const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.from('time_durations').select('*').limit(3);
  if (error) {
    console.log('Error:', error.message);
  } else {
    console.log('Data:', JSON.stringify(data, null, 2));
  }
}

test();
