# PBI-2-01: 基本ダッシュボードページ

## 説明

レシート処理状況を確認できる基本的なダッシュボードページを作成します。処理済み・未処理のレシート一覧、処理統計、基本的なナビゲーションを含むシンプルなUIを実装します。

## 実装詳細

### 作成/修正するファイル

1. `pages/dashboard.tsx` - メインダッシュボードページ（90行以内）
2. `src/components/Dashboard/Stats.tsx` - 統計表示コンポーネント（30行以内）

### 技術要件

- Next.js App Router使用
- レスポンシブデザイン（基本）
- 処理状況表示
- 基本的なナビゲーション

### インターフェース仕様

```typescript
interface DashboardStats {
  totalProcessed: number;
  totalPending: number;
  successRate: number;
  lastProcessed?: Date;
}

interface DashboardProps {
  stats: DashboardStats;
  recentReceipts: ProcessedReceipt[];
}

interface ProcessedReceipt {
  id: string;
  filename: string;
  amount?: number;
  status: 'success' | 'pending' | 'failed';
  processedAt: Date;
}
```

## 🎯 実装前チェックリスト（影響範囲分析）

- [x] **影響範囲確認**: Phase 1完了後に実施、他への影響なし
- [x] **依存関係確認**: PBI-1-12（経費登録）完了が前提
- [x] **spec要件確認**: 管理UIがspec必須要件
- [x] **リソース確認**: Next.jsプロジェクトが利用可能

## 🔧 実装ガイドライン

### TooMuch回避指針
- **行数制限**: ダッシュボード90行、コンポーネント30行以内
- **単一責任**: 表示のみ、複雑な状態管理は含まない
- **直接実装**: 重いUIライブラリは使用しない

### コード品質基準
- **TypeScript**: 型安全なコンポーネント
- **エラーハンドリング**: データ取得失敗時の適切な表示
- **JSDoc**: コンポーネントの説明記載

## 受け入れ基準

- [ ] ダッシュボードページが正常に表示される
- [ ] 処理統計が適切に表示される
- [ ] レシート一覧が確認できる
- [ ] TypeScriptエラーがない

### 検証コマンド

```bash
# TypeScript検証
yarn tsc --noEmit

# Lintチェック（Biome）
yarn lint

# テスト実行（Vitest）
yarn test

# ダッシュボードテスト
yarn dev
# /dashboard にアクセスして表示確認
```

### Git ワークフロー

**必須手順:**
1. **フィーチャーブランチ作成**: `git checkout -b feature/pbi-2-01-basic-dashboard`
2. **実装・テスト・コミット**: 通常のコミット（`--no-verify`禁止）
3. **プッシュ**: `git push -u origin feature/pbi-2-01-basic-dashboard`
4. **PR作成**: GitHub UIまたは`gh pr create`
5. **レビュー・マージ**: コンフリクトなしの場合は自動マージ可

**禁止事項:**
- ❌ **mainブランチへの直接コミット** - 必ずフィーチャーブランチを使用
- ❌ **`--no-verify`フラグ使用** - pre-commitチェックは必須
- ❌ **コンフリクト状態でのマージ** - 解決後に再実行

**コミットメッセージ規約:**
```
feat: PBI-2-01 basic dashboard page

- Create receipt processing overview dashboard
- Add statistics display and navigation
- Implement responsive basic UI layout
```

## ✅ プロフェッショナルセルフレビュー

### 実装完了時必須チェック
- [ ] **影響範囲**: 既存PBIへの悪影響なし
- [ ] **要件達成**: ダッシュボード機能が完了している
- [ ] **シンプル化**: 必要最小限のUI機能のみ
- [ ] **テスト**: ダッシュボード表示テストがパスしている
- [ ] **型安全性**: TypeScript型チェックが正しく動作している

### 第三者視点コードレビュー観点
- [ ] **可読性**: UIコードが理解しやすい
- [ ] **保守性**: コンポーネントが修正しやすい設計
- [ ] **セキュリティ**: データ表示が安全に実装されている
- [ ] **パフォーマンス**: 効率的なレンダリング

## 📋 完了報告テンプレート

### ✅ セルフチェック結果
- TypeScript: ✅ 0エラー / ❌ Xエラー
- テスト: ✅ ダッシュボード表示テストパス / ❌ X失敗  
- ドキュメント: ✅ UI機能説明完備 / ❌ 不足
- 影響範囲: ✅ 他PBI機能に悪影響なし

### 実装サマリー
- **達成した価値**: レシート処理状況の可視化が可能になった
- **主要な実装**: React ベースダッシュボードUI
- **残課題**: なし
- **次PBIへの引き継ぎ**: ダッシュボードが他UI機能のベースとして利用可能

## メタデータ

- **ステータス**: 未開始
- **実際のストーリーポイント**: [完了後に記入]
- **作成日**: 2025-07-28
- **開始日**: [日付]
- **完了日**: [日付]
- **担当者**: [AIアシスタントIDまたは人間]
- **レビュアー**: [このPBIをレビューした人]
- **実装メモ**: [完了後の学び]