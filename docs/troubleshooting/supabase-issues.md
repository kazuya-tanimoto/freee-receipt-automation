# Supabase Troubleshooting Guide

This guide covers common issues when working with Supabase in the freee Receipt Automation system.

## Connection Issues

### Error: "Invalid API key"

**Symptoms**:

- Application fails to connect to Supabase
- Console error: `AuthInvalidApiKeyError`

**Causes & Solutions**:

1. **Wrong API Key**

   ```bash
   # Check .env.local file
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here  # Should be anon key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # Should be service_role key
   ```

2. **API Key from Wrong Project**

   - Verify you're using keys from the correct Supabase project
   - Go to Project Settings → API in Supabase dashboard

3. **Environment File Not Loaded**

   ```bash
   # Ensure .env.local exists in project root
   ls -la .env.local

   # Restart development server
   npm run dev
   ```

### Error: "Failed to fetch"

**Symptoms**:

- Network requests to Supabase fail
- CORS errors in browser console

**Solutions**:

1. **Check Project URL**

   ```bash
   # Verify URL format in .env.local
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   ```

2. **Firewall/Proxy Issues**
   - Try connecting from different network
   - Check corporate firewall settings
   - Use mobile hotspot to test

## Authentication Issues

### Error: "User not found" on Valid Credentials

**Symptoms**:

- Login fails with correct email/password
- User can't sign in after registration

**Solutions**:

1. **Email Confirmation Required**

   ```typescript
   // Check if email confirmation is enabled
   const { data, error } = await supabase.auth.signUp({
     email: 'user@example.com',
     password: 'password',
   });
   // User needs to confirm email before signing in
   ```

2. **Check Auth Settings**
   - Go to Authentication → Settings in Supabase dashboard
   - Verify "Enable email confirmations" setting
   - Check spam folder for confirmation emails

### Error: "Session expired"

**Symptoms**:

- User gets logged out unexpectedly
- API calls fail with authentication errors

**Solutions**:

1. **Token Refresh Configuration**

   ```typescript
   // Ensure automatic token refresh is enabled
   const supabase = createClient(url, key, {
     auth: {
       autoRefreshToken: true,
       persistSession: true,
     },
   });
   ```

2. **Check Session Persistence**

   ```typescript
   // Verify session is being stored
   const {
     data: { session },
   } = await supabase.auth.getSession();
   console.log('Current session:', session);
   ```

## Database Issues

### Error: "relation does not exist"

**Symptoms**:

- Queries fail with table not found errors
- New installations can't access database

**Solutions**:

1. **Run Migrations**

   ```sql
   -- Execute in Supabase SQL Editor in order:
   -- 1. supabase/migrations/001_core_tables.sql
   -- 2. supabase/migrations/002_transaction_tables.sql
   -- 3. supabase/migrations/003_rls_policies.sql
   ```

2. **Verify Schema**

   ```sql
   -- Check if tables exist
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public';
   ```

### Error: "Permission denied for table"

**Symptoms**:

- RLS policy blocks legitimate user access
- Service role operations fail

**Solutions**:

1. **Check RLS Policies**

   ```sql
   -- View current policies
   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
   FROM pg_policies
   WHERE schemaname = 'public';
   ```

2. **Debug User Context**

   ```typescript
   // Check current user in application
   const {
     data: { user },
   } = await supabase.auth.getUser();
   console.log('Current user:', user?.id);

   // Test with service role
   const { data, error } = await supabaseAdmin.from('user_settings').select('*');
   ```

3. **Temporary Policy Bypass** (Development Only)

   ```sql
   -- NEVER use in production
   ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;
   ```

## Performance Issues

### Slow Query Performance

**Symptoms**:

- API responses take > 1 second
- Database queries timeout

**Solutions**:

1. **Add Missing Indexes**

   ```sql
   -- Check for missing indexes on frequently queried columns
   CREATE INDEX idx_receipts_user_id ON receipts(user_id);
   CREATE INDEX idx_receipts_status ON receipts(status);
   CREATE INDEX idx_receipts_created_at ON receipts(created_at);
   ```

2. **Optimize Queries**

   ```typescript
   // Use select() to limit returned columns
   const { data } = await supabase
     .from('receipts')
     .select('id, file_name, status') // Don't select unnecessary columns
     .eq('user_id', userId)
     .limit(10);
   ```

### High API Usage

**Symptoms**:

- Approaching free tier limits
- Unexpected charges

**Solutions**:

1. **Implement Caching**

   ```typescript
   // Cache user settings
   const cachedSettings = localStorage.getItem('userSettings');
   if (!cachedSettings) {
     const { data } = await supabase.from('user_settings').select('*').single();
     localStorage.setItem('userSettings', JSON.stringify(data));
   }
   ```

2. **Use Real-time Subscriptions Efficiently**

   ```typescript
   // Unsubscribe when component unmounts
   useEffect(() => {
     const subscription = supabase
       .channel('receipts')
       .on('postgres_changes', { event: '*', schema: 'public', table: 'receipts' }, payload => console.log(payload))
       .subscribe();

     return () => subscription.unsubscribe();
   }, []);
   ```

## Development Issues

### TypeScript Type Errors

**Symptoms**:

- TypeScript compilation fails
- Missing type definitions for database

**Solutions**:

1. **Regenerate Types**

   ```bash
   npx supabase gen types typescript --project-id your-project-id > src/types/supabase.ts
   ```

2. **Update Type Imports**

   ```typescript
   import type { Database } from '@/types/supabase';
   type Receipt = Database['public']['Tables']['receipts']['Row'];
   ```

### Local Development Sync Issues

**Symptoms**:

- Local schema differs from production
- Migration conflicts

**Solutions**:

1. **Use Supabase CLI** (Optional)

   ```bash
   npx supabase db pull  # Pull production schema
   npx supabase db push  # Push local changes
   ```

2. **Manual Schema Export**

   ```sql
   -- Export schema from Supabase dashboard
   -- SQL Editor → "..." → Export schema
   ```

## Emergency Procedures

### Complete Database Reset

#### ⚠️ WARNING: This will delete ALL data

```sql
-- Drop all tables (in Supabase SQL Editor)
DROP TABLE IF EXISTS processing_logs CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS receipts CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;

-- Re-run all migrations
-- Execute 001_core_tables.sql
-- Execute 002_transaction_tables.sql
-- Execute 003_rls_policies.sql
```

### Backup and Restore

```bash
# Backup (manual export from Supabase dashboard)
# Go to Settings → Database → Backup

# Restore critical data
# Use SQL Editor to insert essential records
```

## Getting Help

### Check Logs

1. Supabase Dashboard → Logs
2. Browser Developer Console
3. Network tab for API call details

### Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- [Project GitHub Issues](https://github.com/your-repo/issues)

### Escalation

For critical issues affecting production:

1. Check [Supabase Status Page](https://status.supabase.com)
2. Contact Supabase Support (paid plans)
3. Consider temporary workarounds

---

Last updated: 2024-06-19
