# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🎯 ABSOLUTE PRIORITIES (in order)

1. **Rule Compliance** - Following rules is the highest priority
2. **Code Quality** - Maintaining quality standards
3. **Task Completion** - Completing the task

⚠️ **CRITICAL**: Never sacrifice higher priorities for lower ones

## Core Principles

- **Security First** - Always consider security implications
- **Simplicity Over Complexity** - Choose the simplest solution
- **Single Responsibility** - Each module does one thing well
- **Process-Driven** - Strictly follow established rules without exception
- **Professional Communication** - Fact-based, honest reporting

### Absolute Prohibitions

- ❌ **NEVER commit to main branch** - Always create feature branches
- ❌ **NEVER use `git commit --no-verify`** - All pre-commit checks must pass
- ❌ **NEVER bypass documentation checks** - Fix ALL errors before proceeding
- ❌ **NEVER use `LEFTHOOK=0` or environment variables to skip hooks**
- ❌ **NEVER make changes without verification** - Always check before acting
- ❌ **NEVER report false information** - Verify facts before reporting

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
2. **Check worktree** - Run `git worktree list` to avoid committing worktree directories
3. **Review changes** - Use `git diff` to self-review all modifications
4. **Documentation check** - Run `yarn check:docs` and fix ALL errors
5. **Commit** - Use standard `git commit` (NEVER use --no-verify)

## 🚨 ERROR HANDLING PROTOCOL

1. **Error occurs** → Analyze root cause
2. **Fix attempts** → Maximum 3 tries
3. **3 failures** → Must stop and report
4. **IMPORTANT**: Seek "root solutions" not "workarounds"

### FORBIDDEN ERROR PATTERNS

- ❌ **BAD**: `git commit --no-verify` or `LEFTHOOK=0 git commit`
- ✅ **GOOD**: Fix errors then normal commit

## ✅ DEFINITION OF SUCCESS

Success means: All rules followed, quality standards met, tests pass, documentation checks pass.
"It works" or "quick commit" is FAILURE

## 📋 Self-Check Reporting Rules

**MANDATORY**: Include this format in all work completion reports

```text
## ✅ Self-Check Results
- TypeScript: ✅ 0 errors / ❌ X errors
- Tests: ✅ All passed (coverage: X% - target: 80%) / ❌ X failed
- Documentation: ✅ 0 errors / ❌ X errors
```

**Required Commands**: `npx tsc --noEmit`, `npm run test`, `yarn check:docs`

## Commands

### Documentation

- `yarn check:docs` - Check documentation
- `yarn lint:md` - Lint markdown
- `yarn format:md` - Format markdown

### Test

- `yarn test:run` - Run all tests
- `yarn test:watch` - Watch mode
- `yarn test:coverage` - Test coverage

### Development

- `yarn dev` - Start development
- `yarn build` - Build production

## Code Style Guidelines

### Naming Conventions

- Variables/Functions: camelCase
- Classes: PascalCase
- Constants: UPPER_SNAKE_CASE

### File Structure

- Line limit: 150 lines (max 250)
- Split files exceeding 150 lines by functionality

### Standards

- JSDoc for functions
- Markdown: 120 chars/line, level 1 heading first
- Error handling: Concrete types, user-friendly messages

## 🧪 Testing Strategy

### Test Architecture: Unit + E2E

**Unit Tests**: Co-located with source (`src/lib/auth.ts` → `src/lib/auth.test.ts`)

- Framework: Vitest + Testing Library
- Scope: Functions, components, business logic

**E2E Tests**: Dedicated `e2e/` directory

- Framework: Playwright
- Scope: User workflows, critical paths

### Mandatory Testing Standards

**ALL code changes MUST include tests:**

1. New functions/components → Unit tests
2. API routes → Unit + E2E tests
3. Bug fixes → Regression tests
4. Database changes → Type safety tests

### Test Execution

```bash
yarn test:run    # Before commit (must pass 100%)
yarn test:watch  # During development
```

**ABSOLUTE**: No code reaches main without tests. PRs blocked until tests pass.

## 🎯 PROJECT-SPECIFIC APPROACH

### freee Receipt Automation Context

**Domain**: Freelance IT engineer expense automation

- Process ~4 receipts/week from Gmail/Drive
- Integrate with freee API for expense tracking
- Use OCR for receipt data extraction
- Budget: $5/year operational cost

**Tech Stack**: Next.js 14 + TypeScript + Supabase + Edge Functions

**Current Phase**: Phase 2 (API Integrations)

- Gmail Track, Drive Track, File Management Track

### Professional Communication Standards

1. **Verify Before Reporting** - Check facts before making claims
2. **Admit Mistakes Immediately** - No excuses or deflection
3. **Provide Accurate Status** - Report actual state, not assumptions
4. **Clear Action Plans** - Specific steps for resolution
5. **No False Promises** - Only commit to what's achievable