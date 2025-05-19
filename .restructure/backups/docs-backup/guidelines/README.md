# Development Guidelines

## Purpose

This directory contains development guidelines for the freee expense management automation project. These guidelines aim to establish consistent coding standards and practices for both human developers and AI assistants working on the project.

## Guideline Structure

The guidelines are organized into four main sections:

1. **AI Context Optimization** (`context-optimization.md`)
   - Efficient collaboration with AI assistants
   - Token limits and context management
   - RAG optimization

2. **Coding Standards** (`coding-standards.md`)
   - Bulletproof React integration
   - Naming Cheatsheet application
   - Submodule management

3. **CI/CD Configuration** (`.github/workflows/README.md`)
   - Automated update workflows
   - Size checks
   - Quality management

4. **Operational Rules** (`operational-rules.md`)
   - Update procedures
   - Quality control
   - Maintenance

## Directory Structure

```
guidelines/
├── SUMMARY.md                # AI summary (2000 token limit)
├── README.md                 # English documentation
├── README_JA.md              # Japanese documentation
├── context-optimization.md   # AI context optimization
├── coding-standards.md       # Coding standards
├── operational-rules.md      # Operational rules
├── bulletproof-react/        # Git submodule
└── naming-cheatsheet/        # Git submodule
```

## Important Notes

- **Do not edit SUMMARY.md directly**
- **Share guideline changes with the team**
- **Token limit (2000) is crucial**
- **Consider system prompt integration**

## Detailed Information

For detailed information about each guideline, please refer to the corresponding documentation above. Specifically:

- AI context optimization methods
- Specific application of coding standards
- CI/CD configuration and operation
- Project-specific operational rules

## Contributing

When proposing changes to the guidelines, please refer to the contribution guidelines in the corresponding documentation. All changes must follow the process of:

1. Creating an issue
2. Discussing with the team
3. Creating a pull request
4. Review and approval