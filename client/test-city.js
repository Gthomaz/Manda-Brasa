import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yrsfgjvlmqdtuxqdejpd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlyc2ZnanZsbXFkdHV4cWRlanBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njg5ODUxOCwiZXhwIjoyMTAyNDc0NTE4fQ.yZXWoFqQYgBmLdH1KSHPrOUrsIrpyTGEc3E2dgOtfqM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('profiles').update({ address_city: 'Teste' }).eq('id', '00000000-0000-0000-0000-000000000000');
  console.log('Error:', error);
}
test();
