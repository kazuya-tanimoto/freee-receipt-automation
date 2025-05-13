# Development Guidelines

## Purpose

This directory contains development guidelines for the freee receipt automation project. These guidelines are designed to establish consistent coding practices and standards for both developers and AI assistants working on the project.

The guidelines include two main resources:

- **Bulletproof React**: A comprehensive guide for building scalable and maintainable React applications, covering project structure, state management, testing, and more.
- **Naming Cheatsheet**: A guide for naming variables, functions, and other code elements consistently and intuitively.

These guidelines are integrated as Git submodules to ensure we can easily keep them up-to-date with their upstream repositories while maintaining a stable reference for our project. The SUMMARY.md file provides a concise overview of the key points from both guidelines, optimized for AI context with a 2000 token limit.

## Directory Structure

```
guidelines/
├── SUMMARY.md                # AI-optimized summary (2000 token limit)
├── README.md                 # English documentation (this file)
├── README_JA.md              # Japanese documentation
├── bulletproof-react/        # Git submodule
└── naming-cheatsheet/        # Git submodule
```

## Maintenance Procedures

### Using the Update Script

We provide a script to simplify the process of updating the guidelines:

```bash
./scripts/update-guidelines.sh
```

This script performs the following operations:
1. Updates all Git submodules to their latest versions using `git submodule update --remote --merge`
2. Formats the SUMMARY.md file using mdformat to ensure consistent styling

### Manual Update Process

If you need to update the guidelines manually:

1. Update the submodules:
   ```bash
   git submodule update --remote --merge
   ```

2. Format the SUMMARY.md file (requires Node.js):
   ```bash
   npx mdformat docs/guidelines/SUMMARY.md
   ```

3. Review the changes and ensure the SUMMARY.md file still adheres to the 2000 token limit

### Automated Weekly Updates

A GitHub Actions workflow automatically runs the update script weekly and creates a pull request with any changes. This ensures our guidelines stay current without manual intervention.

### Recording Changes

After updating the guidelines, document the changes in the CHANGELOG.md file under the appropriate version section, following the Keep a Changelog format:

```markdown
## [Unreleased]

### Changed

- Updated guidelines:
  - Updated Bulletproof React to version X.Y.Z
  - Updated Naming Cheatsheet to latest version
  - Modified SUMMARY.md to include new recommendations
```

## Important Notes

- **Do not edit SUMMARY.md directly**. This file should only be updated through the update script to ensure proper formatting and token limits.

- **Share guideline changes with the team**. When significant updates are made to the guidelines, inform the team and consider creating an Architectural Decision Record (ADR) if the changes impact the project's architecture.

- **Token limit is critical**. The 2000 token limit for SUMMARY.md is important for optimal AI context integration. Exceeding this limit may reduce the effectiveness of AI assistance.

- **System prompt integration**. The SUMMARY.md file is designed to be integrated into AI system prompts to provide context about our development standards.

## CI/CD Integration

### GitHub Actions Workflow

The guidelines are integrated into our CI/CD pipeline through GitHub Actions:

- A weekly workflow automatically updates the submodules and creates a pull request
- The workflow checks that the SUMMARY.md file stays within the 2000 token limit
- The workflow automatically updates the CHANGELOG.md file with the changes

### Pull Request Process

When the automated PR is created:
1. The changes are reviewed by the team
2. Any necessary adjustments to SUMMARY.md are made
3. The PR is merged after approval

## Contributing

### Proposing Changes to Guidelines

If you want to propose changes to how we use these guidelines:

1. Create an issue describing the proposed changes and their benefits
2. Discuss with the team to reach consensus
3. Update the SUMMARY.md file (via the update script) to reflect the agreed changes
4. Create a pull request with the changes

### Relationship with Upstream Repositories

Our guidelines are based on the upstream repositories, but we may adapt them to our specific needs. When contributing:

- Consider whether your changes should be proposed to the upstream repositories
- Ensure backward compatibility when making changes
- Document project-specific adaptations clearly

### Project-Specific Guidelines

For project-specific guidelines that aren't covered by the external resources:

1. Add them to the SUMMARY.md file in a clearly marked section
2. Ensure they follow the same style and format as the rest of the document
3. Keep them concise and within the token limit

### Backward Compatibility

When updating guidelines, consider the impact on existing code:

- Avoid changes that would require significant refactoring of existing code
- If breaking changes are necessary, provide a migration path
- Document deprecated practices with their replacements