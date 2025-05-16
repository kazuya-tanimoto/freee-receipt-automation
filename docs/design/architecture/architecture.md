# Architecture Documentation

## 🚀 Technology Stack

- **Build & Routing**  
  - **Turbopack** (Next.js 15 default build)  
  - **App Router** (File-based & React Server Components support)

- **Testing**  
  - **Vitest** + **React Testing Library**  
  - **MSW** (Browser & Vitest Browser Mode support)  
  - **Playwright** (Multi-browser E2E)

- **Cataloging**  
  - **Storybook 8** (`@storybook/nextjs` builder: Vite)  
  - **Chromatic** (Visual regression testing & shared hosting)

- **Lint / Formatter**  
  - **Biome 2.0** (ESLint + Prettier replacement)

- **UI & Styling**  
  - **Tailwind CSS**  
  - **shadcn/ui** (Tailwind v4 & React 19 compatible CLI)

- **State Management**  
  - **Server Actions + `fetch()` cache**  
  - Add Zustand/Jotai only when global state is needed

- **Authentication / DB**  
  - **Supabase** + **@supabase/auth-helpers-nextjs** (Cookie-Auth)  
  - **RLS enabled** for all tables by default

- **HTTP Client Guidelines**  
  - Default to **`fetch()`** (integrated with App Router cache/ISR)  
  - **Axios** only for client-side processing requiring interceptors

## 🛠️ Minimum Setup Instructions (pnpm)

```bash
# 0) Create new project (with Tailwind & Turbopack)
pnpx create-next-app@latest my-app \
  --typescript --tailwind --turbo

cd my-app

# 1) Install development tools
pnpm add -D vitest @testing-library/react jsdom msw \
           playwright biome

# 2) Initialize Playwright
pnpx playwright install

# 3) Initialize Storybook (Vite builder)
pnpx storybook@next init --builder vite --framework nextjs

# 4) Initialize shadcn/ui
pnpx shadcn-ui@latest init

# 5) Supabase SDK & Auth Helpers
pnpm add @supabase/supabase-js @supabase/auth-helpers-nextjs
```

## Required File Templates
```typescript
// app/layout.tsx — Inject Supabase client with cookie session
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export const metadata = { /* ... */ };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient({ cookies });
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

## GitHub Actions Sample (CI)
```yaml
name: CI

on: [push, pull_request]

jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: '8'
      - run: pnpm install
      - run: pnpm biome ci
      - run: pnpm vitest run
      - run: pnpm next build
      - run: pnpm playwright test
```

## Key Points
1. State management with fetch() + cache. Add client state management only when needed.
2. Use Axios only for client-side processing, consistently use fetch() in Server Actions.
3. Enable Row Level Security in Supabase and combine with Edge Functions for better scalability.

## References
- Turbopack API Reference [Next.js by Vercel - The React Framework](https://nextjs.org/docs/app/api-reference/turbopack)
- App Router Introduction [Next.js by Vercel - The React Framework](https://nextjs.org/docs/app)
- Next.js Vitest Guide [Next.js by Vercel - The React Framework](https://nextjs.org/docs/app/guides/testing/vitest)
- MSW × Vitest Browser Mode [Mock Service Worker](https://mswjs.io/docs/recipes/vitest-browser-mode/)
- Playwright Best Practices [playwright.dev](https://playwright.dev/docs/best-practices)
- Storybook for Next.js [Storybook](https://storybook.js.org/docs/get-started/frameworks/nextjs)
- Chromatic Visual Testing [chromatic.com](https://www.chromatic.com/storybook)
- Biome Migration Guide [Biome](https://biomejs.dev/guides/migrate-eslint-prettier/)
- Tailwind × Next.js Setup [Tailwind CSS](https://tailwindcss.com/docs/guides/nextjs)
- shadcn/ui Tailwind v4 Update [Build your component library - shadcn/ui](https://ui.shadcn.com/docs/tailwind-v4)
- Supabase Auth-Helpers (App Router) [Supabase](https://supabase.com/docs/guides/auth/auth-helpers/nextjs) 