
export default function TeacherClassDetailsPage() {
    return (
        <>
            {/* Breadcrumb & Page Title */}
            <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
                <div className="my-auto mb-2">
                    <h3 className="page-title mb-1">Class Details</h3>
                    <nav>
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item">
                                <a href="/teacher/dashboard">Dashboard</a>
                            </li>
                            <li className="breadcrumb-item">
                                <a href="/teacher/classes">My Classes</a>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                Class I-A
                            </li>
                        </ol>
                    </nav>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <a
                        href="/teacher/classes"
                        className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
                    >
                        <i className="bi bi-arrow-left" /> Back to Classes
                    </a>
                </div>
            </div>
            {/* Class Header */}
            <div className="card class-list-card border-0 mb-4">
                <div className="card-body p-4">
                    <div className="row g-4 align-items-center">
                        <div className="col-6 col-lg-3">
                            <div className="d-flex align-items-center gap-3">
                                <div
                                    className="avatar-box rounded-3 d-flex align-items-center justify-content-center"
                                    style={{
                                        width: 48,
                                        height: 48,
                                        backgroundColor: "#ede8ff",
                                        color: "#5d3fd3"
                                    }}
                                >
                                    <i className="bi bi-mortarboard-fill fs-4" />
                                </div>
                                <div>
                                    <span className="text-muted small d-block">
                                        Class Name
                                    </span>
                                    <h4 className="fw-bold mb-0 text-dark">Class I-A</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-6 col-lg-3">
                            <div className="d-flex align-items-center gap-3">
                                <div
                                    className="avatar-box rounded-3 d-flex align-items-center justify-content-center"
                                    style={{
                                        width: 48,
                                        height: 48,
                                        backgroundColor: "#e0f2fe",
                                        color: "#0284c7"
                                    }}
                                >
                                    <i className="bi bi-journal-bookmark-fill fs-4" />
                                </div>
                                <div>
                                    <span className="text-muted small d-block">Subject</span>
                                    <h4 className="fw-bold mb-0 text-dark">Physics</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-6 col-lg-3">
                            <div className="d-flex align-items-center gap-3">
                                <div
                                    className="avatar-box rounded-3 d-flex align-items-center justify-content-center"
                                    style={{
                                        width: 48,
                                        height: 48,
                                        backgroundColor: "#dcfce7",
                                        color: "#166534"
                                    }}
                                >
                                    <i className="bi bi-person-badge-fill fs-4" />
                                </div>
                                <div>
                                    <span className="text-muted small d-block">Teacher</span>
                                    <h6 className="fw-bold mb-0 text-dark">
                                        Henriques Morgan
                                    </h6>
                                </div>
                            </div>
                        </div>
                        <div className="col-6 col-lg-3">
                            <div className="d-flex align-items-center gap-3">
                                <div
                                    className="avatar-box rounded-3 d-flex align-items-center justify-content-center"
                                    style={{
                                        width: 48,
                                        height: 48,
                                        backgroundColor: "#fef3c7",
                                        color: "#d97706"
                                    }}
                                >
                                    <i className="bi bi-person-workspace fs-4" />
                                </div>
                                <div>
                                    <span className="text-muted small d-block">
                                        Teaching Assistant
                                    </span>
                                    <h6 className="fw-bold mb-0 text-dark">Sarah Jenkins</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Participant List */}
            <details className="card class-list-card border-0 mb-4" open>
                <summary className="class-list-header d-flex align-items-center justify-content-between cursor-pointer py-3 px-4">
                    <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-people-fill text-primary fs-5" />
                        <h4 className="class-list-title mb-0">Class Participants</h4>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <span className="text-muted small">Toggle Section</span>
                        <i className="bi bi-chevron-down details-chevron text-muted" />
                    </div>
                </summary>
                <div className="table-responsive-container">
                    <table className="table custom-table align-middle mb-0">
                        <thead>
                            <tr>
                                <th>Avatar</th>
                                <th>Full Name</th>
                                <th>Role</th>
                                <th>Overall Grade (Out of 10)</th>
                                <th className="text-end">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <div className="ta-avatar-initials bg-primary text-white">
                                        AM
                                    </div>
                                </td>
                                <td className="fw-semibold text-dark">Dr. Alex Morgan</td>
                                <td>
                                    <span className="badge bg-primary-subtle text-primary fw-medium px-2.5 py-1">
                                        Teacher
                                    </span>
                                </td>
                                <td className="text-muted">-</td>
                                <td className="text-end">
                                    <span className="text-muted small">-</span>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="ta-avatar-initials bg-warning text-dark">
                                        SJ
                                    </div>
                                </td>
                                <td className="fw-semibold text-dark">Sarah Jenkins</td>
                                <td>
                                    <span className="badge bg-warning-subtle text-warning-emphasis fw-medium px-2.5 py-1">
                                        Teaching Assistant
                                    </span>
                                </td>
                                <td className="text-muted">-</td>
                                <td className="text-end">
                                    <span className="text-muted small">-</span>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div
                                        className="ta-avatar-initials"
                                        style={{ backgroundColor: "#e0e7ff", color: "#3730a3" }}
                                    >
                                        JD
                                    </div>
                                </td>
                                <td className="fw-semibold text-dark">John Doe</td>
                                <td>
                                    <span className="badge bg-info-subtle text-info-emphasis fw-medium px-2.5 py-1">
                                        Student
                                    </span>
                                </td>
                                <td>
                                    <span className="fw-bold text-dark">8.5</span>{" "}
                                    <small className="text-muted">/ 10</small>
                                </td>
                                <td className="text-end">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                                    >
                                        <i className="bi bi-eye" /> View
                                    </button>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div
                                        className="ta-avatar-initials"
                                        style={{ backgroundColor: "#dcfce7", color: "#166534" }}
                                    >
                                        AS
                                    </div>
                                </td>
                                <td className="fw-semibold text-dark">Alice Smith</td>
                                <td>
                                    <span className="badge bg-info-subtle text-info-emphasis fw-medium px-2.5 py-1">
                                        Student
                                    </span>
                                </td>
                                <td>
                                    <span className="fw-bold text-dark">9.2</span>{" "}
                                    <small className="text-muted">/ 10</small>
                                </td>
                                <td className="text-end">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                                    >
                                        <i className="bi bi-eye" /> View
                                    </button>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div
                                        className="ta-avatar-initials"
                                        style={{ backgroundColor: "#fef3c7", color: "#92400e" }}
                                    >
                                        ER
                                    </div>
                                </td>
                                <td className="fw-semibold text-dark">Ethan Roberts</td>
                                <td>
                                    <span className="badge bg-info-subtle text-info-emphasis fw-medium px-2.5 py-1">
                                        Student
                                    </span>
                                </td>
                                <td>
                                    <span className="fw-bold text-dark">7.8</span>{" "}
                                    <small className="text-muted">/ 10</small>
                                </td>
                                <td className="text-end">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                                    >
                                        <i className="bi bi-eye" /> View
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </details>
            {/* Sessions List */}
            <details className="card class-list-card border-0 mb-4" open>
                <summary className="class-list-header d-flex align-items-center justify-content-between cursor-pointer py-3 px-4">
                    <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-calendar-week-fill text-primary fs-5" />
                        <h4 className="class-list-title mb-0">Class Sessions</h4>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <span className="text-muted small">Toggle Section</span>
                        <i className="bi bi-chevron-down details-chevron text-muted" />
                    </div>
                </summary>
                <div className="table-responsive-container">
                    <table className="table custom-table align-middle mb-0">
                        <thead>
                            <tr>
                                <th>Lesson Title</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Status</th>
                                <th>Note</th>
                                <th className="text-end">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Lesson 1 */}
                            <tr className="session-row-ended">
                                <td className="fw-semibold text-dark">
                                    <i className="bi bi-book me-1 text-muted" /> Lesson 1:
                                    Introduction to Motion &amp; Kinematics
                                </td>
                                <td>Aug 03, 2026</td>
                                <td>08:00 AM - 10:00 AM</td>
                                <td>
                                    <span className="badge bg-secondary-subtle text-secondary-emphasis fw-medium px-2.5 py-1">
                                        Ended
                                    </span>
                                </td>
                                <td className="text-muted small" />
                                <td className="text-end">
                                    <div className="d-inline-flex align-items-center gap-1">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                                        >
                                            <i className="bi bi-pencil" /> Modify
                                        </button>
                                        <a
                                            href="/teacher/attendance"
                                            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                                        >
                                            <i className="bi bi-clipboard-check" /> Attendance
                                        </a>
                                    </div>
                                </td>
                            </tr>
                            <tr className="session-row-ended session-docs-row">
                                <td colSpan={6} className="pt-0 pb-3 px-4">
                                    <details
                                        className="session-docs-details fw-normal"
                                        open
                                    >
                                        <summary className="cursor-pointer d-inline-flex align-items-center gap-1 text-primary small">
                                            <i className="bi bi-paperclip" /> Learning Documents
                                            (1)
                                            <i className="bi bi-chevron-down details-chevron text-muted small ms-1" />
                                        </summary>
                                        <div className="session-docs-container">
                                            <div className="session-docs-header">
                                                <span className="session-docs-title">
                                                    Documents
                                                </span>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <a href="#" className="session-doc-link">
                                                    <i className="bi bi-file-earmark-pdf-fill text-danger fs-6" />
                                                    Lesson1.pdf
                                                </a>
                                                <small className="text-muted ms-auto">2.4 MB</small>
                                            </div>
                                        </div>
                                    </details>
                                </td>
                            </tr>
                            {/* Lesson 2 */}
                            <tr className="session-row-cancelled">
                                <td className="fw-semibold text-dark">
                                    <i className="bi bi-book me-1 text-muted" /> Lesson 2:
                                    Forces and Newton's Laws
                                </td>
                                <td>Aug 07, 2026</td>
                                <td>08:00 AM - 10:00 AM</td>
                                <td>
                                    <span className="badge bg-danger-subtle text-danger fw-medium px-2.5 py-1">
                                        Cancelled
                                    </span>
                                </td>
                                <td>
                                    <span className="text-danger small">
                                        <i className="bi bi-info-circle me-1" />
                                        Class cancelled due to storm. Rescheduled to Aug 21,
                                        2026.
                                    </span>
                                </td>
                                <td className="text-end">
                                    <div className="d-inline-flex align-items-center gap-1">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                                        >
                                            <i className="bi bi-pencil" /> Modify
                                        </button>
                                        <a
                                            href="/teacher/attendance"
                                            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                                        >
                                            <i className="bi bi-clipboard-check" /> Attendance
                                        </a>
                                    </div>
                                </td>
                            </tr>
                            <tr className="session-row-cancelled session-docs-row">
                                <td colSpan={6} className="pt-0 pb-3 px-4">
                                    <details
                                        className="session-docs-details fw-normal"
                                        open
                                    >
                                        <summary className="cursor-pointer d-inline-flex align-items-center gap-1 text-primary small">
                                            <i className="bi bi-paperclip" /> Learning Documents
                                            (1)
                                            <i className="bi bi-chevron-down details-chevron text-muted small ms-1" />
                                        </summary>
                                        <div className="session-docs-container">
                                            <div className="session-docs-header">
                                                <span className="session-docs-title">
                                                    Documents
                                                </span>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <a href="#" className="session-doc-link">
                                                    <i className="bi bi-file-earmark-pdf-fill text-danger fs-6" />
                                                    Lesson2.pdf
                                                </a>
                                                <small className="text-muted ms-auto">1.8 MB</small>
                                            </div>
                                        </div>
                                    </details>
                                </td>
                            </tr>
                            {/* Lesson 3 */}
                            <tr>
                                <td className="fw-semibold text-dark">
                                    <i className="bi bi-book me-1 text-primary" /> Lesson 3:
                                    Work, Energy and Power
                                </td>
                                <td>Aug 17, 2026</td>
                                <td>02:00 PM - 04:00 PM</td>
                                <td>
                                    <span className="badge bg-success-subtle text-success fw-medium px-2.5 py-1">
                                        Ongoing
                                    </span>
                                </td>
                                <td className="text-muted small" />
                                <td className="text-end">
                                    <div className="d-inline-flex align-items-center gap-1">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                                        >
                                            <i className="bi bi-pencil" /> Modify
                                        </button>
                                        <a
                                            href="/teacher/attendance"
                                            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                                        >
                                            <i className="bi bi-clipboard-check" /> Attendance
                                        </a>
                                    </div>
                                </td>
                            </tr>
                            <tr className="session-docs-row">
                                <td colSpan={6} className="pt-0 pb-3 px-4">
                                    <details
                                        className="session-docs-details fw-normal"
                                        open
                                    >
                                        <summary className="cursor-pointer d-inline-flex align-items-center gap-1 text-primary small">
                                            <i className="bi bi-paperclip" /> Learning Documents
                                            (1)
                                            <i className="bi bi-chevron-down details-chevron text-muted small ms-1" />
                                        </summary>
                                        <div className="session-docs-container">
                                            <div className="session-docs-header">
                                                <span className="session-docs-title">
                                                    Documents
                                                </span>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <a href="#" className="session-doc-link">
                                                    <i className="bi bi-file-earmark-pdf-fill text-danger fs-6" />
                                                    Lesson3.pdf
                                                </a>
                                                <small className="text-muted ms-auto">3.1 MB</small>
                                            </div>
                                        </div>
                                    </details>
                                </td>
                            </tr>
                            <tr>
                                <td className="fw-semibold text-dark">
                                    <i className="bi bi-book me-1 text-warning" /> Lesson 2
                                    (Make-up): Forces and Newton's Laws
                                </td>
                                <td>Aug 21, 2026</td>
                                <td>08:00 AM - 10:00 AM</td>
                                <td>
                                    <span className="badge bg-warning-subtle text-warning-emphasis fw-medium px-2.5 py-1">
                                        Re-scheduled
                                    </span>
                                </td>
                                <td className="text-muted small">
                                    Make-up session replacing Aug 07 class
                                </td>
                                <td className="text-end">
                                    <div className="d-inline-flex align-items-center gap-1">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                                        >
                                            <i className="bi bi-pencil" /> Modify
                                        </button>
                                        <a
                                            href="/teacher/attendance"
                                            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                                        >
                                            <i className="bi bi-clipboard-check" /> Attendance
                                        </a>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td className="fw-semibold text-dark">
                                    <i className="bi bi-book me-1 text-info" /> Lesson 4:
                                    Momentum and Impulse
                                </td>
                                <td>Aug 24, 2026</td>
                                <td>08:00 AM - 10:00 AM</td>
                                <td>
                                    <span className="badge bg-info-subtle text-info-emphasis fw-medium px-2.5 py-1">
                                        Scheduled
                                    </span>
                                </td>
                                <td className="text-muted small" />
                                <td className="text-end">
                                    <div className="d-inline-flex align-items-center gap-1">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                                        >
                                            <i className="bi bi-pencil" /> Modify
                                        </button>
                                        <a
                                            href="/teacher/attendance"
                                            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                                        >
                                            <i className="bi bi-clipboard-check" /> Attendance
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </details>
            {/* Assignment list*/}
            <details className="card class-list-card border-0 mb-4" open>
                <summary className="class-list-header d-flex align-items-center justify-content-between cursor-pointer py-3 px-4">
                    <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-journal-text text-primary fs-5" />
                        <h4 className="class-list-title mb-0">Class Assignments</h4>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <span className="text-muted small">Toggle Section</span>
                        <i className="bi bi-chevron-down details-chevron text-muted" />
                    </div>
                </summary>
                {/* New Assignment Button */}
                <div className="px-4 py-3 border-bottom bg-white d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <a
                        href="/teacher/new-assignment"
                        className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1"
                    >
                        <i className="bi bi-plus-lg" /> New Assignment
                    </a>
                </div>
                <div className="table-responsive-container">
                    <table className="table custom-table align-middle mb-0">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Creation Date</th>
                                <th>Deadline &amp; Estimated Time</th>
                                <th>Grading Status</th>
                                <th>Overall Grade (Out of 10)</th>
                                <th className="text-end">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Assignment 1 */}
                            <tr>
                                <td className="fw-semibold text-dark">
                                    <a
                                        href="/teacher/assignment"
                                        className="text-decoration-none text-dark"
                                    >
                                        <i className="bi bi-file-earmark-text me-1 text-primary" />{" "}
                                        Assignment 1: Kinematics Problem Set
                                    </a>
                                </td>
                                <td>Aug 04, 2026</td>
                                <td>
                                    Aug 11, 2026
                                    <span className="badge bg-secondary-subtle text-secondary ms-1 fw-normal">
                                        Expired
                                    </span>
                                </td>
                                <td>
                                    <span className="badge bg-success-subtle text-success fw-medium px-2.5 py-1">
                                        Graded
                                    </span>
                                </td>
                                <td>
                                    <span className="fw-bold text-dark">8.8</span>{" "}
                                    <small className="text-muted">/ 10</small>
                                </td>
                                <td className="text-end">
                                    <a
                                        href="/teacher/assignment"
                                        className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                                    >
                                        <i className="bi bi-eye" /> View
                                    </a>
                                </td>
                            </tr>
                            {/* Assignment 2 */}
                            <tr>
                                <td className="fw-semibold text-dark">
                                    <i className="bi bi-file-earmark-text me-1 text-primary" />{" "}
                                    Assignment 2: Newton's Laws Lab Report
                                </td>
                                <td>Aug 12, 2026</td>
                                <td>
                                    Aug 18, 2026
                                    <span className="text-danger fw-semibold small ms-1">
                                        (10 hours remaining)
                                    </span>
                                </td>
                                <td>
                                    <span className="badge bg-warning-subtle text-warning-emphasis fw-medium px-2.5 py-1">
                                        Ungraded
                                    </span>
                                </td>
                                <td className="text-muted">-</td>
                                <td className="text-end">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                                    >
                                        <i className="bi bi-eye" /> View
                                    </button>
                                </td>
                            </tr>
                            {/* Assignment 3 */}
                            <tr>
                                <td className="fw-semibold text-dark">
                                    <i className="bi bi-file-earmark-text me-1 text-primary" />{" "}
                                    Assignment 3: Energy Conservation Quiz
                                </td>
                                <td>Aug 16, 2026</td>
                                <td>
                                    Aug 23, 2026
                                    <span className="text-primary fw-medium small ms-1">
                                        (6 days remaining)
                                    </span>
                                </td>
                                <td>
                                    <span className="badge bg-warning-subtle text-warning-emphasis fw-medium px-2.5 py-1">
                                        Ungraded
                                    </span>
                                </td>
                                <td className="text-muted">-</td>
                                <td className="text-end">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                                    >
                                        <i className="bi bi-eye" /> View
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </details>
        </>
    );
}