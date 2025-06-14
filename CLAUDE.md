# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build, Lint, and Test Commands

- Run documentation checks: `yarn check:docs`
- Run document size check: `yarn check:docs:size`
- Lint markdown files: `yarn lint:md`
- Format markdown files: `yarn format:md`

## Pre-Commit Requirements

**MANDATORY: Before any git commit, ALWAYS execute these steps:**

1. **Check git worktree status** - Run `git worktree list` to identify active worktrees and avoid committing worktree directories
2. **Self-review all changes** - Review diffs, verify quality, check for issues
3. **When markdown files (\*.md) are created/modified**: Run `yarn check:docs` and fix ALL errors
4. Only then proceed with git commit

**This is a CRITICAL requirement to ensure code quality and prevent documentation errors.**

## Code Style Guidelines

### Naming Conventions

- Variables/Functions: camelCase (e.g., `userName`, `getUserData`)
- Classes: PascalCase (e.g., `UserService`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)

### File Structure

- Line limit per file: 150 lines (max 250 lines)
- Files exceeding 150 lines must be split by functionality
- Keep AI-generated code within 150 lines per file

### Comment Standards

- Function descriptions: JSDoc format
- Complex logic: Inline comments
- TODO comments: Include deadline and assignee

### Error Handling

- Specify concrete exception types
- Provide user-friendly error messages
- Use appropriate log levels

### Documentation Standards

- Markdown line length: 120 characters max
- First heading must be level 1
- Only allow `<kbd>` HTML tags in markdown
