# CivicSync Tech — Public Works Transparency & Coordination Platform

CivicSync is a full-stack CivicTech web application designed to improve transparency in public infrastructure projects, encourage citizen participation, and help municipal departments identify potentially overlapping construction work.

Residents can explore public works, understand project progress, report civic issues, and track official responses. Officials can manage projects, review reports, and coordinate work across departments.

## Key Features

### 1. Public Project Discovery
- Explore infrastructure projects through map and list views.
- Search projects and filter by city, department, status, and work type.
- View project details, schedules, contractors, milestones, and available budget information.
- Identify overdue projects, projects behind schedule, and projects with stale updates.

### 2. Citizen Issue Reporting
- Report potholes, damaged roads, drainage problems, waterlogging, broken footpaths, and other civic issues.
- Attach photographs and location information.
- Track submitted reports and review official responses.
- Access personal reports through authenticated accounts.

### 3. Role-Based Dashboards
CivicSync supports three primary demonstration roles:

- **Resident:** Submit civic issues and track personal reports.
- **Department Officer:** Manage departmental projects and respond to assigned reports.
- **Municipal Coordinator:** Review coordination candidates and record cross-department decisions.

Authorization is enforced by the backend rather than relying only on frontend visibility.

### 4. Explainable Project Coordination
The coordination engine identifies potential conflicts using four rules:

- **Rule A — Shared Road Segment:** Detects projects on the same recorded road segment with overlapping dates.
- **Rule B — Nearby Concurrent Work:** Identifies potentially disruptive projects within 200 metres.
- **Rule C — Repeated Excavation:** Flags subsequent excavation within 90 days of earlier road restoration.
- **Rule D — Completion Uncertainty:** Flags cases where a project remains ongoing past its forecast deadline while related work is planned.

The system provides explanations for detected candidates. Authorized officials make the final coordination decisions.

### 5. Community Insights and Evidence
- Community complaint categories and aggregate statistics.
- A privacy-preserving complaint heatmap using approximate 250-metre grid cells.
- Before-and-after image comparisons.
- Realistic synthetic infrastructure images for demonstration purposes.

**Important:** Synthetic projects, demonstration budgets, contractors, and generated images are labelled as illustrative data, not verified government records or actual completion evidence.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Routing | React Router |
| Maps | Leaflet and OpenStreetMap-compatible tiles |
| Backend | Node.js and Express.js |
| Database | MongoDB Atlas or local MongoDB |
| ODM | Mongoose |
| Authentication | JWT in HttpOnly cookies |
| Security | Password hashing, CSRF protection, server-side authorization |
| Media | Cloudinary integration |
| Testing | Node.js test runner |
| Deployment | Render-compatible single Node.js service |

## Project Structure

