# ブランチ保護ルール設定ガイド

## 概要

このドキュメントでは、mainブランチの品質を保つためのブランチ保護ルール設定について説明します。

## 推奨設定

### 基本的な保護設定

1. **プルリクエストによるマージを必須にする**
   - ✅ Require a pull request before merging
   - ✅ Require approvals (推奨: 1人以上)
   - ✅ Dismiss stale PR approvals when new commits are pushed

2. **ステータスチェックを必須とする**
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging

### 必須ステータスチェック項目

以下のGitHub Actionsワークフローを必須チェックとして設定:

- `docs-check / docs-check` - ドキュメントの品質チェック
- `validate-pr / validate-pr` - PR検証
- `validate-pr / block-bypass-commits` - バイパスコミット検出
- `lint-and-type-check / lint-and-type-check` - TypeScript検証

### 追加の保護設定

1. **管理者も含めて制限を適用**
   - ✅ Do not allow bypassing the above settings
   - ✅ Restrict pushes that create files

2. **フォースプッシュを制限**
   - ✅ Restrict force pushes

## 設定手順

### GitHub Web UI での設定

1. リポジトリの **Settings** > **Branches** に移動
2. **Add rule** をクリック
3. Branch name pattern に `main` を入力
4. 上記の推奨設定をチェック
5. **Create** をクリックして保存

### GitHub CLI での設定（自動化）

```bash
# ブランチ保護ルールを作成
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":
    ["docs-check / docs-check","validate-pr / validate-pr",
     "validate-pr / block-bypass-commits",
     "lint-and-type-check / lint-and-type-check"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{
    "required_approving_review_count":1,
    "dismiss_stale_reviews":true}' \
  --field restrictions=null
```

## 期待される効果

### 問題の予防

- ✅ markdownlintエラーのあるファイルのマージを防止
- ✅ TypeScriptエラーのあるコードのマージを防止
- ✅ pre-commitバイパスコミットの検出
- ✅ 自動化ツールによる低品質コミットの防止

### 品質向上

- ✅ 全てのPRで品質チェックが実行される
- ✅ レビュープロセスの強制
- ✅ ドキュメント品質の維持
- ✅ コードの一貫性保証

## トラブルシューティング

### よくある問題

#### CI が失敗する場合

1. **markdown lint エラー**

   ```bash
   yarn lint:md
   yarn format:md
   ```

2. **TypeScript エラー**

   ```bash
   npx tsc --noEmit
   ```

3. **ドキュメントサイズエラー**

   ```bash
   yarn check:docs:size
   ```

#### 緊急時のマージ

緊急時にのみ、管理者権限でバイパス可能（推奨しない）:

1. PR画面で **Merge without waiting for requirements to be met** を選択
2. 理由をコメントに記載
3. マージ後すぐに修正PRを作成

## メンテナンス

### 定期的な見直し

- 月1回: ステータスチェックの有効性を確認
- 四半期1回: ルール設定の最適化
- 年1回: 全体的な保護戦略の見直し

### ログ監視

- GitHub Actions実行ログの確認
- 失敗パターンの分析
- ルール追加・修正の検討

## 関連ファイル

- `.github/workflows/docs-check.yml` - ドキュメント品質チェック
- `.github/workflows/ci.yml` - 継続的インテグレーション
- `.github/workflows/pr-validation.yml` - PR検証
- `.lefthook.yml` - ローカル pre-commit設定
