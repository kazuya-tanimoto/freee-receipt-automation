# TooMuch根絶プロジェクト

## 問題概要

- **Phase2実装**: 7,195行（1-2SPのPBI群で）
- **根本問題**: エンタープライズパターンの不適切適用
- **目標**: 9,060行→3,000行（約5倍の過剰実装を正常化）

## 削減実績（2025-07-22時点）

- **監視システム削除**: 2,613行削除（19ファイル→72行のlogger）
- **OAuth簡素化Phase 1完了**: 553行削除（実装コード：1,297行→744行、**43%削減**）
- **進捗**: 9,060行→5,894行（**35%削減**）
- **残り**: 2,894行削減必要

## ✅ 完了: OAuth簡素化Phase 1

- **実績**: 1,297行→744行（**43%削減**）
- **削除内容**:
  - 未使用ファイル7個（session.ts、common-oauth.ts、oauth-guards.ts等）
  - テストファイル4個
  - SessionManager（183行）
- **統合作業**: types.tsに定数統合（+43行）
- **品質**:
  - TypeScriptエラー0
  - ビルド成功
  - 162テスト全通過（+9テスト追加）
  - AuthProvider修正（Supabase直接使用）

## 次の作業: Gmail operations（第2優先）

- **現状**: message-list関連で800行超え
- **目標**: 機能別分割でファイルサイズ制限遵守
- **方針**: 単一責任の原則、関数分解

## アンチパターン事例

### 監視システム（2,685行→72行）

```typescript
// ❌悪い例: 複雑なメトリクス収集（19ファイル）
class MetricsRegistry { /* 300行の複雑な実装 */ }

// ✅良い例: シンプルログ（1ファイル）
export const logger = {
  info: (msg: string) => console.log(`[INFO] ${msg}`),
  error: (msg: string, err?: Error) => console.error(`[ERROR] ${msg}`, err),
};
```

### OAuth（2,338行→1,398行）

```typescript
// ❌悪い例: 5層継承階層、17ファイル
class GoogleOAuthProvider extends BaseOAuthProvider implements IOAuthProvider
class GoogleOAuthCore extends GoogleOAuthProvider { /* 複雑な実装 */ }

// ✅良い例: googleapis直接統合、10ファイル
export class GoogleOAuth extends GoogleOAuthClients {
  // 継承は最小限、直接googleapis使用
  private oauth2Client = new google.auth.OAuth2(/*...*/);
}
```

## 実装指針

- **ファイルサイズ**: 250行厳守
- **PBI制限**: 1SP=500行、2SP=1000行
- **禁止ワード**: comprehensive、robust、scalable
- **YAGNI原則**: 将来拡張より現在必要性

## 最終完了条件

- [ ] **OAuth簡素化**: 2,036行→150行
- [ ] **総行数3,000行以下**: 現在6,447行（残り3,447行削減必要）
- [ ] **全テスト通過**: 177テスト維持
