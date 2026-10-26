import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../../../components/Common/PageHeader";
import {
  AttendanceListHeader,
  AttendanceListPagination,
  AttendanceListToolbar,
  AttendanceSaveBar,
  AttendanceTable,
} from "../../../components/teacher/TeachingAssistant/attendance";
import classDAL from "../../../../DAL/classDAL";
import progressDAL from "../../../../DAL/progressDAL";
import userDAL from "../../../../DAL/userDAL";
import type { ClassDto } from "../../../../BLL/models/ClassDto";
import type { AttendanceDto } from "../../../../BLL/models/ProgressDto";
import type { UserDto } from "../../../../BLL/models/UserDto";

export default function TeachingAssistantAttendancePage() {
  const { id, classId } = useParams<{ id?: string; classId?: string }>();
  const numClassId = Number(classId || id || "1");
  const targetClassId = String(numClassId);

  const [classInfo, setClassInfo] = useState<ClassDto | null>(null);
  const [attendances, setAttendances] = useState<AttendanceDto[]>([]);
  const [students, setStudents] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchAttendanceData() {
      try {
        setLoading(true);
        // 1. GetId: Fetch class info by ID
        const cls = await classDAL.getClassById(numClassId);

        // 2. GetAll: Fetch all attendance records
        const attRes = await progressDAL.getAllAttendances();
        const matchedAtts = attRes.data.filter(
          (a: AttendanceDto) => a.classId === numClassId || a.sessionId === 1
        );

        // 3. GetAll: Fetch users (students) for fallback or roster
        const usersRes = await userDAL.getAllUsers();
        const studentList = usersRes.data.filter(
          (u: UserDto) => u.roles?.includes("student") || u.userCode.startsWith("STU")
        );

        if (isMounted) {
          setClassInfo(cls);
          setAttendances(matchedAtts.length > 0 ? matchedAtts : attRes.data.slice(0, 3));
          setStudents(studentList);
        }
      } catch (err) {
        console.error("Failed to load TA attendance data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchAttendanceData();

    return () => {
      isMounted = false;
    };
  }, [numClassId]);

  return (
    <>
      {/* Breadcrumb & Page Title */}
      <PageHeader
        title={classInfo ? `Điểm Danh: ${classInfo.className}` : `Class Attendance #${targetClassId}`}
        breadcrumbItems={[
          { label: "Dashboard", path: "/teaching-assistant/dashboard" },
          { label: "My Classes", path: "/teaching-assistant/classes" },
          { label: classInfo ? classInfo.className : `Class #${targetClassId}`, path: `/teaching-assistant/classes/${targetClassId}` },
          { label: "Attendance" },
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

      {loading && (
        <div className="alert alert-info py-2 px-3 mb-3 d-flex align-items-center gap-2">
          <div className="spinner-border spinner-border-sm" role="status" />
          <span>Đang tải danh sách điểm danh...</span>
        </div>
      )}

      {/* Student Attendance List */}
      <div className="card class-list-card border-0 mb-4">
        {/* Card Header */}
        <AttendanceListHeader />
        {/* Table toolbar */}
        <AttendanceListToolbar />
        {/* Table Container */}
        <AttendanceTable attendances={attendances} students={students} />
        {/* Footer Pagination */}
        <AttendanceListPagination />
        {/* Save Attendance Button */}
        <AttendanceSaveBar />
      </div>
    </>
  );
}