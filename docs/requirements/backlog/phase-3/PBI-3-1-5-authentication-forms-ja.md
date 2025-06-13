# PBI-3-1-5: 認証フォームとページ

## 概要

管理インターフェース用のログイン、登録、パスワードリセットフォームを検証、
エラーハンドリング、Supabase Auth統合で作成。

## 実装詳細

### 作成・変更するファイル

1. `src/app/auth/login/page.tsx` - ログインページコンポーネント
2. `src/app/auth/register/page.tsx` - 登録ページコンポーネント
3. `src/app/auth/reset-password/page.tsx` - パスワードリセットページ
4. `src/components/auth/LoginForm.tsx` - ログインフォームコンポーネント
5. `src/components/auth/RegisterForm.tsx` - 登録フォームコンポーネント
6. `src/lib/validations/auth.ts` - Zod検証スキーマ
7. `src/hooks/useAuth.ts` - 認証状態管理

### 技術要件

- Zod検証付きReact Hook Form
- 強度要件付きメール・パスワード検証
- 認証操作中のローディング状態
- エラーメッセージ表示とハンドリング
- モバイル・デスクトップ対応レスポンシブデザイン
- フォーム要素のアクセシビリティ準拠

### API統合

- `POST /auth/v1/token` - Supabase経由メール・パスワードログイン
- `POST /auth/v1/signup` - Supabase経由ユーザー登録
- `POST /auth/v1/recover` - Supabase経由パスワードリセット

### 検証スキーマ

```typescript
const loginSchema = z.object({
  email: z.string().email("無効なメールアドレスです"),
  password: z.string().min(8, "パスワードは8文字以上である必要があります"),
});

const registerSchema = z.object({
  email: z.string().email("無効なメールアドレスです"),
  password: z.string().min(8, "パスワードは8文字以上である必要があります"),
  confirmPassword: z.string(),
  fullName: z.string().min(2, "氏名は必須です"),
});
```

## メタデータ

- **ステータス**: 未開始
- **作成日**: 2025-01-13
- **担当者**: AIアシスタント
- **レビュー者**: 人間開発者

## 受け入れ基準

- [ ] ログインフォームがユーザーを正常に認証
- [ ] 登録フォームが新規ユーザーアカウントを作成
- [ ] パスワードリセットがリセットメールを正しく送信
- [ ] フォーム検証が明確なエラーメッセージを提供
- [ ] 認証操作中にローディング状態を表示
- [ ] フォームがレスポンシブでアクセシブル
- [ ] エラーハンドリングがネットワーク・検証エラーを管理

### 検証コマンド

```bash
npm run test:auth
npm run test:forms
npm run test:a11y
```

## 依存関係

- **必須**: PBI-3-1-2 - Supabase認証セットアップ
- **必須**: PBI-3-1-3 - 基本UIコンポーネント（Button、Input、Form）

## テスト要件

- フォーム検証: 全検証ルールとエラー状態をテスト
- 認証フロー: 完全なログイン・登録プロセスをテスト
- エラーハンドリング: ネットワークエラーと無効な認証情報をテスト

## 見積もり

2ストーリーポイント

## 優先度

高 - 管理インターフェースアクセスに必須

## 実装メモ

- 最適なパフォーマンスと検証のためReact Hook Formを使用
- 適切なパスワード強度インジケーターを実装
- 新規登録にメール検証フローを追加
- 認証失敗の適切なエラーハンドリングを確保
- ログイン状態保持機能の実装を検討
