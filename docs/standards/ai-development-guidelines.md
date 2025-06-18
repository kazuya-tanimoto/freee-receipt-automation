# AI Development Guidelines

## Overview

This document serves as the central hub for all guidelines related to AI-driven development in this repository. It
provides a map for both human developers and AI agents to understand the rules and workflows.

## Core Principles

- **Shared Knowledge Base**: All development activities, whether by humans or AI, must be based on the information
  within the `docs/` and `ai/` directories.
- **Minimal, Focused Changes**: Each task or commit should be small, focused, and directly traceable to a Product
  Backlog Item (PBI).
- **Automation and Quality Gates**: We rely heavily on CI/CD and pre-commit hooks to maintain quality and consistency.

## Key Guideline Documents

| Guideline                      | Location               | Purpose                                           |
| ------------------------------ | ---------------------- | ------------------------------------------------- |
| **AI Workflow Rules**          | [Workflow Rules]       | Defines the operational rules for AI agents.      |
| **AI Context Optimization**    | [Context Optimization] | How to provide and optimize context for AI.       |
| **System Prompt (Foundation)** | [System Prompt]        | The foundational instructions for AI agent.       |
| **PBI & Task Management**      | [Task Management]      | How to create/manage tasks for AI implementation. |
| **Coding Standards**           | [Coding Standards]     | General coding conventions for this project.      |
| **Review Guidelines**          | [Review Guidelines]    | Guidelines for code and documentation reviews.    |

[Workflow Rules]: ../ops/ai-workflow-rules.md
[Context Optimization]: ../../ai/context/context-optimization.md
[System Prompt]: ../../ai/system_prompt.md
[Task Management]: ../requirements/backlog/README.md
[Coding Standards]: ./coding-standards.md
[Review Guidelines]: ./review-guidelines.md
