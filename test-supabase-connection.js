// Simple test to verify Supabase client setup
const { createClient } = require('@supabase/supabase-js')

// Test environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

console.log('Testing Supabase client configuration...')
console.log('URL:', supabaseUrl)
console.log('Anon Key:', supabaseAnonKey.substring(0, 20) + '...')

try {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  console.log('✅ Supabase client created successfully')
  console.log('Client config:', {
    supabaseUrl: supabase.supabaseUrl,
    supabaseKey: supabase.supabaseKey.substring(0, 20) + '...'
  })
} catch (error) {
  console.error('❌ Failed to create Supabase client:', error.message)
}