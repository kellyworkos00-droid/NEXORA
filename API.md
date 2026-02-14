# NEXORA API Documentation

Complete API reference for NEXORA's AI-powered business operating system.

## Base URLs

- **Production**: `https://api.nexora.ai/v1`
- **Development**: `http://localhost:3000/v1`
- **Auth Service**: `http://localhost:5001`
- **CRM Service**: `http://localhost:5002`
- **API Gateway**: `http://localhost:4000`

## Authentication

All API endpoints (except `/auth/register` and `/auth/login`) require a Bearer token in the Authorization header:

```bash
Authorization: Bearer <access_token>
```

### Get Access Token

**POST** `/auth/login`

```bash
curl -X POST http://localhost:5001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demo.nexora.ai",
    "password": "Demo123!"
  }'
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "admin@demo.nexora.ai",
    "name": "Admin User",
    "role": "admin",
    "tenantId": "uuid"
  }
}
```

## Authentication Service (`/auth`)

### Register New User

**POST** `/auth/register`

Create a new tenant and admin user account.

```bash
curl -X POST http://localhost:5001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@company.com",
    "password": "SecurePassword123!",
    "name": "John Doe",
    "tenantName": "Acme Corporation"
  }'
```

### Refresh Token

**POST** `/auth/refresh`

Get a new access token using a refresh token.

```bash
curl -X POST http://localhost:5001/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }'
```

## CRM Service (`/crm`)

### Customers

#### List Customers

**GET** `/crm/customers`

Query parameters:
- `page` (default: 1)
- `limit` (default: 10)
- `search` - Search by name or email
- `status` - Filter by status (active, prospect, lead, inactive)
- `sort` - Sort field (name, createdAt)
- `order` - Sort order (asc, desc)

```bash
curl -X GET "http://localhost:5002/crm/customers?page=1&limit=20&status=active" \
  -H "Authorization: Bearer <access_token>"
```

Response:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Acme Corporation",
      "email": "contact@acme.com",
      "phone": "+1-555-0100",
      "company": "Acme Corp",
      "status": "active",
      "tags": ["enterprise", "high-value"],
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-20T14:45:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

#### Create Customer

**POST** `/crm/customers`

```bash
curl -X POST http://localhost:5002/crm/customers \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Client Inc",
    "email": "hello@newclient.com",
    "phone": "+1-555-0103",
    "company": "New Client Company",
    "status": "prospect",
    "tags": ["technology"]
  }'
```

#### Get Customer

**GET** `/crm/customers/:id`

```bash
curl -X GET http://localhost:5002/crm/customers/uuid \
  -H "Authorization: Bearer <access_token>"
```

#### Update Customer

**PATCH** `/crm/customers/:id`

```bash
curl -X PATCH http://localhost:5002/crm/customers/uuid \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active",
    "tags": ["enterprise"]
  }'
```

#### Delete Customer

**DELETE** `/crm/customers/:id`

```bash
curl -X DELETE http://localhost:5002/crm/customers/uuid \
  -H "Authorization: Bearer <access_token>"
```

### Deals

#### List Deals

**GET** `/crm/deals`

Query parameters:
- `page` (default: 1)
- `limit` (default: 10)
- `stage` - Filter by stage (lead, qualified, proposal, negotiation, closed)
- `search` - Search by title
- `sort` - Sort field (title, value, expectedCloseDate)
- `order` - Sort order (asc, desc)

```bash
curl -X GET "http://localhost:5002/crm/deals?stage=negotiation&sort=value&order=desc" \
  -H "Authorization: Bearer <access_token>"
```

#### Create Deal

**POST** `/crm/deals`

```bash
curl -X POST http://localhost:5002/crm/deals \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "uuid",
    "title": "Enterprise License - Annual",
    "value": 150000,
    "stage": "proposal",
    "probability": 65,
    "expectedCloseDate": "2024-03-31"
  }'
```

#### Update Deal (Move in Pipeline)

