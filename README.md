# SkillBridge — Production-Ready Setup

A peer-to-peer micro-learning platform. Learners book 30–45 min sessions with expert guides. Built with React + Vite (frontend) and Node/Express/Prisma/PostgreSQL/Redis (backend).

---

## Architecture

```
SkillBridge/
├── backend/          Express API (TypeScript)
│   ├── src/
│   │   ├── config/       Database, Redis, Stripe, env validation
│   │   ├── controllers/  auth, sessions, bookings, payments, dashboard
│   │   ├── middleware/   JWT auth, rate limiting, validation, error handling
│   │   ├── routes/       All API route definitions
│   │   └── schemas/      Zod validation schemas
│   └── prisma/       Database schema + migrations + seed
│
└── frontend/         React + Vite + Tailwind (TypeScript)
    └── src/
        ├── components/   Layout, Cards, AuthModal
        ├── context/      ThemeContext, AuthContext
        ├── hooks/        useApi (data fetching)
        ├── lib/          api.ts (fetch client), services.ts, mappers.ts
        ├── pages/        All route pages
        └── types/        UI types + API types
```

---

## Quick Start (Docker)

```bash
# 1. Copy and fill env vars
cp .env.example .env
# Edit .env — at minimum set JWT secrets and Stripe key

# 2. Start everything
docker compose up -d

# 3. Run migrations + seed demo data
docker compose exec backend npx prisma migrate dev --name init
docker compose exec backend npm run db:seed

# 4. Open the app
open http://localhost:5173
```

---

## Manual Development Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- Redis 7+

### Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database URL, Redis URL, JWT secrets, Stripe key

# Run migrations
npm run db:migrate

# Seed demo data
npm run db:seed

# Start dev server (hot reload)
npm run dev
# API available at http://localhost:4000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# VITE_API_URL=http://localhost:4000/api

# Start dev server
npm run dev
# App available at http://localhost:5173
```

---

## Demo Accounts

After seeding, these accounts are available (password: `Password1`):

| Email | Role |
|-------|------|
| `learner@demo.skillbridge.app` | Learner |
| `alex.chen@demo.skillbridge.app` | Guide — Finance |
| `maya.patel@demo.skillbridge.app` | Guide — Communication |
| `james.okafor@demo.skillbridge.app` | Guide — Tech |
| `sofia.reyes@demo.skillbridge.app` | Guide — Mindfulness |

---

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Sign in |
| POST | `/api/auth/logout` | ✓ | Sign out |
| POST | `/api/auth/refresh` | cookie | Refresh access token |
| GET | `/api/auth/me` | ✓ | Current user profile |
| PUT | `/api/auth/change-password` | ✓ | Change password |

### Sessions
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/sessions` | optional | List sessions (filterable) |
| GET | `/api/sessions/:id` | optional | Session detail |
| POST | `/api/sessions` | ✓ GUIDE | Create session |
| PUT | `/api/sessions/:id` | ✓ owner | Update session |
| DELETE | `/api/sessions/:id` | ✓ owner | Deactivate session |
| GET | `/api/sessions/categories` | — | All categories |
| GET | `/api/sessions/:id/reviews` | — | Session reviews |

### Bookings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/bookings` | ✓ | Book a session |
| GET | `/api/bookings/mine` | ✓ | My bookings as learner |
| GET | `/api/bookings/guide` | ✓ GUIDE | My sessions as guide |
| DELETE | `/api/bookings/:id` | ✓ | Cancel booking |
| POST | `/api/bookings/reviews` | ✓ | Submit review |

### Payments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payments/intent` | ✓ | Create Stripe PaymentIntent |
| POST | `/api/payments/webhook` | Stripe sig | Stripe webhook handler |
| GET | `/api/payments/earnings` | ✓ GUIDE | Guide earnings |

### Dashboard
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/dashboard/learner` | ✓ | Learner dashboard data |
| GET | `/api/dashboard/teacher` | ✓ GUIDE | Guide dashboard data |
| GET | `/api/dashboard/templates` | — | Session templates |
| GET | `/api/dashboard/notifications` | ✓ | User notifications |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/:id` | — | Public user profile |
| PUT | `/api/users/me` | ✓ | Update own profile |
| GET | `/api/users/:id/sessions` | — | Guide's sessions |

---

## Stripe Setup

1. Create a Stripe account at [dashboard.stripe.com](https://dashboard.stripe.com)
2. Get your test secret key (`sk_test_...`)
3. Create a webhook pointing to `https://yourapp.com/api/payments/webhook`
4. Enable events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
5. Copy the webhook signing secret (`whsec_...`)

For local webhook testing:
```bash
stripe listen --forward-to localhost:4000/api/payments/webhook
```

---

## Production Deployment

### Environment Variables (Required)

```bash
NODE_ENV=production
DATABASE_URL=postgresql://...       # Neon, Supabase, or Railway
REDIS_URL=redis://...               # Upstash or Redis Cloud
JWT_ACCESS_SECRET=<64-char-hex>     # node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_REFRESH_SECRET=<64-char-hex>    # Different from access secret
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
CORS_ORIGIN=https://yourfrontend.com
```

### Recommended Stack
- **Backend**: Railway, Render, or Fly.io
- **Frontend**: Vercel or Netlify
- **Database**: Neon (PostgreSQL) — free tier available
- **Redis**: Upstash — free tier available

### Deploy Backend to Railway
```bash
railway login
railway init
railway add --service postgres
railway add --service redis
railway up
railway run npx prisma migrate deploy
railway run npm run db:seed
```
