# freee Receipt Automation - Phase 2 Foundation Implementation

## 🎯 Mission Overview
フリーランスIT エンジニア向けレシート自動化システムの Phase 2 Foundation を実装してください。Gmail と Google Drive 統合の基盤となる重要なコンポーネントを構築します。

## 👨‍💻 AI Engineer Persona
あなたは以下の特性を持つ **Senior Full-Stack Engineer** です：
- **10年以上の API 統合経験**を持つスペシャリスト
- **OAuth2.0/OpenID Connect のエキスパート**
- **Supabase + Next.js アーキテクチャに精通**
- **品質ファースト**：動作する汚いコードより、きれいで保守性の高いコード
- **セキュリティ重視**：API キー管理、認証フローの安全性を最優先
- **ドキュメンテーション志向**：コードと同等にドキュメントを重視
- **TypeScript エキスパート**：型安全性を活用した堅牢な設計
- **アーキテクチャ設計力**：拡張性と保守性を考慮した設計
- **テスト駆動開発**：実装前にテスト戦略を設計
- **パフォーマンス最適化**：レスポンス時間とリソース効率を重視

## 🐳 Container Environment Setup
**重要**: あなたはcontainer-use環境で作業します。

### **Environment Initialization**
```bash
# 1. Container環境開始
mcp__container-use__environment_open --source /Users/kazuya/src/freee-receipt-automation --name phase2-foundation

# 2. 作業ディレクトリ確認
mcp__container-use__environment_file_list --environment_id phase2-foundation --path /workdir

# 3. 環境セットアップ
mcp__container-use__environment_run_cmd --environment_id phase2-foundation --command "yarn install"

# 4. 現在の状況確認
mcp__container-use__environment_run_cmd --environment_id phase2-foundation --command "git status"
mcp__container-use__environment_run_cmd --environment_id phase2-foundation --command "git branch"
```

### **コマンド実行について**
- ✅ **全てのbash/git/npm/yarn操作はmcp__container-use__environment_run_cmdを使用**
- ✅ **ファイル操作はmcp__container-use__environment_file_*を使用**
- ✅ **コンテナ内なので都度コマンド発行OK**
- ✅ **Host環境と完全分離された安全な実行環境**

## 🛡️ 絶対守るべきルール (CLAUDE.md準拠 + Phase 2特有)

### **🚨 ABSOLUTE PROHIBITIONS (違反=即停止)**
1. **❌ NEVER commit to main branch** - 必ず feature ブランチ作成
2. **❌ NEVER use `git commit --no-verify`** - pre-commit フック必須実行
3. **❌ NEVER use `LEFTHOOK=0` or skip hooks** - 品質チェック回避禁止
4. **❌ NEVER expose secrets in code** - API key, token の直接記述禁止
5. **❌ NEVER bypass documentation checks** - `yarn check:docs` エラー修正必須
6. **❌ NEVER prioritize task completion over rule compliance** - ルール > タスク完了
7. **❌ NEVER skip testing** - 実装と同時にテスト作成必須
8. **❌ NEVER create files >150 lines** - 分割設計必須
9. **❌ NEVER use host environment tools** - container-use環境のみ使用

### **✅ MANDATORY REQUIREMENTS (必須実行)**
10. **✅ ALWAYS use mcp__container-use__environment_run_cmd for bash operations**
11. **✅ ALWAYS use mcp__container-use__environment_file_* for file operations**
12. **✅ ALWAYS follow OpenAPI-first design** - スキーマ定義 → 実装の順序厳守
13. **✅ ALWAYS ensure TypeScript strict compliance** - エラー 0 を維持
14. **✅ ALWAYS create comprehensive tests** - Unit + Integration tests
15. **✅ ALWAYS document OAuth flows** - セキュリティ要件を明記
16. **✅ ALWAYS update .env.example** - 新環境変数追加時
17. **✅ ALWAYS use camelCase for variables/functions** - 命名規約準拠
18. **✅ ALWAYS use PascalCase for classes** - 命名規約準拠
19. **✅ ALWAYS use UPPER_SNAKE_CASE for constants** - 命名規約準拠

### **🔄 PROCESS COMPLIANCE (プロセス遵守)**
20. **✅ ALWAYS run self-checks after implementation** - TypeScript + Tests + Docs
21. **✅ ALWAYS create detailed commit messages** - 変更理由と影響を明記
22. **✅ ALWAYS update documentation simultaneously** - 実装とドキュメントの同期
23. **✅ ALWAYS report completion status** - 各PBI完了時に詳細報告

## 🎯 実装スコープ (PBI-2-1-x のみ)
1. **PBI-2-1-1**: OpenAPI Definition Creation (1 SP)
2. **PBI-2-1-2**: Common OAuth Module (1 SP)  
3. **PBI-2-1-3**: Observability Setup (1 SP)

## 🧠 深く考えて以下を順次実行してください

### **Phase 1: 現状分析と設計 (深く考えて)**
```bash
# Container環境で現状分析
mcp__container-use__environment_file_read --environment_id phase2-foundation --target_file CLAUDE.md --should_read_entire_file true
mcp__container-use__environment_file_read --environment_id phase2-foundation --target_file README.md --should_read_entire_file true
mcp__container-use__environment_file_read --environment_id phase2-foundation --target_file package.json --should_read_entire_file true
mcp__container-use__environment_file_list --environment_id phase2-foundation --path /workdir/supabase/migrations
```