**PATCH** `/crm/deals/:id`

```bash
curl -X PATCH http://localhost:5002/crm/deals/uuid \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "stage": "negotiation",
    "probability": 75
  }'
```

#### Get Deal Details

**GET** `/crm/deals/:id`

```bash
curl -X GET http://localhost:5002/crm/deals/uuid \
  -H "Authorization: Bearer <access_token>"
```

### Activities

#### Create Activity

**POST** `/crm/activities`

Activity types: `call`, `email`, `meeting`, `note`, `task`

```bash
curl -X POST http://localhost:5002/crm/activities \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "uuid",
    "dealId": "uuid",
    "type": "meeting",
    "title": "Discovery Call",
    "description": "Initial discovery meeting with stakeholders",
    "scheduledFor": "2024-02-15T14:00:00Z"
  }'
```

#### List Activities

**GET** `/crm/activities`

Query parameters:
- `customerId` - Filter by customer
- `dealId` - Filter by deal
- `type` - Filter by activity type
- `page` (default: 1)
- `limit` (default: 10)

```bash
curl -X GET "http://localhost:5002/crm/activities?customerId=uuid&type=meeting" \
  -H "Authorization: Bearer <access_token>"
```

## AI Engine Service (`/ai`)

### Get Revenue Prediction

**GET** `/ai/predictions/revenue`

```bash
curl -X GET "http://localhost:5003/ai/predictions/revenue?timeframe=30days" \
  -H "Authorization: Bearer <access_token>"
```

Response:
```json
{
  "predictedRevenue": 890000,
  "confidence": 0.87,
  "timeframe": "30days",
  "factors": [
    "Deal probability weighted by stage",
    "Historical conversion rates",
    "Seasonal patterns"
  ]
}
```

### Get Churn Risk

**GET** `/ai/predictions/churn-risk`

```bash
curl -X GET http://localhost:5003/ai/predictions/churn-risk \
  -H "Authorization: Bearer <access_token>"
```

Response:
```json
{
  "atRiskCustomers": [
    {
      "customerId": "uuid",
      "customerName": "Acme Corporation",
      "riskScore": 0.78,
      "reason": "No activity in 14 days",
      "recommendedAction": "Schedule follow-up call"
    }
  ]
}
```

### Get Deal Recommendations

**GET** `/ai/recommendations/deals`

```bash
curl -X GET http://localhost:5003/ai/recommendations/deals \
  -H "Authorization: Bearer <access_token>"
```

## Error Responses

All endpoints return standard error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes

- `UNAUTHORIZED` - Missing or invalid authentication token
- `FORBIDDEN` - User lacks permission for this resource
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid input data
- `RATE_LIMITED` - Too many requests

## Rate Limiting

- **Default**: 1000 requests per minute
- **Auth endpoints**: 10 requests per minute per IP
- **Burst limit**: Max 100 requests in 10 seconds

## WebSocket Events (Real-time Updates)

Connect to `ws://localhost:4000/realtime` with auth token as query parameter:

```javascript
const ws = new WebSocket('ws://localhost:4000/realtime?token=<access_token>');

// Listen for deal updates
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'deal:updated') {
    console.log('Deal updated:', message.data);
  }
};
```

### Event Types

- `deal:created` - New deal created
- `deal:updated` - Deal updated or moved in pipeline
- `deal:closed` - Deal closed
- `customer:created` - New customer added
- `customer:updated` - Customer information updated
- `notification` - System notification

## Pagination

All list endpoints support pagination:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

## Timestamps

All timestamps are in ISO 8601 format (UTC):
```
2024-02-14T15:30:00Z
```

## SDK & Client Libraries

- **JavaScript/TypeScript**: `npm install @nexora/sdk`
- **Python**: `pip install nexora-sdk`
- **Go**: `go get github.com/nexora/go-sdk`

## Support

- **Documentation**: https://docs.nexora.ai
- **Support Email**: support@nexora.ai
- **Status Page**: https://status.nexora.ai
