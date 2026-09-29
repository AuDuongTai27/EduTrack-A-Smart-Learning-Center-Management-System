# EduTrack: API Contract & Specifications
> **Project:** EduTrack - A Smart Learning Center Management System  
> **Course:** CSW480 - Capstone Project 2  
> **Reference Document:** Capstone Report (Lan 5) - Table 1 to Table 5 & Database Schema (Tables 8 to 28)  
> **Standard Response Format:** JSON  
> **Base URL:** `/api`

---

## 1. General Conventions & Standard Formats

### Standard Response Envelope
All API responses must follow a unified JSON envelope:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "errors": null
}
```

### Pagination Query Parameters & Response Structure
For listing endpoints supporting pagination:
- **Query Params:** `?page=1&pageSize=10&search=keyword&sortBy=created_at&order=desc`
- **Data Envelope:**
```json
{
  "items": [],
  "page": 1,
  "pageSize": 10,
  "totalRecords": 100,
  "totalPages": 10
}
```

### Status Legend
- ⚪ `Not Started`
- 🟡 `In Progress`
- 🟢 `Completed`
- 🔴 `Deprecated / Blocked`

---

## 2. API Contract Master Table

### Module: Auth (Authentication & Authorization)
| Module | Method | Endpoint | Description | Role | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| Auth | POST | `/api/auth/login` | Login with user code/email & password, return JWT token and role info | All | 🟡 |
| Auth | POST | `/api/auth/logout` | Logout and invalidate client session/token | Authenticated | ⚪ |
| Auth | GET | `/api/auth/me` | Retrieve profile and permissions of currently authenticated user | Authenticated | ⚪ |
| Auth | POST | `/api/auth/forgot-password` | Send password reset instructions to registered email | All | ⚪ |
| Auth | POST | `/api/auth/reset-password` | Reset account password using token verification | All | ⚪ |
| Auth | PUT | `/api/auth/change-password` | Update password for current user | Authenticated | ⚪ |

---

### Module: Users (Staff, Teachers & Account Management)
*Related Requirements: CM-01, AD-01, AD-02*
| Module | Method | Endpoint | Description | Role | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| Users | GET | `/api/users` | List staff, teachers, and admins with filters (role, status, keyword) | Center Manager, Admin Staff | ⚪ |
| Users | GET | `/api/users/{id}` | Get detailed profile of a specific user | Center Manager, Admin Staff | ⚪ |
| Users | POST | `/api/users` | Create a new staff/teacher account with assigned roles | Center Manager | ⚪ |
| Users | PUT | `/api/users/{id}` | Update personal information, specialty, and role assignments | Center Manager | ⚪ |
| Users | PATCH | `/api/users/{id}/status` | Lock, unlock, or set user account status (active/inactive/locked) | Center Manager | ⚪ |
| Users | POST | `/api/users/{id}/reset-password` | Admin reset user password and generate new credentials | Center Manager | ⚪ |
| Users | GET | `/api/users/teachers` | Get lookup list of active teachers for class assignment | Center Manager, Admin Staff | ⚪ |
| Users | GET | `/api/users/teaching-assistants`| Get lookup list of active TAs for class assignment | Center Manager, Admin Staff | ⚪ |
| Users | GET | `/api/users/profile` | View personal profile of current user | Authenticated | ⚪ |
| Users | PUT | `/api/users/profile` | Update personal profile details (phone, email, avatar) | Authenticated | ⚪ |

---

### Module: Students (Student Directory & Class Enrollment)
*Related Requirements: CM-02, AD-01, AD-02, AD-03, ST-01, ST-02*
| Module | Method | Endpoint | Description | Role | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| Students | GET | `/api/students` | Search and list students by name, code, class, or status | Center Manager, Admin Staff | ⚪ |
| Students | GET | `/api/students/{id}` | Get student profile, enrolled classes, and billing summary | Center Manager, Admin Staff, Student (Self) | ⚪ |
| Students | POST | `/api/students` | Create new student account profile | Center Manager, Admin Staff | ⚪ |
| Students | PUT | `/api/students/{id}` | Update student profile information | Center Manager, Admin Staff | ⚪ |
| Students | POST | `/api/students/{id}/enroll` | Enroll student into a class section (`student_classes`) | Center Manager, Admin Staff | ⚪ |
| Students | PATCH | `/api/students/{id}/classes/{classId}/status` | Update student class status (active, dropped, completed) | Center Manager, Admin Staff | ⚪ |
| Students | POST | `/api/students/{id}/transfer` | Transfer student from current class to a new class (atomic drop & new enroll) | Center Manager, Admin Staff | ⚪ |

---

### Module: Subjects (Curriculum Subjects)
*Related Requirements: CM-02*
| Module | Method | Endpoint | Description | Role | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| Subjects | GET | `/api/subjects` | List all academic subjects (MATH, PHYS, CHEM, ENG) | Authenticated | ⚪ |
| Subjects | GET | `/api/subjects/{id}` | Get specific subject details and associated classes | Authenticated | ⚪ |
| Subjects | POST | `/api/subjects` | Create a new academic subject | Center Manager | ⚪ |
| Subjects | PUT | `/api/subjects/{id}` | Update subject information (name, code, description) | Center Manager | ⚪ |
| Subjects | DELETE | `/api/subjects/{id}` | Delete a subject (only if no active classes linked) | Center Manager | ⚪ |

---

### Module: Classes (Class Management & Cohorts)
*Related Requirements: CM-02, AD-04, TC-02, TA-02, ST-02*
| Module | Method | Endpoint | Description | Role | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| Classes | GET | `/api/classes` | List all classes with filters (subject, teacher, status) | Center Manager, Admin Staff | ⚪ |
| Classes | GET | `/api/classes/{id}` | Get class details (room, fee, teacher, TA, schedule, syllabus) | Authenticated | ⚪ |
| Classes | POST | `/api/classes` | Create a new class section | Center Manager | ⚪ |
| Classes | PUT | `/api/classes/{id}` | Update class details (room, tuition rate, dates, status) | Center Manager, Admin Staff | ⚪ |
| Classes | POST | `/api/classes/{id}/teachers` | Assign teacher to class section (`teacher_classes`) | Center Manager | ⚪ |
| Classes | DELETE | `/api/classes/{id}/teachers/{teacherId}` | Remove teacher assignment from class | Center Manager | ⚪ |
| Classes | POST | `/api/classes/{id}/tas` | Assign teaching assistant to class section (`ta_classes`) | Center Manager | ⚪ |
| Classes | DELETE | `/api/classes/{id}/tas/{taId}` | Remove TA assignment from class | Center Manager | ⚪ |
| Classes | GET | `/api/classes/{id}/students` | List enrolled students in a specific class | Center Manager, Admin Staff, Teacher, TA | ⚪ |
| Classes | GET | `/api/classes/my-classes` | Get assigned/enrolled classes for current Teacher, TA, or Student | Teacher, TA, Student | ⚪ |

---

### Module: Schedules & Sessions (Timetable & Calendar)
*Related Requirements: AD-04, TC-02, TA-02, ST-02*
| Module | Method | Endpoint | Description | Role | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| Schedules | GET | `/api/classes/{classId}/schedules` | Get recurring weekly schedule slots for a class | Authenticated | ⚪ |
| Schedules | POST | `/api/classes/{classId}/schedules` | Add recurring weekly time slot (`class_schedules`) | Center Manager, Admin Staff | ⚪ |
| Schedules | PUT | `/api/classes/{classId}/schedules/{id}` | Update recurring schedule slot (day, time, room) | Center Manager, Admin Staff | ⚪ |
| Schedules | DELETE | `/api/classes/{classId}/schedules/{id}` | Delete recurring schedule slot | Center Manager, Admin Staff | ⚪ |
| Sessions | GET | `/api/sessions` | Get calendar teaching sessions within date range | Authenticated | ⚪ |
| Sessions | GET | `/api/classes/{classId}/sessions` | Get all chronological sessions for a class | Authenticated | ⚪ |
| Sessions | POST | `/api/classes/{classId}/sessions` | Generate or create individual teaching sessions (`class_sessions`) | Center Manager, Admin Staff | ⚪ |
| Sessions | PATCH | `/api/sessions/{id}/status` | Update session status (scheduled, completed, cancelled) | Center Manager, Admin Staff, Teacher | ⚪ |
| Sessions | GET | `/api/sessions/my-schedule` | Get personalized teaching/assisting/learning schedule slots for current user | Teacher, TA, Student | ⚪ |

---

### Module: Attendance (Attendance Tracking)
*Related Requirements: CM-04, AD-11, TC-03, TA-03, ST-04*
| Module | Method | Endpoint | Description | Role | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| Attendance | GET | `/api/sessions/{sessionId}/attendance` | Get attendance sheet for enrolled students in a session | Center Manager, Admin Staff, Teacher, TA | ⚪ |
| Attendance | POST | `/api/sessions/{sessionId}/attendance` | Save or batch update attendance status (present, late, absent, excuse) | Teacher, TA, Admin Staff | ⚪ |
| Attendance | PUT | `/api/sessions/{sessionId}/attendance/{studentId}` | Update single student attendance status and justification note | Teacher, TA, Admin Staff | ⚪ |
| Attendance | GET | `/api/classes/{classId}/students/{studentId}/attendance` | View student attendance history and attendance rate | Center Manager, Admin Staff, Teacher, TA, Student (Self) | ⚪ |

---

### Module: Curriculum (Hierarchical Content Units)
*Related Requirements: CM-02, TC-04, ST-03*
| Module | Method | Endpoint | Description | Role | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| Curriculum | GET | `/api/classes/{classId}/content-units` | Get hierarchical syllabus tree (chapters, lessons, topics) | Authenticated | ⚪ |
| Curriculum | POST | `/api/classes/{classId}/content-units` | Create syllabus unit module (`content_units`) | Teacher, Center Manager | ⚪ |
| Curriculum | PUT | `/api/content-units/{id}` | Update title, description, and display order | Teacher, Center Manager | ⚪ |
| Curriculum | DELETE | `/api/content-units/{id}` | Delete content unit module | Teacher, Center Manager | ⚪ |

---

### Module: Assignments & Submissions (Homework & Grading)
*Related Requirements: TC-04, TC-07, TA-05, ST-03, ST-04*
| Module | Method | Endpoint | Description | Role | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| Assignments | GET | `/api/classes/{classId}/assignments` | List assignments issued for a class | Authenticated | ⚪ |
| Assignments | GET | `/api/assignments/{id}` | Get assignment details, attachments, and deadlines | Authenticated | ⚪ |
| Assignments | POST | `/api/classes/{classId}/assignments` | Create assignment with title, due date, max score, attachment | Teacher | ⚪ |
| Assignments | PUT | `/api/assignments/{id}` | Update assignment content and deadline | Teacher | ⚪ |
| Assignments | DELETE | `/api/assignments/{id}` | Delete an assignment | Teacher | ⚪ |
| Submissions | GET | `/api/assignments/{id}/submissions` | List all student submissions and grading status | Teacher, TA, Admin Staff | ⚪ |
| Submissions | GET | `/api/assignments/{id}/submissions/my` | Get current student submission and graded result | Student | ⚪ |
| Submissions | POST | `/api/assignments/{id}/submissions` | Student submits/uploads homework solution | Student | ⚪ |
| Submissions | PUT | `/api/submissions/{id}/grade` | Instructor grades submission (score and feedback) | Teacher, TA | ⚪ |
| Submissions | POST | `/api/submissions/{id}/ai-evaluate` | Trigger AI model for preliminary evaluation and score | Teacher | ⚪ |

---

### Module: Progress Notes (Student Academic Feedback)
*Related Requirements: CM-04, AD-11, TC-05, TA-04, ST-04*
| Module | Method | Endpoint | Description | Role | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| Progress | GET | `/api/classes/{classId}/students/{studentId}/notes` | List progress notes and remarks for a student | Center Manager, Admin Staff, Teacher, TA, Student (Self) | ⚪ |
| Progress | POST | `/api/classes/{classId}/students/{studentId}/notes` | Create academic progress note (feedback, milestone, warning, praise) | Teacher, TA | ⚪ |
| Progress | PUT | `/api/progress-notes/{id}` | Update progress note content | Author Teacher/TA, Center Manager | ⚪ |
| Progress | DELETE | `/api/progress-notes/{id}` | Delete progress note | Author Teacher/TA, Center Manager | ⚪ |

---

### Module: Tuition & Payments (Billing & Transactions)
*Related Requirements: CM-05, CM-06, AD-05, AD-06, ST-06*
| Module | Method | Endpoint | Description | Role | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| Tuition | GET | `/api/tuition/invoices` | List invoices with filters (month, year, class, status) | Center Manager, Admin Staff | ⚪ |
| Tuition | GET | `/api/tuition/invoices/{id}` | Get invoice details and settlement ledger | Center Manager, Admin Staff, Student (Self) | ⚪ |
| Tuition | POST | `/api/tuition/invoices/generate` | Bulk generate monthly tuition invoices for active students | Center Manager, Admin Staff | ⚪ |
| Tuition | GET | `/api/tuition/my-invoices` | Student retrieves list of own invoices and dues | Student | ⚪ |
| Tuition | POST | `/api/tuition/invoices/{id}/payments` | Record manual payment at front desk (cash, bank transfer) | Admin Staff, Center Manager | ⚪ |
| Tuition | POST | `/api/tuition/invoices/{id}/checkout-online` | Initiate online payment transaction (VNPay/MoMo) | Student | ⚪ |
| Tuition | GET | `/api/tuition/payments` | View center payment transaction logs | Center Manager, Admin Staff | ⚪ |

---

### Module: Approvals (Exception Workflow)
*Related Requirements: CM-09, AD-10, TC-06, TA-06*
| Module | Method | Endpoint | Description | Role | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| Approvals | GET | `/api/approvals` | List exception requests (tuition adjustment, refund, leave) | Center Manager, Admin Staff | ⚪ |
| Approvals | GET | `/api/approvals/{id}` | View detailed justification and request info | Center Manager, Admin Staff, Requester | ⚪ |
| Approvals | POST | `/api/approvals` | Submit approval request (waiver, refund, leave, extension) | Admin Staff, Teacher, TA | ⚪ |
| Approvals | PUT | `/api/approvals/{id}/review` | Manager reviews and approves or rejects request | Center Manager | ⚪ |
| Approvals | DELETE | `/api/approvals/{id}` | Cancel/withdraw a pending request | Requester | ⚪ |

---

### Module: Notifications (Announcements & Alerts)
*Related Requirements: CM-07, AD-07, ST-05*
| Module | Method | Endpoint | Description | Role | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| Notifications | GET | `/api/notifications` | Get list of notifications for currently logged-in user | Authenticated | ⚪ |
| Notifications | PATCH | `/api/notifications/{id}/read` | Mark a specific notification as read | Authenticated | ⚪ |
| Notifications | PATCH | `/api/notifications/read-all` | Mark all notifications as read | Authenticated | ⚪ |
| Notifications | POST | `/api/notifications` | Send notification (broadcast, target class, or single user) | Center Manager, Admin Staff | ⚪ |
| Notifications | DELETE | `/api/notifications/{id}` | Delete notification message | Center Manager, Admin Staff | ⚪ |

---

### Module: Dashboard & Reports (Analytics & Export)
*Related Requirements: CM-03, CM-05, AD-08, AD-11*
| Module | Method | Endpoint | Description | Role | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| Dashboard | GET | `/api/dashboard/manager` | Overall center KPI stats (revenue, active students, pending requests) | Center Manager, Admin Staff | ⚪ |
| Dashboard | GET | `/api/dashboard/teacher` | Teacher quick stats (today shifts, pending assignments to grade) | Teacher, TA | ⚪ |
| Dashboard | GET | `/api/dashboard/student` | Student overview (enrolled classes, upcoming dues & homework) | Student | ⚪ |
| Reports | GET | `/api/reports/revenue` | Revenue analytics and tuition collection statistics | Center Manager | ⚪ |
| Reports | GET | `/api/reports/students` | Student enrollment, dropout, and completion statistics | Center Manager, Admin Staff | ⚪ |
| Reports | GET | `/api/reports/export` | Export statistical report data to Excel / PDF | Center Manager, Admin Staff | ⚪ |

---

### Module: Settings (Center Settings & Files)
*Related Requirements: CM-08*
| Module | Method | Endpoint | Description | Role | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| Settings | GET | `/api/settings` | Get center operational settings (hotline, terms, due dates) | Authenticated | ⚪ |
| Settings | PUT | `/api/settings` | Update center settings key-value entries | Center Manager | ⚪ |
| Files | POST | `/api/files/upload` | Upload avatar, assignment attachment, or document | Authenticated | ⚪ |
