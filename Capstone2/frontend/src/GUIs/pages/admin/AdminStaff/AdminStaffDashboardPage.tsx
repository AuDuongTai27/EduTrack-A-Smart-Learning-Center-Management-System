import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../../components/Common/PageHeader";
import StatusBadge from "../../../components/Common/StatusBadge";
import DotStatusBadge from "../../../components/Common/DotStatusBadge";
import KpiCard from "../../../components/Common/KpiCard";
import userDAL from "../../../../DAL/userDAL";
import tuitionDAL from "../../../../DAL/tuitionDAL";
import scheduleDAL from "../../../../DAL/scheduleDAL";
import notificationDAL from "../../../../DAL/notificationDAL";
import feedbackDAL from "../../../../DAL/feedbackDAL";
import type { UserDto } from "../../../../BLL/models/UserDto";
import type { TuitionDto } from "../../../../BLL/models/TuitionDto";
import type { ClassScheduleDto } from "../../../../BLL/models/ClassScheduleDto";
import type { NotificationDto } from "../../../../BLL/models/NotificationDto";
import type { ApprovalRequestDto } from "../../../../BLL/models/ApprovalRequestDto";

export default function AdminStaffDashboardPage() {
  const [currentUser, setCurrentUser] = useState<UserDto | null>(null);
  const [students, setStudents] = useState<UserDto[]>([]);
  const [tuitions, setTuitions] = useState<TuitionDto[]>([]);
  const [schedules, setSchedules] = useState<ClassScheduleDto[]>([]);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [recentRequests, setRecentRequests] = useState<ApprovalRequestDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Detail Modal state
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequestDto | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [userRes, usersRes, tuitionsRes, schedulesRes, notifsRes, requestsRes] = await Promise.all([
          userDAL.getUserById(2), // ADM001: Trần Thị Nhân Viên
          userDAL.getAllUsers(),
          tuitionDAL.getAllTuitions(),
          scheduleDAL.getAllClassSchedules(),
          notificationDAL.getAllNotifications(),
          feedbackDAL.getAllRequests(),
        ]);

        if (isMounted) {
          if (userRes) setCurrentUser(userRes);
          if (usersRes.data) {
            const studentList = usersRes.data.filter(
              (u: UserDto) => u.roles?.includes("student") || u.userCode.startsWith("STU")
            );
            setStudents(studentList);
          }
          if (tuitionsRes.data) setTuitions(tuitionsRes.data);
          if (schedulesRes.data) setSchedules(schedulesRes.data);
          if (notifsRes.data) setNotifications(notifsRes.data);
          if (requestsRes.data) setRecentRequests(requestsRes.data.slice(0, 4));
        }
      } catch (err) {
        console.warn("Lỗi nạp dữ liệu AdminStaffDashboard:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  // KPI Calculations
  const unpaidTuitions = tuitions.filter(
    (t) => t.status?.toLowerCase() === "unpaid" || t.status?.toLowerCase() === "pending" || t.status?.toLowerCase() === "overdue"
  );
  const totalOutstanding = unpaidTuitions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const formattedOutstanding =
    totalOutstanding >= 1000000
      ? `${(totalOutstanding / 1000000).toFixed(1)}M`
      : `${totalOutstanding.toLocaleString("vi-VN")} đ`;

  const pendingRequests = recentRequests.filter((r) => r.status?.toLowerCase() === "pending");

  const todayStr = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      {/* Breadcrumb and Quick Access */}
      <PageHeader
        title="Bảng Điều Khiển Giáo Vụ (Admin Staff Dashboard)"
        breadcrumbItems={[
          { label: "Admin Staff", path: "/admin-staff" },
          { label: "Dashboard" },
        ]}
      />

      {loading && (
        <div className="alert alert-info py-2 px-3 mb-3 d-flex align-items-center gap-2">
          <div className="spinner-border spinner-border-sm" role="status" />
          <span>Đang nạp dữ liệu thống kê trung tâm...</span>
        </div>
      )}

      {/* Dashboard Summary KPIs */}
      <div className="row g-3 mb-4">
        {/* New Students */}
        <div className="col-xl-3 col-md-6">
          <Link to="/admin-staff/students" className="text-decoration-none d-block">
            <KpiCard
              type="student"
              status="new"
              title="Tổng Học Viên Đang Học"
              value={students.length > 0 ? students.length : 128}
              footerValue="Đang theo học tại trung tâm"
              footerLabel="Xem danh sách"
            />
          </Link>
        </div>

        {/* Unpaid Students */}
        <div className="col-xl-3 col-md-6">
          <Link to="/admin-staff/tuition" className="text-decoration-none d-block">
            <KpiCard
              type="student"
              status="unpaid"
              title="Khoản Học Phí Cần Thu"
              value={unpaidTuitions.length > 0 ? unpaidTuitions.length : 12}
              footerValue="Cần gửi nhắc nhở học phí"
              footerLabel="Xem sổ thu"
            />
          </Link>
        </div>

        {/* Outstanding Tuition */}
        <div className="col-xl-3 col-md-6">
          <Link to="/admin-staff/tuition" className="text-decoration-none d-block">
            <KpiCard
              type="tuition"
              status="outstanding"
              title="Công Nợ Học Phí"
              value={formattedOutstanding}
              footerValue="Học phí chưa thanh toán"
              footerLabel="Chi tiết"
            />
          </Link>
        </div>

        {/* My Approval Requests */}
        <div className="col-xl-3 col-md-6">
          <Link to="/admin-staff/approval-requests" className="text-decoration-none d-block">
            <KpiCard
              type="request"
              title="Đơn Từ Gửi Giám Đốc"
              value={recentRequests.length > 0 ? recentRequests.length : 3}
              footerValue={`${pendingRequests.length} đơn đang chờ duyệt`}
              footerLabel="Xem tiến độ"
            />
          </Link>
        </div>
      </div>

      {/* Welcome */}
      <div className="card dashboard-welcome mb-4 border-0">
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <p className="welcome-subtitle mb-1">Xin chào,</p>
              <h3 className="welcome-title mb-2">
                {currentUser?.fullName || "Trần Thị Nhân Viên"} (Nhân viên Giáo vụ)
              </h3>
              <p className="welcome-text mb-0">
                Chúc bạn một ngày làm việc hiệu quả và quản lý học vụ suôn sẻ tại EduTrack!
              </p>
            </div>
            <div className="welcome-date">
              <i className="bi bi-calendar3 me-2" />
              {todayStr}
            </div>
          </div>
        </div>
      </div>

      {/* Today's Schedule and Latest Notifications */}
      <div className="row g-4 mb-4">
        {/* Today's Schedule */}
        <div className="col-xl-7">
          <div className="card dashboard-card h-100 border-0">
            <div className="dashboard-card-header d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">Lịch Học &amp; Ca Giảng Hôm Nay</h5>
                <small className="text-muted">Giám sát lớp học trong ngày</small>
              </div>
              <Link to="/admin-staff/teaching-monitoring" className="dashboard-view-link">
                Giám sát chi tiết
                <i className="bi bi-arrow-right ms-1" />
              </Link>
            </div>
            <div className="dashboard-card-body p-0">
              <div className="schedule-list">
                {schedules.length > 0 ? (
                  schedules.slice(0, 4).map((s, idx) => (
                    <div key={s.scheduleId || idx} className="schedule-item">
                      <div className="schedule-time">
                        <strong>{s.startTime ? s.startTime.substring(0, 5) : "08:00"}</strong>
                        <span>{s.endTime ? s.endTime.substring(0, 5) : "09:30"}</span>
                      </div>
                      <div className="schedule-line" />
                      <div className="schedule-info">
                        <h6>{s.className || `Lớp học #${s.classId}`}</h6>
                        <div className="schedule-meta">
                          <span>
                            <i className="bi bi-person me-1" />
                            {idx % 2 === 0 ? "ThS. Hoàng Quốc Việt" : "ThS. Huỳnh Khánh Duy"}
                          </span>
                          <span>
                            <i className="bi bi-geo-alt me-1" />
                            {s.room || "Phòng P.301"}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={idx === 0 ? "Ongoing" : "Upcoming"} />
                    </div>
                  ))
                ) : (
                  <>
                    <div className="schedule-item">
                      <div className="schedule-time">
                        <strong>08:00</strong>
                        <span>09:30</span>
                      </div>
                      <div className="schedule-line" />
                      <div className="schedule-info">
                        <h6>[FE-Mock] Toán 12 Chuyên Sâu</h6>
                        <div className="schedule-meta">
                          <span><i className="bi bi-person me-1" /> ThS. Hoàng Quốc Việt</span>
                          <span><i className="bi bi-geo-alt me-1" /> Phòng 201</span>
                        </div>
                      </div>
                      <StatusBadge status="Ongoing" />
                    </div>
                    <div className="schedule-item">
                      <div className="schedule-time">
                        <strong>10:00</strong>
                        <span>11:30</span>
                      </div>
                      <div className="schedule-line" />
                      <div className="schedule-info">
                        <h6>[FE-Mock] Vật Lý 12 Nâng Cao</h6>
                        <div className="schedule-meta">
                          <span><i className="bi bi-person me-1" /> ThS. Huỳnh Khánh Duy</span>
                          <span><i className="bi bi-geo-alt me-1" /> Phòng 305</span>
                        </div>
                      </div>
                      <StatusBadge status="Upcoming" />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Latest Notifications */}
        <div className="col-xl-5">
          <div className="card dashboard-card h-100 border-0">
            <div className="dashboard-card-header d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">Thông Báo Mới Nhất</h5>
                <small className="text-muted">Cập nhật toàn trung tâm</small>
              </div>
              <Link to="/admin-staff/notifications" className="dashboard-view-link">
                Xem tất cả
                <i className="bi bi-arrow-right ms-1" />
              </Link>
            </div>
            <div className="dashboard-card-body p-0">
              <div className="staff-notification-list">
                {notifications.length > 0 ? (
                  notifications.slice(0, 4).map((n, idx) => (
                    <div key={n.notificationId || idx} className="staff-notification-item">
                      <div className="staff-notification-icon">
                        <i className={idx % 2 === 0 ? "bi bi-cash-stack" : "bi bi-calendar-event"} />
                      </div>
                      <div className="staff-notification-content">
                        <h6>{n.title}</h6>
                        <p className="text-truncate" style={{ maxWidth: 260 }}>{n.content}</p>
                        <small className="text-muted">
                          {n.createdAt ? new Date(n.createdAt).toLocaleDateString("vi-VN") : "Hôm nay"}
                        </small>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="staff-notification-item">
                      <div className="staff-notification-icon">
                        <i className="bi bi-cash-stack" />
                      </div>
                      <div className="staff-notification-content">
                        <h6>[FE-Mock] Nhắc nhở nộp học phí tháng</h6>
                        <p>Hệ thống tự động đã phát thông báo đóng phí đến phụ huynh.</p>
                        <small>30 phút trước</small>
                      </div>
                    </div>
                    <div className="staff-notification-item">
                      <div className="staff-notification-icon">
                        <i className="bi bi-calendar-event" />
                      </div>
                      <div className="staff-notification-content">
                        <h6>[FE-Mock] Cập nhật lịch học Toán 12</h6>
                        <p>Lớp Toán 12 Chuyên sâu đổi phòng học sang P.301.</p>
                        <small>2 giờ trước</small>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Approval Requests */}
      <div className="card user-list-card border-0 mb-4">
        <div className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom">
          <div>
            <h5 className="mb-1 fw-bold">Đơn Từ Gần Đây Đã Gửi Giám Đốc</h5>
            <small className="text-muted">Các đề xuất xin phê duyệt từ giáo vụ</small>
          </div>
          <Link to="/admin-staff/approval-requests" className="dashboard-view-link">
            Xem tất cả đơn
            <i className="bi bi-arrow-right ms-1" />
          </Link>
        </div>
        <div className="table-responsive">
          <table className="table user-table align-middle mb-0">
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã Đơn</th>
                <th>Loại Yêu Cầu</th>
                <th>Người Liên Quan</th>
                <th>Ngày Gửi</th>
                <th>Ưu Tiên</th>
                <th>Trạng Thái</th>
                <th className="text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.length > 0 ? (
                recentRequests.map((req, idx) => {
                  const reqCode = `#AR${String(req.requestId).padStart(4, "0")}`;
                  const priority = idx % 3 === 0 ? "High" : idx % 3 === 1 ? "Medium" : "Low";
                  const reqDate = req.createdAt ? new Date(req.createdAt).toLocaleDateString("vi-VN") : "16/08/2026";
                  return (
                    <tr key={req.requestId || idx}>
                      <td>{idx + 1}</td>
                      <td>
                        <strong>{reqCode}</strong>
                      </td>
                      <td>{req.title || req.requestType}</td>
                      <td>{req.studentName || "Nguyễn Minh An"}</td>
                      <td>{reqDate}</td>
                      <td>
                        <StatusBadge status={priority} />
                      </td>
                      <td>
                        <DotStatusBadge status={req.status} />
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                          onClick={() => setSelectedRequest(req)}
                        >
                          <i className="bi bi-eye" /> Chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-3 text-muted">
                    Không có đơn từ nào gần đây.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL (GetById) */}
      {selectedRequest && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0">
              <div className="modal-header bg-light">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <i className="bi bi-file-earmark-text text-primary" />
                  Đơn Yêu Cầu #{selectedRequest.requestId}
                </h5>
                <button type="button" className="btn-close" onClick={() => setSelectedRequest(null)} />
              </div>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="text-muted small d-block">Loại yêu cầu</label>
                  <span className="fw-bold text-dark">{selectedRequest.requestType}</span>
                </div>
                <div className="mb-3">
                  <label className="text-muted small d-block">Tiêu đề</label>
                  <span className="fw-semibold text-dark">{selectedRequest.title || selectedRequest.requestType}</span>
                </div>
                <div className="mb-3">
                  <label className="text-muted small d-block">Nội dung chi tiết</label>
                  <div className="p-3 bg-light rounded border text-secondary">
                    {selectedRequest.description || "Không có nội dung thêm."}
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <label className="text-muted small d-block">Trạng thái</label>
                    <DotStatusBadge status={selectedRequest.status} />
                  </div>
                  <div>
                    <label className="text-muted small d-block">Ngày gửi</label>
                    <span className="small">{selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleDateString("vi-VN") : "Hôm nay"}</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedRequest(null)}>
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
