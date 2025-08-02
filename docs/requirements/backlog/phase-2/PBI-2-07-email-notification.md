# PBI-2-07: メール通知機能

## 説明

週次処理完了時にユーザーへ結果を通知するメール機能を実装します。処理統計、成功・失敗件数、エラー詳細を含む基本的な通知機能を提供します。

## 実装詳細

### 作成/修正するファイル

1. `src/lib/email-notification.ts` - メール通知処理（85行以内）
2. `src/templates/notification-email.html` - メールテンプレート（35行以内）

### 技術要件

- メール送信API（Resend/SendGrid等）
- HTMLメールテンプレート
- 処理結果サマリー
- エラーレポート

### 環境変数

```bash
EMAIL_API_KEY=your_email_api_key
NOTIFICATION_EMAIL=your_notification_email
EMAIL_FROM=noreply@yourdomain.com
```

### インターフェース仕様

```typescript
interface NotificationData {
  processedCount: number;
  successCount: number;
  failedCount: number;
  errors: string[];
  processedAt: Date;
}

interface EmailNotification {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface NotificationService {
  sendProcessingReport(data: NotificationData): Promise<boolean>;
  formatReport(data: NotificationData): EmailNotification;
}
```

## 🎯 実装前チェックリスト（影響範囲分析）

- [x] **影響範囲確認**: PBI-2-06完了後に実施、他への影響なし
- [x] **依存関係確認**: PBI-2-04（自動実行）完了が前提
- [x] **spec要件確認**: メール通知がspec必須要件
- [x] **リソース確認**: メール送信APIが利用可能

## 🔧 実装ガイドライン

### TooMuch回避指針
- **行数制限**: 通知処理85行、テンプレート35行以内
- **単一責任**: メール通知のみ、複雑な通知管理は含まない
- **直接実装**: 複雑な通知システムは使用しない

### コード品質基準
- **TypeScript**: 型安全な通知処理
- **エラーハンドリング**: メール送信失敗時の適切な処理
- **JSDoc**: 通知関数の説明記載

## 受け入れ基準

- [ ] 処理完了時にメール通知が送信される
- [ ] 処理結果が適切にフォーマットされる
- [ ] エラー詳細が含まれる
- [ ] TypeScriptエラーがない

### 検証コマンド

```bash
# TypeScript検証
yarn tsc --noEmit

# Lintチェック（Biome）
yarn lint

# テスト実行（Vitest）
yarn test

# メール通知テスト
yarn dev
# テスト用データでメール送信確認
```

### Git ワークフロー

**必須手順:**
1. **フィーチャーブランチ作成**: `git checkout -b feature/pbi-2-07-email-notification`
2. **実装・テスト・コミット**: 通常のコミット（`--no-verify`禁止）
3. **プッシュ**: `git push -u origin feature/pbi-2-07-email-notification`
4. **PR作成**: GitHub UIまたは`gh pr create`
5. **レビュー・マージ**: コンフリクトなしの場合は自動マージ可

**禁止事項:**
- ❌ **mainブランチへの直接コミット** - 必ずフィーチャーブランチを使用
- ❌ **`--no-verify`フラグ使用** - pre-commitチェックは必須
- ❌ **コンフリクト状態でのマージ** - 解決後に再実行

**コミットメッセージ規約:**
```
feat: PBI-2-07 email notification system

- Implement processing result email notifications
- Add HTML email templates and error reporting
- Set up automated user communication
```

## ✅ プロフェッショナルセルフレビュー

### 実装完了時必須チェック
- [ ] **影響範囲**: 既存PBIへの悪影響なし
- [ ] **要件達成**: メール通知機能が完了している
- [ ] **シンプル化**: 必要最小限の通知機能のみ
- [ ] **テスト**: メール通知テストがパスしている
- [ ] **型安全性**: TypeScript型チェックが正しく動作している

### 第三者視点コードレビュー観点
- [ ] **可読性**: 通知コードが理解しやすい
- [ ] **保守性**: 通知内容変更が容易な設計
- [ ] **セキュリティ**: メール送信が安全に実装されている
- [ ] **パフォーマンス**: 効率的な通知処理

## 📋 完了報告テンプレート

### ✅ セルフチェック結果
- TypeScript: ✅ 0エラー / ❌ Xエラー
- テスト: ✅ メール通知テストパス / ❌ X失敗  
- ドキュメント: ✅ 通知機能説明完備 / ❌ 不足
- 影響範囲: ✅ 他PBI機能に悪影響なし

### 実装サマリー
- **達成した価値**: 処理結果の自動通知により運用可視性が向上した
- **主要な実装**: メール送信API活用とHTMLテンプレート通知システム
- **残課題**: なし
- **次PBIへの引き継ぎ**: 通知機能がDrive保存機能で活用可能

## メタデータ

- **ステータス**: 未開始
- **実際のストーリーポイント**: [完了後に記入]
- **作成日**: 2025-07-28
- **開始日**: [日付]
- **完了日**: [日付]
- **担当者**: [AIアシスタントIDまたは人間]
- **レビュアー**: [このPBIをレビューした人]
- **実装メモ**: [完了後の学び]