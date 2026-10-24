import { useEffect, useState } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import { Link, useParams } from "react-router-dom";
import {
  StudentSubmissionsTable,
  AssignmentOverviewCard,
} from "../../../components/teacher/Teacher/assignment";
import assignmentDAL from "../../../../DAL/assignmentDAL";
import classDAL from "../../../../DAL/classDAL";
import submissionDAL from "../../../../DAL/submissionDAL";
import type { AssignmentDto } from "../../../../BLL/models/AssignmentDto";
import type { ClassDto } from "../../../../BLL/models/ClassDto";
import type { SubmissionDto } from "../../../../BLL/models/SubmissionDto";

export default function TeacherAssignmentPage() {
  const { id, classId, assignmentId } = useParams<{ id?: string; classId?: string; assignmentId?: string }>();
  const numAssignmentId = Number(assignmentId || (classId ? id : undefined) || "1");
  const numClassId = Number(classId || (assignmentId ? id : undefined) || "1");
  const targetClassId = String(numClassId);
  const targetAssignmentId = String(numAssignmentId);

  const [assignment, setAssignment] = useState<AssignmentDto | null>(null);
  const [classInfo, setClassInfo] = useState<ClassDto | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchAssignmentData() {
      try {
        setLoading(true);
        // 1. GetId: Fetch assignment detail by ID
        const asg = await assignmentDAL.getById(numAssignmentId);

        // 2. GetId: Fetch class detail by ID
        const cls = await classDAL.getClassById(numClassId);

        // 3. GetAll: Fetch submissions for this assignment
        const subsResult = await submissionDAL.getSubmissionsByAssignmentId(numAssignmentId);

        if (isMounted) {
          setAssignment(asg);
          setClassInfo(cls);
          setSubmissions(subsResult.data);
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
          />
          {/* Student List Section */}
          <StudentSubmissionsTable submissions={submissions} />
        </>
      )}
    </>
  );
}
