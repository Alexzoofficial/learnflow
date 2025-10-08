import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gfjebdptkhzoyzoxzbnn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmamViZHB0a2h6b3l6b3h6Ym5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MTA5MDgsImV4cCI6MjA3MjI4NjkwOH0.b4NPIVez9whCi-XP9rZ0Zf24JSg9e1jYLSJ4D5hF7_Y';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
