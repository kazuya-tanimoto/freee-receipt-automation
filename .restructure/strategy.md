# 対応方針・進行戦略

## 🎯 基本方針

### 安全性第一の段階的アプローチ
1. **少しずつ対応**: 一度に大きな変更を行わない
2. **細かなコミット**: 各作業ステップごとに必ずコミット（pushしない）
3. **検証重視**: 各段階で動作確認・整合性確認を実施
4. **可逆性確保**: 常にロールバック可能な状態を維持

### コミット戦略
```
作業レベル1: 個別作業 → 細かなコミット
作業レベル2: タスク完了 → タスク単位コミット
作業レベル3: フェーズ完了 → スカッシュして論理単位に整理
作業レベル4: 全体完了 → push準備
```

## 📈 進行戦略

### Phase 1: 基本構造整備（優先度：最高）
**目標**: 重複解消・必須ファイル作成  
**期間**: 2-3時間  
**リスク**: 中（既存ファイルの移動・統合）

#### 含まれるタスク
- **TASK-001**: 事前準備・バックアップ作成
- **TASK-002**: coding-standards重複分析  
- **TASK-003**: coding-standards統合実行
- **TASK-004**: Makefile作成
- **TASK-005**: .devcontainer.json作成
- **TASK-006**: docs/overview.md作成
- **TASK-007**: Phase 1 検証・コミット整理

### Phase 2: 推奨項目追加（優先度：高）
**目標**: AI構造最適化・機能拡張  
**期間**: 2-3時間  
**リスク**: 低（主に新規作成）

#### 含まれるタスク
- **TASK-008**: AI構造最適化準備
- **TASK-009**: system_prompt.md作成
- **TASK-010**: glossary.yml作成
- **TASK-011**: AI構造統合（docs/ai/ → ai/）
- **TASK-012**: バックログ管理体系構築
- **TASK-013**: 設計ディレクトリ拡充（DB・UI）
- **TASK-014**: Phase 2 検証・コミット整理

### Phase 3: 最適化・統合（優先度：中）
**目標**: リンク更新・最終調整  
**期間**: 1-2時間  
**リスク**: 低（主に設定調整）

#### 含まれるタスク
- **TASK-015**: 相互参照リンク更新
- **TASK-016**: CI/CDワークフロー更新  
- **TASK-017**: 命名規則最終確認
- **TASK-018**: 全体品質検証  
- **TASK-019**: 最終確認・push準備

## 🔧 作業進行プロセス

### 1. 作業開始時のチェックリスト
```bash
# 1. 現在の状況確認
git status
git log --oneline -5

# 2. 作業ブランチ確認
git branch

# 3. 進捗状況確認  
cat .restructure/progress.md | grep "次実行"

# 4. バックアップ状況確認
ls -la .restructure/backups/
```

### 2. タスク実行プロセス
```bash
# Phase: タスク開始
echo "🔄 TASK-XXX 開始: $(date)" >> .restructure/logs/execution.log

# Step 1: タスク詳細確認
cat .restructure/tasks/task-XXX-*.md

# Step 2: 進捗記録更新（未開始 → 実行中）
# progress.mdの該当行を編集

# Step 3: 実際の作業実行
# (各タスクファイルの手順に従って)

# Step 4: 中間検証
# 作業内容の確認・テスト実行

# Step 5: コミット
git add -A
git commit -m "🔧 TASK-XXX: [作業内容概要]"

# Step 6: 進捗記録更新（実行中 → 完了）
# progress.mdの該当行を編集

# Phase: タスク完了
echo "✅ TASK-XXX 完了: $(date)" >> .restructure/logs/execution.log
```

### 3. フェーズ完了時のプロセス
```bash
# 1. フェーズ内全タスク完了確認
grep "Phase X" .restructure/progress.md

# 2. 統合テスト実行
make help
make docs
# (エラーがないことを確認)

# 3. コミット履歴確認
git log --oneline -10

# 4. コミットスカッシュ（必要に応じて）
git rebase -i HEAD~N
# 論理的な単位にまとめる

# 5. フェーズ完了記録
echo "✅ Phase X 完了: $(date)" >> .restructure/logs/execution.log
```

## 🛡️ 安全性確保策

