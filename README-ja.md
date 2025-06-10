# AI 駆動開発ガイドライン

## ドキュメント概要

### 目的

人間開発者と AI エージェントが同じ情報源を共有し、コード・設計・運用を迷わず協働できる「レポジトリの地図」を定義

### 期待効果

- 新規参画者のオンボーディング短縮と手戻りコスト削減
- RAG 活用により LLM の回答精度向上
- CI で差分・互換性チェックし「ドキュメント腐敗」を防止

### 活用シーン

- 新規プロダクト立ち上げ
- 既存レポジトリのリファクタ／OSS公開整備
- 監査・セキュリティレビュー（証跡&ADR一元提示）

## 1. 構成ツリー

```text
.
├ README.md
├ CHANGELOG.md
├ .devcontainer.json        # ← 任意
├ .github/
│   └ workflows/
├ src/
├ tests/
├ docs/
│   ├ overview.md
│   ├ requirements/
│   │   ├ spec/            # 大粒 要件
│   │   └ backlog/         # PBI・GitHub Issue 連携
│   ├ design/
│   │   ├ architecture/
│   │   ├ db/
│   │   └ ui/
│   ├ api/
│   ├ standards/
│   │   └ coding-standards.md  # コーディング規約
│   ├ test/
│   ├ ops/
│   │   └ operational-guidelines.md  # 運用ガイドライン
│   └ adr/
└ ai/
    ├ system_prompt.md
    ├ glossary.yml
    ├ config/
    ├ prompts/
    ├ tasks/
    ├ context/
    │   └ context-optimization.md  # AIコンテキスト最適化
    ├ examples/            # ← 任意
    ├ feedback/            # ← 任意
    └ history/             # ← 任意
```

## 2. ファイル／ディレクトリ早見表

| 階層                 | 必須/任意            | 目的                              |
| -------------------- | -------------------- | --------------------------------- |
| `/README.md`         | ✅ 必須              | TL;DR / Quick Start               |
| `/CHANGELOG.md`      | ✅ 必須              | バージョン履歴 (Keep‑a‑Changelog) |
| `Makefile`           | ✅ 必須              | 共通コマンド集                    |
| `.github/workflows/` | ✅ 必須              | CI / CD & Security Hardening      |
| `.devcontainer.json` | ✅ 必須              | 再現可能な開発環境                |
| `docs/`              | ✅ 必須              | 人・AI 共通知識ベース             |
| `ai/`                | ✅ 必須              | AI メタレイヤ                     |
| `ai/context/`        | ✅ 必須              | AIコンテキスト最適化              |
| `ai/examples/`       | ▶︎ 推奨             | 成功パターン集                    |
| `ai/feedback/`       | ▶︎ 自動生成環境向け | AI 出力レビュー結果               |
| `ai/history/`        | ▶︎ 省略可           | セッションログ・要約保存          |
| `data-contract/`     | ▶︎ ドメイン依存     | データ契約 & スキーマ互換保証     |
| `benchmarks/`        | ▶︎ 任意             | 性能・コスト比較、評価レポート    |

| 階層 (続き)          | 主な中身                      | メンテ頻度     |
| -------------------- | ----------------------------- | -------------- |
| `/README.md`         | 5 分で動く手順                | 各リリース     |
| `/CHANGELOG.md`      | Added / Changed / Fixed       | リリース毎     |
| `Makefile`           | setup, test, embed 等         | 機能追加時     |
| `.github/workflows/` | Lint／Test／Deploy            | 更新毎         |
| `.devcontainer.json` | image／extensions             | 環境変化時     |
| `docs/`              | 3 参照                        | 随時           |
| `ai/`                | 4 参照                        | 随時           |
| `ai/context/`        | コンテキスト管理              | 方針大変更時   |
| `ai/examples/`       | ベスト実装                    | PR 採用時      |
| `ai/feedback/`       | 評価コメント                  | 各 PR          |
| `ai/history/`        | チャット履歴JSON, 日次 digest | 自動生成       |
| `data-contract/`     | AsyncAPI, Avro schema         | スキーマ変更時 |
| `benchmarks/`        | LLM推論コスト表, 実行時間測定 | 定期計測時     |

## 3. `docs/` — 人 & AI 共通知識ベース

### 3.1 `overview.md`

ビジネス背景・ゴール・制約。ゴール変化時更新。

### 3.2 `requirements/` — 二層管理

| サブパス   | 用途                                          | 運用                          |
| ---------- | --------------------------------------------- | ----------------------------- |
| `spec/`    | ビジネス要求・非機能要件 (`REQ‑001.md` など)  | 変更確定 ➡ ADR とリンク      |
| `backlog/` | PBI / 実装タスク粒度 (GitHub Issue ⇔ MD/YAML) | Issue テンプレで自動生成→閉鎖 |

> **FAQ: 大粒要件も実装タスクも混在?**
> 大枠仕様は `spec/`, 実装指示は `backlog/` に分割し静的設計書と動的バックログを両立。

### 3.3 `standards/` — コーディング規約

| サブパス              | 用途             | 運用                           |
| --------------------- | ---------------- | ------------------------------ |
| `coding-standards.md` | コーディング規約 | コード品質の維持と一貫性の確保 |

**主な内容**: ファイル行数制限（基本150行、最大250行）、命名規則、コードスタイル、AI コード生成ガイドライン

### 3.4 `ops/` — 運用ガイドライン

| サブパス                    | 用途             | 運用                                         |
| --------------------------- | ---------------- | -------------------------------------------- |
| `operational-guidelines.md` | 運用ガイドライン | プロジェクトの運用に関する重要なガイドライン |

