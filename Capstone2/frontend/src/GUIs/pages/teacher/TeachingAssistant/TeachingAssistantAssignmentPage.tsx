import { Link } from "react-router-dom";
import PageHeader from "../../../components/Common/PageHeader";
import {
  AssignmentOverviewCard,
  StudentSubmissionsTable,
} from "../../../components/teacher/TeachingAssistant/assignment";

export default function TeachingAssistantAssignmentPage() {
  return (
    <>
      {/* Breadcrumb & Page Title */}
      <PageHeader
        title="Assignment Details"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teaching-assistant/dashboard" },
          { label: "My Classes", path: "/teaching-assistant/classes" },
          { label: "Class I-A", path: "/teaching-assistant/classes/class-1-a" },
          { label: "Assignment 1: Kinematics Problem Set" },
        ]}
        action={
          <div className="d-flex align-items-center gap-2">
            <Link
              to="/teaching-assistant/classes/class-1-a"
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
