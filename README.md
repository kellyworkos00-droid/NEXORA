# 🚀 NEXORA - The AI Business Operating System

> **"The AI Business Operating System"** - Not just CRM. Not just ERP. Not just automation. A self-learning AI-driven business brain.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](./LICENSE)

---

## 📖 Table of Contents

- [Vision](#-vision)
- [What Makes NEXORA Better](#-what-makes-nexora-better)
- [Current Status](#-current-status)
- [Quick Start](#-quick-start)
- [Demo Access](#-demo-access)
- [Technology Stack](#-technology-stack)
- [Revenue Model](#-revenue-model)
- [Architecture](#-architecture)
- [Documentation](#-documentation)
- [Contributing](#-contributing)

---

## 🌟 Vision

Unlike Salesforce, HubSpot, Zoho, or Odoo - NEXORA is built AI-native from the ground up. It's modular, affordable, developer-friendly, and ecosystem-powered.

### The Problem
- Salesforce: Expensive, complex, AI as afterthought
- HubSpot: Marketing-focused, limited ERP
- Zoho/Odoo: Broad but clunky, poor AI
- All: Closed ecosystems, no real developer marketplace

### The Solution: NEXORA
A unified AI-native platform that learns from your business and grows with you.

---

## 🎯 What Makes NEXORA Better

### 1️⃣ AI Core (Not AI Add-on)
- 🔮 Predicts revenue and churn risk
- 💰 Suggests pricing adjustments
- 👥 Recommends hiring timing
- 🤖 Automates sales follow-ups
- 📊 Auto-generates reports and dashboards

### 2️⃣ Modular Micro-App Architecture
- 📇 CRM, 💼 Accounting, 👤 HR, 🏪 POS, 📦 Inventory, 📢 Marketing
- 🤖 AI Assistant, ⚡ Workflow Automation
- 🌐 Customer & Vendor Portals
- ✅ Activate only what you need

### 3️⃣ Built-in Marketplace
- 🔌 Third-party plugins and templates
- 🤖 AI agents marketplace
- 💵 Revenue share model (Shopify/App Store style)

### 4️⃣ Multi-Tenant White Label
- 🏢 Sub-domains and white-labeling
- 💼 Resell to clients
- 🎨 Industry-specific SaaS versions

### 5️⃣ Predictive Decision Engine
- *"You will run out of stock in 8 days"*
- *"You are underpricing by 12%"*
- *"This client has 78% chance of not paying"*
- *"Hire 1 salesperson in Q3 to maximize growth"*

---

## ✅ Current Status

**Version:** 0.1.0 (Development)  
**Last Updated:** February 2024

### Completed ✨
- ✅ Complete monorepo structure (Turborepo)
- ✅ Full landing page with animations
- ✅ Dashboard UI with sidebar navigation
- ✅ Customer list view with search & filters
- ✅ Deal pipeline (Kanban drag-and-drop)
- ✅ Authentication pages (login & register)
- ✅ API Gateway with rate limiting
- ✅ Authentication Service (JWT, bcrypt)
- ✅ CRM Service (customers, deals, activities)
- ✅ AI Engine with 8 prediction endpoints
- ✅ Prisma ORM with PostgreSQL
- ✅ Docker configurations
- ✅ Comprehensive documentation

### In Progress 🚧
- Database migrations & seeding
- Real ML model integration
- OAuth integration (Google, GitHub)
- Email verification

### Coming Soon 🔮
- ERP Service
- Analytics Service
- Marketplace Service
- Real-time notifications
- Mobile app

**[View Full Project Status →](./PROJECT_STATUS.md)**

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker Desktop
- Git

### Installation (5 minutes)

```bash
# 1. Navigate to project directory
cd c:\Users\USER\Desktop\dope

# 2. Install dependencies
npm install

# 3. Start services with Docker
docker-compose up -d

# 4. Setup database
cd database
npm install
npm run db:generate
npm run db:migrate
npm run db:seed

# 5. Access the app
# Frontend: http://localhost:3000
# API: http://localhost:4000
```

**[Detailed Setup Guide →](./SETUP_GUIDE.md)**

---

## 🎮 Demo Access

After seeding the database, use these credentials:

- **Email:** `admin@demo.nexora.ai`
- **Password:** `Demo123!`

### Demo Data Includes:
- ✅ 1 Demo tenant (Demo Corporation)
- ✅ 1 Admin user
- ✅ 3 Sample customers
- ✅ 3 Sample deals ($180K pipeline)
- ✅ 3 Sample activities

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **PWA**: Enabled for mobile experience

### Backend
- **Runtime**: Node.js + TypeScript
- **Architecture**: Microservices (event-driven)
- **API**: GraphQL + REST

### Database
- **Core Data**: PostgreSQL
- **Caching**: Redis
- **AI Memory**: Vector DB (Pinecone/Weaviate)

### Cloud & DevOps
- **Hosting**: AWS/GCP
- **Orchestration**: Kubernetes
- **Serverless**: AI triggers via Lambda/Cloud Functions

### Security
- Role-based access control (RBAC)
- Multi-tenant isolation
- End-to-end encryption
- SOC 2 compliance ready

## 📁 Project Structure

```
nexora/
├── apps/
│   ├── web/              # Next.js frontend (landing + app)
│   ├── admin/            # Admin dashboard
│   └── mobile/           # React Native (future)
├── services/
│   ├── api-gateway/      # API Gateway
│   ├── auth-service/     # Authentication & Authorization
│   ├── crm-service/      # CRM module
│   ├── erp-service/      # ERP module
│   ├── ai-engine/        # AI Core & ML models
│   ├── analytics/        # Analytics & Reporting
│   ├── marketplace/      # Plugin marketplace
│   └── automation/       # Workflow automation
├── packages/
│   ├── ui/               # Shared UI components
│   ├── types/            # TypeScript types
│   ├── utils/            # Shared utilities
│   └── config/           # Shared configuration
├── infrastructure/
│   ├── kubernetes/       # K8s configs
│   ├── terraform/        # Infrastructure as Code
│   └── docker/           # Docker configs
└── docs/                 # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Docker (optional)

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/nexora.git
cd nexora

# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Run development servers
npm run dev
```

### Development

```bash
# Frontend (Next.js)
npm run dev:web

# Backend services
npm run dev:services

# All services (with Docker)
docker-compose up
```

## 🗺️ 5-Year Roadmap

| Year | Focus |
|------|-------|
| **Year 1** | SME-focused, Africa + emerging markets |
| **Year 2** | Industry-specific templates |
| **Year 3** | AI business analytics dominance |
| **Year 4** | Marketplace ecosystem expansion |
| **Year 5** | IPO or major acquisition |

## 📊 Target Market

### Primary
- Small to Medium Enterprises (SMEs)
- Startups scaling operations
- Emerging markets (Africa, Southeast Asia, LatAm)

### Secondary
- Enterprise clients needing customization
- Industry-specific verticals (Construction, Healthcare, Retail)

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

Proprietary - All rights reserved

## 🔗 Links

- **Website**: https://nexora.ai
- **Documentation**: https://docs.nexora.ai
- **Status**: https://status.nexora.ai
- **Community**: https://community.nexora.ai

---

**Built with ❤️ by the NEXORA Team**
