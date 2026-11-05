import { useCallback, useEffect, useMemo, useState } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import SubjectBadge from "../../../components/Common/SubjectBadge";
import {
  teachingMonitoringApi,
  type TeachingMonitoringData,
  type MonitoringSessionDto,
  type TeacherClassAssignmentDto,
} from "../../../../api/teachingMonitoringApi";
import type { AttendanceDto } from "../../../../BLL/models/ProgressDto";

interface MonitoringRow {
  teacherClassId: number;
  teacherId: number;
  teacherName: string;
  className: string;
  subjectName: string;
  assignedStatus: string;
  scheduled: number;
  completed: number;
  attendanceRate: string;
  attendanceSample: number;
  room: string;
}

const EMPTY_DATA: TeachingMonitoringData = {
  classes: [],
  schedules: [],
  assignments: [],
  sessions: [],
  attendances: [],
};

const norm = (value: string | null | undefined) => (value ?? "").trim().toLowerCase();
const isCompleted = (session: MonitoringSessionDto) => norm(session.status) === "completed";
const isCancelled = (session: MonitoringSessionDto) => norm(session.status) === "cancelled";
const markedStatuses = new Set(["present", "late", "absent", "excused"]);

function attendanceForSessions(
  sessions: MonitoringSessionDto[],
  attendances: AttendanceDto[],
): { rate: string; count: number } {
  const completedSessionIds = new Set(sessions.filter(isCompleted).map((s) => s.sessionId));
  const recorded = attendances.filter(
    (attendance) => completedSessionIds.has(attendance.sessionId) && markedStatuses.has(norm(attendance.status)),
  );
  if (!recorded.length) return { rate: "—", count: 0 };
  const present = recorded.filter((a) => ["present", "late"].includes(norm(a.status))).length;
  return { rate: `${((present / recorded.length) * 100).toFixed(1)}%`, count: recorded.length };
}

function makeRows(data: TeachingMonitoringData): MonitoringRow[] {
  const classesById = new Map(data.classes.map((cls) => [cls.classId, cls]));
  const sessionsByClass = new Map<number, MonitoringSessionDto[]>();
  for (const session of data.sessions) {
    const list = sessionsByClass.get(session.classId) ?? [];
    list.push(session);
    sessionsByClass.set(session.classId, list);
  }

  return data.assignments
    .filter((item: TeacherClassAssignmentDto) => norm(item.status) === "active")
    .map((assignment) => {
      const cls = classesById.get(assignment.classId);
      const sessions = sessionsByClass.get(assignment.classId) ?? [];
      const validSessions = sessions.filter((s) => !isCancelled(s));
      const attendance = attendanceForSessions(sessions, data.attendances);
      const room = cls?.room || sessions.find((s) => s.room)?.room || "—";
      return {
        teacherClassId: assignment.teacherClassId,
        teacherId: assignment.teacherId,
        teacherName: assignment.teacherName || `Giáo viên #${assignment.teacherId}`,
        className: cls?.className || assignment.className || `Lớp #${assignment.classId}`,
        subjectName: cls?.subjectName || "Chưa có môn học",
        assignedStatus: assignment.status,
        scheduled: validSessions.length,
        completed: validSessions.filter(isCompleted).length,
        attendanceRate: attendance.rate,
        attendanceSample: attendance.count,
        room,
      };
    })
    .sort((a, b) => a.teacherName.localeCompare(b.teacherName, "vi"));
}

