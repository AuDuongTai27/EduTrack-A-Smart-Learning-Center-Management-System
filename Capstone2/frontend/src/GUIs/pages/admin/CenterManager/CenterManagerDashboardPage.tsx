import { DashboardNotificationsCard } from '../../../components/shared/notifications/NotificationQuickViews';
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../../components/Common/PageHeader";
import KpiCard from "../../../components/Common/KpiCard";
import { formatVND } from "../../../utils/formatCurrency";
import userDAL from "../../../../DAL/userDAL";
import classDAL from "../../../../DAL/classDAL";
import type { UserDto } from "../../../../BLL/models/UserDto";
import type { ClassDto } from "../../../../BLL/models/ClassDto";
import { useCenterSettings } from "../../../../contexts/CenterSettingsContext";
import managementDAL from "../../../../DAL/managementDAL";
import { useTuitionData } from "../../../hooks/useTuitionData";
import { calculateTuitionMetrics } from "../../../../BLL/services/tuitionMetricsService";
import {useSelectedUser} from '../../../hooks/useSelectedUser';

export default function CenterManagerDashboardPage() {
  const { centerName, academicYear } = useCenterSettings();
  const { user, permission } = useSelectedUser();
  const manager = permission?.includes("center_manager") ? user : undefined;
  const [users, setUsers] = useState<UserDto[]>([]);
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const { rows: tuitions, payments, now, paymentReady, balanceReady, monthlyCollected, collectionLabel, error: financeError, monthlyError } = useTuitionData();
  const [otherError, setOtherError] = useState<string | null>(null);
  const [usersReady, setUsersReady] = useState(false);
  const [classesReady, setClassesReady] = useState(false);
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
      const [userRes, classRes] = await Promise.allSettled([
        userDAL.getAllUsers(),
        classDAL.getAllClasses(),
      ]);
      if (isMounted) {
        if (userRes.status === "fulfilled") { setUsers(userRes.value.data); setUsersReady(true); }
        if (classRes.status === "fulfilled") { setClasses(classRes.value.data); setClassesReady(true); }
        setOtherError([userRes, classRes].filter(result => result.status === "rejected")
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
        `Created student profile "${res.data.fullName}" successfully!`,
      );

      setQuickStudentName("");

      setTimeout(() => setActionSuccessMsg(null), 3500);
    } catch (err) {
      console.error("Quick add student error:", err);
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

      {loadError && <div className="alert alert-danger mb-3" role="alert">Failed to load Dashboard data: {loadError}</div>}

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
          <span><strong>{centerName || "Center"}</strong>{academicYear ? <> — Academic Year: {academicYear}</> : null}</span>
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
          footerLabel="total student profiles"
        />

        {/* Active Classes */}
        <KpiCard
          type="class"
          title="Active Classes"
          value={classesReady ? metrics.activeClassesCount : "—"}
          footerValue={classesReady ? metrics.totalClasses : "—"}
          footerLabel="total classes"
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
              {centerName || "Center"} - Daily summary activity report.
            </p>
          </div>
          <div className="welcome-date text-white bg-white bg-opacity-25 px-3 py-2 rounded-pill">
            <i className="bi bi-calendar3 me-2" />
            {new Date().toLocaleDateString("en-US", {
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
                  Actual collection this month and total outstanding balance across all terms
                </small>
              </div>
              <Link
                to="/center-manager/tuition"
                className="btn btn-sm btn-outline-primary"
              >
                View details
              </Link>
            </div>
            <div className="card-body dashboard-card-body p-4">
              <div className="row g-3 mb-4">
                <div className="col-6">
                  <div className="p-3 bg-light rounded-3 border-start border-4 border-success">
                    <small className="text-muted d-block">Actual collected • {collectionLabel}</small>
                    <h4 className="fw-bold text-success mb-0 kpi-currency-value">
                      {formatVND(monthlyCollected)}
                    </h4>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 bg-light rounded-3 border-start border-4 border-danger">
                    <small className="text-muted d-block">
                      Total current outstanding debt • All terms
                    </small>
                    <h4 className="fw-bold text-danger mb-0 kpi-currency-value">
                      {formatVND(tuitionMetrics?.outstanding)}
                    </h4>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-light rounded-3 border text-secondary small">
                <i className="bi bi-info-circle me-2 text-primary" />
                Recorded <strong>{paymentReady ? payments.data!.length : "—"}</strong> payments from the system (all terms).
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-6"><DashboardNotificationsCard /></div>
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
                  Quick Add Student (Center Manager)
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
                      Student Full Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. John Doe..."
                      value={quickStudentName}
                      onChange={(e) => setQuickStudentName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      Expected Class Grade
                    </label>
                    <select className="form-select">
                      <option>Grade 7 - Math &amp; English</option>
                      <option>Grade 8 - Math &amp; Chemistry</option>
                      <option>Grade 9 - High School Exam Prep</option>
                      <option>Grade 12 - University Exam Prep</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      Contact Phone Number
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
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary px-4">
                    Save Student
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
