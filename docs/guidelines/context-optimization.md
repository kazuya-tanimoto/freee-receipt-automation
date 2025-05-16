# AI Context Optimization Guidelines

## Purpose
Provides a single source of information for both humans and AI, efficiently managing RAG context.

## Token Limits
- Summary for initial context is limited to 2k tokens
- For longer texts, split into `ai/context/` and use dynamic search by agents

## Context Management
1. **Summary (SUMMARY.md)**
   - Location: `docs/guidelines/SUMMARY.md`
   - Usage: Used as initial context for AI
   - Limit: Strictly under 2k tokens

2. **Full Documents**
   - Location: Managed as Git Submodules
   - Update: Weekly automatic updates (`scripts/update-guidelines.sh`)
   - Search: Dynamically referenced as needed

## Operational Rules
1. **Update Flow**
   - Manual editing of summary is prohibited
   - Content updates via automatic extraction or scripts
   - Major changes require ADR

2. **CI Checks**
   - `guidelines-size-check.yml` detects exceeding 4k tokens
   - PR fails if limit is exceeded

3. **Regular Updates**
   - Weekly execution of `update-guidelines.sh` (Monday 4 AM)
   - Automatic PR and CHANGELOG updates

## Optimization Points
1. **Context Splitting**
   - Split long texts into `ai/context/`
   - Agents search as needed

2. **Reference Efficiency**
   - Include frequently referenced information in summary
   - Manage detailed information in Submodules

3. **Maintainability**
   - Maintain latest state with automatic updates
   - Ensure quality with CI 