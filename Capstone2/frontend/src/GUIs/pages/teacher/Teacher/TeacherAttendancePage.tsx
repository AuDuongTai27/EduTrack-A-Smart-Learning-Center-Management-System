import { Link } from "react-router-dom";
import PageHeader from "../../../components/Common/PageHeader";
import {
    AttendanceListHeader,
    AttendanceListPagination,
    AttendanceListToolbar,
    AttendanceSaveBar,
    AttendanceTable
} from "../../../components/teacher/Teacher/attendance";

export default function TeacherAttendancePage() {
    return (
        <>
            {/* Breadcrumb & Page Title */}
            <PageHeader
                title="Class Attendance"
                breadcrumbItems={[
                    { label: "Dashboard", path: "/teacher/dashboard" },
                    { label: "My Classes", path: "/teacher/classes" },
                    { label: "Class I-A", path: "/teacher/classes/class-1-a" },
                    { label: "Attendance" },
                ]}
                action={
                    <div className="d-flex align-items-center gap-2">
                        <Link
                            to="/teacher/class-details"
                            className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
                        >
                            <i className="bi bi-arrow-left" /> Back to Class Details
                        </Link>
                    </div>
                }
            />
            {/* Student Attendance List */}
            <div className="card class-list-card border-0 mb-4">
                {/* Card Header */}
                <AttendanceListHeader />
                {/* Table toolbar */}
                <AttendanceListToolbar />
                {/* Table Container */}
                <AttendanceTable />
                {/* Footer Pagination */}
                <AttendanceListPagination />
                {/* Save Attendance Button */}
                <AttendanceSaveBar />
            </div>
        </>
    )
}