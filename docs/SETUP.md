# 🚀 Development Setup Guide

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** 20.x or higher
- **npm** 10.x or higher
- **PostgreSQL** 15.x or higher
- **Redis** 7.x or higher
- **Docker** (optional, for containerized development)
- **Git**

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/nexora.git
cd nexora
```

### 2. Install Dependencies

```bash
# Install all workspace dependencies
npm install
```

### 3. Set Up Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env and add your configuration
# Required: DATABASE_URL, JWT_SECRET, OPENAI_API_KEY (optional for local dev)
```

### 4. Database Setup

#### Option A: Local PostgreSQL
```bash
# Create database
createdb nexora

# Run migrations (coming soon)
# npm run db:migrate
```

#### Option B: Docker
```bash
# Start PostgreSQL and Redis via Docker
docker-compose up postgres redis -d

# Database will be available at postgresql://nexora:password@localhost:5432/nexora
```

### 5. Start Development Servers

#### Option A: All Services with Docker
```bash
# Start all services (Recommended for full-stack development)
docker-compose up
```

Services will be available at:
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:4000
- **Auth Service**: http://localhost:4001
- **AI Engine**: http://localhost:4002

#### Option B: Individual Services (for focused development)

Terminal 1 - Frontend:
```bash
npm run dev:web
```

Terminal 2 - API Gateway:
```bash
cd services/api-gateway
npm install
npm run dev
```

Terminal 3 - AI Engine:
```bash
cd services/ai-engine
npm install
npm run dev
```

### 6. Access the Application

Open your browser and navigate to:
- **Landing Page**: http://localhost:3000
- **Health Check**: http://localhost:4000/health

## Project Structure

```
nexora/
├── apps/
│   ├── web/                 # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/         # App Router pages
│   │   │   ├── components/  # React components
│   │   │   ├── lib/         # Utilities
│   │   │   └── styles/      # Global styles
│   │   └── package.json
│   └── admin/              # Admin dashboard (future)
│
├── services/
│   ├── api-gateway/        # API Gateway
│   ├── auth-service/       # Authentication
│   ├── crm-service/        # CRM module
│   ├── erp-service/        # ERP module
│   ├── ai-engine/          # AI/ML service
│   ├── analytics/          # Analytics service
│   └── marketplace/        # Plugin marketplace
│
├── packages/
│   ├── types/              # Shared TypeScript types
│   ├── ui/                 # Shared UI components
│   ├── utils/              # Shared utilities
│   └── config/             # Shared configuration
│
├── infrastructure/
│   ├── kubernetes/         # K8s manifests
│   ├── terraform/          # IaC configs
│   └── docker/             # Docker configs
│
├── docs/                   # Documentation
├── .env.example            # Environment template
├── docker-compose.yml      # Docker services
├── package.json            # Root package.json
└── turbo.json             # Turborepo config
```

## Development Workflow

### Working on Frontend

```bash
cd apps/web
npm run dev

# The Next.js app will reload on file changes
```

### Working on Backend Services

```bash
cd services/ai-engine
npm run dev

# TypeScript will compile and watch for changes
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests for specific workspace
npm test --workspace=apps/web
```

### Code Quality

```bash
# Lint all code
npm run lint

# Type checking
npm run typecheck

# Format code
npm run format
```

## Common Tasks

### Adding a New Dependency

```bash
# Add to specific workspace
npm install axios --workspace=services/ai-engine

# Add to all workspaces
npm install lodash --workspaces
```

### Creating a New Service

1. Create directory in `services/`
2. Initialize with `package.json`
3. Add to `package.json` workspaces
4. Create basic Express server
5. Add to `docker-compose.yml`
6. Update API Gateway routes

### Database Migrations

```bash
# Coming soon
npm run db:migrate
npm run db:rollback
npm run db:seed
```

## Environment Variables

### Required Variables

```bash
# Application
NODE_ENV=development
APP_URL=http://localhost:3000
API_URL=http://localhost:4000

# Database
DATABASE_URL=postgresql://nexora:password@localhost:5432/nexora

# Redis
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```

### Optional Variables (for AI features)

```bash
# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview

# Vector Database
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=...
```

## Troubleshooting

### Port Already in Use

```bash
# Find and kill process on port
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready

# Check connection string
psql postgresql://nexora:password@localhost:5432/nexora
```

### Docker Issues

```bash
# Reset Docker containers
docker-compose down -v
docker-compose up --build

# View logs
docker-compose logs -f
```

### Node Modules Issues

```bash
# Clean install
rm -rf node_modules
rm package-lock.json
npm install

# Or with Docker
docker-compose down
docker-compose build --no-cache
docker-compose up
```

## IDE Setup

### VS Code (Recommended)

Install recommended extensions:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)
- Docker
- GitLens

### Settings

Create `.vscode/settings.json`:
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Next Steps

1. **Configure your database schema** (see `docs/DATABASE.md`)
2. **Set up authentication** (see `docs/AUTH.md`)
3. **Explore the AI Engine** (see `docs/AI_ENGINE.md`)
4. **Read the architecture docs** (see `docs/ARCHITECTURE.md`)

## Getting Help

- **Documentation**: Check `/docs` folder
- **Issues**: Create GitHub issue
- **Community**: Join our Discord (coming soon)
- **Email**: support@nexora.ai

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

---

**Happy coding! 🚀**
