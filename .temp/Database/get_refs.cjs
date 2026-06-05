const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync('../../.env', 'utf8');
const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);
const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

async function main() {
  const tables = ['time_durations', 'program_durations', 'days_per_week', 'training_splits', 'periodization_phases'];
  const result = {};
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').order('id');
    if (error) {
      console.log(table, 'error:', error.message);
    } else {
      result[table] = data;
    }
  }
  fs.writeFileSync('reference_data.json', JSON.stringify(result, null, 2));
  console.log('Reference data saved to reference_data.json');
}

main().catch(console.error);
