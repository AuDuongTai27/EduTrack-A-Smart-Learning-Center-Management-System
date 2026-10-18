export default function TeacherAttendancePage() {
    return (
        <>
            {/* Breadcrumb & Page Title */}
            <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
                <div className="my-auto mb-2">
                    <h3 className="page-title mb-1">Class Attendance</h3>
                    <nav>
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item">
                                <a href="/teacher/dashboard">Dashboard</a>
                            </li>
                            <li className="breadcrumb-item">
                                <a href="/teacher/classes">My Classes</a>
                            </li>
                            <li className="breadcrumb-item">
                                <a href="/teacher/class-details">Class I-A</a>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                Attendance
                            </li>
                        </ol>
                    </nav>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <a
                        href="/teacher/class-details"
                        className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
                    >
                        <i className="bi bi-arrow-left" /> Back to Class Details
                    </a>
                </div>
            </div>
            {/* Student Attendance List */}
            <div className="card class-list-card border-0 mb-4">
                {/* Card Header */}
                <div className="class-list-header d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <h4 className="class-list-title">Student Attendance List</h4>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        <div className="dropdown">
                            <button
                                type="button"
                                className="btn-header-action"
                                id="filterDropdownBtn"
                                data-bs-toggle="dropdown"
                                data-bs-auto-close="outside"
                                aria-expanded="false"
                            >
                                <i className="bi bi-funnel" />
                                Filter
                                <i className="bi bi-chevron-down ms-1" />
                            </button>
                        </div>
                        <div className="dropdown">
                            <button
                                type="button"
                                className="btn-header-action"
                                id="sortDropdownBtn"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <i className="bi bi-arrow-down-up" />
                                <span id="sortLabel">Sort by A-Z</span>
                                <i className="bi bi-chevron-down ms-1" />
                            </button>
                        </div>
                    </div>
                </div>
                {/* Table toolbar */}
                <div className="table-toolbar">
                    <div className="table-entries-select">
                        <span>Row Per Page</span>
                        <select
                            className="form-select form-select-sm"
                            id="entriesSelect"
                            defaultValue={10}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        <span>Entries</span>
                    </div>
                    <div>
                        <input
                            type="search"
                            className="table-search-input"
                            id="tableSearchInput"
                            placeholder="Search..."
                        />
                    </div>
                </div>
                {/* Table Container */}
                <div className="table-responsive-container">
                    <table
                        className="table custom-table align-middle"
                        id="attendanceTable"
                    >
                        <thead>
                            <tr>
                                <th className="th-checkbox">
                                    <div className="form-check m-0">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="selectAll"
                                        />
                                    </div>
                                </th>
                                <th>Avatar</th>
                                <th>Student Name</th>
                                <th>Attendance</th>
                                <th className="th-note">Note</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Student 1 */}
                            <tr>
                                <td>
                                    <div className="form-check m-0">
                                        <input
                                            className="form-check-input row-checkbox"
                                            type="checkbox"
                                        />
                                    </div>
                                </td>
                                <td>
                                    <div className="ta-avatar-initials avatar-initials-sm avatar-initials-indigo">
                                        JD
                                    </div>
                                </td>
                                <td className="fw-semibold text-dark">John Doe</td>
                                <td>
                                    <div className="d-flex align-items-center gap-3 flex-wrap">
                                        <div className="form-check form-check-inline m-0">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="attendance_john_doe"
                                                id="present_jd"
                                                defaultChecked
                                            />
                                            <label
                                                className="form-check-label text-dark fw-medium cursor-pointer"
                                                htmlFor="present_jd"
                                            >
                                                Present
                                            </label>
                                        </div>
                                        <div className="form-check form-check-inline m-0">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="attendance_john_doe"
                                                id="late_jd"
                                            />
                                            <label
                                                className="form-check-label text-dark fw-medium cursor-pointer"
                                                htmlFor="late_jd"
                                            >
                                                Late
                                            </label>
                                        </div>
                                        <div className="form-check form-check-inline m-0">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="attendance_john_doe"
                                                id="absent_jd"
                                            />
                                            <label
                                                className="form-check-label text-dark fw-medium cursor-pointer"
                                                htmlFor="absent_jd"
                                            >
                                                Absent
                                            </label>
                                        </div>
                                        <div className="form-check form-check-inline m-0">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="attendance_john_doe"
                                                id="excuse_jd"
                                            />
                                            <label
                                                className="form-check-label text-dark fw-medium cursor-pointer"
                                                htmlFor="excuse_jd"
                                            >
                                                Excuse
                                            </label>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="Enter note..."
                                    />
                                </td>
                            </tr>
                            {/* Student 2 */}
                            <tr>
                                <td>
                                    <div className="form-check m-0">
                                        <input
                                            className="form-check-input row-checkbox"
                                            type="checkbox"
                                        />
                                    </div>
                                </td>
                                <td>
                                    <div className="ta-avatar-initials avatar-initials-sm avatar-initials-emerald">
                                        AS
                                    </div>
                                </td>
                                <td className="fw-semibold text-dark">Alice Smith</td>
                                <td>
                                    <div className="d-flex align-items-center gap-3 flex-wrap">
                                        <div className="form-check form-check-inline m-0">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="attendance_alice_smith"
                                                id="present_as"
                                                defaultChecked
                                            />
                                            <label
                                                className="form-check-label text-dark fw-medium cursor-pointer"
                                                htmlFor="present_as"
                                            >
                                                Present
                                            </label>
                                        </div>
                                        <div className="form-check form-check-inline m-0">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="attendance_alice_smith"
                                                id="late_as"
                                            />
                                            <label
                                                className="form-check-label text-dark fw-medium cursor-pointer"
                                                htmlFor="late_as"
                                            >
                                                Late
                                            </label>
                                        </div>
                                        <div className="form-check form-check-inline m-0">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="attendance_alice_smith"
                                                id="absent_as"
                                            />
                                            <label
                                                className="form-check-label text-dark fw-medium cursor-pointer"
                                                htmlFor="absent_as"
                                            >
                                                Absent
                                            </label>
                                        </div>
                                        <div className="form-check form-check-inline m-0">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="attendance_alice_smith"
                                                id="excuse_as"
                                            />
                                            <label
                                                className="form-check-label text-dark fw-medium cursor-pointer"
                                                htmlFor="excuse_as"
                                            >
                                                Excuse
                                            </label>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="Enter note..."
                                    />
                                </td>
                            </tr>
                            {/* Student 3 */}
                            <tr>
                                <td>
                                    <div className="form-check m-0">
                                        <input
                                            className="form-check-input row-checkbox"
                                            type="checkbox"
                                        />
                                    </div>
                                </td>
                                <td>
                                    <div className="ta-avatar-initials avatar-initials-sm avatar-initials-amber">
                                        ER
                                    </div>
                                </td>
                                <td className="fw-semibold text-dark">Ethan Roberts</td>
                                <td>
                                    <div className="d-flex align-items-center gap-3 flex-wrap">
                                        <div className="form-check form-check-inline m-0">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="attendance_ethan_roberts"
                                                id="present_er"
                                                defaultChecked
                                            />
                                            <label
                                                className="form-check-label text-dark fw-medium cursor-pointer"
                                                htmlFor="present_er"
                                            >
                                                Present
                                            </label>
                                        </div>
                                        <div className="form-check form-check-inline m-0">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="attendance_ethan_roberts"
                                                id="late_er"
                                            />
                                            <label
                                                className="form-check-label text-dark fw-medium cursor-pointer"
                                                htmlFor="late_er"
                                            >
                                                Late
                                            </label>
                                        </div>
                                        <div className="form-check form-check-inline m-0">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="attendance_ethan_roberts"
                                                id="absent_er"
                                            />
                                            <label
                                                className="form-check-label text-dark fw-medium cursor-pointer"
                                                htmlFor="absent_er"
                                            >
                                                Absent
                                            </label>
                                        </div>
                                        <div className="form-check form-check-inline m-0">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="attendance_ethan_roberts"
                                                id="excuse_er"
                                            />
                                            <label
                                                className="form-check-label text-dark fw-medium cursor-pointer"
                                                htmlFor="excuse_er"
                                            >
                                                Excuse
                                            </label>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="Enter note..."
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                {/* Footer Pagination */}
                <div className="table-pagination-footer">
                    <button
                        type="button"
                        className="pagination-text-btn"
                        id="prevPageBtn"
                    >
                        Prev
                    </button>
                    <div
                        id="paginationContainer"
                        className="d-inline-flex align-items-center gap-1"
                    >
                        <span className="pagination-num-btn">1</span>
                    </div>
                    <button
                        type="button"
                        className="pagination-text-btn"
                        id="nextPageBtn"
                    >
                        Next
                    </button>
                </div>
                {/* Save Attendance Button */}
                <div className="p-3 border-top bg-white d-flex align-items-center justify-content-end gap-2 rounded-bottom">
                    <a
                        href="/teacher/class-details"
                        className="btn btn-outline-secondary btn-sm"
                    >
                        Cancel
                    </a>
                    <button
                        type="button"
                        className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1"
                    >
                        <i className="bi bi-check-lg" /> Save Attendance
                    </button>
                </div>
            </div>
        </>
    )
}