# PBI-1-11: マッチングロジック（金額・日付）

## 説明

OCRで抽出されたレシートデータとfreee取引データを照合するマッチングロジックを実装します。金額・日付を基準とした基本的なマッチング機能を提供します。

## 実装詳細

### 作成/修正するファイル

1. `src/lib/receipt-matcher.ts` - レシート・取引マッチング処理（150行以内）

### 技術要件

- 金額完全一致・近似一致
- 日付範囲マッチング（±3日）
- 信頼度スコア計算
- 複数候補対応

### インターフェース仕様

```typescript
interface MatchResult {
  transaction: FreeeTransaction;
  receipt: ParsedReceiptData;
  score: number;
  matchType: 'exact' | 'approximate' | 'partial';
}

interface MatchingCriteria {
  amountTolerance: number;
  dateTolerance: number;
  minimumScore: number;
}

interface ReceiptMatcher {
  findMatches(receipt: ParsedReceiptData, transactions: FreeeTransaction[]): MatchResult[];
  calculateScore(receipt: ParsedReceiptData, transaction: FreeeTransaction): number;
}
```

## 🎯 実装前チェックリスト（影響範囲分析）

- [x] **影響範囲確認**: PBI-1-10完了後に実施、他への影響なし
- [x] **依存関係確認**: PBI-1-08, PBI-1-10完了が前提
- [x] **spec要件確認**: マッチング処理がspec必須要件
- [x] **リソース確認**: レシートデータと取引データが利用可能

## 🔧 実装ガイドライン

### TooMuch回避指針
- **行数制限**: マッチング処理150行以内
- **単一責任**: マッチングのみ、登録処理は含まない
- **直接実装**: 複雑なML/AI マッチングは使用しない

### コード品質基準
- **TypeScript**: 型安全なマッチング処理
- **エラーハンドリング**: マッチング失敗時の適切な処理
- **JSDoc**: マッチング関数の説明記載

## 受け入れ基準

- [ ] 金額・日付による基本マッチングが動作する
- [ ] 信頼度スコアが適切に計算される
- [ ] 複数候補が適切にランキングされる
- [ ] TypeScriptエラーがない

### 検証コマンド

```bash
# TypeScript検証
yarn tsc --noEmit

# Lintチェック（Biome）
yarn lint

# テスト実行（Vitest）
yarn test

# マッチングテスト
yarn dev
# テストデータでマッチング処理確認
```

### Git ワークフロー

**必須手順:**
1. **フィーチャーブランチ作成**: `git checkout -b feature/pbi-1-11-matching-logic`
2. **実装・テスト・コミット**: 通常のコミット（`--no-verify`禁止）
3. **プッシュ**: `git push -u origin feature/pbi-1-11-matching-logic`
4. **PR作成**: GitHub UIまたは`gh pr create`
5. **レビュー・マージ**: コンフリクトなしの場合は自動マージ可

**禁止事項:**
- ❌ **mainブランチへの直接コミット** - 必ずフィーチャーブランチを使用
- ❌ **`--no-verify`フラグ使用** - pre-commitチェックは必須
- ❌ **コンフリクト状態でのマージ** - 解決後に再実行

**コミットメッセージ規約:**
```
feat: PBI-1-11 receipt-transaction matching logic

- Implement amount and date-based matching
- Add confidence score calculation
- Set up multi-candidate ranking system
```

## ✅ プロフェッショナルセルフレビュー

### 実装完了時必須チェック
- [ ] **影響範囲**: 既存PBIへの悪影響なし
- [ ] **要件達成**: マッチング機能が完了している
- [ ] **シンプル化**: 必要最小限のマッチング機能のみ
- [ ] **テスト**: マッチング処理テストがパスしている
- [ ] **型安全性**: TypeScript型チェックが正しく動作している

### 第三者視点コードレビュー観点
- [ ] **可読性**: マッチング処理コードが理解しやすい
- [ ] **保守性**: マッチング条件が調整しやすい設計
- [ ] **セキュリティ**: データ処理が安全に実装されている
- [ ] **パフォーマンス**: 効率的なマッチング処理

## 📋 完了報告テンプレート

### ✅ セルフチェック結果
- TypeScript: ✅ 0エラー / ❌ Xエラー
- テスト: ✅ マッチング処理テストパス / ❌ X失敗  
- ドキュメント: ✅ マッチング機能説明完備 / ❌ 不足
- 影響範囲: ✅ 他PBI機能に悪影響なし

### 実装サマリー
- **達成した価値**: レシートと取引の自動マッチングが可能になった
- **主要な実装**: 金額・日付ベースのマッチングロジック
- **残課題**: なし
- **次PBIへの引き継ぎ**: マッチング結果が経費登録処理で使用可能

## メタデータ

- **ステータス**: 未開始
- **実際のストーリーポイント**: [完了後に記入]
- **作成日**: 2025-07-28
- **開始日**: [日付]
- **完了日**: [日付]
- **担当者**: [AIアシスタントIDまたは人間]
- **レビュアー**: [このPBIをレビューした人]
- **実装メモ**: [完了後の学び]