# AI-SupportPilot

> AI-powered IT Helpdesk & Ticket Management System  
> React Frontend · Spring Boot 3 (Java 17) · FastAPI (Python) · PostgreSQL

---

## Architecture

```
┌─────────────────────────┐         ┌──────────────────────────┐
│   React + Vite          │         │   Spring Boot 3 API      │
│   (Port 5173 dev)       │──HTTP──▶│   (Port 5000)            │
│   Tailwind + Recharts   │         │   JWT Auth · PostgreSQL  │
└─────────────────────────┘         └────────────┬─────────────┘
                                                  │ REST
                                     ┌────────────▼─────────────┐
                                     │   FastAPI AI Service     │
                                     │   (Port 8000)            │
                                     │   scikit-learn ML model  │
                                     │   Priority Classifier    │
                                     └──────────────────────────┘
                                                  │
                                     ┌────────────▼─────────────┐
                                     │   PostgreSQL 16          │
                                     │   (Port 5432)            │
                                     └──────────────────────────┘
```

---

## Quick Start (Docker Compose — Recommended)

```bash
# 1. Clone / extract the project
cd AI-SUPPORTPILOT

# 2. Copy env file
cp .env.example .env

# 3. Start everything (PostgreSQL + Python AI + Java API)
cd backend
docker compose up --build

# 4. Start the frontend (separate terminal)
npm install
npm run dev
```

Frontend → http://localhost:5173  
Java API → http://localhost:5000  
Python AI → http://localhost:8000

## Email integration (real SMTP)

When the Java API is running with SMTP configured, **Send email reply** on a support ticket
delivers a real message to the customer's inbox. The dashboard UI stays the same.

1. Copy `.env.example` to `.env` and set:

```env
MAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com          # or your provider
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password   # Gmail: use an App Password
SMTP_FROM=your-email@gmail.com
VITE_API_URL=http://localhost:5050/api
```

2. Start PostgreSQL + Java API, then the frontend (`npm run dev`).
3. Create a ticket from **Email Inbox** (paste a customer email), open **Resolve ticket**, write
   a reply, and click **Send email reply**.

Optional: set matching `EMAIL_API_KEY` and `VITE_EMAIL_API_KEY` to protect the send endpoint.

If the backend is unreachable, replies are still saved in **demo mode** on the ticket timeline.

## Demo email and AI workflows

The frontend also works standalone with localStorage when the backend is not running:

- Support agents can open **Email Inbox** and paste an incoming customer email to create a
  ticket with the sender, subject, message, priority classification, and linked timeline.
- On a support ticket, **Generate AI Reply** uses the existing knowledge base to create an
  editable draft. The agent must review and approve it before sending.
- The floating customer assistant answers common password, refund, access, and knowledge
  base questions. When it is not confident, it directs the customer to create a ticket.

---

## Running Services Individually

### PostgreSQL
```bash
docker run --name supportpilot-db \
  -e POSTGRES_DB=supportpilot \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 -d postgres:16-alpine
```

