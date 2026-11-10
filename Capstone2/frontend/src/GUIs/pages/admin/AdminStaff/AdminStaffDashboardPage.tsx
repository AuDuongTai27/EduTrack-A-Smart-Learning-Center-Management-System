import { DashboardNotificationsCard } from '../../../components/shared/notifications/NotificationQuickViews';
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../../components/Common/PageHeader";
import StatusBadge from "../../../components/Common/StatusBadge";
import DotStatusBadge from "../../../components/Common/DotStatusBadge";
import KpiCard from "../../../components/Common/KpiCard";
import { adminStaffDashboardDAL, type AdminStaffDashboardData } from "../../../../DAL/adminStaffDashboardDAL";
import { CENTER_TIME_ZONE, centerDateKey, getRequestStatus, getSessionStatus, getStaffUserId, type DashboardSection } from "../../../../BLL/services/adminStaffDashboardService";
import {useSelectedUser} from '../../../hooks/useSelectedUser';
import { useCenterSettings } from "../../../../contexts/CenterSettingsContext";
import type { ApprovalRequestDto } from "../../../../BLL/models/ApprovalRequestDto";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("vi-VN", { timeZone: CENTER_TIME_ZONE });
}

export default function AdminStaffDashboardPage() {
  const { user, permission, loading: selectionLoading } = useSelectedUser();
  const { refresh: refreshCenterSettings } = useCenterSettings();
  const staffUserId = getStaffUserId(user, permission);
  const [data, setData] = useState<AdminStaffDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const today = centerDateKey(now);
  // Hide the previous account's data immediately when identity changes.
  const dashboard = !selectionLoading && data?.userId === staffUserId && data?.today === today ? data : null;
  const currentUser = dashboard?.staff.data;
  const schedules = dashboard?.schedule.data ?? [];
  const requests = dashboard?.requests.data ?? [];
  const recentRequests = requests.slice(0, 4);
  const pendingRequests = requests.filter((request) => request.status.trim().toLowerCase() === "pending");
  const sectionText = (section: DashboardSection<unknown> | undefined, empty: string) =>
    section?.error || (section?.data == null ? "Đang tải dữ liệu..." : empty);

  // Detail Modal state
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequestDto | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (selectionLoading) return;
    async function loadDashboardData() {
      setLoading(true);
      setData(null);
      setSelectedRequest(null);
      try {
        const next = await adminStaffDashboardDAL.getDashboard(staffUserId, today, partial => {
          if (isMounted) setData(partial);
        });
        if (isMounted) setData(next);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, [staffUserId, selectionLoading, today, refreshKey]);

  const totalOutstanding = dashboard?.tuition.data?.outstanding;
  const todayStr = now.toLocaleDateString("vi-VN", {
    timeZone: CENTER_TIME_ZONE,
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
        action={
          <button type="button" className="btn btn-outline-primary" disabled={loading || selectionLoading}
            onClick={() => {
              void refreshCenterSettings();
              setNow(new Date());
              setRefreshKey((value) => value + 1);
            }}>
            <i className="bi bi-arrow-clockwise me-1" /> Tải lại dữ liệu
          </button>
        }
      />

      {(loading || selectionLoading) && (
        <div className="alert alert-info py-2 px-3 mb-3 d-flex align-items-center gap-2" role="status">
          <div className="spinner-border spinner-border-sm" role="status" />
          <span>Đang nạp dữ liệu thống kê trung tâm...</span>
        </div>
      )}
      {dashboard && [dashboard.students, dashboard.tuition, dashboard.schedule, dashboard.staff,
        dashboard.requests].some((section) => section.error) && (
        <div className="alert alert-warning py-2 px-3 mb-3" role="alert">
          Một số dữ liệu chưa tải được. Vui lòng xem thông báo tại từng mục và thử tải lại.
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
              title="Tổng Học Viên Hoạt Động"
              value={dashboard?.students.data ?? "—"}
              footerValue={sectionText(dashboard?.students, "Hồ sơ học viên có trạng thái Active")}
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
              value={dashboard?.tuition.data?.unpaidCount ?? "—"}
              footerValue={sectionText(dashboard?.tuition, "Hóa đơn còn nợ • Tất cả kỳ")}
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
              currency="VND"
              value={totalOutstanding ?? null}
              footerValue={sectionText(dashboard?.tuition, "Tổng công nợ hiện tại • Tất cả kỳ hóa đơn")}
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
              value={dashboard?.requests.data == null ? "—" : requests.length}
              footerValue={sectionText(dashboard?.requests, `${pendingRequests.length} đơn chưa có quyết định`)}
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
                {currentUser?.fullName ? `${currentUser.fullName} (Nhân viên Giáo vụ)` : "Nhân viên Giáo vụ"}
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
                <small className="text-muted">Buổi học trong ngày; giáo viên theo phân công lớp</small>
              </div>
              <Link to="/admin-staff/teaching-monitoring" className="dashboard-view-link">
                Giám sát chi tiết
                <i className="bi bi-arrow-right ms-1" />
              </Link>
            </div>
            <div className="dashboard-card-body p-0">
              <div className="schedule-list">
                {schedules.length > 0 ? (
                  schedules.slice(0, 4).map((s) => (
                    <div key={s.sessionId} className="schedule-item">
                      <div className="schedule-time">
                        <strong>{s.startTime ? s.startTime.substring(0, 5) : "—"}</strong>
                        <span>{s.endTime ? s.endTime.substring(0, 5) : "—"}</span>
                      </div>
                      <div className="schedule-line" />
                      <div className="schedule-info">
                        <h6>{s.className || `Lớp học #${s.classId}`}</h6>
                        <div className="schedule-meta">
                          <span>
                            <i className="bi bi-person me-1" />
                            {s.teacherNames || "Chưa có giáo viên được phân công"}
                          </span>
                          <span>
                            <i className="bi bi-geo-alt me-1" />
                            {s.room || "Chưa có phòng"}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={getSessionStatus(s, now)} />
                    </div>
                  ))
                ) : (
                  <div className={`p-4 text-center ${dashboard?.schedule.error ? "text-danger" : "text-muted"}`}
                    role={dashboard?.schedule.error ? "alert" : "status"}>
                    {sectionText(dashboard?.schedule, "Không có buổi học nào được xếp hôm nay.")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-5"><DashboardNotificationsCard /></div>
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
                  const reqCode = req.requestCode || `#${req.requestId}`;
                  const reqDate = formatDate(req.createdAt);
                  return (
                    <tr key={req.requestId || idx}>
                      <td>{idx + 1}</td>
                      <td>
                        <strong>{reqCode}</strong>
                      </td>
                      <td>{req.title || req.requestType}</td>
                      <td>{req.studentName || req.className || "—"}</td>
                      <td>{reqDate}</td>
                      <td>
                        <StatusBadge status={req.priority || "—"} />
                      </td>
                      <td>
                        <DotStatusBadge status={getRequestStatus(req)} />
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
                  <td colSpan={8} className={`text-center py-3 ${dashboard?.requests.error ? "text-danger" : "text-muted"}`}
                    role={dashboard?.requests.error ? "alert" : "status"}>
                    {sectionText(dashboard?.requests, "Bạn chưa gửi đơn từ nào.")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details of an API record already loaded for the current account. */}
      {dashboard && selectedRequest && (
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
                    <DotStatusBadge status={getRequestStatus(selectedRequest)} />
                  </div>
                  <div>
                    <label className="text-muted small d-block">Ngày gửi</label>
                    <span className="small">{formatDate(selectedRequest.createdAt)}</span>
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
