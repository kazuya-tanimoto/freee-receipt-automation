# ADR-001: バックエンドインフラストラクチャとしてのSupabase選定

## ステータス

**承認済み** - 2024-06-19

## コンテキスト

freee領収書自動化システムには、以下を処理するバックエンドインフラストラクチャが必要です：

- ユーザー認証と認可
- 領収書データ、トランザクション、ユーザー設定を保存するデータベース
- 処理状況の更新のためのリアルタイム機能
- 領収書アップロード用のファイルストレージ
- ビジネスロジック用のAPIエンドポイント

AI支援開発を伴う個人の自動化プロジェクトとして、ソリューションには以下が必要です：

- 迅速なセットアップとデプロイ
- 最小限のメンテナンスオーバーヘッド
- 個人使用に対してコスト効率的
- Next.jsフロントエンドとの良好な統合

## 決定

主要なバックエンドインフラストラクチャとして **Supabase** を使用します。

## 根拠

### Supabaseの利点

#### 技術的優位性

- **PostgreSQL基盤**: 優れたTypeScriptサポートを持つ成熟した堅牢なデータベース
- **リアルタイムサブスクリプション**: ステータス更新のための組み込みリアルタイム機能
- **行レベルセキュリティ（RLS）**: マルチユーザーデータ分離のためのデータベースレベルのセキュリティ
- **自動生成API**: スキーマから生成されるRESTfulとGraphQL API
- **TypeScript統合**: データベーススキーマからの自動型生成

#### 開発効率

- **ゼロ設定**: バックエンドサーバーのセットアップ不要
- **統合認証**: 複数プロバイダーを持つ組み込み認証
- **ストレージ統合**: CDN機能を持つファイルストレージ
- **ダッシュボードUI**: ビジュアルなデータベース管理とモニタリング
- **マイグレーションサポート**: バージョン管理されたスキーマ変更

#### プロジェクト適合性

- **個人使用**: 個人の自動化プロジェクトに最適
- **AI開発**: AI支援開発のための最小限の複雑性
- **Next.js統合**: 優れたNext.jsエコシステムサポート
- **コスト構造**: 寛大な無料枠、従量課金制

### 検討した代替案

#### Firebase

- **利点**: Googleエコシステム、リアルタイムデータベース、寛大な無料枠
- **欠点**: NoSQLの制限、TypeScriptサポートが少ない、ベンダーロックインの懸念
- **決定**: 財務データに対するNoSQL制約のため却下

#### AWS Amplify

- **利点**: 完全なAWSエコシステム、強力なスケーリングオプション
- **欠点**: 複雑なセットアップ、高い学習曲線、個人使用には過剰
- **決定**: 複雑性のオーバーヘッドのため却下

#### カスタムNode.js + PostgreSQL

- **利点**: 完全な制御、ベンダーロックインなし
- **欠点**: 重要なセットアップとメンテナンスのオーバーヘッド、開発が遅い
- **決定**: 個人プロジェクトのメンテナンス負担のため却下

#### PlanetScale + Next.js APIルート

- **利点**: 優れたMySQLスケーリング、サーバーレスフレンドリー
- **欠点**: リアルタイム機能の欠如、カスタム認証実装が必要
- **決定**: 統合機能の欠如のため却下

## 実装詳細

### データベーススキーマ

- TypeScript型生成を使用したPostgreSQL
- ユーザー間のデータ分離のためのRLS実装
- 領収書、トランザクション、ユーザーデータの正規化されたスキーマ設計

### 認証

- シンプルさのためのメール/パスワード認証
- ユーザーの利便性のためのオプションのソーシャルプロバイダー（Google）
- JWTベースのセッション管理

### API戦略

- 基本的なCRUD操作にはSupabase自動生成APIを使用
- 複雑なビジネスロジックにはカスタムNext.js APIルート
- 処理状況更新のためのリアルタイムサブスクリプション

### ファイルストレージ

- 領収書ファイルアップロード用のSupabase Storage
- 自動画像最適化とCDN配信
- RLS統合による安全なファイルアクセス

## トレードオフ

### 受け入れたトレードオフ

- **ベンダーロックイン**: 開発速度とメンテナンスの利点のために受け入れ
- **限定的なカスタマイズ**: 設定より規約を優先することによる一部の制限
- **コストスケーリング**: 非常に高いスケールでは高価になる可能性（個人使用には関係なし）

### 緩和策

- **データエクスポート**: 定期的なバックアップによりデータの可搬性を確保
- **標準技術**: PostgreSQLとREST APIがロックインリスクを軽減
- **コスト監視**: システムの成長に伴うコスト追跡のための使用量アラート

## 成功指標

- **開発速度**: 1日未満でバックエンドセットアップを完了
- **メンテナンスオーバーヘッド**: バックエンドメンテナンスは月1時間未満
- **パフォーマンス**: 基本操作のAPIレスポンスタイムは200ms未満
- **コスト**: 初期使用では無料枠内に収まる

## 結果

### ポジティブ

- 迅速な開発とデプロイ
- RLSによる組み込みのセキュリティベストプラクティス
- インフラストラクチャ管理なしの自動スケーリング
- 強力なTypeScript統合がAI開発効率を向上

### ネガティブ

- 重要な機能に対する外部サービスへの依存
- データベース最適化と設定の制御が限定的
- スケールに伴う潜在的なコスト増加（個人使用ケースにより緩和）

## レビュー日

この決定は**6か月後（2024-12-19）**または以下の場合にレビューされます：

- 使用量が無料枠の制限に近づいた場合
- パフォーマンス要件が現在の能力を超えた場合
- 代替案の状況に大きな変化があった場合

---

**参加者**: 個人プロジェクト（AI支援開発）  
**日付**: 2024-06-19  
**ステータス**: 実装済み・運用中
