import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yrsfgjvlmqdtuxqdejpd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlyc2ZnanZsbXFkdHV4cWRlanBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njg5ODUxOCwiZXhwIjoyMTAyNDc0NTE4fQ.yZXWoFqQYgBmLdH1KSHPrOUrsIrpyTGEc3E2dgOtfqM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: profiles, error: profilesError } = await supabase.from('profiles').select('*');
  console.log('Profiles:', profiles, profilesError);

  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  console.log('Auth Users:', authData, authError);
}
test();
