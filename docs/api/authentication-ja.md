# 認証APIドキュメント

このドキュメントでは、freee領収書自動化システムの認証システムとAPIエンドポイントについて説明します。

## 概要

認証システムはSupabase
Authをベースに構築されており、JWTトークンによる安全なユーザー登録、ログイン、セッション管理を提供します。

## 認証フロー

### 1. ユーザー登録

**エンドポイント**: `POST /api/auth/signup`

```typescript
// リクエスト
{
  email: string;
  password: string;
  confirmPassword: string;
}

// レスポンス (成功)
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

// レスポンス (エラー)
{
  error: {
    message: string;
    code?: string;
  }
}
```

**フロー**:

1. ユーザーが登録フォームを送信
2. サーバーが入力を検証し、Supabaseでユーザーを作成
3. メール確認を送信（有効な場合）
4. ユーザーをログインまたはダッシュボードにリダイレクト

### 2. ユーザーログイン

**エンドポイント**: `POST /api/auth/login`

```typescript
// リクエスト
{
  email: string;
  password: string;
}

// レスポンス (成功)
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

// レスポンス (エラー)
{
  error: {
    message: string;
    code?: string;
  }
}
```

### 3. ユーザーログアウト

**エンドポイント**: `POST /api/auth/logout`

```typescript
// リクエスト
{
} // ボディ不要 - セッションクッキーを使用

// レスポンス (成功)
{
  message: '正常にログアウトしました';
}

// レスポンス (エラー)
{
  error: {
    message: string;
  }
}
```

### 4. セッションリフレッシュ

**エンドポイント**: `POST /api/auth/refresh`

```typescript
// リクエスト
{
  refresh_token: string;
}

// レスポンス (成功)
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

// レスポンス (エラー)
{
  error: {
    message: string;
  }
}
```

## クライアントサイド認証

### 認証フックの使用

```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, signIn, signUp, signOut, isLoading } = useAuth();

  const handleSignIn = async (email: string, password: string) => {
    try {
      await signIn(email, password);
      // ユーザーは認証されました
    } catch (error) {
      console.error('サインインに失敗しました:', error);
    }
  };

  if (isLoading) return <div>読み込み中...</div>;

  return (
    <div>
      {user ? (
        <div>
          <p>ようこそ、{user.email}さん</p>
          <button onClick={signOut}>サインアウト</button>
        </div>
      ) : (
        <div>サインインしてください</div>
      )}
    </div>
  );
}
```

### Supabaseクライアントの直接使用

```typescript
import { supabase } from '@/lib/supabase/client';

// サインアップ
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});

// サインイン
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});

// 現在のセッションを取得
const {
  data: { session },
} = await supabase.auth.getSession();

// サインアウト
const { error } = await supabase.auth.signOut();
```

## ルート保護

### ミドルウェア保護

アプリケーションはNext.jsミドルウェアを使用してルートを保護します：

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // セッションがない場合はログインにリダイレクト
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  return res;
}
```

### 保護されたルート

- `/dashboard/*` - 認証が必要
- `/settings/*` - 認証が必要
- `/receipts/*` - 認証が必要
- `/auth/*` - 公開（ログイン/登録ページ）
- `/` - 公開（ランディングページ）

## セッション管理

### セッションストレージ

- **アクセストークン**: メモリに保存、1時間で期限切れ
- **リフレッシュトークン**: httpOnlyクッキーに保存、30日で期限切れ
- **自動リフレッシュ**: Supabaseクライアントが自動的に処理

### セッション検証

```typescript
// ユーザーが認証されているか確認
const isAuthenticated = async (): Promise<boolean> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return !!session;
};

// 現在のユーザーを取得
const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};
```

## エラー処理

### 一般的なエラーコード

| コード                      | メッセージ                       | 説明                                     |
| --------------------------- | -------------------------------- | ---------------------------------------- |
| `email_not_confirmed`       | メールが確認されていません       | ユーザーはメールを確認する必要があります |
| `invalid_credentials`       | 無効なログイン認証情報           | 間違ったメール/パスワードの組み合わせ    |
| `signup_disabled`           | サインアップが許可されていません | 登録が無効になっています                 |
| `email_rate_limit_exceeded` | 送信されたメールが多すぎます     | 確認メールのレート制限                   |
| `weak_password`             | パスワードが弱すぎます           | パスワードが要件を満たしていません       |

### エラーレスポンス形式

```typescript
interface AuthError {
  message: string;
  code?: string;
  details?: string;
}
```

### クライアントサイドのエラー処理

```typescript
try {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    switch (error.message) {
      case 'Invalid login credentials':
        setError('メールアドレスとパスワードを確認してください');
        break;
      case 'Email not confirmed':
        setError('メールを確認して確認リンクをクリックしてください');
        break;
      default:
        setError('予期しないエラーが発生しました');
    }
    return;
  }

  // 成功 - リダイレクトまたはUIを更新
} catch (error) {
  console.error('認証エラー:', error);
  setError('接続エラー - もう一度お試しください');
}
```

## セキュリティ機能

### パスワード要件

- 最小8文字
- 少なくとも1つの大文字
- 少なくとも1つの小文字
- 少なくとも1つの数字

### レート制限

- **ログイン試行**: IPあたり15分間に5回まで
- **登録**: IPあたり1時間に3回まで
- **パスワードリセット**: メールあたり5分間に1回まで

### CSRF保護

- すべてのAPIルートでCSRFトークンを使用
- ミドルウェアがリクエストを検証
- クッキーはhttpOnlyでsecure

## 認証のテスト

### ユニットテスト

```typescript
import { signIn, signUp, signOut } from '@/lib/auth';

describe('認証', () => {
  test('有効な認証情報でサインインする', async () => {
    const result = await signIn('test@example.com', 'password123');
    expect(result.user).toBeDefined();
    expect(result.session).toBeDefined();
  });

  test('無効な認証情報を拒否する', async () => {
    await expect(signIn('invalid@example.com', 'wrong')).rejects.toThrow();
  });
});
```

### E2Eテスト

```typescript
// e2e/auth.spec.ts
test('認証フローを完了する', async ({ page }) => {
  await page.goto('/auth/register');

  await page.fill('[data-testid=email]', 'test@example.com');
  await page.fill('[data-testid=password]', 'password123');
  await page.click('[data-testid=submit]');

  await expect(page).toHaveURL('/dashboard');
});
```

## 本番環境の考慮事項

### 環境変数

```bash
# 本番環境に必要
NEXT_PUBLIC_SUPABASE_URL=your_production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
```

### セキュリティチェックリスト

- ✅ すべてのテーブルでRLSポリシーが有効
- ✅ 本番環境でHTTPSを強制
- ✅ 安全なクッキー設定
- ✅ レート制限を設定
- ✅ メール確認を有効化
- ✅ 強力なパスワード要件

---

最終更新日: 2024-06-19
