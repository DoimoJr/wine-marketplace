# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **wine marketplace monorepo** - a Vinted-style platform for buying and selling wines. Built with modern TypeScript stack using pnpm workspaces for independent deployment of backend and frontend applications.

## Architecture

### Monorepo Structure
- **Apps**: Deployable applications (`apps/`)
  - `api/` - NestJS REST API with PostgreSQL/Prisma 
  - `web/` - Next.js customer frontend
  - `admin/` - Next.js admin dashboard
- **Packages**: Shared libraries (`packages/`)
  - `database/` - Prisma client and schema
  - `shared/` - TypeScript types, utilities, constants
  - `ui/` - Reusable React components with Tailwind

### Key Technologies
- **Backend**: NestJS with class-validator DTO pattern
- **Database**: PostgreSQL with Prisma ORM (designed for Neon)
- **Frontend**: Next.js with NextAuth for authentication
- **Deployment**: Apps deploy independently to Render

## Common Commands

### Development
```bash
# Start all apps in development mode
pnpm dev

# Start individual apps
pnpm --filter api dev        # NestJS API on :3002
pnpm --filter web dev        # Next.js web on :3000  
pnpm --filter admin dev      # Next.js admin on :3001
```

### Database Operations
```bash
# Generate Prisma client after schema changes
pnpm db:generate

# Push schema changes to database
pnpm db:push

# Create and apply migrations
pnpm db:migrate

# Seed database with sample data
pnpm --filter database db:seed

# Open Prisma Studio
pnpm --filter database db:studio
```

### Build & Quality
```bash
# Build all packages and apps
pnpm build

# Run linting across monorepo
pnpm lint

# Type checking across monorepo  
pnpm type-check

# Clean all build artifacts
pnpm clean
```

### Testing
```bash
# API tests
pnpm --filter api test
pnpm --filter api test:watch
pnpm --filter api test:cov
```

## Architecture Patterns

### NestJS API Structure
- **Modular design**: Auth, Users, Wines, Orders, Messages, Admin modules
- **DTO validation**: All endpoints use class-validator DTOs for request/response
- **Guards & Decorators**: JWT authentication with role-based access control
- **Global services**: PrismaService available across all modules
- **Swagger docs**: Auto-generated at `/api/docs` in development

### Authentication Flow
- JWT tokens with refresh capability
- Google OAuth integration via Passport
- Role-based permissions (USER, ADMIN, SUPER_ADMIN)
- Public routes marked with `@Public()` decorator

### Database Design
- **Wine marketplace entities**: Users, Wines, Orders, Reviews, Messages
- **Advanced features**: Refund requests, admin logs, shipping addresses
- **Soft deletion**: Wines marked as INACTIVE rather than deleted
- **Audit trails**: CreatedAt/UpdatedAt timestamps on all entities

### Type Safety
- **End-to-end types**: Shared package ensures API contracts match frontend
- **Prisma integration**: Database types auto-generated and exported
- **Validation**: Runtime validation with class-validator matches TypeScript types

### Payment Integration
- PaymentService abstracts multiple providers (PayPal, Stripe, Escrow)
- Shipping label generation for automatic fulfillment
- Refund handling integrated with payment providers

## Environment Setup

The API expects these environment variables:
- `DATABASE_URL` - PostgreSQL connection string (Neon recommended)
- `JWT_SECRET` - Secret for JWT token signing
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - OAuth configuration
- `WEB_URL` / `ADMIN_URL` - Frontend URLs for CORS and redirects

## Development Notes

### Adding New Features
1. **Database changes**: Update `packages/database/prisma/schema.prisma`
2. **Types**: Add to appropriate file in `packages/shared/src/types/`
3. **API**: Create DTO, Service, Controller in relevant `apps/api/src/` module
4. **Frontend**: Consume via shared types for full type safety

### Package Dependencies
- Use `workspace:*` for internal package references
- Install dependencies in correct workspace: `pnpm --filter <package> add <dep>`
- Shared dependencies should go in root for consistency

### Code Quality
- ESLint/Prettier configured across monorepo
- TypeScript strict mode enabled
- All API endpoints require proper DTO validation
- Swagger documentation required for all public endpoints

## MCP Server Integration

This project has 5 configured MCP servers that should be used proactively:

### 🚨 ALWAYS Use MCP Servers When Possible
- **PostgreSQL MCP**: For database queries, schema analysis, data exploration
- **GitHub MCP**: For repository operations, issue management, PR creation  
- **Playwright MCP**: For web scraping, browser automation, screenshot capture
- **File System MCP**: For advanced file operations, bulk processing, search
- **Fetch MCP**: For HTTP requests, API testing, external data retrieval

### MCP Priority Guidelines
1. **Database tasks** → Use PostgreSQL MCP instead of manual queries
2. **Repository tasks** → Use GitHub MCP for issues, PRs, repo analysis  
3. **Web scraping/testing** → Use Playwright MCP for automation
4. **File operations** → Use File System MCP for complex file tasks
5. **API calls** → Use Fetch MCP for external requests

**Rule**: When multiple approaches exist, always prefer MCP server capabilities over basic tools.