# PBI-2-04: Edge Function実装（処理オーケストレーション）

## 説明

Supabase Edge Functionsを使用してレシート処理の全体的なワークフローを制御するオーケストレーション機能を実装します。Gmail取得、OCR処理、freee連携の一連の処理を統合し、エラーハンドリングを含む基本的な処理フローを構築します。

## 実装詳細

### 作成/修正するファイル

1. `supabase/functions/weekly-process/index.ts` - 処理オーケストレーション（55行以内）

### 技術要件

- Supabase Edge Functions
- TypeScript
- 処理フロー制御
- 基本的なエラーハンドリング

### インターフェース仕様

```typescript
interface ProcessingResult {
  success: boolean;
  processedCount: number;
  errors: string[];
  startedAt: Date;
  completedAt: Date;
}

interface EdgeFunctionOrchestrator {
  orchestrateProcessing(): Promise<ProcessingResult>;
}
```

## 🎯 実装前チェックリスト（影響範囲分析）

- [x] **影響範囲確認**: PBI-2-03完了後に実施
- [x] **依存関係確認**: Phase 1全機能（Gmail/OCR/freee）が前提
- [x] **spec要件確認**: 自動処理のコア機能
- [x] **リソース確認**: Supabase Edge Functions利用可能

## 🔧 実装ガイドライン

### TooMuch回避指針
- **行数制限**: 55行以内で処理フローを実装
- **単一責任**: オーケストレーションのみ、個別処理は含まない
- **直接実装**: 複雑なワークフローエンジンは使用しない

### コード品質基準
- **TypeScript**: 完全な型定義
- **エラーハンドリング**: try-catchで基本的なエラー処理
- **JSDoc**: 処理フローの説明記載

## 受け入れ基準

- [ ] 処理フローが正常に動作する
- [ ] エラー時に適切に処理が中断される
- [ ] 処理結果が返される
- [ ] TypeScriptエラーがない

### 検証コマンド

```bash
# TypeScript検証
yarn tsc --noEmit

# Lintチェック（Biome）
yarn lint

# テスト実行（Vitest）
yarn test

# Edge Function テスト
supabase functions serve
# 手動でEdge Function呼び出し確認
```

## ✅ プロフェッショナルセルフレビュー

### 実装完了時必須チェック
- [ ] **影響範囲**: Phase 1機能を適切に呼び出している
- [ ] **要件達成**: 処理オーケストレーションが完了
- [ ] **シンプル化**: 必要最小限のフロー制御のみ
- [ ] **テスト**: Edge Function動作確認完了
- [ ] **型安全性**: TypeScript型チェックがパス

### 第三者視点コードレビュー観点
- [ ] **可読性**: 処理フローが明確
- [ ] **保守性**: 処理の追加/変更が容易
- [ ] **エラー処理**: 適切なエラーハンドリング
- [ ] **パフォーマンス**: 効率的な処理順序

## 📋 完了報告テンプレート

### ✅ セルフチェック結果
- TypeScript: ✅ 0エラー / ❌ Xエラー
- テスト: ✅ Edge Function動作確認 / ❌ X失敗  
- ドキュメント: ✅ 処理フロー説明完備 / ❌ 不足
- 影響範囲: ✅ Phase 1機能正常動作

### 実装サマリー
- **達成した価値**: 自動処理の中核となるオーケストレーション機能
- **主要な実装**: Supabase Edge Functionsによる処理統合
- **残課題**: なし
- **次PBIへの引き継ぎ**: オーケストレーション関数が利用可能

## メタデータ

- **ステータス**: 未開始
- **実際のストーリーポイント**: [完了後に記入]
- **作成日**: 2025-08-02
- **開始日**: [日付]
- **完了日**: [日付]
- **担当者**: [AIアシスタントIDまたは人間]
- **レビュアー**: [このPBIをレビューした人]
- **実装メモ**: [完了後の学び]