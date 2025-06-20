# ADR-001: Supabase Selection for Backend Infrastructure

## Status

**Accepted** - 2024-06-19

## Context

The freee Receipt Automation system requires a backend infrastructure to handle:

- User authentication and authorization
- Database for storing receipt data, transactions, and user settings
- Real-time capabilities for processing status updates
- File storage for receipt uploads
- API endpoints for business logic

As an individual automation project with AI-assisted development, the solution needs to be:

- Quick to set up and deploy
- Minimal maintenance overhead
- Cost-effective for personal use
- Integrates well with Next.js frontend

## Decision

We will use **Supabase** as our primary backend infrastructure.

## Rationale

### Pros of Supabase

#### Technical Advantages

- **PostgreSQL Foundation**: Mature, robust database with excellent TypeScript support
- **Real-time Subscriptions**: Built-in real-time capabilities for status updates
- **Row Level Security (RLS)**: Database-level security for multi-user data isolation
- **Auto-generated APIs**: RESTful and GraphQL APIs generated from schema
- **TypeScript Integration**: Automatic type generation from database schema

#### Development Efficiency

- **Zero Configuration**: No backend server setup required
- **Integrated Auth**: Built-in authentication with multiple providers
- **Storage Integration**: File storage with CDN capabilities
- **Dashboard UI**: Visual database management and monitoring
- **Migration Support**: Version-controlled schema changes

#### Project Fit

- **Individual Use**: Perfect for personal automation projects
- **AI Development**: Minimal complexity for AI-assisted development
- **Next.js Integration**: Excellent Next.js ecosystem support
- **Cost Structure**: Generous free tier, pay-as-you-scale

### Considered Alternatives

#### Firebase

- **Pros**: Google ecosystem, real-time database, generous free tier
- **Cons**: NoSQL limitations, less TypeScript support, vendor lock-in concerns
- **Decision**: Rejected due to NoSQL constraints for financial data

#### AWS Amplify

- **Pros**: Full AWS ecosystem, powerful scaling options
- **Cons**: Complex setup, higher learning curve, overkill for individual use
- **Decision**: Rejected due to complexity overhead

#### Custom Node.js + PostgreSQL

- **Pros**: Full control, no vendor lock-in
- **Cons**: Significant setup and maintenance overhead, slower development
- **Decision**: Rejected due to maintenance burden for individual project

#### PlanetScale + Next.js API Routes

- **Pros**: Excellent MySQL scaling, serverless-friendly
- **Cons**: Missing real-time features, requires custom auth implementation
- **Decision**: Rejected due to missing integrated features

## Implementation Details

### Database Schema

- Use PostgreSQL with TypeScript type generation
- Implement RLS for data isolation between users
- Design normalized schema for receipts, transactions, and user data

### Authentication

- Email/password authentication for simplicity
- Optional social providers (Google) for user convenience
- JWT-based session management

### API Strategy

- Use Supabase auto-generated APIs for basic CRUD operations
- Custom Next.js API routes for complex business logic
- Real-time subscriptions for processing status updates

### File Storage

- Supabase Storage for receipt file uploads
- Automatic image optimization and CDN delivery
- Secure file access with RLS integration

## Trade-offs

### Accepted Trade-offs

- **Vendor Lock-in**: Accepted for development speed and maintenance benefits
- **Limited Customization**: Some limitations in favor of convention over configuration
- **Cost Scaling**: May become expensive at very high scale (not relevant for personal use)

### Mitigations

- **Data Export**: Regular backups ensure data portability
- **Standard Technologies**: PostgreSQL and REST APIs reduce lock-in risk
- **Cost Monitoring**: Usage alerts to track costs as system grows

## Success Metrics

- **Development Speed**: Complete backend setup in < 1 day
- **Maintenance Overhead**: < 1 hour/month for backend maintenance
- **Performance**: < 200ms API response times for basic operations
- **Cost**: Stay within free tier for initial usage

## Consequences

### Positive

- Rapid development and deployment
- Built-in security best practices with RLS
- Automatic scaling without infrastructure management
- Strong TypeScript integration improves AI development efficiency

### Negative

- Dependency on external service for critical functionality
- Limited control over database optimization and configuration
- Potential cost increases with scale (mitigated by personal use case)

## Review Date

This decision will be reviewed in **6 months (2024-12-19)** or when:

- Usage approaches free tier limits
- Performance requirements exceed current capabilities
- Significant changes in alternatives landscape

---

**Participants**: Individual project (AI-assisted development)  
**Date**: 2024-06-19  
**Status**: Implemented and operational
