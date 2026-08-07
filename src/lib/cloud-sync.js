import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://noipojdpbofnklflyblw.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_QLuh6ckftPD7B7A6vXprYQ_r-qS2woA'

export const cloud = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export async function readCloudWorkspace(userId) {
  const { data, error } = await cloud
    .from('onebench_workspaces')
    .select('data, updated_at')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function writeCloudWorkspace(userId, payload) {
  const { error } = await cloud.from('onebench_workspaces').upsert({
    user_id: userId,
    data: payload,
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
}
