# PBI-3-1-1: NextJSプロジェクトセットアップと設定

## 概要

TypeScript、Tailwind CSS、必須ビルド設定を含むNextJS
15プロジェクトを初期化。freee領収書自動化管理インターフェース用の基盤プロジェクト構造をセットアップする。

## 実装詳細

### 作成・変更するファイル

1. `package.json` - プロジェクト依存関係とスクリプト
2. `next.config.js` - カスタム設定を含むNextJS設定
3. `tsconfig.json` - TypeScript strict設定
4. `tailwind.config.ts` - Tailwind CSS設定
5. `src/app/layout.tsx` - ルートレイアウトコンポーネント
6. `src/app/page.tsx` - ホームページコンポーネント
7. `.eslintrc.json` - NextJSルールを含むESLint設定

### 技術要件

- App Routerを有効にしたNextJS 15
- パスマッピング付きのTypeScript strictモード
- カスタムデザイントークン付きのTailwind CSS 4.0
- コード品質のためのESLint + Prettier
- `@/`プレフィックスを使用した絶対インポートサポート

### 従うべきコードパターン

- App Routerファイルベースルーティングのみを使用
- 全データに適切なTypeScriptインターフェースを実装
- NextJS 15パフォーマンスベストプラクティスに従う
- デフォルトはServer Components、必要時にClient Components使用

## メタデータ

- **ステータス**: 未開始
- **作成日**: 2025-01-13
- **担当者**: AIアシスタント
- **レビュー者**: 人間開発者

## 受け入れ基準

- [ ] NextJS 15プロジェクトが正常に初期化される
- [ ] TypeScriptコンパイルがエラーなしで動作する
- [ ] Tailwind CSSがコンパイルされスタイルが正しく適用される
- [ ] ESLintとPrettier設定がアクティブになる
- [ ] プロジェクトが開発モードでビルド・実行される
- [ ] 基本ルーティング構造が動作する

### 検証コマンド

```bash
npm run build
npm run dev
npm run lint
npm run type-check
```

## 依存関係

- **必須**: なし（基盤タスク）

## テスト要件

- ビルド検証: プロジェクトが正常にコンパイルされる
- 型チェック: 全TypeScript型が正しく解決される
- リンティング: コードがESLintチェックを通過する

## 見積もり

1ストーリーポイント

## 優先度

高 - Phase 3開発全体に必要な基盤

## 実装メモ

- NextJS 15 App Routerのみを使用（Pages Routerは使用しない）
- freeeブランディング用カスタムカラーパレットでTailwindを設定
- コード整理改善のため絶対インポートをセットアップ
- より良いコード品質のためTypeScript strictモードを確保
