# 🚀 Deployment Guide

## Deployment Options

NEXORA supports multiple deployment strategies:

1. **Docker Compose** (Development/Small Teams)
2. **Kubernetes** (Production/Scale)
3. **Platform as a Service** (Vercel, Railway, Render)
4. **Self-Hosted** (Your own servers)

## 1. Docker Compose Deployment

### Prerequisites
- Docker 24.x+
- Docker Compose 2.x+
- Domain name (optional)

### Steps

```bash
# 1. Clone repository
git clone https://github.com/your-org/nexora.git
cd nexora

# 2. Configure environment
cp .env.example .env
nano .env  # Edit configuration

# 3. Build and start services
docker-compose -f docker-compose.prod.yml up -d

# 4. Check status
docker-compose ps

# 5. View logs
docker-compose logs -f
```

### Docker Compose Production File

Create `docker-compose.prod.yml`:

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${DATABASE_NAME}
      POSTGRES_USER: ${DATABASE_USER}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped

  api-gateway:
    build:
      context: .
      dockerfile: ./services/api-gateway/Dockerfile
    environment:
      NODE_ENV: production
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  web:
    build:
      context: .
      dockerfile: ./apps/web/Dockerfile
    environment:
      NODE_ENV: production
    ports:
      - "80:3000"
    depends_on:
      - api-gateway
    restart: unless-stopped

volumes:
  postgres_data:
```

## 2. Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (GKE, EKS, AKS, or self-hosted)
- kubectl configured
- Helm 3.x+ (optional)

### Architecture

```
┌─────────────────────────────────────────────┐
│          Ingress (nginx/traefik)            │
└─────────────┬───────────────────────────────┘
              │
     ┌────────┴─────────┐
     ▼                  ▼
┌─────────┐      ┌──────────────┐
│   Web   │      │ API Gateway  │
│ (Next)  │      │   Service    │
└─────────┘      └──────┬───────┘
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
        ┌──────────┐        ┌──────────┐
        │    AI    │        │   CRM    │
        │  Engine  │        │ Service  │
        └──────────┘        └──────────┘
              │                   │
              └─────────┬─────────┘
                        ▼
              ┌──────────────────┐
              │   PostgreSQL     │
              │   StatefulSet    │
              └──────────────────┘
```

### Deployment Steps

```bash
# 1. Create namespace
kubectl create namespace nexora

# 2. Create secrets
kubectl create secret generic nexora-secrets \
  --from-literal=jwt-secret=$JWT_SECRET \
  --from-literal=database-url=$DATABASE_URL \
  --from-literal=openai-key=$OPENAI_API_KEY \
  -n nexora

# 3. Apply configurations
kubectl apply -f infrastructure/kubernetes/

# 4. Check deployment status
kubectl get pods -n nexora
kubectl get services -n nexora

# 5. Get external IP
kubectl get ingress -n nexora
```

### Sample Kubernetes Manifest

`infrastructure/kubernetes/web-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nexora-web
  namespace: nexora
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nexora-web
  template:
    metadata:
      labels:
        app: nexora-web
    spec:
      containers:
      - name: web
        image: nexora/web:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: NEXT_PUBLIC_API_URL
          value: "https://api.nexora.ai"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: nexora-web
  namespace: nexora
spec:
  selector:
    app: nexora-web
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nexora-ingress
  namespace: nexora
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - nexora.ai
    - www.nexora.ai
    secretName: nexora-tls
  rules:
  - host: nexora.ai
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: nexora-web
            port:
              number: 80
```

## 3. Vercel Deployment (Frontend Only)

### Deploy Next.js Frontend

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd apps/web
vercel --prod

# Configure environment variables in Vercel dashboard
```

### Vercel Configuration

`apps/web/vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url"
  }
}
```

## 4. AWS Deployment

### Architecture on AWS

```
┌──────────────────────────────────────────────┐
│          CloudFront (CDN)                    │
└───────────────┬──────────────────────────────┘
                │
        ┌───────┴──────────┐
        ▼                  ▼
┌──────────────┐   ┌──────────────┐
│   S3         │   │  ALB         │
│  (Static)    │   │ (Load Bal)   │
└──────────────┘   └──────┬───────┘
                          │
                    ┌─────┴──────┐
                    ▼            ▼
               ┌─────────┐  ┌─────────┐
               │  ECS    │  │  ECS    │
               │ Service │  │ Service │
               │   1     │  │   2     │
               └─────────┘  └─────────┘
                    │            │
                    └─────┬──────┘
                          ▼
                   ┌──────────────┐
                   │  RDS         │
                   │ (Postgres)   │
                   └──────────────┘
                          │
                   ┌──────────────┐
                   │ElastiCache   │
                   │   (Redis)    │
                   └──────────────┘
```

### Terraform Configuration

`infrastructure/terraform/main.tf`:

```hcl
provider "aws" {
  region = var.aws_region
}

# VPC
resource "aws_vpc" "nexora" {
  cidr_block = "10.0.0.0/16"
  
  tags = {
    Name = "nexora-vpc"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "nexora" {
  name = "nexora-cluster"
}

# RDS PostgreSQL
resource "aws_db_instance" "nexora" {
  identifier        = "nexora-db"
  engine            = "postgres"
  engine_version    = "15.4"
  instance_class    = "db.t3.medium"
  allocated_storage = 100
  
  db_name  = var.database_name
  username = var.database_username
  password = var.database_password
  
  vpc_security_group_ids = [aws_security_group.database.id]
  db_subnet_group_name   = aws_db_subnet_group.nexora.name
  
  backup_retention_period = 7
  skip_final_snapshot     = false
}

# ElastiCache Redis
resource "aws_elasticache_cluster" "nexora" {
  cluster_id           = "nexora-cache"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  
  subnet_group_name    = aws_elasticache_subnet_group.nexora.name
  security_group_ids   = [aws_security_group.cache.id]
}
```

### Deploy with Terraform

```bash
cd infrastructure/terraform

# Initialize
terraform init

# Plan
terraform plan -out=plan.tfplan

# Apply
terraform apply plan.tfplan
```

## 5. Monitoring & Observability

### Prometheus + Grafana

```yaml
# prometheus-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: nexora
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    
    scrape_configs:
      - job_name: 'nexora-api'
        static_configs:
          - targets: ['api-gateway:4000']
```

### Application Monitoring

```typescript
// Add to Express app
import promClient from 'prom-client'

// Metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
})

// Endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType)
  res.send(await promClient.register.metrics())
})
```

## 6. CI/CD Pipeline

### GitHub Actions

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm test
      - run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/setup-buildx-action@v2
      - uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          file: ./apps/web/Dockerfile
          push: true
          tags: ghcr.io/${{ github.repository }}/web:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Kubernetes
        run: |
          kubectl rollout restart deployment/nexora-web -n nexora
```

## 7. Backup Strategy

### Database Backups

```bash
# Automated daily backups
0 2 * * * pg_dump -U nexora nexora | gzip > /backups/nexora_$(date +\%Y\%m\%d).sql.gz

# Keep last 30 days
find /backups -name "nexora_*.sql.gz" -mtime +30 -delete
```

### S3 Backup

```bash
# Sync to S3
aws s3 sync /backups s3://nexora-backups/database/
```

## 8. Scaling Recommendations

### Auto-scaling

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: nexora-web-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nexora-web
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

---

**Need help with deployment?** Contact devops@nexora.ai
