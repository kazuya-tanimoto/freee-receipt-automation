# AI-Driven Development Guidelines

## Document Overview

### Purpose

Define a "repository map" where human developers and AI agents share the same information source and collaborate
seamlessly on code, design, and operations.

### Expected Benefits

- Reduce participant onboarding time and minimize rework costs
- Improve LLM response accuracy through RAG utilization
- Prevent "documentation decay" by CI diff/compatibility checks

### Use Cases

- New product launch
- Refactoring existing repositories/OSS publication prep
- Audits and security reviews (centralized evidence & ADR)

## 1. Structure Tree

```text
.
├ README.md
├ CHANGELOG.md
├ .devcontainer.json        # ← Optional
├ .github/
│   └ workflows/
├ src/
├ tests/
├ docs/
│   ├ overview.md
│   ├ requirements/
│   │   ├ spec/            # "Coarse-grained" requirements
│   │   └ backlog/         # PBI・GitHub Issue integration
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
    ├ examples/            # ← Optional
    ├ feedback/            # ← Optional
    └ history/             # ← Optional
```

## 2. File/Directory Quick Reference

| Path                 | Required/Optional    | Purpose                            |
| -------------------- | -------------------- | ---------------------------------- |
| `/README.md`         | ✅ Required          | TL;DR / Quick Start                |
| `/CHANGELOG.md`      | ✅ Required          | Version history (Keep‑a‑Changelog) |
| `Makefile`           | ✅ Required          | Common command collection          |
| `.github/workflows/` | ✅ Required          | CI / CD & Security Hardening       |
| `.devcontainer.json` | ✅ Required          | Reproducible dev environment       |
| `docs/`              | ✅ Required          | Human & AI shared knowledge base   |
| `ai/`                | ✅ Required          | AI meta-layer                      |
| `ai/context/`        | ✅ Required          | AI context optimization            |
| `ai/examples/`       | ▶︎ Recommended      | Collection of successful patterns  |
| `ai/feedback/`       | ▶︎ Auto-gen env     | AI Output Review                   |
| `ai/history/`        | ▶︎ Optional         | Session Log & Summary Storage      |
| `data-contract/`     | ▶︎ Domain-dependent | Data Contract & Schema             |
| `benchmarks/`        | ▶︎ Optional         | Performance/Cost Comparison        |

| Path (continued)     | Main Contents                   | Maintenance Frequency     |
| -------------------- | ------------------------------- | ------------------------- |
| `/README.md`         | 5-minute setup procedure        | Each release              |
| `/CHANGELOG.md`      | Added / Changed / Fixed         | Each release              |
| `Makefile`           | setup, test, embed, etc.        | When adding features      |
| `.github/workflows/` | Lint／Test／Deploy              | Each update               |
| `.devcontainer.json` | image／extensions               | Environment changes       |
| `docs/`              | See section 3                   | As needed                 |
| `ai/`                | See section 4                   | As needed                 |
| `ai/context/`        | Context management              | When major policy changes |
| `ai/examples/`       | Best implementations            | When PR is adopted        |
| `ai/feedback/`       | Evaluation comments             | Each PR                   |
| `ai/history/`        | Chat history JSON, daily digest | Auto-generation           |
| `data-contract/`     | AsyncAPI, Avro schema           | Schema changes            |
| `benchmarks/`        | LLM cost table, execution time  | Regular measurement       |

## 3. `docs/` — Human & AI Shared Knowledge Base

### 3.1 `overview.md`

Business background, goals, constraints. Update when goals change.

### 3.2 `requirements/` — Two-layer Management

| Subpath    | Purpose                                             | Operation                          |
| ---------- | --------------------------------------------------- | ---------------------------------- |
| `spec/`    | Business requirements, non-functional (REQ‑001.md)  | Confirmed changes ➡ Link to ADR   |
| `backlog/` | PBI / Implementation tasks (GitHub Issue ⇔ MD/YAML) | Auto-generated from Issue template |

> **FAQ: Are coarse-grained requirements and implementation tasks mixed?** Framework specifications are in `spec/`,
> implementation instructions are in `backlog/`, enabling both static design documents and dynamic backlogs.

### 3.3 `standards/` — コーディング規約

| Subpath               | Usage            | Operation                      |
| --------------------- | ---------------- | ------------------------------ |
| `coding-standards.md` | コーディング規約 | コード品質の維持と一貫性の確保 |

**Main Content**: File line limits (basic 150, max 250), naming conventions, code style, AI code generation

### 3.4 `ops/` — 運用ガイドライン

