# 🗃️ Database Schema

## Overview

NEXORA uses **PostgreSQL** as the primary database with a multi-tenant architecture. Each tenant's data is isolated using a `tenant_id` column in all tables.

## Core Tables

### Users & Authentication

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar VARCHAR(500),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  email_verified BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT check_role CHECK (role IN ('super_admin', 'admin', 'manager', 'user', 'guest')),
  CONSTRAINT check_status CHECK (status IN ('active', 'inactive', 'suspended'))
);

-- Refresh tokens
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
```

### Multi-Tenancy

```sql
-- Tenants (Organizations)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) UNIQUE NOT NULL,
  plan VARCHAR(50) NOT NULL DEFAULT 'free',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  settings JSONB DEFAULT '{}',
  white_label JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT check_plan CHECK (plan IN ('free', 'growth', 'pro', 'enterprise')),
  CONSTRAINT check_status CHECK (status IN ('active', 'trial', 'suspended', 'cancelled'))
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  ai_credits INTEGER NOT NULL DEFAULT 0,
  users_limit INTEGER NOT NULL,
  storage_limit BIGINT NOT NULL, -- in bytes
  features JSONB DEFAULT '[]',
  billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly',
  amount DECIMAL(10, 2) NOT NULL,
  next_billing_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT check_billing_cycle CHECK (billing_cycle IN ('monthly', 'yearly'))
);

-- Indexes
CREATE INDEX idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX idx_subscriptions_tenant_id ON subscriptions(tenant_id);
```

### CRM Module

```sql
-- Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  company VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'lead',
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT check_status CHECK (status IN ('lead', 'prospect', 'active', 'churned'))
);

-- Deals
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  value DECIMAL(12, 2) NOT NULL,
  stage VARCHAR(50) NOT NULL DEFAULT 'qualification',
  probability INTEGER CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMP,
  
  CONSTRAINT check_stage CHECK (stage IN ('qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'))
);

-- Activities
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  due_date TIMESTAMP,
  completed BOOLEAN DEFAULT FALSE,
  assigned_to UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT check_activity_type CHECK (type IN ('call', 'email', 'meeting', 'task', 'note'))
);

-- Indexes
CREATE INDEX idx_customers_tenant_id ON customers(tenant_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_deals_tenant_id ON deals(tenant_id);
CREATE INDEX idx_deals_customer_id ON deals(customer_id);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_activities_tenant_id ON activities(tenant_id);
CREATE INDEX idx_activities_customer_id ON activities(customer_id);
```

### AI & Analytics

```sql
-- AI Predictions
CREATE TABLE ai_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  input JSONB NOT NULL,
  output JSONB NOT NULL,
  confidence DECIMAL(5, 4) CHECK (confidence >= 0 AND confidence <= 1),
  model_version VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT check_prediction_type CHECK (type IN ('revenue', 'churn', 'inventory', 'pricing', 'hiring'))
);

-- AI Insights
CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  confidence DECIMAL(5, 4),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  impact VARCHAR(20) NOT NULL DEFAULT 'medium',
  actionable BOOLEAN DEFAULT TRUE,
  dismissed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  dismissed_at TIMESTAMP,
  
  CONSTRAINT check_insight_type CHECK (type IN ('opportunity', 'risk', 'anomaly', 'trend')),
  CONSTRAINT check_priority CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  CONSTRAINT check_impact CHECK (impact IN ('low', 'medium', 'high'))
);

-- AI Credit Usage
CREATE TABLE ai_credit_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  feature VARCHAR(100) NOT NULL,
  credits_used INTEGER NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_ai_predictions_tenant_id ON ai_predictions(tenant_id);
CREATE INDEX idx_ai_predictions_type ON ai_predictions(type);
CREATE INDEX idx_ai_insights_tenant_id ON ai_insights(tenant_id);
CREATE INDEX idx_ai_insights_dismissed ON ai_insights(dismissed);
CREATE INDEX idx_ai_credit_usage_tenant_id ON ai_credit_usage(tenant_id);
```

### Workflows & Automation

```sql
-- Workflows
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  trigger JSONB NOT NULL,
  actions JSONB NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflow Executions
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'running',
  input JSONB,
  output JSONB,
  error TEXT,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  
  CONSTRAINT check_execution_status CHECK (status IN ('running', 'completed', 'failed', 'cancelled'))
);

-- Indexes
CREATE INDEX idx_workflows_tenant_id ON workflows(tenant_id);
CREATE INDEX idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);
```

### Marketplace

```sql
-- Plugins
CREATE TABLE plugins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  rating DECIMAL(3, 2) CHECK (rating >= 0 AND rating <= 5),
  downloads INTEGER DEFAULT 0,
  author_id UUID REFERENCES users(id),
  version VARCHAR(20) NOT NULL,
  compatibility TEXT[],
  manifest JSONB NOT NULL,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT check_category CHECK (category IN ('crm', 'erp', 'marketing', 'analytics', 'ai', 'integration', 'template'))
);

-- Plugin Installations
CREATE TABLE plugin_installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plugin_id UUID NOT NULL REFERENCES plugins(id) ON DELETE CASCADE,
  version VARCHAR(20) NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  settings JSONB DEFAULT '{}',
  installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(tenant_id, plugin_id)
);

-- Indexes
CREATE INDEX idx_plugins_category ON plugins(category);
CREATE INDEX idx_plugins_published ON plugins(published);
CREATE INDEX idx_plugin_installations_tenant_id ON plugin_installations(tenant_id);
```

## Migrations

Use a migration tool like Prisma or Knex for schema management:

```bash
# Example with Prisma
npx prisma migrate dev --name init
npx prisma generate
```

## Sample Seed Data

```sql
-- Insert sample tenant
INSERT INTO tenants (id, name, subdomain, plan, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'Acme Corp', 'acme', 'pro', 'active');

-- Insert sample user
INSERT INTO users (email, password_hash, name, tenant_id, role)
VALUES ('admin@acme.com', '$2b$10$...', 'Admin User', '00000000-0000-0000-0000-000000000001', 'admin');
```

## Performance Optimization

### Partitioning
For large tables, consider partitioning by tenant_id:
```sql
CREATE TABLE activities_partitioned (LIKE activities INCLUDING ALL)
PARTITION BY HASH (tenant_id);
```

### Materialized Views
For analytics:
```sql
CREATE MATERIALIZED VIEW revenue_by_month AS
SELECT 
  tenant_id,
  DATE_TRUNC('month', created_at) as month,
  SUM(value) as total_revenue,
  COUNT(*) as deal_count
FROM deals
WHERE stage = 'closed_won'
GROUP BY tenant_id, month;

CREATE INDEX idx_revenue_by_month_tenant ON revenue_by_month(tenant_id);
```

---

**Note**: This is a simplified schema. Production implementation will include additional tables for ERP, HR, Inventory, and other modules.
