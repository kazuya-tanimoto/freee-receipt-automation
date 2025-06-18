# GitHub Branch Protection Setup

## Overview

This document provides instructions for setting up GitHub branch protection rules to enforce quality gates for the main branch.

## Required Branch Protection Rules

### Main Branch Protection

Navigate to: `Settings > Branches > Add rule` for branch `main`

#### Basic Settings

- ✅ **Require a pull request before merging**
  - ✅ Require approvals: `1`
  - ✅ Dismiss stale PR approvals when new commits are pushed
  - ✅ Require review from code owners (if CODEOWNERS file exists)

- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - **Required status checks:**
    - `lint-gate / Documentation Quality Check`
    - `test / Run Tests`

- ✅ **Require conversation resolution before merging**

- ✅ **Require signed commits** (recommended)

- ✅ **Require linear history**

- ✅ **Do not allow bypassing the above settings**

#### Advanced Settings

- ✅ **Restrict pushes that create files larger than 100 MB**
- ✅ **Restrict force pushes**
- ✅ **Allow deletions** (unchecked)

## Status Check Configuration

### Required Checks

The following GitHub Actions workflows must complete successfully:

1. **Quality Gate** (`.github/workflows/lint-gate.yml`)
   - Documentation checks
   - Test suite execution
   - TypeScript compilation

2. **Test Suite** (`.github/workflows/test.yml`)
   - Comprehensive test execution
   - Environment validation

### Check Names in GitHub

When configuring required status checks, use these exact names:

- `lint-gate`
- `test`

## Enforcement Levels

### Level 1: Local (Pre-commit)

- Lefthook prevents commits with failing tests
- Documentation validation before commit

### Level 2: Repository (Branch Protection)

- GitHub prevents merging PRs with failing checks
- Requires successful CI execution

### Level 3: Process (CLAUDE.md Rules)

- Development guidelines mandate test coverage
- Code review requirements

## Setup Instructions

### 1. Enable GitHub Actions

Ensure GitHub Actions are enabled for the repository:

- Go to `Settings > Actions > General`
- Select "Allow all actions and reusable workflows"

### 2. Configure Branch Protection

1. Navigate to `Settings > Branches`
2. Click "Add rule"
3. Enter branch name: `main`
4. Configure settings as specified above
5. Save changes

### 3. Verify Configuration

Create a test PR to verify:

- Status checks appear and run
- PR cannot be merged until checks pass
- All enforcement mechanisms work correctly

## Troubleshooting

### Status Checks Not Appearing

1. Ensure workflows have run at least once on the branch
2. Check workflow file syntax and naming
3. Verify GitHub Actions permissions

### Bypassing Protection

- Only repository administrators can merge without checks
- This should be avoided except for emergency fixes
- Document any bypasses for audit purposes

## Maintenance

### Regular Reviews

- Monthly review of protection settings
- Verify all required checks are still relevant
- Update check names if workflows change

### Adding New Checks

When adding new workflows:

1. Test workflow execution
2. Add to required status checks
3. Update this documentation

## Security Considerations

- Never allow bypassing signed commits if enabled
- Limit repository administrator access
- Regular audit of protection rule changes
- Monitor force push attempts

## Related Documentation

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [CLAUDE.md Testing Requirements](../../CLAUDE.md#testing-requirements)
- [CI/CD Workflows](../../.github/workflows/)
