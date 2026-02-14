# NEXORA Developer Quick Start

Get up and running with NEXORA in 5 minutes.

## Prerequisites

- Node.js 20+ 
- npm 10+
- Git
- PostgreSQL (or use Neon)

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/kellyworkos00-droid/NEXORA.git
cd NEXORA
npm install
```

### 2. Configure Database

Create `.env` in the root:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/nexora
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=30d
```

### 3. Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Create tables
npm run db:push

# Seed demo data
npm run db:seed
```

### 4. Start Development

```bash
# Terminal 1: Frontend
cd apps/web
npm run dev
# Opens http://localhost:3000

# Terminal 2: API Gateway
cd services/api-gateway
npm run dev
# Runs on http://localhost:4000

# Terminal 3: Auth Service
cd services/auth-service
npm run dev
# Runs on http://localhost:5001

# Terminal 4: CRM Service
cd services/crm-service
npm run dev
# Runs on http://localhost:5002

# Terminal 5: AI Engine
cd services/ai-engine
npm run dev
# Runs on http://localhost:5003
```

Or use Docker:

```bash
docker-compose up
```

## Demo Credentials

```
Email: admin@demo.nexora.ai
Password: Demo123!
```

## Key Endpoints

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Web UI |
| API Gateway | http://localhost:4000 | API proxy |
| Auth | http://localhost:5001 | Authentication |
| CRM | http://localhost:5002 | Customer data |
| AI Engine | http://localhost:5003 | Predictions |

## Common Commands

```bash
# Build all packages
npm run build

# Type checking
npm run typecheck

# Linting
npm run lint

# Run tests
npm run test

# View database
npm run db:studio

# Create database migration
npm run db:migrate

# Clean all builds
npm run clean
```

## Project Structure

```
nexora/
├── apps/
│   └── web/              # Next.js frontend
├── services/
│   ├── auth-service/     # JWT authentication
│   ├── crm-service/      # Customer management
│   ├── api-gateway/      # API routing
│   └── ai-engine/        # ML predictions
├── database/
│   ├── schema.prisma     # Data models
│   └── seed.ts           # Demo data
├── packages/
│   └── types/            # Shared TypeScript types
└── docs/
    ├── API.md            # API documentation
    └── DEPLOYMENT_GUIDE.md
```

## Development Workflow

### Adding a Feature

1. Create feature branch:
```bash
git checkout -b feature/my-feature
```

2. Make changes (frontend, backend, or database):
```bash
# Add types to packages/types
# Update schema in database/
# Add endpoints in services/
# Update UI in apps/web/
```

3. Verify everything works:
```bash
npm run typecheck
npm run build
```

4. Push and create PR:
```bash
git push origin feature/my-feature
# Create PR on GitHub
```

### Database Changes

1. Update `database/schema.prisma`
2. Create migration:
```bash
cd database
npm run db:migrate
```
3. Test changes locally
4. Commit both schema and migration files

## Testing

```bash
# Run all tests
npm run test

# Run tests for specific package
cd services/crm-service
npm run test

# Run with coverage
npm run test:coverage
```

## Debugging

### Frontend Debugging

1. Open browser DevTools (F12)
2. Set breakpoints in Sources tab
3. Use React DevTools extension

### Backend Debugging

```bash
# Start with Node debugger
node --inspect-brk ./dist/index.js

# Open chrome://inspect in Chrome
```

### Database Queries

```bash
# View live database
npm run db:studio

# This opens Prisma Studio at http://localhost:5555
```

## Performance Tips

1. **Frontend**: Use React.lazy for code splitting
2. **Database**: Add indexes to frequently queried fields
3. **API**: Cache responses with Redis
4. **Build**: Use Turbo for monorepo caching

## Environment Variables Reference

### Frontend (`apps/web/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_AUTH_URL=http://localhost:5001
```

### Services (`.env`)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
LOG_LEVEL=debug
NODE_ENV=development
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :3000
# Kill it
kill -9 <PID>
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
psql -U postgres
# Or use Neon: Update DATABASE_URL in .env
```

### TypeScript Errors
```bash
# Regenerate Prisma types
npm run db:generate
# Rebuild project
npm run build
```

### Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Useful Links

- 📚 [API Documentation](./API.md)
- 🚀 [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- 📋 [Project Status](./PROJECT_STATUS.md)
- 🔧 [Contributing Guide](./CONTRIBUTING.md)

## Need Help?

- Check [issues](https://github.com/kellyworkos00-droid/NEXORA/issues)
- Read [documentation](./docs)
- Start a [discussion](https://github.com/kellyworkos00-droid/NEXORA/discussions)

---

**Happy coding! 🎉**
