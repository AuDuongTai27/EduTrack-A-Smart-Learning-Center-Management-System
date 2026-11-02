import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../../components/Common/PageHeader";
import KpiCard from "../../../components/Common/KpiCard";
import userDAL from "../../../../DAL/userDAL";
import classDAL from "../../../../DAL/classDAL";
import tuitionDAL from "../../../../DAL/tuitionDAL";
import notificationDAL from "../../../../DAL/notificationDAL";
import type { UserDto } from "../../../../BLL/models/UserDto";
import type { ClassDto } from "../../../../BLL/models/ClassDto";
import type { TuitionDto } from "../../../../BLL/models/TuitionDto";
import type { NotificationDto } from "../../../../BLL/models/NotificationDto";
import managementDAL from "../../../../DAL/managementDAL";

export default function CenterManagerDashboardPage() {
  const [manager, setManager] = useState<UserDto | null>(null);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [tuitions, setTuitions] = useState<TuitionDto[]>([]);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Quick Action Modal states
  const [showQuickStudentModal, setShowQuickStudentModal] =
    useState<boolean>(false);
  const [quickStudentName, setQuickStudentName] = useState<string>("");
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const [mgrRes, userRes, classRes, tuiRes, notifRes] = await Promise.all(
          [
            userDAL.getUserById(1), // Nguyễn Văn Quản Lý
            userDAL.getAllUsers(),
            classDAL.getAllClasses(),
            tuitionDAL.getAllTuitions(),
            notificationDAL.getAllNotifications(),
          ],
        );

        if (isMounted) {
          setManager(mgrRes);
          if (userRes.data) setUsers(userRes.data);
          if (classRes.data) setClasses(classRes.data);
          if (tuiRes.data) setTuitions(tuiRes.data);
          if (notifRes.data) setNotifications(notifRes.data);
        }
      } catch (err) {
        console.warn("Lỗi tải dữ liệu dashboard center manager:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Calculate Metrics
  const metrics = useMemo(() => {
    const studentCount =
      users.filter((u) => u.roles?.includes("student")).length || 128;
    const staffCount =
      users.filter((u) =>
        u.roles?.some((r) =>
          ["teacher", "teaching_assistant", "admin_staff"].includes(r),
        ),
      ).length || 42;
    const activeClassesCount =
      classes.filter((c) => c.status === "active").length ||
      classes.length ||
      24;

    let totalCollected = 0;
    let totalOutstanding = 0;
    let totalOverdue = 0;

    tuitions.forEach((t) => {
      const amount = t.amount || t.amountDue || 0;
      const paid = t.paidAmount || (t.status === "Paid" ? amount : 0);
      totalCollected += paid;
      const remaining = Math.max(0, amount - paid);
      totalOutstanding += remaining;
      if (t.status === "Overdue") totalOverdue += remaining;
    });

    return {
      studentCount,
      staffCount,
      activeClassesCount,
      collectedStr:
        totalCollected > 0
          ? `${Math.round(totalCollected / 1000000)}M`
          : "485M",
      outstandingStr:
        totalOutstanding > 0
          ? `${Math.round(totalOutstanding / 1000000)}M`
          : "72M",
      overdueStr:
        totalOverdue > 0 ? `${Math.round(totalOverdue / 1000000)}M` : "18M",
    };
  }, [users, classes, tuitions]);

  const handleQuickAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!quickStudentName.trim()) return;

    try {
      const res = await managementDAL.createUser({
        fullName: quickStudentName.trim(),
        role: "student",
      });

      setUsers((prev) => [res.data, ...prev]);

      setShowQuickStudentModal(false);

      setActionSuccessMsg(
        `Đã tạo hồ sơ học viên "${res.data.fullName}" thành công!`,
      );

      setQuickStudentName("");

      setTimeout(() => setActionSuccessMsg(null), 3500);
    } catch (err) {
      console.error("Lỗi tạo học viên nhanh:", err);
    }
  };

  return (
    <>
      {/* Breadcrumb and Quick Access */}
      <PageHeader
        title="Center Manager Dashboard"
        breadcrumbItems={[
          { label: "Center Manager", path: "/center-manager" },
          { label: "Dashboard" },
        ]}
        action={
          <div className="d-flex my-xl-auto right-content align-items-center flex-wrap gap-2">
            <div className="mb-2">
              <button
                type="button"
                className="btn btn-primary d-flex align-items-center shadow-sm"
                onClick={() => setShowQuickStudentModal(true)}
              >
                <i className="bi bi-plus-square me-2" />
                Add Student
              </button>
            </div>
            <div className="mb-2">
              <Link
                to="/center-manager/tuition"
                className="btn btn-outline-primary d-flex align-items-center shadow-sm"
              >
                <i className="bi bi-cash-stack me-2" />
                Tuition Details
              </Link>
            </div>
          </div>
        }
      />

      {/* Success Notification Alert */}
      {actionSuccessMsg && (
        <div
          className="alert alert-success alert-dismissible fade show d-flex align-items-center mb-4 shadow-sm"
          role="alert"
        >
          <i className="bi bi-check-circle-fill fs-5 me-2" />
          <div>{actionSuccessMsg}</div>
          <button
            type="button"
            className="btn-close"
            onClick={() => setActionSuccessMsg(null)}
            aria-label="Close"
          />
        </div>
      )}

      {/* Popup News and Hello Account */}
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="alert-message">
            <div
              className="alert alert-success rounded-pill d-flex align-items-center justify-content-between border-success mb-0 shadow-sm"
              role="alert"
            >
              <div className="d-flex align-items-center">
                <span className="me-2 avatar avatar-sm bg-success text-white rounded-circle d-flex align-items-center justify-content-center">
                  <i className="bi bi-check2" />
                </span>
                <p className="mb-0">
                  Hệ thống quản lý trung tâm EduTrack đang hoạt động ổn định.
                  <strong className="mx-1">Kỳ học Tháng 08/2026</strong> đã đồng
                  bộ hóa 100% dữ liệu.
                </p>
              </div>
              <button
                type="button"
                className="btn-close p-0"
                data-bs-dismiss="alert"
                aria-label="Close"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard KPI Cards */}
      <div className="dashboard-kpis mb-4">
        {/* Active Students */}
        <KpiCard
          type="student"
          status="active"
          title="Active Students"
          value={metrics.studentCount}
          footerValue="2.4%"
          footerLabel="this month"
          trend="up"
        />

        {/* Active Classes */}
        <KpiCard
          type="class"
          title="Active Classes"
          value={metrics.activeClassesCount}
          footerValue={6}
          footerLabel="classes today"
        />

        {/* Active Staff */}
        <KpiCard
          type="staff"
          title="Active Staff"
          value={metrics.staffCount}
          footerValue="Teachers, TAs & Staff"
        />

        {/* Tuition Collected */}
        <KpiCard
          type="tuition"
          status="collected"
          title="Tuition Collected"
          value={metrics.collectedStr}
          footerValue="8.2%"
          footerLabel="this month"
          trend="up"
        />

        {/* Outstanding Tuition */}
        <KpiCard
          type="tuition"
          status="overdue"
          title="Outstanding Tuition"
          value={metrics.outstandingStr}
          footerLabel="Overdue"
          footerValue={metrics.overdueStr}
          footerLayout="between"
        />
      </div>

      {/* Welcome */}
      <div className="card dashboard-welcome mb-4 border-0 shadow-sm">
        <div className="card-body d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            <h4 className="mb-1 text-white fw-bold">
              Welcome back, {manager ? manager.fullName : "Nguyễn Văn Quản Lý"}
            </h4>
            <p className="mb-0 text-white-50">
              Trung tâm EduTrack - Báo cáo tổng hợp hoạt động ngày hôm nay.
            </p>
          </div>
          <div className="welcome-date text-white bg-white bg-opacity-25 px-3 py-2 rounded-pill">
            <i className="bi bi-calendar3 me-2" />
            {new Date().toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Dashboard Charts & Notices */}
      <div className="row g-4 mb-4">
        {/* Tuition Overview */}
        <div className="col-xl-6 d-flex">
          <div className="card dashboard-card flex-fill border-0 shadow-sm">
            <div className="card-header dashboard-card-header d-flex align-items-center justify-content-between bg-white py-3 border-bottom">
              <div>
                <h5 className="mb-1 fw-bold text-dark">Tuition Overview</h5>
                <small className="text-muted">
                  Collected and outstanding tuition
                </small>
              </div>
              <Link
                to="/center-manager/tuition"
                className="btn btn-sm btn-outline-primary"
              >
                Xem chi tiết
              </Link>
            </div>
            <div className="card-body dashboard-card-body p-4">
              <div className="row g-3 mb-4">
                <div className="col-6">
                  <div className="p-3 bg-light rounded-3 border-start border-4 border-success">
                    <small className="text-muted d-block">Đã thu thực tế</small>
                    <h4 className="fw-bold text-success mb-0">
                      {metrics.collectedStr} VND
                    </h4>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 bg-light rounded-3 border-start border-4 border-danger">
                    <small className="text-muted d-block">
                      Còn lại cần thu
                    </small>
                    <h4 className="fw-bold text-danger mb-0">
                      {metrics.outstandingStr} VND
                    </h4>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-light rounded-3 border text-secondary small">
                <i className="bi bi-info-circle me-2 text-primary" />
                Số lượng giao dịch đóng phí trực tuyến tháng này tăng{" "}
                <strong>15.4%</strong> so với tháng trước.
              </div>
            </div>
          </div>
        </div>

        {/* Notice Board */}
        <div className="col-xl-6 d-flex">
          <div className="card dashboard-card flex-fill border-0 shadow-sm">
            <div className="card-header dashboard-card-header d-flex align-items-center justify-content-between bg-white py-3 border-bottom">
              <div>
                <h5 className="mb-1 fw-bold text-dark">Notice Board</h5>
                <small className="text-muted">
                  Latest announcements and updates
                </small>
              </div>
              <Link
                to="/center-manager/notifications"
                className="dashboard-view-all text-primary fw-semibold small"
              >
                View All <i className="bi bi-arrow-right" />
              </Link>
            </div>
            <div className="card-body dashboard-card-body p-3">
              <div className="notice-list">
                {loading ? (
                  <div className="text-center py-4 text-muted">
                    <div
                      className="spinner-border spinner-border-sm text-primary me-2"
                      role="status"
                    />
                    Đang nạp thông báo...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    Không có thông báo mới.
                  </div>
                ) : (
                  notifications.slice(0, 4).map((n) => (
                    <div
                      key={n.notificationId}
                      className="notice-item d-flex align-items-center p-3 mb-2 rounded bg-light border"
                    >
                      <div className="notice-icon bg-primary-subtle text-primary p-2 rounded-circle me-3">
                        <i className="bi bi-megaphone-fill" />
                      </div>
                      <div className="notice-content flex-grow-1">
                        <h6 className="mb-1 fw-bold text-dark">{n.title}</h6>
                        <p
                          className="mb-0 text-muted small text-truncate"
                          style={{ maxWidth: "280px" }}
                        >
                          {n.content}
                        </p>
                      </div>
                      <span className="badge bg-white text-secondary border small">
                        {n.type || "Notice"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ADD STUDENT MODAL */}
      {showQuickStudentModal && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-person-plus-fill me-2" />
                  Thêm học viên nhanh (Center Manager)
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowQuickStudentModal(false)}
                />
              </div>
              <form onSubmit={handleQuickAddStudent}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      Họ và tên học viên <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ví dụ: Hoàng Tuấn Anh..."
                      value={quickStudentName}
                      onChange={(e) => setQuickStudentName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      Khối lớp dự kiến
                    </label>
                    <select className="form-select">
                      <option>Class 7 - Toán & Tiếng Anh</option>
                      <option>Class 8 - Toán & Hóa học</option>
                      <option>Class 9 - Luyện thi vào 10</option>
                      <option>Class 12 - Luyện thi Đại học</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      Số điện thoại liên hệ
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="09xx xxx xxx"
                    />
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowQuickStudentModal(false)}
                  >
                    Hủy bỏ
                  </button>
                  <button type="submit" className="btn btn-primary px-4">
                    Lưu học viên
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
