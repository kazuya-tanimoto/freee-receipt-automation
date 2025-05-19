# freee Expense Management Automation System - Revised Requirements and Architecture

## Purpose
Build a system to automate freelance expense management and receipt association, significantly improving tax filing and bookkeeping efficiency.

## Requirements

### 1. Basic Features
* Automatically associate expenses managed in freee with receipts (PDF files)
* Automatically attach appropriate supporting documents to transactions (expenses)
* Management interface for confirming processing results and manual adjustments
* Automatic creation of monthly receipt folders and PDF management

### 2. User Manual Operations
* **Receipt Preparation**:
  * Rakuten/Amazon: Users download PDFs from member pages and save to specified folders
  * Paper receipts (gas, etc.): Users scan using scanning app for OCR-friendly PDFs and save to specified folders
* **Result Verification**:
  * Check notification emails
  * Detailed verification and manual correction in management interface as needed

### 3. Automation Targets
* **Receipt Processing**:
  * Process receipt PDFs stored in designated directories
  * Email receipts (PDF receipts like Apple subscriptions): Retrieve and process via Gmail API
  * Automatic creation of monthly folder structure and appropriate PDF storage
* **Transaction Processing**:
  * Information extraction from receipts via OCR
  * Rule-based matching process (automatic improvement from correction history)
  * Association, comment addition, and item setting via freee API
* **Notifications**:
  * Send processing results to user-specified email address

### 4. PDF File Management Requirements
* Short filenames (mainly product names only)
* Numbered suffixes for duplicates (e.g., "_2.pdf")
* Storage format following existing folder structure (e.g., `/01.領収書/MM/filename.pdf`)
* Storage in Google Drive (recommended for API accessibility and authentication)

### 5. Periodic Execution Requirements
* Weekly automatic background processing
* Log storage and error notifications
* Minimal cost operation

## System Architecture

### 1. Technology Stack
* **Backend**: Supabase (PostgreSQL + Edge Functions)
* **Frontend**: NextJS (advantageous for server-side processing)
* **Storage**: Supabase Storage + Google Drive integration
* **Scheduled Execution**: Supabase pg_cron
* **OCR Processing**: Google Cloud Vision API
* **Notifications**: Email service (SendGrid, etc., utilizing Supabase features if possible)

### 2. System Architecture

```
[User Side]
  ├── Download receipt PDFs → Save to specified folder
  ├── Scan paper receipts → Convert to PDF → Save to specified folder
  └── Verify results (email/management interface) and manual correction
  ↓
[Supabase Storage (Temporary Storage)]
  PDF file processing
  ↓
[Edge Functions + pg_cron]
  ├── PDF detection → OCR processing → Information extraction
  ├── Email retrieval via Gmail API → PDF conversion → Information extraction
  ├── Rule-based matching process
  ├── freee API integration (transaction retrieval, matching, updates)
  ├── Organized file storage in Google Drive
  └── Processing result email notifications
  ↓
[PostgreSQL]
  ├── Store processing results and matching information
  ├── Matching rules database
  └── Accumulate user correction data and automatic rule generation
  ↓
[NextJS Management Interface]
  ├── Processing status verification
  ├── Manual adjustments and corrections
  └── Matching result feedback
```

### 3. User Flow

1. **Initial Setup**:
   * freee API authentication settings
   * Gmail API integration settings
   * Google Drive integration settings
   * Notification email address settings

2. **Daily Usage**:
   * Rakuten/Amazon receipts: Download from member pages and save to specified folder
   * Paper receipts: Convert to PDF using scanning app and save to specified folder
   * Automatic processing: System processes weekly
   * Notifications: Processing results sent via email
   * Verification/Correction: Detailed verification and manual adjustment in management interface as needed

## Implementation Details

### 1. OCR Processing
* Text extraction from PDF documents
* Conversion to structured data (date, amount, store name, items, etc.)
* Custom processing for specific patterns (Apple, Amazon, etc.)

### 2. Rule-based Matching Logic
* Date matching (with tolerance of ± several days)
* Amount matching (exact or approximate)
* Supplementary matching by store name and content
* **Correction History-based Rule Application**:
  * Accumulate user correction patterns in database
  * "Store X" → "freee item Y" mapping rules
  * "Specific keyword" → "Specific category" classification rules
  * Automatic adjustment of rule application priority (frequency-based)
* Priority setting for multiple candidates

### 3. Folder Management
* Follow existing structure (`/01.領収書/MM/filename.pdf`)
* Assign short filenames (mainly product names only)
* Automatic numbering for duplicate filenames (_2.pdf, _3.pdf, etc.)
* Appropriate placement in Google Drive

### 4. Management Interface
* Dashboard: Processing status overview
* List view: Receipt and transaction matching status
* Detail view: Individual transaction/receipt viewing
* Correction features: Manual matching, reprocessing, exception handling
* **Rule Management**: Verification and editing of generated rules

### 5. Notification Features
* Summary email upon processing completion
* Detailed notifications for errors
* Listing of unprocessed items

## Development Plan

### Phase 1: Basic Feature Implementation
* Supabase project setup
* Storage integration and OCR processing implementation
* Basic freee API integration

### Phase 2: Automation Feature Implementation
* Gmail API integration
* Google Drive integration
* Folder/file management features
* Scheduled execution setup

### Phase 3: Management UI Implementation
* NextJS-based management interface
* Matching status verification features
* Manual adjustment features

### Phase 4: Notifications and Basic Matching Improvement
* Email notification features
* OCR accuracy improvement
* Basic matching algorithm refinement

### Phase 5: Rule-based Learning Features (Later Phase)
* User correction data collection features
* Automatic rule generation from correction history
* Rule-based matching engine implementation

## Required External Services
* Supabase: Backend/storage infrastructure (operate within free tier)
* Google Cloud (Vision API, Gmail API, Drive API)
* Email service like SendGrid (use Supabase features if possible)

## Cost Estimate (Annual)

### Estimated Annual Costs for Weekly Processing of ~4 Items
* **Google Cloud Vision API**: Almost free (within free tier)
* **Supabase**: Within free tier (due to small data volume)
* **Google APIs (Gmail/Drive)**: Within free tier
* **SendGrid**: Free up to 25,000 emails/month

### Total Cost Estimate
**Basic Implementation**: **Almost free** to **$5/year** (due to minimal usage)

## Important Notes
* Prioritize cost efficiency, focusing on free tiers and low-cost options
* Minimize resource consumption based on weekly processing requirements
* Consider data protection and privacy (handling personal receipt information)
* Build self-evolving mechanism through rule-based automatic improvement

This architecture enables significant automation from receipt management to transaction association, improving tax filing and bookkeeping efficiency. Additionally, by automatically generating and accumulating rules from user corrections, the system achieves improved accuracy over time while maintaining low costs. 