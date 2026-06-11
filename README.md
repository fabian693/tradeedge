# TradeEdge

**Professional trading journal, psychology tracker, and learning platform for funded futures traders.**

Built for traders using the TradeEdge Method — a killzone-based, 2-confirmation strategy focused on NQ and ES futures.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v3 |
| Backend | Node.js, Express |
| Database | PostgreSQL, Prisma ORM |
| Auth | Passport.js (local + Google OAuth) |
| File uploads | Cloudinary |
| Email | Nodemailer |
| Charts | Recharts |

---

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ running locally or a hosted instance (Supabase, Railway, Neon)
- A Cloudinary account (free tier is fine)
- A Google Cloud project with OAuth credentials (optional — email/password works without it)

---

## Quick Start

### 1. Clone and install

```bash
cd ~/tradeedge

# Install root workspace packages
npm install

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in:

```env
# Required
DATABASE_URL=postgresql://user:password@localhost:5432/tradeedge
SESSION_SECRET=your-long-random-secret-string-here

# Google OAuth (optional — skip if not using Google sign-in)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Cloudinary (required for screenshot uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (optional — for password reset and weekly digest)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@email.com
EMAIL_PASS=your-app-password

# App URLs
CLIENT_URL=http://localhost:3000
PORT=5000
```

**Generating a session secret:**
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 3. Set up the database

```bash
cd server

# Generate Prisma client
npx prisma generate

# Run migrations (creates all tables)
npx prisma migrate dev --name init

# Optional: open Prisma Studio to inspect the database
npx prisma studio
```

### 4. Start development servers

Open two terminals:

**Terminal 1 — Backend (port 5000):**
```bash
cd ~/tradeedge/server
npm run dev
```

**Terminal 2 — Frontend (port 3000):**
```bash
cd ~/tradeedge/client
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Google OAuth Setup (optional)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID (Web Application)
4. Add authorised redirect URI: `http://localhost:5000/api/auth/google/callback`
5. Copy Client ID and Client Secret into `.env`

---

## Cloudinary Setup

1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier: 25GB storage)
2. Go to Dashboard → copy Cloud Name, API Key, API Secret
3. Paste into `.env`

Screenshot uploads in the trade journal will not work without this. Everything else functions without Cloudinary.

---

## Project Structure

```
tradeedge/
├── client/                     # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/         # AppLayout, Sidebar, TopBar, ProtectedRoute
│   │   │   └── shared/         # Button, Card, Input, Badge, Modal, etc.
│   │   ├── context/            # AuthContext
│   │   ├── hooks/              # useAuth, useTrades, useAccounts, useAnalytics, usePsychology
│   │   ├── lib/                # axios instance, queryClient, utils
│   │   └── pages/
│   │       ├── auth/           # Login, Register, ForgotPassword
│   │       ├── accounts/       # AccountsPage
│   │       ├── analytics/      # AnalyticsPage
│   │       ├── checklist/      # ChecklistPage
│   │       ├── journal/        # JournalPage, NewTradePage
│   │       ├── learn/          # LearnPage (full TradeEdge Method content)
│   │       ├── psychology/     # BaselinePage, PsychologyPage
│   │       ├── review/         # WeeklyReviewPage
│   │       ├── settings/       # SettingsPage
│   │       └── DashboardPage.jsx
│   └── tailwind.config.js
│
├── server/                     # Express backend
│   └── src/
│       ├── controllers/        # Route handlers
│       ├── middleware/         # requireAuth, requirePro
│       ├── routes/             # Express routers
│       └── utils/
│           ├── passport.js     # Auth strategies
│           ├── psychology.js   # Scoring logic
│           └── checklist.js    # Verdict logic
│
├── prisma/
│   └── schema.prisma           # Full database schema
│
└── .env.example
```

---

## API Reference

All endpoints are prefixed with `/api`.

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Sign in |
| GET | `/auth/google` | Google OAuth redirect |
| POST | `/auth/logout` | Sign out |
| GET | `/auth/me` | Current user |
| PUT | `/auth/profile` | Update profile |
| PUT | `/auth/change-password` | Change password |
| DELETE | `/auth/account` | Delete account |

