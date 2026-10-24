import PageHeader from "../../../components/Common/PageHeader";
import { useParams } from "react-router-dom";
import {
  NewAssignmentAttachment,
  NewAssignmentDeadline,
  NewAssignmentDescription,
  NewAssignmentFormAction,
  NewAssignmentTitle,
  NewAssignmentTypeSelector
} from "../../../components/teacher/Teacher/newAssignment";

export default function TeacherNewAssignmentPage() {
  const { id, classId } = useParams<{ id?: string; classId?: string }>();
  const targetClassId = classId || id || "1";

  return (
    <>
      {/* Breadcrumb & Page Title */}
      <PageHeader
        title="New Assignment"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teacher/dashboard" },
          { label: "My Classes", path: "/teacher/classes" },
          { label: `Class #${targetClassId}`, path: `/teacher/classes/${targetClassId}` },
          { label: "New Assignment" }
        ]}
      />

      {/* New Assignment Form Card */}
      <div className="card class-list-card border-0 mb-4">
        <div className="class-list-header py-3 px-4 border-bottom">
          <h4 className="class-list-title mb-0">Create Assignment</h4>
        </div>
        <div className="card-body p-4">
          <form>
            <div className="row g-3">
              {/* Assignment Title */}
              <NewAssignmentTitle />

              {/* Deadline */}
              <NewAssignmentDeadline />

              {/* Assignment Type Radio Buttons */}
              <NewAssignmentTypeSelector />

              {/* Description */}
              <NewAssignmentDescription />

              {/* Attachment */}
              <NewAssignmentAttachment />
            </div>

            {/* Form Actions (Cancel & Save) */}
            <NewAssignmentFormAction />

          </form>
        </div>
      </div>
    </>
  );
}
