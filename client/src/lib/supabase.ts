import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yrsfgjvlmqdtuxqdejpd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlyc2ZnanZsbXFkdHV4cWRlanBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4OTg1MTgsImV4cCI6MjEwMjQ3NDUxOH0.Fq6h-M67dCqxP_ycggdwwsYv61In8qdgP2pwkOuNSHs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
