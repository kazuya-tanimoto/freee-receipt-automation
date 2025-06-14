# Product Backlog Items (PBIs)

This directory contains the Product Backlog Items (PBIs) for the freee Receipt Automation project.
The PBIs are organized by development phases and have been refined for AI-driven development.

## Directory Structure

```text
backlog/
├── phase-1/    # Basic Feature Implementation (7 PBIs)
├── phase-2/    # Automation Feature Implementation (19 PBIs)
├── phase-3/    # Management UI Implementation (15 PBIs)
├── phase-4/    # Notifications and Matching Improvement (14 PBIs)
├── phase-5/    # Rule-based Learning Features (20 PBIs)
├── PBI-template.md    # Template for creating new PBIs
├── PBI-template-ja.md # Japanese version of the template
└── README.md         # This file
```

## Phase Overview

### Phase 1: Basic Feature Implementation

- Supabase project initialization and setup
- Database schema and authentication
- Storage integration and OCR processing
- Basic freee API integration

### Phase 2: Automation Feature Implementation

- Gmail OAuth and API operations
- Google Drive OAuth and API operations
- File management system
- Scheduled execution with pg_cron

### Phase 3: Management UI Implementation

- Next.js project setup with Supabase integration
- Component library (buttons, forms, cards, modals)
- Dashboard and monitoring interfaces
- Receipt and transaction management
- Drag-and-drop matching interface

### Phase 4: Notifications and Matching Improvement

- Email notification system
- OCR accuracy improvements
- Advanced matching algorithms
- Performance optimization

### Phase 5: Rule-based Learning Features

- User correction data collection
- Pattern extraction and rule generation
- Rule-based matching engine
- A/B testing and optimization

## PBI Format

Each PBI follows a standardized format optimized for AI-driven development:

### Required Sections

1. **Title**: Clear, action-oriented title
2. **Description**: Context and objectives
3. **Acceptance Criteria**: Specific, measurable outcomes
4. **Technical Approach**: Implementation guidance
5. **Testing Requirements**: Verification methods
6. **Dependencies**: Prerequisites and related PBIs
7. **Estimate**: Story points (1, 2, 3, or 5)
8. **Priority**: High, Medium, or Low

### Optional Sections

- Security Considerations
- Performance Requirements
- UI/UX Requirements
- Documentation Requirements

## Guidelines for AI Implementation

### PBI Characteristics

- **Atomic**: Each PBI should be independently implementable
- **Specific**: Clear technical requirements and boundaries
- **Verifiable**: Explicit acceptance criteria
- **Sized**: Maximum 5 story points (larger tasks should be split)

### Implementation Notes

- PBIs are designed to be implemented by AI agents
- Each PBI includes technical approach guidance
- Dependencies are clearly marked to ensure proper sequencing
- Testing requirements are included for quality assurance

## Language Support

All PBIs are available in both English and Japanese:

- English: `PBI-X-X-X-description.md`
- Japanese: `PBI-X-X-X-description-ja.md`

## Tracking and Management

- PBIs can be linked to GitHub Issues for tracking
- Use the phase folders to understand implementation order
- Reference the PBI template when creating new items
