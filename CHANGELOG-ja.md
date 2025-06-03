# 変更履歴

このプロジェクトの重要な変更はすべてこのファイルに記録されます。

フォーマットは[Keep a Changelog](https://keepachangelog.com/en/1.0.0/)に基づいており、
このプロジェクトは[Semantic Versioning](https://semver.org/spec/v2.0.0.html)に従っています。

## [未リリース]

### 変更

- AIコンテキストサマリーのトークン数削減:
  - `ai/context/summary.md`と`summary-ja.md`を2000トークン制限内に最適化
  - 重要な情報を維持しつつ内容を凝縮
  - 冗長な例と説明を削除

### 修正

- ドキュメントのMarkdownリントエラー:
  - `README-ja.md`の見出し周りに適切な空白行を追加
  - `CHANGELOG-ja.md`の末尾スペースを修正
  - チェンジログファイルの末尾に改行を追加
