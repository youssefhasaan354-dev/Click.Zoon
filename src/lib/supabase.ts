import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://hwippfxbcodmlxfxyqsa.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_owPGsymG7EsbCeGy6Rz8qg_61BEDSK0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
