# SupportPilot — Backend (Placeholder Structure)

Two services:

| Service       | Tech           | Port | Role |
|---------------|----------------|------|------|
| `java-api`    | Spring Boot 3  | 5000 | Main REST API |
| `python-api`  | FastAPI        | 8000 | AI micro-service |

Frontend talks only to Java (`http://localhost:5000/api`).
Java calls Python internally for classify / suggest / summarize.

## API Endpoints (Java — port 5000)

```
POST /api/auth/register
POST /api/auth/register-admin
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/forgot-password

GET    /api/tickets
GET    /api/tickets/my
GET    /api/tickets/escalated
GET    /api/tickets/{id}
POST   /api/tickets
PUT    /api/tickets/{id}/resolve
PUT    /api/tickets/{id}/escalate
PUT    /api/tickets/{id}/reassign
DELETE /api/tickets/{id}

GET    /api/users
POST   /api/users
PUT    /api/users/{id}
DELETE /api/users/{id}
PATCH  /api/users/{id}/toggle
PUT    /api/users/{id}/profile

GET    /api/kb
GET    /api/kb/suggest?ticketId=X&limit=3
GET    /api/kb/{id}
POST   /api/kb
PUT    /api/kb/{id}
DELETE /api/kb/{id}

GET /api/admin/dashboard
GET /api/admin/recent-tickets
GET /api/admin/reports

GET /api/analytics/reports

GET /api/settings
PUT /api/settings

POST /api/email/notify
GET  /api/notifications
POST /api/notifications/mark-read
```

## AI Endpoints (Python — port 8000)

```
GET  /health
POST /classify
POST /suggest
POST /summarize
```
