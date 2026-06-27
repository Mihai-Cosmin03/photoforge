# PhotoForge

A full-stack web platform for photography portfolio management, client bookings, and graphic material generation.

**Live demo:** [photoforge-one.vercel.app](https://photoforge-one.vercel.app)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Framer Motion, Socket.IO Client |
| Backend | NestJS 11, TypeORM, Passport JWT |
| Database | PostgreSQL |
| Storage | Cloudflare R2 (or local filesystem) |
| Real-time | Socket.IO (WebSockets) |
| Deployment | Vercel (frontend) · Railway (backend + DB) |

---

## Features

- **Photographer profiles** — apply, get approved by admin, manage bio/specialties/city
- **Portfolio system** — upload photos, set cover, organise by category
- **Booking system** — clients book sessions or intro calls; photographers accept/decline with notes
- **Messaging** — real-time conversations between clients and photographers via WebSockets
- **Private galleries** — share photo galleries with clients via email-gated links
- **Pricing packages** — photographers define packages with price, duration, photo count
- **Availability calendar** — photographers mark available/unavailable dates
- **Reviews & ratings** — clients leave reviews after sessions
- **Template editor** — generate and download business cards, CVs, flyers, invitations, postcards, and posters as PDF
- **Notifications** — in-app notification bell with real-time updates
- **Search** — filter photographers by name, specialty, city
- **Admin panel** — approve/reject photographers and portfolios, manage categories

---

## Project Structure

```
photoforge/
├── src/                  # React frontend (Vite)
│   ├── components/       # Reusable UI components
│   ├── pages/            # Route-level pages
│   ├── context/          # Auth, Toast context
│   ├── services/         # API service layer
│   ├── hooks/            # Custom React hooks
│   └── data/             # Static data (templates, categories)
├── server/               # NestJS backend
│   └── src/
│       ├── auth/         # JWT authentication
│       ├── users/        # User management
│       ├── photographers/# Photographer profiles & dashboard
│       ├── portfolios/   # Portfolio CRUD & photo upload
│       ├── bookings/     # Booking requests & status
│       ├── conversations/# Messaging & WebSockets
│       ├── galleries/    # Private client galleries
│       ├── pricing/      # Pricing packages
│       ├── reviews/      # Reviews & ratings
│       ├── notifications/# In-app notifications
│       ├── search/       # Search endpoint
│       ├── categories/   # Photography categories
│       ├── upload/       # File upload (R2 or local)
│       └── admin/        # Admin endpoints
├── public/               # Static assets
├── vercel.json           # Vercel SPA + API proxy config
└── docker-compose.yml    # Local PostgreSQL via Docker
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ (or Docker)

### 1. Clone the repository

```bash
git clone https://github.com/Mihai-Cosmin03/photoforge.git
cd photoforge
```

### 2. Start the database

```bash
docker-compose up -d
```

Or connect to an existing PostgreSQL instance and set the credentials in the server `.env`.

### 3. Configure environment variables

**Frontend** — create `.env` in the project root:

```env
VITE_API_URL=http://localhost:3001
```

**Backend** — create `.env` inside `server/`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=photoforge
DB_USER=postgres
DB_PASS=your_password

# JWT
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d

# Server
PORT=3001

# Frontend (for CORS)
FRONTEND_URL=http://localhost:5173

# Cloudflare R2 — leave empty to save files locally
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=photoforge-uploads
R2_PUBLIC_URL=

# SMTP email — leave empty to disable email sending
MAIL_HOST=
MAIL_PORT=587
MAIL_USER=
MAIL_PASS=
MAIL_FROM="PhotoForge <noreply@photoforge.app>"
```

### 4. Install dependencies and run

```bash
# Backend
cd server
npm install
npm run start:dev

# Frontend (new terminal, from project root)
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and the API at `http://localhost:3001`.

### 5. Seed initial data (optional)

```bash
cd server
npm run seed
```

---

## Deployment

The application is deployed as two separate services:

- **Frontend** is deployed to [Vercel](https://vercel.com). `vercel.json` configures SPA routing and proxies `/api/*` requests to the Railway backend.
- **Backend** is deployed to [Railway](https://railway.app) alongside a managed PostgreSQL instance.

To deploy your own instance:

1. Push the repo to GitHub
2. Connect the repo to Vercel (set `VITE_API_URL` to your Railway backend URL)
3. Create a Railway project, add a PostgreSQL plugin, and deploy the `server/` directory (set all `server/.env` variables in Railway's environment settings)

---

## Environment Variables Reference

### Frontend (`/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the NestJS backend |

### Backend (`/server/.env`)

| Variable | Description |
|---|---|
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port (default `5432`) |
| `DB_NAME` | Database name |
| `DB_USER` | Database user |
| `DB_PASS` | Database password |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`) |
| `PORT` | Port the NestJS server listens on |
| `FRONTEND_URL` | Allowed CORS origin (your frontend URL) |
| `R2_ACCOUNT_ID` | Cloudflare R2 account ID |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 access key |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 secret key |
| `R2_BUCKET` | R2 bucket name |
| `R2_PUBLIC_URL` | Public base URL for uploaded files |
| `MAIL_HOST` | SMTP host for email sending |
| `MAIL_PORT` | SMTP port |
| `MAIL_USER` | SMTP username |
| `MAIL_PASS` | SMTP password |
| `MAIL_FROM` | Sender address shown in emails |

---

## License

This project was developed as a Bachelor's thesis project. All rights reserved.