### Trades
| Method | Path | Description |
|---|---|---|
| GET | `/trades` | List trades (filters: market, session, result, dateFrom, dateTo, page, limit) |
| POST | `/trades` | Create trade |
| GET | `/trades/:id` | Get trade |
| PUT | `/trades/:id` | Update trade |
| DELETE | `/trades/:id` | Delete trade |
| POST | `/trades/:id/screenshot` | Upload screenshot |
| GET | `/trades/export/csv` | Export CSV |

### Accounts
| Method | Path | Description |
|---|---|---|
| GET | `/accounts` | List accounts |
| POST | `/accounts` | Create account |
| GET | `/accounts/:id` | Get account + computed stats |
| PUT | `/accounts/:id` | Update account |
| DELETE | `/accounts/:id` | Delete account |

### Psychology
| Method | Path | Description |
|---|---|---|
| GET | `/psychology/baseline` | Get baseline |
| POST | `/psychology/baseline` | Submit baseline (20 scores) |
| GET | `/psychology/checkins/today` | Today's check-in |
| GET | `/psychology/checkins` | Check-in history |
| POST | `/psychology/checkins` | Submit check-in |
| GET | `/psychology/reflections` | Reflections |
| POST | `/psychology/reflections` | Add reflection |

### Analytics
| Method | Path | Description |
|---|---|---|
| GET | `/analytics/overview` | Summary stats |
| GET | `/analytics/equity` | Equity curve data |
| GET | `/analytics/by-session` | Win rate by session |
| GET | `/analytics/by-confirmation` | Win rate by confirmation combo |
| GET | `/analytics/by-market` | Win rate by market |
| GET | `/analytics/by-grade` | Win rate by setup grade |
| GET | `/analytics/psychology-correlation` | Scatter data |
| GET | `/analytics/weekly-comparison` | This week vs last week |

### Checklist
| Method | Path | Description |
|---|---|---|
| GET | `/checklists` | List checklists |
| GET | `/checklists/today` | Today's checklist |
| POST | `/checklists` | Create/update checklist (auto-computes verdict) |

### Weekly Reviews
| Method | Path | Description |
|---|---|---|
| GET | `/weekly-reviews` | List reviews |
| GET | `/weekly-reviews/current` | Current week auto-populated stats |
| POST | `/weekly-reviews` | Create review |
| GET | `/weekly-reviews/:id` | Get review |
| PUT | `/weekly-reviews/:id` | Update review |

---

## Feature Overview

### Dashboard
- GO/NO-GO psychology banner
- P&L, win rate, average R:R, total trades (live from API)
- Equity curve with animated green pulse dot on latest point
- Target line and drawdown floor overlays
- Account mini cards with progress bars
- Recent trades table

### Trade Journal
- Log trades with full TradeEdge Method fields (IFVG timeframe, 2 confirmations, SL type, setup grade)
- Multi-step form: Session → Setup → Result & Review
- Auto-calculated R:R target and R:R achieved
- Screenshot upload via Cloudinary
- Sortable/filterable table with full row expansion
- CSV export

### Pre-Trade Checklist
- Three phases: Pre Killzone → In Killzone → On Entry
- Real-time verdict: A+ Setup / B Setup / DO NOT TRADE
- Auto-checks consistency rule and daily target from account data
- Auto-saves per session

### Psychology System
- **Baseline test**: 20 questions → profile (Disciplined / Developing / Emotional / High Risk)
- **Daily check-in**: 7 sliders → GO / CAUTION / NO-GO with automatic triggers
- **Post-session reflection**: Rule adherence, emotional state, discipline grade
- **14-day history**: Bar chart coloured by recommendation

### Analytics
- Equity curve with profit target and drawdown floor reference lines
- Win rate by session, market, confirmation combo, setup grade
- Psychology vs performance scatter chart
- Weekly comparison cards

