# EduTrack: A Smart Learning Center Management System

## Members
- **Huynh Khanh Duy**
- **Hoang Quoc Viet**
- **Au Duong Tai**

## Instructor
- **Ung Van Giau**

## Progress
- [x] **Capstone 1**: Completed requirements analysis, system architecture design, database schema (21 tables), and UI prototypes.
- [x] **Capstone 2**: Source code implementation & development phase (Full-stack Web API + React SPA).

## Working Scope (Capstone 2)
The development phase is primarily organized within the **`Capstone2/`** directory:

- **`backend/`**: RESTful Web API built with **ASP.NET Core 8.0 (C#)**, Entity Framework Core (**MySQL**), and **JWT-based Role-Based Access Control (RBAC)**.
- **`frontend/`**: Single Page Application (SPA) built with **React 18 + TypeScript (Vite)**, 3-tier frontend architecture (API - BLL - DAL - GUI) across 6 roles: Student, Parent, Teacher, Teaching Assistant, Admin Staff, Center Manager.
- **`db/`**: **MySQL 8.0** database management comprising 21 tables according to specifications, including DDL schema scripts, sample seed data, and migrations.
- **`docs/`**: Project documentation, API contracts, architectural designs, and role-based API checklists (refer to [`docs/API_Integration_Roles_Checklist.md`](docs/API_Integration_Roles_Checklist.md)).

---

## Backend Project Structure (`Capstone2/backend/`)

```text
backend/
├── Controllers/       # API endpoints organized by CQRS Lite & Bounded Contexts:
│   ├── Queries/       # Shared Read-only GET endpoints (GetAll, GetById) across 22 tables
│   ├── Management/    # Center Manager & Admin Staff APIs (Users, Classes, Subjects, Tuition, Review, Settings)
│   ├── Teaching/      # Teacher & Teaching Assistant APIs (Classes, Assignments/Grading, Attendance, Requests)
│   └── Learning/      # Student & Parent APIs (Homework Submissions, Learning Portal, Parent Portal, Feedback)
├── Models/            # Database entities (EF Core models) & Role-scoped DTOs (Management, Teaching, Learning)
├── Services/          # Core business logic split into Shared, Management, Teaching, and Learning contexts
├── Repositories/      # Data access layer & database query operations (Generic & Specific Repository pattern)
├── Helpers/           # Utilities, JWT helpers, and modular DependencyInjection extensions
├── Migrations/        # Entity Framework Core database migration files
├── wwwroot/           # Static asset storage (uploaded avatars, assignment files)
├── Program.cs         # Application entry point: DI, middleware pipeline, CORS, Swagger
└── appsettings.json   # Configuration settings (DB connection string, JWT secrets)
```

---

## Frontend Project Structure (`Capstone2/frontend/`)

```text
frontend/
├── public/                    # Static assets, fonts, icons, favicons
├── src/
│   ├── api/                   # Network / Axios API client modules (calling Backend REST APIs)
│   │   ├── apiConfig.ts       # Axios instance, baseURL, request/response interceptors & token injection
│   │   ├── authApi.ts         # Authentication & login endpoints
│   │   ├── userApi.ts         # User account & profile management endpoints
│   │   ├── classApi.ts        # Class, subject, and enrollment endpoints
│   │   ├── tuitionApi.ts      # Invoices, fee collection, and payment transactions
│   │   ├── assignmentApi.ts   # Assignments & homework management
│   │   ├── submissionApi.ts   # Student submission & grading endpoints
│   │   ├── progressApi.ts     # Attendance & learning progress records
│   │   ├── notificationApi.ts # System alerts & announcement endpoints
│   │   ├── approvalRequestApi.ts # Approval requests & feedback endpoints
│   │   ├── subjectApi.ts      # Subject management endpoints
│   │   └── centerSettingApi.ts # Center configuration & settings endpoints
│   │
│   ├── BLL/                   # Business Logic Layer & Domain Types
│   │   └── models/            # TypeScript DTO models aligned with Backend C# Models
│   │       ├── UserDto.ts, ClassDto.ts, SubjectDto.ts, TuitionDto.ts
│   │       ├── AssignmentDto.ts, SubmissionDto.ts, AttendanceDto.ts
│   │       ├── NotificationDto.ts, ApprovalRequestDto.ts, CenterSettingDto.ts...
│   │
│   ├── DAL/                   # Data Access Layer with Resilient Fallback
│   │   ├── userDAL.ts         # Orchestrates user data (Live Backend API + Mock fallback)
│   │   ├── classDAL.ts        # Orchestrates class data
│   │   ├── tuitionDAL.ts      # Orchestrates tuition & invoice data
│   │   ├── assignmentDAL.ts   # Orchestrates assignments data
│   │   ├── submissionDAL.ts   # Orchestrates student submission data
│   │   ├── progressDAL.ts     # Orchestrates attendance & progress note data
│   │   ├── notificationDAL.ts # Orchestrates notification data
│   │   ├── feedbackDAL.ts     # Orchestrates approval request & feedback data
│   │   ├── subjectDAL.ts      # Orchestrates subject data
│   │   ├── centerSettingDAL.ts # Orchestrates center settings data
│   │   └── mockData/          # Comprehensive offline mock dataset (prefixed with [FE-Mock])
│   │
│   ├── GUIs/                  # Graphical User Interfaces (Views & Presenters)
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Common/        # PageHeader, Badges, Pagination, TableToolbar, Modals, UserAvatar
│   │   │   ├── Teacher/       # Teacher-specific components (Assignment, Attendance, Class)
│   │   │   └── TeachingAssistant/ # TA-specific components (Class, Assignment, Attendance)
│   │   │
│   │   ├── layouts/           # Shell layouts per role
│   │   │   ├── admin/         # AdminTopBar, AdminStaffSidebar, CenterManagerSidebar
│   │   │   ├── teacher/       # TeacherLayout, TeacherSidebar, TeacherTopBar
│   │   │   ├── teachingAssistant/ # TALayout, TASidebar, TATopBar
│   │   │   ├── student/       # StudentLayout, StudentSidebar, StudentHeader
│   │   │   └── parent/        # ParentLayout, ParentSidebar, ParentHeader
│   │   │
│   │   └── pages/             # Page views mapped to application routes
│   │       ├── admin/
│   │       │   ├── AdminStaff/        # Admin Staff pages (Dashboard, Students, Classes, Tuition, Feedback...)
│   │       │   └── CenterManager/     # Center Manager pages (Dashboard, Accounts, Subjects, Classes, Settings...)
│   │       ├── teacher/               # Teacher pages (Dashboard, Classes, Attendance, Schedule, Progress...)
│   │       ├── teachingAssistant/     # Teaching Assistant pages (Dashboard, Classes, Attendance, Schedule...)
│   │       ├── student/               # Student pages (Dashboard, Classes, Schedule, Tuition, Feedback...)
│   │       ├── parent/                # Parent pages (Dashboard, Classes, Progress, Tuition, Feedback...)
│   │       └── auth/                  # Authentication pages (Login, Forgot Password)
│   │
│   ├── routes/                # Centralized React Router v6 routing configurations
│   │   ├── index.tsx          # Master route registry
│   │   ├── adminStaff.routes.tsx
│   │   ├── centerManager.routes.tsx
│   │   ├── teacher.routes.tsx
│   │   ├── teachingAssistant.routes.tsx
│   │   ├── student.routes.tsx
│   │   └── parent.routes.tsx
│   │
│   ├── styles/                # Global CSS styles & Bootstrap 5 integration
│   ├── App.tsx                # Application root with router provider
│   └── main.tsx               # Client entry point
│
├── package.json               # Node.js dependencies & npm build scripts
├── tsconfig.json              # TypeScript compiler configuration
└── vite.config.ts             # Vite build & dev-server configuration
```

---

## Documentation & Checklists

To view the detailed API integration checklist and backend architecture guide, please check:
- 👉 **[`docs/API_Integration_Roles_Checklist.md`](docs/API_Integration_Roles_Checklist.md)** (GetAll & GetById mapping for all 6 roles)
- 👉 **[`docs/Backend_CQRS_BoundedContext_Guide.md`](docs/Backend_CQRS_BoundedContext_Guide.md)** (CQRS Lite & Bounded Contexts guide for zero-conflict teamwork)