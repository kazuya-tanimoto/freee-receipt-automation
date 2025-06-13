# アーキテクチャドキュメント

## 🚀 技術スタック

- **ビルド & ルーティング**

  - **Turbopack** (Next.js 15のデフォルトビルド)
  - **App Router** (ファイルベース & React Server Components対応)

- **テスト**

  - **Vitest** + **React Testing Library**
  - **MSW** (ブラウザ & Vitest Browser Mode対応)
  - **Playwright** (マルチブラウザE2E)

- **カタログ化**

  - **Storybook 8** (`@storybook/nextjs` builder: Vite)
  - **Chromatic** (ビジュアルリグレッションテスト & 共有ホスティング)

- **Lint / フォーマッター**

  - **Biome 2.0** (ESLint + Prettierの代替)

- **UI & スタイリング**

  - **Tailwind CSS**
  - **shadcn/ui** (Tailwind v4 & React 19互換CLI)

- **状態管理**

  - **Server Actions + `fetch()`キャッシュ**
  - グローバル状態が必要な場合のみZustand/Jotaiを追加

- **認証 / DB**

  - **Supabase** + **@supabase/auth-helpers-nextjs** (Cookie認証)
  - すべてのテーブルで**RLS有効**がデフォルト

- **HTTPクライアントガイドライン**
  - デフォルトで**`fetch()`**を使用 (App Routerキャッシュ/ISRと統合)
  - インターセプターが必要なクライアントサイド処理でのみ**Axios**を使用

## 🛠️ 最小セットアップ手順 (pnpm)

```bash
# 0) 新規プロジェクト作成 (Tailwind & Turbopack付き)
pnpx create-next-app@latest my-app \
  --typescript --tailwind --turbo

cd my-app

# 1) 開発ツールのインストール
pnpm add -D vitest @testing-library/react jsdom msw \
           playwright biome

# 2) Playwrightの初期化
pnpx playwright install

# 3) Storybookの初期化 (Vite builder)
pnpx storybook@next init --builder vite --framework nextjs

# 4) shadcn/uiの初期化
pnpx shadcn-ui@latest init

# 5) Supabase SDK & Auth Helpers
pnpm add @supabase/supabase-js @supabase/auth-helpers-nextjs
```

## 必要なファイルテンプレート

```typescript
// app/layout.tsx — CookieセッションでSupabaseクライアントを注入
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export const metadata = { /* ... */ };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient({ cookies });
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
```

## GitHub Actionsサンプル (CI)

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
          version: "8"
      - run: pnpm install
      - run: pnpm biome ci
      - run: pnpm vitest run
      - run: pnpm next build
      - run: pnpm playwright test
```

## 重要なポイント

1. fetch() + キャッシュによる状態管理。クライアント状態管理は必要な場合のみ追加。
2. クライアントサイド処理でのみAxiosを使用し、Server Actionsでは一貫してfetch()を使用。
3. SupabaseでRow Level Securityを有効にし、Edge Functionsと組み合わせてスケーラビリティを向上。

## 参考リンク

- Turbopack APIリファレンス
  [Next.js by Vercel](https://nextjs.org/docs/app/api-reference/turbopack)
- App Router入門
  [Next.js by Vercel](https://nextjs.org/docs/app)
- Next.js Vitestガイド
  [Next.js by Vercel](https://nextjs.org/docs/app/guides/testing/vitest)
- MSW × Vitest Browser Mode
  [Mock Service Worker](https://mswjs.io/docs/recipes/vitest-browser-mode/)
- Playwrightベストプラクティス
  [playwright.dev](https://playwright.dev/docs/best-practices)
- Next.js用Storybook
  [Storybook](https://storybook.js.org/docs/get-started/frameworks/nextjs)
- Chromaticビジュアルテスト
  [chromatic.com](https://www.chromatic.com/storybook)
- Biome移行ガイド
  [Biome](https://biomejs.dev/guides/migrate-eslint-prettier/)
- Tailwind × Next.jsセットアップ
  [Tailwind CSS](https://tailwindcss.com/docs/guides/nextjs)
- shadcn/ui Tailwind v4アップデート
  [Build your component library](https://ui.shadcn.com/docs/tailwind-v4)
- Supabase Auth-Helpers (App Router)
  [Supabase](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