```text
CivicSync_Tech/
├── client/
│   ├── public/
│   │   └── images/
│   └── src/
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── data/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── tests/
│   └── .env.example
├── AGENTS.md
├── CURRENT_STATE.md
├── DECISIONS.md
├── PROJECT_PLAN.md
├── TASKS.md
├── TEST_PLAN.md
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

Install the following:

- Node.js 18 or later
- npm
- A MongoDB Atlas account or local MongoDB installation
- Git

### 1. Clone the repository

```bash
git clone https://github.com/sathvik1907/CivicSync_Tech.git
cd CivicSync_Tech
```

### 2. Install dependencies

Run from the project root:

```bash
npm run install:all
```

### 3. Configure environment variables

Create or update `server/.env` using `server/.env.example` as a template.

Example configuration:

```dotenv
NODE_ENV=development
PORT=9000
MONGODB_URI=mongodb+srv://USERNAME:ENCODED_PASSWORD@YOUR_CLUSTER.mongodb.net/civicsync?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_long_random_secret
JWT_ISSUER=civicsync.local
JWT_AUDIENCE=civicsync.users
CLIENT_URL=http://localhost:5173
```

Replace the placeholders with your actual configuration.

**Security:** Never commit `.env` files, database credentials, API secrets, or passwords to GitHub.

The backend must load `server/.env` correctly. If your server uses a different environment-loading configuration, adjust it accordingly.

### 4. Seed demonstration data

From the project root:

```bash
npm run seed
```

The demonstration dataset is designed to include:

- 18 synthetic infrastructure projects
- Department and contractor records
- Road segments
- Demonstration user accounts
- Project updates
- Resident reports
- Sample coordination decisions

The seed operation requires a valid database connection.

### 5. Build the frontend

```bash
npm run build
```

This generates the production frontend build in `client/dist`.

### 6. Run automated tests

```bash
npm test
```

Review the test summary and ensure no tests failed or were cancelled.

### 7. Start the application

From the project root:

```bash
npm start --prefix server
```

If your `server/.env` specifies `PORT=9000`, and the application loads that variable correctly, open:

**http://localhost:9000**

If you configure a different port, use that port in the browser URL.

## Demo Accounts

After successfully seeding the database, use the following demonstration accounts if they exist in your configured database:

| Role | Email | Password |
|---|---|---|
| Resident | `resident@civicsync.demo` | `ResidentPass123!` |
| Department Officer | `officer.gcc@civicsync.demo` | `OfficerPass123!` |
| Municipal Coordinator | `coordinator@civicsync.demo` | `CoordPass123!` |

These credentials are for local demonstration only. Do not use them as production credentials.

## API Overview

The backend exposes REST APIs under `/api/v1`.

| Endpoint | Purpose |
|---|---|
| `GET /health/live` | Server liveness |
| `GET /health/ready` | Database readiness |
| `GET /api/v1/auth/csrf` | Obtain a CSRF token |
| `POST /api/v1/auth/register` | Register a resident |
| `POST /api/v1/auth/login` | Authenticate a user |
| `POST /api/v1/auth/logout` | End the current cookie session |
| `GET /api/v1/projects` | Search and list projects |
| `GET /api/v1/projects/map` | Retrieve project map data |
| `GET /api/v1/projects/:id` | View project details |
| `POST /api/v1/reports` | Submit a civic report |
| `GET /api/v1/reports/mine` | View personal reports |
| `GET /api/v1/reports/admin` | Retrieve the official report queue |
| `GET /api/v1/conflicts` | Retrieve coordination candidates |
| `GET /api/v1/insights` | Retrieve community insights |

Consult the backend route files for the current request parameters, validation rules, and authorization requirements.

## Security and Privacy

CivicSync is designed with the following controls:

- Password hashing and short-lived authentication tokens.
- HttpOnly authentication cookies.
- CSRF protection for state-changing requests.
- Backend-enforced role and ownership checks.
- Department-level restrictions for official operations.
- Private resident descriptions, locations, and photographs.
- Aggregated public complaint insights.

Production deployment requires correctly configured environment variables, HTTPS, database permissions, and private media delivery.

## Deployment

CivicSync is designed to support deployment as a single Node.js service that serves both the Express API and the built React frontend.

A typical Render configuration is:

**Build command**

```bash
npm run install:all && npm run build
```

**Start command**

```bash
npm start
```

Configure `MONGODB_URI`, `JWT_SECRET`, `JWT_ISSUER`, `JWT_AUDIENCE`, `CLIENT_URL`, and any required Cloudinary variables in the hosting dashboard.

Do not commit production credentials.

Deployment is not considered verified until the hosted application, health endpoints, database persistence, authentication, and direct-route refresh have been tested.

## Verification Checklist

Before presenting CivicSync as a completed demonstration, verify:

- [ ] Frontend production build succeeds.
- [ ] Backend automated tests pass without cancellations.
- [ ] MongoDB connects successfully.
- [ ] Seeded projects appear in the application.
- [ ] Login works for each demonstration role.
- [ ] Residents can submit and track reports.
- [ ] Reports persist after page refresh.
- [ ] Department and coordinator permissions work correctly.
- [ ] Coordination candidates and community insights load.
- [ ] Project images and before-and-after comparisons work.
- [ ] Production deployment is tested, if deployed.
- `AGENTS.md` — Development and verification instructions.

## License

This project is intended for educational and hackathon demonstration purposes. Add or update the repository's `LICENSE` file to reflect the license under which you intend to distribute the code and assets.
