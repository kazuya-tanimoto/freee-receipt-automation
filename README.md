# freee Receipt Automation

An automated system for processing receipt images and syncing transaction data with freee accounting software.

## Overview

This system automates the tedious process of receipt management by:

- Uploading receipt images through a web interface
- Extracting transaction data using OCR
- Automatically matching and syncing data with freee accounting
- Providing a dashboard for monitoring and manual review

## Quick Start

### Prerequisites

- Node.js 18+
- A Supabase account ([sign up here](https://supabase.com))
- A freee account and API access

### 1. Clone and Install

```bash
git clone https://github.com/your-username/freee-receipt-automation.git
cd freee-receipt-automation
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# freee API Configuration
FREEE_CLIENT_ID=your_freee_client_id
FREEE_CLIENT_SECRET=your_freee_client_secret

# OCR Service Configuration
OCR_API_KEY=your_ocr_service_key
```

### 3. Set Up Database

Follow the detailed [Supabase Setup Guide](docs/setup/supabase-setup.md) to:

- Create a Supabase project
- Run database migrations
- Configure authentication and security

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the application.

## Features

### Current (Phase 1)

- ✅ User authentication and authorization
- ✅ Secure database with row-level security
- ✅ Receipt file upload and storage
- ✅ User settings management
- ✅ Transaction data modeling

### Planned (Phase 2+)

- 🚧 OCR text extraction from receipts
- 🚧 freee API integration for transaction sync
- 🚧 Automatic transaction matching
- 🚧 Dashboard for monitoring and review
- 🚧 Batch processing capabilities

## Architecture

### Technology Stack

- **Frontend**: Next.js 14 with TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Authentication**: Supabase Auth with email/password
- **Database**: PostgreSQL with Row Level Security (RLS)
- **File Storage**: Supabase Storage
- **Testing**: Vitest + Testing Library + Playwright

### Key Design Decisions

- **[ADR-001: Supabase Selection](docs/architecture/decisions/001-supabase-selection.md)** - Why we chose Supabase for
  backend infrastructure

## Development

### Testing Strategy

This project uses a **Unit + E2E testing approach**:

- **Unit Tests**: Co-located with source files (`src/lib/auth.test.ts`)
- **E2E Tests**: Dedicated `e2e/` directory with Playwright

```bash
# Run unit tests
npm run test

# Run unit tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Run all tests
npm run test:all
```

### Code Quality

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Formatting
npm run format
```

### Database Migrations

```bash
# Apply migrations manually through Supabase dashboard
# Files are located in supabase/migrations/
```

## Deployment

### Production Setup

1. **Create Production Supabase Project**

   - Follow the same setup as development
   - Use production URLs and keys

2. **Deploy to Vercel**

   ```bash
   vercel deploy
   ```

3. **Configure Environment Variables**
   - Add all environment variables in Vercel dashboard
   - Ensure production Supabase credentials

### Environment Management

- **Development**: `.env.local`
- **Production**: Vercel environment variables
- **Testing**: Test-specific environment configuration

## Documentation

### Setup Guides

- [Supabase Setup](docs/setup/supabase-setup.md) ([日本語](docs/setup/supabase-setup-ja.md)) - Complete Supabase configuration
- [API Documentation](docs/api/authentication.md) ([日本語](docs/api/authentication-ja.md)) - Authentication API reference

### Architecture

- [Database Schema](docs/database/schema-design.md) ([日本語](docs/database/schema-design-ja.md)) - Database design
  overview and relationships
- [Decision Records](docs/architecture/decisions/) - Key architectural decisions
  - [ADR-001: Supabase Selection](docs/architecture/decisions/001-supabase-selection.md) ([日本語](docs/architecture/decisions/001-supabase-selection-ja.md))

### Troubleshooting

- [Supabase Issues](docs/troubleshooting/supabase-issues.md) ([日本語](docs/troubleshooting/supabase-issues-ja.md)) -
  Common problems and solutions

### Development Guidelines

- [Coding Standards](docs/standards/coding-standards.md) - Code quality and consistency
- [AI Development Guidelines](CLAUDE.md) - Guidelines for AI-assisted development

## Project Structure

```text
├── src/
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   ├── lib/                 # Core business logic
│   ├── types/              # TypeScript type definitions
│   └── testing/            # Test utilities and setup
├── supabase/
│   └── migrations/         # Database schema migrations
├── e2e/                    # End-to-end tests
├── docs/                   # Project documentation
└── ai/                     # AI development context
```

## Contributing

This is a personal automation project, but feedback and suggestions are welcome through GitHub issues.

### Development Workflow

1. Create feature branch from `main`
2. Implement changes with appropriate tests
3. Run quality checks: `npm run type-check && npm run test`
4. Create pull request with clear description
5. Merge after review and CI passes

## License

This project is for personal use. See [LICENSE](LICENSE) for details.

## Support

- **Documentation**: Check the [docs/](docs/) directory
- **Issues**: Report bugs via [GitHub Issues](https://github.com/your-username/freee-receipt-automation/issues)
- **Troubleshooting**: See [troubleshooting guides](docs/troubleshooting/)

---

**Status**: Phase 1 Complete (Infrastructure) | Phase 2 In Planning (Core Features)  
**Last Updated**: 2024-06-19
