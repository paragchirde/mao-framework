# TaskForge — Project Management Platform

## Product Requirements Document

### 1. Executive Summary

TaskForge is a collaborative project management platform designed for small-to-medium development teams (5–25 members). It provides task tracking, sprint planning, time logging, and team analytics in a clean, real-time interface.

**Project Type**: MVP
**Target Launch**: 8 weeks from development start

---

### 2. Tech Stack

- **Frontend**: React 18 with TypeScript, TanStack Query, Tailwind CSS
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL 16 with Prisma ORM
- **Authentication**: Google OAuth 2.0 + email/password fallback
- **Testing**: Vitest (unit + integration), Playwright (E2E)
- **Deployment**: Docker + Railway

---

### 3. User Roles

| Role | Permissions |
|------|------------|
| **Owner** | Full access. Manage billing, delete workspace, manage members. |
| **Admin** | Manage projects, sprints, members. Cannot delete workspace or manage billing. |
| **Member** | Create/edit tasks, log time, comment. Cannot manage sprints or members. |
| **Viewer** | Read-only access to projects and tasks. |

---

### 4. Data Model

#### 4.1 Entities

**User**
- id: UUID (primary key)
- email: String (unique, required)
- name: String (required)
- avatarUrl: String (optional)
- role: Enum (owner, admin, member, viewer)
- createdAt: DateTime
- updatedAt: DateTime

**Workspace**
- id: UUID (primary key)
- name: String (required, min 2, max 100)
- slug: String (unique, derived from name)
- ownerId: UUID (foreign key → User)
- createdAt: DateTime

**Project**
- id: UUID (primary key)
- name: String (required)
- description: String (optional)
- key: String (unique within workspace, 2-5 uppercase letters, e.g., "TF")
- workspaceId: UUID (foreign key → Workspace)
- status: Enum (active, archived)
- createdAt: DateTime
- updatedAt: DateTime

**Sprint**
- id: UUID (primary key)
- name: String (required)
- projectId: UUID (foreign key → Project)
- startDate: DateTime (required)
- endDate: DateTime (required, must be after startDate)
- status: Enum (planning, active, completed)
- goal: String (optional)
- createdAt: DateTime

**Task**
- id: UUID (primary key)
- title: String (required, min 3, max 200)
- description: String (optional, markdown supported)
- projectId: UUID (foreign key → Project)
- sprintId: UUID (foreign key → Sprint, optional)
- assigneeId: UUID (foreign key → User, optional)
- reporterId: UUID (foreign key → User, required)
- status: Enum (backlog, todo, in_progress, in_review, done)
- priority: Enum (critical, high, medium, low)
- storyPoints: Int (optional, valid values: 1, 2, 3, 5, 8, 13, 21)
- taskNumber: Int (auto-increment per project, displayed as "{project.key}-{taskNumber}")
- dueDate: DateTime (optional)
- createdAt: DateTime
- updatedAt: DateTime

**Comment**
- id: UUID (primary key)
- content: String (required, markdown supported)
- taskId: UUID (foreign key → Task)
- authorId: UUID (foreign key → User)
- createdAt: DateTime
- updatedAt: DateTime

**TimeEntry**
- id: UUID (primary key)
- taskId: UUID (foreign key → Task)
- userId: UUID (foreign key → User)
- minutes: Int (required, min 1, max 1440)
- description: String (optional)
- loggedAt: DateTime (required)
- createdAt: DateTime

#### 4.2 Relationships

- User has many Workspaces (as owner)
- Workspace has many Projects
- Project has many Sprints
- Project has many Tasks
- Sprint has many Tasks
- Task has many Comments
- Task has many TimeEntries
- User has many Tasks (as assignee)
- User has many Tasks (as reporter)
- User has many Comments (as author)
- User has many TimeEntries

---

### 5. Business Rules

#### BR-1: Task Number Auto-Generation
When a new task is created, automatically assign the next sequential task number for that project. Display format: `{project.key}-{taskNumber}` (e.g., "TF-42"). Task numbers are never reused, even if a task is deleted.

#### BR-2: Sprint Capacity Calculation
Sprint capacity is calculated as: `sum of storyPoints for all tasks in the sprint`. Display a capacity bar showing `assigned / total available`. Total available is calculated as: `number of team members × average velocity per member`. Average velocity is computed from the last 3 completed sprints.

#### BR-3: Task Status Transitions
Tasks follow a workflow:
- `backlog` → `todo` (requires sprint assignment)
- `todo` → `in_progress` (requires assignee)
- `in_progress` → `in_review` (anyone)
- `in_review` → `done` (only non-assignee can move to done — prevents self-approval)
- `in_review` → `in_progress` (rejection, requires comment)
- `done` → `todo` (reopening, requires comment)
- Any status → `backlog` (de-scoping)

