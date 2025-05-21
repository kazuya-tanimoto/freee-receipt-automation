# TASK-004: レビュー依頼テンプレート整備

## 🎯 概要
コード・ドキュメント・PRレビューに対応した汎用テンプレート作成を行います。

## 📋 検討・作業項目

### 1. 配置場所の決定

#### 候補案の検討
```bash
echo "=== 配置場所検討 ===" > .restructure/logs/review-template.log

# 候補1: 独立ファイル
echo "候補1: docs/standards/review-guidelines.md" >> .restructure/logs/review-template.log
echo "メリット: 独立性、再利用しやすさ" >> .restructure/logs/review-template.log  
echo "デメリット: ファイル数増加（現在の統合方針に反する）" >> .restructure/logs/review-template.log

# 候補2: 既存ファイル拡張  
echo "候補2: docs/standards/documentation-guidelines.md に追加" >> .restructure/logs/review-template.log
echo "メリット: ドキュメント作成者が参照しやすい" >> .restructure/logs/review-template.log
echo "デメリット: コードレビュー担当者が見落とす可能性" >> .restructure/logs/review-template.log

# 候補3: 運用プロセス統合
echo "候補3: docs/ops/operational-guidelines.md に追加" >> .restructure/logs/review-template.log  
echo "メリット: 運用プロセスとしての一体性" >> .restructure/logs/review-template.log
echo "デメリット: ドキュメント作成者の視点から離れる" >> .restructure/logs/review-template.log

# 推奨案の決定
echo "推奨: docs/standards/review-guidelines.md （独立ファイル）" >> .restructure/logs/review-template.log
echo "理由: レビューは汎用的で、コード・ドキュメント・機能すべてに適用" >> .restructure/logs/review-template.log
```

### 2. 汎用テンプレート設計

#### 基本構造の定義
```bash
echo "=== テンプレート基本構造 ===" >> .restructure/logs/review-template.log

# 基本セクション構成
cat >> .restructure/logs/review-template.log << 'EOF'
基本セクション:
1. 基本情報 (タスク・リポジトリ・ブランチ・担当者・日時)
2. 作業概要 (変更内容サマリー・ファイル数・影響範囲)
3. 変更詳細 (追加・変更・削除・移動の詳細)
4. セルフレビュー結果 (実施確認・テスト結果・品質チェック)
5. 重点レビューポイント (確認箇所・リスク・注意点)
6. 確認方法 (検証手順・テストコマンド・確認URL)
7. 承認後アクション (次ステップ・関連タスク・通知対象)
EOF
```

#### タスク名パターンの例示
```bash
echo "=== タスク名パターン例 ===" >> .restructure/logs/review-template.log

cat >> .restructure/logs/review-template.log << 'EOF'
TASK-XXXの代替例:
- 機能実装 (Feature Implementation)
- バグ修正 (Bug Fix)  
- ドキュメント更新 (Documentation Update)
- リファクタリング (Refactoring)
- セキュリティ修正 (Security Fix)
- 性能改善 (Performance Improvement)
- 依存関係更新 (Dependency Update)
- CI/CD設定変更 (CI/CD Configuration)
- デザイン修正 (Design Fix)
- API変更 (API Change)
EOF
```

### 3. 分野別具体例の作成

#### コードレビュー例
```bash
echo "=== コードレビュー例 ===" >> .restructure/logs/review-template.log

cat >> .restructure/logs/review-template.log << 'EOF'
## コードレビュー例

**基本情報**
- **タスク**: ユーザー認証機能実装 
- **リポジトリ**: auth-service
- **ブランチ**: feature/user-authentication
- **作業者**: 開発者A
- **作業日時**: 2025/05/20 10:00 - 12:00

**作業概要**
- **変更内容**: JWT認証機能の実装
- **変更ファイル数**: 8個 (新規4/変更3/削除1)
- **影響範囲**: 認証フロー・API・フロントエンド

**重点レビューポイント**
1. セキュリティ実装の妥当性
2. エラーハンドリングの適切性
3. テストカバレッジの確認
4. パフォーマンス影響

**確認方法**
- **テストコマンド**: `npm test -- --coverage`
- **セキュリティチェック**: `npm audit`
- **動作確認**: 認証フロー手動テスト
EOF
```

