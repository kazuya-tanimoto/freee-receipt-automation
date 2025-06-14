This is a Next.js + Supabase + TypeScript project for freee receipt automation.

Key commands:
- Development server: yarn dev
- Build: yarn build  
- Documentation checks: yarn check:docs (runs scripts/check-docs.sh)
- Lint markdown: yarn lint:md
- Format markdown: yarn format:md

Project uses:
- Next.js 14 for frontend
- Supabase for backend/auth
- TypeScript for type safety
- Yarn 4.0.2 as package manager
- Strict documentation standards with markdown linting

Important: Always run yarn check:docs before commits when markdown files are modified.
The check-docs.sh script exists in scripts/ directory and is automatically executable.