| Subpath                     | Usage            | Operation                                    |
| --------------------------- | ---------------- | -------------------------------------------- |
| `operational-guidelines.md` | 運用ガイドライン | プロジェクトの運用に関する重要なガイドライン |

**Main Content**: Deployment process, monitoring policy, incident response, backup and recovery

### 3.5 Other Subdirectories

| Path                   | Role                            | Notes                                |
| ---------------------- | ------------------------------- | ------------------------------------ |
| `design/architecture/` | C4 diagrams (Mermaid)           | `.mmd`→SVG auto-generated by Actions |
| `api/`                 | `openapi.yaml` (SemVer)         | MAJOR++ for breaking changes         |
| `adr/`                 | MADR template (`nadr-2.1.2.md`) | 1 decision = 1 file                  |

**`adr/` Operation Rules**: ID assignment (`ADR-0001`, `ADR-0002` format), add new ADR for breaking changes

## 4. `ai/` — AI Meta-layer

| Directory          | Purpose                             | Maintenance Method              |
| ------------------ | ----------------------------------- | ------------------------------- |
| `system_prompt.md` | Common assumptions and prohibitions | Weekly review                   |
| `glossary.yml`     | Domain terms ⇔ Class names          | Add new terms                   |
| `prompts/`         | Reusable templates                  | Test → Promotion                |
| `tasks/`           | Autonomous task definitions         | When adding new flows           |
| `context/`         | Long-form background (for RAG)      | When major policy changes       |
| `examples/`        | Successful patterns                 | When best practices are adopted |
| `feedback/`        | AI output reviews                   | Bot saved                       |
| `history/`         | sessions / summaries / insights     | Nightly organization            |

**`history/` Structure and Operation**:

| Subdirectory | Purpose                                        | Example                         |
| ------------ | ---------------------------------------------- | ------------------------------- |
| `sessions/`  | Raw chat logs (JSON)                           | `2025-05-06T06:00:session.json` |
| `summaries/` | Markdown summaries of the above                | `2025-05-06T06:00:summary.md`   |
| `insights/`  | Improvement points extracted by periodic batch | `2025-W19-insights.md`          |

**Maintenance Method**: Auto-save to `sessions/` after session ends, daily CRON generates `summaries/`, weekly generate
`insights/` and transfer to `ai/feedback/`

## 6. CI/Development Environment

- **Workflows**: `lint-and-test.yml`, `security-scan.yml`, `build-docker.yml`
- **Schema diff**: Confluent Registry compatible check
- **DevContainer**: VS Code extensions, centralized postCreate management

## 7. Selective Additional Directories

| Path             | Timing          | Use Case                |
| ---------------- | --------------- | ----------------------- |
| `docs/test/`     | Test expansion  | Test pyramid management |
| `docs/ops/`      | SRE dedicated   | SLO/Runbook             |
| `benchmarks/`    | LLM measurement | OpenAI Evals etc.       |
| `data-contract/` | Event-driven    | AsyncAPI/Avro           |

### `data-contract/` Details

**Usage**: Store "contracts" between data producers and consumers as code. Prevent breaking changes similar to API
contracts.

- **Placement**: `customer.avro`, `orders.proto`, `contract.md`, etc.
- **Maintenance Method**:
  1. Create PR when schema changes, run backward compatibility tests in CI
  2. Always include `BREAKING CHANGE` tag in release notes

### `benchmarks/` Details

**Usage**: Monitor LLM inference costs, performance, memory, etc. to provide decision-making material for model/prompt
changes.

- **Placement**: `benchmark_2025-05.csv`, `plots/latency.png`, `README.md`
- **Maintenance Method**:
  1. Measure with `make benchmark` → Append to CSV
  2. Update graphs with Python script, attach to PR

## 8. Customization Reference

- **[Bulletproof React](docs/standards/bulletproof-react/README.md)** — Submodule under `docs/standards/` providing a
  React large-scale configuration example
- **[Naming Cheatsheet](docs/standards/naming-cheatsheet/README.md)** — Submodule under `docs/standards/` providing
  clear naming guidelines

## 9. Update Flow

1. Decide policy with Issue/ADR
2. PR: Implementation & documentation update
3. CI: Lint/Test/schema diff/Secret Scan
4. Review & Merge: Save summary to `ai/feedback/`
5. Update CHANGELOG → Tag → Release

## 10. Improvement Ideas

- Monitor latency/cost with `benchmarks/`
- Automate Mermaid→SVG for zero diagram-source discrepancy
- Add `version:` field to `ai/prompts/` for history tracking