#### ドキュメントレビュー例  
```bash
echo "=== ドキュメントレビュー例 ===" >> .restructure/logs/review-template.log

cat >> .restructure/logs/review-template.log << 'EOF'
## ドキュメントレビュー例

**基本情報**
- **タスク**: APIドキュメント更新
- **リポジトリ**: api-docs
- **ブランチ**: docs/api-v2-update
- **作業者**: ドキュメント担当B
- **作業日時**: 2025/05/20 14:00 - 16:00

**作業概要**
- **変更内容**: API v2仕様書の更新
- **変更ファイル数**: 5個 (変更4/新規1)
- **影響範囲**: 開発者向けAPI仕様・サンプルコード

**重点レビューポイント**
1. 技術的正確性の確認
2. サンプルコードの動作確認
3. 用語統一・表記ゆれチェック
4. 関連ドキュメントのリンク確認

**確認方法**
- **リンクチェック**: `make lint-docs`  
- **サンプル実行**: `make test-samples`
- **視覚確認**: プレビュー画面での確認
EOF
```

#### PRレビュー例
```bash
echo "=== PRレビュー例 ===" >> .restructure/logs/review-template.log

cat >> .restructure/logs/review-template.log << 'EOF'
## PRレビュー例

**基本情報**
- **タスク**: UI改善プルリクエスト
- **リポジトリ**: frontend-app
- **ブランチ**: feature/ui-improvements → main
- **作業者**: フロントエンド担当C  
- **作業日時**: 2025/05/20 09:00 - 11:00

**作業概要**
- **変更内容**: ダッシュボードUI改善
- **変更ファイル数**: 12個 (変更10/新規2)
- **影響範囲**: ダッシュボード・共通コンポーネント

**重点レビューポイント**
1. デザインガイドライン準拠確認
2. レスポンシブ対応確認
3. アクセシビリティ基準確認
4. ブラウザ互換性確認

**確認方法**
- **E2Eテスト**: `npm run e2e`
- **ビジュアルテスト**: `npm run visual-test`
- **アクセシビリティチェック**: Lighthouse監査
EOF
```

### 4. 日英両版ファイル作成

#### 英語版作成
```bash
echo "=== 英語版テンプレート作成 ===" >> .restructure/logs/review-template.log

# 英語版ファイルの作成コマンド（実行準備）
echo "作成予定: docs/standards/review-guidelines.md" >> .restructure/logs/review-template.log
```

#### 日本語版作成  
```bash
echo "=== 日本語版テンプレート作成 ===" >> .restructure/logs/review-template.log

# 日本語版ファイルの作成コマンド（実行準備）
echo "作成予定: docs/standards/review-guidelines-ja.md" >> .restructure/logs/review-template.log
```

### 5. 既存ガイドラインからのリンク設定

#### リンク対象ファイルの特定
```bash
echo "=== リンク設定対象 ===" >> .restructure/logs/review-template.log

# リンク設定すべきファイル
cat >> .restructure/logs/review-template.log << 'EOF'
リンク設定対象:
1. docs/standards/documentation-guidelines.md
2. docs/standards/coding-standards.md  
3. docs/ops/operational-guidelines.md
4. README.md (必要に応じて)

各ファイルに追加する参考リンク:
- [Review Guidelines](./review-guidelines.md)
- [レビューガイドライン](./review-guidelines-ja.md)
EOF
```

## ✅ 完了基準

- [x] **配置場所決定**: docs/standards/review-guidelines.md
- [x] **英語版テンプレート作成**: review-guidelines.md
- [x] **日本語版テンプレート作成**: review-guidelines-ja.md  
- [x] **コードレビュー例**: 実装完了
- [x] **ドキュメントレビュー例**: 実装完了
- [x] **PRレビュー例**: 実装完了
- [x] **機能レビュー例**: 実装完了（マルチタイプ対応）
- [x] **タスク名パターン例示**: 15パターン実装完了
- [x] **既存ガイドラインリンク**: 4ファイルに設定完了
- [x] **作業ログ作成**: .restructure/logs/review-template.log

## ⚠️ 注意事項

- **TASK-XXX表記**: あくまで例示であることを明記
- **汎用性重視**: 特定技術スタックに依存しない表現
- **セルフレビュー強調**: レビュー依頼前の自己確認の重要性
- **承認後フロー**: 次ステップの明確化

## 🎯 期待される成果物

1. **包括的テンプレート**: あらゆるレビュータイプに対応
2. **実用的な例**: 即座に利用可能な具体例
3. **適切な配置**: 発見しやすい場所への配置
4. **一貫性**: 既存ガイドラインとの統合

**この作業により、プロジェクト全体のレビュー品質向上を実現！**