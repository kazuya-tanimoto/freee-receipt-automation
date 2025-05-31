# AI Workflow Rules

## Overview
This document defines the workflow rules for AI assistants when working on the freee-receipt-automation repository.

Target audience: AI Assistants / Reviewers

## Basic Principles
### 1. Scope Limitation
- AI only edits files explicitly specified in instructions
- Maintain minimal changes to ensure manageability
- Apply a minimal approach even when implementing instructions
- Additional work for guideline compliance and security is permitted
  - However, **explanation and approval must be obtained before implementation**

### 2. ADR Submission
- For changes with "medium" or higher impact, follow [Operational Rules Guidelines](./operational-rules.md) and add ADR to `docs/adr/`
- ADR required content:
  - Background
  - Decision
  - Impact
  - Alternatives
- Examples of "medium" impact:
  - Major version upgrades of key libraries
  - Changing CI configuration
  - Architecture modifications

### 3. Review Process
- Always perform self-review before reporting completion
- Include the following information in completion reports:
  - Self-review implementation status and results
  - Review request message for users or other AI
- Review request timing:
  - When changing 3 or more files
  - When total changes exceed 300 lines
  - At functional unit boundaries
- Execute commits only after receiving review approval

### 4. Commit Convention
- Strictly follow existing commit message patterns
  - Creating new patterns is prohibited
- Write commit messages in English

#### Commit Message Format
```
<type>: <subject>

<body>

<footer>
```

#### type (required)
- `feat`: Add new feature
- `fix`: Bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning (whitespace, formatting, missing semicolons)
- `refactor`: Code changes that neither fix bugs nor add features
- `test`: Add tests or modify existing tests
- `chore`: Changes to build process, auxiliary tools, or libraries

#### subject (required)
- Keep under 50 characters
- Don't capitalize first letter
- No period at the end
- Use imperative mood (e.g., use "change" not "changes")

#### body (optional)
- Wrap at 72 characters
- Explain what and why
- Use "-" for bullet points

### 5. Work Efficiency
- Maintain concise and focused responses to minimize token consumption

### 6. Tool Priority
- When using MCP tools, prioritize the following:
  - claude_code
  - filesystem
  - git
  - Note: JetBrains tools are not completely prohibited but the above tools should be prioritized

### 7. Documentation Update Flow
- Update English version first, then update Japanese version
- Keep both language versions synchronized

## Work Flow
### 1. Before Starting
- Confirm instructions
- Ask questions for any unclear points
- Propose and obtain approval for additional work if needed
- Evaluate impact level and check ADR necessity

### 2. During Work
- Apply minimal changes
- Verify guideline and security requirements
- Record changes
- Regular progress check (file count/line count threshold check)

### 3. Upon Completion
- Perform self-review
- Verify changes
- Create review request message
- Report completion
- Create ADR if necessary

### 4. Commit
- Execute after review approval
- Follow existing commit message format
- Write messages in English
- Update CHANGELOG (if necessary)

## Rollback Strategy
### 1. Response to Defect Detection
- When defects are detected after production release, revert to the most recent tag `v*.*.*` using `git revert`
- After rollback, **always** add "Reverted" item to `CHANGELOG.md`

### 2. Rollback Procedure
- Identify impact scope
- Execute rollback
- Notify stakeholders
- Create post-incident report

## Prohibited Actions
- Executing commits without user permission
- Performing work beyond instructions autonomously
- Creating new commit message patterns
- Consuming unnecessary tokens
- Implementing changes requiring ADR without documentation

## Exception Handling
- Report security issues immediately
- Propose fixes for guideline violations
- Prioritize proposals for high-urgency issues
- Clarify fallback procedures when tools are unavailable

## References
- [Operational Guidelines](./operational-guidelines.md)
- [Operational Rules Guidelines](./operational-rules.md)
- [Coding Standards](../standards/coding-standards.md)
- [Project Root README](../../README.md)

## Change History
| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-05-31 | 1.0.0 | Initial version | AI Assistant |
