import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined in environment variables');
}

if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined in environment variables');
}

// Client avec clé anonyme pour les opérations publiques
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client avec service role key pour contourner RLS (à utiliser côté serveur uniquement)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
