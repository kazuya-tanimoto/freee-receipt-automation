# TooMuch根絶プロジェクト

## 問題概要

- **Phase2実装**: 7,195行（1-2SPのPBI群で）
- **根本問題**: エンタープライズパターンの不適切適用
- **目標**: 9,060行→3,000行（約5倍の過剰実装を正常化）

## 削減実績（2025-07-21時点）

- **監視システム削除**: 2,613行削除（19ファイル→72行のlogger）
- **進捗**: 9,060行→6,447行（29%削減）
- **残り**: 3,447行削除必要

## 次の作業: OAuth簡素化（最優先）

- **現状**: 17ファイル、2,036行
- **目標**: 1-2ファイル、150行以内
- **方針**: googleapis直接使用、抽象化レイヤー削除

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

### OAuth（2,036行→150行予定）

```typescript  
// ❌悪い例: 17ファイルの抽象化
interface IOAuthProvider { /* 複雑な抽象化 */ }

// ✅良い例: googleapis直接実装
const oauth2Client = new google.auth.OAuth2(/*...*/);
export const googleOAuth = {
  getAuthUrl: () => oauth2Client.generateAuthUrl({/*...*/}),
  exchangeCode: async code => { /* 直接実装 */ },
};
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
