import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cqtatexdaatvcyhhvfao.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseKey) {
  console.error('Supabase anon key is missing. Add VITE_SUPABASE_ANON_KEY to .env.local.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