#### BR-4: Time Logging Constraints
- Time entries cannot exceed 24 hours (1440 minutes) per entry
- Time entries cannot be logged for future dates
- Only task assignees and admins can log time against a task
- Total logged time per user per day cannot exceed 24 hours across all tasks

#### BR-5: Workspace Member Limits
- Free tier: maximum 5 members per workspace
- Pro tier: maximum 50 members per workspace
- Enterprise tier: unlimited

#### BR-6: Project Archive Rules
- Only admins and owners can archive a project
- Archiving a project moves all active sprints to "completed"
- Archived projects are read-only — no new tasks, comments, or time entries
- Archived projects can be restored by admins/owners

---

### 6. API Requirements

#### 6.1 Authentication
- `POST /api/auth/register` — Email/password registration
- `POST /api/auth/login` — Email/password login (returns JWT)
- `GET /api/auth/google` — Google OAuth initiation
- `GET /api/auth/google/callback` — Google OAuth callback
- `POST /api/auth/refresh` — Refresh JWT token
- `POST /api/auth/logout` — Invalidate token

#### 6.2 Workspaces
- `POST /api/workspaces` — Create workspace
- `GET /api/workspaces` — List user's workspaces
- `GET /api/workspaces/:id` — Get workspace details
- `PATCH /api/workspaces/:id` — Update workspace
- `POST /api/workspaces/:id/members` — Invite member
- `DELETE /api/workspaces/:id/members/:userId` — Remove member

#### 6.3 Projects
- `POST /api/workspaces/:wid/projects` — Create project
- `GET /api/workspaces/:wid/projects` — List projects
- `GET /api/projects/:id` — Get project with stats
- `PATCH /api/projects/:id` — Update project
- `PATCH /api/projects/:id/archive` — Archive/restore project

#### 6.4 Sprints
- `POST /api/projects/:pid/sprints` — Create sprint
- `GET /api/projects/:pid/sprints` — List sprints
- `GET /api/sprints/:id` — Get sprint with tasks and capacity
- `PATCH /api/sprints/:id` — Update sprint
- `PATCH /api/sprints/:id/start` — Start sprint
- `PATCH /api/sprints/:id/complete` — Complete sprint

#### 6.5 Tasks
- `POST /api/projects/:pid/tasks` — Create task (auto-generates task number)
- `GET /api/projects/:pid/tasks` — List tasks (filterable by status, assignee, sprint, priority)
- `GET /api/tasks/:id` — Get task with comments and time entries
- `PATCH /api/tasks/:id` — Update task
- `PATCH /api/tasks/:id/status` — Transition task status (validates BR-3)
- `DELETE /api/tasks/:id` — Soft delete task

#### 6.6 Comments
- `POST /api/tasks/:tid/comments` — Add comment
- `PATCH /api/comments/:id` — Edit comment (author only)
- `DELETE /api/comments/:id` — Delete comment (author or admin)

#### 6.7 Time Entries
- `POST /api/tasks/:tid/time` — Log time (validates BR-4)
- `GET /api/tasks/:tid/time` — Get time entries for task
- `GET /api/users/:uid/time?from=&to=` — Get time entries for user in range
- `DELETE /api/time/:id` — Delete time entry (author or admin)

#### 6.8 Analytics
- `GET /api/projects/:pid/analytics/velocity` — Sprint velocity chart data
- `GET /api/projects/:pid/analytics/burndown` — Current sprint burndown
- `GET /api/workspaces/:wid/analytics/team` — Team workload distribution

---

### 7. Implementation Phases

#### Phase 1: Foundation (Weeks 1–2)
- Database schema (all entities)
- Authentication (email/password + Google OAuth)
- User and Workspace CRUD
- Basic project structure setup

#### Phase 2: Core Features (Weeks 3–4)
- Project CRUD with key generation
- Sprint management (create, start, complete)
- Task CRUD with auto-numbering (BR-1)
- Task status transitions (BR-3)
- Comment system

#### Phase 3: Advanced Features (Weeks 5–6)
- Time logging with constraints (BR-4)
- Sprint capacity calculation (BR-2)
- Analytics endpoints (velocity, burndown)
- Project archival (BR-6)
- Member management with role enforcement

#### Phase 4: Polish (Weeks 7–8)
- Frontend pages: Dashboard, Project Board, Sprint Board, Task Detail
- Real-time updates (WebSocket for task status changes)
- Search and filtering
- Error handling and edge cases
- Performance optimization

---

### 8. Non-Functional Requirements

- **Response time**: API endpoints < 200ms (p95) for CRUD, < 500ms for analytics
- **Availability**: 99.5% uptime
- **Security**: OWASP Top 10 compliance, rate limiting, input sanitization
- **Scalability**: Support 100 concurrent users per workspace
- **Accessibility**: WCAG 2.1 AA compliance for frontend
