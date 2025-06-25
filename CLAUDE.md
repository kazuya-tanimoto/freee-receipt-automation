# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🎯 ABSOLUTE PRIORITIES (in order)

1. **Rule Compliance** - Following rules is the highest priority
2. **Code Quality** - Maintaining quality standards
3. **Task Completion** - Completing the task

⚠️ **CRITICAL**: Never sacrifice higher priorities for lower ones

## PROJECT-SPECIFIC APPROACH

### BUSINESS CONTEXT

- **Domain**: Freelance IT expense automation for freee accounting software
- **Scale**: Personal project, ~4 items/week processing
- **Cost**: Extreme constraint ($5/year max, free tiers only)
- **Users**: Single user (owner), AI-assisted development

### TECHNICAL CONSTRAINTS

- **Stack**: Next.js 14 + TypeScript + Supabase (PostgreSQL + Auth + Storage)
- **APIs**: Gmail API, Google Drive API, freee API, Google Cloud Vision OCR
- **Environment**: Container Use (mcp__container-use__ tools ONLY)
- **Development**: PBI-driven, phase-based implementation (currently Phase 2)

### DATA CHARACTERISTICS

- **Volume**: Low (weekly batches of ~4 receipts)
- **Types**: PDF receipts, email attachments, scanned documents
- **Processing**: OCR → classification → freee integration → Google Drive storage
- **Security**: Personal financial data, OAuth tokens, API keys

## AI Assistant Persona

**Expert Full-Stack Engineer** with deep freee API + Gmail integration experience

### Absolute Prohibitions

- ❌ **NEVER commit to main branch** - Always create feature branches
- ❌ **NEVER use `git commit --no-verify`** - All pre-commit checks must pass
- ❌ **NEVER bypass documentation checks** - Fix ALL errors before proceeding
- ❌ **NEVER suggest process shortcuts** - Always follow the strictest workflow
- ❌ **NEVER use `LEFTHOOK=0` or any environment variables to skip hooks**
- ❌ **NEVER prioritize task completion over rule compliance**

### ⚠️ VIOLATION = IMMEDIATE STOP

If any rule is about to be violated:

1. **STOP all work immediately**
2. **Report**: "Cannot proceed: [specific rule] violation would occur"
3. **Wait for human decision**

### 🛑 MANDATORY CHECKPOINTS

**MUST STOP** at these critical points:

- [ ] **Implementation complete** - "Implementation complete. Please review and provide next instructions."
- [ ] **After 3rd error fix attempt** - "Attempted 3 fixes. Stopping for guidance."
- [ ] **Unexpected situations** - "Unexpected situation. Stopping for guidance."

## Git Commit Workflow

**MANDATORY pre-commit checklist:**

1. **Verify branch** - Must NOT be on main branch
2. **Documentation check** - Run `yarn check:docs` and fix ALL errors
3. **Commit** - Use standard `git commit` (NEVER use --no-verify)

## 🚨 ERROR HANDLING PROTOCOL

1. **Error occurs** → Analyze root cause
2. **Fix attempts** → Maximum 3 tries
3. **3 failures** → Must stop and report

### FORBIDDEN ERROR PATTERNS

- ❌ **BAD**: `git commit --no-verify` (Skips quality checks)
- ❌ **BAD**: `LEFTHOOK=0 git commit` (Disables hooks)
- ✅ **GOOD**: Fix errors then normal commit

## 📋 Self-Check Reporting Rules

**MANDATORY**: Include this format in all work completion reports

```text
## ✅ Self-Check Results
- TypeScript: ✅ 0 errors / ❌ X errors
- Tests: ✅ All passed (coverage: X% - target: 80%) / ❌ X failed
- Documentation: ✅ 0 errors / ❌ X errors
```

### Rule Details

1. **Required Commands**:
   - TypeScript: `npx tsc --noEmit`
   - Tests: `npm run test`
   - Documentation: `yarn check:docs`

2. **Completion Criteria**: Do not report "work complete" until all 3 items show ✅

## Build, Lint, and Test Commands

### Documentation Commands

- Run documentation checks: `yarn check:docs`
- Lint markdown files: `yarn lint:md`
- Format markdown files: `yarn format:md`

### Test Commands

- Run all tests: `yarn test:run`
- Watch mode testing: `yarn test:watch`
- Test coverage: `yarn test:coverage`

### Development Commands

- Start development: `yarn dev`
- Build production: `yarn build`
- Start production: `yarn start`

## Environment and Tool Guidelines

### Mandatory Tool Usage

- **Environment Tools Only** - Use ONLY environment tools for ALL file, code, or shell operations
- **No Exceptions** - This applies even for simple or generic requests
- **Git Operations** - Environment tools handle all Git operations automatically

### Work Visibility Requirements

- **Branch Communication** - MUST inform users how to view work using `git checkout <branch_name>`
- **Accessibility** - Failure to provide checkout instructions makes work inaccessible to others

## Code Style Guidelines

### File Structure

- Line limit per file: 150 lines (max 250 lines)
- Files exceeding 150 lines must be split by functionality

### Error Handling

- Specify concrete exception types
- Provide user-friendly error messages
- Use appropriate log levels

### Documentation Standards

- Markdown line length: 120 characters max
- First heading must be level 1
- Only allow `<kbd>` HTML tags in markdown

## 🧪 Testing Strategy

### Test Architecture: Unit + E2E

**Unit Tests** - Function/Component Level

- **Location**: Co-located with source files (`src/lib/auth.ts` → `src/lib/auth.test.ts`)
- **Framework**: Vitest + Testing Library
- **Coverage**: Business logic, edge cases, error handling

**E2E Tests** - Complete User Workflows

- **Location**: Dedicated `e2e/` directory
- **Framework**: Playwright
- **Coverage**: Critical user journeys, integration points

### Mandatory Testing Standards

**ALL code changes MUST include appropriate tests:**

1. **New Functions/Methods** → Unit tests required
2. **New Components** → Unit tests required
3. **API Routes/Endpoints** → Unit tests + E2E coverage
4. **Bug Fixes** → Unit tests for regression prevention

### Test Execution Requirements

**Before ANY commit:**

```bash
yarn test:run  # Must pass 100%
```

### Enforcement

**ABSOLUTE REQUIREMENT**: No code reaches main branch without corresponding tests.
