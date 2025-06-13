# PBI Improvement Plan - AI-Driven Development

## Overview

This document outlines the plan for improving Product Backlog Items (PBIs) to make them
more suitable for AI-driven development. The goal is to create fine-grained, well-defined PBIs
that AI agents can effectively implement.

## Current Status

- [x] Analyzed existing PBI structure
- [x] Identified improvement areas
- [x] Create detailed implementation plan
- [x] Create PBI template
- [x] Design Phase 1 PBI breakdown (5 detailed PBIs created)
- [x] Create Phase 1 detailed PBIs (7 files completed)
- [x] Review Phase 1 PBIs and template (completed)
- [x] Apply feedback from Phase 1 review (PBI-1-1-2 split, template enhanced)
- [x] Refactor Phase 2 PBIs (5 large PBIs → 20 SP across 19 detailed PBIs)
- [ ] Refactor Phase 3 PBIs (3 large PBIs → ~15 detailed PBIs)
- [ ] Refactor Phase 4 PBIs (3 large PBIs → ~15 detailed PBIs)
- [ ] Refactor Phase 5 PBIs (3 large PBIs → ~15 detailed PBIs)
- [ ] Final review of all English PBIs
- [ ] Create Japanese versions of all PBIs
- [ ] Final quality check and documentation completion

## Improvement Strategy

### 1. Granularity Refinement

- **Current**: PBIs are 5-8 story points (2-4 days) - too large for AI implementation
- **Target**: Break down into 1-2 story point tasks (0.5-1 day each)

### 2. Implementation Detail Enhancement

- **Current**: Lack of specific technical implementation details
- **Target**: Add exact file paths, code patterns, API schemas, database structures, environment variables

### 3. Test Separation

- **Current**: Tests are bundled with implementation
- **Target**: Create separate PBIs for unit, integration, and E2E tests

### 4. Documentation Separation

- **Current**: Documentation is bundled with implementation
- **Target**: Create separate PBIs for technical, user, and API documentation

### 5. Dependency Clarification

- **Current**: Dependencies are high-level references
- **Target**: Specify exact interfaces, data structures, and API requirements

## Phase 1 Breakdown (Completed - Total: 19 SP)

### PBI-1-1: Supabase Project Setup (7 SP)

- PBI-1-1-1: Initialize Supabase Project (1 SP) ✅
- PBI-1-1-2: Core Tables Creation (1 SP) ✅
- PBI-1-1-3: Transaction Tables Creation (1 SP) ✅
- PBI-1-1-4: RLS and Types Setup (1 SP) ✅
- PBI-1-1-5: Authentication Setup (1 SP) ✅
- PBI-1-1-6: Environment Configuration (1 SP) ✅
- PBI-1-1-7: Documentation (1 SP) ✅

### PBI-1-2: Storage and OCR (9 SP)

- PBI-1-2-1: Storage bucket setup (1 SP)
- PBI-1-2-2: File upload API (2 SP)
- PBI-1-2-3: OCR service integration (2 SP)
- PBI-1-2-4: OCR data extraction (2 SP)
- PBI-1-2-5: Unit tests (1 SP)
- PBI-1-2-6: Documentation (1 SP)

### PBI-1-3: freee API Integration (6 SP)

- PBI-1-3-1: API client setup (1 SP)
- PBI-1-3-2: Authentication flow (1 SP)
- PBI-1-3-3: Transaction API integration (2 SP)
- PBI-1-3-4: Unit tests (1 SP)
- PBI-1-3-5: Documentation (1 SP)

## Phase 2 Breakdown (Completed - Total: 22 SP)

### PBI-2-1: Foundation Tasks (3 SP)

- PBI-2-1-1: OpenAPI Definition Creation (1 SP) ✅
- PBI-2-1-2: Common OAuth Module (1 SP) ✅
- PBI-2-1-3: Observability Setup (1 SP) ✅

### PBI-2-2: Gmail API Integration (6 SP)

- PBI-2-2-1: Gmail OAuth Setup (1 SP) ✅
- PBI-2-2-2: Gmail Basic API Operations (1 SP) ✅
- PBI-2-2-3: Gmail Business Logic Integration (2 SP) ✅
- PBI-2-2-4: Gmail Error Handling and Retry Logic (1 SP) ✅
- PBI-2-2-5: Gmail Testing and Documentation (1 SP) ✅

### PBI-2-3: Google Drive Integration (6 SP)

- PBI-2-3-1: Google Drive OAuth Setup (1 SP) ✅
- PBI-2-3-2: Google Drive Basic API Operations (1 SP) ✅
- PBI-2-3-3: Google Drive Business Logic Integration (2 SP) ✅
- PBI-2-3-4: Google Drive Error Handling and Retry Logic (1 SP) ✅
- PBI-2-3-5: Google Drive Testing and Documentation (1 SP) ✅

### PBI-2-4: Folder/File Management (4 SP)

- PBI-2-4-1: File Naming System (1 SP) ✅
- PBI-2-4-2: Folder Structure Management (1 SP) ✅
- PBI-2-4-3: Duplicate Handling Logic (1 SP) ✅
- PBI-2-4-4: File Management Testing and Documentation (1 SP) ✅

### PBI-2-5: Scheduled Execution (3 SP)

- PBI-2-5-1: pg_cron Setup and Schedule Job Foundation (1 SP) ✅
- PBI-2-5-2: Background Job Queue Implementation (2 SP) ✅

## Phase 3-5 Planning Considerations

### Risk Management

1. **External API Changes**: Monitor Google API and freee API updates
2. **Design/Investigation Buffer**: Reserve 1-2 SP for specification gaps

### Technical Considerations

1. **UI Component Library**: Evaluate UI framework before interface development
2. **State Management**: Choose appropriate solution for complex UI interactions
3. **Real-time Updates**: Consider WebSocket or Server-Sent Events

## Implementation Timeline

- **Week 1**: Review Phase 1 PBIs & Refactor Phase 2 PBIs
- **Week 2**: Refactor Phase 3 & 4 PBIs
- **Week 3**: Refactor Phase 5 PBIs & Final review
- **Week 4**: Japanese translations & Final quality check

## Success Criteria

- [ ] All PBIs are 1-2 story points maximum
- [ ] Each PBI has clear implementation details
- [ ] Dependencies are explicitly defined
- [ ] Tests and documentation are separate PBIs
- [ ] AI agents can implement PBIs without ambiguity

## For Continuation

To continue this work in another chat:
"Please continue working on the PBI improvement plan in
`/Users/kazuya/src/freee-receipt-automation/docs/requirements/backlog/PBI-improvement-plan.md`.
Phase 1 and Phase 2 are completed. The next steps are to refactor Phase 3 PBIs
(management interface) into detailed 1-2 SP tasks using the improved PBI template."
