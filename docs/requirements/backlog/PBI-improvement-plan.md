# PBI Improvement Plan - AI-Driven Development

## Overview
This document outlines the plan for improving Product Backlog Items (PBIs) to make them more suitable for AI-driven development. The goal is to create fine-grained, well-defined PBIs that AI agents can effectively implement.

## Current Status
- [x] Analyzed existing PBI structure
- [x] Identified improvement areas
- [x] Create detailed implementation plan
- [x] Create PBI template
- [x] Design Phase 1 PBI breakdown (5 detailed PBIs created)
- [x] Create Phase 1 detailed PBIs (8 files completed - including sub-tasks)
- [x] Review Phase 1 PBIs and template (completed)
- [x] Apply feedback from Phase 1 review (PBI-1-1-2 split, template enhanced)
- [ ] Refactor Phase 2 PBIs (4 large PBIs → ~25 detailed PBIs)
- [ ] Refactor Phase 3 PBIs (3 large PBIs → ~15 detailed PBIs)
- [ ] Refactor Phase 4 PBIs (3 large PBIs → ~15 detailed PBIs)
- [ ] Refactor Phase 5 PBIs (3 large PBIs → ~15 detailed PBIs)
- [ ] Final review of all English PBIs
- [ ] Apply final review feedback
- [ ] Create Japanese versions of all PBIs
- [ ] Final quality check and documentation completion

## Improvement Strategy

### 1. Granularity Refinement
**Current Issue**: PBIs are 5-8 story points (2-4 days) - too large for AI implementation
**Target**: Break down into 1-2 story point tasks (0.5-1 day each)

### 2. Implementation Detail Enhancement
**Current Issue**: Lack of specific technical implementation details
**Target**: Add:
- Exact file paths to modify/create
- Specific code patterns to use
- API endpoints and schema definitions
- Database table structures
- Environment variable requirements

### 3. Test Separation
**Current Issue**: Tests are bundled with implementation
**Target**: Create separate PBIs for:
- Unit test implementation
- Integration test implementation
- E2E test implementation

### 4. Documentation Separation
**Current Issue**: Documentation is bundled with implementation
**Target**: Create separate PBIs for:
- Technical documentation
- User documentation
- API documentation

### 5. Dependency Clarification
**Current Issue**: Dependencies are high-level references
**Target**: Specify:
- Exact interfaces/contracts required
- Specific data structures needed
- API/service availability requirements

## Phase-wise Breakdown Plan

### Phase 1: Basic Feature Implementation
Original PBIs:
- PBI-1-1: Supabase Project Setup (5 SP)
- PBI-1-2: Storage Integration and OCR Processing (8 SP)
- PBI-1-3: Basic freee API Integration (5 SP)

Refactored structure:
```
PBI-1-1: Supabase Project Setup
├── PBI-1-1-1: Project initialization (1 SP)
├── PBI-1-1-2: Database schema creation (SPLIT INTO 3 SUB-TASKS)
│   ├── PBI-1-1-2-A: Core tables creation (1 SP)
│   ├── PBI-1-1-2-B: Transaction tables creation (1 SP)
│   └── PBI-1-1-2-C: RLS and types setup (1 SP)
├── PBI-1-1-3: Authentication setup (1 SP)
├── PBI-1-1-4: Environment configuration (1 SP)
└── PBI-1-1-5: Documentation (1 SP)

PBI-1-2: Storage and OCR
├── PBI-1-2-1: Storage bucket setup (1 SP)
├── PBI-1-2-2: File upload API (2 SP)
├── PBI-1-2-3: OCR service integration (2 SP)
├── PBI-1-2-4: OCR data extraction (2 SP)
├── PBI-1-2-5: Unit tests (1 SP)
└── PBI-1-2-6: Documentation (1 SP)

PBI-1-3: freee API Integration
├── PBI-1-3-1: API client setup (1 SP)
├── PBI-1-3-2: Authentication flow (1 SP)
├── PBI-1-3-3: Transaction API integration (2 SP)
├── PBI-1-3-4: Unit tests (1 SP)
└── PBI-1-3-5: Documentation (1 SP)
```

### Phase 2-5: Similar breakdown approach
**Key improvements based on review feedback:**

#### External API Integration Pattern (Phase 2)
- **Gmail/Google Drive/freee API**: Split each into:
  - OAuth setup & authentication (1 SP)
  - Basic API operations (1 SP)
  - Business logic integration (1-2 SP)
  - Error handling & retry logic (1 SP)
  - Testing & documentation (1 SP)

