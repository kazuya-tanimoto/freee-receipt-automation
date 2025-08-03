# PBI-2-06: 実行監視（ログ・エラー追跡）

## 説明

自動実行の履歴、ログ、エラー情報を記録・管理する監視システムを実装します。処理の成功/失敗状況を追跡し、問題発生時の調査と改善に必要な情報を提供します。

## 実装詳細

### 作成/修正するファイル

1. `src/lib/monitoring.ts` - 実行監視機能（40行以内）

### 技術要件

- Supabase Database (PostgreSQL)
- TypeScript
- ログ記録とエラー追跡

### インターフェース仕様

```typescript
interface ExecutionLog {
  id: string;
  executionId: string;
  startedAt: Date;
  completedAt?: Date;
  status: 'running' | 'completed' | 'failed';
  processedCount: number;
  errorCount: number;
  errors?: string[];
  metadata?: Record<string, any>;
}

interface ExecutionMonitor {
  startExecution(): Promise<string>; // executionId
  logProgress(executionId: string, data: Partial<ExecutionLog>): Promise<void>;
  completeExecution(executionId: string, result: ProcessingResult): Promise<void>;
  getExecutionHistory(limit?: number): Promise<ExecutionLog[]>;
}
```

## 🎯 実装前チェックリスト（影響範囲分析）

- [x] **影響範囲確認**: PBI-2-05完了後に実施
- [x] **依存関係確認**: Edge Function（PBI-2-04）と連携
- [x] **spec要件確認**: エラー追跡と履歴管理
- [x] **リソース確認**: Supabase Database利用可能

## 🔧 実装ガイドライン

### TooMuch回避指針
- **行数制限**: 40行以内で監視機能実装
- **単一責任**: ログ記録とエラー追跡のみ
- **直接実装**: シンプルなDB操作

### コード品質基準
- **TypeScript**: 完全な型定義
- **エラー処理**: ログ記録失敗時の考慮
- **JSDoc**: 監視機能の説明記載

## 受け入れ基準

- [ ] 実行開始/終了が記録される
- [ ] エラー情報が保存される
- [ ] 履歴の取得が可能
- [ ] TypeScriptエラーがない

### 検証コマンド

```bash
# TypeScript検証
yarn tsc --noEmit

# Lintチェック（Biome）
yarn lint

# テスト実行（Vitest）
yarn test

# モニタリングテスト
yarn test -- monitoring.test.ts
```

### Git ワークフロー

**必須手順:**
1. **フィーチャーブランチ作成**: `git checkout -b feature/pbi-2-06-execution-monitoring`
2. **実装・テスト・コミット**: 通常のコミット（`--no-verify`禁止）
3. **プッシュ**: `git push -u origin feature/pbi-2-06-execution-monitoring`
4. **PR作成**: GitHub UIまたは`gh pr create`
5. **レビュー・マージ**: コンフリクトなしの場合は自動マージ可

## 🚨 実装完了後の必須作業

**技術実装完了後に必ず実行すること:**

1. **セルフレビューチェックボックス記入**
   - 「実装完了時必須チェック」の全項目を[x]に変更
   - 「第三者視点コードレビュー観点」の全項目を[x]に変更

2. **完了報告テンプレート記入**
   - TypeScript・テスト・ドキュメント・影響範囲の結果を正確に記入
   - 実装サマリーを具体的に記載

3. **メタデータ更新**
   - ステータスを「完了」に変更
   - 実際のストーリーポイントを記入
   - 開始日・完了日・担当者・実装メモを記入

4. **進捗管理コミット**
   - 上記変更をコミットして進捗を正式に記録

5. **外部レビュー依頼**
   - 以下のレビュー依頼文をコピペして他のAIにレビューを依頼

```
## PBI実装レビュー依頼

### レビュー対象
- **プロジェクト**: freeeレシート自動化システム
- **PBI**: [PBI番号と名称]
- **実装内容**: [実装した機能の概要]

### レビュー観点
以下の観点で客観的なレビューをお願いします：

#### 1. 技術品質
- [ ] TypeScript型安全性とエラーハンドリング
- [ ] テストカバレッジと品質
- [ ] コード可読性と保守性
- [ ] セキュリティ考慮事項

#### 2. アーキテクチャ適合性
- [ ] Next.js 15.4 + React 19 ベストプラクティス準拠
- [ ] プロジェクト構造との整合性
- [ ] 依存関係の適切性

#### 3. 要件適合性
- [ ] PBI受け入れ基準100%達成
- [ ] spec要件との整合性
- [ ] TooMuch回避原則遵守

#### 4. 運用品質
- [ ] エラー処理とログ出力
- [ ] パフォーマンス影響
- [ ] 将来の拡張性

### 確認対象ファイル
```
[実装したファイルのパスを列挙]
```

### 実行確認
```bash
# TypeScript検証
yarn tsc --noEmit

# テスト実行
yarn test:run

# 動作確認
yarn dev
```

### レビュー結果記入
- **承認/要修正**: 
- **主要な問題**: 
- **改善提案**: 
- **その他コメント**: 
```

**⚠️ 重要**: この作業を怠ると進捗追跡ができなくなります

**禁止事項:**
- ❌ **mainブランチへの直接コミット** - 必ずフィーチャーブランチを使用
- ❌ **`--no-verify`フラグ使用** - pre-commitチェックは必須
- ❌ **コンフリクト状態でのマージ** - 解決後に再実行

**コミットメッセージ規約:**
```
feat: PBI-2-06 execution monitoring and logging

- Implement execution log tracking system
- Add error monitoring and history management
- Set up automated processing visibility
```

## ✅ プロフェッショナルセルフレビュー

### 実装完了時必須チェック
- [ ] **影響範囲**: 監視機能のみ
- [ ] **要件達成**: ログ・エラー追跡完了
- [ ] **シンプル化**: 必要最小限の記録機能
- [ ] **テスト**: 監視機能テストパス
- [ ] **型安全性**: TypeScript型チェック完了

### 第三者視点コードレビュー観点
- [ ] **可読性**: ログ構造が明確
- [ ] **保守性**: ログ項目の追加が容易
- [ ] **信頼性**: ログ記録の確実性
- [ ] **パフォーマンス**: 効率的なDB操作

## 📋 完了報告テンプレート

### ✅ セルフチェック結果
- TypeScript: ✅ 0エラー / ❌ Xエラー
- テスト: ✅ 監視機能テストパス / ❌ X失敗
- ドキュメント: ✅ ログ仕様説明完備 / ❌ 不足
- 影響範囲: ✅ 監視機能のみ

### 実装サマリー
- **達成した価値**: 自動実行の可視化と問題追跡
- **主要な実装**: 実行ログとエラー記録システム
- **残課題**: なし
- **次PBIへの引き継ぎ**: 監視データが通知で活用可能

## メタデータ

- **ステータス**: 未開始
- **実際のストーリーポイント**: [完了後に記入]
- **作成日**: 2025-08-02
- **開始日**: [日付]
- **完了日**: [日付]
- **担当者**: [AIアシスタントIDまたは人間]
- **レビュアー**: [このPBIをレビューした人]
- **実装メモ**: [完了後の学び]