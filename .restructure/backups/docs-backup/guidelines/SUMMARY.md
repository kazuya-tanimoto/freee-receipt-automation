<!-- MAX_TOKENS: 2000 -->
# Development Guidelines Summary

This document provides a concise summary of the development guidelines from [Bulletproof React](https://github.com/alan2207/bulletproof-react) and [Naming Cheatsheet](https://github.com/kettanaito/naming-cheatsheet).

## Bulletproof React

#### Project Standards

- **ESLint**: Configure `.eslintrc.js` to maintain code quality and enforce coding standards.
- **Prettier**: Use `.prettierrc` for consistent code formatting. Enable "format on save" in your IDE.
- **TypeScript**: Recommended for detecting issues during refactoring. Update type declarations first, then resolve errors.
- **Husky**: Implement git hooks to run code validations (linting, formatting, type checking) before commits.
- **Absolute Imports**: Configure to avoid messy relative paths (`../../../component`).
  ```json
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
  ```
- **File Naming**: Enforce consistent naming conventions (e.g., kebab-case) using ESLint rules.

#### Project Structure

- Organize by feature or route rather than by type
- Keep related files close to each other
- Avoid deep nesting of folders
- Create reusable components in a shared directory

#### Components and Styling

- Use functional components with hooks
- Extract reusable logic into custom hooks
- Implement consistent component composition patterns
- Consider using CSS-in-JS or CSS Modules for component styling

#### State Management

- Use local state for UI-specific state
- Use context for shared state that doesn't change often
- Consider external state management libraries for complex applications
- Implement proper data fetching and caching strategies

#### Error Handling

- Implement global error boundaries
- Handle API errors consistently
- Provide meaningful error messages to users
- Log errors for debugging purposes

#### Testing

- Write unit tests for utility functions and hooks
- Write integration tests for component interactions
- Use testing libraries that promote good practices
- Aim for high test coverage of critical paths

---

#### Next.js Integration Example

```ts
// app/server/actions/createTodo.ts
import { revalidatePath } from 'next/cache'

export async function createTodo(formData: FormData) {
  'use server'
  const title = formData.get('title') as string
  await fetch(`${process.env.API_URL}/todos`, {
    method: 'POST',
    body: JSON.stringify({ title }),
    cache: 'no-store'
  })
  revalidatePath('/todos')
}
```
*Server Actions を使い、`fetch()` の `'no-store'` でキャッシュを無効化しつつ RSC 側で再検証を行う例。*

## Naming Cheatsheet

#### Core Principles

- **Use English** for all variable and function names
- **Be Consistent** with your chosen naming convention (camelCase, PascalCase, etc.)
- **S-I-D**: Names should be Short, Intuitive, and Descriptive
- **Avoid Contractions**: Write full words instead of shortened versions
- **Avoid Context Duplication**: Don't repeat the context in which a variable is defined
- **Reflect Expected Results**: Name boolean variables to match their usage context

#### Function Naming Pattern: A/HC/LC

Follow the pattern: `prefix? + action (A) + high context (HC) + low context? (LC)`

Examples:
- `getUser` - Action: get, High Context: User
- `getUserMessages` - Action: get, High Context: User, Low Context: Messages
- `shouldDisplayMessage` - Prefix: should, Action: Display, High Context: Message

#### Common Action Verbs

- **get**: Access data immediately or asynchronously
- **set**: Assign a value declaratively
- **reset**: Return to initial value or state
- **remove**: Take something out of a collection
- **delete**: Completely erase something
- **handle**: Handle an action (often used with events)
- **is/has/should**: Boolean prefixes that ask a question
- **on**: Prefixes for event handlers or callbacks

#### Singular and Plurals

- Use singular form for single items: `const user = getUser()`
- Use plural form for collections: `const users = getUsers()`
- Be consistent with arrays: `const userList = ['John', 'Jane']`

---

This summary provides key guidelines from both sources. For more detailed information, refer to the original documentation in the respective repositories.
