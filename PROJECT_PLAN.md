# CivicSync Project Plan

**Status:** Approved specification; implementation in progress
**Canonical source:** This file is the source of truth for the approved CivicSync product and technical design.
**Delivery constraint:** 24-hour hackathon.
**Scope changes:** Require explicit user approval and an update to `DECISIONS.md` before implementation changes.

## 1. Purpose and problem

CivicSync is a public-works transparency and coordination platform. Residents can discover nearby public works, understand responsibility, progress, spending and disruption, report problems with evidence, and track official responses. Officials can publish and maintain project information, handle reports and identify potentially overlapping work.

The primary product loop is:

> Discover work → understand it → report an issue → receive an official response → inspect accountability and coordination.

## 2. Approved Features

1. Interactive project map and list discovery.
2. Nearby projects, search and combined filters.
3. Public project details: purpose, location, department, contractor, schedule, source and update time.
4. Project status, weighted milestones, progress updates and evidence.
5. Citizen issue reporting with location, category, description and photographs.
6. Resident report tracking and official assignment, response and resolution.
7. Official project and report administration with department boundaries.
8. Budget and contractor transparency (amounts stored in integer paise).
9. Explainable delay, behind-plan and stale-update indicators.
10. Project coordination candidates (Rules A, B, C, D) and recorded resolutions.
11. Before–after comparison using explicitly paired, labelled photographs.
12. Complaint heatmap and community insights (250m grid).
13. Responsive and accessible public and official interfaces.
14. Optional grounded AI project summary, outside every critical workflow.

## 3. Technology Stack

- **Frontend:** React + Vite + React Router + Tailwind CSS + Leaflet
- **Backend:** Node.js + Express.js REST API under `/api/v1`
- **Database:** MongoDB Atlas / Local MongoDB (Mongoose ODM)
- **Authentication:** JWT in Secure, HttpOnly cookie with `SameSite=Lax` + CSRF token
- **Media:** Cloudinary with local development fallback
- **Hosting:** Single Node.js service serving static React build and Express API
