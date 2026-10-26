import { useState, useEffect } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import StatusBadge from "../../../components/Common/StatusBadge";
import SubjectBadge from "../../../components/Common/SubjectBadge";
import classDAL from "../../../../DAL/classDAL";
import scheduleDAL from "../../../../DAL/scheduleDAL";
import userDAL from "../../../../DAL/userDAL";
import type { ClassDto } from "../../../../BLL/models/ClassDto";
import type { ClassScheduleDto } from "../../../../BLL/models/ClassScheduleDto";
import type { UserDto } from "../../../../BLL/models/UserDto";

interface MonitoringRow {
  teacherId: number;
  teacherName: string;
  className: string;
  subjectName: string;
  scheduled: number;
  completed: number;
  attendanceRate: string;
  status: "Good" | "Needs Attention" | "Critical";
  room: string;
}

export default function AdminStaffTeachingMonitoring() {
  const [activeTab, setActiveTab] = useState<"teacher" | "class" | "progress">("teacher");
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [schedules, setSchedules] = useState<ClassScheduleDto[]>([]);
  const [teachers, setTeachers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Detail Modal state
  const [selectedRow, setSelectedRow] = useState<MonitoringRow | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [clsRes, schRes, usersRes] = await Promise.all([
          classDAL.getAllClasses(),
          scheduleDAL.getAllClassSchedules(),
          userDAL.getAllUsers(),
        ]);
        if (isMounted) {
          if (clsRes.data) setClasses(clsRes.data);
          if (schRes.data) setSchedules(schRes.data);
          if (usersRes.data) {
            const teacherList = usersRes.data.filter((u) => u.roles?.includes("teacher") || u.userCode.startsWith("TC"));
            setTeachers(teacherList);
          }
        }
      } catch (err) {
        console.warn("Lỗi nạp dữ liệu giám sát giảng dạy:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const monitoringRows: MonitoringRow[] = [
    {
      teacherId: 3,
      teacherName: "ThS. Hoàng Quốc Việt",
      className: classes[0]?.className || "Toán 12 Chuyên Sâu",
      subjectName: "Toán học",
      scheduled: 16,
      completed: 14,
      attendanceRate: "96.5%",
      status: "Good",
      room: "Phòng P.301",
    },
    {
      teacherId: 4,
      teacherName: "ThS. Huỳnh Khánh Duy",
      className: classes[1]?.className || "Vật Lý 12 Nâng Cao",
      subjectName: "Vật lý",
      scheduled: 16,
      completed: 15,
      attendanceRate: "94.0%",
      status: "Good",
      room: "Phòng P.202",
    },
    {
      teacherId: 105,
      teacherName: "ThS. Lê Thu Trang",
      className: "Tiếng Anh Chuyên Cấp Tốc",
      subjectName: "Tiếng Anh",
      scheduled: 12,
      completed: 10,
      attendanceRate: "88.2%",
      status: "Needs Attention",
      room: "Phòng P.104",
    },
    {
      teacherId: 106,
      teacherName: "ThS. Phạm Minh Đức",
      className: "Hóa Học 11 Cơ Bản",
      subjectName: "Hóa học",
      scheduled: 12,
      completed: 11,
      attendanceRate: "92.0%",
      status: "Good",
      room: "Phòng P.102",
    },
  ];

  return (
    <>
      {/* Breadcrumb and Quick Access */}
      <PageHeader
        title="Giám Sát Giảng Dạy &amp; Lớp Học (Teaching Monitoring)"
        breadcrumbItems={[
          { label: "Admin Staff", path: "/admin-staff" },
          { label: "Teaching Monitoring" },
        ]}
      />

      {loading && (
        <div className="alert alert-info py-2 px-3 mb-3 d-flex align-items-center gap-2">
          <div className="spinner-border spinner-border-sm" role="status" />
          <span>Đang đối soát lịch dạy của giáo viên và phòng học...</span>
        </div>
      )}

      {/* Monitoring Tabs */}
      <div className="card monitoring-card border-0 mb-4">
        <div className="monitoring-tabs">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "teacher" ? "active" : ""}`}
                type="button"
                onClick={() => setActiveTab("teacher")}
              >
                <i className="bi bi-person-workspace me-1.5" />
                Theo Giáo Viên (By Teacher)
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "class" ? "active" : ""}`}
                type="button"
                onClick={() => setActiveTab("class")}
              >
                <i className="bi bi-collection me-1.5" />
                Theo Lớp &amp; Ca Trực (By Class &amp; Schedule)
              </button>
            </li>
          </ul>
        </div>

        <div className="card-body p-0">
          {activeTab === "teacher" && (
            <div className="table-responsive">
              <table className="table user-table align-middle mb-0">
                <thead>
                  <tr>
                    <th className="fw-bold">STT</th>
                    <th className="fw-bold">Giáo Viên Giảng Dạy</th>
                    <th className="fw-bold">Lớp Phụ Trách</th>
                    <th className="fw-bold">Số Ca Đã Xếp</th>
                    <th className="fw-bold">Đã Hoàn Thành</th>
                    <th className="fw-bold">Tỷ Lệ Điểm Danh</th>
                    <th className="fw-bold">Đánh Giá Giám Sát</th>
                    <th className="text-center fw-bold">Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {monitoringRows.map((row, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>
                        <strong className="text-dark d-block">{row.teacherName}</strong>
                        <small className="text-muted">Chuyên môn: {row.subjectName}</small>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1.5">
                          <SubjectBadge subject={row.subjectName} />
                          <span className="small text-dark">{row.className}</span>
                        </div>
                      </td>
                      <td>{row.scheduled} buổi</td>
                      <td>
                        <span className="fw-semibold text-primary">{row.completed} buổi</span>
                      </td>
                      <td>
                        <span className="fw-bold text-dark">{row.attendanceRate}</span>
                      </td>
                      <td>
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                          onClick={() => setSelectedRow(row)}
                        >
                          <i className="bi bi-eye" /> Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "class" && (
            <div className="table-responsive">
              <table className="table user-table align-middle mb-0">
                <thead>
                  <tr>
                    <th className="fw-bold">Mã Lịch</th>
                    <th className="fw-bold">Tên Lớp Học</th>
                    <th className="fw-bold">Thứ Trong Tuần</th>
                    <th className="fw-bold">Khung Giờ</th>
                    <th className="fw-bold">Phòng Học</th>
                    <th className="fw-bold">Trạng Thái Buổi Học</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.length > 0 ? (
                    schedules.map((s, idx) => (
                      <tr key={s.scheduleId || idx}>
                        <td>
                          <span className="badge bg-secondary bg-opacity-10 text-dark">
                            #{s.scheduleId || idx + 1}
                          </span>
                        </td>
                        <td>
                          <strong className="text-dark">{s.className || `Lớp học #${s.classId}`}</strong>
                        </td>
                        <td>{s.dayOfWeek ? `Mỗi ${s.dayOfWeek}` : "Thứ 2, Thứ 4"}</td>
                        <td>
                          <span className="badge bg-primary bg-opacity-10 text-primary">
                            {s.startTime ? s.startTime.substring(0, 5) : "08:00"} - {s.endTime ? s.endTime.substring(0, 5) : "09:30"}
                          </span>
                        </td>
                        <td>{s.room || "Phòng P.301"}</td>
                        <td>
                          <span className="badge bg-success bg-opacity-10 text-success">Đang hoạt động tốt</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-muted">
                        Chưa có lịch giảng dạy nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* DETAIL MODAL (GetById) */}
      {selectedRow && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0">
              <div className="modal-header bg-light">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <i className="bi bi-activity text-primary" />
                  Báo Cáo Hoạt Động Giảng Dạy: {selectedRow.teacherName}
                </h5>
                <button type="button" className="btn-close" onClick={() => setSelectedRow(null)} />
              </div>
              <div className="modal-body p-4">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="text-muted small d-block">Giáo viên</label>
                    <span className="fw-bold text-dark fs-6">{selectedRow.teacherName}</span>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small d-block">Lớp phụ trách</label>
                    <span className="fw-semibold text-dark">{selectedRow.className}</span>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small d-block">Môn học</label>
                    <span className="badge bg-info bg-opacity-10 text-info">{selectedRow.subjectName}</span>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small d-block">Phòng giảng dạy</label>
                    <span className="fw-semibold text-dark">{selectedRow.room}</span>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small d-block">Tỷ lệ chuyên cần học sinh</label>
                    <span className="fw-bold text-success">{selectedRow.attendanceRate}</span>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small d-block">Tiến độ ca học</label>
                    <span>{selectedRow.completed} / {selectedRow.scheduled} buổi hoàn thành</span>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small d-block">Đánh giá chung</label>
                    <StatusBadge status={selectedRow.status} />
                  </div>
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedRow(null)}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
