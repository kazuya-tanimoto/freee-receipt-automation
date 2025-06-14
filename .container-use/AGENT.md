This is a Next.js application with TypeScript and Yarn package manager.

Key commands:
- Install dependencies: yarn install
- Run development server: yarn dev
- Build project: yarn build
- Documentation checks: yarn check:docs
- Lint markdown: yarn lint:md
- Format markdown: yarn format:md

The project uses:
- Next.js 14 with React 18
- TypeScript for type safety
- Supabase for database and authentication
- Yarn v4 as package manager
- Lefthook for Git hooks
- Markdownlint for markdown linting

Before any commits, always run:
1. yarn check:docs
2. Fix all documentation errors
3. Follow the git workflow specified in CLAUDE.md