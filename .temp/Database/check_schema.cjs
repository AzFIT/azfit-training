const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://mhwrqkfttjbxryhlmhti.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1od3Jxa2Z0dGbieHJ5aGxtaHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NTczMDQsImV4cCI6MjA5NjEzMzMwNH0.-zR5wbwQl9JtV7G0gLcWarJIy75FZzvz3DnHvnNr3So'
);

async function main() {
  const tables = ['time_durations', 'program_durations', 'days_per_week'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').order('id');
    if (error) {
      console.log(table, 'error:', error.message);
    } else {
      console.log('\n' + table + ':', JSON.stringify(data, null, 2));
    }
  }
}

main().catch(console.error);
