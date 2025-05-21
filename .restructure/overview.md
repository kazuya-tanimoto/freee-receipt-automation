# README.md構造修正 - 概要

## 📊 現状分析

### 理想構造（README.mdより）
```
docs/
├── overview.md
├── requirements/spec/
├── design/architecture/
├── api/
├── standards/
├── test/
├── ops/
└── adr/
ai/
├── system_prompt.md
├── glossary.yml
├── config/
├── prompts/
├── tasks/
├── context/
├── examples/
├── feedback/
└── history/
```

### 現状の問題点
1. **理想構造にないディレクトリが存在**
   - `guidelines/` ディレクトリ
   - `docs/guidelines/` ディレクトリ
   - `docs/ai/` ディレクトリ
   - `docs/templates/` ディレクトリ（理想構造にない）

2. **重複ファイル（9パターン）**
   - context-optimization × 3箇所
   - coding-standards × 3箇所  
   - operational-guidelines/rules × 3箇所
   - security-guidelines × 2箇所
   - document-template × 2箇所
   - README（guidelines説明） × 1箇所
   - SUMMARY（guidelines要約） × 1箇所
   - documentation-guidelines × 1箇所（移動のみ）

## 🔀 統合ファイル対応表

| 統合パターン | 統合先 | 統合元 | 備考 |
|-------------|--------|-------|------|
| **context-optimization** | `ai/context/` | `docs/ai/`, `docs/guidelines/` | AI関連を集約 |
| **coding-standards** | `docs/standards/` | `guidelines/`, `docs/guidelines/` | 最包括的版をベース |
| **operational-guidelines** | `docs/ops/` | `guidelines/`, `docs/guidelines/` | 運用関連を統合 |
| **security-guidelines** | `docs/standards/` | `guidelines/` | セキュリティ標準を統合 |
| **document-template** | **削除** | `guidelines/templates/`, `docs/templates/` | 理想構造にないため削除 |
| **documentation-guidelines** | `docs/standards/` | `guidelines/` | ドキュメンテーション規約移動 |

## 📋 削除対象ファイル

| ファイル | 削除理由 |
|---------|---------|
| `docs/guidelines/README*.md` | 古い構造の説明文書 |
| `docs/guidelines/SUMMARY*.md` | 古い構造の要約文書 |
| `guidelines/templates/document-template*.md` | 理想構造にないため削除 |
| `docs/templates/document-template*.md` | 理想構造にないため削除 |
| `guidelines/` ディレクトリ全体 | 統合・削除後不要 |
| `docs/guidelines/` ディレクトリ全体 | 統合後不要 |
| `docs/templates/` ディレクトリ全体 | 理想構造にないため削除 |

## 🎯 統合後のファイル構成（README.md理想構造準拠）

### docs/standards/（4ファイル→8ファイル）
- `coding-standards*.md` （統合済み）
- `security-guidelines*.md` （統合済み）
- `documentation-guidelines*.md` （新規追加）
- `review-guidelines*.md` （新規作成）
- `sbom/`

### docs/ops/（2ファイル→2ファイル）
- `operational-guidelines*.md` （統合済み）

### docs/requirements/spec/（現状維持）
- `requirements-summary*.md`
- `system-specification*.md`

### docs/design/architecture/（現状維持）
- `architecture*.md`

### ai/context/（2ファイル→2ファイル）
- `context-optimization*.md` （統合済み）

## 📈 作業効果

### Before（統合前）
- 43個のMDファイル
- 9パターンの重複
- 4個の不要ディレクトリ（guidelines/, docs/guidelines/, docs/ai/, docs/templates/）

### After（統合後）
- 約21個のMDファイル
- 重複完全解消
- レビューガイドラインを新たに追加
- README.md理想構造に**完全準拠**

### 保持情報
- **失われる情報**: テンプレートファイルのみ（理想構造にないため）
- **統合される情報**: 重複ファイルは全て最良版として保持
- **新しい構造**: README.md理想構造に100%準拠

---
*README.md理想構造への完全準拠を実現し、コンテンツは適切に統合・保持されます*