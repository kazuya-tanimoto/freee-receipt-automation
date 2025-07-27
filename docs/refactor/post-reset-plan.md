# TooMuch排除後の今後実装プラン

## 現状総括

### プロジェクトリセットの成果
- **削除済み**: src/全体 (7,883行)、複雑なDB設計、エンタープライズパターン
- **保持済み**: spec、PBI、基本設定ファイル
- **現在のコード規模**: 61,662行 → 約200行（99.7%削減達成）

### ユーザー要望の再確認
「週4通のレシート処理を自動化するfreee連携システム」
- **自動実行**: pg_cronによる週次バックグラウンド処理
- **管理UI**: NextJS、処理結果確認・修正画面
- **運用コスト**: 年間$5以下

## spec準拠MVP定義

### 必須機能（spec要件）
1. **自動レシート処理**
   - Gmail API経由でメール取得（Apple課金等）
   - 手動配置PDF処理（Amazon、楽天等）
   - OCR実行（Google Vision API）

2. **freee連携**
   - API経由で取引データ取得
   - 金額・日付マッチング
   - 自動経費登録・領収書添付

3. **管理UI** ⭐️ 必須要件
   - 処理状況確認画面
   - 手動修正機能
   - ダッシュボード

4. **自動実行** ⭐️ 必須要件
   - 週次実行（pg_cron）
   - メール通知
   - エラーハンドリング

5. **ファイル管理**
   - Google Drive保存
   - 月別フォルダ構成
   - 短縮ファイル名

## ミニマムPBI構造（6個のPBI）

### MVP-PBI-1: 基本セットアップ（50行）
```
期間: 1日
成果物:
├── package.json (Next.js minimal)
├── .env.example
├── src/lib/config.ts
└── pages/index.tsx (hello world)
```

### MVP-PBI-2: Gmail連携（100行）
```
期間: 1日
成果物:
├── src/lib/gmail.ts (OAuth + 検索)
├── pages/api/gmail/auth.ts
└── 1ファイル完結実装
```

### MVP-PBI-3: OCR処理（80行）
```
期間: 1日
成果物:
├── src/lib/ocr.ts (Vision API)
├── 金額・日付抽出ロジック
└── エラーハンドリング
```

### MVP-PBI-4: freee連携（100行）
```
期間: 1日
成果物:
├── src/lib/freee.ts (OAuth + API)
├── 取引マッチング
└── 経費登録処理
```

### MVP-PBI-5: 管理UI（100行）
```
期間: 1日
成果物:
├── pages/dashboard.tsx
├── 処理状況表示
└── 手動修正フォーム
```

### MVP-PBI-6: 自動実行（50行）
```
期間: 1日
成果物:
├── supabase/functions/weekly-process/index.ts
├── pg_cron設定
└── メール通知
```

## 実装戦略

### 技術方針
- **ライブラリ**: googleapis、@supabase/supabase-js のみ
- **ファイル制限**: 各PBI 100行以内
- **依存関係**: 最小限（Next.js + Supabase）
- **テスト**: 重要な関数のみ

### 3回の失敗を避ける設計
1. **小さなコンテキスト**: 1PBI = 1日 = 1人で理解可能
2. **単一責任**: 各ファイルが1つの機能のみ担当
3. **直接実装**: ラッパー、抽象化、パターンを避ける

### データ設計（ミニマム）
```sql
-- 1テーブルのみ
CREATE TABLE processing_logs (
  id UUID PRIMARY KEY,
  email_id TEXT,
  amount DECIMAL,
  date DATE,
  freee_transaction_id TEXT,
  status TEXT, -- pending/matched/failed
  created_at TIMESTAMP
);
```

## 実装スケジュール

### Week 1: MVP構築（6日）
```
Day 1: PBI-1 基本セットアップ
Day 2: PBI-2 Gmail連携
Day 3: PBI-3 OCR処理
Day 4: PBI-4 freee連携
Day 5: PBI-5 管理UI
Day 6: PBI-6 自動実行
```

### Week 2: 動作確認（3日）
```
Day 7: 実際のレシート1件で動作確認
Day 8: エラー修正・調整
Day 9: 週次実行テスト
```

## 成功の定義

### 動作する最小システム
- Gmail経由でApple課金レシート取得
- OCRで金額・日付抽出
- freeeの未処理取引とマッチング
- 管理UIで結果確認
- 週次自動実行

### 品質基準
- 各ファイル100行以内
- エラー時の停止（フェイルファスト）
- spec要件100%準拠

## AIチャット引き継ぎ指針

### 新チャットでの開始方法
1. `docs/refactor/post-reset-plan.md` を読む
2. 上記MVP-PBI構造から開始
3. **TooMuch厳禁**: エンタープライズパターン使用禁止

### 実装時の注意
- specファイルを常に参照
- 100行制限を絶対厳守
- 複雑な依存関係作成禁止
- 「週4通処理」にフォーカス

### 品質確認
```bash
# 必須チェック
find src -name "*.ts" -exec wc -l {} + | sort -n
# 100行超過ファイルがあったら即座に分割
```

---

**重要**: このプランは3回の失敗を踏まえ、「AIが混乱しない小さなコンテキスト」を最優先に設計している。新機能追加時も必ずこの原則を維持すること。