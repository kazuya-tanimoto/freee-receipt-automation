# AI Context Optimization

## Overview

This document defines optimization guidelines for AI agents to efficiently understand project context and provide
appropriate assistance.

## Context Provision

### 1. Project Structure

- Directory structure explanation
- Role of key files
- Dependency descriptions

### 2. Codebase

- Key component descriptions
- Design pattern usage
- Technology stack overview

### 3. Business Logic

- Domain knowledge provision
- Business rule explanations
- Constraint clarification

## Optimization Best Practices

### 1. Prompt Design

- Clear instruction provision
- Appropriate context volume
- Expected output format specification

### 2. Error Handling

- Error case clarification
- Fallback strategies
- Error message formats

### 3. Performance Optimization

- Context size optimization
- Response time improvement
- Efficient resource usage

## Summary File Management

### 1. Summary File Operation Rules

- **Purpose**: Maintain project context within AI memory constraints
- **Update Frequency**: After major feature implementations or architectural changes
- **Content Focus**: Core business logic, technical constraints, current implementation status

### 2. Content Priority

1. **High Priority**: Business domain knowledge, API integration patterns, security requirements
2. **Medium Priority**: Code organization patterns, testing strategies, development workflows
3. **Low Priority**: Detailed implementation specifics, temporary configurations

### 3. Format Standards

- Maximum 2000 tokens per summary file
- Structured markdown with clear sections
- Code examples only for critical patterns
- Focus on "why" over "what"

## freee Receipt Automation Specific Guidelines

### Business Context

- **Domain**: Freelance IT expense automation
- **Primary APIs**: freee API, Gmail API, Google Drive API, Google Cloud Vision OCR
- **Scale**: Personal project (~4 receipts/week)
- **Cost Constraint**: $5/year maximum

### Technical Context

- **Stack**: Next.js 14 + TypeScript + Supabase
- **Architecture**: Serverless with Edge Functions
- **Security**: Row Level Security (RLS), OAuth2 + PKCE
- **Testing**: Unit (Vitest) + E2E (Playwright)

### Development Context

- **Methodology**: PBI-driven development (Product Backlog Items)
- **Environment**: Container Use tools mandatory
- **Quality Gates**: Pre-commit hooks, documentation checks, test coverage
- **Phases**: Currently Phase 2 (API Integrations)

## Context Compression Strategies

### 1. Information Hierarchy

- **Core Rules**: Always preserved (CLAUDE.md compliance)
- **Project Context**: Business + technical constraints
- **Implementation Details**: Compressed aggressively

### 2. Memory Retention Techniques

- **Repetition**: Key constraints mentioned multiple times
- **Structure**: Consistent formatting aids compression
- **Specificity**: Project-specific terms resist generic compression

### 3. Context Refresh Triggers

- Phase transitions
- Major architectural decisions
- API integration completions
- Quality standard updates