**主な内容**: デプロイメントプロセス、モニタリング方針、インシデント対応、バックアップとリカバリ

### 3.5 その他サブディレクトリ

| パス                   | 役割                            | 補足                             |
| ---------------------- | ------------------------------- | -------------------------------- |
| `design/architecture/` | C4 図 (Mermaid)                 | `.mmd`→SVG を Actions で自動生成 |
| `api/`                 | `openapi.yaml` (SemVer)         | 破壊的変更で MAJOR++             |
| `adr/`                 | MADR テンプレ (`nadr-2.1.2.md`) | 1 決定＝1 ファイル               |

**`adr/` 運用ルール**: ID付与（`ADR-0001`, `ADR-0002`形式）、破壊的変更・技術選定時に新規ADR追加

## 4. `ai/` — AI メタレイヤ

| ディレクトリ       | 目的                            | メンテ方法     |
| ------------------ | ------------------------------- | -------------- |
| `system_prompt.md` | 共通前提・禁止事項              | 週次レビュー   |
| `glossary.yml`     | ドメイン用語⇔クラス名           | 新語追加       |
| `prompts/`         | 再利用テンプレ                  | テスト→昇格    |
| `tasks/`           | 自律タスク定義                  | 新フロー追加時 |
| `context/`         | AIコンテキスト最適化            | 方針大変更時   |
| `examples/`        | 成功パターン                    | ベスト採択時   |
| `feedback/`        | AI 出力レビュー                 | Bot 保存       |
| `history/`         | sessions / summaries / insights | Nightly 整理   |

**`history/` の構成と運用**:

| サブディレクトリ | 目的                       | 例                              |
| ---------------- | -------------------------- | ------------------------------- |
| `sessions/`      | 生チャットログ(JSON)       | `2025-05-06T06:00:session.json` |
| `summaries/`     | 上記の要約Markdown         | `2025-05-06T06:00:summary.md`   |
| `insights/`      | 定期バッチで抽出した改善点 | `2025-W19-insights.md`          |

**メンテ方法**: セッション終了後に自動で `sessions/` 保存、日次CRONで `summaries/` 生成、
週次で `insights/` 生成し `ai/feedback/` へ転記

## 5. 開発ガイドライン構成

プロジェクトの開発ガイドラインは以下の4つの主要部分で構成されています：

### 5.1 AIコンテキスト最適化 (`ai/context/`)

- **context-optimization.md**: AIアシスタントとの効率的な連携
- **summary-ja.md**: AI向け要約（2000トークン制限）
- トークン制限とコンテキスト管理
- RAGの最適化

### 5.2 コーディング規約 (`docs/standards/`)

- **coding-standards.md**: コーディング規約
- **bulletproof-react/**: Reactベストプラクティス（サブモジュール）
- **naming-cheatsheet/**: 命名規則ガイド（サブモジュール）
- ファイル行数制限（基本150行、最大250行）

### 5.3 運用ルール (`docs/ops/`)

- **operational-guidelines.md**: 運用ガイドライン
- **operational-rules.md**: 更新フロー、品質管理、メンテナンス
- デプロイメントプロセス
- インシデント対応

### 5.4 ドキュメント標準 (`docs/standards/`)

- **documentation-guidelines.md**: ドキュメント作成ガイドライン
- **review-guidelines.md**: レビューガイドライン
- **security-guidelines.md**: セキュリティガイドライン

### ガイドライン変更時の貢献プロセス

1. 課題（Issue）の作成
2. チームとの議論
3. プルリクエストの作成
4. レビューと承認

**重要事項**: SUMMARY-ja.md直接編集禁止（自動生成）、トークン制限（2000）厳守、
システムプロンプト統合考慮

## 6. CI/開発環境

- **Workflows**: `lint-and-test.yml`, `security-scan.yml`, `build-docker.yml`
- **Schema diff**: Confluent Registry互換チェック
- **DevContainer**: VS Code拡張、postCreate集中管理

## 7. 選択的追加ディレクトリ

| パス             | タイミング   | ユースケース         |
| ---------------- | ------------ | -------------------- |
| `docs/test/`     | テスト拡大   | テストピラミッド管理 |
| `docs/ops/`      | SRE専任      | SLO/Runbook          |
| `benchmarks/`    | LLM計測      | OpenAI Evals等       |
| `data-contract/` | イベント駆動 | AsyncAPI/Avro        |

### `data-contract/`詳細

データプロデューサーとコンシューマー間の「契約」をコード化。API契約同様に破壊的変更を防ぐ。

- **配置物**: `customer.avro`, `orders.proto`, `contract.md`
- **メンテ**: スキーマ変更時PR作成、CI後方互換テスト、リリースノートに`BREAKING CHANGE`記載

### `benchmarks/`詳細

LLM推論コスト、性能、メモリ定点観測でモデル/プロンプト変更の意思決定材料化。

- **配置物**: `benchmark_2025-05.csv`, `plots/latency.png`, `README.md`
- **メンテ**: `make benchmark`で計測→CSV追記、Pythonスクリプトでグラフ更新・PR貼付

## 8. カスタマイズ参考

- **Bulletproof React** — React大規模構成例
- **Naming Cheatsheet** — 分かりやすい命名指針

## 9. 更新フロー

1. Issue/ADRで方針決定
2. PR: 実装&ドキュメント更新
3. CI: Lint/Test/schema diff/Secret Scan
4. レビュー&マージ: `ai/feedback/`に要約保存
5. CHANGELOG更新→Tag→リリース

## 10. 改善アイデア

- `benchmarks/`でレイテンシ・コスト定点観測
- Mermaid→SVG自動化で図とソース乖離ゼロ
- `ai/prompts/`に`version:`フィールドで履歴追跡
