# Development Guidelines

This document provides essential information for developers working on this project. It focuses on AI-driven development guidelines and repository structure.

## Repository Structure

This repository serves as a guideline for AI-driven development. The main components are:

- `README.md`: Main documentation with the AI-driven development structure
- `.junie/`: Directory containing guidelines for AI-assisted development

## Development Workflow

1. Create a feature branch from `main`
2. Make changes following the AI-driven development guidelines
3. Submit a pull request
4. Address review comments
5. Merge after approval

## Documentation

- Update README.md with any user-facing changes
- Follow the existing documentation style

## Versioning

The project follows Semantic Versioning (SemVer):
- MAJOR version for incompatible API changes
- MINOR version for backward-compatible functionality additions
- PATCH version for backward-compatible bug fixes

## AI-Driven Development Guidelines

This project follows AI-driven development practices as outlined in the repository structure.

### AI Integration

- The `.junie` directory contains guidelines and documentation for AI-assisted development
- When working with AI tools, refer to the project structure and documentation to provide context

### Directory Structure for AI Collaboration

For larger projects, consider implementing the full directory structure as described in the README:

- `docs/`: Human & AI shared knowledge base (requirements, design, API, etc.)
- `ai/`: AI agent metadata (system prompts, glossaries, prompt templates)
- `ai/context/`: Long-form background information for RAG
- `ai/examples/`: High-quality samples and best practices
- `ai/feedback/`: Human reviews of AI outputs

### Development Workflow with AI

1. Use the project documentation to provide context to AI tools
2. Maintain consistent code style and documentation for better AI comprehension
3. Document decisions and changes clearly for both human and AI collaborators
