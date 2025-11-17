import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Construir la URL de Supabase usando el projectId
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseAnonKey = publicAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

// Cliente de Supabase para usar en el frontend
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Exportar también las credenciales por si se necesitan
export { supabaseUrl, supabaseAnonKey };
