import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import teachingDAL, { type TeachingSessionItemDto } from "../../../../../DAL/teachingDAL";

export interface SessionsSectionProps {
  classId?: string | number;
  baseRolePath?: string;
}

export default function SessionsSection({ classId = "1", baseRolePath = "/teaching-assistant" }: SessionsSectionProps) {
  const [sessions, setSessions] = useState<TeachingSessionItemDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadSessions() {
      try {
        setLoading(true);
        const data = await teachingDAL.getClassSessions(Number(classId));
        if (isMounted && data) {
          setSessions(data);
        }
      } catch (err) {
        console.warn("Lỗi tải buổi học của lớp cho TA:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadSessions();
    return () => {
      isMounted = false;
    };
  }, [classId]);

  return (
    <details className="card class-list-card border-0 mb-4" open>
      <summary className="class-list-header d-flex align-items-center justify-content-between cursor-pointer py-3 px-4">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-calendar-week-fill text-primary fs-5" />
          <h4 className="class-list-title mb-0">
            Lịch các buổi học ({sessions.length > 0 ? sessions.length : 3})
          </h4>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted small">Thu gọn / Mở rộng</span>
          <i className="bi bi-chevron-down details-chevron text-muted" />
        </div>
      </summary>

      {loading ? (
        <div className="p-4 text-center">
          <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
          <span className="text-muted small">Đang tải danh sách các buổi học...</span>
        </div>
      ) : (
        <div className="table-responsive-container">
          <table className="table custom-table align-middle mb-0">
            <thead>
              <tr>
                <th>Buổi học</th>
                <th>Ngày học</th>
                <th>Thời gian</th>
                <th>Phòng học</th>
                <th>Trạng thái</th>
                <th className="text-end">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, idx) => {
                const isCompleted = s.status === "completed" || s.isRecorded;
                return (
                  <tr key={s.sessionId} className={isCompleted ? "session-row-ended" : ""}>
                    <td className="fw-semibold text-dark">
                      <i className="bi bi-book me-1 text-primary" />
                      Buổi {idx + 1}: Hỗ trợ giảng dạy &amp; Thực hành
                    </td>
                    <td>{s.sessionDate}</td>
                    <td>{s.timePeriod || "18:00 - 20:00"}</td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        <i className="bi bi-geo-alt me-1 text-secondary" />
                        {s.room || "Room 201"}
                      </span>
                    </td>
                    <td>
                      {isCompleted ? (
                        <span className="badge bg-success-subtle text-success fw-medium px-2.5 py-1">
                          <i className="bi bi-check-circle me-1" /> Đã điểm danh
                        </span>
                      ) : (
                        <span className="badge bg-warning-subtle text-warning-emphasis fw-medium px-2.5 py-1">
                          <i className="bi bi-clock me-1" /> Chưa điểm danh
                        </span>
                      )}
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex align-items-center gap-1">
                        <Link
                          to={`${baseRolePath}/classes/${classId}/attendance?sessionId=${s.sessionId}`}
                          className={`btn btn-sm ${
                            isCompleted ? "btn-outline-success" : "btn-primary"
                          } d-inline-flex align-items-center gap-1 shadow-sm`}
                        >
                          <i className="bi bi-clipboard-check" />
                          <span>{isCompleted ? "Xem điểm danh" : "Hỗ trợ điểm danh"}</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </details>
  );
}
