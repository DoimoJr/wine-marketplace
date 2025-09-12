# Wine Marketplace - Deployment Guide

## Overview

The Wine Marketplace is designed as a monorepo with **independent deployment** capabilities. Each application (API, Web, Admin) can be deployed separately while sharing common packages.

## Architecture

- **API**: NestJS backend (Port 3002)
- **Web**: Next.js customer frontend (Port 3000)  
- **Admin**: Next.js admin dashboard (Port 3001)
- **Database**: PostgreSQL
- **Shared Packages**: Types, UI components, utilities

## Deployment Methods

### 1. Render (Recommended)

The project includes a `render.yaml` configuration for deploying all services:

```bash
# Deploy all services to Render
git push origin main
```

Services will be available at:
- API: `https://wine-marketplace-api.onrender.com`
- Web: `https://wine-marketplace-web.onrender.com`
- Admin: `https://wine-marketplace-admin.onrender.com`

### 2. Docker (Local/Manual)

Each app has its own Dockerfile for containerized deployment:

```bash
# Build and run API
cd apps/api
pnpm docker:build
pnpm docker:run

# Build and run Web
cd apps/web  
pnpm docker:build
pnpm docker:run

# Build and run Admin
cd apps/admin
pnpm docker:build
pnpm docker:run
```

### 3. Manual Deployment

Each app can be built and deployed independently:

```bash
# Build shared packages first
pnpm --filter shared build
pnpm --filter database build
pnpm --filter ui build

# Build and start API
pnpm --filter api build:prod
pnpm --filter api start:prod

# Build and start Web
pnpm --filter web build:prod  
pnpm --filter web start:prod

# Build and start Admin
pnpm --filter admin build:prod
pnpm --filter admin start:prod
```

## Environment Variables

### API Required Variables
```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
WEB_URL=https://your-web-domain.com
ADMIN_URL=https://your-admin-domain.com
NODE_ENV=production
PORT=3002
```

### Web App Required Variables
```env
API_BASE_URL=https://your-api-domain.com
NEXTAUTH_URL=https://your-web-domain.com
NEXTAUTH_SECRET=your-nextauth-secret
NODE_ENV=production
```

### Admin App Required Variables
```env
API_BASE_URL=https://your-api-domain.com
NEXTAUTH_URL=https://your-admin-domain.com  
NEXTAUTH_SECRET=your-nextauth-secret
NODE_ENV=production
```

## Health Checks

Each service provides a health check endpoint:

- API: `GET /health`
- Web: `GET /health` 
- Admin: `GET /health`

## Database Migrations

Run database migrations before deploying:

```bash
pnpm --filter database db:migrate
```

## Monitoring

All services include:
- Health check endpoints
- Structured logging
- Error handling
- Performance monitoring ready

## Scaling

Each service can be scaled independently:
- API: Scale based on request volume
- Web: Scale based on user traffic
- Admin: Usually requires minimal scaling
- Database: Scale vertically or use read replicas

## Troubleshooting

### Build Issues
- Ensure shared packages are built first
- Check Node.js version compatibility (18+)
- Verify environment variables

### Runtime Issues  
- Check health endpoints
- Review application logs
- Verify database connectivity
- Confirm environment variables

### Network Issues
- Verify CORS settings in API
- Check API_BASE_URL in frontend apps
- Confirm SSL/HTTPS configuration