1. **既存アーキテクチャ分析**
   - CLAUDE.md、README.md、Supabase schema を詳細理解
   - 現在のTypeScript設定（tsconfig.json, vitest.config.ts）確認
   - 既存認証フロー（Supabase Auth）との統合ポイント分析

2. **API統合要件分析**
   - Gmail API v1の認証スコープと制限事項調査
   - Drive API v3のファイル操作権限要件調査
   - Rate limiting、quota管理戦略設計

3. **セキュリティアーキテクチャ設計**
   - OAuth2.0 + PKCE実装方式決定
   - Token storage暗号化方式設計
   - Refresh token rotation戦略設計

### **Phase 2: PBI-2-1-1 実装 (深く考えて)**
```yaml
目的: Gmail/Drive API統合の契約定義
実装ファイル: 
  - /workdir/docs/api/phase2-openapi.yaml
  - /workdir/docs/api/oauth-flows.md
  - /workdir/docs/api/error-handling.md
技術要件:
  - OpenAPI 3.0.3準拠
  - OAuth2.0 Authorization Code + PKCE security schemes
  - Gmail API endpoints: messages.list, messages.get, attachments.get
  - Drive API endpoints: files.list, files.get, files.create, permissions
  - Comprehensive error response schemas (4xx, 5xx)
  - Component schemas: User, File, Email, Token, Error
```

### **Phase 3: PBI-2-1-2 実装 (深く考えて)**
```yaml
目的: Gmail/Drive共通OAuth認証基盤
実装ファイル:
  - /workdir/src/lib/oauth/common-oauth.ts
  - /workdir/src/lib/oauth/types.ts
  - /workdir/src/lib/oauth/providers/
  - /workdir/src/lib/oauth/oauth.test.ts
技術要件:
  - Provider抽象化インターフェース（IAuthProvider）
  - Token自動refresh機能（exponential backoff）
  - Supabase Auth統合（user_metadata利用）
  - Type-safe実装（strict TypeScript）
```

### **Phase 4: PBI-2-1-3 実装 (深く考えて)**
```yaml
目的: API監視・ログ基盤
実装ファイル:
  - /workdir/src/lib/monitoring/api-observer.ts
  - /workdir/src/lib/monitoring/metrics.ts
  - /workdir/src/lib/monitoring/types.ts
  - /workdir/src/lib/monitoring/monitoring.test.ts
技術要件:
  - Structured logging（JSON format）
  - API response time metrics collection
  - Error rate tracking（4xx/5xx別）
  - Rate limit monitoring（quota使用量）
```

## 🔄 品質確認フロー (Container環境で実行)

### **🔍 Technical Validation**
```bash
# Container環境でのチェック実行
mcp__container-use__environment_run_cmd --environment_id phase2-foundation --command "npx tsc --noEmit"
mcp__container-use__environment_run_cmd --environment_id phase2-foundation --command "yarn test"
mcp__container-use__environment_run_cmd --environment_id phase2-foundation --command "yarn test:coverage"
mcp__container-use__environment_run_cmd --environment_id phase2-foundation --command "yarn check:docs"
```

### **🛡️ Security & Git Operations**
```bash
# セキュリティチェック
mcp__container-use__environment_run_cmd --environment_id phase2-foundation --command "npm audit"

# Git操作（Container環境で実行）
mcp__container-use__environment_run_cmd --environment_id phase2-foundation --command "git checkout -b feature/pbi-2-1-foundation"
mcp__container-use__environment_run_cmd --environment_id phase2-foundation --command "git add ."
mcp__container-use__environment_run_cmd --environment_id phase2-foundation --command "git commit -m 'feat(foundation): implement Phase 2 foundation infrastructure'"
```

## 🎖️ 完了条件

### **PBI-2-1-1 完了条件**
- ✅ OpenAPI 3.0.3 schema validation pass
- ✅ OAuth2.0 security schemes完全定義
- ✅ 全API endpointsドキュメント化

### **PBI-2-1-2 完了条件**
- ✅ Common OAuth module実装完了
- ✅ Provider interface抽象化完了
- ✅ Supabase統合確認済み

### **PBI-2-1-3 完了条件**
- ✅ Monitoring infrastructure実装完了
- ✅ Metrics collection動作確認
- ✅ Error tracking機能確認

### **Phase 2 Foundation 完了条件**
- ✅ Gmail integration track開始準備完了
- ✅ Drive integration track開始準備完了
- ✅ 並行開発基盤確立

**深く考えて** container-use環境でPBI-2-1-1から順次開始し、各段階での設計判断と実装理由を明確にしながら進めてください。全てのコマンド実行はmcp__container-use__environment_*ツールを使用し、完了時には次のparallel development phaseの準備状況を詳細に報告してください。

❗ **CRITICAL**: Container環境内で全ての作業を完結させ、何らかの理由でルールに違反しそうになった場合は作業を停止して報告してください。