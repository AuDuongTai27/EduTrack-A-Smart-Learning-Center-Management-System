import PageHeader from "../../../components/Common/PageHeader";
import { Link, useParams } from "react-router-dom";
import {
  StudentSubmissionsTable,
  AssignmentOverviewCard,
} from "../../../components/teacher/Teacher/assignment";

export default function TeacherAssignmentPage() {
  const { id, classId, assignmentId } = useParams<{ id?: string; classId?: string; assignmentId?: string }>();
  const targetClassId = classId || (assignmentId ? id : undefined) || "1";
  const targetAssignmentId = assignmentId || (classId ? id : undefined) || "1";

  return (
    <>
      {/* Breadcrumb & Page Title */}
      <PageHeader
        title="Assignment Details"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teacher/dashboard" },
          { label: "My Classes", path: "/teacher/classes" },
          { label: `Class #${targetClassId}`, path: `/teacher/classes/${targetClassId}` },
          { label: `Assignment #${targetAssignmentId}` },
        ]}
        action={
          <div className="d-flex align-items-center gap-2">
            <Link
              to={`/teacher/classes/${targetClassId}`}
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