#### Early Infrastructure Tasks (Phase 2 Priority)
- **OpenAPI Definition Creation** (1 SP) - Define API contracts before implementation
- **Common OAuth Module** (1 SP) - Shared authentication logic
- **Observability Setup** (1 SP) - Logging, metrics, tracing
- **CI/CD Enhancement** (1 SP) - GitHub Actions for AI-generated code

#### Technical Debt Prevention
- **Prompt Management** (0.5 SP) - Version control for AI prompts
- **Retry Strategy Configuration** (0.5 SP) - Handle AI non-deterministic behavior
- **Environment-specific Mock Setup** (1 SP) - freee sandbox limitations

[Detailed breakdown to be added during implementation]

## Implementation Timeline
1. **Week 1**: Review Phase 1 PBIs & Refactor Phase 2 PBIs
2. **Week 2**: Refactor Phase 3 & 4 PBIs
3. **Week 3**: Refactor Phase 5 PBIs & Final review
4. **Week 4**: Japanese translations & Final quality check

## Success Criteria
- [ ] All PBIs are 1-2 story points maximum
- [ ] Each PBI has clear implementation details
- [ ] Dependencies are explicitly defined
- [ ] Tests and documentation are separate PBIs
- [ ] AI agents can implement PBIs without ambiguity

## Next Steps
1. Start with Phase 1 PBI refactoring
2. Create template for detailed PBI format
3. Apply template to all existing PBIs
4. Create Japanese versions

## Notes
- This plan is designed to enable efficient AI-driven development
- Each refined PBI should be implementable in a single AI session
- Clear acceptance criteria will enable automated testing

## Phase 1 Detailed Breakdown (Completed)

### PBI-1-1: Supabase Project Setup (Total: 7 SP)
- **PBI-1-1-1: Initialize Supabase Project** (1 SP) ✅
  - Create Supabase project with CLI
  - Configure authentication settings
  - Set up environment variables
  - Initialize Supabase client
  
- **PBI-1-1-2: Database Schema Creation** (3 SP - SPLIT INTO SUB-TASKS) ✅
  - **PBI-1-1-2-A: Core Tables Creation** (1 SP) ✅
    - Create user_settings and receipts tables
    - Set up indexes and constraints
    - Implement updated_at triggers
  - **PBI-1-1-2-B: Transaction Tables Creation** (1 SP) ✅
    - Create transactions and processing_logs tables
    - Configure foreign key relationships
    - Add performance indexes
  - **PBI-1-1-2-C: RLS and Types Setup** (1 SP) ✅
    - Configure Row Level Security policies
    - Generate TypeScript types
    - Create security helper functions
  
- **PBI-1-1-3: Authentication Setup** (1 SP) ✅
  - Configure email/password auth
  - Create auth helper functions
  - Set up Next.js middleware
  - Implement session management
  
- **PBI-1-1-4: Environment Configuration** (1 SP) ✅
  - Set up environment variables
  - Create configuration management
  - Implement validation with zod
  - Configure deployment settings
  
- **PBI-1-1-5: Documentation** (1 SP) ✅
  - Create setup guide
  - Document architecture decisions
  - Add troubleshooting guide
  - Update README

### PBI-1-2: Storage and OCR (To be detailed)
- PBI-1-2-1: Storage bucket setup (1 SP)
- PBI-1-2-2: File upload API (2 SP)
- PBI-1-2-3: OCR service integration (2 SP)
- PBI-1-2-4: OCR data extraction (2 SP)
- PBI-1-2-5: Unit tests (1 SP)
- PBI-1-2-6: Documentation (1 SP)

### PBI-1-3: freee API Integration (To be detailed)
- PBI-1-3-1: API client setup (1 SP)
- PBI-1-3-2: Authentication flow (1 SP)
- PBI-1-3-3: Transaction API integration (2 SP)
- PBI-1-3-4: Unit tests (1 SP)
- PBI-1-3-5: Documentation (1 SP)

## For Continuation in Another Chat
To continue this work in another chat, use the following command:
"Please continue working on the PBI improvement plan in `/Users/kazuya/src/freee-receipt-automation/docs/requirements/backlog/PBI-improvement-plan.md`. Phase 1 is completed with all feedback applied (PBI-1-1-2 split into 3 sub-tasks, template enhanced with metadata and verification commands). The next steps are to refactor Phase 2 PBIs (PBI-2-1 through PBI-2-4) into detailed 1-2 SP tasks using the improved PBI template in `PBI-template.md`. Apply the external API integration patterns documented in the plan (OAuth setup, basic operations, business logic, error handling, testing)."
