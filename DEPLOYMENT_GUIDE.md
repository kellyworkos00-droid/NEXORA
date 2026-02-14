# NEXORA Deployment Guide

Complete guide for deploying and managing NEXORA in production.

## Table of Contents

1. [Pre-deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Vercel Deployment](#vercel-deployment)
4. [Database Setup](#database-setup)
5. [Backend Services](#backend-services)
6. [Monitoring & Scaling](#monitoring--scaling)
7. [Troubleshooting](#troubleshooting)

## Pre-deployment Checklist

- [ ] All TypeScript errors resolved (`npm run typecheck`)
- [ ] Production build successful (`npm run build`)
- [ ] Environment variables configured in `.env.production`
- [ ] Database backups created
- [ ] Security audit completed
- [ ] SSL certificates configured
- [ ] Domain DNS records updated
- [ ] CI/CD pipeline configured

## Environment Configuration

### Required Environment Variables

Create `.env.production` with:

```env
# Database
DATABASE_URL=postgresql://user:password@host/neondb?sslmode=require

# Authentication
JWT_SECRET=<strong-random-secret>
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=<strong-random-secret>
REFRESH_TOKEN_EXPIRES_IN=30d

# Services
AUTH_SERVICE_URL=https://auth.nexora.ai
CRM_SERVICE_URL=https://crm.nexora.ai
AI_ENGINE_URL=https://ai.nexora.ai
API_GATEWAY_URL=https://api.nexora.ai

# Frontend
NEXT_PUBLIC_API_URL=https://api.nexora.ai/v1
NEXT_PUBLIC_AUTH_URL=https://auth.nexora.ai

# OAuth (if implementing)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Email Service
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key

# Monitoring
SENTRY_DSN=your-sentry-dsn
DATADOG_API_KEY=your-datadog-key

# Feature Flags
ENABLE_AI_PREDICTIONS=true
ENABLE_ANALYTICS=true
ENABLE_WEBHOOKS=false
```

## Vercel Deployment

### 1. Connect GitHub Repository

```bash
# Already connected:
# Repository: https://github.com/kellyworkos00-droid/NEXORA.git
# Branch: main
```

### 2. Configure Project Settings

In Vercel Dashboard:

**Project Settings → Build & Development:**
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

**Project Settings → Environment Variables:**
- Add all variables from `.env.production`

### 3. Configure Root Directory

Since this is a monorepo:
- Root Directory: Leave empty
- Vercel will auto-detect the Next.js app in `/apps/web`

### 4. Deploy

```bash
# Automatic on push to main
git push origin main

# Or manual from Vercel CLI
vercel deploy --prod
```

### 5. Verify Deployment

```bash
# Check build logs in Vercel dashboard
# Visit: https://nexora.vercel.app
# Verify all pages load correctly
```

## Database Setup

### Initial Setup

```bash
# 1. Ensure DATABASE_URL is set
export DATABASE_URL="postgresql://..."

# 2. Generate Prisma client
npm run db:generate

# 3. Create database schema
npm run db:push

# 4. Seed with demo data
npm run db:seed
```

### Backups

Neon automatically handles:
- Daily backups (30-day retention)
- Point-in-time restore (up to 7 days from Neon console)
- Automated failover

### Production Database Branch

```bash
# Use Neon's main branch for production
# Configure in Vercel environment: DATABASE_URL for production

# For staging, create dev branch:
# DATABASE_URL_STAGING for staging environment
```

## Backend Services

### Option 1: Vercel with Serverless Functions

Backend services run as serverless functions in Vercel:

```
/services/auth-service → Vercel Function
/services/crm-service → Vercel Function
/services/api-gateway → Vercel Function
/services/ai-engine → Vercel Function
```

Configure in `vercel.json`:

```json
{
  "functions": {
    "services/auth-service/src/index.ts": {
      "maxDuration": 30,
      "memory": 3008
    },
    "services/crm-service/src/index.ts": {
      "maxDuration": 30,
      "memory": 3008
    }
  }
}
```

### Option 2: Docker Containers (Recommended for Production)

Deploy as container services:

```bash
# Build container
docker build -t nexora-auth-service ./services/auth-service
docker build -t nexora-crm-service ./services/crm-service

# Push to registry
docker push nexora-auth-service:latest

# Deploy (Railway, Render, or similar)
# Services auto-configure via environment variables
```

### Health Checks

Each service exposes health check endpoint:

```bash
# Check service status
curl http://localhost:5001/health
curl http://localhost:5002/health
curl http://localhost:5003/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-02-14T15:30:00Z",
  "version": "0.1.0"
}
```

## Monitoring & Scaling

### Vercel Analytics

Enable in `package.json`:

```json
{
  "dependencies": {
    "@vercel/analytics": "^1.0.0"
  }
}
```

### Error Tracking

Integrate with Sentry:

```bash
npm install @sentry/nextjs

# Configure in next.config.js
# See .sentry-nextjs.rc
```

### Performance Monitoring

Track with Web Vitals:
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)

Dashboard at `/api/metrics`

### Scaling Strategy

1. **Frontend (Vercel)**
   - Automatic scaling (no config needed)
   - Edge caching via Vercel CDN
   - Unlimited concurrent requests

2. **Database (Neon)**
   - Auto-scaling compute
   - Connection pooling (up to 100 connections)
   - Read replicas for scaling reads

3. **Backend Services**
   - Horizontal scaling via containers
   - Load balancing via gateway service
   - Queue system for async tasks

## Database Migration

### Schema Updates

```bash
# 1. Make changes to schema.prisma
# 2. Create migration
npm run db:migrate

# 3. Review generated SQL
# 4. Deploy
npm run db:migrate:prod
```

### Zero-Downtime Migrations

For production:

1. Add new columns as nullable
2. Deploy backend to handle both
3. Backfill existing data
4. Add constraints
5. Remove old columns (future migration)

## Troubleshooting

### Build Failures

**"Cannot find module"**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**TypeScript errors**
```bash
npm run typecheck
# Fix errors shown
```

**Missing environment variables**
```bash
# Check Vercel project settings
vercel env ls

# Add missing variables
vercel env add VARIABLE_NAME
```

### Database Connection Issues

```bash
# Test connection
npx prisma db execute --stdin < test.sql

# Check connection pool
# Neon Dashboard → Monitoring → Connections
```

### Performance Issues

1. Check Vercel Analytics
2. Review database query performance
3. Monitor API response times
4. Check service logs

## Rollback Plan

### If Deployment Fails

```bash
# Revert to previous commit
git revert <commit-hash>
git push origin main

# Vercel will auto-rebuild from new commit
```

### Database Rollback

```bash
# From Neon Dashboard:
# 1. Go to Branches
# 2. Select Point-in-Time Recovery
# 3. Choose restore point
# 4. Confirm
```

## Post-Deployment

### 1. Verify All Services

```bash
# Check frontend
curl https://nexora.vercel.app/

# Check API
curl https://api.nexora.ai/health

# Check auth
curl https://auth.nexora.ai/health
```

### 2. Run Security Audit

```bash
npm audit
# Address any vulnerabilities
```

### 3. Set Up Monitoring

- [ ] Sentry alerts configured
- [ ] Uptime monitoring enabled
- [ ] Performance tracking active
- [ ] Error notifications working

### 4. Database Backups

- [ ] Backup schedule verified
- [ ] Point-in-time recovery tested
- [ ] Backup restoration documented

### 5. Notify Stakeholders

- [ ] Status page updated
- [ ] Team notified of deployment
- [ ] Changelog updated
- [ ] Documentation published

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Neon Docs**: https://neon.tech/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Prisma Migration**: https://www.prisma.io/docs/orm/prisma-migrate/
- **Docker**: https://docs.docker.com/
