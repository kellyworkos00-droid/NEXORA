# 📚 API Documentation

## Base URL

```
Development: http://localhost:4000/api
Production: https://api.nexora.ai
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

## Authentication Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "tenantName": "Acme Corp"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "tenantId": "uuid"
    },
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "token": "jwt_token",
    "refreshToken": "refresh_token",
    "user": { ... }
  }
}
```

### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "token": "new_jwt_token"
  }
}
```

## AI Engine Endpoints

### Predict Revenue
```http
POST /api/ai/predictions/revenue
Authorization: Bearer <token>
Content-Type: application/json

{
  "dateRange": {
    "start": "2026-01-01",
    "end": "2026-03-31"
  },
  "historicalData": [
    { "month": "2025-10", "revenue": 95000 },
    { "month": "2025-11", "revenue": 102000 },
    { "month": "2025-12", "revenue": 108000 }
  ]
}

Response: 200 OK
{
  "success": true,
  "data": {
    "prediction": {
      "amount": 125000,
      "confidence": 0.87,
      "trend": "increasing",
      "breakdown": {
        "recurring": 95000,
        "newSales": 30000
      }
    },
    "insights": [
      "Revenue expected to grow 15% compared to last quarter"
    ]
  }
}
```

### Predict Churn Risk
```http
POST /api/ai/predictions/churn
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerId": "cust_123",
  "customerData": {
    "lastLoginDays": 45,
    "engagementScore": 23,
    "paymentHistory": "on_time",
    "supportTickets": 3
  }
}

Response: 200 OK
{
  "success": true,
  "data": {
    "customerId": "cust_123",
    "churnRisk": 0.68,
    "riskLevel": "high",
    "factors": [
      {
        "factor": "engagement",
        "impact": 0.45,
        "description": "Low recent activity"
      }
    ],
    "recommendations": [
      "Reach out for feedback",
      "Offer onboarding session"
    ]
  }
}
```

### Generate Insights
```http
POST /api/ai/insights/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "dataType": "all",
  "timeRange": "last_30_days"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "insights": [
      {
        "type": "opportunity",
        "title": "Untapped Market Segment",
        "description": "SMEs in healthcare showing 3x engagement",
        "confidence": 0.92,
        "potentialImpact": "high"
      }
    ]
  }
}
```

## CRM Endpoints

### List Customers
```http
GET /api/crm/customers?page=1&limit=20&status=active
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "customers": [
      {
        "id": "uuid",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "company": "Tech Corp",
        "status": "active",
        "createdAt": "2026-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### Create Customer
```http
POST /api/crm/customers
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "company": "Tech Corp",
  "status": "lead",
  "tags": ["enterprise", "priority"],
  "customFields": {
    "industry": "Technology",
    "employees": 500
  }
}

Response: 201 Created
{
  "success": true,
  "data": {
    "customer": {
      "id": "uuid",
      "name": "Jane Smith",
      "email": "jane@example.com",
      ...
    }
  }
}
```

### Update Customer
```http
PATCH /api/crm/customers/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "active",
  "tags": ["enterprise", "priority", "converted"]
}

Response: 200 OK
{
  "success": true,
  "data": {
    "customer": { ... }
  }
}
```

### Delete Customer
```http
DELETE /api/crm/customers/:id
Authorization: Bearer <token>

Response: 204 No Content
```

## Deal Endpoints

### Create Deal
```http
POST /api/crm/deals
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerId": "uuid",
  "title": "Enterprise License Deal",
  "value": 50000,
  "stage": "proposal",
  "probability": 60,
  "expectedCloseDate": "2026-03-31",
  "assignedTo": "user_uuid"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "deal": { ... }
  }
}
```

### Update Deal Stage
```http
PATCH /api/crm/deals/:id/stage
Authorization: Bearer <token>
Content-Type: application/json

{
  "stage": "negotiation",
  "probability": 80
}

Response: 200 OK
```

## Workflow Endpoints

### Create Workflow
```http
POST /api/ai/automation/workflows
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Lead Nurture Campaign",
  "description": "Automatically nurture new leads",
  "trigger": {
    "type": "event",
    "config": {
      "event": "customer.created",
      "conditions": {
        "status": "lead"
      }
    }
  },
  "actions": [
    {
      "type": "email",
      "config": {
        "template": "welcome_lead",
        "delay": "0"
      }
    },
    {
      "type": "email",
      "config": {
        "template": "feature_highlight",
        "delay": "3_days"
      }
    }
  ]
}

Response: 201 Created
{
  "success": true,
  "data": {
    "workflowId": "uuid",
    "status": "created"
  }
}
```

## Analytics Endpoints

### Get Dashboard Metrics
```http
GET /api/analytics/dashboard?period=30d
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "revenue": {
      "current": 125000,
      "previous": 108000,
      "change": "+15.7%"
    },
    "customers": {
      "total": 487,
      "new": 23,
      "churned": 5
    },
    "deals": {
      "open": 45,
      "won": 12,
      "value": 580000
    }
  }
}
```

## Marketplace Endpoints

### List Plugins
```http
GET /api/marketplace/plugins?category=crm&page=1
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "plugins": [
      {
        "id": "uuid",
        "name": "Advanced Email Integration",
        "description": "Connect your email provider",
        "category": "integration",
        "price": 29.99,
        "rating": 4.8,
        "downloads": 1250
      }
    ]
  }
}
```

### Install Plugin
```http
POST /api/marketplace/plugins/:id/install
Authorization: Bearer <token>

Response: 201 Created
{
  "success": true,
  "data": {
    "installationId": "uuid",
    "status": "installed"
  }
}
```

## Error Responses

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": "Invalid email format"
    }
  }
}
```

### Error Codes

- `VALIDATION_ERROR` - Invalid input data
- `UNAUTHORIZED` - Missing or invalid token
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error

## Rate Limiting

- **Free Plan**: 100 requests/15min
- **Growth Plan**: 500 requests/15min
- **Pro Plan**: 2000 requests/15min
- **Enterprise Plan**: Unlimited

Headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

## Pagination

All list endpoints support pagination:

```
?page=1&limit=20&sortBy=createdAt&sortOrder=desc
```

## Webhooks

Configure webhooks in your tenant settings to receive real-time events:

```json
{
  "event": "customer.created",
  "timestamp": "2026-02-14T10:30:00Z",
  "data": {
    "customer": { ... }
  }
}
```

---

For GraphQL API documentation, see [GRAPHQL.md](./GRAPHQL.md)
