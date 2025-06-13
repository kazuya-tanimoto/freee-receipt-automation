# PBI-3-1-6: アプリケーションレイアウトとナビゲーション

## 概要

管理インターフェースの認証済みダッシュボード領域用の
サイドバーナビゲーション、ヘッダー、レスポンシブデザインを含むメインアプリケーションレイアウトを作成。

## 実装詳細

### 作成・変更するファイル

1. `src/app/(dashboard)/layout.tsx` - ダッシュボードレイアウトラッパー
2. `src/components/layout/AppSidebar.tsx` - 折りたたみ可能サイドバーナビゲーション
3. `src/components/layout/AppHeader.tsx` - ユーザーメニュー付きヘッダー
4. `src/components/layout/NavigationItem.tsx` - 個別ナビゲーションアイテム
5. `src/components/layout/UserMenu.tsx` - ユーザープロファイルドロップダウン
6. `src/components/layout/BreadcrumbNav.tsx` - パンくずナビゲーション
7. `src/components/ErrorBoundary.tsx` - グローバルエラーバウンダリー
8. `src/lib/navigation.ts` - ナビゲーション設定

### 技術要件

- モバイル、タブレット、デスクトップで動作するレスポンシブレイアウト
- スムーズなアニメーション付き折りたたみ可能サイドバー
- ナビゲーション内のアクティブページハイライト
- ログアウト機能付きユーザープロファイルメニュー
- 深いページ用パンくずナビゲーション
- キーボードナビゲーションサポート

### エラーバウンダリー実装

- 予期しないエラーのグローバルエラーバウンダリー
- ユーザーフレンドリーなメッセージでの優雅なエラー処理
- 開発環境での詳細エラー表示
- 本番環境でのプロダクション安全なエラーメッセージ
- エラーレポートとログ統合
- 可能な場合の自動エラー回復

### ナビゲーション構造

```typescript
interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType;
  children?: NavigationItem[];
}

const navigationConfig = {
  main: [
    { id: "dashboard", label: "ダッシュボード", href: "/", icon: HomeIcon },
    { id: "receipts", label: "領収書", href: "/receipts", icon: ReceiptIcon },
    {
      id: "transactions",
      label: "取引",
      href: "/transactions",
      icon: CreditCardIcon,
    },
    { id: "settings", label: "設定", href: "/settings", icon: SettingsIcon },
  ],
};
```

## メタデータ

- **ステータス**: 未開始
- **作成日**: 2025-01-13
- **担当者**: AIアシスタント
- **レビュー者**: 人間開発者

## 受け入れ基準

- [ ] サイドバーナビゲーションが全メニューアイテムを正しく表示
- [ ] アクティブページがナビゲーション内でハイライト
- [ ] サイドバーがデスクトップでスムーズに折りたたみ・展開
- [ ] モバイルナビゲーションがドロワー・オーバーレイパターンで動作
- [ ] ユーザーメニューがプロファイル情報とログアウトオプションを表示
- [ ] パンくずナビゲーションが現在のページ階層を表示
- [ ] レイアウトが全画面サイズでレスポンシブ
- [ ] エラーバウンダリーがエラーを優雅にキャッチ・表示
- [ ] エラーバウンダリーが開発・本番環境で異なるメッセージ表示
- [ ] エラーバウンダリーがエラー回復メカニズムを提供

### 検証コマンド

```bash
npm run test:layout
npm run test:navigation
npm run test:responsive
npm run test:error-boundary
```

## 依存関係

- **必須**: PBI-3-1-3 - 基本UIコンポーネント
- **必須**: PBI-3-1-4 - 認証（ユーザーメニュー用）

## テスト要件

- ナビゲーション: メニューアイテムナビゲーションとアクティブ状態をテスト
- レスポンシブ: 異なる画面サイズでのレイアウト動作を検証
- アクセシビリティ: キーボードナビゲーションとスクリーンリーダーサポートをテスト

## 見積もり

2ストーリーポイント（エラーバウンダリー実装で+0.5 SP含む）

## 優先度

高 - 全認証済みページの基盤

## 実装メモ

- レスポンシブレイアウト構造にCSS GridとFlexboxを使用
- アクセシビリティのため適切なフォーカス管理を実装
- サイドバー折りたたみ・展開にスムーズトランジションを追加

### エラーバウンダリー実装

- アプリケーション全体をErrorBoundaryコンポーネントでラップ
- componentDidCatchライフサイクルでReact.ErrorBoundaryを使用
- 環境固有エラー表示ロジックを実装
- ページ・コンポーネントリセット付きエラー回復ボタンを追加
- エラー追跡のためログサービスとの統合
