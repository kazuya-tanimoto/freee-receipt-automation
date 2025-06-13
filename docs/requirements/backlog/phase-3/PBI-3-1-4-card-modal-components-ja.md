# PBI-3-1-4: カードとモーダルUIコンポーネント

## 説明

shadcn/uiパターンを使用してCardレイアウトとModalダイアログコンポーネントを実装し、
柔軟なコンテンツレイアウト、レスポンシブデザイン、アクセシビリティ機能を提供します。

## 実装詳細

### 作成/修正するファイル

1. `src/components/ui/card.tsx` - カードレイアウトコンポーネント
2. `src/components/ui/dialog.tsx` - モーダルダイアログコンポーネント
3. `src/components/ui/sheet.tsx` - サイドパネルコンポーネント
4. `src/components/ui/alert.tsx` - アラート/通知コンポーネント
5. `src/components/ui/popover.tsx` - ポップオーバーコンポーネント
6. `src/hooks/useModal.ts` - モーダル状態管理フック
7. `src/lib/modal-stack.ts` - モーダルスタック管理ユーティリティ

### 技術要件

- Radix UIプリミティブを使用したshadcn/ui v0.8+
- カードセクション: header、content、footerの柔軟なレイアウト
- モーダル種類: dialog、sheet、popover、alert
- フォーカストラップとエスケープキー処理
- モーダルのポータルレンダリング
- framer-motionでのアニメーション対応
- モバイルとデスクトップのレスポンシブデザイン
- アクセシビリティ準拠（WCAG 2.1 AA）

### 従うべきコードパターン

- アクセシビリティのためのRadix UIプリミティブを使用
- 複合コンポーネントパターンの実装
- モーダル状態のためのReact.createContext使用
- モーション軽減対応のアニメーションベストプラクティス
- テーマ用のCSSカスタムプロパティ使用

### インターフェース仕様

```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline" | "elevated";
  padding?: "none" | "sm" | "md" | "lg";
}

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

interface AlertProps {
  variant?: "default" | "destructive" | "warning" | "success";
  title?: string;
  description?: string;
  action?: React.ReactNode;
}
```

### セキュリティ考慮事項

- 動的コンテンツでのXSS防止
- モーダルのクリックジャッキング保護
- セキュリティ重要ダイアログのフォーカス管理
- 適切なエスケープキー処理

### パフォーマンス最適化

- モーダルコンテンツの遅延読み込み
- DOMパフォーマンスのためのポータル最適化
- GPU加速を使ったアニメーションパフォーマンス
- アンマウントモーダルのメモリクリーンアップ

## メタデータ

- **ステータス**: 未開始
- **作成日**: 2025-01-13
- **担当者**: AIアシスタント
- **レビュー担当者**: 人間の開発者

## 受け入れ基準

- [ ] Cardコンポーネントが柔軟なコンテンツレイアウトをサポート
- [ ] Modalコンポーネントがフォーカス管理を正しく処理
- [ ] Sheetコンポーネントが指定方向からスライドイン
- [ ] Alertコンポーネントが通知を適切に表示
- [ ] 全コンポーネントが適切なARIA属性でアクセシブル
- [ ] コンポーネントが異なる画面サイズで一貫して動作

### 検証コマンド

```bash
npm run build
npm run test:components
npm run test:a11y
```

## 依存関係

- **必須**: PBI-3-1-3 - ボタンとフォームコンポーネント（モーダルアクション用）

## テスト要件

- Unit Tests (Vitest): コンポーネントレンダリング、プロパティ処理、状態管理
- Integration Tests (Testing Library): モーダルインタラクション、フォーカス管理
- Accessibility Tests: フォーカストラップ、キーボードナビゲーション、スクリーンリーダー対応
- Visual Regression Tests: レイアウトバリエーションとレスポンシブ動作

### テストカバレッジ要件

- コンポーネントレンダリング: 100%
- フォーカス管理: 100%
- ユーザーインタラクション: 90%
- アクセシビリティ: 100%

## 見積もり

1 ストーリーポイント

## 優先度

高 - レイアウト構造とユーザーインタラクションに必須

## 実装ノート

- モーダルアクセシビリティのためのRadix UI Dialogプリミティブを使用
- モーダル閉時の適切なフォーカス復元実装
- モーション軽減設定を尊重したアニメーション対応追加
- ネストモーダルの適切なz-index管理確保
