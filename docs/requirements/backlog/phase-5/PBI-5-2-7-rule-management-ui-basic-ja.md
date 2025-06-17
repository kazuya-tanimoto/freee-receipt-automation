# PBI-5-2-7: ルール管理UI - 基本機能

## 説明

ルール一覧、基本フィルタリング、ルールステータス管理を含む、生成されたマッチングルールを表示・管理するための基本ユーザーインターフェースを実装します。これにより、ユーザーはルール生成システムに対する可視性と制御を得られます。

## 実装詳細

### 作成/修正するファイル

1. `src/components/rules/RuleListView.tsx` - ルール一覧コンポーネント
2. `src/components/rules/RuleCard.tsx` - 個別ルール表示コンポーネント
3. `src/components/rules/RuleStatusToggle.tsx` - ルール有効/無効切り替え
4. `src/app/dashboard/rules/page.tsx` - ルール管理ページ
5. `src/lib/rules/rule-ui-helpers.ts` - UIユーティリティ関数

### 技術要件

- ソート機能付きページネーション一覧でルールを表示
- タイプ、信頼度、パフォーマンスを含むルール詳細を表示
- ルールタイプとステータスによる基本フィルタリングをサポート
- 確認ダイアログ付きルール有効/無効切り替え
- モバイル・デスクトップ表示対応のレスポンシブデザイン

### UIアーキテクチャ

```typescript
interface RuleListViewProps {
  rules: MatchingRule[];
  onRuleToggle: (ruleId: string, enabled: boolean) => void;
  onRuleSelect: (rule: MatchingRule) => void;
  loading?: boolean;
}

interface RuleCardProps {
  rule: MatchingRule;
  showActions?: boolean;
  compact?: boolean;
  onToggle?: (enabled: boolean) => void;
}

interface RuleFilter {
  type?: RuleType[];
  status?: "active" | "inactive" | "all";
  confidence?: {
    min: number;
    max: number;
  };
  performance?: {
    min: number;
    max: number;
  };
}
```

### フィルタリングとソート

```typescript
interface RuleSortOptions {
  field: "name" | "confidence" | "performance" | "created" | "lastUsed";
  direction: "asc" | "desc";
}

interface RuleListState {
  rules: MatchingRule[];
  filteredRules: MatchingRule[];
  currentFilter: RuleFilter;
  sortOptions: RuleSortOptions;
  pagination: PaginationState;
}
```

## 受け入れ基準

- [ ] ページネーション、ソート、フィルタリング付きルール一覧を表示
- [ ] 各ルールのタイプ、信頼度、パフォーマンス詳細を表示
- [ ] ルールタイプ、ステータス、信頼度範囲による基本フィルタリング
- [ ] 確認ダイアログ付きルール有効/無効切り替え
- [ ] モバイルとデスクトップでのレスポンシブデザイン
- [ ] ルール選択時の詳細表示モーダル

## 依存関係

- **必須**: PBI-5-2-5 (ルール信頼度スコアリング)
- **必須**: PBI-3-1-3 (基本UIコンポーネント)

## テスト要件

- 単体テスト: コンポーネントレンダリングとインタラクション
- 統合テスト: ルールデータ取得とフィルタリング
- UIテスト: レスポンシブデザインと使いやすさ

## 見積もり

1ストーリーポイント

## 優先度

中 - ユーザーエクスペリエンスと制御を向上

## 実装ノート

- Next.js App Routerでのページルーティング
- ルール一覧のクライアントサイドキャッシュ
- 大量ルール表示の仮想スクロール実装を検討
- アクセシビリティ対応（ARIA属性、キーボードナビゲーション）
