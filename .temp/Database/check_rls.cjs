const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync('../../.env', 'utf8');
const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);
const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

async function main() {
  // Try to sign up a test user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: 'azfit.deploy@gmail.com',
    password: 'TempPass123!',
  });
  
  if (authError) {
    console.log('Auth error:', authError.message);
  } else {
    console.log('User created:', authData.user?.id);
    console.log('Session exists:', !!authData.session);
    
    // If we have a session, try inserting with it
    if (authData.session) {
      const authedClient = createClient(urlMatch[1].trim(), keyMatch[1].trim(), {
        global: { headers: { Authorization: `Bearer ${authData.session.access_token}` } }
      });
      
      const { error: insertError } = await authedClient.from('programs').insert({
        id: 999999, name: 'Test RLS', slug: 'test-rls',
        category_id: 1, level_id: 1,
        program_duration_id: 1, time_duration_id: 1, days_per_week_id: 1,
        training_split_id: 1, periodization_phase_id: 1,
        is_active: true, is_public: true, is_featured: false, is_premium: false,
        total_workouts: 1, total_exercises: 1
      }).select();
      
      if (insertError) {
        console.log('Insert error with auth:', insertError.message);
      } else {
        console.log('Insert succeeded with auth!');
        // Clean up test row
        await authedClient.from('programs').delete().eq('id', 999999);
      }
    }
  }
}

main().catch(console.error);
