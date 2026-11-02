import React, { useEffect, useState, useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import PageHeader from "../../../components/Common/PageHeader";
import {
  AttendanceListHeader,
  AttendanceListToolbar,
  AttendanceSaveBar,
  AttendanceTable,
} from "../../../components/teacher/TeachingAssistant/attendance";
import {
  teachingDAL,
  DEFAULT_TA_ID,
  type TeachingClassAttendanceSheetDto,
  type TeachingStudentAttendanceItemDto,
  type TeachingAttendanceStatsDto,
} from "../../../../DAL/teachingDAL";

export default function TeachingAssistantAttendancePage() {
  const { id, classId } = useParams<{ id?: string; classId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const numClassId = Number(classId || id || "1");
  const targetClassId = String(numClassId);
  const paramSessionId = searchParams.get("sessionId") ? Number(searchParams.get("sessionId")) : undefined;

  const [sheet, setSheet] = useState<TeachingClassAttendanceSheetDto | null>(null);
  const [students, setStudents] = useState<TeachingStudentAttendanceItemDto[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<number | undefined>(paramSessionId);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "danger" } | null>(null);

  // 1. Tải bảng điểm danh theo classId và sessionId cho Trợ giảng
  useEffect(() => {
    let isMounted = true;
    async function fetchSheet() {
      try {
        setLoading(true);
        const data = await teachingDAL.getAttendanceSheet(numClassId, selectedSessionId, DEFAULT_TA_ID);
        if (isMounted && data) {
          setSheet(data);
          setStudents(data.students);
          if (data.currentSession && !selectedSessionId) {
            setSelectedSessionId(data.currentSession.sessionId);
          }
        }
      } catch (err: any) {
        console.error("Lỗi khi tải bảng điểm danh cho Trợ giảng:", err);
        if (isMounted) {
          setToast({
            message: err?.message || "Không thể tải dữ liệu điểm danh từ máy chủ.",
            type: "danger",
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchSheet();

    return () => {
      isMounted = false;
    };
  }, [numClassId, selectedSessionId]);

  // Thống kê động dựa trên trạng thái học sinh hiện tại trên UI
  const computedStats: TeachingAttendanceStatsDto = useMemo(() => {
    const total = students.length;
    const present = students.filter((s) => s.status?.toLowerCase() === "present").length;
    const absent = students.filter((s) => s.status?.toLowerCase() === "absent").length;
    const late = students.filter((s) => s.status?.toLowerCase() === "late").length;
    const excused = students.filter(
      (s) => s.status?.toLowerCase() === "excused" || s.status?.toLowerCase() === "excuse"
    ).length;
    const rate = total > 0 ? Math.round(((present + late) / total) * 1000) / 10 : 0;

    return {
      totalStudents: total,
      presentCount: present,
      absentCount: absent,
      lateCount: late,
      excusedCount: excused,
      attendanceRate: rate,
    };
  }, [students]);

  // Lọc học sinh theo từ khóa tìm kiếm
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return students;
    const lower = searchTerm.toLowerCase().trim();
    return students.filter(
      (s) =>
        s.fullName.toLowerCase().includes(lower) ||
        s.studentCode.toLowerCase().includes(lower) ||
        (s.note && s.note.toLowerCase().includes(lower))
    );
  }, [students, searchTerm]);

  // Đổi buổi học cần điểm danh
  const handleSessionChange = (newSessionId: number) => {
    setSelectedSessionId(newSessionId);
    setSearchParams({ sessionId: String(newSessionId) });
  };

  // Đổi trạng thái của 1 học sinh
  const handleStatusChange = (studentId: number, status: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, status } : s))
    );
  };

  // Đổi ghi chú của 1 học sinh
  const handleNoteChange = (studentId: number, note: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, note } : s))
    );
  };

  // Đánh dấu tất cả có mặt
  const handleMarkAllPresent = () => {
    setStudents((prev) => prev.map((s) => ({ ...s, status: "present" })));
  };

  // Lưu điểm danh vào cơ sở dữ liệu
  const handleSaveAttendance = async () => {
    const currentSessionId = selectedSessionId || sheet?.currentSession?.sessionId;
    if (!currentSessionId) {
      setToast({ message: "Không tìm thấy thông tin buổi học cần điểm danh.", type: "danger" });
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        classId: numClassId,
        sessionId: currentSessionId,
        recordedBy: DEFAULT_TA_ID,
        items: students.map((s) => ({
          studentId: s.studentId,
          status: s.status,
          note: s.note || "",
        })),
      };

      const updatedSheet = await teachingDAL.saveBulkAttendance(payload);
      setSheet(updatedSheet);
      setStudents(updatedSheet.students);
      setToast({
        message: "Trợ giảng lưu điểm danh buổi học thành công vào hệ thống!",
        type: "success",
      });
      setTimeout(() => setToast(null), 4000);
    } catch (err: any) {
      console.error("Lỗi khi lưu điểm danh:", err);
      setToast({
        message: err?.message || "Không thể lưu điểm danh. Vui lòng kiểm tra lại kết nối.",
        type: "danger",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const className = sheet?.className || `Lớp học #${targetClassId}`;

  return (
    <>
      {/* Breadcrumb & Page Title */}
      <PageHeader
        title={`Điểm danh Trợ giảng: ${className}`}
        breadcrumbItems={[
          { label: "Dashboard", path: "/teaching-assistant/dashboard" },
          { label: "My Classes", path: "/teaching-assistant/classes" },
          { label: className, path: `/teaching-assistant/classes/${targetClassId}` },
          { label: "Điểm danh buổi học" },
        ]}
        action={
          <div className="d-flex align-items-center gap-2">
            <Link
              to={`/teaching-assistant/classes/${targetClassId}`}
              className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1 shadow-sm"
            >
              <i className="bi bi-arrow-left" /> Chi tiết lớp học
            </Link>
          </div>
        }
      />

      {/* Alert Toast */}
      {toast && (
        <div
          className={`alert ${
            toast.type === "success" ? "alert-success border-success" : "alert-danger border-danger"
          } alert-dismissible fade show d-flex align-items-center gap-2 shadow-sm mb-4`}
          role="alert"
        >
          <i
            className={`bi ${
              toast.type === "success"
                ? "bi-check-circle-fill text-success"
                : "bi-exclamation-triangle-fill text-danger"
            } fs-5 flex-shrink-0`}
          />
          <div className="flex-grow-1 fw-medium">{toast.message}</div>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => setToast(null)}
          />
        </div>
      )}

      {/* Main Attendance Card */}
      <div className="card class-list-card border-0 mb-4 shadow-sm">
        {/* Header with Class & Session info */}
        <AttendanceListHeader
          className={className}
          session={sheet?.currentSession}
          totalStudents={students.length}
        />

        {/* Toolbar with Session Picker, Search, Mark All Present & Stats */}
        <AttendanceListToolbar
          sessions={sheet?.availableSessions || []}
          selectedSessionId={selectedSessionId || sheet?.currentSession?.sessionId}
          onSessionChange={handleSessionChange}
          onMarkAllPresent={handleMarkAllPresent}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          stats={computedStats}
        />

        {loading ? (
          <div className="p-5 text-center">
            <div className="spinner-border text-primary mx-auto mb-2" role="status" />
            <p className="text-muted mb-0">Đang tải danh sách học sinh và dữ liệu điểm danh...</p>
          </div>
        ) : (
          <>
            {/* Interactive Attendance Table */}
            <AttendanceTable
              students={filteredStudents}
              onStatusChange={handleStatusChange}
              onNoteChange={handleNoteChange}
            />

            {/* Bottom Actions Bar */}
            <AttendanceSaveBar
              isSaving={isSaving}
              onSave={handleSaveAttendance}
              backUrl={`/teaching-assistant/classes/${targetClassId}`}
            />
          </>
        )}
      </div>
    </>
  );
}
