# 🎯 NEXORA - Quick Reference Guide

## What is NEXORA?

**NEXORA** is the AI Business Operating System - an AI-native CRM, ERP, and business automation platform designed to replace Salesforce, HubSpot, Zoho, and Odoo with a modern, affordable, and intelligent solution.

## 🚀 Quick Start (5 Minutes)

```bash
# 1. Clone the repository
git clone https://github.com/your-org/nexora.git
cd nexora

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your configuration

# 4. Start with Docker (Recommended)
docker-compose up

# OR start individual services
npm run dev:web      # Frontend on :3000
cd services/api-gateway && npm run dev  # API on :4000
cd services/ai-engine && npm run dev    # AI on :4002
```

## 📂 Project Structure

```
nexora/
├── apps/web/              → Next.js frontend (Landing + App)
├── services/
│   ├── api-gateway/       → API Gateway (Express)
│   ├── ai-engine/         → AI/ML Service (OpenAI)
│   ├── auth-service/      → Authentication (JWT/OAuth)
│   ├── crm-service/       → CRM Module
│   └── erp-service/       → ERP Module
├── packages/
│   ├── types/             → Shared TypeScript types
│   └── ui/                → Shared UI components
└── docs/                  → Documentation
```

## 🎨 Key Features

### 1. AI Core
- Revenue prediction
- Churn risk detection
- Inventory forecasting
- Pricing optimization
- Hiring recommendations
- Automated insights

### 2. Modular Architecture
- Activate only what you need
- CRM, ERP, HR, POS, Inventory, Marketing
- Unified AI brain across modules

### 3. Built-in Marketplace
- Third-party plugins
- Industry templates
- AI agents
- Revenue sharing model

### 4. White Label
- Custom branding
- Sub-domains
- Reseller program

### 5. Predictive Engine
- "Stock runs out in 8 days"
- "Underpricing by 12%"
- "Client payment risk: 78%"

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, Tailwind, Framer Motion |
| **Backend** | Node.js, TypeScript, Express |
| **Database** | PostgreSQL, Redis, Vector DB |
| **AI/ML** | OpenAI GPT-4, LangChain |
| **DevOps** | Docker, Kubernetes, Terraform |
| **Cloud** | AWS / GCP |

## 📡 API Endpoints

### Authentication
```
POST /api/auth/register    → Register new user
POST /api/auth/login       → Login
POST /api/auth/refresh     → Refresh token
```

### AI Predictions
```
POST /api/ai/predictions/revenue    → Predict revenue
POST /api/ai/predictions/churn      → Detect churn risk
POST /api/ai/predictions/inventory  → Forecast inventory
POST /api/ai/predictions/pricing    → Optimize pricing
POST /api/ai/predictions/hiring     → Recommend hiring
```

### CRM
```
GET    /api/crm/customers           → List customers
POST   /api/crm/customers           → Create customer
PATCH  /api/crm/customers/:id       → Update customer
DELETE /api/crm/customers/:id       → Delete customer
```

### Deals
```
GET  /api/crm/deals                 → List deals
POST /api/crm/deals                 → Create deal
PATCH /api/crm/deals/:id/stage      → Update deal stage
```

## 🔧 Common Commands

```bash
# Development
npm run dev                # Start all services
npm run dev:web            # Frontend only
npm test                   # Run tests
npm run lint               # Lint code
npm run typecheck          # Type checking

# Docker
docker-compose up          # Start all services
docker-compose down        # Stop services
docker-compose logs -f     # View logs

# Database (coming soon)
npm run db:migrate         # Run migrations
npm run db:seed            # Seed database
```

## 📊 Architecture

```
Frontend (Next.js) → API Gateway → Microservices
                                   ├── Auth Service
                                   ├── AI Engine
                                   ├── CRM Service
                                   ├── ERP Service
                                   └── Analytics
                                          ↓
                                   PostgreSQL + Redis
```

## 💰 Revenue Model

| Plan | Price | Features |
|------|-------|----------|
| **Freemium** | $0 | 3 users, Basic CRM, 100 AI credits |
| **Growth** | $49/mo | 25 users, All modules, 1K AI credits |
| **Pro** | $149/mo | 100 users, AI predictions, API access |
| **Enterprise** | Custom | Unlimited, White-label, On-premise |

## 🎯 Development Roadmap

### Phase 1 (Current) - Foundation
- [x] Project structure
- [x] Landing page
- [x] AI Engine APIs
- [x] API Gateway
- [ ] Authentication
- [ ] Basic CRM

### Phase 2 - Core Features
- [ ] CRM module (customers, deals, activities)
- [ ] Analytics dashboard
- [ ] AI predictions (revenue, churn)
- [ ] Workflow automation

### Phase 3 - Marketplace
- [ ] Plugin system
- [ ] Marketplace UI
- [ ] Third-party integrations
- [ ] Revenue sharing

### Phase 4 - Scale
- [ ] Multi-tenant management
- [ ] White-label features
- [ ] Advanced AI (custom models)
- [ ] Mobile apps

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [README.md](./README.md) | Project overview |
| [SETUP.md](./docs/SETUP.md) | Development setup |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System architecture |
| [AI_ENGINE.md](./docs/AI_ENGINE.md) | AI capabilities |
| [API.md](./docs/API.md) | API documentation |
| [DATABASE.md](./docs/DATABASE.md) | Database schema |
| [DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Deployment guide |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## 🐛 Troubleshooting

### Port already in use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database connection issues
```bash
# Check PostgreSQL is running
pg_isready
psql postgresql://nexora:password@localhost:5432/nexora
```

### Docker issues
```bash
docker-compose down -v
docker-compose up --build
```

## 📞 Support

- **Documentation**: Check `/docs` folder
- **Issues**: [GitHub Issues](https://github.com/nexora/nexora/issues)
- **Email**: support@nexora.ai
- **Discord**: Coming soon
- **Twitter**: [@nexora_ai](https://twitter.com/nexora_ai)

## 🏆 Why NEXORA Wins

| Feature | Salesforce | HubSpot | Zoho | Odoo | **NEXORA** |
|---------|-----------|---------|------|------|------------|
| AI-Native | ❌ | ❌ | ❌ | ❌ | ✅ |
| Modern UI | ❌ | ✅ | ⚠️ | ❌ | ✅ |
| Affordable | ❌ | ⚠️ | ✅ | ✅ | ✅ |
| Modular | ⚠️ | ⚠️ | ✅ | ✅ | ✅ |
| White Label | ⚠️ | ❌ | ⚠️ | ❌ | ✅ |
| Marketplace | ✅ | ⚠️ | ⚠️ | ✅ | ✅ |
| Predictions | ❌ | ❌ | ❌ | ❌ | ✅ |

## 📜 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

**Built with ❤️ for businesses worldwide**  
**Version**: 0.1.0-alpha  
**Last Updated**: February 14, 2026

---

## 🚀 Ready to Start?

```bash
# Get started in 3 commands
git clone https://github.com/your-org/nexora.git
cd nexora && npm install
docker-compose up
```

**Then visit**: http://localhost:3000

🎉 **Welcome to NEXORA!**
