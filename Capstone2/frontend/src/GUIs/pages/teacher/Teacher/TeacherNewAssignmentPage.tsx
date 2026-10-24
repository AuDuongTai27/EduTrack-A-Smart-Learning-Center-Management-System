import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../../../components/Common/PageHeader";
import {
  NewAssignmentAttachment,
  NewAssignmentDeadline,
  NewAssignmentDescription,
  NewAssignmentFormAction,
  NewAssignmentTitle,
  NewAssignmentTypeSelector
} from "../../../components/teacher/Teacher/newAssignment";
import classDAL from "../../../../DAL/classDAL";
import type { ClassDto } from "../../../../BLL/models/ClassDto";

export default function TeacherNewAssignmentPage() {
  const { id, classId } = useParams<{ id?: string; classId?: string }>();
  const numClassId = Number(classId || id || "1");
  const targetClassId = String(numClassId);

  const [classInfo, setClassInfo] = useState<ClassDto | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchClass() {
      try {
        const cls = await classDAL.getClassById(numClassId);
        if (isMounted) setClassInfo(cls);
      } catch (err) {
        console.error("Failed to load class for new assignment:", err);
      }
    }
    fetchClass();
    return () => {
      isMounted = false;
    };
  }, [numClassId]);

  const className = classInfo?.className || `Class #${targetClassId}`;

  return (
    <>
      {/* Breadcrumb & Page Title */}
      <PageHeader
        title={`New Assignment - ${className}`}
        breadcrumbItems={[
          { label: "Dashboard", path: "/teacher/dashboard" },
          { label: "My Classes", path: "/teacher/classes" },
          { label: className, path: `/teacher/classes/${targetClassId}` },
          { label: "New Assignment" }
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

      {/* New Assignment Form Card */}
      <div className="card class-list-card border-0 mb-4">
        <div className="class-list-header py-3 px-4 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
          <h4 className="class-list-title mb-0">Create Assignment for {className}</h4>
          <span className="badge bg-primary-subtle text-primary fw-medium px-2.5 py-1">
            {classInfo?.subjectName || "Subject"}
          </span>
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
