import { Link, useParams } from "react-router-dom";
import PageHeader from "../../../components/Common/PageHeader";
import {
  AssignmentOverviewCard,
  StudentSubmissionsTable,
} from "../../../components/teacher/TeachingAssistant/assignment";

export default function TeachingAssistantAssignmentPage() {
  const { id, classId, assignmentId } = useParams<{ id?: string; classId?: string; assignmentId?: string }>();
  const targetClassId = classId || (assignmentId ? id : undefined) || "1";
  const targetAssignmentId = assignmentId || (classId ? id : undefined) || "1";

  return (
    <>
      {/* Breadcrumb & Page Title */}
      <PageHeader
        title="Assignment Details"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teaching-assistant/dashboard" },
          { label: "My Classes", path: "/teaching-assistant/classes" },
          { label: `Class #${targetClassId}`, path: `/teaching-assistant/classes/${targetClassId}` },
          { label: `Assignment #${targetAssignmentId}` },
        ]}
        action={
          <div className="d-flex align-items-center gap-2">
            <Link
              to={`/teaching-assistant/classes/${targetClassId}`}
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
