# Freelance Expense Management Automation Requirements

## Background

As a freelance IT engineer using freee for expense and revenue management,
I currently perform the following tasks manually and would like to automate them.

## Current Workflow

1. **Expense Registration**

   - Register expenses in freee
   - Obtain receipt PDFs from Rakuten, Amazon, etc.
   - Save emails (PDF receipts like Apple subscriptions)
   - Save all PDFs in iCloudDrive folders by year/month

2. **Expense and Receipt Association**
   - Match PDF files with freee transactions by purchase date and amount
   - Associate with pending transactions in freee and register them

## Automation Targets

- Processing receipts stored in designated directories

- Extracting receipts from emails (Apple subscriptions, etc.)
- Matching PDFs with transaction information
- Registering and associating transactions in freee

- Creating receipt directories (monthly) and storing PDFs

## Requirements

### Daily Manual Operations

- For Rakuten and Amazon receipts with API limitations, users will download
  from their member pages and save to specified folders

- For gas and other receipts, users will scan using a scanning app and save to designated folders
  - Use scanning app instead of simple photo capture to improve OCR accuracy

### Automation Requirements

- Full automation except for the above manual operations
- Use Gmail API to obtain receipts for Apple subscriptions, etc.

- Run in background (cron, etc.) and process periodically

  - Weekly frequency is acceptable

- Send processing results to user's specific email address

- Store final receipt PDFs in cloud storage for access from multiple PCs
  - Currently stored in iCloudDrive, but can switch to Google Drive
  - Maintain current iCloudDrive folder structure (see below)
- Automatically add comments to transactions in freee for identification

- Keep PDF filenames as short as possible (product name is sufficient)
  - Add numbers like "\_2.pdf" for duplicates

### User Verification

- Build a processing result confirmation screen for necessary checks
  - Simple UI to confirm processing status

### Additional Requirements

- Focus on cost-effectiveness for freelancers
- Adopt Supabase as backend infrastructure
  - Minimize costs in configuration

## Reference: Current Receipt Folder Structure

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
