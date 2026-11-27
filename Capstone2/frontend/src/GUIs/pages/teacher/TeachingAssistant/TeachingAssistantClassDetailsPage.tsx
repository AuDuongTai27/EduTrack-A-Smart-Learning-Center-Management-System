import { DataState, dataError } from '../../../components/Common/DataState';
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../../../components/Common/PageHeader";
import {
  AssignmentsSection,
  ClassInfoCard,
  ParticipantsSection,
  SessionsSection,
} from "../../../components/teacher/TeachingAssistant/classDetails";
import teachingDAL, { type TeachingClassItemDto } from "../../../../DAL/teachingDAL";
import type { TeachingAssignmentItemDto } from "../../../../BLL/models/teaching/TeachingAssignmentDto";

export default function TeachingAssistantClassDetailsPage() {
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryVersion, setRetryVersion] = useState(0);

  const { id, classId } = useParams<{ id?: string; classId?: string }>();
  const numClassId = Number(classId || id || "0");
  const targetClassId = String(numClassId);

  const [classInfo, setClassInfo] = useState<TeachingClassItemDto | null>(null);
  const [studentsError, setStudentsError] = useState<string | null>(null);
    const [assignmentsError, setAssignmentsError] = useState<string | null>(null);
    const [students, setStudents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<TeachingAssignmentItemDto[] | any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchClassDetails() {
      try {
        setLoading(true);
      setLoadError(null);
                setStudentsError(null); setAssignmentsError(null);
        // 1. Fetch class details scoped to TA
        const cls = await teachingDAL.getClassById(numClassId);
                if (!cls) throw new Error("Class not found");

        // 2. Fetch real students for this class via teachingDAL
        try {
          const classStudents = await teachingDAL.getClassStudents(numClassId);
          if (isMounted) setStudents(classStudents);
        } catch (error) {
          if (isMounted) { setStudents([]); setStudentsError(dataError(error)); }
        }

        // 3. Fetch real assignments for this class via teachingDAL
        try {
          const teachingAsgs = await teachingDAL.getClassAssignments(numClassId);
          if (isMounted) {
            setAssignments(teachingAsgs);
          }
        } catch (error) {
          if (isMounted) { setAssignments([]); setAssignmentsError(dataError(error)); }
        }

        if (isMounted) {
          setClassInfo(cls);
        }
      } catch (err) {
        if (isMounted) setLoadError(dataError(err));
        console.error("Failed to load TA class details:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchClassDetails();

    return () => {
      isMounted = false;
    };
  }, [retryVersion, numClassId]);

  if (loadError) return <DataState error message={loadError} onRetry={() => { setLoadError(null); setRetryVersion(v => v + 1); }} />;

  return (
    <>
      {/* Breadcrumb & Page Title */}
      <PageHeader
        title={classInfo ? classInfo.className : `Class #${targetClassId}`}
        breadcrumbItems={[
          { label: "Dashboard", path: "/teaching-assistant/dashboard" },
          { label: "My Classes", path: "/teaching-assistant/classes" },
          { label: classInfo ? classInfo.className : `Class #${targetClassId}` },
        ]}
        action={
          <div className="d-flex align-items-center gap-2">
            <Link
              to="/teaching-assistant/classes"
              className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
            >
              <i className="bi bi-arrow-left" /> Back to Classes
            </Link>
          </div>
        }
      />

      {loading ? (
        <div className="card class-list-card border-0 mb-4 p-5 text-center">
          <div className="spinner-border text-primary mx-auto mb-2" role="status" />
          <p className="text-muted mb-0">Loading class details...</p>
        </div>
      ) : (
        <>
          {/* Class Header */}
          <ClassInfoCard
            classInfo={classInfo}
            teacherName={classInfo?.teacherName || "Not provided"}
            taName={classInfo?.taName || classInfo?.partnerName || "Not provided"}
          />
          {/* Participant List */}
          {studentsError ? <DataState error message={studentsError} onRetry={() => setRetryVersion(v => v + 1)} /> : <ParticipantsSection
            classId={targetClassId}
            participants={students}
            baseRolePath="/teaching-assistant"
          />}
          {/* Sessions List */}
          <SessionsSection classId={targetClassId} />
          {/* Assignment list*/}
          {assignmentsError ? <DataState error message={assignmentsError} onRetry={() => setRetryVersion(v => v + 1)} /> : <AssignmentsSection
            classId={targetClassId}
            assignments={assignments}
          />}
        </>
      )}
    </>
  );
}
