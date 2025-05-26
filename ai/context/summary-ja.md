<!-- MAX_TOKENS: 2000 -->
# 開発ガイドライン要約

このドキュメントは[Bulletproof React](https://github.com/alan2207/bulletproof-react)と[Naming Cheatsheet](https://github.com/kettanaito/naming-cheatsheet)の開発ガイドラインの要約を提供します。

## Bulletproof React

#### プロジェクト標準

- **ESLint**: コード品質の維持とコーディング規約の強制のために`.eslintrc.js`を設定
- **Prettier**: 一貫したコードフォーマットのために`.prettierrc`を使用。IDEで"format on save"を有効化
- **TypeScript**: リファクタリング時の問題検出に推奨。型宣言を先に更新し、その後エラーを解決
- **Husky**: コミット前にコード検証（リンティング、フォーマット、型チェック）を実行するgitフックを実装
- **絶対パスインポート**: 相対パスの煩雑さ（`../../../component`）を避けるために設定
  ```json
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
  ```
- **ファイル命名**: ESLintルールを使用して一貫した命名規則（例：kebab-case）を強制

#### プロジェクト構造

- タイプではなく機能やルートで整理
- 関連ファイルを近くに配置
- フォルダの深いネストを避ける
- 共有ディレクトリに再利用可能なコンポーネントを作成

#### コンポーネントとスタイリング

- フックを使用した関数コンポーネントを使用
- 再利用可能なロジックをカスタムフックに抽出
- 一貫したコンポーネント構成パターンを実装
- コンポーネントのスタイリングにはCSS-in-JSまたはCSS Modulesを検討

#### 状態管理

- UI固有の状態にはローカルステートを使用
- 頻繁に変更されない共有状態にはコンテキストを使用
- 複雑なアプリケーションには外部状態管理ライブラリを検討
- 適切なデータ取得とキャッシュ戦略を実装

#### エラー処理

- グローバルエラーバウンダリを実装
- APIエラーを一貫して処理
- ユーザーに意味のあるエラーメッセージを提供
- デバッグ目的でエラーをログ記録

#### テスト

- ユーティリティ関数とフックのユニットテストを作成
- コンポーネントの相互作用の統合テストを作成
- 良い実践を促進するテストライブラリを使用
- 重要なパスの高いテストカバレッジを目指す

---

#### Next.js統合例

```ts
// app/server/actions/createTodo.ts
import { revalidatePath } from 'next/cache'

export async function createTodo(formData: FormData) {
  'use server'
  const title = formData.get('title') as string
  await fetch(`${process.env.API_URL}/todos`, {
    method: 'POST',
    body: JSON.stringify({ title }),
    cache: 'no-store'
  })
  revalidatePath('/todos')
}
```
*Server Actionsを使用し、`fetch()`の`'no-store'`でキャッシュを無効化しつつRSC側で再検証を行う例。*

## Naming Cheatsheet

#### 基本原則

- すべての変数名と関数名に**英語**を使用
- 選択した命名規則（camelCase、PascalCaseなど）で**一貫性**を保つ
- **S-I-D**: 名前は短く（Short）、直感的（Intuitive）、説明的（Descriptive）であるべき
- **省略を避ける**: 短縮版ではなく完全な単語を使用
- **コンテキストの重複を避ける**: 変数が定義されているコンテキストを繰り返さない
- **期待される結果を反映**: ブール変数は使用コンテキストに合わせて命名

#### 関数命名パターン: A/HC/LC

パターンに従う: `prefix? + action (A) + high context (HC) + low context? (LC)`

例:
- `getUser` - アクション: get, 高コンテキスト: User
- `getUserMessages` - アクション: get, 高コンテキスト: User, 低コンテキスト: Messages
- `shouldDisplayMessage` - プレフィックス: should, アクション: Display, 高コンテキスト: Message

#### 一般的なアクションワード

- **get**: データに即時または非同期でアクセス
- **set**: 値を宣言的に割り当て
- **reset**: 初期値または状態に戻す
- **remove**: コレクションから何かを取り出す
- **delete**: 何かを完全に削除
- **handle**: アクションを処理（イベントと共に使用されることが多い）
- **is/has/should**: 質問を表すブールプレフィックス
- **on**: イベントハンドラまたはコールバックのプレフィックス

#### 単数形と複数形

- 単一アイテムには単数形を使用: `const user = getUser()`
- コレクションには複数形を使用: `const users = getUsers()`
- 配列で一貫性を保つ: `const userList = ['John', 'Jane']`

---

この要約は両方のソースからの主要なガイドラインを提供します。より詳細な情報については、それぞれのリポジトリの元のドキュメントを参照してください。 