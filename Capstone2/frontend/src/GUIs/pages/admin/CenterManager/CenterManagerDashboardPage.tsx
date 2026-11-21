import '../../../../assets/css/management-dashboard-kpis.css';
import welcomeIllustration from '../../../../assets/illustrations/manager-welcome.svg';
import feedbackDAL from '../../../../DAL/feedbackDAL';
import { getManagerPendingRequests } from '../../../../BLL/services/centerManagerDashboardService';
import PendingApprovalRequestsCard, { type PendingRequestsState } from '../../../components/admin/CenterManager/PendingApprovalRequestsCard';
import { DashboardNotificationsCard } from '../../../components/shared/notifications/NotificationQuickViews';
import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../../components/Common/PageHeader";
import KpiCard from "../../../components/admin/ManagementDashboardKpi";
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
  const { centerName } = useCenterSettings();
  const { user, permission, loading: identityLoading } = useSelectedUser();
  const manager = permission?.includes("center_manager") ? user : undefined;
  const managerId = manager?.userId;
  const [users, setUsers] = useState<UserDto[]>([]);
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const { rows: tuitions, payments, now, balanceReady, monthlyCollected, error: financeError, monthlyError } = useTuitionData();
  const [otherError, setOtherError] = useState<string | null>(null);
  const [usersReady, setUsersReady] = useState(false);
  const [classesReady, setClassesReady] = useState(false);
  const [approvalState, setApprovalState] = useState<PendingRequestsState & { ownerId?: number; revision: number }>({ requests: [], loading: true, error: null, revision: -1 });
  const [approvalRefresh, setApprovalRefresh] = useState(0);
  const retryApprovals = useCallback(() => setApprovalRefresh(value => value + 1), []);
  useEffect(() => {
    if (!managerId) return;
    let active = true;
    feedbackDAL.getAllRequests().then(result => {
      if (!Array.isArray(result.data)) throw new Error('Approval Requests API returned invalid data.');
      const requests = getManagerPendingRequests(result.data, managerId);
      if (active) setApprovalState({ requests, loading: false, error: null, ownerId: managerId, revision: approvalRefresh });
    }).catch(cause => {
      if (active) setApprovalState({ requests: [], loading: false, error: cause instanceof Error ? cause.message : 'Please try again.', ownerId: managerId, revision: approvalRefresh });
    });
    return () => { active = false; };
  }, [managerId, approvalRefresh]);
  const pendingState: PendingRequestsState = !manager
    ? { requests: [], loading: identityLoading, error: identityLoading ? null : 'Select a Center Manager account to load approval requests.' }
    : approvalState.ownerId !== managerId || approvalState.revision !== approvalRefresh
      ? { requests: [], loading: true, error: null }
      : approvalState;

  // Quick Action Modal states
  const [showQuickStudentModal, setShowQuickStudentModal] =
    useState<boolean>(false);
  const [quickStudentName, setQuickStudentName] = useState<string>("");
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchDashboardData() {
      const [userRes, classRes] = await Promise.allSettled([
        userDAL.getAllUsers(),
        classDAL.getAllClasses(),
      ]);
      if (isMounted) {
        if (userRes.status === "fulfilled") { setUsers(userRes.value.data); setUsersReady(true); }
        if (classRes.status === "fulfilled") { setClasses(classRes.value.data); setClassesReady(true); }
        setOtherError([userRes, classRes].filter(result => result.status === "rejected")
          .map(result => String(result.reason instanceof Error ? result.reason.message : result.reason)).join(" ") || null);
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
    <div className="cm-dashboard">
      {/* Breadcrumb and Quick Access */}
      <PageHeader
        title="Center Manager Dashboard"
        breadcrumbItems={[
          { label: "Center Manager", path: "/center-manager" },
          { label: "Dashboard" },
        ]}
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

      {/* Welcome */}
      <div className="card dashboard-welcome mb-4 border-0 shadow-sm">
        <div className="card-body d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="cm-welcome-copy">
            <h4 className="mb-1 text-white fw-bold">
              Welcome back, {manager ? manager.fullName : "Center Manager"}
            </h4>
            <div className="cm-welcome-summary">
            <p className="text-white-50">
              {centerName || "Center"} - Daily summary activity report.
            </p>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap gap-2">
              <div className="mb-2">
                <button
                  type="button"
                  className="btn btn-light d-flex align-items-center shadow-sm"
                  onClick={() => setShowQuickStudentModal(true)}
                >
                  <i className="bi bi-plus-square me-2" />
                  Add Student
                </button>
              </div>
              <div className="mb-2">
                <Link
                  to="/center-manager/tuition"
                  className="btn btn-outline-light d-flex align-items-center shadow-sm"
                >
                  <i className="bi bi-cash-stack me-2" />
                  Tuition Details
                </Link>
              </div>
            </div>
          </div>
          <div className="welcome-date text-white rounded-pill">
            <i className="bi bi-calendar3 me-2" aria-hidden="true" />
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <div className="cm-welcome-aside">
          <img className="cm-welcome-illustration" src={welcomeIllustration} alt="" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Dashboard KPI Cards */}
      <div className="dashboard-kpis cm-dashboard-kpis mb-4">
        {/* Active Students */}
        <KpiCard
          kind="student"
          decorativeWatermark
          title="Active Students"
          value={usersReady ? metrics.studentCount : "—"}
        />

        {/* Active Classes */}
        <KpiCard
          kind="class"
          decorativeWatermark
          title="Active Classes"
          value={classesReady ? metrics.activeClassesCount : "—"}
        />

        {/* Active Staff */}
        <KpiCard
          kind="staff"
          decorativeWatermark
          title="Active Staff"
          value={usersReady ? metrics.staffCount : "—"}
        />

        {/* Monthly Tuition Collected */}
        <KpiCard
          kind="collected"
          decorativeWatermark
          title="Monthly Tuition Collected"
          currency="VND"
          value={monthlyCollected}
        />

        {/* Overdue Tuition */}
        <KpiCard
          kind="overdue"
          decorativeWatermark
          title="Overdue Tuition"
          currency="VND"

          value={tuitionMetrics?.overdueAmount ?? null}
        />
        <KpiCard kind="approval" decorativeWatermark title="Pending Approval Requests"
          value={pendingState.loading ? 'Loading…' : pendingState.error ? '—' : pendingState.requests.length} />
      </div>

      <div className="cm-dashboard-panels mb-4">
        <PendingApprovalRequestsCard {...pendingState} retry={retryApprovals} />
        <DashboardNotificationsCard viewAllInHeader />
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
    </div>
  );
}