### Python AI Service
```bash
cd backend/python-api
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Java API
```bash
cd backend/java-api
# Set environment variables (or use application.yml defaults)
export DB_HOST=localhost DB_PORT=5432 DB_NAME=supportpilot
export DB_USER=postgres DB_PASSWORD=postgres
export PYTHON_API_URL=http://localhost:8000
export JWT_SECRET=change-this-in-production
mvn spring-boot:run
```

---

## Default Seeded Accounts

| Role      | Email                        | Password      |
|-----------|------------------------------|---------------|
| Admin     | admin@supportpilot.ai        | admin123      |
| Support   | support@supportpilot.ai      | support123    |
| Employee  | employee@supportpilot.ai     | employee123   |

---

## API Endpoints

### Auth
| Method | Path                      | Description           |
|--------|---------------------------|-----------------------|
| POST   | /api/auth/register        | Self-register         |
| POST   | /api/auth/register-admin  | Register as admin     |
| POST   | /api/auth/login           | Login → JWT token     |
| GET    | /api/auth/me              | Get current user      |
| POST   | /api/auth/forgot-password | Password reset request|

### Tickets
| Method | Path                          | Description                    |
|--------|-------------------------------|--------------------------------|
| GET    | /api/tickets                  | All tickets (admin/support)    |
| GET    | /api/tickets/my               | My tickets (employee)          |
| GET    | /api/tickets/escalated        | Escalated tickets              |
| GET    | /api/tickets/{id}             | Single ticket                  |
| POST   | /api/tickets                  | Create ticket (AI classifies)  |
| PUT    | /api/tickets/{id}/resolve     | Resolve ticket                 |
| PUT    | /api/tickets/{id}/escalate    | Escalate ticket                |
| PUT    | /api/tickets/{id}/reassign    | Reassign to agent              |
| DELETE | /api/tickets/{id}             | Delete ticket                  |

### Users (Admin only)
| Method | Path                    | Description          |
|--------|-------------------------|----------------------|
| GET    | /api/users              | List all users       |
| POST   | /api/users              | Create user          |
| PUT    | /api/users/{id}         | Update user          |
| DELETE | /api/users/{id}         | Delete user          |
| PATCH  | /api/users/{id}/toggle  | Enable/disable       |
| PUT    | /api/users/{id}/profile | Self-update profile  |

### Knowledge Base
| Method | Path                                    | Description           |
|--------|-----------------------------------------|-----------------------|
| GET    | /api/kb                                 | All articles          |
| GET    | /api/kb/suggest?ticketId=X&limit=3      | AI-suggested articles |
| GET    | /api/kb/{id}                            | Single article        |
| POST   | /api/kb                                 | Create article        |
| PUT    | /api/kb/{id}                            | Update article        |
| DELETE | /api/kb/{id}                            | Delete article        |

### Admin & Analytics
| Method | Path                       | Description         |
|--------|----------------------------|---------------------|
| GET    | /api/admin/dashboard       | Dashboard stats     |
| GET    | /api/admin/recent-tickets  | Last 5 tickets      |
| GET    | /api/admin/reports         | Admin reports       |
| GET    | /api/analytics/reports     | Recharts analytics  |
| GET    | /api/settings              | System settings     |
| PUT    | /api/settings              | Update settings     |
| GET    | /api/notifications         | User notifications  |
| POST   | /api/notifications/mark-read | Mark read         |
| POST   | /api/email/notify          | Send notification   |

---

## Python AI Service Endpoints

| Method | Path        | Description                  |
|--------|-------------|------------------------------|
| GET    | /health     | Health check + model status  |
| POST   | /classify   | Predict ticket priority       |
| POST   | /suggest    | Suggest KB article IDs        |
| POST   | /summarize  | Summarize ticket              |

### Classify Example
```json
POST /classify
{
  "title": "Server is completely down",
  "description": "No one in office can login to any system",
  "category": "IT Support"
}

Response:
{
  "priority": "critical",
  "category": "IT Support",
  "confidence": 0.9234
}
```

---

## AI Priority Classification

The Python service uses a **pre-trained scikit-learn Naive Bayes classifier** (`model.pkl` + `vectorizer.pkl`) trained on labeled IT support ticket data.

- On ticket creation, Java calls `POST /classify` with title + description
- Python vectorizes the text with TF-IDF and predicts: `low | medium | high | critical`
- If the Python service is unreachable, Java falls back to a **keyword heuristic** that mirrors the frontend's original `classifyTicket()` logic — so priority is always assigned

---

## Environment Variables

| Variable          | Default                  | Description                       |
|-------------------|--------------------------|-----------------------------------|
| `PORT`            | `5000`                   | Java API port                     |
| `DB_HOST`         | `localhost`              | PostgreSQL host                   |
| `DB_PORT`         | `5432`                   | PostgreSQL port                   |
| `DB_NAME`         | `supportpilot`           | Database name                     |
| `DB_USER`         | `postgres`               | Database username                 |
| `DB_PASSWORD`     | `postgres`               | Database password                 |
| `PYTHON_API_URL`  | `http://localhost:8000`  | Python AI service URL             |
| `JWT_SECRET`      | *(change in production)* | JWT signing secret                |
| `JWT_EXPIRATION_MS` | `86400000`             | Token TTL (1 day)                 |
| `VITE_API_URL`    | `http://localhost:5000/api` | Frontend API base URL          |

---

## Project Structure

```
AI-SUPPORTPILOT/
├── src/                        # React frontend (do not modify)
├── backend/
│   ├── docker-compose.yml      # Full stack launcher
│   ├── java-api/               # Spring Boot 3 REST API
│   │   ├── pom.xml
│   │   ├── Dockerfile
│   │   └── src/main/java/com/supportpilot/
│   │       ├── config/         # Security, JWT, CORS, exception handler
│   │       ├── controller/     # REST controllers
│   │       ├── dto/            # Request/response DTOs
│   │       ├── model/          # JPA entities
│   │       ├── repository/     # Spring Data repositories
│   │       └── service/        # Business logic
│   └── python-api/             # FastAPI AI microservice
│       ├── main.py
│       ├── requirements.txt
│       ├── Dockerfile
│       ├── model.pkl           # Pre-trained Naive Bayes classifier
│       ├── vectorizer.pkl      # TF-IDF vectorizer
│       ├── training_data.csv   # Training dataset
│       └── app/
│           ├── config.py
│           ├── models/schemas.py
│           ├── routes/         # classify, suggest, summarize, health
│           └── services/       # classifier, suggester, summarizer
```
