# Authentication API Documentation

This document describes the authentication system and API endpoints for the freee Receipt Automation system.

## Overview

The authentication system is built on Supabase Auth, providing secure user registration, login, and session management
with JWT tokens.

## Authentication Flow

### 1. User Registration

**Endpoint**: `POST /api/auth/signup`

```typescript
// Request
{
  email: string;
  password: string;
  confirmPassword: string;
}

// Response (Success)
{
  user: {
    id: string;
    email: string;
    email_confirmed_at: string | null;
    created_at: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: "bearer";
  } | null;
}

// Response (Error)
{
  error: {
    message: string;
    code?: string;
  }
}
```

**Flow**:

1. User submits registration form
2. Server validates input and creates user in Supabase
3. Email confirmation sent (if enabled)
4. User redirected to login or dashboard

### 2. User Login

**Endpoint**: `POST /api/auth/login`

```typescript
// Request
{
  email: string;
  password: string;
}

// Response (Success)
{
  user: {
    id: string;
    email: string;
    email_confirmed_at: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: "bearer";
  };
}

// Response (Error)
{
  error: {
    message: string;
    code?: string;
  }
}
```

### 3. User Logout

**Endpoint**: `POST /api/auth/logout`

```typescript
// Request
{
} // No body required - uses session cookie

// Response (Success)
{
  message: 'Logged out successfully';
}

// Response (Error)
{
  error: {
    message: string;
  }
}
```

### 4. Session Refresh

**Endpoint**: `POST /api/auth/refresh`

```typescript
// Request
{
  refresh_token: string;
}

// Response (Success)
{
  session: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: 'bearer';
  }
  user: {
    id: string;
    email: string;
  }
}

// Response (Error)
{
  error: {
    message: string;
  }
}
```

## Client-Side Authentication

### Using the Auth Hook

```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, signIn, signUp, signOut, isLoading } = useAuth();

  const handleSignIn = async (email: string, password: string) => {
    try {
      await signIn(email, password);
      // User is now authenticated
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.email}</p>
          <button onClick={signOut}>Sign Out</button>
        </div>
      ) : (
        <div>Please sign in</div>
      )}
    </div>
  );
}
```

### Direct Supabase Client Usage

```typescript
import { supabase } from '@/lib/supabase/client';

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});

// Get current session
const {
  data: { session },
} = await supabase.auth.getSession();

// Sign out
const { error } = await supabase.auth.signOut();
```

## Route Protection

### Middleware Protection

The application uses Next.js middleware to protect routes:

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Redirect to login if no session
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  return res;
}
```

### Protected Routes

- `/dashboard/*` - Requires authentication
- `/settings/*` - Requires authentication
- `/receipts/*` - Requires authentication
- `/auth/*` - Public (login/register pages)
- `/` - Public (landing page)

## Session Management

### Session Storage

- **Access Token**: Stored in memory, expires in 1 hour
- **Refresh Token**: Stored in httpOnly cookie, expires in 30 days
- **Auto-refresh**: Handled automatically by Supabase client

### Session Validation

```typescript
// Check if user is authenticated
const isAuthenticated = async (): Promise<boolean> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return !!session;
};

// Get current user
const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};
```

## Error Handling

### Common Error Codes

| Code                        | Message                   | Description                        |
| --------------------------- | ------------------------- | ---------------------------------- |
| `email_not_confirmed`       | Email not confirmed       | User needs to confirm email        |
| `invalid_credentials`       | Invalid login credentials | Wrong email/password combination   |
| `signup_disabled`           | Signups not allowed       | Registration is disabled           |
| `email_rate_limit_exceeded` | Too many emails sent      | Rate limit on confirmation emails  |
| `weak_password`             | Password too weak         | Password doesn't meet requirements |

### Error Response Format

```typescript
interface AuthError {
  message: string;
  code?: string;
  details?: string;
}
```

### Client-Side Error Handling

```typescript
try {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    switch (error.message) {
      case 'Invalid login credentials':
        setError('Please check your email and password');
        break;
      case 'Email not confirmed':
        setError('Please check your email and click the confirmation link');
        break;
      default:
        setError('An unexpected error occurred');
    }
    return;
  }

  // Success - redirect or update UI
} catch (error) {
  console.error('Auth error:', error);
  setError('Connection error - please try again');
}
```

## Security Features

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Rate Limiting

- **Login attempts**: 5 attempts per 15 minutes per IP
- **Registration**: 3 attempts per hour per IP
- **Password reset**: 1 attempt per 5 minutes per email

### CSRF Protection

- All API routes use CSRF tokens
- Middleware validates requests
- Cookies are httpOnly and secure

## Testing Authentication

### Unit Tests

```typescript
import { signIn, signUp, signOut } from '@/lib/auth';

describe('Authentication', () => {
  test('should sign in with valid credentials', async () => {
    const result = await signIn('test@example.com', 'password123');
    expect(result.user).toBeDefined();
    expect(result.session).toBeDefined();
  });

  test('should reject invalid credentials', async () => {
    await expect(signIn('invalid@example.com', 'wrong')).rejects.toThrow();
  });
});
```

### E2E Tests

```typescript
// e2e/auth.spec.ts
test('should complete authentication flow', async ({ page }) => {
  await page.goto('/auth/register');

  await page.fill('[data-testid=email]', 'test@example.com');
  await page.fill('[data-testid=password]', 'password123');
  await page.click('[data-testid=submit]');

  await expect(page).toHaveURL('/dashboard');
});
```

## Production Considerations

### Environment Variables

```bash
# Required for production
NEXT_PUBLIC_SUPABASE_URL=your_production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
```

### Security Checklist

- ✅ RLS policies enabled on all tables
- ✅ HTTPS enforced in production
- ✅ Secure cookie settings
- ✅ Rate limiting configured
- ✅ Email confirmation enabled
- ✅ Strong password requirements

---

Last updated: 2024-06-19
