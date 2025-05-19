# コーディング規約参照設定

## 概要
Next.js 15プロジェクトで再利用可能な形で、Bulletproof ReactとNaming Cheatsheetのルールを取り込みます。

## 参照設定
### 1. Bulletproof React
- リポジトリ: https://github.com/alan2207/bulletproof-react
- ブランチ: `master`
- 取得範囲: `docs/`ディレクトリのみ
- 更新: 週次で自動更新

### 2. Naming Cheatsheet
- リポジトリ: https://github.com/kettanaito/naming-cheatsheet
- ブランチ: `main`
- 取得範囲: ルートディレクトリ全体
- 更新: 週次で自動更新

## セットアップ手順
```bash
# サブモジュールの追加
git submodule add -b master https://github.com/alan2207/bulletproof-react docs/guidelines/bulletproof-react
git submodule add -b main https://github.com/kettanaito/naming-cheatsheet docs/guidelines/naming-cheatsheet

# sparse-checkoutの設定
git -C docs/guidelines/bulletproof-react sparse-checkout set docs
git -C docs/guidelines/naming-cheatsheet sparse-checkout set .
```

## 更新フロー
1. 週次で`scripts/update-guidelines.sh`を実行
2. 変更を確認
3. PRを作成
4. CIパスを確認
5. マージ

## 注意事項
- サブモジュールの手動更新は禁止
- 更新は必ずスクリプト経由で実行
- 重大な変更はADRを追加
- ライセンス要件を遵守（MITライセンス） 