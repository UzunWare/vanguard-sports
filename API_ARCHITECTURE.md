# Vanguard Sports Academy - API Architecture

**Version:** 1.0
**Framework:** Node.js + Express.js
**Date:** December 3, 2025

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [API Structure](#api-structure)
4. [Authentication & Authorization](#authentication--authorization)
5. [API Endpoints](#api-endpoints)
6. [Error Handling](#error-handling)
7. [Security](#security)
8. [Testing Strategy](#testing-strategy)

---

## Architecture Overview

### Layer Architecture
```
┌─────────────────────────────────────┐
│         Frontend (React)            │
│     http://localhost:5174           │
└─────────────────────────────────────┘
                 │ HTTP/HTTPS
                 ▼
┌─────────────────────────────────────┐
│      API Gateway (Express)          │
│     http://localhost:5000           │
│  - CORS                             │
│  - Rate Limiting                    │
│  - Request Validation               │
└─────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
┌──────────────┐   ┌─────────────┐
│   Auth       │   │  Business   │
│   Middleware │   │  Logic      │
└──────────────┘   └─────────────┘
        │                 │
        └────────┬────────┘
                 ▼
┌─────────────────────────────────────┐
│      Controllers Layer              │
│  - Auth                             │
│  - Users                            │
│  - Sessions                         │
│  - Athletes                         │
│  - Enrollments                      │
│  - Evaluations                      │
│  - Billing                          │
└─────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│      Services Layer                 │
│  - Database operations              │
│  - Business rules                   │
│  - External API calls               │
└─────────────────────────────────────┘
                 │
        ┌────────┴────────┬──────────┐
        ▼                 ▼          ▼
┌─────────────┐   ┌──────────┐  ┌──────────┐
│ PostgreSQL  │   │  Stripe  │  │ SendGrid │
│  Database   │   │ Payments │  │  Email   │
└─────────────┘   └──────────┘  └──────────┘
```

---

## Technology Stack

### Core
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18+
- **Database**: PostgreSQL 14+
- **ORM**: Knex.js (query builder) / node-postgres (pg)

### Authentication
- **JWT**: jsonwebtoken
- **Password Hashing**: bcrypt
- **Session Management**: express-session (optional)

### Validation & Security
- **Request Validation**: express-validator / joi
- **CORS**: cors
- **Helmet**: helmet (security headers)
- **Rate Limiting**: express-rate-limit

### Payments & Email
- **Payments**: Stripe SDK
- **Email**: SendGrid / AWS SES
- **File Storage**: AWS S3 (for photos, documents)

### Development & Testing
- **Testing**: Jest + Supertest
- **Linting**: ESLint
- **API Docs**: Swagger / OpenAPI
- **Logging**: Winston / Morgan

---

## API Structure

### Directory Structure
```
vanguard-backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── stripe.js
│   │   └── email.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   ├── errorHandler.js
│   │   └── rateLimiter.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── users.routes.js
│   │   ├── sessions.routes.js
│   │   ├── athletes.routes.js
│   │   ├── enrollments.routes.js
│   │   ├── evaluations.routes.js
│   │   ├── billing.routes.js
│   │   └── admin.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── users.controller.js
│   │   ├── sessions.controller.js
│   │   ├── athletes.controller.js
│   │   ├── enrollments.controller.js
│   │   ├── evaluations.controller.js
│   │   └── billing.controller.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── session.service.js
│   │   ├── athlete.service.js
│   │   ├── enrollment.service.js
│   │   ├── evaluation.service.js
│   │   ├── billing.service.js
│   │   ├── stripe.service.js
│   │   └── email.service.js
│   ├── models/
│   │   └── database/
│   │       ├── users.model.js
│   │       ├── sessions.model.js
│   │       ├── athletes.model.js
│   │       └── ...
│   ├── utils/
│   │   ├── logger.js
│   │   ├── validators.js
│   │   └── helpers.js
│   ├── migrations/
│   │   └── *.sql
│   ├── seeds/
│   │   └── *.sql
│   └── server.js
├── tests/
│   ├── integration/
│   └── unit/
├── .env.example
├── .eslintrc.js
├── package.json
└── README.md
```

---

## Authentication & Authorization

### JWT Token Strategy

#### Access Token (Short-lived)
- **Lifetime**: 15 minutes
- **Storage**: Memory (not localStorage)
- **Usage**: Sent with every API request via Authorization header

#### Refresh Token (Long-lived)
- **Lifetime**: 7 days
- **Storage**: HttpOnly secure cookie
- **Usage**: Renew access tokens

### Authorization Flow
```
1. User logs in → POST /api/auth/login
2. Server validates credentials
3. Server generates Access Token + Refresh Token
4. Server stores Refresh Token in database
5. Client receives tokens
6. Client sends Access Token with each request
7. When Access Token expires, use Refresh Token to get new one
8. POST /api/auth/refresh
```

### Role-Based Access Control (RBAC)

```javascript
// Middleware example
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

// Usage
router.get('/admin/users', authenticate, authorize('admin'), getUserList);
router.get('/coach/sessions', authenticate, authorize('coach', 'admin'), getCoachSessions);
```

---

## API Endpoints

### Base URL
```
Development: http://localhost:5000/api
Production: https://api.vanguardsports.com/api
```

### 1. Authentication Routes

#### POST `/api/auth/register`
Register new user (parent)
```json
Request:
{
  "email": "parent@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Smith",
  "phone": "(210) 555-0100"
}

Response: 201
{
  "user": { "id": "uuid", "email": "...", "role": "parent" },
  "accessToken": "jwt...",
  "refreshToken": "jwt..."
}
```

#### POST `/api/auth/login`
Login user
```json
Request:
{
  "email": "parent@example.com",
  "password": "SecurePass123!"
}

Response: 200
{
  "user": { "id": "uuid", "email": "...", "role": "parent", "firstName": "John" },
  "accessToken": "jwt...",
  "refreshToken": "jwt..."
}
```

#### POST `/api/auth/refresh`
Refresh access token
```json
Request:
{
  "refreshToken": "jwt..."
}

Response: 200
{
  "accessToken": "new-jwt..."
}
```

#### POST `/api/auth/logout`
Logout user (invalidate refresh token)
```json
Request: (authenticated)

Response: 200
{
  "message": "Logged out successfully"
}
```

---

### 2. User Routes

#### GET `/api/users/me`
Get current user profile
```json
Response: 200
{
  "id": "uuid",
  "email": "parent@example.com",
  "firstName": "John",
  "lastName": "Smith",
  "phone": "(210) 555-0100",
  "role": "parent",
  "status": "active"
}
```

#### PATCH `/api/users/me`
Update current user profile
```json
Request:
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "(210) 555-0101"
}

Response: 200
{
  "message": "Profile updated",
  "user": { ... }
}
```

#### POST `/api/users/change-password`
Change password
```json
Request:
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}

Response: 200
{
  "message": "Password changed successfully"
}
```

---

### 3. Session Routes

#### GET `/api/sessions`
Get all sessions (with enrollment counts)
```json
Query params:
?sport=Basketball
&status=Open
&day=Saturday

Response: 200
{
  "sessions": [
    {
      "id": "uuid",
      "sport": "Basketball",
      "level": "Junior Boys",
      "grades": "Grades 4-6",
      "dayOfWeek": "Saturday",
      "startTime": "16:15",
      "endTime": "17:15",
      "capacity": 20,
      "enrolledCount": 12,
      "status": "Open",
      "price": 90.00,
      "headCoach": { "id": "uuid", "name": "Ugur Yildiz" }
    }
  ]
}
```

#### GET `/api/sessions/:id`
Get session details
```json
Response: 200
{
  "id": "uuid",
  "sport": "Basketball",
  "level": "Junior Boys",
  "description": "...",
  "features": ["Ball handling", "Shooting"],
  "schedule": { ... },
  "coaches": [ ... ],
  "enrolledCount": 12,
  "capacity": 20
}
```

#### POST `/api/sessions` (Admin only)
Create new session
```json
Request:
{
  "sport": "Basketball",
  "level": "Junior Boys",
  "grades": "Grades 4-6",
  "gender": "Male",
  "minAge": 9,
  "maxAge": 12,
  "dayOfWeek": "Saturday",
  "startTime": "16:15",
  "endTime": "17:15",
  "location": "Vanguard Main Gym",
  "capacity": 20,
  "price": 90.00,
  "headCoachId": "uuid",
  "description": "...",
  "features": ["..."]
}

Response: 201
{
  "message": "Session created",
  "session": { ... }
}
```

#### PATCH `/api/sessions/:id` (Admin only)
Update session
```json
Request:
{
  "capacity": 25,
  "price": 95.00,
  "status": "Limited"
}

Response: 200
{
  "message": "Session updated",
  "session": { ... }
}
```

#### DELETE `/api/sessions/:id` (Admin only)
Delete session
```json
Response: 200
{
  "message": "Session deleted"
}
```

---

### 4. Athletes Routes

#### GET `/api/athletes/my-athletes` (Parent)
Get parent's athletes
```json
Response: 200
{
  "athletes": [
    {
      "id": "uuid",
      "firstName": "Jordan",
      "lastName": "Smith",
      "dateOfBirth": "2013-05-15",
      "age": 11,
      "gender": "Male",
      "jerseySize": "YM",
      "enrollments": [
        {
          "sessionId": "uuid",
          "sessionName": "Junior Boys Basketball",
          "status": "active"
        }
      ],
      "medicalInfo": { ... },
      "emergencyContacts": [ ... ]
    }
  ]
}
```

#### POST `/api/athletes` (Parent)
Add athlete
```json
Request:
{
  "firstName": "Jordan",
  "lastName": "Smith",
  "dateOfBirth": "2013-05-15",
  "gender": "Male",
  "jerseySize": "YM"
}

Response: 201
{
  "message": "Athlete added",
  "athlete": { ... }
}
```

#### PATCH `/api/athletes/:id` (Parent)
Update athlete
```json
Request:
{
  "jerseySize": "YL",
  "medicalInfo": {
    "allergies": "Peanuts",
    "conditions": "Asthma"
  }
}

Response: 200
{
  "message": "Athlete updated",
  "athlete": { ... }
}
```

---

### 5. Enrollment Routes

#### POST `/api/enrollments`
Enroll athlete in session
```json
Request:
{
  "athleteId": "uuid",
  "sessionId": "uuid",
  "startDate": "2025-01-15"
}

Response: 201
{
  "message": "Enrollment successful",
  "enrollment": { ... },
  "invoice": {
    "id": "uuid",
    "amount": 120.00,
    "dueDate": "2025-01-15"
  }
}
```

#### GET `/api/enrollments/my-enrollments` (Parent)
Get parent's enrollments
```json
Response: 200
{
  "enrollments": [
    {
      "id": "uuid",
      "athlete": { ... },
      "session": { ... },
      "status": "active",
      "startDate": "2025-01-01",
      "nextPaymentDate": "2025-02-01"
    }
  ]
}
```

#### PATCH `/api/enrollments/:id/cancel`
Cancel enrollment
```json
Request:
{
  "reason": "Schedule conflict"
}

Response: 200
{
  "message": "Enrollment cancelled",
  "refundAmount": 60.00
}
```

---

### 6. Attendance Routes (Coach)

#### GET `/api/sessions/:sessionId/attendance`
Get attendance for session
```json
Query: ?date=2025-12-03

Response: 200
{
  "session": { ... },
  "date": "2025-12-03",
  "attendance": [
    {
      "athleteId": "uuid",
      "athleteName": "Jordan Smith",
      "status": "present",
      "notes": ""
    }
  ]
}
```

#### POST `/api/attendance`
Mark attendance
```json
Request:
{
  "sessionId": "uuid",
  "date": "2025-12-03",
  "records": [
    { "athleteId": "uuid", "status": "present" },
    { "athleteId": "uuid", "status": "absent", "notes": "Sick" }
  ]
}

Response: 200
{
  "message": "Attendance recorded"
}
```

---

### 7. Evaluation Routes (Coach)

#### GET `/api/evaluations`
Get evaluations (coach sees their own, parent sees their athletes')
```json
Query: ?athleteId=uuid&startDate=2025-01-01&endDate=2025-12-31

Response: 200
{
  "evaluations": [
    {
      "id": "uuid",
      "athlete": { ... },
      "session": { ... },
      "coach": { ... },
      "date": "2025-11-15",
      "ratings": {
        "Shooting": 4,
        "Dribbling": 3,
        "Defense": 5
      },
      "notes": "Great improvement!"
    }
  ]
}
```

#### POST `/api/evaluations` (Coach)
Create evaluation
```json
Request:
{
  "athleteId": "uuid",
  "sessionId": "uuid",
  "date": "2025-12-03",
  "ratings": {
    "Shooting": 4,
    "Dribbling": 3,
    "Defense": 5,
    "Passing": 4,
    "IQ": 4
  },
  "notes": "Excellent progress on shooting form"
}

Response: 201
{
  "message": "Evaluation created",
  "evaluation": { ... }
}
```

---

### 8. Billing Routes

#### GET `/api/billing/invoices` (Parent)
Get invoices
```json
Query: ?status=paid&startDate=2025-01-01

Response: 200
{
  "invoices": [
    {
      "id": "uuid",
      "invoiceNumber": "INV-2025-001",
      "date": "2025-01-01",
      "dueDate": "2025-01-15",
      "amount": 120.00,
      "status": "paid",
      "description": "Basketball - Junior Boys - Monthly",
      "downloadUrl": "/api/invoices/uuid/download"
    }
  ]
}
```

#### GET `/api/billing/payment-methods` (Parent)
Get payment methods
```json
Response: 200
{
  "paymentMethods": [
    {
      "id": "uuid",
      "cardBrand": "visa",
      "cardLast4": "4242",
      "expMonth": 12,
      "expYear": 2026,
      "isDefault": true
    }
  ]
}
```

#### POST `/api/billing/payment-methods` (Parent)
Add payment method
```json
Request:
{
  "stripePaymentMethodId": "pm_xxx",
  "setAsDefault": true
}

Response: 201
{
  "message": "Payment method added",
  "paymentMethod": { ... }
}
```

#### POST `/api/billing/pay-invoice/:id` (Parent)
Pay invoice
```json
Request:
{
  "paymentMethodId": "uuid"
}

Response: 200
{
  "message": "Payment successful",
  "transaction": { ... }
}
```

---

### 9. Admin Routes

#### GET `/api/admin/users`
Get all users
```json
Query: ?role=parent&status=active&search=john

Response: 200
{
  "users": [ ... ],
  "total": 50,
  "page": 1,
  "pageSize": 25
}
```

#### PATCH `/api/admin/users/:id/suspend`
Suspend user
```json
Request:
{
  "reason": "Payment issues"
}

Response: 200
{
  "message": "User suspended"
}
```

#### GET `/api/admin/metrics`
Get dashboard metrics
```json
Response: 200
{
  "revenue": {
    "total": 145670,
    "monthly": 12360,
    "growth": 12.5
  },
  "subscriptions": {
    "active": 124,
    "new": 8,
    "churn": 3.2
  },
  "athletes": {
    "total": 187,
    "active": 175
  },
  "sessions": {
    "total": 12,
    "capacity": 240,
    "enrolled": 187
  }
}
```

---

## Error Handling

### Standard Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMIT` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | External service down |

---

## Security

### HTTPS Only
All production API calls must use HTTPS

### CORS Configuration
```javascript
app.use(cors({
  origin: ['http://localhost:5174', 'https://vanguardsports.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Rate Limiting
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

### Input Validation
All inputs validated using express-validator or joi

### SQL Injection Prevention
- Use parameterized queries
- Never concatenate user input in SQL

### XSS Prevention
- Sanitize all user inputs
- Use helmet.js for security headers

---

## Testing Strategy

### Unit Tests
- Test individual functions
- Mock external dependencies
- Coverage target: 80%+

### Integration Tests
- Test API endpoints
- Use test database
- Test authentication flows

### Example Test
```javascript
describe('POST /api/auth/login', () => {
  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'parent@example.com',
        password: 'ValidPass123!'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body.user.email).toBe('parent@example.com');
  });

  it('should reject invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'parent@example.com',
        password: 'WrongPassword'
      });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });
});
```

---

**Last Updated:** December 3, 2025
**Next Steps:** Backend Implementation
