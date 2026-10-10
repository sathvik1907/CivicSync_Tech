# CivicSync Decisions Log

| Decision ID | Date | Subject | Decision & Rationale |
|---|---|---|---|
| DEC-001 | 2026-10-10 | Architecture Stack | Approved MERN stack: React 18 / Vite on frontend with Tailwind CSS and Leaflet; Node.js + Express REST API on backend under `/api/v1`; MongoDB with Mongoose ODM. |
| DEC-002 | 2026-10-10 | Money Storage | Stored in integer paise (1 Rupee = 100 paise) to prevent floating-point inaccuracies. |
| DEC-003 | 2026-10-10 | Security & Auth | 30-minute JWT stored in HttpOnly, SameSite=Lax cookie. CSRF token validation on state-changing API endpoints. Server checks DB user active status on each protected request. |
| DEC-004 | 2026-10-10 | Resident Privacy | Resident identities, private descriptions, and private evidence photographs are strictly restricted to the owning resident and assigned officials. Never publicly exposed. |
| DEC-005 | 2026-10-10 | Coordination Rules | Rule A (shared segment), Rule B (nearby <= 200m), Rule C (repeated excavation within 90 days), Rule D (completion uncertainty past forecast). Human officials make final binding decisions. |
| DEC-006 | 2026-10-10 | Local / Atlas DB | Use MongoDB (local running on port 27017 or Atlas via `MONGODB_URI`), fully compatible with Mongoose. |
