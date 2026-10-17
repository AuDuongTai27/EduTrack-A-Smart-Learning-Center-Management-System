import PageHeader from "../../../components/Common/PageHeader";
import { Link } from "react-router-dom";
import {
  StudentSubmissionsTable,
  AssignmentOverviewCard,
} from "../../../components/teacher/Teacher/assignment";
export default function TeacherAssignmentPage() {
  return (
    <>
      {/* Breadcrumb & Page Title */}
      <PageHeader
        title="Assignment Details"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teacher/dashboard" },
          { label: "My Classes", path: "/teacher/classes" },
          { label: "Class I-A", path: "/teacher/classes/class-1-a" },
          { label: "Assignment 1: Kinematics Problem Set" },
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
      {/* Assignment Overview Header Card */}
      <AssignmentOverviewCard />
      {/* Student List Section */}
      <StudentSubmissionsTable />
    </>
  );
}
