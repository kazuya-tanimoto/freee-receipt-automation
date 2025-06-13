# PBI-3-1-3: 基本UIコンポーネントライブラリ

## 概要

一貫したスタイリングとアクセシビリティ機能を備えたButton、Input、Card、
フォームコンポーネントを含む、shadcn/uiパターンを使用した基盤UIコンポーネントを実装。

## 実装詳細

### 作成・変更するファイル

1. `components.json` - shadcn/ui設定ファイル
2. `src/components/ui/button.tsx` - バリアント付きButtonコンポーネント
3. `src/components/ui/input.tsx` - 検証状態付きInputフィールド
4. `src/components/ui/card.tsx` - Cardレイアウトコンポーネント
5. `src/components/ui/form.tsx` - 検証付きFormコンポーネント
6. `src/lib/utils.ts` - コンポーネントスタイリング用ユーティリティ関数
7. `src/styles/globals.css` - グローバルスタイルとCSS変数

### 技術要件

- Tailwind CSS統合付きshadcn/ui v0.8+
- Buttonバリアント: primary、secondary、outline、ghost、destructive
- Input状態: default、error、disabled、focus
- Cardセクション: header、content、footer
- React Hook Formとのフォーム検証統合
- アクセシビリティ準拠（WCAG 2.1 AA）

### 従うべきコードパターン

- CSS変数付きTailwindユーティリティクラスを使用
- 柔軟性のための複合コンポーネントパターンを実装
- 適切なref処理のためforwardRefを使用
- フォームコンポーネントにReact Hook Formパターンを従う

### インターフェース仕様

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  loading?: boolean;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helperText?: string;
}
```

## メタデータ

- **ステータス**: 未開始
- **作成日**: 2025-01-13
- **担当者**: AIアシスタント
- **レビュー者**: 人間開発者

## 受け入れ基準

- [ ] Buttonコンポーネントが全バリアントを正しくレンダリング
- [ ] Inputコンポーネントが検証とエラー状態を処理
- [ ] Cardコンポーネントが柔軟なコンテンツレイアウトをサポート
- [ ] Formコンポーネントが検証ライブラリと統合
- [ ] 全コンポーネントが適切なARIA属性でアクセシブル
- [ ] コンポーネントが異なるブラウザで一貫して動作

### 検証コマンド

```bash
npm run build
npm run test:components
npm run test:a11y
```

## 依存関係

- **必須**: PBI-3-1-1 - Tailwind CSS付きNextJSプロジェクト

## テスト要件

- コンポーネントレンダリング: 全バリアントと状態をテスト
- アクセシビリティ: ARIA属性とキーボードナビゲーションを検証
- 統合: フォームライブラリと検証でテスト

## 見積もり

2ストーリーポイント

## 優先度

高 - アプリケーション内全UIコンポーネントの基盤

## 実装メモ

- テーマ変数にCSS custom propertiesを使用
- アクセシビリティのため適切なフォーカス管理を実装
- インタラクティブコンポーネントにローディング・無効状態を追加
- フォーム検証ライブラリとの動作を確保
