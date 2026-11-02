import { useEffect, useState } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  StudentSubmissionsTable,
  AssignmentOverviewCard,
} from "../../../components/teacher/Teacher/assignment";
import classDAL from "../../../../DAL/classDAL";
import teachingDAL from "../../../../DAL/teachingDAL";
import type { ClassDto } from "../../../../BLL/models/ClassDto";
import type { TeachingAssignmentItemDto, TeachingSubmissionItemDto } from "../../../../BLL/models/teaching/TeachingAssignmentDto";

export default function TeacherAssignmentPage() {
  const navigate = useNavigate();
  const { id, classId, assignmentId } = useParams<{ id?: string; classId?: string; assignmentId?: string }>();
  const numAssignmentId = Number(assignmentId || (classId ? id : undefined) || "1");
  const numClassId = Number(classId || (assignmentId ? id : undefined) || "1");
  const targetClassId = String(numClassId);
  const targetAssignmentId = String(numAssignmentId);

  const [assignment, setAssignment] = useState<TeachingAssignmentItemDto | any | null>(null);
  const [classInfo, setClassInfo] = useState<ClassDto | null>(null);
  const [submissions, setSubmissions] = useState<TeachingSubmissionItemDto[] | any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchAssignmentData() {
      try {
        setLoading(true);
        // 1. Fetch real assignment detail by ID
        const asg = await teachingDAL.getAssignmentById(numAssignmentId);

        // 2. Fetch class detail by ID
        const cls = await classDAL.getClassById(numClassId);

        // 3. Fetch real submissions for this assignment
        const subs = await teachingDAL.getAssignmentSubmissions(numAssignmentId);

        if (isMounted) {
          setAssignment(asg);
          setClassInfo(cls);
          setSubmissions(subs);
        }
      } catch (err) {
        console.error("Failed to load assignment page data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchAssignmentData();

    return () => {
      isMounted = false;
    };
  }, [numAssignmentId, numClassId]);

  const className = classInfo?.className || `Class #${targetClassId}`;
  const assignmentTitle = assignment?.title || `Assignment #${targetAssignmentId}`;

  const handleSubmissionGraded = (updated: TeachingSubmissionItemDto) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.submissionId === updated.submissionId ? updated : s))
    );
    // Also increment or update graded count
    if (assignment) {
      setAssignment((prev: any) => ({
        ...prev,
        gradedCount: (prev?.gradedCount ?? 0) + 1,
      }));
    }
  };

  return (
    <>
      {/* Breadcrumb & Page Title */}
      <PageHeader
        title={assignmentTitle}
        breadcrumbItems={[
          { label: "Dashboard", path: "/teacher/dashboard" },
          { label: "My Classes", path: "/teacher/classes" },
          { label: className, path: `/teacher/classes/${targetClassId}` },
          { label: assignmentTitle },
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
            onAssignmentUpdated={(updated) => setAssignment(updated)}
            onAssignmentDeleted={() => navigate(`/teacher/classes/${targetClassId}`)}
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
