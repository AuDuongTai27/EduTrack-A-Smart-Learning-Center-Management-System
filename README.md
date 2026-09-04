# EduTrack: A Smart Learning Center Management System

## Members
- **Huynh Khanh Duy**
- **Hoang Quoc Viet**
- **Au Duong Tai**

## Instructor
- **Ung Van Giau**

## Progress
- [x] **Capstone 1**: Completed requirements analysis, system architecture design, database schema (21 tables), and UI prototypes.
- [ ] **Capstone 2**: Source code implementation & development phase.

## Working Scope (Capstone 2)
The development phase is primarily focused and organized within the **`Capstone2/`** directory:

- **`backend/`**: RESTful Web API built with **ASP.NET Core 8.0 (C#)**, Entity Framework Core (**MySQL**), and **JWT-based Role-Based Access Control (RBAC)**.
- **`frontend/`**: Single Page Application (SPA) built with **React + TypeScript (Vite)**, modularized by user roles (Center Manager & Admin Staff, Teacher & Teaching Assistant, Student & Parent).
- **`db/`**: **MySQL 8.0** database management comprising 21 tables according to specifications, including DDL schema scripts, sample seed data, and migrations.

---

## Backend Project Structure (`Capstone2/backend/`)

```text
backend/
├── Controllers/       # API endpoints & HTTP request handlers (Auth, Users, Classes, Tuition...)
├── Models/            # Database entities (EF Core models) & DTOs for request/response
├── Services/          # Core business logic and external service integrations
├── Repositories/      # Data access layer & database query operations (Repository pattern)
├── Helpers/           # Utilities, common constants, JWT helpers, and custom attributes
├── Migrations/        # Entity Framework Core database migration files
├── wwwroot/           # Static asset storage (uploaded avatars, assignment files)
├── Program.cs         # Application entry point: DI, middleware pipeline, CORS, Swagger
└── appsettings.json   # Configuration settings (DB connection string, JWT secrets)
```

*(Note: The `Capstone1/` directory preserves system analysis documentation and initial raw HTML prototypes).*