# README.md理想構造（最終版）

## 📁 完成イメージ

```
freee-receipt-automation/
├── README.md
├── CHANGELOG.md
├── .devcontainer.json        # ← Optional
├── .github/
│   └── workflows/
├── src/
├── tests/
├── docs/
│   ├── overview.md          # ← 新規作成予定
│   ├── requirements/
│   │   ├── spec/            # ✅ 既存
│   │   └── backlog/         # ← 新規作成予定
│   ├── design/
│   │   ├── architecture/    # ✅ 既存
│   │   ├── db/              # ← 新規作成予定
│   │   └── ui/              # ← 新規作成予定
│   ├── api/                 # ← 新規作成予定
│   ├── standards/           # ✅ 統合先
│   │   ├── coding-standards.md
│   │   ├── security-guidelines.md      # セキュリティ標準を統合
│   │   ├── documentation-guidelines.md # ドキュメント標準を統合
│   │   └── sbom/
│   ├── test/                # ← 新規作成予定
│   ├── ops/                 # ✅ 統合先
│   │   └── operational-guidelines.md
│   └── adr/                 # ← 新規作成予定
└── ai/                      # ✅ 統合先
    ├── system_prompt.md     # ← 新規作成予定
    ├── glossary.yml         # ← 新規作成予定
    ├── config/              # ← 新規作成予定
    ├── prompts/             # ← 新規作成予定
    ├── tasks/               # ← 新規作成予定
    ├── context/             # ✅ 統合済み
    │   └── context-optimization.md
    ├── examples/            # ← Optional
    ├── feedback/            # ← Optional
    └── history/             # ← Optional
```

## 📝 統合方針の詳細

### セキュリティ・ドキュメント標準について
- **security-guidelines**: `docs/standards/` に統合
  - 理由: コーディング、セキュリティ、ドキュメント標準を一括管理
  - 将来的に専用ディレクトリ分離も可能
- **documentation-guidelines**: `docs/standards/` に統合
  - 理由: 開発標準の一部として位置づけ
  - README理想構造では「ドキュメント標準はstandards統合」を明文化

### 削除対象
- **templates**: 理想構造にないため完全削除
- **guidelines/**: standards/とops/に統合後削除
- **docs/guidelines/**: 統合後削除
- **docs/ai/**: ai/context/に統合後削除

## ✅ 今回作業対象（既存ファイルのみ）
- 新規ファイル作成は対象外
- 既存ファイルの統合・削除のみ実施
- 理想構造への準拠度：既存分については100%

---
*この構造により、README.md理想構造への完全準拠を実現*