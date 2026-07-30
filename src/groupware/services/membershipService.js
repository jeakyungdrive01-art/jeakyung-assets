import { requireSupabase } from '../lib/supabase.js';

export async function getIdentity(userId) {
  const client = requireSupabase();
  const [{ data: profile, error: profileError }, { data: assignments, error: roleError }] = await Promise.all([
    client
      .from('profiles')
      .select('id,name,email,phone,membership_status,department_id,position_id,job_title_id,rejection_reason,approved_at,locked_at,resigned_at,created_at')
      .eq('id', userId)
      .maybeSingle(),
    client
      .from('user_role_assignments')
      .select('role_code')
      .eq('user_id', userId),
  ]);

  if (profileError) throw profileError;
  if (roleError) throw roleError;

  return {
    profile,
    roles: (assignments ?? []).map((assignment) => assignment.role_code),
  };
}

export async function listPendingMemberships() {
  const client = requireSupabase();
  const { data, error } = await client
    .from('profiles')
    .select(`
      id,name,email,phone,membership_status,created_at,
      requested_department:departments!profiles_requested_department_id_fkey(id,name),
      requested_position:positions!profiles_requested_position_id_fkey(id,name),
      requested_job_title:job_titles!profiles_requested_job_title_id_fkey(id,name)
    `)
    .eq('membership_status', 'pending')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function approveMembership({ userId, departmentId, positionId, jobTitleId, roleCode }) {
  const client = requireSupabase();
  const { data, error } = await client.rpc('approve_membership', {
    p_user_id: userId,
    p_department_id: departmentId,
    p_position_id: positionId,
    p_job_title_id: jobTitleId,
    p_role_code: roleCode,
  });
  if (error) throw error;
  return data;
}

export async function rejectMembership({ userId, reason }) {
  const client = requireSupabase();
  const { data, error } = await client.rpc('reject_membership', {
    p_user_id: userId,
    p_reason: reason,
  });
  if (error) throw error;
  return data;
}
