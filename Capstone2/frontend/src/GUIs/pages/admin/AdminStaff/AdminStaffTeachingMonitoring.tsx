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
        teacherName: assignment.teacherName || `Teacher #${assignment.teacherId}`,
        className: cls?.className || assignment.className || `Class #${assignment.classId}`,
        subjectName: cls?.subjectName || "No subject",
        assignedStatus: assignment.status,
        scheduled: validSessions.length,
        completed: validSessions.filter(isCompleted).length,
        attendanceRate: attendance.rate,
        attendanceSample: attendance.count,
        room,
      };
    })
    .sort((a, b) => a.teacherName.localeCompare(b.teacherName, "en"));
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
        setError(cause instanceof Error ? cause.message : "Failed to load monitoring data.");
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
        title="Teaching &amp; Class Monitoring"
        breadcrumbItems={[
          { label: "Admin Staff", path: "/admin-staff" },
          { label: "Teaching Monitoring" },
        ]}
        action={
          <button type="button" className="btn btn-outline-primary" disabled={loading} onClick={() => void refresh()}>
            <i className="bi bi-arrow-clockwise me-1" /> Refresh
          </button>
        }
      />

      {loading && (
        <div className="alert alert-info d-flex align-items-center gap-2" role="status">
          <span className="spinner-border spinner-border-sm" /> Loading teaching data from Backend...
        </div>
      )}
      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2" />
          {error} Not displaying sample data when API errors.
        </div>
      )}

      <div className="card monitoring-card border-0 mb-4">
        <div className="monitoring-tabs">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button className={`nav-link ${activeTab === "teacher" ? "active" : ""}`}
                type="button" onClick={() => setActiveTab("teacher")}>
                <i className="bi bi-person-workspace me-2" /> By Teacher
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${activeTab === "class" ? "active" : ""}`}
                type="button" onClick={() => setActiveTab("class")}>
                <i className="bi bi-collection me-2" /> By Class &amp; Schedule
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body p-0">
          {activeTab === "teacher" ? (
            <div className="table-responsive">
              <table className="table user-table align-middle mb-0">
                <thead><tr>
                  <th>No.</th><th>Assigned Teacher</th><th>Assigned Class</th>
                  <th>Scheduled Sessions</th><th>Completed</th><th>Attendance Rate (Recorded)</th>
                  <th>Assignment Status</th><th className="text-center">Action</th>
                </tr></thead>
                <tbody>
                  {!loading && !error && rows.map((row, idx) => (
                    <tr key={row.teacherClassId}>
                      <td>{idx + 1}</td>
                      <td><strong className="text-dark d-block">{row.teacherName}</strong>
                        <small className="text-muted">ID: #{row.teacherId}</small></td>
                      <td><div className="d-flex align-items-center gap-2">
                        {row.subjectName !== "No subject" && <SubjectBadge subject={row.subjectName} />}
                        <span>{row.className}</span></div></td>
                      <td>{row.scheduled} sessions</td>
                      <td><span className="fw-semibold text-primary">{row.completed} sessions</span></td>
                      <td><strong>{row.attendanceRate}</strong>
                        {row.attendanceSample > 0 && <small className="text-muted d-block">{row.attendanceSample} attendance records</small>}</td>
                      <td><span className="badge bg-success bg-opacity-10 text-success">Assigned</span></td>
                      <td className="text-center">
                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setSelectedRow(row)}>
                          <i className="bi bi-eye me-1" /> Details
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loading && !error && rows.length === 0 &&
                    <tr><td colSpan={8} className="text-center text-muted py-4">No active teaching assignments found.</td></tr>}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table user-table align-middle mb-0">
                <thead><tr><th>Schedule Code</th><th>Class</th><th>Day of Week</th><th>Time Slot</th><th>Room</th><th>Actual Sessions</th></tr></thead>
                <tbody>
                  {!loading && !error && data.schedules.map((schedule) => {
                    const sessions = (sessionsBySchedule.get(schedule.scheduleId) ?? []).filter((s) => !isCancelled(s));
                    const completeCount = sessions.filter(isCompleted).length;
                    return (
                      <tr key={schedule.scheduleId}>
                        <td>#{schedule.scheduleId}</td>
                        <td><strong>{schedule.className || `Class #${schedule.classId}`}</strong></td>
                        <td>{schedule.dayOfWeek || "—"}</td>
                        <td>{schedule.startTime ? schedule.startTime.slice(0, 5) : "—"} - {schedule.endTime ? schedule.endTime.slice(0, 5) : "—"}</td>
                        <td>{schedule.room || "—"}</td>
                        <td>{completeCount}/{sessions.length} sessions completed</td>
                      </tr>
                    );
                  })}
                  {!loading && !error && data.schedules.length === 0 &&
                    <tr><td colSpan={6} className="text-center text-muted py-4">No teaching schedules recorded.</td></tr>}
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
                <h5 className="modal-title fw-bold text-dark">Assigned Class Details — {selectedRow.teacherName}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedRow(null)} aria-label="Close" />
              </div>
              <div className="modal-body p-4">
                <div className="row g-3">
                  <div className="col-md-6"><small className="text-muted d-block">Teacher</small><strong>{selectedRow.teacherName}</strong></div>
                  <div className="col-md-6"><small className="text-muted d-block">Class</small><strong>{selectedRow.className}</strong></div>
                  <div className="col-md-6"><small className="text-muted d-block">Subject</small>{selectedRow.subjectName}</div>
                  <div className="col-md-6"><small className="text-muted d-block">Room</small>{selectedRow.room}</div>
                  <div className="col-md-6"><small className="text-muted d-block">Completed Sessions</small>{selectedRow.completed}/{selectedRow.scheduled}</div>
                  <div className="col-md-6"><small className="text-muted d-block">Attendance Rate (Class)</small>{selectedRow.attendanceRate}</div>
                  <div className="col-12"><small className="text-muted">Only statistics for sessions and attendance recorded by the Backend are included. Teacher per session is not determined.</small></div>
                </div>
              </div>
              <div className="modal-footer bg-light"><button type="button" className="btn btn-secondary" onClick={() => setSelectedRow(null)}>Close</button></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
