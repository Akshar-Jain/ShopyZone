import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hcugxkjuszbixikmfeub.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdWd4a2p1c3piaXhpa21mZXViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MzcxMDUsImV4cCI6MjA5NzExMzEwNX0.92O5WlO31Q2A7xexVeZV64Go_1UjwyemffgCMJMSy8M';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);