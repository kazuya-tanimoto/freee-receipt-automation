# PBI-5-2-2: ベンダー-カテゴリルール生成

## 説明

ユーザー修正パターンに基づいて、ベンダーからカテゴリへの自動マッピングルール生成を実装します。これにより、履歴ユーザー修正に基づいて特定ベンダーを経費カテゴリにマッピングするルールを作成します。

## 実装詳細

### 作成/修正するファイル

1. `src/lib/rules/vendor-rule-generator.ts` - ベンダー-カテゴリルール生成ロジック
2. `src/lib/rules/vendor-matcher.ts` - ベンダー名マッチングと正規化
3. `src/types/rules.ts` - ベンダールールタイプで更新
4. `src/lib/rules/__tests__/vendor-rule-generator.test.ts` - 単体テスト
5. `src/lib/rules/rule-templates.ts` - ルールテンプレート定義

### 技術要件

- ベンダー-カテゴリ修正パターンからルールを生成
- ベンダー名バリエーションとファジーマッチングを処理
- 修正頻度に基づくルール信頼度を計算
- 新規修正からのルール改良をサポート
- ルール競合検出と解決を実装

### ルール生成アーキテクチャ

```typescript
interface VendorRuleGenerator {
  generateRules(corrections: UserCorrection[]): Promise<VendorRule[]>;
  refineExistingRules(rules: VendorRule[], newCorrections: UserCorrection[]): Promise<VendorRule[]>;
  detectConflicts(rules: VendorRule[]): RuleConflict[];
  normalizeVendorName(vendorName: string): string;
}

interface VendorRule extends MatchingRule {
  ruleType: 'vendor_category';
  ruleData: {
    vendorPattern: string;
    vendorVariations: string[];
    targetCategory: string;
    fuzzyMatchThreshold: number;
  };
}

interface VendorRuleData {
  vendorPattern: string;
  vendorVariations: string[];
  targetCategory: string;
  fuzzyMatchThreshold: number;
  caseSensitive: boolean;
}
```

### ベンダーマッチング

```typescript
interface VendorMatcher {
  matchVendor(receiptVendor: string, rulePattern: string): MatchResult;
  calculateSimilarity(vendor1: string, vendor2: string): number;
  normalizeVendorName(vendorName: string): string;
  extractVendorVariations(corrections: UserCorrection[]): VendorVariation[];
}

interface VendorVariation {
  canonicalName: string;
  variations: string[];
  frequency: number;
}
```

## 受け入れ基準

- [ ] 修正パターンからベンダー-カテゴリルールを生成
- [ ] ベンダー名バリエーションとファジーマッチングを処理
- [ ] 修正頻度に基づく信頼度スコアを計算
- [ ] 新規修正データからのルール改良をサポート
- [ ] ルール競合を検出・解決
- [ ] 一貫したマッチングのためベンダー名を正規化

## 依存関係

- **必須**: PBI-5-2-1 (パターン抽出アルゴリズム)

## テスト要件

- 単体テスト: ルール生成ロジックとベンダーマッチング
- 統合テスト: 実際の修正データでのルール生成
- テストデータ: 様々なベンダー名と修正パターン

## 見積もり

1ストーリーポイント

## 優先度

高 - マッチング自動化のコアルールタイプ

## 実装ノート

- ファジーベンダーマッチングにレーベンシュタイン距離を使用
- ベンダー名正規化（大文字小文字、句読点）を実装
- 高度なベンダーマッチングに機械学習を検討
