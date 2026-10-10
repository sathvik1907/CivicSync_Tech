# TransparanceCity — Public Works Transparency and Coordination Platform

**Making public infrastructure transparent, accountable, and coordinated.**

TransparanceCity is a civic technology platform designed to improve transparency and coordination in public infrastructure projects. It enables residents to discover public works, monitor project progress, report civic issues, and follow official responses through a centralized platform.

The platform also helps municipal departments identify potentially overlapping infrastructure projects and coordinate work to reduce repeated excavation, unnecessary disruptions, and inefficient resource utilization.

> **Hackathon Project:** Built for the CivicTech problem statement, *Improving Transparency and Coordination in Public Works Projects*, at IIITDM Kancheepuram.

---

## Table of Contents

* [Problem Statement](#problem-statement)
* [Proposed Solution](#proposed-solution)
* [Key Features](#key-features)
* [User Roles](#user-roles)
* [Technology Stack](#technology-stack)
* [System Architecture](#system-architecture)
* [Application Screenshots](#application-screenshots)
* [Installation and Setup](#installation-and-setup)
* [Environment Variables](#environment-variables)
* [Database Setup](#database-setup)
* [Running the Application](#running-the-application)
* [Demo Accounts](#demo-accounts)
* [Deployment](#deployment)
* [Security and Privacy](#security-and-privacy)
* [Synthetic Data Disclaimer](#synthetic-data-disclaimer)
* [Demo Video](#demo-video)
* [Team Members](#team-members)
* [Future Enhancements](#future-enhancements)
* [License](#license)

---

## Problem Statement

Residents frequently struggle to obtain reliable information about public infrastructure projects, such as road construction, drainage repairs, pipeline installation, and other municipal works.

Information about these projects is often distributed across different government departments, notice boards, offices, and informal communication channels.

This creates several challenges:

* **Lack of transparency:** Residents may not know the purpose, budget, schedule, or responsible department for a project.
* **Unclear progress:** Citizens struggle to understand whether projects are progressing as planned or experiencing delays.
* **Poor coordination:** Multiple departments may schedule work on the same road or nearby locations, resulting in repeated excavation and disruption.
* **Limited accountability:** Residents may find it difficult to report poor-quality work, track complaints, or receive official responses.
* **Insufficient public feedback:** Authorities may lack a centralized way to identify recurring civic problems and understand community concerns.

These challenges contribute to traffic congestion, inconvenience, wasted resources, business losses, and reduced public trust.

## Proposed Solution

TransparanceCity provides a centralized digital platform connecting residents, departmental officers, and municipal coordinators.

Residents can explore public works through an interactive map and project listings, inspect project details, submit civic issue reports, and track responses.

Department officers can manage projects assigned to their departments, update milestones, and respond to relevant reports.

Municipal coordinators can review potential project overlaps, assess coordination risks, and record decisions intended to minimize repeated disruptions.

The platform combines project visibility, civic reporting, departmental accountability, and coordination insights in one accessible interface.

### Project Objectives

1. Improve public access to infrastructure project information.
2. Make project schedules, milestones, and progress easier to understand.
3. Provide a structured channel for civic issue reporting and response tracking.
4. Identify potentially overlapping infrastructure work.
5. Support coordination between municipal departments.
6. Protect residents' private reports and sensitive information.
7. Clearly distinguish demonstration data from verified government information.

---

## Key Features

### 1. Public Works Explorer

* Browse infrastructure projects in map and list views.
* Search for projects by name or location.
* Filter projects by city, department, work type, and status.
* View project descriptions, schedules, milestones, and progress.
* Display contractor and budget information when available.
* Present project delays using explainable indicators.

### 2. Interactive Infrastructure Map

* Visualize project locations using Leaflet.
* Use OpenStreetMap-compatible map tiles.
* Explore infrastructure projects geographically.
* Identify nearby projects that may require coordination.
* Display approximate locations for public community insights.

### 3. Civic Issue Reporting

* Submit reports describing local infrastructure problems.
* Provide relevant location information.
* Upload supporting photographs where enabled.
* Track report status and official responses.
* Support structured communication between residents and responsible departments.

### 4. Department Officer Dashboard

* Provide department-specific project management.
* Update assigned project milestones and progress.
* Review reports relevant to the officer's department.
* Record project updates and responses.
* Restrict access to projects and reports according to server-enforced permissions.

Each seeded department should have a separate officer account associated with that department.

### 5. Municipal Coordination Dashboard

* Identify potentially overlapping public works.
* Highlight nearby projects occurring during overlapping periods.
* Flag potential repeated excavation on shared road segments.
* Identify projects with uncertain completion status.
* Explain why a project pair has been flagged.
* Allow authorized municipal coordinators to record coordination decisions.

Coordination indicators support human review; they do not automatically establish that departments have failed to coordinate.

### 6. Community Insights

* Display aggregated civic issue statistics.
* Highlight recurring categories of infrastructure problems.
* Present approximate locations rather than exposing precise resident locations publicly.
* Support before-and-after evidence where available and appropriate.
* Help identify areas that may require further municipal attention.

### 7. Authentication and Authorization

* Authenticate users through the application's login flow.
* Use password hashing for stored passwords.
* Use JWT-based authentication with HttpOnly cookies.
* Enforce role-based permissions on the server.
* Restrict departmental officers to their authorized department.
* Protect sensitive resident reports and evidence.
* Apply CSRF protection where required by the authentication architecture.


---

## Technology Stack

| Component         | Technology                        |
| ----------------- | --------------------------------- |
| Frontend          | React                             |
| Build Tool        | Vite                              |
| Styling           | Tailwind CSS                      |
| Routing           | React Router                      |
| Mapping           | Leaflet                           |
| Map Data          | OpenStreetMap-compatible tiles    |
| Backend           | Node.js                           |
| API               | Express.js REST API               |
| Database          | MongoDB Atlas or local MongoDB    |
| ODM               | Mongoose                          |
| Authentication    | JWT in HttpOnly cookies           |
| Password Security | Password hashing                  |
| Media Storage     | Cloudinary integration            |
| Testing           | Node.js built-in test runner      |
| Version Control   | Git and GitHub                    |
| Hosting           | Render-compatible Node.js service |

---

## System Architecture

TransparanceCity follows a client-server architecture.

```text
                    ┌─────────────────────────┐
                    │         Users           │
                    │ Residents / Officers /  │
                    │ Municipal Coordinators  │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │    React + Vite UI      │
                    │     Tailwind CSS        │
                    │      React Router       │
                    └────────────┬────────────┘
                                 │
                           HTTP / REST API
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │    Node.js + Express    │
                    │ Authentication          │
                    │ Authorization           │
                    │ Business Logic          │
                    │ Coordination Analysis   │
                    └───────┬─────────┬───────┘
                            │         │
                 ┌──────────┘         └──────────┐
                 ▼                               ▼
      ┌─────────────────────┐        ┌─────────────────────┐
      │ MongoDB / Mongoose  │        │ Cloudinary          │
      │ Projects            │        │ Image Storage       │
      │ Departments         │        │ If Configured       │
      │ Reports             │        └─────────────────────┘
      │ Milestones          │
      │ Coordination Data   │
      └─────────────────────┘
```

---
## Application Screenshots

The following screenshots showcase the key features and interfaces of TransparanceCity.

### 1. Login Page

![TransparanceCity Login Page](2.png)

### 2. Public Works Explorer

![Public Works Explorer](3.png)

### 3. Infrastructure Project Listings

![Infrastructure Project Listings](4.png)

### 4. Community Insights Dashboard

![Community Insights Dashboard](5.png)

### 5. Public Works Map View

![Public Works Map View](6.png)

### 6. Infrastructure Project Cards

![Infrastructure Project Cards](7.png)

### 7. Application Footer and Transparency Principles

![Application Footer](8.png)

### 8. Community Insights Statistics

![Community Insights Statistics](9.png)

### 9. Project Details and Overview

![Project Details](10.png)

### 10. Project Timeline and Financial Transparency

![Project Timeline and Financial Transparency](11.png)

### 11. Weighted Milestone Progress

![Weighted Milestone Progress](12.png)

### 12. Civic Issue Reporting Form

![Civic Issue Reporting Form](13.png)

### 13. Evidence Photograph Upload

![Evidence Photograph Upload](14.png)

### 14. Department Officer Workspace

![Department Officer Workspace](15.png)

### 15. Department Officer Dashboard

![Department Officer Dashboard](16.png)

### 16. Municipal Coordinator Dashboard

![Municipal Coordinator Dashboard](17.png)

### 17. Complaint Density Heatmap

![Complaint Density Heatmap](18.png)

### 18. Community Privacy Protection

![Community Privacy Protection](19.png)

### 19. Project Coordination and Management

![Project Coordination and Management](20.png)

### 20. Additional Project Interface

![Additional Project Interface](1.png)


*Aggregated information about recurring civic issues and infrastructure concerns.*

> **Screenshot instructions:** Replace these image paths with the actual screenshots from your application. Remove any section for a screen that has not been implemented. Do not use mockups as evidence of working functionality.

---

## Installation and Setup

### Prerequisites

Install the following tools before running the application:

* Node.js 18 or later, compatible with the project's dependencies.
* npm.
* Git.
* MongoDB Atlas or a local MongoDB instance.
* A Cloudinary account if image-upload functionality requires it.

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd YOUR_PROJECT_DIRECTORY
```

Replace the placeholders with your actual repository URL and project directory.

### 2. Install Dependencies

Open a terminal in the project root, where the root `package.json` is located.

```bash
npm run install:all
```

This command should install the dependencies for all project components as configured by the root package scripts.

If the command fails, check the scripts in the root `package.json` and follow the installation instructions defined by the project.

### 3. Configure Environment Variables

Create the server environment file using the supplied template.

**PowerShell:**

```powershell
Copy-Item server\.env.example server\.env
notepad server\.env
```

Add the required environment variable values to `server/.env`.

Do not commit `.env` files containing secrets to GitHub.

### 4. Configure MongoDB

For MongoDB Atlas:

1. Create or select a MongoDB Atlas project.
2. Create a database user.
3. Configure the IP Access List according to your deployment environment.
4. Open **Cluster → Connect → Drivers → Node.js**.
5. Copy the connection URI.
6. Replace the placeholders in the URI with the appropriate credentials and database information.
7. Set the resulting URI as `MONGODB_URI` in `server/.env`.

For local MongoDB, use the connection string appropriate to your local database configuration.

**Important:** Verify the hostname and connection string before starting the application. A malformed Atlas hostname can prevent database connectivity.

### 5. Seed Demonstration Data

If the project provides a seed script, run it only against a database intended for demonstration data.

```bash
npm run seed
```

The seed script may create sample projects, departments, contractors, milestones, reports, demo accounts, and coordination examples.

Inspect the seed script before running it. Confirm whether it inserts, replaces, or deletes existing records.

Do not run a destructive seed operation against a database containing real data.

### 6. Start the Backend

From the project root:

```bash
npm start --prefix server
```

This command assumes that the server's `package.json` defines an appropriate `start` script.

### 7. Start the Frontend

If the frontend is maintained separately, open another terminal and run the frontend's development command.

For example, if the frontend directory is `client`:

```bash
cd client
npm run dev
```

Use the actual frontend directory and scripts defined in your repository.

If the project uses a different directory structure or a single-server production setup, follow its configured commands instead.

---

## Environment Variables

Create `server/.env` and configure the variables required by the backend.

The following is an illustrative template. **Confirm the actual variable names against `server/.env.example` and the backend source code.**

```env

DATA BASE URL:mongodb+srv://sathvik1907:sathvik123@civicsync-cluster.mwoxqbh.mongodb.net/?appName=civicsync-cluster

CLIENT_URL=https://transparencity.onrender.com/

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Environment Variable Descriptions

| Variable                | Purpose                                                                            |
| ----------------------- | ---------------------------------------------------------------------------------- |
| `CLIENT_URL`            | Frontend origin used by the backend, including CORS configuration where applicable |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud identifier                                                        |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                                                                 |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret                                                              |

The exact names and requirements depend on the implementation.

### Security Notes

* Never publish database credentials or JWT secrets.
* Never commit real `.env` files to the repository.
* Use strong, randomly generated secrets.
* Configure production environment variables in the hosting provider.
* Use separate development and production credentials.
* Restrict database access to authorized clients and services.
* Rotate any credentials accidentally exposed in source control.

---

## Database Setup

TransparanceCity uses MongoDB to store application data.

Depending on the implemented schema, collections may include the following:

| Collection                    | Purpose                                                      |
| ----------------------------- | ------------------------------------------------------------ |
| Users                         | User accounts, roles, and department associations            |
| Departments                   | Municipal department information                             |
| Projects                      | Public infrastructure project details                        |
| Milestones or Project Updates | Project schedules and progress updates                       |
| Reports                       | Resident-submitted civic issues                              |
| Coordination Records          | Decisions and outcomes from coordination reviews             |
| Road Segments                 | Geographic road or infrastructure references, if implemented |

These are conceptual collection categories. Actual collection names and relationships must match the project's Mongoose models.

### Data Integrity

* Associate departmental officers with their authorized departments.
* Validate project and report data on the backend.
* Enforce authorization when reading and modifying protected records.
* Preserve appropriate privacy controls for resident reports and uploaded evidence.
* Clearly identify synthetic records.

---

## Running the Application

### Development Mode

Start the backend:

```bash
npm start --prefix server
```

Start the frontend in a separate terminal if the frontend is developed independently:

```bash
cd client
npm run dev
```

Open the local URL printed by Vite in the terminal.

### Production Mode

For production, build the frontend and configure the backend to serve the generated frontend assets if the application uses a single-service deployment.

The precise build and start commands depend on the root and server package scripts.

Before deploying, verify:

* Production environment variables are configured.
* The database connection works.
* Authentication and authorization work.
* Image uploads work if enabled.
* Protected routes cannot be accessed without authorization.
* The application is accessible through its public URL.
* No development-only credentials or debugging endpoints are exposed.

---

## Demo Accounts

Demo accounts may be created by the project's seed script.

| Role                  | Demo Email                        | Password                                 |
| --------------------- | --------------------------------- | ---------------------------------------- |
| Resident              | Add locally configured demo email | Use the locally configured demo password |
| Department Officer 1  | Add seeded officer email          | Use the locally configured demo password |
| Department Officer 2  | Add seeded officer email          | Use the locally configured demo password |
| Municipal Coordinator | Add seeded coordinator email      | Use the locally configured demo password |

**Important:**

* Replace these placeholders with the actual demo account details if you decide to publish them.
* Confirm that the accounts exist and work before including their details.
* Do not publish real user credentials.
* Do not reuse demo credentials in production.
* Disable or reject seeded demo accounts in production where required by the implementation.
* Verify that each officer is restricted to their own department.

If you choose not to publish demo credentials, provide a safe way for judges to request or receive authorized demonstration access.

---

## Deployment

Deployment is required for the hackathon submission.

The application should be accessible to judges through a public URL without requiring them to install or configure the project.

### Suggested Hosting

* **Application hosting:** Render-compatible Node.js service.
* **Database:** MongoDB Atlas.
* **Image storage:** Cloudinary, if configured.

### Deployment Checklist

1. Push the completed project to GitHub.
2. Create the hosting service.
3. Configure the correct build and start commands.
4. Add the required production environment variables.
5. Configure the MongoDB Atlas network access rules for the deployment environment.
6. Configure the frontend origin, CORS, and cookie settings appropriately.
7. Ensure authentication works over HTTPS.
8. Test all major user flows on the deployed application.
9. Confirm that uploaded images load correctly.
10. Verify that protected API endpoints enforce authorization.
11. Test the public URL in a separate browser session.
12. Add the final deployed URL below.

**Live Application:** https://transparencity.onrender.com/

**GitHub Repository:** https://github.com/sathvik1907/CivicSync_Tech

---

## Security and Privacy

TransparanceCity is designed to support transparency without unnecessarily exposing residents' private information.

Security considerations include:

* Password hashing for stored passwords.
* Secure authentication cookies.
* Backend-enforced role-based authorization.
* Department-specific access restrictions.
* Validation of user input and uploaded files.
* Appropriate CSRF protection.
* Protection of database and media credentials.
* Restricted access to private reports and evidence.
* Approximate locations for public aggregate insights.
* Safe handling of errors and authentication failures.

The actual security guarantees depend on the implemented controls and their configuration. These controls should be tested before claiming that the platform is production-ready.

---

## Synthetic Data Disclaimer

**Demonstration data is not verified government information.**

Any sample projects, project budgets, contractors, milestones, resident reports, photographs, departments, and coordination records created for demonstrations must be clearly identified as synthetic.

Synthetic information must not be presented as an official government record or a verified report of actual public infrastructure work.

Public demonstrations should also avoid exposing private resident information or sensitive location data.

---

## Demo Video

**Demo Video:** `ADD_YOUR_DEMO_VIDEO_URL`

The demonstration video should be between **2 and 5 minutes** long.

Recommended video structure:

1. Introduce TransparanceCity and the problem it addresses.
2. Demonstrate public project discovery and the interactive map.
3. Show project details, schedules, and progress information.
4. Demonstrate civic issue reporting and report tracking.
5. Show department-specific project management.
6. Demonstrate project coordination candidates and coordinator decisions.
7. Summarize the platform's benefits and future scope.

Use actual working features in the demonstration. Clearly identify synthetic data where applicable.

The demo video must also be included in the GitHub repository, as required by the hackathon submission guidelines.

---

## Team Members

Meet the team behind TransparanceCity.

Replace the example names, profile links, and screenshot paths below with your actual team information.

| 1      | M.V.N.Sathvik | Project Lead / Full-Stack Development | [https://github.com/sathvik1907](GITHUB_URL) | [https://www.linkedin.com/in/venkata-naga-sathvik-miriyam-1b0882340?utm_source=share_via&utm_content=profile&utm_medium=member_android](LINKEDIN_URL) |
| 2      | A.Bhanu Venkata Naga Sai | Frontend Development                  | [https://github.com/bhanu07052007](GITHUB_URL) | [https://www.linkedin.com/in/bhanu-aravapalli/](LINKEDIN_URL)
| 3      | Shashank Reddy | Backend Development                   | [github.com/Shashankreddy-12](GITHUB_URL_3) | [linkedin.com/in/shashank-reddy12](LINKEDIN_URL)
| 4      | N.Jagan Mohan Reddy | Database and API Integration          | [https://github.com/NJMReddy](GITHUB_URL_4) | [https://www.linkedin.com/in/jagan-mohan-reddy-namburi-8843a9361/](LINKEDIN_URL)


### Team Contributions

Describe each member's actual contribution to the project.

* **Project Lead:** Coordination, integration, and overall project development.
* **Frontend Developer:** User interface, routing, map integration, and responsive design.
* **Backend Developer:** REST API development, authentication, authorization, and business logic.
* **Database and Integration Developer:** Data modeling, database integration, testing, and deployment support.

These are example responsibilities. Edit them to accurately reflect the work performed by each team member.



## Future Enhancements

Potential future improvements include:

* Integration with verified municipal project data.
* Automated notifications about project milestones and delays.
* Improved geographic analysis of overlapping infrastructure work.
* More detailed coordination analytics.
* Multilingual support for residents.
* Accessibility improvements for users with disabilities.
* Public dashboards for municipal performance indicators.
* Integration with official complaint-management systems.
* Enhanced evidence verification and duplicate-report detection.

These are proposed enhancements, not claims about existing functionality.

---

## License

Add the license selected for this project.

If the project does not yet have a license, do not claim that it is open source under a particular license until the team has chosen and added one.

---

## Acknowledgements

We acknowledge the IIITDM Kancheepuram hackathon organizers for presenting the CivicTech problem statement and providing an opportunity to develop a technology-driven solution for improving public works transparency and coordination.

We also acknowledge the open-source projects and services used in the implementation. Refer to the project's dependency manifests and configuration for the actual libraries and APIs used.

---

**TransparanceCity — Better coordination. Greater transparency. Stronger communities.**
