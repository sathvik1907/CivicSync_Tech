# CivicSync Test Plan

`PROJECT_PLAN.md` defines the expected product and architecture. This file defines verification requirements.

## 1. Automated Test Areas
- **Progress & Delay Rules**: Weighted progress calculation (weights sum to 100), behind-plan threshold (>= 10 percentage points below due milestones), stale update detection (> 14 days), deadline overdue detection.
- **Budget Calculations**: Paise conversions, unknown budget handling, utilization percentage, negative remaining budget support.
- **Authentication & Security**: Password hashing, 30-minute JWT in HttpOnly cookie, CSRF token validation, server-side role validation, resident registration role limitation.
- **Authorization & Ownership**: Residents cannot view other residents' reports or private photos; officers restricted to assigned department; coordinator cross-department authority.
- **Report Workflow**: Transitions (Submitted -> Under Review -> Assigned -> In Progress -> Resolved), mandatory rejection explanation, idempotent submission.
- **Conflict Detection**: Rule A (shared segment + date overlap), Rule B (nearby <= 200m), Rule C (repeated excavation within 90 days), Rule D (completion uncertainty), canonical pair deduplication.
- **Health & API**: `/health/live` and `/health/ready` check database connectivity.

## 2. End-to-End & Integration Scenarios
- Public visitor browses and filters projects across cities on map and list.
- Resident registers, logs in, files report with photo, receives durable reference code.
- Official logs in, views department queue, responds to report and updates status.
- Resident views status change and official comment.
- Coordinator resolves detected conflict with documented rationale.
