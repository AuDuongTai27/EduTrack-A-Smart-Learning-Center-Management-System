import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../../../components/Common/PageHeader";
import {
  AssignmentsSection,
  ClassInfoCard,
  ParticipantsSection,
  SessionsSection,
} from "../../../components/teacher/TeachingAssistant/classDetails";
import classDAL from "../../../../DAL/classDAL";
import userDAL from "../../../../DAL/userDAL";
import assignmentDAL from "../../../../DAL/assignmentDAL";
import type { ClassDto } from "../../../../BLL/models/ClassDto";
import type { UserDto } from "../../../../BLL/models/UserDto";
import type { AssignmentDto } from "../../../../BLL/models/AssignmentDto";

export default function TeachingAssistantClassDetailsPage() {
  const { id, classId } = useParams<{ id?: string; classId?: string }>();
  const numClassId = Number(classId || id || "1");
  const targetClassId = String(numClassId);

  const [classInfo, setClassInfo] = useState<ClassDto | null>(null);
  const [students, setStudents] = useState<UserDto[]>([]);
  const [assignments, setAssignments] = useState<AssignmentDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchClassDetails() {
      try {
        setLoading(true);
        // 1. GetId: Fetch class details by ID
        const cls = await classDAL.getClassById(numClassId);

        // 2. GetAll: Fetch users for participants (filter students)
        const usersResult = await userDAL.getAllUsers();
        const studentList = usersResult.data.filter(
          (u: UserDto) => u.roles?.includes("student") || u.userCode.startsWith("STU")
        );

        // 3. GetAll: Fetch assignments for this class
        const assignResult = await assignmentDAL.getAllAssignments();
        const filteredAssignments = assignResult.data.filter(
          (a: AssignmentDto) => a.classId === numClassId
        );

        if (isMounted) {
          setClassInfo(cls);
          setStudents(studentList);
          setAssignments(filteredAssignments.length > 0 ? filteredAssignments : assignResult.data.slice(0, 2));
        }
      } catch (err) {
        console.error("Failed to load TA class details:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchClassDetails();

    return () => {
      isMounted = false;
    };
  }, [numClassId]);

  return (
    <>
      {/* Breadcrumb & Page Title */}
      <PageHeader
        title={classInfo ? `${classInfo.className} (Chi Tiết Lớp Học)` : `Class Details #${targetClassId}`}
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

      {loading && (
        <div className="alert alert-info py-2 px-3 mb-3 d-flex align-items-center gap-2">
          <div className="spinner-border spinner-border-sm" role="status" />
          <span>Đang tải thông tin lớp học và học viên...</span>
        </div>
      )}

      {/* Class Header */}
      <ClassInfoCard classInfo={classInfo} />

      {/* Participant List */}
      <ParticipantsSection participants={students} />

      {/* Sessions List */}
      <SessionsSection classId={targetClassId} />

      {/* Assignment list*/}
      <AssignmentsSection classId={targetClassId} assignments={assignments} />
    </>
  );
}