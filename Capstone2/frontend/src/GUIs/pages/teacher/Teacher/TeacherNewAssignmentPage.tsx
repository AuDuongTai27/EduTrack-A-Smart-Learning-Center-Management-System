import { useRef } from 'react';
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../../components/Common/PageHeader";
import {
  NewAssignmentAttachment,
  NewAssignmentDeadline,
  NewAssignmentDescription,
  NewAssignmentFormAction,
  NewAssignmentTitle,
} from "../../../components/teacher/Teacher/newAssignment";
import teachingDAL, { DEFAULT_TEACHER_ID, type TeachingClassItemDto } from "../../../../DAL/teachingDAL";

const getDefaultDeadline = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setHours(23, 59, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function TeacherNewAssignmentPage() {
  const mutationLock = useRef(false);
  const navigate = useNavigate();
  const { id, classId } = useParams<{ id?: string; classId?: string }>();
  const numClassId = Number(classId || id || "0");
  const targetClassId = String(numClassId);

  const [attachmentUploading, setAttachmentUploading] = useState(false);
  const [classLoading, setClassLoading] = useState(true);
  const [classInfo, setClassInfo] = useState<TeachingClassItemDto | null>(null);

  // Form states
  const [title, setTitle] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>(getDefaultDeadline());
  const [assignmentType, setAssignmentType] = useState<string>("Written Assignment");
  const [description, setDescription] = useState<string>("");
  const [fileUrl, setFileUrl] = useState<string>("");
  const [maxScore] = useState<number>(10.0);

  // Status & error states
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [titleError, setTitleError] = useState<string>("");
  const [deadlineError, setDeadlineError] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchClass() {
      try {
        const cls = await teachingDAL.getClassById(numClassId, DEFAULT_TEACHER_ID);
        if (!cls) throw new Error("Class not found");
        if (cls.myRoleInClass === "teaching_assistant") throw new Error("Forbidden");
        if (isMounted) setClassInfo(cls);
      } catch (err) {
        if (isMounted) setErrorMessage("Unable to load this class. Return to My Classes and retry.");
      } finally {
        if (isMounted) setClassLoading(false);
      }
    }
    fetchClass();
    return () => {
      isMounted = false;
    };
  }, [numClassId]);

  const className = classInfo?.className || `Class #${targetClassId}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mutationLock.current || submitting || attachmentUploading || classLoading || !classInfo) return;
    setTitleError("");
    setDeadlineError("");
    setErrorMessage(null);

    // Validation
    if (!title.trim()) {
      setTitleError("Please enter an assignment title.");
      return;
    }
    if (!dueDate) {
      setDeadlineError("Please select a valid deadline.");
      return;
    }

    mutationLock.current = true;
    try {
      setSubmitting(true);
      await teachingDAL.createAssignment({
        classId: numClassId,
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: new Date(dueDate).toISOString(),
        assignmentType,
        fileUrl: fileUrl.trim() || undefined,
        maxScore,
        createdBy: DEFAULT_TEACHER_ID,
        isAiGradingEnabled: true,
      });

      setSuccessMessage("Assignment successfully created and assigned to the class!");
      setTimeout(() => {
        navigate(`/teacher/classes/${targetClassId}`);
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err?.message || "An error occurred while creating the assignment.");
    } finally {
      mutationLock.current = false;
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Breadcrumb & Page Title */}
      <PageHeader
        title={`New Assignment - ${className}`}
        breadcrumbItems={[
          { label: "Dashboard", path: "/teacher/dashboard" },
          { label: "My Classes", path: "/teacher/classes" },
          { label: className, path: `/teacher/classes/${targetClassId}` },
          { label: "New Assignment" },
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

      {/* Notifications */}
      {successMessage && (
        <div className="alert alert-success d-flex align-items-center gap-2 mb-4" role="alert">
          <i className="bi bi-check-circle-fill fs-5" />
          <div>
            <strong>Success!</strong> {successMessage} Redirecting back to class...
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill fs-5" />
          <div>
            <strong>Error!</strong> {errorMessage}
          </div>
        </div>
      )}

      {/* New Assignment Form Card */}
      <div className="card class-list-card border-0 mb-4 shadow-sm">
        <div className="class-list-header py-3 px-4 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
          <h4 className="class-list-title mb-0">Create Assignment for {className}</h4>
          <span className="badge bg-primary-subtle text-primary fw-medium px-2.5 py-1">
            {classInfo?.subjectName || "Subject"}
          </span>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {/* Assignment Title */}
              <NewAssignmentTitle
                value={title}
                onChange={(val) => {
                  setTitle(val);
                  if (titleError) setTitleError("");
                }}
                error={titleError}
                disabled={submitting}
              />

              {/* Deadline */}
              <NewAssignmentDeadline
                value={dueDate}
                onChange={(val) => {
                  setDueDate(val);
                  if (deadlineError) setDeadlineError("");
                }}
                error={deadlineError}
                disabled={submitting}
              />

              {/* Description */}
              <NewAssignmentDescription
                value={description}
                onChange={setDescription}
                disabled={submitting}
              />

              {/* Attachment */}
              <NewAssignmentAttachment onUploadingChange={setAttachmentUploading}
                value={fileUrl}
                onChange={setFileUrl}
                disabled={submitting}
              />
            </div>

            {/* Form Actions (Cancel & Save) */}
            <NewAssignmentFormAction
              classId={targetClassId}
              submitting={submitting || attachmentUploading || classLoading || !classInfo}
            />
          </form>
        </div>
      </div>
    </>
  );
}
