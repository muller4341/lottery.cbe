# Apartment Lottery System

A full-stack apartment housing lottery management system.

Three sites — **German**, **Ayer-tena**, **Girar** — each with their own inventory of
houses. Admins upload the house inventory and the applicant list via Excel, then draw
the lottery for any `(site, bed type, area)` combination. Winners are picked at random
and assigned to specific houses; remaining applicants go onto a waitlist.

The result for every draw can be downloaded as a clean Excel file (Summary + Winners +
Waitlist sheets).

---

## Stack

- **Frontend**: React 18 + Vite + TailwindCSS + React Router + Axios
- **Backend**: Node.js + Express + JWT + Multer + ExcelJS
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Admin only (username + password → JWT)

---

## Project Structure

```
apartment-lottery/
├── backend/                # Express + Prisma API
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.js         # Seed default admin
│   ├── src/
│   │   ├── controllers/    # Business logic (auth, houses, applicants, lottery)
│   │   ├── routes/         # Express routes
│   │   ├── middleware/     # JWT auth + Excel upload (multer)
│   │   ├── lib/            # Prisma + JWT helpers
│   │   ├── utils/          # Excel reader
│   │   └── index.js        # Server entry
│   ├── uploads/            # Temp upload dir (auto-cleaned)
│   ├── .env.example
│   └── package.json
└── frontend/               # React + Vite + Tailwind
    ├── src/
    │   ├── api/            # Axios client (auto-injects token)
    │   ├── context/        # AuthContext
    │   ├── layouts/        # AppLayout (sidebar + header)
    │   ├── pages/          # Login, Dashboard, Houses, Applicants, Lottery, Results
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css       # Tailwind + custom components
    ├── vite.config.js      # Proxies /api → http://localhost:5000
    ├── tailwind.config.js
    └── package.json
```

---

## Prerequisites

- Node.js 18+ (recommended 20+)
- PostgreSQL 13+
- npm (or pnpm / yarn)

---

## Setup

### 1. Database

Create a PostgreSQL database:

```sql
CREATE DATABASE apartment_lottery;
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set DATABASE_URL, JWT_SECRET, DEFAULT_ADMIN_PASSWORD

npm install
npx prisma generate
npx prisma migrate dev --name init   # creates tables
npm run seed                          # creates default admin (admin / Admin@123)
npm run dev                           # starts API on http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev                           # starts UI on http://localhost:5173
```

Open http://localhost:5173 → log in with `admin` / `Admin@123`.

---

## Workflow

The system enforces this exact workflow:

1. **Upload houses** (Excel) — defines the inventory available per (site, bed type, area).
2. **Upload applicants** (Excel) — each applicant picks one (site, bed type, area).
3. **Draw a lottery** — admin picks the (site, bed type, area) and clicks **Start lottery**.
4. **Download result** — official Excel with Summary + Winners (+ Waitlist if any).

You cannot draw a lottery until houses & applicants for that combination exist, and a
combination can only be drawn **once**.

---

## Excel formats

### Houses (`backend` reads `site, block, house, floor, bedType, area`)

| site     | block | house | floor | bedType | area |
|----------|-------|-------|-------|---------|------|
| German   | A1    | 101   | 1     | 1bed    | 74.5 |
| German   | A1    | 102   | 1     | 1bed    | 74.5 |
| Girar    | B2    | 201   | 2     | 2bed    | 43.6 |
| Ayer-tena| C3    | 301   | 3     | 3bed    | 54.6 |

Header names are case-insensitive and aliases are accepted
(e.g. `blockNumber`/`block_no`, `bedType`/`type`/`houseType`, `area`/`size`).

### Applicants (`employeeId, fullName, site, bedType, area`)

| employeeId | fullName        | site      | bedType | area |
|------------|-----------------|-----------|---------|------|
| EMP001     | Abebe Kebede    | German    | 1bed    | 74.5 |
| EMP002     | Sara Tesfa      | Girar     | 2bed    | 43.6 |
| EMP003     | Daniel Mekonnen | Ayer-tena | 3bed    | 54.6 |

Each employee can apply only once. Re-uploading an existing `employeeId` updates their
preference.

---

## Lottery rules

For a single `(site, bedType, totalArea)` combination:

- Let `N` = number of available houses (not yet allocated)
- Let `M` = number of applicants

| Condition        | Result                                                    |
|------------------|-----------------------------------------------------------|
| `M > N`          | `N` random winners + assigned houses; `M - N` waitlist    |
| `M == N`         | All `M` are winners; no waitlist                          |
| `M < N`          | All `M` are winners; no waitlist; `(N - M)` houses remain |

The shuffle uses Node's `crypto.webcrypto` (cryptographically strong randomness). Each
winner is paired with a randomly-chosen house from the available pool. The draw is run
in a single PostgreSQL transaction, and the picked houses are flagged `isAllocated=true`
so they can't be picked again.

---

## API endpoints (auth required unless noted)

| Method | Path                                  | Description                                    |
|--------|---------------------------------------|------------------------------------------------|
| POST   | `/api/auth/login`                     | Login (returns JWT)                            |
| GET    | `/api/auth/me`                        | Current admin                                  |
| GET    | `/api/sites`                          | List the 3 sites                               |
| POST   | `/api/houses/upload`                  | Upload houses Excel                            |
| GET    | `/api/houses`                         | List houses (filter: `siteId`, `bedType`, `totalArea`) |
| GET    | `/api/houses/summary`                 | Grouped inventory                              |
| POST   | `/api/applicants/upload`              | Upload applicants Excel                        |
| GET    | `/api/applicants`                     | List applicants                                |
| GET    | `/api/applicants/summary`             | Grouped applicants                             |
| POST   | `/api/lottery/draw`                   | Draw one combination                           |
| GET    | `/api/lottery/lotteries`              | List all draws                                 |
| GET    | `/api/lottery/lotteries/:id`          | Draw + per-applicant results                   |
| GET    | `/api/lottery/lotteries/:id/download` | Download result Excel                          |
| GET    | `/api/stats`                          | Dashboard counts                               |

---

## Default credentials

- Username: `admin`
- Password: `Admin@123`

Override with `DEFAULT_ADMIN_USERNAME` / `DEFAULT_ADMIN_PASSWORD` in `.env`, or change
the password directly in the database (run `npm run seed` again to reset).

---

## Sample test data

The repository ships two ready-to-use Excel files in `samples/`:

- `samples/houses.xlsx` — 30+ houses across all 3 sites and bed types
- `samples/applicants.xlsx` — 40+ applicants, including the exact scenarios from the spec:
  - German · 1bed · 74.5m² → 12 houses, 16 applicants → 12 winners + 4 waitlist
  - German · 3bed · 54.6m² → 10 houses, 8 applicants → 8 winners, 0 waitlist

Upload them via the Houses and Applicants pages, then go to **Lottery Draw**, pick
`German / 1bed / 74.5`, and click **Start lottery** to see the full flow.

---

## Production notes

- Replace the JWT secret in `backend/.env` with a long random string.
- Change the default admin password.
- Put the API behind HTTPS (nginx / Caddy / a load balancer).
- Consider adding refresh tokens if you want longer sessions.
- Backups: snapshot PostgreSQL regularly — lottery results are the audit trail.

---

Built for fairness, transparency, and zero ambiguity.
