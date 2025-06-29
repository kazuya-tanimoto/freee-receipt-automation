# GitHub ブランチ保護設定

## 概要

このドキュメントは、メインブランチの品質ゲートを実施するためのGitHubブランチ保護ルールの設定手順を提供します。

## 必要なブランチ保護ルール

### メインブランチ保護

`Settings > Branches > Add rule`で`main`ブランチに対して設定:

#### 基本設定

- ✅ **マージ前にプルリクエストを必須にする**

  - ✅ 承認を必須: `1`
  - ✅ 新しいコミットがプッシュされた際に古いPR承認を無効化
  - ✅ コードオーナーからのレビューを必須 (CODEOWNERSファイルが存在する場合)

- ✅ **マージ前にステータスチェックの通過を必須にする**

  - ✅ マージ前にブランチを最新状態にすることを必須
  - **必須ステータスチェック:**
    - `lint-gate / Documentation Quality Check`
    - `test / Run Tests`

- ✅ **マージ前に会話の解決を必須にする**

- ✅ **署名済みコミットを必須にする** (推奨)

- ✅ **リニア履歴を必須にする**

- ✅ **上記設定のバイパスを許可しない**

#### 高度な設定

- ✅ **100 MBを超えるファイルを作成するプッシュを制限**
- ✅ **強制プッシュを制限**
- ✅ **削除を許可** (チェックオフ)

## ステータスチェック設定

### 必須チェック

以下のGitHub Actionsワークフローが正常に完了する必要があります:

1. **Quality Gate** (`.github/workflows/lint-gate.yml`)

   - ドキュメントチェック
   - テストスイート実行
   - TypeScript コンパイル

2. **Test Suite** (`.github/workflows/test.yml`)
   - 包括的なテスト実行
   - 環境バリデーション

### GitHubでのチェック名

必須ステータスチェックを設定する際は、以下の正確な名前を使用してください:

- `lint-gate`
- `test`

## 実施レベル

### レベル1: ローカル (プリコミット)

- Lefthookが失敗テストでのコミットを防止
- コミット前のドキュメントバリデーション

### レベル2: リポジトリ (ブランチ保護)

- GitHubが失敗チェックでのPRマージを防止
- CI実行の成功を必須

### レベル3: プロセス (CLAUDE.mdルール)

- 開発ガイドラインでテストカバレッジを義務化
- コードレビュー要件

## セットアップ手順

### 1. GitHub Actionsを有効化

リポジトリでGitHub Actionsが有効化されていることを確認:

- `Settings > Actions > General`に移動
- "Allow all actions and reusable workflows"を選択

### 2. ブランチ保護を設定

1. `Settings > Branches`に移動
2. "Add rule"をクリック
3. ブランチ名を入力: `main`
4. 上記で指定された設定を構成
5. 変更を保存

### 3. 設定を確認

以下を確認するためのテストPRを作成:

- ステータスチェックが表示され実行される
- チェックが通過するまでPRをマージできない
- すべての実施メカニズムが正しく動作する

## トラブルシューティング

### ステータスチェックが表示されない

1. ワークフローがブランチで少なくとも一度実行されていることを確認
2. ワークフローファイルの構文と命名を確認
3. GitHub Actionsの権限を確認

### 保護のバイパス

- リポジトリ管理者のみがチェックなしでマージ可能
- 緊急修正以外は避けるべき
- 監査目的でバイパスを文書化

## メンテナンス

### 定期レビュー

- 保護設定の月次レビュー
- すべての必須チェックが引き続き関連性があることを確認
- ワークフローが変更された場合のチェック名更新

### 新しいチェックの追加

新しいワークフローを追加する際:

1. ワークフロー実行をテスト
2. 必須ステータスチェックに追加
3. このドキュメントを更新

## セキュリティ考慮事項

- 有効化された場合、署名済みコミットのバイパスを許可しない
- リポジトリ管理者アクセスを制限
- 保護ルール変更の定期監査
- 強制プッシュ試行の監視

## 関連ドキュメント

- [GitHub ブランチ保護ドキュメント](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [CLAUDE.md テスト要件](../../CLAUDE.md#testing-requirements)
- [CI/CD ワークフロー](../../.github/workflows/)
