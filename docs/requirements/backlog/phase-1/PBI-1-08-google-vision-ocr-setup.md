# PBI-1-08: Google Vision API OCRセットアップ

## 説明

Google Vision APIを使用してPDFファイルからテキストを抽出するOCR機能をセットアップします。API認証、基本的なOCR呼び出し、テキスト抽出の最小限の機能を実装します。

## 実装詳細

### 作成/修正するファイル

1. `src/lib/vision-ocr.ts` - Google Vision API OCR処理（80行以内）

### 技術要件

- Google Vision API v1使用
- PDFファイルからテキスト抽出
- API認証とエラーハンドリング
- レート制限対応

### 環境変数

```bash
# PBI-1-03で設定済み
GOOGLE_VISION_API_KEY=your_vision_api_key
```

### インターフェース仕様

```typescript
interface OCRResult {
  text: string;
  confidence: number;
  boundingBoxes?: BoundingBox[];
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface VisionOCR {
  extractText(filePath: string): Promise<OCRResult>;
  processDocument(buffer: Buffer): Promise<string>;
}
```

## 🎯 実装前チェックリスト（影響範囲分析）

- [x] **影響範囲確認**: PBI-1-06完了後に実施、他への影響なし
- [x] **依存関係確認**: PBI-1-06（PDF抽出）完了が前提
- [x] **spec要件確認**: OCR処理がspec必須要件
- [x] **リソース確認**: Google Vision API設定済み

## 🔧 実装ガイドライン

### TooMuch回避指針
- **行数制限**: OCR処理80行以内
- **単一責任**: テキスト抽出のみ、データ解析は含まない
- **直接実装**: 複雑な画像前処理は行わない

### コード品質基準
- **TypeScript**: 型安全なAPI応答処理
- **エラーハンドリング**: Vision API エラーの適切な処理
- **JSDoc**: OCR関数の説明記載

## 受け入れ基準

- [x] PDFファイルからテキストが抽出される
- [x] Vision API認証が正常に動作する
- [x] OCR結果が適切な形式で返される
- [x] TypeScriptエラーがない

### 検証コマンド

```bash
# TypeScript検証
yarn tsc --noEmit

# Lintチェック（Biome）
yarn lint

# テスト実行（Vitest）
yarn test

# OCRテスト
yarn dev
# テスト用PDFファイルでOCR処理確認
```

## 🚀 プロフェッショナル作業プロセス

### 👥 役割分担

**🧑‍💼 人間（プロジェクトマネージャー）:**
1. PBI提示・作業指示
2. 作業計画承認（Go/No-Go判断）
3. 外部AIレビュー依頼（コピペ実行）

**🤖 実装AI（実行担当）:**
1. 作業計画立案・提示
2. 技術実装・テスト・PR作成
3. 統合セルフレビュー・進捗記録
4. 外部レビュー依頼文生成・出力

**🔍 レビューAI（品質保証担当）:**
1. コード品質レビュー実施
2. 承認/要修正判断
3. PBI進捗最終更新・コミット
4. 完了宣言

### 📋 作業プロセス詳細

#### Phase 1: 計画・承認フェーズ

**Step 1-1: 人間 → PBI提示**
```
例: "PBI-1-08の作業をお願いします。まずは作業計画を立てて報告してください。"
```

**Step 1-2: 実装AI → 作業計画立案・提示**
- 前提条件確認結果
- 実装ファイル詳細  
- 技術アプローチ
- 検証手順
- リスク分析

**完了条件:** "実装が完了しました。レビューして次の指示をお願いします。"

**Step 1-3: 人間 → 承認判断**
```
承認: "進行してください"
修正要求: "○○を修正して再提案してください"
```

#### Phase 2: 実装・PR作成フェーズ

**Step 2-1: 実装AI → フィーチャーブランチ作成**
```bash
git checkout -b feature/pbi-1-08-vision-ocr-setup
```

**Step 2-2: 実装AI → 技術実装**
- コード実装
- 機能動作確認

**Step 2-3: 実装AI → 統合セルフレビュー（コミット前）**
```bash
# 技術検証
yarn tsc --noEmit
yarn lint
yarn test:run
yarn dev

# 変更内容レビュー
git diff

# 要件適合確認
# - PBI受け入れ基準チェック
# - 行数制限遵守確認
# - TooMuch回避確認
```

**Step 2-4: 実装AI → コミット・プッシュ・PR作成**
```bash
# コミット・プッシュ
git add .
git commit -m "feat: PBI-1-08 Google Vision API OCR setup"
git push -u origin feature/pbi-1-08-vision-ocr-setup

# PR作成
gh pr create --title "feat: PBI-1-08 Google Vision API OCR setup" --body "[structured body]"
```

**Step 2-5: 実装AI → セルフレビューチェックボックス記入**
- 実装完了時必須チェック（5項目）
- 第三者視点コードレビュー観点（4項目）

**Step 2-6: 実装AI → 外部レビュー依頼文生成・出力**

#### Phase 3: レビュー・完了フェーズ

**Step 3-1: 人間 → 外部AIレビュー依頼**
- 実装AIが出力したテキストを別AIにコピペ

**Step 3-2: レビューAI → 品質レビュー・完了処理**

