# PBI-2-08: Google Drive保存

## 説明

処理済みレシートファイルをGoogle Driveに整理して保存する機能を実装します。月別フォルダ作成、短縮ファイル名、重複回避を含む基本的なファイル管理機能を提供します。

## 実装詳細

### 作成/修正するファイル

1. `src/lib/drive-storage.ts` - Google Drive保存処理（120行以内）

### 技術要件

- Google Drive API v3使用
- 月別フォルダ自動作成
- 短縮ファイル名生成
- 重複ファイル回避

### 環境変数

```bash
# PBI-1-03で設定済み
GOOGLE_DRIVE_API_KEY=your_drive_api_key
DRIVE_FOLDER_ID=your_base_folder_id
```

### インターフェース仕様

```typescript
interface DriveFileInfo {
  name: string;
  folderId: string;
  fileId?: string;
  webViewLink?: string;
}

interface DriveStorage {
  saveReceipt(file: Buffer, originalName: string, date: Date): Promise<DriveFileInfo>;
  createMonthlyFolder(date: Date): Promise<string>;
  generateShortName(originalName: string): string;
  checkDuplicate(folderId: string, filename: string): Promise<boolean>;
}

interface FolderStructure {
  baseFolder: string;
  year: number;
  month: number;
  path: string;
}
```

## 🎯 実装前チェックリスト（影響範囲分析）

- [x] **影響範囲確認**: PBI-2-07完了後に実施、他への影響なし
- [x] **依存関係確認**: PBI-2-05（通知機能）完了が前提
- [x] **spec要件確認**: Drive保存がspec必須要件
- [x] **リソース確認**: Google Drive APIが利用可能

## 🔧 実装ガイドライン

### TooMuch回避指針
- **行数制限**: Drive保存処理120行以内
- **単一責任**: ファイル保存のみ、複雑な同期機能は含まない
- **直接実装**: 複雑なファイル管理ライブラリは使用しない

### コード品質基準
- **TypeScript**: 型安全なファイル操作
- **エラーハンドリング**: Drive API エラーの適切な処理
- **JSDoc**: Drive操作関数の説明記載

## 受け入れ基準

- [ ] Google Driveにファイルが正常に保存される
- [ ] 月別フォルダが自動作成される
- [ ] 短縮ファイル名が適用される
- [ ] TypeScriptエラーがない

### 検証コマンド

```bash
# TypeScript検証
yarn tsc --noEmit

# Lintチェック（Biome）
yarn lint

# テスト実行（Vitest）
yarn test

# Drive保存テスト
yarn dev
# テストファイルでDrive保存処理確認
```

### Git ワークフロー

**必須手順:**
1. **フィーチャーブランチ作成**: `git checkout -b feature/pbi-2-08-drive-storage`
2. **実装・テスト・コミット**: 通常のコミット（`--no-verify`禁止）
3. **プッシュ**: `git push -u origin feature/pbi-2-08-drive-storage`
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
feat: PBI-2-08 Google Drive storage integration

- Implement receipt file storage to Google Drive
- Add monthly folder organization and duplicate handling
- Complete end-to-end file management system
```

## ✅ プロフェッショナルセルフレビュー

### 実装完了時必須チェック
- [ ] **影響範囲**: 既存PBIへの悪影響なし
- [ ] **要件達成**: Google Drive保存が完了している
- [ ] **シンプル化**: 必要最小限の保存機能のみ
- [ ] **テスト**: Drive保存テストがパスしている
- [ ] **型安全性**: TypeScript型チェックが正しく動作している

### 第三者視点コードレビュー観点
- [ ] **可読性**: Drive保存コードが理解しやすい
- [ ] **保守性**: フォルダ構造変更が容易な設計
- [ ] **セキュリティ**: Drive API使用が安全に実装されている
- [ ] **パフォーマンス**: 効率的なファイル保存

## 📋 完了報告テンプレート

### ✅ セルフチェック結果
- TypeScript: ✅ 0エラー / ❌ Xエラー
- テスト: ✅ Drive保存テストパス / ❌ X失敗  
- ドキュメント: ✅ Drive保存機能説明完備 / ❌ 不足
- 影響範囲: ✅ 他PBI機能に悪影響なし

### 実装サマリー
- **達成した価値**: レシートファイルの整理された永続保存が実現した
- **主要な実装**: Google Drive API活用と月別フォルダ管理システム
- **残課題**: なし
- **次PBIへの引き継ぎ**: 全18PBI完了によりspec要件100%達成

## メタデータ

- **ステータス**: 未開始
- **実際のストーリーポイント**: [完了後に記入]
- **作成日**: 2025-07-28
- **開始日**: [日付]
- **完了日**: [日付]
- **担当者**: [AIアシスタントIDまたは人間]
- **レビュアー**: [このPBIをレビューした人]
- **実装メモ**: [完了後の学び]