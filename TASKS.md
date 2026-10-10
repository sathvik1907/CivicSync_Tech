# CivicSync Tasks

`PROJECT_PLAN.md` is the source of truth. This file tracks ordered implementation work and verified status.

## Status legend
- **Pending:** not started.
- **In progress:** currently being worked on.
- **Verified:** acceptance criteria and required checks passed.

## Task Queue

| ID | Task | Depends on | Status |
|---|---|---|---|
| D0 | Create and verify project documentation baseline | None | **Verified** |
| I1 | Establish runtime/configuration, monorepo setup & health foundation | D0 | **Verified** |
| I2 | Implement MongoDB schemas, indexes, and synthetic multi-city dataset & seed | I1 | **Verified** |
| I3 | Implement JWT authentication, CSRF, and server-side authorization | I1, I2 | **Verified** |
| I4 | Implement project drafting, publication, discovery dashboard and details | I2, I3 | **Verified** |
| I5 | Implement progress, milestones, budget (paise) and delay rules | I4 | **Verified** |
| I6 | Implement Cloudinary media lifecycle and protected resident evidence delivery | I3 | **Verified** |
| I7 | Implement resident issue reporting and official response workflow | I3, I6 | **Verified** |
| I8 | Implement explainable conflict detection (Rules A, B, C, D) and decisions | I2, I5, I7 | **Verified** |
| I9 | Implement before-after viewer and community insights heatmap (250m grid) | I5, I6, I7 | **Verified** |
| I10 | Infrastructure realistic image generation and manifest creation | I4, I9 | **Verified** |
| I11 | Comprehensive test suite, build verification, documentation and demo walkthrough | I1-I10 | **Verified** |

All core tasks I1 through I11 have been implemented, tested, and verified against the canonical specification and test plan.
