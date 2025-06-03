<!-- MAX_TOKENS: 2000 -->
# Development Guidelines Summary

This document provides a concise summary of the development guidelines from [Bulletproof React](https://github.com/alan2207/bulletproof-react) and [Naming Cheatsheet](https://github.com/kettanaito/naming-cheatsheet).

## Bulletproof React

#### Project Standards

- **ESLint**: Configure `.eslintrc.js` for code quality
- **Prettier**: Use `.prettierrc` for consistent formatting
- **TypeScript**: Refactoring support. Update type declarations first
- **Husky**: Implement git hooks for pre-commit validation
- **Absolute Imports**: Avoid messy relative paths
- **File Naming**: Enforce consistent conventions with ESLint

#### Project Structure

- Organize by feature or route (not by type)
- Keep related files close together
- Avoid deep nesting

#### Components

- Use functional components with hooks
- Extract logic into custom hooks
- Consider CSS-in-JS or CSS Modules

#### State Management

- UI state: local state
- Shared state: context
- Complex apps: external libraries

#### Error Handling and Testing

- Implement global error boundaries
- Handle API errors consistently
- Write unit and integration tests
- Aim for high test coverage



## Naming Cheatsheet

#### Core Principles

- **Use English** for all names
- **Be Consistent** with naming conventions (camelCase, PascalCase, etc.)
- **S-I-D**: Short, Intuitive, and Descriptive
- **Avoid Contractions**: Use full words
- **Avoid Context Duplication**
- **Reflect Expected Results**: Boolean variables match usage context

#### Function Naming: A/HC/LC

Pattern: `prefix? + action (A) + high context (HC) + low context? (LC)`

Examples: `getUser`, `getUserMessages`, `shouldDisplayMessage`

#### Action Verbs

- **get**: Data access
- **set**: Value assignment
- **reset**: Return to initial value
- **remove/delete**: Removal
- **handle**: Action processing
- **is/has/should**: Boolean prefixes
- **on**: Event handlers

#### Singular and Plurals

- Single: `const user = getUser()`
- Collections: `const users = getUsers()`
- Arrays: `const userList = ['John', 'Jane']`

---

This summary provides key guidelines from both sources. For more detailed information, refer to the original documentation in the respective repositories.
