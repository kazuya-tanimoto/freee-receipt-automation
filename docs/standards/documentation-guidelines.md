# Documentation Guidelines

<!-- merged-from: guidelines/documentation-guidelines.md -->

## Overview
This document defines the standards and guidelines for documentation in the project.

## Table of Contents
1. [Document Structure](#1-document-structure)
2. [Naming Conventions](#2-naming-conventions)
3. [Multilingual Support](#3-multilingual-support)
4. [Quality Standards](#4-quality-standards)

## 1. Document Structure
- Documents should be placed in appropriate directories according to their type
- Maintain structure according to this guidelines document
- Include table of contents, overview, and reference links as mandatory items

## 2. Naming Conventions
### 2.1 File Names
- Base filename: `kebab-case.md`
- Japanese version: `kebab-case-ja.md`
- English version: `kebab-case.md`

Example:
- `security-guidelines.md` (English version)
- `security-guidelines-ja.md` (Japanese version)

### 2.2 Directory Structure
```
docs/
├── standards/
│   ├── security-guidelines.md
│   ├── security-guidelines-ja.md
│   ├── coding-standards.md
│   ├── coding-standards-ja.md
│   └── documentation-guidelines.md
├── ops/
│   └── operational-guidelines.md
└── ...
```

## 3. Multilingual Support
### 3.1 Basic Policy
- All guidelines should have English as the base version
- Japanese versions should have the `-ja` suffix
- Maintain complete synchronization between both language versions

### 3.2 Update Procedure
1. Update English version first
2. Reflect changes in Japanese version
3. Verify content in both versions
4. Update cross-references if necessary

### 3.3 Quality Checks
- Ensure complete consistency between language versions
- Verify appropriate translation of technical terms
- Confirm correct functionality of reference links

## 4. Quality Standards
### 4.1 Mandatory Items
- Table of contents
- Overview section
- Reference links
- Change history

### 4.2 Size Limits
- Within 2000 tokens
- Consider splitting if necessary

### 4.3 Format
- Follow Markdown format
- Use heading levels appropriately
- Specify language in code blocks

## Reference Links
- [Coding Standards](./coding-standards.md)
- [Security Guidelines](./security-guidelines.md)
- [Review Guidelines](./review-guidelines.md)

## Change History
| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2024-03-21 | 1.0.0 | Initial version | AI Assistant | 