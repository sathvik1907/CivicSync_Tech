# CivicSync — Public Works Transparency & Coordination Platform

[![CivicTech](https://img.shields.io/badge/CivicTech-Hackathon%20MVP-emerald)](https://github.com/sathvik1907/CivicSync)
[![Stack](https://img.shields.io/badge/Stack-MERN%20%2B%20Tailwind%20%2B%20Leaflet-blue)](https://github.com/sathvik1907/CivicSync)
[![Tests](https://img.shields.io/badge/Tests-26%20Passed%20(0%20Failed)-brightgreen)](https://github.com/sathvik1907/CivicSync)
[![License](https://img.shields.io/badge/License-MIT-slate)](LICENSE)

CivicSync is a full-stack, responsive public-works transparency and coordination web application built for citizen empowerment, municipal inter-departmental conflict prevention, and durable civic accountability.

---

## 1. Problem Statement & Core Journey

Urban residents frequently experience uncoordinated public infrastructure disruptions:
- Newly paved roads torn open within weeks by water boards or telecom providers.
- Lack of authoritative facts on project budgets, contractor identities, and delay reasons.
- Unmonitored potholes and broken footpaths with no feedback loop after complaints.
- Lack of inter-departmental coordination between municipal road divisions, water boards, and electricity boards.

### The CivicSync Product Loop
$$\text{Discover Work} \longrightarrow \text{Understand Facts} \longrightarrow \text{Report Issue} \longrightarrow \text{Receive Official Response} \longrightarrow \text{Inspect Coordination}$$

---

## 2. Approved Architecture & Technology Stack

| Layer | Technology | Rationale & Specifications |
|---|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS | High performance, responsive desktop/mobile UI, accessible contrast. |
| **Maps** | Leaflet & React-Leaflet (OpenStreetMap) | Geospatial project exploration and 250m privacy-preserving complaint clustering. |
| **Backend** | Node.js (v24), Express.js REST API | Modular domain architecture mounted under `/api/v1`. |
| **Database** | MongoDB Atlas / Local MongoDB (Mongoose ODM) | GeoJSON `2dsphere` spatial indexing, compound queries, and schema validation. |
| **Authentication** | JWT in `HttpOnly`, `SameSite=Lax` Cookie | 30-minute expiry; DB active user status check on every protected request. |
| **Security** | CSRF Protection, Bcrypt Password Hashing | Origin checks and `X-CSRF-Token` headers for mutating state requests. |
| **Finances** | Integer Paise Storage | Stored in paise ($1\text{ INR} = 100\text{ paise}$) to prevent floating point drift. |
| **Deployment** | Single Node.js Service (Render Free Tier) | Express serves both `/api/v1` and the production Vite bundle from `client/dist`. |

---

## 3. Instant 1-Click Judging Accounts

The frontend includes **Instant Demo Account pills** in the top navigation bar for immediate evaluation:

| Role | Demo Email | Demo Password | Department / Scope |
|---|---|---|---|
| **Resident** | `resident@civicsync.demo` | `ResidentPass123!` | Public issue submission, personal report tracking, private evidence. |
| **Department Officer** | `officer.gcc@civicsync.demo` | `OfficerPass123!` | Greater Chennai Corporation (GCC) Bus Route Roads & Works. |
| **Municipal Coordinator** | `coordinator@civicsync.demo` | `CoordPass123!` | Cross-department oversight, unassigned triage, binding conflict resolution. |

> **Note:** Public registration strictly provisions **Resident** accounts. Official accounts are provisioned via administrative governance.

---

## 4. Key Engineering Implementations

### A. Explainable Coordination Detection (Rules Engine)
Municipal works are checked against four documented, explainable rules:
- **Rule A (Shared Road Segment):** Projects sharing identical recorded road segments with inclusive date overlap $\rightarrow$ **Strong coordination candidate**.
- **Rule B (Nearby Concurrent Work):** Projects located within $\le 200\text{ metres}$ with concurrent execution $\rightarrow$ **Potential nearby disruption**.
- **Rule C (Repeated Excavation):** Subsurface trenching begins within $\le 90\text{ days}$ of prior road restoration $\rightarrow$ **High risk of repeated disruption**.
- **Rule D (Completion Uncertainty):** A project is ongoing past its forecast deadline while another commences in the same area $\rightarrow$ **Advisory / clarification required**.
- **Human Authority:** The coordination engine highlights candidates; municipal coordinators commit binding decisions (`Coordinated`, `Rescheduled`, `Dismissed`) with written justifications.

### B. Citizen Privacy Shield & 250m Heatmap
- Resident household coordinates, raw descriptions, and private evidence photos are strictly restricted to the submitter and assigned officials.
- The public Community Insights heatmap aggregates reports into **approximate 250-metre centroid grid cells** ($~0.00225^\circ$ latitude), providing neighborhood density insights without tracking individuals.

### C. Milestone Weighted Progress
- Milestone weights must sum to exactly $100\%$.
- Overall progress is calculated:
  $$\text{Progress} = \sum \frac{\text{Weight}_i \times \text{MilestoneProgress}_i}{100}$$
- **Accountability Warnings:**
  - **Overdue:** Current date has passed applicable deadline and project is unfinished.
  - **Behind Plan:** Actual progress is $\ge 10\text{ percentage points}$ below expected progress from due milestones.
  - **Stale Update:** No official inspection log recorded for $> 14\text{ days}$.

---

## 5. Quickstart & Local Setup Guide

### Prerequisites
- Node.js v18+ (tested on Node v24.18.0)
- npm v9+
- MongoDB instance (local on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

### Installation (PowerShell / Terminal)
```powershell
# 1. Clone repository
git clone https://github.com/sathvik1907/CivicSync
cd CivicSync

# 2. Install dependencies for both backend and frontend
npm run install:all

# 3. Configure environment variables
# Copy server/.env.example to server/.env (pre-configured for local development)
cp server/.env.example server/.env

# 4. Seed the demonstration dataset (18 projects, 8 departments, 4 reports, demo users)
npm run seed

# 5. Build frontend production assets
npm run build

# 6. Run automated test suite (26 tests)
npm test

# 7. Start unified CivicSync service
npm start
```
The application will be live at **`http://localhost:5000`**!

---

## 6. Project File Structure

```text
CivicSync/
├── client/
│   ├── public/
│   │   └── images/
│   │       ├── projects/         # High-resolution infrastructure assets
│   │       ├── issues/           # Citizen reported issue evidence photos
│   │       ├── before-after/     # Matched before-after comparison pairs
│   │       └── manifest.json     # Asset manifest with categories and provenance
│   ├── src/
│   │   ├── components/           # Reusable UI (Navbar, ProjectCard, ProjectMap, etc.)
│   │   ├── context/              # AuthContext with 1-click quick login
│   │   ├── pages/                # Explore, ProjectDetail, Insights, Reports, Admin
│   │   ├── services/             # API client with automatic CSRF & credentials
│   │   ├── App.jsx               # React Router route definitions
│   │   ├── main.jsx              # Application bootstrap
│   │   └── index.css             # Tailwind CSS & Leaflet map overrides
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/               # DB connection & environment configuration
│   │   ├── controllers/          # Request handlers for auth, projects, reports, etc.
│   │   ├── data/                 # projects.json, departments.json, seed.js
│   │   ├── middleware/           # auth.js, csrf.js, errorHandler.js, rateLimiter.js
│   │   ├── models/               # Mongoose models (Project, User, Report, etc.)
│   │   ├── routes/               # REST API route declarations under /api/v1
│   │   ├── services/             # Core business logic & coordination engine
│   │   ├── utils/                # calculations.js, geo.js, coordinationRules.js
│   │   ├── app.js                # Express app setup & SPA fallback serving
│   │   └── server.js             # HTTP server entrypoint
│   ├── tests/                    # Automated integration & calculation tests
│   ├── .env.example
│   └── package.json
├── AGENTS.md                     # Engineering agent instructions & discipline
├── PROJECT_PLAN.md               # Canonical architecture specification
├── TASKS.md                      # Ordered task queue & acceptance status
├── TEST_PLAN.md                  # Verification requirements
├── CURRENT_STATE.md              # Live verified repository status
├── DECISIONS.md                  # Approved decisions log
└── package.json                  # Root convenience scripts
```

---

## 7. REST API Endpoints (`/api/v1`)

### Health
- `GET /health/live` — Process liveness verification.
- `GET /health/ready` — Database readiness check.

### Authentication
- `GET /api/v1/auth/csrf` — Obtain session CSRF token.
- `POST /api/v1/auth/register` — Resident registration (role strictly enforced).
- `POST /api/v1/auth/login` — Sign in, issues 30-minute HttpOnly cookie.
- `POST /api/v1/auth/logout` — Clear session cookie.
- `GET /api/v1/auth/me` — Current authenticated profile and role.

### Projects
- `GET /api/v1/projects` — Filtered, searchable project list with pagination.
- `GET /api/v1/projects/map` — Map coordinates and summary previews.
- `GET /api/v1/projects/:id` — Full project details with health, budget, updates.
- `POST /api/v1/projects` — Create project draft (*officer/coordinator*).
- `POST /api/v1/projects/:id/publish` — Publish draft (*milestone weight check*).
- `POST /api/v1/projects/:id/updates` — Commit official inspection update (*officer*).

### Civic Reports
- `POST /api/v1/reports` — Submit report with up to 3 photos (*resident, idempotent*).
- `GET /api/v1/reports/mine` — Personal reports (*resident*).
- `GET /api/v1/reports/admin` — Department queue (*officer/coordinator*).
- `GET /api/v1/reports/:id` — Detail and audit trail (*authorized access*).
- `POST /api/v1/reports/:id/actions` — Status transitions: `REVIEW`, `ASSIGN`, `START_WORK`, `RESOLVE`, `REJECT` (*official*).

### Coordination
- `GET /api/v1/conflicts` — List all active Rule A, B, C, D candidates.
- `GET /api/v1/conflicts/project/:id` — Conflicts affecting specific project.
- `POST /api/v1/conflicts/decision` — Record binding decision (*coordinator*).

### Community Insights
- `GET /api/v1/insights` — 250m privacy grid clusters and category totals.

---

## 8. Automated Verification Results

All 26 automated backend tests pass cleanly with zero warnings:

```text
✔ GET /health/live returns 200 and status ok
✔ GET /health/ready returns 200 when database is connected
✔ GET /api/v1/reference-data returns cities, departments, road segments
✔ GET /api/v1/projects returns paginated projects
✔ GET /api/v1/auth/csrf returns csrf token and sets cookie
✔ Protected routes reject anonymous request with 401
✔ Official routes reject unauthenticated mutations
✔ Unknown /api/* route returns 404 JSON (not HTML)
✔ Direct SPA route navigation returns HTML index
✔ Public registration creates only resident accounts and blocks role escalation
✔ calculateWeightedProgress: handles valid weights summing to 100
✔ calculateExpectedProgress: sums weights of milestones whose due date has passed
✔ evaluateProjectHealth: detects overdue project when deadline has passed
✔ evaluateProjectHealth: detects behind plan when actual progress is >= 10 points below expected
✔ evaluateProjectHealth: detects stale update when no update for > 14 days
✔ calculateBudgetMetrics: correctly computes remaining and utilization percentage
✔ calculateBudgetMetrics: supports negative remaining budget and >100% utilization
✔ formatPaiseToINR: formats Crores and Lakhs cleanly
✔ datesOverlap: accurately checks inclusive date overlap
✔ getCanonicalPair: orders pair IDs predictably regardless of argument order
✔ Rule A: Shared Road Segment with Overlapping Dates produces Strong candidate
✔ Rule B: Nearby Concurrent Work (<= 200m) triggers potential disruption candidate
✔ Rule C: Repeated Excavation triggers if subsequent work starts within 90 days
✔ Rule D: Completion Uncertainty triggers if earlier work is ongoing past forecast
────────────────────────────────────────────────────────────────
ℹ tests 26 | pass 26 | fail 0 | duration 1.62s
```

---

## 9. Demonstration Dataset & Assets Summary

- **Total Synthetic Projects Seeded:** 18 rich projects across Chennai, Bengaluru, and Hyderabad.
- **Total Image Assets Generated:** 17 individual high-resolution assets in `client/public/images/`.
- **Matched Before-and-After Pairs:**
  1. *Road Resurfacing:* Pothole cluster $\leftrightarrow$ Resurfaced asphalt road on OMR.
  2. *Stormwater Drainage:* 1-foot underpass flood $\leftrightarrow$ Drained carriageway with RCC drain grates.
  3. *Pedestrian Footpath:* Broken stone sidewalk $\leftrightarrow$ Interlocking pavers with yellow tactile strip.
- **Asset Manifest:** Located at `client/public/images/manifest.json`.

---

## 10. Deployment on Render Free Tier

1. Create a **Web Service** on Render connected to `https://github.com/sathvik1907/CivicSync`.
2. Configure **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGODB_URI`: *Your MongoDB Atlas connection string*
   - `JWT_SECRET`: *A 32+ character random secret string*
   - `JWT_ISSUER`: `civicsync.onrender.com`
   - `JWT_AUDIENCE`: `civicsync.users`
   - `CLIENT_URL`: `https://your-service-name.onrender.com`
   - `COOKIE_SECURE`: `true`
3. Configure **Build & Start Commands**:
   - **Build Command:** `npm run install:all && npm run build`
   - **Start Command:** `npm start`
4. The service will wake on initial visit and serve the API under `/api/v1` and the React frontend under `/`.

---

## 11. CivicTech Hackathon Walkthrough Video

For video evaluation, follow this 3-minute sequence:
1. **Explore Works (`/`):** Filter by city (Chennai $\rightarrow$ Bengaluru $\rightarrow$ Hyderabad), switch to Map view, inspect overdue & behind-plan warning badges.
2. **Project Detail (`/projects/:id`):** View OMR Resurfacing, inspect milestone progress breakdown, test the interactive **Before-and-After slider**, and inspect the inter-departmental conflict warning.
3. **Resident Issue Reporting (`/reports/new`):** Click "Resident Demo" login pill, submit an issue with photo attachment, and receive durable tracking code `RPT-2026-XXXX`.
4. **Official Resolution (`/admin`):** Click "Officer Demo" login pill, open `/admin/reports`, view the submitted report, add an official engineering response, and mark resolved.
5. **Coordination Resolution (`/admin/coordination`):** Click "Coordinator Demo" login pill, inspect Rule A and Rule C conflicts, and record a binding joint site protocol decision.
6. **Community Insights (`/insights`):** View the 250m privacy grid complaint heatmap and civic resolution metrics.