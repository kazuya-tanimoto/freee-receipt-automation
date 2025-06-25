<!-- MAX_TOKENS: 2000 -->

# Development Guidelines Summary

This document provides a summary of development guidelines from
[Bulletproof React](../../docs/standards/bulletproof-react/README.md) and
[Naming Cheatsheet](../../docs/standards/naming-cheatsheet/README.md).

## Bulletproof React

### Project Standards

- **ESLint**: Maintain code quality with `.eslintrc.js`
- **Prettier**: Consistent formatting with `.prettierrc`
- **TypeScript**: Refactoring support. Update type declarations first
- **Husky**: Git hooks for pre-commit validation
- **Absolute Path Imports**: Avoid relative path complexity
- **File Naming**: Enforce consistent naming conventions with ESLint

### Project Structure

- Organize by features or routes (not by types)
- Place related files close together
- Avoid deep nesting

### Components

- Use function components + hooks
- Extract logic with custom hooks
- Prefer CSS-in-JS or CSS Modules

### State Management

- UI state: Local state
- Shared state: Context
- Complex apps: External libraries

### Error Handling and Testing

- Implement global error boundaries
- Consistent API error handling
- Create unit & integration tests
- Target high test coverage

## Naming Cheatsheet

### Basic Principles

- Use **English**
- Maintain **consistency** (camelCase, PascalCase, etc.)
- **S-I-D**: Short, Intuitive, Descriptive
- **Avoid abbreviations**: Use complete words

### Variable Naming

- **Boolean**: Use `is`, `has`, `can`, `should` prefixes
- **Functions**: Use verbs (`get`, `set`, `create`, `update`, `delete`)
- **Constants**: Use `UPPER_SNAKE_CASE`
- **Classes**: Use `PascalCase`

### freee Receipt Automation Specific

#### Domain-Specific Naming

- **Receipt processing**: `processReceipt`, `extractReceiptData`, `validateReceiptFormat`
- **freee API**: `createFreeeTransaction`, `updateExpenseItem`, `syncWithFreee`
- **OCR operations**: `extractTextFromPDF`, `parseReceiptContent`, `validateOCRResults`
- **File management**: `organizeReceiptFiles`, `generateFileName`, `moveToArchive`

#### API Integration Patterns

- **OAuth flows**: `authenticateWithFreee`, `refreshAccessToken`, `validateTokenScope`
- **Data transformation**: `mapReceiptToTransaction`, `formatCurrencyAmount`, `normalizeDate`
- **Error handling**: `handleAPIError`, `retryWithBackoff`, `logProcessingFailure`

#### Component Naming

- **Pages**: `ReceiptUploadPage`, `TransactionListPage`, `DashboardPage`
- **Components**: `ReceiptViewer`, `TransactionForm`, `FileDropZone`
- **Hooks**: `useReceiptProcessing`, `useFreeeAPI`, `useFileUpload`
- **Utils**: `receiptValidator`, `dateFormatter`, `currencyParser`

## Testing Conventions

### Test File Naming

- **Unit tests**: `*.test.ts` (co-located with source)
- **Integration tests**: `*.integration.test.ts`
- **E2E tests**: `*.e2e.ts` (in dedicated `e2e/` directory)

### Test Description Patterns

- **Unit**: "should [expected behavior] when [condition]"
- **Integration**: "should [complete workflow] with [scenario]"
- **E2E**: "user can [user action] and [expected outcome]"

### Mock Naming

- **API mocks**: `mockFreeeAPI`, `mockGmailAPI`, `mockOCRService`
- **Data fixtures**: `sampleReceipt`, `validTransaction`, `errorResponse`
- **Test utilities**: `createTestUser`, `setupTestDatabase`, `cleanupTestFiles`

## Error Handling Patterns

### Error Types

- **ValidationError**: Data format/content issues
- **APIError**: External service failures
- **ProcessingError**: Internal operation failures
- **AuthenticationError**: Access/permission issues

### Error Messages

- **User-facing**: Clear, actionable, non-technical
- **Developer logs**: Detailed context, stack traces, debugging info
- **API responses**: Standardized format with error codes

### Recovery Strategies

- **Retry logic**: Exponential backoff for transient failures
- **Fallback options**: Alternative processing paths
- **User guidance**: Clear next steps for error resolution
