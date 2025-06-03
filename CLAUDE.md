# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Lint/Test Commands

- To run the development server: `npm run dev` or `yarn dev`
- To build the project: `npm run build` or `yarn build`
- To run linting: `npm run lint` or `yarn lint`
- To check types: `npm run check-types` or `yarn check-types`
- To run tests: `npm run test` or `yarn test`
- To run a single test: `npm run test -- -t "test name"` or `yarn test -t "test name"`
- To run end-to-end tests: `npm run test-e2e` or `yarn test-e2e`

## Code Style Guidelines

- File structure: 150 lines basic limit, 250 lines max limit
- Naming: camelCase for variables/functions, PascalCase for classes, UPPER_SNAKE_CASE for constants
- Test file naming: `*.test.ts`
- Code comments: JSDoc for functions, inline for complex logic
- Error handling: Specify concrete exception types, use appropriate logging
- Typescript: Use strict typing, avoid `any` type
- React components: Follow bulletproof-react architecture
- PR/commit format: Reference ticket ID, use semantic commit messages

## Code Organization

- Follow feature-based directory structure
- Keep components small and focused on single responsibility
- Extract reusable logic into hooks
- Use proper error boundaries
