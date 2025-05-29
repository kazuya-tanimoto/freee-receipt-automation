# CI/CD Configuration Guidelines

## Guideline-related Workflows

### 1. Guideline Size Check
- File: `guidelines-size-check.yml`
- Purpose: Monitor token count of SUMMARY.md
- Limit: Enforce 4k tokens maximum
- Execution: On PR creation

### 2. Weekly Guideline Update
- File: `weekly-guidelines-update.yml`
- Purpose: Automatic submodule updates
- Execution: Every Monday at 4 AM
- Process:
  1. Update submodules
  2. Regenerate SUMMARY.md
  3. Create automatic PR
  4. Update CHANGELOG

## CI Pass Requirements
1. Pass guideline size check
2. Pass normal build (Turbopack)
3. Pass security scan

## Operational Rules
1. **On PR Creation**
   - Guideline size check is mandatory
   - Automatic fail on exceeding limit

2. **On Weekly Update**
   - Create automatic PR
   - Merge after review
   - Update CHANGELOG

3. **Error Handling**
   - Size exceeded: Review SUMMARY.md summary
   - Build failure: Check dependencies
   - Security warnings: Fix vulnerabilities 