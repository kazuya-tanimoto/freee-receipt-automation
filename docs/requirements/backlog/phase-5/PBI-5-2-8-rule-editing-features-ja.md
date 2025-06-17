# PBI-5-2-8: ルール編集・カスタマイゼーション機能

## 説明

ルール編集、手動ルール作成、ルール複製、バッチ操作を含む高度なルール管理機能を実装します。これにより、ユーザーは自動生成されたマッチングルールをカスタマイズ・微調整できます。

## 実装詳細

### 作成/修正するファイル

1. `src/components/rules/RuleEditor.tsx` - ルール編集フォームコンポーネント
2. `src/components/rules/RuleCreator.tsx` - 手動ルール作成コンポーネント
3. `src/components/rules/RuleBatchActions.tsx` - バッチ操作コンポーネント
4. `src/lib/rules/rule-editor-helpers.ts` - ルール編集ユーティリティ
5. `src/app/dashboard/rules/[id]/edit/page.tsx` - ルール編集ページ

### 技術要件

- 検証付きフォームベースルール編集
- すべてのルールタイプ（ベンダー、キーワード、金額、日付）をサポート
- リアルタイムルール検証とプレビュー
- バッチ操作（複数ルールの有効/無効、削除）
- ルール複製とテンプレート作成

### 編集アーキテクチャ

```typescript
interface RuleEditorProps {
  rule?: MatchingRule;
  mode: "create" | "edit" | "duplicate";
  onSave: (rule: MatchingRule) => Promise<void>;
  onCancel: () => void;
}

interface RuleFormData {
  name: string;
  description: string;
  ruleType: RuleType;
  ruleData: any;
  isActive: boolean;
  priority: number;
}

interface RuleBatchActionsProps {
  selectedRules: string[];
  onBatchAction: (action: BatchAction, ruleIds: string[]) => Promise<void>;
  availableActions: BatchAction[];
}
```

### バッチ操作

```typescript
type BatchAction = "enable" | "disable" | "delete" | "duplicate" | "export";

interface BatchActionResult {
  action: BatchAction;
  successCount: number;
  failureCount: number;
  errors: BatchError[];
}

interface RuleTemplate {
  name: string;
  description: string;
  ruleType: RuleType;
  defaultData: any;
  customizable: string[];
}
```

## 受け入れ基準

- [ ] すべてのルールタイプの包括的フォームベース編集
- [ ] リアルタイム検証とルールプレビュー機能
- [ ] 複数ルールのバッチ有効/無効/削除操作
- [ ] 既存ルールからの複製とテンプレート作成
- [ ] ルール変更の変更履歴追跡
- [ ] 不正な設定の検証エラーとヘルプテキスト

## 依存関係

- **必須**: PBI-5-2-6 (ルール検証システム)
- **必須**: PBI-5-2-7 (ルール管理UI基本機能)

## テスト要件

- 単体テスト: ルール編集ロジックとフォーム検証
- 統合テスト: ルール保存とバッチ操作
- UIテスト: フォーム使いやすさとエラー処理

## 見積もり

2ストーリーポイント

## 優先度

中 - ユーザーのカスタマイゼーション能力を向上

## 実装ノート

- React Hook FormまたはFormikでのフォーム管理
- ルール変更のリアルタイム検証
- 複雑なルール編集の段階的ウィザード
- 変更前確認とロールバック機能
