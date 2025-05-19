# Coding Standards Reference Settings

## Overview
Incorporates rules from Bulletproof React and Naming Cheatsheet in a reusable format for Next.js 15 projects.

## Reference Settings
### 1. Bulletproof React
- Repository: https://github.com/alan2207/bulletproof-react
- Branch: `master`
- Scope: `docs/` directory only
- Update: Weekly automatic updates

### 2. Naming Cheatsheet
- Repository: https://github.com/kettanaito/naming-cheatsheet
- Branch: `main`
- Scope: Entire root directory
- Update: Weekly automatic updates

## Setup Instructions
```bash
# Add submodules
git submodule add -b master https://github.com/alan2207/bulletproof-react docs/guidelines/bulletproof-react
git submodule add -b main https://github.com/kettanaito/naming-cheatsheet docs/guidelines/naming-cheatsheet

# Configure sparse-checkout
git -C docs/guidelines/bulletproof-react sparse-checkout set docs
git -C docs/guidelines/naming-cheatsheet sparse-checkout set .
```

## Update Flow
1. Run `scripts/update-guidelines.sh` weekly
2. Review changes
3. Create PR
4. Verify CI pass
5. Merge

## Important Notes
- Manual submodule updates are prohibited
- Updates must be executed via script
- Major changes require ADR
- Comply with license requirements (MIT License) 