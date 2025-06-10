<!-- MAX_TOKENS: 2000 -->

# 開発ガイドライン要約

このドキュメントは[Bulletproof React](https://github.com/alan2207/bulletproof-react)と[Naming Cheatsheet](https://github.com/kettanaito/naming-cheatsheet)の開発ガイドラインの要約を提供します。

## Bulletproof React

### プロジェクト標準

- **ESLint**: `.eslintrc.js`でコード品質維持
- **Prettier**: `.prettierrc`で一貫したフォーマット
- **TypeScript**: リファクタリング支援。型宣言を先に更新
- **Husky**: コミット前検証のgitフック実装
- **絶対パスインポート**: 相対パスの煩雑さを回避
- **ファイル命名**: ESLintで一貫した命名規則を強制

### プロジェクト構造

- 機能やルートで整理（タイプではなく）
- 関連ファイルを近くに配置
- 深いネストを避ける

### コンポーネント

- 関数コンポーネント+フック使用
- カスタムフックでロジック抽出
- CSS-in-JSまたはCSS Modules推奨

### 状態管理

- UI状態: ローカルステート
- 共有状態: コンテキスト
- 複雑なアプリ: 外部ライブラリ

### エラー処理とテスト

- グローバルエラーバウンダリ実装
- 一貫したAPIエラー処理
- ユニット・統合テスト作成
- 高テストカバレッジ目標

## Naming Cheatsheet

### 基本原則

- **英語**を使用
- **一貫性**を保つ（camelCase、PascalCase等）
- **S-I-D**: 短く、直感的、説明的
- **省略を避ける**: 完全な単語を使用
- **コンテキスト重複回避**
- **期待結果を反映**: ブール変数の適切な命名

### 関数命名: A/HC/LC

パターン: `prefix? + action (A) + high context (HC) + low context? (LC)`

例: `getUser`, `getUserMessages`, `shouldDisplayMessage`

### アクションワード

- **get**: データアクセス
- **set**: 値の割り当て
- **reset**: 初期値に戻す
- **remove/delete**: 削除
- **handle**: アクション処理
- **is/has/should**: ブールプレフィックス
- **on**: イベントハンドラ

### 単数形と複数形

- 単一: `const user = getUser()`
- コレクション: `const users = getUsers()`
- 配列: `const userList = ['John', 'Jane']`

---

この要約は両方のソースからの主要なガイドラインを提供します。より詳細な情報については、それぞれのリポジトリの元のドキュメントを参照してください。
