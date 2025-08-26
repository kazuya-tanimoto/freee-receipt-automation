# freeeレシート自動化システム - 使い方ガイド

フリーランサー向けの週4枚のレシート処理を自動化するMinimalな経費管理システムの完全ガイドです。

## 📋 目次

1. [システム概要](#システム概要)
2. [初期セットアップ](#初期セットアップ)
3. [日常的な使い方](#日常的な使い方)
4. [運用・メンテナンス](#運用メンテナンス)
5. [FAQ・トラブルシューティング](#faqトラブルシューティング)

## システム概要

### 🎯 何ができるシステムか

このシステムは、フリーランスITエンジニアの経費管理を自動化します：

- **週4枚のレシート処理**を完全自動化
- **Gmail監視**でApple課金等のレシートメールを自動取得
- **OCR処理**でPDF添付ファイルからデータを自動抽出
- **freee連携**で取引データとの自動マッチング・経費登録
- **年間$5以下の運用コスト**でクラウド運用

### 🔄 自動処理フロー

```
月曜9時 → Gmail監視 → OCR処理 → freee連携 → 結果通知 → Drive保存
   ↓         ↓         ↓         ↓         ↓         ↓
pg_cron   PDFメール   Vision API  取引照合   メール送信  月別整理
```

### 💰 コスト構造

- **Supabase**: 無料枠内（データ量少）
- **Google Cloud APIs**: 無料枠内（Vision/Gmail/Drive）
- **合計**: 年間$5以下で運用可能

## 初期セットアップ

### 前提条件

以下のアカウントが必要です：

- **Node.js 20+**（開発環境）
- **Supabaseアカウント** ([新規登録](https://supabase.com))
- **freeeアカウント**とAPI利用許可
- **Google Cloud Platform アカウント**（Vision API用）

### 1. プロジェクト準備

```bash
# リポジトリのクローン
git clone https://github.com/your-username/freee-receipt-automation.git
cd freee-receipt-automation

# パッケージインストール
yarn install
```

### 2. Supabaseセットアップ

```bash
# Supabase CLI インストール
npm install -g supabase

# プロジェクト作成
supabase init
supabase start

# マイグレーション実行
supabase db push
```

#### データベース設定

必要なテーブルが自動作成されます：

- `receipts` - レシート処理データ
- `transactions` - freee取引データ
- `processing_logs` - 処理ログ
- `user_settings` - ユーザー設定

### 3. 環境変数設定

`.env.local` ファイルを作成：

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Gmail API設定
GMAIL_CLIENT_ID=your-gmail-client-id
GMAIL_CLIENT_SECRET=your-gmail-client-secret

# freee API設定
FREEE_CLIENT_ID=your-freee-client-id
FREEE_CLIENT_SECRET=your-freee-client-secret

# Google Cloud設定
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json

# 通知設定
RESEND_API_KEY=your-resend-api-key
NOTIFICATION_EMAIL=your-email@example.com
```

### 4. API認証設定

#### Gmail API認証

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクト作成
2. Gmail API を有効化
3. OAuth 2.0 認証情報を作成
4. システムにアクセスして認証完了

```bash
# 開発サーバー起動
yarn dev

# ブラウザで http://localhost:3000 にアクセス
# Gmail認証フローを完了
```

#### freee API認証

1. [freee developers](https://developer.freee.co.jp/) でアプリ登録
2. OAuth認証フローを実行
3. アクセストークンを取得

#### Google Vision API設定

1. Google Cloud Console で Vision API を有効化
2. サービスアカウント作成
3. 認証JSONファイルをダウンロード

### 5. デプロイ

#### Vercel デプロイ

```bash
# Vercel CLI インストール
npm install -g vercel

# デプロイ実行
vercel --prod

# 環境変数をVercelに設定
vercel env add SUPABASE_URL
# 他の環境変数も同様に設定
```

#### Edge Functions デプロイ

```bash
# Supabase Edge Functions デプロイ
supabase functions deploy weekly-process

# pg_cron スケジュール設定（週次実行）
# Supabase Dashboard で以下を実行：
SELECT cron.schedule('weekly-receipt-process', '0 9 * * 1', 'SELECT net.http_post(...)');
```

### 6. 初期設定確認

システムが正常にセットアップされたかを確認：

```bash
# TypeScript検証
yarn tsc --noEmit

# Lint チェック
yarn lint

# テスト実行
yarn test

# 開発サーバー起動
yarn dev
```

ブラウザで `http://localhost:3000/dashboard` にアクセスしてダッシュボードが表示されることを確認してください。

## 日常的な使い方

### ダッシュボード操作

#### メイン画面（/dashboard）

システムの処理状況を一覧表示：

- **処理統計**: 今月の処理件数・成功率
- **最近の処理**: 直近のレシート処理結果
- **未処理項目**: 手動対応が必要な項目

#### 機能パネル

- **📊 Stats**: 処理統計の詳細表示
- **📨 Receipts**: レシート処理履歴の一覧
- **🔧 Settings**: システム設定の変更

### レシート処理フロー

#### 1. 手動準備作業

以下は自動化対象外のため、手動で行います：

**楽天・Amazon領収書**
```bash
# 会員ページからPDFダウンロード
# → Google Driveの指定フォルダに保存
~/Google Drive/01.領収書/MM/商品名.pdf
```

**紙の領収書（ガソリン等）**
```bash
# スキャンアプリでPDF変換
# → OCR精度向上のためスキャンアプリ使用推奨
# → Google Driveの指定フォルダに保存
```

#### 2. 自動処理フロー

毎週月曜9時に自動実行：

```
1. Gmail監視 → Apple課金等のメール検索
2. PDF抽出 → 添付ファイルを一時保存
3. OCR処理 → Google Vision APIでデータ抽出
4. freee連携 → 取引データとの自動マッチング
5. 経費登録 → 紐付け・コメント追加・項目設定
6. Drive保存 → 月別フォルダへの整理保存
7. 通知送信 → 処理結果のメール通知
```

#### 3. 処理結果確認

**通知メールの内容**
- 処理件数サマリー
- 成功・失敗の詳細
- 手動対応が必要な項目

**ダッシュボードでの確認**
- 個別レシートの処理状況
- OCR結果の精度確認
- freee取引との照合結果

### 手動修正機能

自動処理で完全にマッチングできない場合の修正方法：

#### レシート詳細画面（/receipt/[id]）

1. **OCR結果の修正**
   - 店舗名・日付・金額の手動編集
   - 商品説明の追加・修正

2. **取引選択**
   - freee取引候補の一覧表示
   - 手動マッチング・紐付け

3. **カテゴリ設定**
   - 勘定科目の選択
   - 税区分の設定

#### 修正フローの例

```bash
# 自動処理結果: 90% 信頼度でマッチング
# → 手動確認で100%確定

1. ダッシュボードで「要確認」項目をクリック
2. OCR結果を確認・必要に応じて修正
3. freee取引候補から適切な取引を選択
4. 「確定」ボタンでfreeeに反映
5. Google Driveに整理保存
```

### フォルダ構造管理

#### Google Drive保存構造

```
01.領収書/
├── 01/（1月分）
│   ├── 楽天モバイル.pdf
│   ├── Apple_Music.pdf
│   └── ガソリン代.pdf
├── 02/（2月分）
│   ├── 楽天光.pdf
│   └── KindleUnlimited.pdf
└── 99.固定資産分/
    └── 高額設備.pdf
```

#### ファイル命名規則

- **基本**: 商品名のみ（短縮形）
- **重複時**: `商品名_2.pdf` で番号付与
- **月次フォルダ**: 自動作成（MM形式）

## 運用・メンテナンス

### ログ確認

#### Supabaseダッシュボード

1. Supabase プロジェクトにログイン
2. Logs タブで実行ログを確認
3. Edge Functions の実行状況を監視

#### アプリケーションログ

```bash
# 処理ログAPI
curl https://your-app.vercel.app/api/monitoring/logs

# 統計情報API
curl https://your-app.vercel.app/api/monitoring/stats
```

### 定期メンテナンス

#### 月次作業

- **フォルダ構造確認**: Google Driveの整理状況
- **OCR精度確認**: 誤認識パターンの蓄積
- **freee連携確認**: API制限・認証更新

#### 年次作業

- **データベース整理**: 古い処理ログの削除
- **API認証更新**: OAuth トークンの更新確認
- **コスト確認**: 各サービスの利用料金確認

### パフォーマンス監視

#### 重要指標

- **処理成功率**: 95%以上を維持
- **OCR精度**: 90%以上の文字認識率
- **API応答時間**: 平均5秒以内
- **エラー率**: 5%未満

#### アラート設定

Supabaseで以下のアラートを設定推奨：

```sql
-- 処理失敗率が20%を超えた場合
-- API エラーが連続3回発生した場合
-- ストレージ使用量が80%を超えた場合
```

### バックアップ・復旧

#### データベースバックアップ

```bash
# Supabase自動バックアップ（毎日）
# 手動バックアップコマンド
supabase db dump --schema public > backup.sql
```

#### 設定ファイルバックアップ

```bash
# 重要設定の定期バックアップ
cp .env.local .env.backup.$(date +%Y%m%d)
```

### トラブル対応

#### 処理失敗時の対応

1. **ログ確認**: エラー内容の特定
2. **API制限確認**: Google・freee API の利用状況
3. **手動リトライ**: ダッシュボードからの再実行
4. **設定確認**: 認証情報・環境変数の確認

#### 緊急時対応

```bash
# Edge Function の緊急停止
supabase functions delete weekly-process

# pg_cron スケジュールの無効化
SELECT cron.unschedule('weekly-receipt-process');

# 手動処理の実行
curl -X POST https://your-project.supabase.co/functions/v1/weekly-process
```

## FAQ・トラブルシューティング

### よくある質問

#### Q1: システムの処理能力は？
A: 週4枚程度の処理に最適化。月間20-30枚程度まで対応可能。

#### Q2: OCR精度が低い場合は？
A: スキャンアプリを使用し、明瞭なPDFを作成してください。手動修正機能で補完可能。

#### Q3: freee取引とのマッチング失敗は？
A: 日付±3日、金額±100円で自動照合。手動修正で正確な紐付けが可能。

#### Q4: Google Driveの容量制限は？
A: 無料15GB。レシートPDFのみなら数年分保存可能。

#### Q5: セキュリティ対策は？
A: OAuth認証・HTTPS通信・Supabase RLS（Row Level Security）で保護。

### トラブルシューティング

#### 1. Gmail認証エラー

**症状**: Gmail APIの認証に失敗する

**原因**:
- OAuth設定の誤り
- スコープ権限不足
- リフレッシュトークンの期限切れ

**解決策**:
```bash
# 1. Google Cloud Console で設定確認
# 2. リダイレクトURIの正確性確認
# 3. 再認証フローの実行
https://your-app.vercel.app/api/auth/gmail
```

#### 2. OCR処理失敗

**症状**: Google Vision APIでテキスト抽出できない

**原因**:
- PDF形式の問題（画像化されていない）
- ファイルサイズ過大
- API制限到達

**解決策**:
```bash
# 1. PDFの再作成（テキスト形式で保存）
# 2. ファイルサイズ確認（10MB以下推奨）
# 3. API使用量の確認
```

#### 3. freee連携エラー

**症状**: freee APIへのデータ送信に失敗

**原因**:
- アクセストークンの期限切れ
- API利用制限
- データフォーマットエラー

**解決策**:
```bash
# 1. OAuth再認証
https://your-app.vercel.app/api/auth/freee

# 2. API制限確認（1時間100リクエスト）
# 3. ダッシュボードからの手動リトライ
```

#### 4. 自動実行が停止

**症状**: 週次の自動処理が実行されない

**原因**:
- pg_cron設定の問題
- Edge Function のエラー
- 環境変数の問題

**解決策**:
```bash
# 1. Supabase Logsでエラー確認
# 2. pg_cron スケジュール確認
SELECT * FROM cron.job;

# 3. 手動実行でのテスト
curl -X POST https://your-project.supabase.co/functions/v1/weekly-process
```

#### 5. メール通知が届かない

**症状**: 処理結果の通知メールが送信されない

**原因**:
- Resend API設定の問題
- メールアドレスの誤り
- スパムフィルタ

**解決策**:
```bash
# 1. Resend ダッシュボードでの送信履歴確認
# 2. 環境変数 NOTIFICATION_EMAIL の確認
# 3. スパムフォルダの確認
# 4. テストメールの送信
curl -X POST https://your-app.vercel.app/api/notification/send
```

### エラーコード一覧

| コード | 意味 | 対処法 |
|--------|------|--------|
| AUTH_001 | Gmail認証失敗 | OAuth再認証 |
| AUTH_002 | freee認証失敗 | トークン更新 |
| OCR_001 | Vision API エラー | PDFファイル確認 |
| OCR_002 | テキスト抽出失敗 | 手動入力 |
| MATCH_001 | 取引照合失敗 | 手動マッチング |
| DRIVE_001 | ファイル保存失敗 | 権限・容量確認 |
| NOTIFY_001 | 通知送信失敗 | メール設定確認 |

### パフォーマンス最適化

#### 処理速度向上

```bash
# 1. PDF圧縮（5MB以下推奨）
# 2. バッチ処理の活用
# 3. キャッシュ機能の使用
```

#### コスト最適化

```bash
# 1. Google Cloud API使用量の監視
# 2. Supabase ストレージ使用量の管理
# 3. 不要データの定期削除
```

### サポート情報

#### 公式リソース

- [Supabase Documentation](https://supabase.com/docs)
- [freee API Reference](https://developer.freee.co.jp/docs)
- [Google Cloud Vision API](https://cloud.google.com/vision/docs)

#### コミュニティ支援

- GitHub Issues: プロジェクトページで問題報告
- 実装ガイド: `docs/requirements/backlog/` の詳細PBI文書

---

このガイドにより、freeeレシート自動化システムを効率的に運用し、フリーランスの経費管理業務を大幅に自動化することができます。

**最終更新**: 2025-08-25  
**対象バージョン**: v1.0.0  
**対象ユーザー**: フリーランスITエンジニア（技術知識中程度）