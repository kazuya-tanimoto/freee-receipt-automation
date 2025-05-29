# Review Request Guidelines

## Overview

This document provides standardized templates for requesting reviews on code changes, documentation updates, and pull requests. All review requests should include sufficient context for reviewers to understand the changes without prior knowledge.

## Essential Information Principle

Every review request must include:
- What task is being worked on
- Which repository and branch
- Complete context for effective review

## Task Type Reference

Below are examples of descriptive task types that can be used instead of generic identifiers:

| Category | Task Type Examples |
|----------|-------------------|
| Development | Feature Implementation, Bug Fix, Refactoring, Performance Optimization |
| Documentation | Documentation Update, API Documentation, User Guide, Technical Specification |
| Infrastructure | CI/CD Configuration, Dependency Update, Environment Setup, Database Migration |
| Design | UI/UX Implementation, Design System Update, Accessibility Improvement, Mobile Optimization |

## Review Request Template

### Basic Information (Required)
```
**Task**: [Brief description of what you're working on]
**Repository**: [Repository name]
**Branch**: [Source branch -> Target branch]
**Reviewer**: [Assigned reviewer(s)]
**Work Date**: [YYYY/MM/DD HH:MM - HH:MM]
```

### TL;DR (Required)
```
**Key Changes**: [1-2 sentence summary of main changes]
**Impact Areas**: [Core systems/features affected]
**Review Focus**: [What reviewers should pay most attention to]
```

### Work Summary (Required)
```
**Changes**: [Brief summary of changes made]
**Files Changed**: [Number] files ([New: X / Modified: Y / Deleted: Z])
**Impact Scope**: [Areas affected by changes]
```

### Change Details (Required)
```
**Added**: 
- [List of new features/files/functionality]

**Modified**:
- [List of changed features/files/functionality]

**Deleted**:
- [List of removed features/files/functionality]
```

### Self-Review Results (Required)
```
**Completed Checks**:
- [ ] Code compile/build success
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Security considerations reviewed
- [ ] License compliance verified

**Test Results**: [Summary of test execution]
**Quality Metrics**: [Coverage, linting results, etc.]
```

### Review Focus Points (Required)
```
**Priority Areas**:
1. [Specific area requiring attention]
2. [Security/performance considerations]
3. [Complex logic or edge cases]

**Known Issues**: [Any limitations or workarounds]
**Risks**: [Potential risks or concerns]
```

### Verification Method (Optional)
```
**Testing Commands**:
- Build: `[command]`
- Test: `[command]`
- Lint: `[command]`

**Manual Verification**:
- [Step-by-step verification process]

**Demo/Preview**: [URL or method to view changes]
```

### Post-Approval Actions (Optional)
```
**Next Steps**:
- [Actions to take after approval]

**Related Tasks**: [Dependencies or follow-up tasks]
**Notifications**: [Who needs to be informed]
```

## Template Examples

### Code Review Example

<details>
<summary>Expand Code Review Example</summary>

```markdown
**Task**: User Authentication Implementation
**Repository**: auth-service
**Branch**: feature/user-authentication -> main
**Reviewer**: @senior-dev, @security-team
**Work Date**: 2025/05/20 10:00 - 12:00

**Key Changes**: Implemented JWT-based authentication replacing session-based auth
**Impact Areas**: Authentication flow, API endpoints, frontend integration
**Review Focus**: Token security implementation and error handling

**Changes**: JWT-based authentication system implementation
**Files Changed**: 8 files (New: 4 / Modified: 3 / Deleted: 1)
**Impact Scope**: Authentication flow, API endpoints, frontend integration

**Added**: 
- JWT token generation and validation
- Auth middleware for API protection
- Login/logout endpoints
- User session management

**Modified**:
- API route protection
- Frontend auth state management
- Error handling for auth failures

**Deleted**:
- Legacy session-based auth code

**Completed Checks**:
- [x] Code compiles successfully
- [x] All tests passing (95% coverage)
- [x] Security audit completed
- [x] API documentation updated
- [x] License compliance verified for JWT libraries

**Test Results**: 45/45 tests pass, no security vulnerabilities found
**Quality Metrics**: Coverage 95%, ESLint clean, TypeScript strict mode

**Priority Areas**:
1. JWT token security implementation
2. Password hashing and validation
3. Session timeout handling
4. Error message sanitization

**Known Issues**: Rate limiting not yet implemented (follow-up task)
**Risks**: Breaking change for existing API consumers

**Testing Commands**:
- Build: `npm run build`
- Test: `npm test -- --coverage`
- Security: `npm audit && npm run security-check`

**Manual Verification**:
1. Test login with valid credentials
2. Verify token expiration handling
3. Check unauthorized access protection
4. Validate error responses

**Demo/Preview**: http://localhost:3000/auth-demo

**Next Steps**:
- Merge after approval
- Deploy to staging environment
- Update API documentation
- Coordinate with frontend team for integration

**Related Tasks**: AUTH-002 (Rate limiting), AUTH-003 (2FA)
**Notifications**: @frontend-team, @devops-team
```
</details>