### Accounts (Prop Firm Tracker)
- All prop firm rule fields (drawdown type, consistency rule, daily loss limit)
- Progress bars with colour coding (green → amber → red)
- Projected completion date based on average daily P&L
- Daily profit cap recommendation (20% of profit target)

### Learning Section
Full TradeEdge Method content across 5 parts, 27 lessons:
- Part 1: Market Foundations (5 lessons)
- Part 2: The TradeEdge Method (10 lessons)
- Part 3: The Full Process (5 lessons)
- Part 4: Prop Firm Trading (7 lessons)
- Part 5: Resources (5 lessons)

Each lesson has collapsible sections: Explanation, Why It Matters, Common Mistakes, Quick Summary.

### Settings
- Profile (name, email, experience level, prop firm, preferred session, timezone)
- Notifications (killzone reminders, daily check-in, weekly review, account warnings)
- Security (change password)
- Subscription (Free vs Pro, upgrade CTA)
- Data (CSV export, delete account)

---

## Access Tiers

| Feature | Free | Pro (£20/mo) |
|---|---|---|
| Trade logging | 5/month | Unlimited |
| Psychology system | ✓ | ✓ |
| Full analytics | ✗ | ✓ |
| Prop firm tracker | ✗ | ✓ |
| Multiple accounts | ✗ | ✓ |
| Screenshot uploads | ✗ | ✓ |
| Weekly reviews | ✗ | ✓ |
| CSV export | ✗ | ✓ |
| Killzone reminders | ✗ | ✓ |
| Learning section | ✗ | ✓ |

---

## Design System

| Token | Value |
|---|---|
| Background | `#0A0A0F` |
| Surface | `#12121A` |
| Surface 2 | `#1A1A28` |
| Border | `#2A2A3A` |
| Text primary | `#F0F0F5` |
| Text secondary | `#8888AA` |
| Accent (green) | `#00C896` |
| Warning (amber) | `#F5A623` |
| Danger (red) | `#E74C3C` |
| UI font | Inter |
| Number font | JetBrains Mono |

---

## Deployment

### Frontend (Vercel / Netlify)
```bash
cd client
npm run build
# Deploy the dist/ folder
```

Set environment variable: `VITE_API_URL=https://your-api-domain.com`

Update `vite.config.js` proxy to use the env variable in production.

### Backend (Railway / Render / Fly.io)
```bash
cd server
# Set all .env variables in your hosting platform
npm start
```

Required environment variables on the server:
- `DATABASE_URL` — PostgreSQL connection string
- `SESSION_SECRET` — Random secret (32+ chars)
- `CLIENT_URL` — Frontend URL (for CORS and OAuth redirect)
- All Cloudinary, Google OAuth, and email variables

### Database
Run migrations on first deploy:
```bash
npx prisma migrate deploy
```

---

## Development Commands

```bash
# Frontend dev server
cd client && npm run dev

# Backend dev server (with hot reload)
cd server && npm run dev

# Database migrations
cd server && npx prisma migrate dev

# Prisma Studio (database GUI)
cd server && npx prisma studio

# Generate Prisma client after schema changes
cd server && npx prisma generate

# Build frontend for production
cd client && npm run build
```

---

## Troubleshooting

**"Cannot connect to database"**
- Verify `DATABASE_URL` is correct in `.env`
- Ensure PostgreSQL is running: `pg_ctl status` or check your hosting provider dashboard
- Run `npx prisma migrate dev` from the `server/` directory

**"Google OAuth not working"**
- Verify redirect URI in Google Console matches exactly: `http://localhost:5000/api/auth/google/callback`
- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set correctly
- Google OAuth is optional — email/password auth works without it

**"Screenshots not uploading"**
- Verify all three Cloudinary env vars are set: `CLOUD_NAME`, `API_KEY`, `API_SECRET`
- Check Cloudinary dashboard for any upload limits on free tier

**"Session not persisting after restart"**
- The session store uses PostgreSQL via `connect-pg-simple`. Run `npx prisma migrate dev` to ensure the `Session` table exists.

---

## Licence

Private — all rights reserved.
