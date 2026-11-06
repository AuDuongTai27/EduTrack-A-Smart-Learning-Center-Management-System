import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../../components/Common/PageHeader";
import KpiCard from "../../../components/Common/KpiCard";
import { formatVND } from "../../../utils/formatCurrency";
import userDAL from "../../../../DAL/userDAL";
import classDAL from "../../../../DAL/classDAL";
import notificationDAL from "../../../../DAL/notificationDAL";
import type { UserDto } from "../../../../BLL/models/UserDto";
import type { ClassDto } from "../../../../BLL/models/ClassDto";
import { useCenterSettings } from "../../../../contexts/CenterSettingsContext";
import type { NotificationDto } from "../../../../BLL/models/NotificationDto";
import managementDAL from "../../../../DAL/managementDAL";
import { useTuitionData } from "../../../hooks/useTuitionData";
import { calculateTuitionMetrics } from "../../../../BLL/services/tuitionMetricsService";
import { useAuthContext } from "../../../../contexts/AuthContext";

export default function CenterManagerDashboardPage() {
  const { centerName, academicYear } = useCenterSettings();
  const { user, permission } = useAuthContext();
  const manager = permission?.includes("center_manager") ? user : undefined;
  const [users, setUsers] = useState<UserDto[]>([]);
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const { rows: tuitions, payments, now, paymentReady, balanceReady, monthlyCollected, collectionLabel, error: financeError, monthlyError } = useTuitionData();
  const [otherError, setOtherError] = useState<string | null>(null);
  const [usersReady, setUsersReady] = useState(false);
  const [classesReady, setClassesReady] = useState(false);
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
      setLoading(true);
      const [userRes, classRes, notifRes] = await Promise.allSettled([
        userDAL.getAllUsers(),
        classDAL.getAllClasses(),
        notificationDAL.getAllNotifications(),
      ]);
      if (isMounted) {
        if (userRes.status === "fulfilled") { setUsers(userRes.value.data); setUsersReady(true); }
        if (classRes.status === "fulfilled") { setClasses(classRes.value.data); setClassesReady(true); }
        if (notifRes.status === "fulfilled") setNotifications(notifRes.value.data);
        setOtherError([userRes, classRes, notifRes].filter(result => result.status === "rejected")
          .map(result => String(result.reason instanceof Error ? result.reason.message : result.reason)).join(" ") || null);
        setLoading(false);
      }
    }
    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  // All figures below are calculated from real API records, without fabricated defaults.
  const metrics = useMemo(() => {
    const studentCount = users.filter(
      (u) => u.roles?.some((r) => r.toLowerCase() === "student") && u.status?.toLowerCase() === "active",
    ).length;
    const staffCount = users.filter(
      (u) => u.roles?.some((r) =>
        ["teacher", "teaching_assistant", "admin_staff"].includes(r.toLowerCase()),
      ) && u.status?.toLowerCase() === "active",
    ).length;
    const activeClassesCount = classes.filter((c) => c.status?.toLowerCase() === "active").length;

    return {
      studentCount,
      staffCount,
      activeClassesCount,
      totalClasses: classes.length,
      totalStudents: users.filter((u) => u.roles?.some((r) => r.toLowerCase() === "student")).length,
    };
  }, [users, classes]);
  const tuitionMetrics = useMemo(() => balanceReady ? calculateTuitionMetrics(tuitions, payments.data!, now) : null, [tuitions, payments.data, balanceReady, now]);
  const loadError = [otherError, financeError, monthlyError].filter(Boolean).join(" ") || null;

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

      {loadError && <div className="alert alert-danger mb-3" role="alert">Không tải được dữ liệu Dashboard: {loadError}</div>}

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

      {/* Information sourced from saved center settings; no fake sync percentages. */}
      {!loading && !loadError && (
        <div className="alert alert-light border d-flex align-items-center gap-2 mb-4">
          <i className="bi bi-building text-primary" />
          <span><strong>{centerName || "Trung tâm"}</strong>{academicYear ? <> — Năm học: {academicYear}</> : null}</span>
        </div>
      )}

      {/* Dashboard KPI Cards */}
      <div className="dashboard-kpis mb-4">
        {/* Active Students */}
        <KpiCard
          type="student"
          status="active"
          title="Active Students"
          value={usersReady ? metrics.studentCount : "—"}
          footerValue={usersReady ? metrics.totalStudents : "—"}
          footerLabel="tổng hồ sơ học sinh"
        />

        {/* Active Classes */}
        <KpiCard
          type="class"
          title="Active Classes"
          value={classesReady ? metrics.activeClassesCount : "—"}
          footerValue={classesReady ? metrics.totalClasses : "—"}
          footerLabel="tổng số lớp"
        />

        {/* Active Staff */}
        <KpiCard
          type="staff"
          title="Active Staff"
          value={usersReady ? metrics.staffCount : "—"}
          footerValue="Teachers, TAs & Staff"
        />

        {/* Tuition Collected */}
        <KpiCard
          type="tuition"
          status="collected"
          title="Tuition Collected"
          currency="VND"
          value={monthlyCollected}
          hideIcon
          footerLabel={collectionLabel}
        />

        {/* Outstanding Tuition */}
        <KpiCard
          type="tuition"
          status="overdue"
          title="Outstanding Tuition"
          currency="VND"
          value={tuitionMetrics?.outstanding ?? null}
          footerLabel="Overdue"
          footerValue={formatVND(tuitionMetrics?.overdueAmount)}
          footerLayout="between"
        />
      </div>

      {/* Welcome */}
      <div className="card dashboard-welcome mb-4 border-0 shadow-sm">
        <div className="card-body d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            <h4 className="mb-1 text-white fw-bold">
              Welcome back, {manager ? manager.fullName : "Center Manager"}
            </h4>
            <p className="mb-0 text-white-50">
              {centerName || "Trung tâm"} - Báo cáo tổng hợp hoạt động ngày hôm nay.
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
                  Thực thu tháng hiện tại và tổng công nợ tất cả kỳ
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
                    <small className="text-muted d-block">Đã thu thực tế • {collectionLabel}</small>
                    <h4 className="fw-bold text-success mb-0 kpi-currency-value">
                      {formatVND(monthlyCollected)}
                    </h4>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 bg-light rounded-3 border-start border-4 border-danger">
                    <small className="text-muted d-block">
                      Tổng công nợ hiện tại • Tất cả kỳ
                    </small>
                    <h4 className="fw-bold text-danger mb-0 kpi-currency-value">
                      {formatVND(tuitionMetrics?.outstanding)}
                    </h4>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-light rounded-3 border text-secondary small">
                <i className="bi bi-info-circle me-2 text-primary" />
                Đã ghi nhận <strong>{paymentReady ? payments.data!.length : "—"}</strong> khoản thanh toán từ hệ thống (tất cả kỳ).
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
