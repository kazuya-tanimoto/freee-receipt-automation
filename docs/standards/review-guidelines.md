# Review Request Guidelines

## Overview

Standardized templates for review requests. All requests must include sufficient context for reviewers.

## Essential Information Principle

Every review request must include:

- What task is being worked on
- Which repository and branch
- Complete context for effective review

## Task Type Reference

Task type examples:

- Development: Feature Implementation, Bug Fix, Refactoring, Performance Optimization
- Documentation: Documentation Update, API Documentation, User Guide
- Infrastructure: CI/CD Configuration, Dependency Update, Environment Setup
- Design: UI/UX Implementation, Design System Update, Accessibility Improvement

## Review Request Template

### Basic Information (Required)

```markdown
**Task**: [Brief description of what you're working on]
**Repository**: [Repository name]
**Branch**: [Source branch -> Target branch]
**Reviewer**: [Assigned reviewer(s)]
**Work Date**: [YYYY/MM/DD HH:MM - HH:MM]
```

### TL;DR (Required)

```markdown
**Key Changes**: [1-2 sentence summary of main changes]
**Impact Areas**: [Core systems/features affected]
**Review Focus**: [What reviewers should pay most attention to]
```

### Work Summary (Required)

```markdown
**Changes**: [Brief summary of changes made]
**Files Changed**: [Number] files ([New: X / Modified: Y / Deleted: Z])
**Impact Scope**: [Areas affected by changes]
```

### Change Details (Required)

- **Added**: [New features/files/functionality]
- **Modified**: [Changed features/files/functionality]
- **Deleted**: [Removed features/files/functionality]

### Self-Review Results (Required)

- **Completed Checks**: Build success, Tests passing, Documentation updated, Security reviewed
- **Test Results**: [Summary of test execution]
- **Quality Metrics**: [Coverage, linting results]

### Review Focus Points (Required)

- **Priority Areas**: [Specific areas requiring attention]
- **Known Issues**: [Limitations or workarounds]
- **Risks**: [Potential risks or concerns]

### Verification Method (Optional)

- **Testing Commands**: Build/Test/Lint commands
- **Manual Verification**: [Step-by-step process]
- **Demo/Preview**: [URL or method to view changes]

### Post-Approval Actions (Optional)

- **Next Steps**: [Actions after approval]
- **Related Tasks**: [Dependencies or follow-up tasks]

## Quick Example

```markdown
**Task**: User Authentication Implementation
**Repository**: auth-service  
**Branch**: feature/auth -> main
**Reviewer**: @senior-dev, @security-team

**Key Changes**: JWT-based authentication replacing session auth
**Impact Areas**: Auth flow, API endpoints, frontend integration
**Review Focus**: Token security and error handling

**Changes**: JWT authentication system implementation
**Files Changed**: 8 files (New: 4 / Modified: 3 / Deleted: 1)

**Added**: JWT generation/validation, Auth middleware, Login/logout endpoints
**Modified**: API route protection, Frontend auth state, Error handling
**Deleted**: Legacy session-based auth code

**Completed Checks**: Build success, Tests pass (95% coverage), Security audit complete
**Test Results**: 45/45 tests pass, no vulnerabilities
**Quality Metrics**: Coverage 95%, ESLint clean

**Priority Areas**: JWT security, Password hashing, Session timeout, Error sanitization
**Known Issues**: Rate limiting pending (follow-up task)
**Risks**: Breaking change for existing API consumers

**Testing Commands**: `npm run build`, `npm test -- --coverage`
**Demo**: http://localhost:3000/auth-demo
**Next Steps**: Merge, deploy staging, update docs
```

## Integration with Existing Guidelines

This review guideline integrates with:

- [Coding Standards](./coding-standards.md)
- [Documentation Guidelines](./documentation-guidelines.md)
- [Operational Guidelines](../ops/operational-guidelines.md)

For comprehensive project guidelines, see the [Project README](../../README.md).

## Best Practices

### Best Practices

**Before Review**: Complete self-review, run tests, check formatting, update docs
**During Review**: Respond promptly, provide clarifications, make changes thoroughly  
**After Approval**: Follow next steps immediately, notify stakeholders, monitor issues

Good review requests save time and improve code quality.
