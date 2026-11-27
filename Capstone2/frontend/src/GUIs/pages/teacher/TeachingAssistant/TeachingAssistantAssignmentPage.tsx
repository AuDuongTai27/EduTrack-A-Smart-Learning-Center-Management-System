import { DataState, dataError } from '../../../components/Common/DataState';
import { useEffect, useState } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import { Link, useParams } from "react-router-dom";
import {
  StudentSubmissionsTable,
  AssignmentOverviewCard,
} from "../../../components/teacher/TeachingAssistant/assignment";
import teachingDAL, { type TeachingClassItemDto } from "../../../../DAL/teachingDAL";
import type { TeachingAssignmentItemDto, TeachingSubmissionItemDto } from "../../../../BLL/models/teaching/TeachingAssignmentDto";

export default function TeachingAssistantAssignmentPage() {
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryVersion, setRetryVersion] = useState(0);

  const { id, classId, assignmentId } = useParams<{ id?: string; classId?: string; assignmentId?: string }>();
  const numAssignmentId = Number(assignmentId || (classId ? id : undefined) || "0");
  const numClassId = Number(classId || (assignmentId ? id : undefined) || "0");
  const targetClassId = String(numClassId);
  const targetAssignmentId = String(numAssignmentId);

  const [assignment, setAssignment] = useState<TeachingAssignmentItemDto | any | null>(null);
  const [classInfo, setClassInfo] = useState<TeachingClassItemDto | null>(null);
  const [submissions, setSubmissions] = useState<TeachingSubmissionItemDto[] | any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchAssignmentData() {
      try {
        setLoading(true);
      setLoadError(null);
        // 1. Fetch real assignment detail by ID
        const asg = await teachingDAL.getAssignmentById(numAssignmentId);

        // 2. Fetch class detail scoped to TA
        const cls = await teachingDAL.getClassById(numClassId);
        if (!cls || asg?.classId !== numClassId) throw new Error("Assignment context not found");

        // 3. Fetch real submissions for this assignment
        const subs = await teachingDAL.getAssignmentSubmissions(numAssignmentId);

        if (isMounted) {
          setAssignment(asg);
          setClassInfo(cls);
          setSubmissions(subs);
        }
      } catch (err) {
        if (isMounted) setLoadError(dataError(err));
        console.error("Failed to load TA assignment page data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchAssignmentData();

    return () => {
      isMounted = false;
    };
  }, [retryVersion, numAssignmentId, numClassId]);

  const className = classInfo?.className || `Class #${targetClassId}`;
  const assignmentTitle = assignment?.title || `Assignment #${targetAssignmentId}`;

  const handleSubmissionGraded = (updated: TeachingSubmissionItemDto) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.submissionId === updated.submissionId ? updated : s))
    );
  };

  if (loadError) return <DataState error message={loadError} onRetry={() => { setLoadError(null); setRetryVersion(v => v + 1); }} />;

  return (
    <>
      {/* Breadcrumb & Page Title */}
      <PageHeader
        title={assignmentTitle}
        breadcrumbItems={[
          { label: "Dashboard", path: "/teaching-assistant/dashboard" },
          { label: "My Classes", path: "/teaching-assistant/classes" },
          { label: className, path: `/teaching-assistant/classes/${targetClassId}` },
          { label: assignmentTitle },
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

      {loading ? (
        <div className="card class-list-card border-0 mb-4 p-5 text-center">
          <div className="spinner-border text-primary mx-auto mb-2" role="status" />
          <p className="text-muted mb-0">Loading assignment details & submissions...</p>
        </div>
      ) : (
        <>
          {/* Assignment Overview Header Card */}
          <AssignmentOverviewCard
            assignment={assignment}
            className={className}
          />

          {/* Student List Section */}
          <StudentSubmissionsTable
            assignmentId={numAssignmentId}
            submissions={submissions}
            onSubmissionGraded={handleSubmissionGraded}
          />
        </>
      )}
    </>
  );
}
