# PBI-4-2-1: 画像前処理パイプライン

## 説明

OCR処理前のレシート画像を向上させるための基本的な画像前処理パイプラインを実装し、明度・コントラスト調整、シンプルな回転補正、基本的ノイズ除去をCanvas
APIで実装しテキスト認識精度を向上させます。

## 実装詳細

### 作成/修正するファイル

1. `src/services/ocr/preprocessing/ImageProcessor.ts` - メイン画像処理サービス
2. `src/services/ocr/preprocessing/filters/` - 個別フィルター実装
3. `src/services/ocr/preprocessing/detection/` - ドキュメント検出アルゴリズム
4. `src/lib/image/types.ts` - 画像処理型定義
5. `src/lib/image/utils.ts` - 画像ユーティリティ関数
6. `src/services/ocr/preprocessing/pipeline.ts` - 処理パイプライン統括
7. `src/config/preprocessing.ts` - 前処理設定
8. `src/workers/image-processing.worker.ts` - 重い処理用Web Worker

### 技術要件

- クライアントサイド画像処理用Canvas API
- 基本的な画像形式サポート（JPEG、PNG）
- シンプルな画像強化アルゴリズム:
  - 明度とコントラスト調整
  - 90度単位の回転補正
  - 基本的ノイズ除去
- ノンブロッキング処理用Web Workers
- モバイルデバイス用メモリ効率処理

### セキュリティ考慮事項

- 画像データのサニタイゼーションと検証
- 処理操作後のメモリクリーンアップ
- 一時画像ファイルの安全な処理
- 処理リクエストのレート制限

### パフォーマンス最適化

- ノンブロッキング画像処理用Web Worker
- より良いパフォーマンスのためのCanvasオフスクリーンレンダリング
- 最適な処理速度のための画像リサイズ
- 処理結果のキャッシュ
- 大容量画像の段階的読み込み

## 見積もり

1 ストーリーポイント

## 優先度

高 - OCR精度向上の基盤