### Documentation Review Example

<details>
<summary>Expand Documentation Review Example</summary>

```markdown
**Task**: API Documentation Update
**Repository**: api-documentation
**Branch**: docs/api-v2-update -> main
**Reviewer**: @tech-writer, @api-team
**Work Date**: 2025/05/20 14:00 - 16:00

**Key Changes**: Complete rewrite of API v2 documentation with new authentication section
**Impact Areas**: Developer documentation and code samples
**Review Focus**: Technical accuracy and example functionality

**Changes**: Complete rewrite of API v2 documentation
**Files Changed**: 5 files (New: 1 / Modified: 4 / Deleted: 0)
**Impact Scope**: Developer documentation, API reference, code samples

**Added**: 
- New authentication section
- Error handling guide
- Interactive API explorer

**Modified**:
- Endpoint documentation with examples
- Request/response schemas
- Rate limiting documentation
- Quick start guide

**Completed Checks**:
- [x] All links verified working
- [x] Code samples tested
- [x] Spelling and grammar check
- [x] Technical accuracy review
- [x] License and attribution statements verified

**Test Results**: All API examples execute successfully
**Quality Metrics**: Readability score 85/100, no broken links

**Priority Areas**:
1. Technical accuracy of new authentication flow
2. Code example functionality
3. Consistency with existing docs
4. Completeness of error scenarios

**Known Issues**: Migration guide pending (separate task)
**Risks**: Developers may need time to adapt to new format

**Testing Commands**:
- Link check: `make lint-docs`
- Sample test: `make test-samples`
- Build: `make build-docs`

**Manual Verification**:
1. Follow quick start guide step-by-step
2. Execute all code examples
3. Verify cross-references
4. Check mobile responsiveness

**Demo/Preview**: https://docs-preview.example.com/

**Next Steps**:
- Publish to production after approval
- Send announcement to developer community
- Update related documentation

**Related Tasks**: DOC-005 (Migration guide), DOC-006 (Video tutorials)
**Notifications**: @developer-relations, @support-team
```
</details>

### Pull Request Review Example

<details>
<summary>Expand Pull Request Example</summary>

```markdown
**Task**: User Interface Improvements
**Repository**: frontend-app
**Branch**: feature/ui-improvements -> main
**Reviewer**: @ui-lead, @frontend-team
**Work Date**: 2025/05/20 09:00 - 11:00

**Key Changes**: Dashboard and navigation UI overhaul with responsive design
**Impact Areas**: Main dashboard and core navigation components
**Review Focus**: Accessibility compliance and cross-browser compatibility

**Changes**: Dashboard and navigation improvements
**Files Changed**: 12 files (New: 2 / Modified: 10 / Deleted: 0)
**Impact Scope**: Main dashboard, navigation components, styling

**Added**: 
- New dashboard widgets
- Responsive navigation menu
- Loading states for async operations

**Modified**:
- Dashboard layout structure
- Color scheme and typography
- Button components styling
- Mobile responsive breakpoints

**Completed Checks**:
- [x] Cross-browser testing completed
- [x] Mobile responsiveness verified
- [x] Accessibility standards met
- [x] Performance impact assessed
- [x] License compliance for UI components verified

**Test Results**: E2E tests pass, visual regression tests clean
**Quality Metrics**: Lighthouse score 95/100, no console errors

**Priority Areas**:
1. Accessibility compliance (WCAG 2.1)
2. Performance impact on load time
3. Cross-browser compatibility
4. Mobile user experience

**Known Issues**: IE11 support dropped (documented decision)
**Risks**: Users may need time to adjust to new layout

**Testing Commands**:
- E2E: `npm run e2e`
- Visual regression: `npm run visual-test`
- Performance: `npm run lighthouse`

**Manual Verification**:
1. Test responsive behavior across devices
2. Verify keyboard navigation
3. Check screen reader compatibility
4. Validate with design mockups

**Demo/Preview**: https://preview-branch.herokuapp.com/

**Next Steps**:
- Merge to main after approval
- Deploy to staging for final testing
- Gather user feedback
- Plan gradual rollout

**Related Tasks**: UI-003 (User onboarding), UI-004 (Analytics)
**Notifications**: @design-team, @product-managers
```
</details>

## Integration with Existing Guidelines

This review guideline integrates with:
- [Coding Standards](./coding-standards.md)
- [Documentation Guidelines](./documentation-guidelines.md)
- [Operational Guidelines](../ops/operational-guidelines.md)

For comprehensive project guidelines, see the [Project README](../../README.md).

## Best Practices

### Before Requesting Review
1. Complete thorough self-review
2. Run all automated tests
3. Check code formatting and linting
4. Update relevant documentation
5. Prepare clear description of changes

### During Review
1. Respond promptly to feedback
2. Provide clarifications when needed
3. Make requested changes thoroughly
4. Re-run tests after modifications

### After Approval
1. Follow through on next steps immediately
2. Notify relevant stakeholders
3. Monitor for any issues post-deployment
4. Update task tracking systems

Remember: Good review requests save time for everyone and lead to better code quality.
