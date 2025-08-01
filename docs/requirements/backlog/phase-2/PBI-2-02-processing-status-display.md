# PBI-2-02: 処理状況表示コンポーネント

## 説明

個別レシートの詳細処理状況を表示するコンポーネントを作成します。OCR結果、マッチング状況、登録ステータスを含む処理フローの可視化機能を実装します。

## 実装詳細

### 作成/修正するファイル

1. `src/components/Receipt/StatusDisplay.tsx` - 処理状況表示（80行以内）
2. `pages/receipt/[id].tsx` - レシート詳細ページ（40行以内）

### 技術要件

- ステップ表示UI
- リアルタイム状況更新
- エラー表示機能
- 進捗インジケーター

### インターフェース仕様

```typescript
interface ProcessingStatus {
  step: 'ocr' | 'parsing' | 'matching' | 'registration' | 'completed';
  status: 'pending' | 'processing' | 'success' | 'failed';
  message?: string;
  progress?: number;
}

interface ReceiptProcessingData {
  id: string;
  filename: string;
  currentStatus: ProcessingStatus;
  ocrResult?: OCRResult;
  matchResult?: MatchResult;
  registrationResult?: RegistrationResult;
}
```

## 🎯 実装前チェックリスト（影響範囲分析）

- [x] **影響範囲確認**: PBI-2-01完了後に実施、他への影響なし
- [x] **依存関係確認**: PBI-2-01（ダッシュボード）完了が前提
- [x] **spec要件確認**: 処理状況確認がspec必須要件
- [x] **リソース確認**: React コンポーネントが利用可能

## 🔧 実装ガイドライン

### TooMuch回避指針
- **行数制限**: ステータス表示80行、詳細ページ40行以内
- **単一責任**: 表示のみ、処理制御は含まない
- **直接実装**: 複雑なアニメーションは使用しない

### コード品質基準
- **TypeScript**: 型安全な状況表示
- **エラーハンドリング**: 状況取得失敗時の適切な表示
- **JSDoc**: コンポーネントの説明記載

## 受け入れ基準

- [ ] 処理ステップが段階的に表示される
- [ ] エラー状況が適切に表示される
- [ ] 詳細情報が確認できる
- [ ] TypeScriptエラーがない

### 検証コマンド

```bash
# TypeScript検証
yarn tsc --noEmit

# Lintチェック（Biome）
yarn lint

# テスト実行（Vitest）
yarn test

# 状況表示テスト
yarn dev
# /receipt/[id] にアクセスして表示確認
```

### Git ワークフロー

**必須手順:**
1. **フィーチャーブランチ作成**: `git checkout -b feature/pbi-2-02-status-display`
2. **実装・テスト・コミット**: 通常のコミット（`--no-verify`禁止）
3. **プッシュ**: `git push -u origin feature/pbi-2-02-status-display`
4. **PR作成**: GitHub UIまたは`gh pr create`
5. **レビュー・マージ**: コンフリクトなしの場合は自動マージ可

**禁止事項:**
- ❌ **mainブランチへの直接コミット** - 必ずフィーチャーブランチを使用
- ❌ **`--no-verify`フラグ使用** - pre-commitチェックは必須
- ❌ **コンフリクト状態でのマージ** - 解決後に再実行

**コミットメッセージ規約:**
```
feat: PBI-2-02 processing status display component

- Create step-by-step processing visualization
- Add real-time status updates and error display
- Implement receipt detail page with progress tracking
```

## ✅ プロフェッショナルセルフレビュー

### 実装完了時必須チェック
- [ ] **影響範囲**: 既存PBIへの悪影響なし
- [ ] **要件達成**: 処理状況表示が完了している
- [ ] **シンプル化**: 必要最小限の表示機能のみ
- [ ] **テスト**: 状況表示テストがパスしている
- [ ] **型安全性**: TypeScript型チェックが正しく動作している

### 第三者視点コードレビュー観点
- [ ] **可読性**: 状況表示コードが理解しやすい
- [ ] **保守性**: ステータス追加が容易な設計
- [ ] **セキュリティ**: データ表示が安全に実装されている
- [ ] **パフォーマンス**: 効率的な状況更新

## 📋 完了報告テンプレート

### ✅ セルフチェック結果
- TypeScript: ✅ 0エラー / ❌ Xエラー
- テスト: ✅ 状況表示テストパス / ❌ X失敗  
- ドキュメント: ✅ 状況表示機能説明完備 / ❌ 不足
- 影響範囲: ✅ 他PBI機能に悪影響なし

### 実装サマリー
- **達成した価値**: レシート処理の詳細状況が確認可能になった
- **主要な実装**: ステップ表示とリアルタイム状況更新UI
- **残課題**: なし
- **次PBIへの引き継ぎ**: 状況表示が手動修正機能で活用可能

## メタデータ

- **ステータス**: 未開始
- **実際のストーリーポイント**: [完了後に記入]
- **作成日**: 2025-07-28
- **開始日**: [日付]
- **完了日**: [日付]
- **担当者**: [AIアシスタントIDまたは人間]
- **レビュアー**: [このPBIをレビューした人]
- **実装メモ**: [完了後の学び]