export default function AdminStaffTeachingMonitoring() {
  const [activeTab, setActiveTab] = useState<"teacher" | "class">("teacher");
  const [data, setData] = useState<TeachingMonitoringData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<MonitoringRow | null>(null);

  const refresh = useCallback(async (isMounted: () => boolean = () => true) => {
    setLoading(true);
    setError(null);
    try {
      const next = await teachingMonitoringApi.getDashboardData();
      if (isMounted()) setData(next);
    } catch (cause) {
      if (isMounted()) {
        setData(EMPTY_DATA);
        setError(cause instanceof Error ? cause.message : "Không thể tải dữ liệu giám sát.");
      }
    } finally {
      if (isMounted()) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    void refresh(() => mounted);
    return () => { mounted = false; };
  }, [refresh]);

  const rows = useMemo(() => makeRows(data), [data]);
  const sessionsBySchedule = useMemo(() => {
    const byId = new Map<number, MonitoringSessionDto[]>();
    for (const session of data.sessions) {
      if (session.scheduleId == null) continue;
      const records = byId.get(session.scheduleId) ?? [];
      records.push(session);
      byId.set(session.scheduleId, records);
    }
    return byId;
  }, [data.sessions]);

  return (
    <>
      <PageHeader
        title="Giám Sát Giảng Dạy & Lớp Học (Teaching Monitoring)"
        breadcrumbItems={[
          { label: "Admin Staff", path: "/admin-staff" },
          { label: "Teaching Monitoring" },
        ]}
        action={
          <button type="button" className="btn btn-outline-primary" disabled={loading} onClick={() => void refresh()}>
            <i className="bi bi-arrow-clockwise me-1" /> Tải lại dữ liệu
          </button>
        }
      />

      {loading && (
        <div className="alert alert-info d-flex align-items-center gap-2" role="status">
          <span className="spinner-border spinner-border-sm" /> Đang tải dữ liệu giảng dạy từ Backend...
        </div>
      )}
      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2" />
          {error} Không hiển thị dữ liệu mẫu khi API lỗi.
        </div>
      )}
      {!error && !loading && (
        <div className="alert alert-secondary small" role="note">
          Số buổi là số liệu theo <strong>lớp đã phân công</strong>, không xác nhận giáo viên nào trực tiếp đứng lớp.
          Tỷ lệ có mặt = (Present + Late) / tổng bản ghi Present, Late, Absent, Excused trong các buổi đã hoàn thành.
          Khi chưa có bản ghi, hiển thị — thay vì tự tạo tỷ lệ.
        </div>
      )}

      <div className="card monitoring-card border-0 mb-4">
        <div className="monitoring-tabs">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button className={`nav-link ${activeTab === "teacher" ? "active" : ""}`}
                type="button" onClick={() => setActiveTab("teacher")}>
                <i className="bi bi-person-workspace me-2" /> Theo Giáo Viên (By Teacher)
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${activeTab === "class" ? "active" : ""}`}
                type="button" onClick={() => setActiveTab("class")}>
                <i className="bi bi-collection me-2" /> Theo Lớp & Lịch Học (By Class)
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body p-0">
          {activeTab === "teacher" ? (
            <div className="table-responsive">
              <table className="table user-table align-middle mb-0">
                <thead><tr>
                  <th>STT</th><th>Giáo viên được phân công</th><th>Lớp phụ trách</th>
                  <th>Số buổi đã xếp</th><th>Đã hoàn thành</th><th>Tỷ lệ có mặt (đã ghi)</th>
                  <th>Trạng thái phân công</th><th className="text-center">Thao tác</th>
                </tr></thead>
                <tbody>
                  {!loading && !error && rows.map((row, idx) => (
                    <tr key={row.teacherClassId}>
                      <td>{idx + 1}</td>
                      <td><strong className="text-dark d-block">{row.teacherName}</strong>
                        <small className="text-muted">ID: #{row.teacherId}</small></td>
                      <td><div className="d-flex align-items-center gap-2">
                        {row.subjectName !== "Chưa có môn học" && <SubjectBadge subject={row.subjectName} />}
                        <span>{row.className}</span></div></td>
                      <td>{row.scheduled} buổi</td>
                      <td><span className="fw-semibold text-primary">{row.completed} buổi</span></td>
                      <td><strong>{row.attendanceRate}</strong>
                        {row.attendanceSample > 0 && <small className="text-muted d-block">{row.attendanceSample} lượt điểm danh</small>}</td>
                      <td><span className="badge bg-success bg-opacity-10 text-success">Đang phân công</span></td>
                      <td className="text-center">
                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setSelectedRow(row)}>
                          <i className="bi bi-eye me-1" /> Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loading && !error && rows.length === 0 &&
                    <tr><td colSpan={8} className="text-center text-muted py-4">Chưa có phân công giảng dạy đang hoạt động.</td></tr>}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table user-table align-middle mb-0">
                <thead><tr><th>Mã lịch</th><th>Lớp học</th><th>Thứ</th><th>Khung giờ</th><th>Phòng học</th><th>Buổi thực tế</th></tr></thead>
                <tbody>
                  {!loading && !error && data.schedules.map((schedule) => {
                    const sessions = (sessionsBySchedule.get(schedule.scheduleId) ?? []).filter((s) => !isCancelled(s));
                    const completeCount = sessions.filter(isCompleted).length;
                    return (
                      <tr key={schedule.scheduleId}>
                        <td>#{schedule.scheduleId}</td>
                        <td><strong>{schedule.className || `Lớp #${schedule.classId}`}</strong></td>
                        <td>{schedule.dayOfWeek || "—"}</td>
                        <td>{schedule.startTime ? schedule.startTime.slice(0, 5) : "—"} - {schedule.endTime ? schedule.endTime.slice(0, 5) : "—"}</td>
                        <td>{schedule.room || "—"}</td>
                        <td>{completeCount}/{sessions.length} buổi hoàn thành</td>
                      </tr>
                    );
                  })}
                  {!loading && !error && data.schedules.length === 0 &&
                    <tr><td colSpan={6} className="text-center text-muted py-4">Chưa có lịch giảng dạy được ghi nhận.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedRow && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0">
              <div className="modal-header bg-light">
                <h5 className="modal-title fw-bold text-dark">Chi tiết lớp phụ trách — {selectedRow.teacherName}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedRow(null)} aria-label="Đóng" />
              </div>
              <div className="modal-body p-4">
                <div className="row g-3">
                  <div className="col-md-6"><small className="text-muted d-block">Giáo viên</small><strong>{selectedRow.teacherName}</strong></div>
                  <div className="col-md-6"><small className="text-muted d-block">Lớp</small><strong>{selectedRow.className}</strong></div>
                  <div className="col-md-6"><small className="text-muted d-block">Môn</small>{selectedRow.subjectName}</div>
                  <div className="col-md-6"><small className="text-muted d-block">Phòng</small>{selectedRow.room}</div>
                  <div className="col-md-6"><small className="text-muted d-block">Buổi học hoàn thành</small>{selectedRow.completed}/{selectedRow.scheduled}</div>
                  <div className="col-md-6"><small className="text-muted d-block">Tỷ lệ có mặt (lớp)</small>{selectedRow.attendanceRate}</div>
                  <div className="col-12"><small className="text-muted">Chỉ thống kê các buổi và điểm danh đã được Backend ghi nhận. Không xác định giáo viên đứng lớp theo buổi.</small></div>
                </div>
              </div>
              <div className="modal-footer bg-light"><button type="button" className="btn btn-secondary" onClick={() => setSelectedRow(null)}>Đóng</button></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
