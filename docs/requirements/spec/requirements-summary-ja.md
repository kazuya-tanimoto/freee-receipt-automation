# フリーランス経費管理自動化要件

## 背景

freeeで経費・収入管理を行っているフリーランスITエンジニアとして、現在手動で行っている以下の作業を自動化したいと考えています。

## 現行のワークフロー

1. **経費登録**

   - freeeに経費を登録
   - 楽天、Amazonなどから領収書PDFを取得
   - メール（AppleサブスクリプションなどのPDF領収書）を保存
   - すべてのPDFをiCloudDriveの年/月フォルダに保存

2. **経費と領収書の紐付け**
   - 購入日と金額でPDFファイルとfreeeの取引を照合
   - freeeの未処理取引と紐付けて登録

## 自動化対象

- 指定ディレクトリに保存された領収書の処理

- メールからの領収書抽出（Appleサブスクリプションなど）
- PDFと取引情報の照合
- freeeへの取引登録と紐付け

- 領収書ディレクトリ（月次）の作成とPDFの保存

## 要件

### 日次手動作業

- API制限のある楽天・Amazonの領収書は、ユーザーが会員ページからダウンロードして指定フォルダに保存

- ガソリンなどの領収書は、ユーザーがスキャンアプリでスキャンして指定フォルダに保存
  - OCR精度向上のため、単純な写真撮影ではなくスキャンアプリを使用

### 自動化要件

- 上記手動作業以外は完全自動化
- Gmail APIを使用してAppleサブスクリプションなどの領収書を取得

- バックグラウンド（cronなど）で定期的に処理

  - 週次での実行で可

- 処理結果をユーザーの指定メールアドレスに送信

- 最終的な領収書PDFを複数PCからアクセス可能なクラウドストレージに保存
  - 現在はiCloudDriveに保存していますが、Google Driveに変更可能
  - 現在のiCloudDriveフォルダ構造を維持（下記参照）
- freeeの取引に識別用のコメントを自動追加

- PDFファイル名は可能な限り短く（商品名で十分）
  - 重複時は"\_2.pdf"のように番号を追加

### ユーザー確認

- 必要な確認のための処理結果確認画面を構築
  - 処理状況を確認するシンプルなUI

### 追加要件

- フリーランス向けのコスト効率を重視
- バックエンドインフラとしてSupabaseを採用
  - 設定でコストを最小化

## 参考：現在の領収書フォルダ構造

```bash
~/iCloudDrive/Private/final_tax_return_確定申告/2025年分
  19:46 ❯❯ la
Permissions Size User   Date Changed Date Created Name
.rw-r--r--@  404 kazuya 12 Apr 10:10 25 Jan 11:41 00-Memo.txt
drwxr-xr-x@    - kazuya 21 Apr 08:51  5 Jan 17:30 01.領収書
drwxr-xr-x@    - kazuya 10 Mar 17:03  5 Jan 16:45 02.提出書類
drwxr-xr-x@    - kazuya 11 Mar 21:30  5 Jan 16:45 03.納付証明
drwxr-xr-x@    - kazuya 10 Mar 17:03 25 Jan 11:15 04.給与・源泉徴収
.rw-r--r--@    0 kazuya 23 Apr 16:40 12 Apr 10:11 ★202502まで整備完了

~/iCloudDrive/Private/final_tax_return_確定申告/2025年分
  19:46 ❯❯ tree 01.領収書/
01.領収書/
├── 01
│   ├── 楽天モバイル_202412分.pdf
│   ├──   ：
│   └── webカメラ.pdf
├── 02
│   ├── 楽天モバイル_202501分.pdf
│   ├── 楽天光_202501分.pdf
│   ├──   ：
│   └── ITフリーランス協会費.pdf
├── 03
│   ├── 楽天モバイル_202502分.pdf
│   ├──   ：
│   └── KindleUnlimited.pdf
├── 04
│   ├── ビジネス書：ロングゲーム 今、自分にとっていちばん意味のあることをするために.pdf
│   ├──   ：
│   └── ITフリーランス協会費.pdf
├── 05
├── 06
├── 07
├── 08
├── 09
├── 10
├── 11
├── 12
└── 99.固定資産分

14 directories, 45 files
```
