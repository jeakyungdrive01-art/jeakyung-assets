import { requireSupabase } from '../lib/supabase.js';

export async function getAdminSystemUsage() {
  const { data, error } = await requireSupabase().rpc('get_admin_system_usage');
  if (error) throw error;
  return data;
}
