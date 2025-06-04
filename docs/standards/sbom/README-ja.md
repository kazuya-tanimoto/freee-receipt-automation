# SBOM（Software Bill of Materials、ソフトウェア部品表）

## 概要
このディレクトリには、プロジェクトのSBOMが含まれています。SBOMは、ソフトウェアの構築に使用される各種コンポーネントの詳細とサプライチェーン関係を記録した正式な文書です。

## 内容
- `sbom.xml`: CycloneDX形式のSBOM
- `sbom.json`: JSON形式のSBOM
- `licenses/`: 依存関係のライセンス情報（各パッケージのライセンス識別子を含む）

## 生成方法
SBOMはCycloneDXを使用して自動生成されます：

```bash
# CycloneDX CLIのインストール
npm install -g @cyclonedx/cyclonedx-npm

# SBOMの生成
cyclonedx-npm --output-file ./docs/standards/sbom/sbom.xml
cyclonedx-npm --output-file ./docs/standards/sbom/sbom.json --format json
```

## 更新スケジュール
- 依存関係の更新時の手動生成
- リリース前のレビューと検証
- 将来: 週次自動生成を計画

## 使用方法
- セキュリティ監査
- ライセンスコンプライアンスチェック
- 依存関係の脆弱性スキャン
- サプライチェーンリスク評価

## セキュリティ
- 機密コードがSBOM内に含まれないよう、`--exclude`オプションでパスを指定しています
- ライセンス情報は別ファイル（`licenses/`）に出力され、CVE対応時の確認に使用できます

## 参考リンク
- [CycloneDX仕様](https://cyclonedx.org/specification/overview/)
- [SPDXライセンスリスト](https://spdx.org/licenses/)
- [OWASP依存関係チェック](https://owasp.org/www-project-dependency-check/)

## 変更履歴
| 日付 | バージョン | 変更内容 | 担当者 |
|------|------------|----------|--------|
| 2024-03-21 | 1.0.0 | 初版作成 | AI Assistant | 