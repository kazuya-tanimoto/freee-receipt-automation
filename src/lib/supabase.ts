import { createClient } from '@supabase/supabase-js'

export interface SupabaseConfig {
  url: string
  anonKey: string
}

function getSupabaseConfig(): SupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }

  return { url, anonKey }
}

const config = getSupabaseConfig()

export const supabase = createClient(config.url, config.anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

export function createServerClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    throw new Error('Missing Supabase service role key. Please check SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(config.url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function testConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('_health').select('count').limit(1)

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase connection test failed:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Supabase connection test error:', error)
    return false
  }
}
