# GitHub Actions Workflows

## Overview
This directory contains GitHub Actions workflow configurations for the freee expense management automation project.

## Active Workflows

### 1. Documentation Check (`documentation-check.yml`)
- **Purpose**: Comprehensive documentation quality check
- **Triggers**: Push and PR on `*.md` files
- **Checks**:
  - Markdown lint (markdownlint-cli2)
  - Link validation
  - File size limit (10KB warning)
  - Language consistency (EN/JA versions)
  - Document structure
- **Status**: Active (with lint errors)

### 2. Markdown Link Check (`markdown-link-check.yml`)
- **Purpose**: Validate all links in markdown files
- **Triggers**: PR on `*.md` files
- **Scope**: All markdown files in repository
- **Status**: Active and working

### 3. Guidelines Size Check (`guidelines-size-check.yml`)
- **Purpose**: Monitor AI context file token count
- **Triggers**: Push and PR on `ai/context/summary.md`
- **Limit**: 2000 tokens maximum
- **Status**: Active (needs attention - file currently exceeds limit)



## Maintenance Notes

### Token Limit Management
- The `ai/context/summary.md` file must stay under 2000 tokens
- Current status: Within limit (~1250 tokens)
- Regular monitoring recommended

### Documentation Standards
- All documentation must have both English and Japanese versions
- File naming: `filename.md` (EN), `filename-ja.md` (JA)
- Keep versions synchronized

### File Size Guidelines
- Warning threshold: 10KB
- Consider splitting files larger than 10KB
- Optimize for AI processing efficiency

## Troubleshooting

### Common Issues
1. **Markdown lint errors**: Check `.markdownlint.jsonc` for rules
2. **Token limit exceeded**: Reduce content in `ai/context/summary.md`
3. **Link check failures**: Verify all internal and external links

### Contact
For workflow issues, contact the development team or create an issue in the repository.
