# Supabase Setup Guide

This guide provides detailed instructions for setting up Supabase for the freee Receipt Automation system.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Git repository cloned locally

## Step-by-Step Setup

### 1. Create a New Supabase Project

1. Log in to your [Supabase Dashboard](https://app.supabase.com)
2. Click **"New project"**
3. Fill in the project details:
   - **Name**: `freee-receipt-automation`
   - **Database Password**: Generate a strong password (save this securely)
   - **Region**: Choose the closest region to your location
4. Click **"Create new project"**
5. Wait for the project to be provisioned (2-3 minutes)

### 2. Get Project Configuration

From your Supabase project dashboard:

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (anon key)
   - **Project API Key** (anon key)
   - **Project API Key** (service_role key)

### 3. Configure Environment Variables

1. Copy the environment template:

   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase configuration in `.env.local`:

   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

   # Application Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### 4. Install Supabase CLI (Optional)

For local development and migrations:

```bash
npm install -g @supabase/supabase-js
npx supabase login
```

### 5. Run Database Migrations

Apply the database schema:

```bash
# Install dependencies first
npm install

# Run migrations manually using the Supabase dashboard:
# 1. Go to SQL Editor in your Supabase dashboard
# 2. Copy and paste each migration file from supabase/migrations/
# 3. Execute them in order: 001, 002, 003
```

### 6. Verify Setup

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Check the browser console for any connection errors
3. Test basic authentication functionality

## Database Schema Overview

The system creates the following tables:

- **user_settings**: User preferences and freee integration settings
- **receipts**: Uploaded receipt files and their processing status
- **transactions**: freee transaction data and matching information
- **processing_logs**: Audit trail for receipt processing steps

## Security Configuration

### Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:

- Users can only access their own data
- Service role has admin access for system operations
- Anonymous users have no access to data

### Authentication

- Email/password authentication enabled
- Email confirmation required
- Password reset functionality available

## Troubleshooting

### Common Issues

#### Connection Error: "Invalid API key"

- Verify the API keys in `.env.local` are correct
- Ensure you're using the anon key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Database Error: "relation does not exist"

- Run the database migrations in order
- Check that all three migration files have been executed

#### RLS Error: "Permission denied"

- Verify RLS policies are properly configured
- Check that the user is authenticated

### Support

For additional help:

1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Review our [Troubleshooting Guide](../troubleshooting/supabase-issues.md)
3. Check the project's GitHub issues

## Next Steps

After completing the Supabase setup:

1. Configure freee API integration
2. Set up OCR service credentials
3. Deploy to production environment

---

Last updated: 2024-06-19
