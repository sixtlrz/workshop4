import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined in environment variables');
}

if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined in environment variables');
}

// Client côté navigateur (browser) - utilise automatiquement les cookies
// À utiliser dans les composants client et le contexte d'authentification
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Client basique pour le serveur
export const supabaseServer = createClient(supabaseUrl, supabaseAnonKey);

// Client admin avec service role key (UNIQUEMENT côté serveur - APIs)
// Ne pas importer ce client dans des composants client
export const supabaseAdmin = (() => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Si pas de service key (côté client), retourner le client normal
  if (!serviceKey) {
    return supabaseServer;
  }

  return createClient(supabaseUrl, serviceKey);
})();