1. **コード品質評価実施**

2. **評価結果による分岐：**

   **A. ❌要修正の場合：**
   - 具体的な修正点をリスト化
   - 修正方法の提案を含める
   - 「以下の修正が必要です」とユーザーに報告
   - 修正依頼文を出力して処理終了
   
   **B. ✅承認の場合：**
   - レビュー結果サマリーを提示
   - **「以下の作業を実施してよろしいですか？」と確認**
     - PBI進捗最終更新の内容提示
     - 進捗管理コミットの内容提示
     - PR承認・マージの確認
   
3. **ユーザー承認後（承認の場合のみ）：**
   - PBI進捗最終更新
   - 進捗管理コミット実行
   - PR承認・マージ・作業ブランチ削除
   - 完了宣言

## 🔍 外部AIレビュー依頼文（テンプレート）

**実装AI は以下のフォーマットで完全なコピペ用テキストを出力する:**

```markdown
## 🔍 外部AIレビュー依頼（コピペ用）

以下のテキストを別のAIにコピペして依頼してください：

---

## PBI実装レビュー依頼

### レビュー対象
- **プロジェクト**: freeeレシート自動化システム
- **PBI**: PBI-1-08 Google Vision API OCRセットアップ
- **実装内容**: Google Vision APIを活用したPDFファイルOCR機能
- **PRリンク**: [GitHub PR URL]

### レビュー観点
以下4つの観点で客観的レビューをお願いします：

#### 1. 技術品質 ⭐
- [ ] TypeScript型安全性とエラーハンドリング
- [ ] テストカバレッジと品質
- [ ] コード可読性と保守性
- [ ] セキュリティ考慮事項

#### 2. アーキテクチャ適合性 ⭐
- [ ] Next.js 15.4 + React 19 ベストプラクティス準拠
- [ ] プロジェクト構造との整合性
- [ ] 依存関係の適切性

#### 3. 要件適合性 ⭐
- [ ] PBI受け入れ基準100%達成
- [ ] spec要件との整合性
- [ ] TooMuch回避原則遵守

#### 4. 運用品質 ⭐
- [ ] エラー処理とログ出力
- [ ] パフォーマンス影響
- [ ] 将来の拡張性

### 確認対象ファイル
```
src/lib/vision-ocr.ts
```

### 検証手順
```bash
git checkout feature/pbi-1-08-vision-ocr-setup
yarn tsc --noEmit
yarn test:run
yarn dev
```


---

## ⚠️ 禁止事項・注意事項

**絶対禁止:**
- ❌ **mainブランチへの直接コミット** - 必ずフィーチャーブランチを使用
- ❌ **`--no-verify`フラグ使用** - pre-commitチェックは必須
- ❌ **コンフリクト状態でのマージ** - 解決後に再実行

**コミットメッセージ規約:**
```
feat: PBI-1-08 Google Vision API OCR setup

- Implement Google Vision API integration
- Add PDF text extraction functionality
- Set up OCR processing with error handling
```

## ✅ プロフェッショナルセルフレビュー

### 実装完了時必須チェック
- [ ] **影響範囲**: 既存PBIへの悪影響なし
- [ ] **要件達成**: OCR機能が完了している
- [ ] **シンプル化**: 必要最小限のOCR機能のみ
- [ ] **テスト**: OCR処理テストがパスしている
- [ ] **型安全性**: TypeScript型チェックが正しく動作している

### 第三者視点コードレビュー観点
- [ ] **可読性**: OCR処理コードが理解しやすい
- [ ] **保守性**: API呼び出しが適切に設計されている
- [ ] **セキュリティ**: API キーが安全に管理されている
- [ ] **パフォーマンス**: 効率的なOCR処理

## 📋 完了報告テンプレート

### ✅ セルフチェック結果
- TypeScript: ✅ 0エラー / ❌ Xエラー
- テスト: ✅ OCR処理テストパス / ❌ X失敗  
- ドキュメント: ✅ OCR機能説明完備 / ❌ 不足
- 影響範囲: ✅ 他PBI機能に悪影響なし

### 実装サマリー
- **達成した価値**: PDFレシートからテキスト情報が自動抽出可能になった
- **主要な実装**: Google Vision API活用OCR機能
- **残課題**: なし
- **次PBIへの引き継ぎ**: 抽出されたテキストがデータパース処理で使用可能

## メタデータ
### 進捗記入欄
- **ステータス**: 実装完了・レビュー済み
- **実際のストーリーポイント**: 1
- **作成日**: 2025-07-28
- **開始日**: 2025-08-23
- **完了日**: 2025-08-23
- **担当者**: Claude Code (pbi-orchestrator)
- **レビュアー**: Claude Code (品質レビュー)
- **実装メモ**: Google Vision API v1を使用したOCR機能実装。78行で必要十分な機能を実装、型安全性・エラーハンドリング完備。

### レビュー結果記入欄
- **総合判定**: ✅承認
- **主要な問題**: なし
- **改善提案**: 将来的にはboundingBoxes情報活用検討
- **品質スコア**: 4.5/5点
- **コメント**: プロダクションレディな高品質実装。堅牢なエラーハンドリング、完全な型安全性、PBI仕様完全準拠を確認。