### バックアップ戦略
```bash
# 1. 全体バックアップ（Phase開始前）
cp -r . .restructure/backups/full-backup-$(date +%Y%m%d-%H%M%S)/

# 2. 重要ファイルバックアップ（作業前）
mkdir -p .restructure/backups/files/
cp target-file .restructure/backups/files/target-file.backup

# 3. Git状態バックアップ
git log --oneline -20 > .restructure/backups/git-history-$(date +%Y%m%d).log
```

### 検証ポイント
| 検証項目 | タイミング | 確認方法 |
|---------|-----------|----------|
| **基本動作** | 各タスク後 | `make help` 実行 |
| **リンク整合性** | Phase 3後 | リンクチェックツール |
| **YAML構文** | yml作成後 | `python -c "import yaml; yaml.safe_load(open('file.yml'))"` |
| **CI/CD** | ワークフロー更新後 | GitHub Actions動作確認 |

### 失敗時のロールバック手順
```bash
# 1. 軽微な問題（個別ファイル）
git checkout HEAD~1 -- problematic-file

# 2. タスクレベルの問題  
git reset --hard HEAD~1

# 3. フェーズレベルの問題
git reset --hard [Phase開始時のハッシュ]

# 4. 全体的な問題
rm -rf [working-directory]
cp -r .restructure/backups/full-backup-[timestamp]/ .
```

## 🔄 AI・チーム引き継ぎ対応

### 進捗の明確化
- **進捗管理ファイル**: `.restructure/progress.md`で全タスクの状況追跡
- **実行ログ**: `.restructure/logs/execution.log`で詳細な作業履歴
- **ナンバリング**: 全19タスクに連番割り当て

### チャット引き継ぎ時の手順
```bash
# 1. 現在の進捗確認
cat .restructure/progress.md | head -30

# 2. 最後の作業確認
tail -5 .restructure/logs/execution.log

# 3. 次のタスク特定
grep "⏳ 未開始" .restructure/progress.md | head -1

# 4. 作業環境確認
git status
git log --oneline -3
```

### AI引き継ぎ用の文脈情報
```markdown
## 引き継ぎ情報テンプレート

### 作業状況
- 現在のフェーズ: [Phase 1/2/3]
- 完了タスク: TASK-001 〜 TASK-XXX
- 実行中タスク: TASK-YYY
- 次実行タスク: TASK-ZZZ

### 課題・注意点
- [発生した問題・注意事項]

### 環境状態
- ブランチ: feature/restructure-ai-guidelines
- 最新コミット: [ハッシュ] [メッセージ]
- 変更ファイル数: X個

### 必要な作業
- [次に実行すべき具体的作業]
```

## 📊 品質保証・完了基準

### 各フェーズの完了基準

#### Phase 1 完了基準
- [ ] coding-standards.mdの重複が1箇所に統合済み
- [ ] Makefile, .devcontainer.json, docs/overview.md が作成済み
- [ ] `make help` が正常動作
- [ ] 基本的なリンク切れなし

#### Phase 2 完了基準  
- [ ] ai/system_prompt.md, ai/glossary.yml が作成済み
- [ ] docs/ai/ が ai/ に統合済み
- [ ] YAML構文エラーなし
- [ ] AI関連ファイルの整合性確保

#### Phase 3 完了基準
- [ ] 相互参照リンクが正しく更新済み
- [ ] CI/CDワークフローが正常動作  
- [ ] 命名規則が統一済み
- [ ] 全体の構造が理想形に一致

### 最終完了基準
- [ ] README-ja.mdの理想構造に95%以上準拠
- [ ] リンク切れゼロ
- [ ] CI/CDパイプライン正常動作
- [ ] 必須ファイル19個すべて存在
- [ ] git履歴が保持・可読性維持

## ⚠️ 並行開発への配慮

### 他開発者への影響最小化
1. **独立ブランチ作業**: feature/restructure-ai-guidelines
2. **mainブランチ非影響**: 完了まで絶対マージしない
3. **通知・調整**: 大きな変更前にチーム通知

### 協調作業時の注意点
```bash
# 他ブランチでの変更取り込み（必要時）
git fetch origin
git merge origin/main
# コンフリクト解決

# 長期ブランチのリベース（週次推奨）
git rebase origin/main
# 必要に応じてコンフリクト解決
```

---

**重要**: この戦略に従うことで、プロジェクトの安定性を保ちながら構造最適化を実現し、AI駆動開発環境への移行を成功させることができます。