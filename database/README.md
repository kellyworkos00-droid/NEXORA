# Database Setup Guide

This directory contains the Prisma schema and migrations for NEXORA.

## Quick Start

```bash
# Install dependencies
cd database
npm install

# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed demo data
npm run db:seed

# Open Prisma Studio (Database GUI)
npm run db:studio
```

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://nexora:password@localhost:5432/nexora"
```

## Database Schema

The database includes:

- **Tenants**: Multi-tenant isolation
- **Users**: Authentication and user management
- **RefreshTokens**: JWT refresh token storage
- **Customers**: CRM customer records
- **Deals**: Sales pipeline management
- **Activities**: Tasks, calls, meetings, notes

## Migrations

```bash
# Create a new migration
npm run db:migrate

# Deploy to production
npm run db:migrate:prod

# Push schema without migration (dev only)
npm run db:push
```

## Seed Data

The seed script creates:
- Demo tenant (demo.nexora.ai)
- Admin user (admin@demo.nexora.ai / Demo123!)
- 3 sample customers
- 3 sample deals
- 3 sample activities

## Prisma Studio

Access the visual database editor:

```bash
npm run db:studio
```

Opens at: http://localhost:5555
