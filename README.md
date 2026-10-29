# AI-Based Smart Allocation Engine for PM Internship Scheme

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.7+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-v19-61dafb.svg)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791.svg)](https://www.postgresql.org/)
[![JWT Auth](https://img.shields.io/badge/Security-JWT%20Tokens-black.svg)](https://jwt.io/)
[![Unit Tests](https://img.shields.io/badge/Tests-13%20Passed%20(100%25)-brightgreen.svg)]()

Production-grade, scalable full-stack application built for the **Prime Minister's Internship Scheme**, implementing an automated, explainable AI Matching & Allocation Engine to seamlessly match candidate profiles with corporate internship opportunities across India.

---

## Table of Contents
1. [Overview & Problem Statement](#overview--problem-statement)
2. [System Architecture & 8 Design Artifacts](#system-architecture--8-design-artifacts)
3. [Diagram Corrections & Enhancements Applied](#diagram-corrections--enhancements-applied)
4. [AI Matching Algorithm Formulation](#ai-matching-algorithm-formulation)
5. [State Machine Lifecycle](#state-machine-lifecycle)
6. [PostgreSQL Relational Schema](#postgresql-relational-schema)
7. [Security & JWT Authentication Architecture](#security--jwt-authentication-architecture)
8. [Automated Test Suite](#automated-test-suite)
9. [Repository Structure](#repository-structure)
10. [Local Development & Setup Guide](#local-development--setup-guide)
11. [Deployment to Cloud / GitHub](#deployment-to-cloud--github)

---

## 1. Overview & Problem Statement

The **AI-Based Smart Allocation Engine for the PM Internship Scheme** automates candidate-internship matching at national scale. It ingests education credentials, technical skills, domain interests, location preferences, and organizational eligibility requirements to generate ranked, auditable allocations, dramatically minimizing administrative overhead while maximizing candidate-opportunity compatibility.

### Key Actors & Dashboards:
* **Candidate (Applicant)**: Profile creation, skills tagger, resume upload, personalized AI recommendations feed, application lifecycle progress tracker, and digital Offer Letter acceptance.
* **Organization (Employer / Company)**: Corporate profile verification, internship vacancy posting with eligibility criteria, applicant review board, candidate shortlisting, and hiring confirmation.
* **Administrator (PM Internship Authority)**: National system metrics, employer approval, batch execution of the AI Allocation Engine, allocation adjustments, official offer issuance, and exportable audit reporting.

---

## 2. System Architecture & 8 Design Artifacts

The system is engineered in strict compliance with the 8 architectural blueprints provided:

| # | Artifact Name | Image Asset | Primary Focus |
|---|---------------|-------------|---------------|
| 1 | **Data Flow Diagram (DFD Level 0)** | `/public/assets/aistudio/DFD_7f9b6f42.jpeg` | Data flows between actors, 5 data stores (D1–D5), and process engines. |
| 2 | **High Level Use Case Diagram** | `/public/assets/aistudio/High_Level_diagram_15e49b55.jpeg` | Actor boundaries: Candidate, Organization, and PM Authority Administrator. |
| 3 | **Detailed Use Case Diagram** | `/public/assets/aistudio/Low_Level_Diagram_f85524a4.jpeg` | Detailed `<<include>>` and `<<extend>>` interactions across all roles. |
| 4 | **State Diagram** | `/public/assets/aistudio/State_Diagram_aeaac62c.jpeg` | Candidate States (C1-C12), Org Post States (O1-O10), Allocation States (A1-A9). |
| 5 | **Activity Diagram** | `/public/assets/aistudio/Activity_Diagram_1be55345.jpeg` | Cross-functional swimlanes orchestrating sequential business logic. |
| 6 | **Conceptual ER Diagram** | `/public/assets/aistudio/ER_diagram_47335c79.jpeg` | High-level entities and entity relationships. |
| 7 | **Class Diagram** | `/public/assets/aistudio/Class_Diagram_89f6b09c.jpeg` | Object-oriented classes, attributes, visibility, and methods. |
| 8 | **Tabular ER Diagram** | `/public/assets/aistudio/ER_Diagram_Tabular_361b3d23.jpeg` | Tabular relational schema with SQL data types, PKs, and FKs. |

---

## 3. Diagram Corrections & Enhancements Applied

During architectural verification, several structural omissions and typos in the original diagrams were identified and corrected in this production implementation:

1. **Tabular ER Diagram — Missing Organization Authentication & State**:
   * *Omission in raw diagram*: The `Organization` table had only `Organization_ID`, `Organization_Name`, `Industry`, `Location`, and `Contact_Email`. It lacked `Password` and `Status` fields.
   * *Correction*: Added `Password VARCHAR(255)` (for bcrypt password hashing), `Status VARCHAR(30)` (`Pending_Approval`, `Active`, `Suspended`), and `IsEmailVerified BOOLEAN` to fulfill State Diagram steps O1, O2, and O3.
2. **Class Diagram — Typo in Notification Class**:
   * *Omission in raw diagram*: Listed `- srudentId : String` (typo).
   * *Correction*: Corrected to `studentId : number` and expanded notification recipients to support polymorphic delivery (`Candidate`, `Organization`, `Admin`).
3. **Internship Table — Seat Concurrency & Closure Tracking**:
   * *Omission in raw diagram*: Had `Available_Seats INT` but lacked `Filled_Seats INT`. Without this, State O9 (`Slots Filled / Expired`) could not be automatically triggered upon candidate offer acceptance (State C10).
   * *Correction*: Added `Filled_Seats INT DEFAULT 0`, automatically incremented upon offer acceptance.
4. **Relational Normalization for Student Profile**:
   * *Enhancement*: In the tabular diagram, `Skills`, `Education`, and `Experience` were unnormalized text fields. The codebase provides normalized sub-entities (`EducationRecord`, `SkillRecord`, `ExperienceRecord`) matching the Class Diagram.
5. **Reversible Reallocation Loop**:
   * Fully implemented Administrator State A5a (`Reallocate`) and A4 (`Under Review`), allowing reallocation batches without breaking existing historical allocations.

---

## 4. AI Matching Algorithm Formulation

The matching engine uses the **Weighted Multi-Criteria Skill & Vector Compatibility (WMC-SVC v2.4)** algorithm:

$$\text{Composite Match Score} = (S \times 0.40) + (L \times 0.20) + (A \times 0.20) + (I \times 0.20)$$

Where:
* **$S$ (Skills Compatibility — 40%)**: Normalized Jaccard and substring intersection between candidate skillset and internship requirements.
* **$L$ (Location Affinity — 20%)**: Distance and preference matching (Exact match or Remote = 20 pts; cross-city national = partial credit).
* **$A$ (Academic Merit — 20%)**: Candidate aggregate percentage normalized against minimum criteria threshold ($P_{\min} = 60\%$).
* **$I$ (Domain Interests Alignment — 20%)**: Semantic affinity between candidate career goals and internship position title/description.

---

## 5. State Machine Lifecycle

```
[Candidate Lifecycle]
Registered (C1) -> Email/OTP Verified (C2) -> Profile Created (C3) 
  -> Browse Internships (C4) -> Applied (C5) -> Submitted / Under Review (C6)
  -> Shortlisted (C7) -> Selected (C8) -> Offer Issued (C9)
  -> Offer Accepted (C10) -> Internship In Progress (C11) -> Completed (C12)

[Organization Post Lifecycle]
Registered (O1) -> Verified (O2/O3) -> Post Created (O4) -> Criteria Set (O5)
  -> Submitted (O6) -> Approved (O7) -> Active (O8) -> Slots Filled (O9) -> Closed (O10)

[Allocation Process Lifecycle]
Allocation Pending (A1) -> Run AI Engine (A2) -> Ranked Matches (A3)
  -> Under Review (A4) -> Review/Modify (A5) -> Finalized (A6)
  -> Candidates Notified (A7) -> Reports Generated (A8) -> Completed (A9)
```

---

## 6. PostgreSQL Relational Schema

The DDL schema is located in `db/schema.sql` and includes:
* `Student` & `Student_Profile` (1:1 with cascade delete)
* `AI_Matching_Engine` & `Profile_Analysis` (1:N)
* `Organization` & `Internship` (1:N)
* `Requirement` (1:N with Internship)
* `Allocation` (Links Student, Internship, and AI Engine with status and score)
* `Notification` (Polymorphic recipient delivery)
* `Admin` (System authority credentials)

---

## 7. Security & JWT Authentication Architecture

* **Email Restriction**: All accounts require a valid `@gmail.com` address (verified via regex on frontend and backend).
* **Password Complexity Rules**:
  * Minimum **8 characters**
  * At least **1 uppercase letter** (`A-Z`)
  * At least **1 special character** (`!@#$%^&*()_+-=[]{};':"|,.<>/?~`)
* **Interactive Visual CAPTCHA**:
  * Case-insensitive alphanumeric verification token generated cryptographically and signed via JWT with 15-minute expiration.
  * Real-time refresh button and client-side canvas-styled distortion.
* **Passwords**: Hashed with `bcryptjs` using 10 salt rounds.
* **JWT Tokens**: Signed using `HS256` HMAC algorithm, transmitting claims (`id`, `email`, `role`, `studentId`/`organizationId`).
* **Role-Based Access Control (RBAC)**: Enforced via Express middleware (`authenticateToken`).
* **5 Pre-Configured Demo Login Accounts**:
  1. **Admin 1**: `admin.rajiv@gmail.com` | Password: `AdminSecure#2026` (Dr. Rajiv Menon, PM Scheme Authority Director)
  2. **Admin 2**: `admin.sharma@gmail.com` | Password: `AdminSecure#2026` (Dr. Anita Sharma, Joint Director AICTE)
  3. **Org 1**: `tcs.recruitment@gmail.com` | Password: `DemoPass@2026` (Tata Consultancy Services, HR Sanjay Deshmukh)
  4. **Org 2**: `infosys.careers@gmail.com` | Password: `DemoPass@2026` (Infosys Innovation Labs, HR Kunal Kapoor)
  5. **Candidate**: `aarav.intern@gmail.com` | Password: `DemoPass@2026` (Aarav Kumar, B.Tech CSE AI Specialist)

---

## 8. Automated Test Suite

All pure business calculations, state machines, and API endpoints are decoupled and covered by unit tests using Node.js's native test runner (`node:test` & `node:assert/strict`):

```bash
# Run all tests
npm test
```

### Verified Test Suites:
1. `src/utils/aiEngine.test.ts`: Tests skill normalization, 100% score calculation, partial match calculation, and multi-candidate ranking.
2. `src/utils/stateMachine.test.ts`: Verifies legal and illegal transitions for Candidate, Post, and Allocation state graphs.
3. `src/utils/auth.test.ts`: Validates bcrypt hashing, JWT signature generation, and rejection of tampered tokens.
4. `src/server.test.ts`: Validates database seeding, profile updates, and batch allocation execution without duplicates.

---

## 9. Repository Structure

```
├── db/
│   └── schema.sql              # Production PostgreSQL DDL schema & constraints
├── server/
│   └── db.ts                   # Database connection & memory fallback layer
├── server.ts                   # Express backend with JWT endpoints & Vite middleware
├── src/
│   ├── components/
│   │   ├── AdminDashboard.tsx       # Apex Administration & AI execution console
│   │   ├── ArchitectureViewer.tsx   # 8 Diagrams viewer with zoom & corrections
│   │   ├── AuthModal.tsx            # Secure login, registration & OTP simulation
│   │   ├── CandidateDashboard.tsx   # Student profile, recommendations & tracker
│   │   ├── EngineSimulator.tsx      # Real-time AI matching simulator & tuner
│   │   ├── Navbar.tsx               # Responsive header, notifications & switcher
│   │   ├── OfferLetterModal.tsx     # Official appointment letter & confetti
│   │   └── SchemeGuidelines.tsx     # Scheme documentation & test runner UI
│   ├── types/
│   │   └── schema.ts           # TypeScript interfaces matching Class & ER diagrams
│   ├── utils/
│   │   ├── aiEngine.ts         # WMC-SVC matching & ranking algorithm
│   │   ├── aiEngine.test.ts    # Unit tests for matching engine
│   │   ├── auth.ts             # JWT signing and bcrypt helpers
│   │   ├── auth.test.ts        # Unit tests for auth & tokens
│   │   ├── stateMachine.ts     # Transition guards for all lifecycles
│   │   └── stateMachine.test.ts# Unit tests for state machines
│   ├── server.test.ts          # Backend integration tests
│   ├── App.tsx                 # Root application coordinator
│   ├── main.tsx                # React entry point
│   └── index.css               # Tailwind CSS v4 entry point
├── public/
│   └── assets/aistudio/        # 8 High-resolution architectural diagram assets
├── package.json                # Project dependencies & scripts
├── tsconfig.json               # TypeScript compiler configuration
├── vite.config.ts              # Vite bundler configuration
└── README.md                   # Comprehensive repository documentation
```

---

## 10. Local Development & Setup Guide

### Prerequisites
* **Node.js**: v20 or higher
* **npm**: v10 or higher
* *(Optional)* **PostgreSQL**: v14+ (if connecting to real Postgres instance)

### Installation
```bash
# 1. Clone repository
git clone https://github.com/your-username/pm-internship-allocation-engine.git
cd pm-internship-allocation-engine

# 2. Install dependencies
npm install

# 3. Configure environment variables (optional for local Postgres)
cp .env.example .env
# Set DATABASE_URL="postgresql://user:password@localhost:5432/pm_internship"
# Set JWT_SECRET="your-secure-secret-key"

# 4. Run automated test suite
npm test

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 11. Deployment to Cloud / GitHub

* **Build for Production**:
  ```bash
  npm run build
  npm start
  ```
* **PostgreSQL Setup**:
  To initialize your PostgreSQL database in staging or production, execute:
  ```bash
  psql -U your_user -d your_db -f db/schema.sql
  ```
* **GitHub Repository Push**:
  The repository is initialized with a clean, modular structure. Simply run:
  ```bash
  git init
  git add .
  git commit -m "feat: AI-Based Smart Allocation Engine for PM Internship Scheme"
  git branch -M main
  git remote add origin https://github.com/your-username/pm-internship-allocation-engine.git
  git push -u origin main
  ```
