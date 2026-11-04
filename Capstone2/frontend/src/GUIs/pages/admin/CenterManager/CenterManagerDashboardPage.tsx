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
import type { TuitionDto, PaymentDto } from "../../../../BLL/models/TuitionDto";
import { useCenterSettings } from "../../../../contexts/CenterSettingsContext";
import type { NotificationDto } from "../../../../BLL/models/NotificationDto";
import managementDAL from "../../../../DAL/managementDAL";

export default function CenterManagerDashboardPage() {
  const { centerName, academicYear } = useCenterSettings();
  const [manager, setManager] = useState<UserDto | null>(null);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [tuitions, setTuitions] = useState<TuitionDto[]>([]);
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
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
        setLoadError(null);
        const [mgrRes, userRes, classRes, tuiRes, paymentRes, notifRes] = await Promise.all(
          [
            userDAL.getUserById(1), // Nguyễn Văn Quản Lý
            userDAL.getAllUsers(),
            classDAL.getAllClasses(),
            tuitionDAL.getAllTuitions(),
            tuitionDAL.getAllPayments(),
            notificationDAL.getAllNotifications(),
          ],
        );

        if (isMounted) {
          setManager(mgrRes);
          if (userRes.data) setUsers(userRes.data);
          if (classRes.data) setClasses(classRes.data);
          if (tuiRes.data) setTuitions(tuiRes.data);
          if (paymentRes.data) setPayments(paymentRes.data);
          if (notifRes.data) setNotifications(notifRes.data);
        }
      } catch (err) {
        console.warn("Lỗi tải dữ liệu dashboard center manager:", err);
        if (isMounted) setLoadError(err instanceof Error ? err.message : "Không thể tải dữ liệu từ Backend.");
      } finally {
        if (isMounted) setLoading(false);
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

    const paidByInvoice = new Map<number, number>();
    for (const payment of payments) {
      paidByInvoice.set(
        payment.invoiceId,
        (paidByInvoice.get(payment.invoiceId) ?? 0) + payment.amount,
      );
    }

    let totalBilled = 0;
    let totalOutstanding = 0;
    let totalOverdue = 0;
    for (const invoice of tuitions) {
      const due = invoice.amountDue ?? invoice.amount ?? 0;
      const paid = paidByInvoice.get(invoice.invoiceId) ?? 0;
      const remaining = Math.max(0, due - paid);
      totalBilled += due;
      totalOutstanding += remaining;
      const overdue = invoice.status?.toLowerCase() === "overdue" ||
        (invoice.dueDate && new Date(invoice.dueDate).getTime() < Date.now());
      if (overdue && remaining > 0) totalOverdue += remaining;
    }

    const totalCollected = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const formatAmount = (amount: number) =>
      amount >= 1_000_000
        ? (amount / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 2 }) + "M"
        : amount.toLocaleString("vi-VN");

    return {
      studentCount,
      staffCount,
      activeClassesCount,
      totalClasses: classes.length,
      totalStudents: users.filter((u) => u.roles?.some((r) => r.toLowerCase() === "student")).length,
      collectedStr: formatAmount(totalCollected),
      outstandingStr: formatAmount(totalOutstanding),
      overdueStr: formatAmount(totalOverdue),
      collectionRate: totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0,
    };
  }, [users, classes, tuitions, payments]);

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
          value={metrics.studentCount}
          footerValue={metrics.totalStudents}
          footerLabel="tổng hồ sơ học sinh"
        />

        {/* Active Classes */}
        <KpiCard
          type="class"
          title="Active Classes"
          value={metrics.activeClassesCount}
          footerValue={metrics.totalClasses}
          footerLabel="tổng số lớp"
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
          footerValue={`${metrics.collectionRate}%`}
          footerLabel="đã thu trên tổng học phí"
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
                Đã ghi nhận <strong>{payments.length}</strong> khoản thanh toán từ hệ thống.
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
