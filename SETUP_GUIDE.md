# 🚀 NEXORA Development Setup Guide

Complete guide to get NEXORA running on your local machine in under 10 minutes.

---

## 📋 Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **npm** 10+ (comes with Node.js)
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop/))
- **Git** ([Download](https://git-scm.com/))

Optional but recommended:
- **VS Code** with extensions: ESLint, Prettier, Docker
- **Postman** or **Insomnia** for API testing

---

## 🛠️ Installation Steps

### Step 1: Clone & Setup

```bash
# Navigate to your project directory
cd c:\Users\USER\Desktop\dope

# Install root dependencies
npm install

# Install dependencies for all workspaces
npm run install:all
```

Or manually install for each service:

```bash
# Frontend
cd apps/web
npm install

# API Gateway
cd ../../services/api-gateway
npm install

# Auth Service
cd ../auth-service
npm install

# CRM Service
cd ../crm-service
npm install

# AI Engine
cd ../ai-engine
npm install

# Database
cd ../../database
npm install
```

### Step 2: Environment Configuration

```bash
# Copy the environment template
cp .env.example .env

# Edit .env with your configuration
notepad .env
```

**Minimum required configuration:**

```env
# Database
DATABASE_URL=postgresql://nexora:password@localhost:5432/nexora

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your-super-secret-key-here-change-me

# API URLs
API_GATEWAY_URL=http://localhost:4000
AUTH_SERVICE_URL=http://localhost:4001
AI_ENGINE_URL=http://localhost:4002
CRM_SERVICE_URL=http://localhost:4003

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:4000

# AI (Optional - for AI features)
OPENAI_API_KEY=sk-your-key-here
```

### Step 3: Start Infrastructure with Docker

```bash
# Start PostgreSQL, Redis, and all services
docker-compose up -d

# Check running containers
docker ps

# View logs
docker-compose logs -f
```

Expected containers:
- `nexora-postgres` (Port 5432)
- `nexora-redis` (Port 6379)
- `nexora-api-gateway` (Port 4000)
- `nexora-auth` (Port 4001)
- `nexora-ai` (Port 4002)
- `nexora-crm` (Port 4003)
- `nexora-web` (Port 3000)

### Step 4: Database Setup

```bash
# Navigate to database directory
cd database

# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed demo data
npm run db:seed

# (Optional) Open Prisma Studio
npm run db:studio
```

**Demo credentials after seeding:**
- Email: `admin@demo.nexora.ai`
- Password: `Demo123!`

### Step 5: Start Development Servers

**Option A: Using Docker Compose (Recommended)**
```bash
# Already running from Step 3
# Services auto-restart on code changes
```

**Option B: Manual Start (for development)**
```bash
# Terminal 1 - Frontend
cd apps/web
npm run dev

# Terminal 2 - API Gateway
cd services/api-gateway
npm run dev

# Terminal 3 - Auth Service
cd services/auth-service
npm run dev

# Terminal 4 - CRM Service
cd services/crm-service
npm run dev

# Terminal 5 - AI Engine
cd services/ai-engine
npm run dev
```

**Option C: Turborepo (all at once)**
```bash
# From root directory
npm run dev
```

### Step 6: Verify Installation

Open your browser and test:

1. **Frontend:** http://localhost:3000
   - Should see the landing page
   
2. **API Gateway Health:** http://localhost:4000/health
   - Should return `{ "status": "healthy" }`

3. **Auth Service Health:** http://localhost:4001/health
   - Should return `{ "status": "healthy" }`

4. **CRM Service Health:** http://localhost:4003/health
   - Should return `{ "status": "healthy" }`

5. **AI Engine Health:** http://localhost:4002/health
   - Should return `{ "status": "healthy" }`

6. **Prisma Studio:** http://localhost:5555
   - Database GUI

---

## 🧪 Testing the Application

### Test Registration

1. Go to http://localhost:3000/register
2. Fill in the form:
   - **Name:** Your Name
   - **Email:** you@example.com
   - **Company:** Your Company
   - **Subdomain:** yourcompany (will be yourcompany.nexora.ai)
   - **Password:** Password123!
3. Click "Create account"
4. You should be redirected to the dashboard

### Test Login

1. Go to http://localhost:3000/login
2. Use demo credentials:
   - **Email:** admin@demo.nexora.ai
   - **Password:** Demo123!
3. Click "Sign in"
4. You should see the dashboard with sample data

### Test API with Postman

**1. Register User**
```http
POST http://localhost:4000/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!",
  "name": "Test User",
  "tenantName": "Test Company",
  "subdomain": "testcompany"
}
```

**2. Login**
```http
POST http://localhost:4000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!"
}
```

Save the `accessToken` from the response.

**3. Get Customers**
```http
GET http://localhost:4000/api/crm/customers
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

**4. Create Customer**
```http
POST http://localhost:4000/api/crm/customers
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
Content-Type: application/json

{
  "name": "New Customer",
  "email": "customer@example.com",
  "company": "Customer Corp",
  "status": "lead",
  "tags": ["new", "tech"]
}
```

---

## 🐛 Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```bash
# Windows - Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change ports in .env
FRONTEND_PORT=3001
API_GATEWAY_PORT=4010
```

### Database Connection Failed

```bash
# Check if PostgreSQL is running
docker ps | findstr postgres

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Cannot Connect to Services

```bash
# Check all services status
docker-compose ps

# Restart all services
docker-compose restart

# Rebuild containers
docker-compose up -d --build
```

### Prisma Errors

```bash
# Regenerate Prisma Client
cd database
npm run db:generate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
npm run db:seed
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules
rm package-lock.json
npm install

# Or for specific service
cd services/auth-service
rm -rf node_modules
npm install
```

---

## 📁 Project Structure Reference

```
dope/
├── apps/
│   └── web/                    # Next.js frontend (Port 3000)
│       ├── src/app/           # Pages
│       └── src/components/    # React components
│
├── services/
│   ├── api-gateway/           # Port 4000 - Main API entry
│   ├── auth-service/          # Port 4001 - Authentication
│   ├── crm-service/           # Port 4003 - CRM operations
│   └── ai-engine/             # Port 4002 - AI predictions
│
├── database/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Demo data
│   └── init.sql               # SQL initialization
│
├── .env                        # Your configuration (create this)
├── .env.example               # Template
└── docker-compose.yml         # Docker orchestration
```

---

## 🔥 Quick Commands Reference

```bash
# Start everything
docker-compose up -d

# Stop everything
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Rebuild and restart
docker-compose up -d --build

# Database migrations
cd database && npm run db:migrate

# Seed data
cd database && npm run db:seed

# Prisma Studio
cd database && npm run db:studio

# Development mode (all services)
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Build all
npm run build
```

---

## 🎯 What's Next?

After successful setup, you can:

1. **Explore the Dashboard**
   - View customers at `/dashboard/customers`
   - Manage deals at `/dashboard/deals`
   - Check activities and analytics

2. **Read the Documentation**
   - Architecture: `docs/ARCHITECTURE.md`
   - API Reference: `docs/API.md`
   - AI Engine: `docs/AI_ENGINE.md`

3. **Start Development**
   - See `docs/CONTRIBUTING.md` for guidelines
   - Check `PROJECT_STATUS.md` for pending features

4. **Configure AI Features**
   - Get OpenAI API key from https://platform.openai.com
   - Set up Pinecone vector database
   - Enable AI predictions in the dashboard

---

## 🆘 Need Help?

- **Documentation:** Check the `docs/` folder
- **Status:** See `PROJECT_STATUS.md` for current state
- **Issues:** Common problems listed in Troubleshooting section above

---

## ✅ Installation Checklist

- [ ] Node.js 20+ installed
- [ ] Docker Desktop running
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created and configured
- [ ] Docker containers running (`docker-compose up -d`)
- [ ] Database migrated (`npm run db:migrate`)
- [ ] Database seeded (`npm run db:seed`)
- [ ] Frontend accessible at http://localhost:3000
- [ ] API Gateway health check passes
- [ ] Can login with demo credentials
- [ ] Dashboard loads with sample data

When all boxes are checked, you're ready to develop! 🎉

---

**Happy Coding!** 🚀
