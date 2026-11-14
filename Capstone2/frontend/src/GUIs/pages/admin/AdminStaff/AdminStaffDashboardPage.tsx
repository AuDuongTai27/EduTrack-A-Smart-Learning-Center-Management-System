import { DashboardNotificationsCard } from '../../../components/shared/notifications/NotificationQuickViews';
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../../components/Common/PageHeader";
import StatusBadge from "../../../components/Common/StatusBadge";
import DotStatusBadge from "../../../components/Common/DotStatusBadge";
import KpiCard from "../../../components/Common/KpiCard";
import { adminStaffDashboardDAL, type AdminStaffDashboardData } from "../../../../DAL/adminStaffDashboardDAL";
import {
  CENTER_TIME_ZONE,
  centerDateKey,
  formatRequestType,
  getRequestContent,
  getRequestStatus,
  getReviewerDisplayInfo,
  getSessionStatus,
  getStaffUserId,
  type DashboardSection,
} from "../../../../BLL/services/adminStaffDashboardService";
import {useSelectedUser} from '../../../hooks/useSelectedUser';
import { useCenterSettings } from "../../../../contexts/CenterSettingsContext";
import type { ApprovalRequestDto } from "../../../../BLL/models/ApprovalRequestDto";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-US", { timeZone: CENTER_TIME_ZONE });
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("en-US", { timeZone: CENTER_TIME_ZONE });
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
    section?.error || (section?.data == null ? "Loading data..." : empty);

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
  const todayStr = now.toLocaleDateString("en-US", {
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
        title="Admin Staff Dashboard"
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
            <i className="bi bi-arrow-clockwise me-1" /> Refresh
          </button>
        }
      />

      {(loading || selectionLoading) && (
        <div className="alert alert-info py-2 px-3 mb-3 d-flex align-items-center gap-2" role="status">
          <div className="spinner-border spinner-border-sm" role="status" />
          <span>Loading center statistics...</span>
        </div>
      )}
      {dashboard && [dashboard.students, dashboard.tuition, dashboard.schedule, dashboard.staff,
        dashboard.requests].some((section) => section.error) && (
        <div className="alert alert-warning py-2 px-3 mb-3" role="alert">
          Some data could not be loaded. Please check each section and try refreshing.
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
              title="Total Active Students"
              value={dashboard?.students.data ?? "—"}
              footerValue={sectionText(dashboard?.students, "Student profiles with Active status")}
              footerLabel="View list"
            />
          </Link>
        </div>

        {/* Unpaid Students */}
        <div className="col-xl-3 col-md-6">
          <Link to="/admin-staff/tuition" className="text-decoration-none d-block">
            <KpiCard
              type="student"
              status="unpaid"
              title="Tuition Invoices Due"
              value={dashboard?.tuition.data?.unpaidCount ?? "—"}
              footerValue={sectionText(dashboard?.tuition, "Unpaid invoices • All periods")}
              footerLabel="View tuition"
            />
          </Link>
        </div>

        {/* Outstanding Tuition */}
        <div className="col-xl-3 col-md-6">
          <Link to="/admin-staff/tuition" className="text-decoration-none d-block">
            <KpiCard
              type="tuition"
              status="outstanding"
              title="Outstanding Tuition"
              currency="VND"
              value={totalOutstanding ?? null}
              footerValue={sectionText(dashboard?.tuition, "Total outstanding debt • All invoice periods")}
              footerLabel="Details"
            />
          </Link>
        </div>

        {/* My Approval Requests */}
        <div className="col-xl-3 col-md-6">
          <Link to="/admin-staff/approval-requests" className="text-decoration-none d-block">
            <KpiCard
              type="request"
              title="Requests Sent to Center Manager"
              value={dashboard?.requests.data == null ? "—" : requests.length}
              footerValue={sectionText(dashboard?.requests, `${pendingRequests.length} requests pending decision`)}
              footerLabel="View progress"
            />
          </Link>
        </div>
      </div>

      {/* Welcome */}
      <div className="card dashboard-welcome mb-4 border-0">
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <p className="welcome-subtitle mb-1">Hello,</p>
              <h3 className="welcome-title mb-2">
                {currentUser?.fullName ? `${currentUser.fullName} (Admin Staff)` : "Admin Staff"}
              </h3>
              <p className="welcome-text mb-0">
                Have a productive working day managing academic operations at EduTrack!
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
                <h5 className="mb-0">Today's Schedule &amp; Teaching Sessions</h5>
                <small className="text-muted">Sessions today; teachers according to class assignment</small>
              </div>
              <Link to="/admin-staff/teaching-monitoring" className="dashboard-view-link">
                Detailed Monitoring
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
                        <h6>{s.className || `Class #${s.classId}`}</h6>
                        <div className="schedule-meta">
                          <span>
                            <i className="bi bi-person me-1" />
                            {s.teacherNames || "No assigned teacher"}
                          </span>
                          <span>
                            <i className="bi bi-geo-alt me-1" />
                            {s.room || "No room assigned"}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={getSessionStatus(s, now)} />
                    </div>
                  ))
                ) : (
                  <div className={`p-4 text-center ${dashboard?.schedule.error ? "text-danger" : "text-muted"}`}
                    role={dashboard?.schedule.error ? "alert" : "status"}>
                    {sectionText(dashboard?.schedule, "No sessions scheduled for today.")}
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
            <h5 className="mb-1 fw-bold">Recent Requests Sent to Center Manager</h5>
            <small className="text-muted">Approval requests submitted by Admin Staff</small>
          </div>
          <Link to="/admin-staff/approval-requests" className="dashboard-view-link">
            View all requests
            <i className="bi bi-arrow-right ms-1" />
          </Link>
        </div>
        <div className="table-responsive">
          <table className="table user-table align-middle mb-0">
            <thead>
              <tr>
                <th>No.</th>
                <th>Request Code</th>
                <th>Request Type</th>
                <th>Title / Subject</th>
                <th>Submitted Date</th>
                <th>Priority</th>
                <th>Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.length > 0 ? (
                recentRequests.map((req, idx) => {
                  const reqCode = req.requestCode || `#${req.requestId}`;
                  const reqDate = formatDate(req.createdAt);
                  const displayType = formatRequestType(req.requestType);
                  const targetLabel = req.studentName
                    ? `Student: ${req.studentName}`
                    : req.className
                      ? `Class: ${req.className}`
                      : null;
                  return (
                    <tr key={req.requestId || idx}>
                      <td>{idx + 1}</td>
                      <td>
                        <span className="badge bg-light text-primary border font-monospace">
                          {reqCode}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-secondary-subtle text-secondary-emphasis">
                          {displayType}
                        </span>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">
                          {req.title || displayType}
                        </div>
                        {targetLabel && (
                          <small className="text-muted d-block">
                            <i className="bi bi-person me-1" />
                            {targetLabel}
                          </small>
                        )}
                      </td>
                      <td>{reqDate}</td>
                      <td>
                        <StatusBadge status={req.priority || "Medium"} />
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
                          <i className="bi bi-eye" /> Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className={`text-center py-3 ${dashboard?.requests.error ? "text-danger" : "text-muted"}`}
                    role={dashboard?.requests.error ? "alert" : "status"}>
                    {sectionText(dashboard?.requests, "No requests submitted yet.")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details modal of the selected request */}
      {dashboard && selectedRequest && (() => {
        const reviewerInfo = getReviewerDisplayInfo(selectedRequest);
        const reqCode = selectedRequest.requestCode || `#${selectedRequest.requestId}`;
        const displayType = formatRequestType(selectedRequest.requestType);
        const content = getRequestContent(selectedRequest);
        const normalizedStatus = (selectedRequest.status || "").trim().toLowerCase();

        return (
          <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content shadow-lg border-0">
                <div className="modal-header bg-light border-bottom">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-primary fs-6 font-monospace">
                      {reqCode}
                    </span>
                    <h5 className="modal-title fw-bold mb-0 text-dark">
                      Approval Request Details
                    </h5>
                  </div>
                  <button type="button" className="btn-close" onClick={() => setSelectedRequest(null)} />
                </div>
                <div className="modal-body p-4">
                  {/* Title and top meta */}
                  <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-3 pb-3 border-bottom">
                    <div>
                      <h5 className="fw-bold text-dark mb-1">
                        {selectedRequest.title || displayType}
                      </h5>
                      <div className="d-flex flex-wrap align-items-center gap-3 text-muted small mt-2">
                        <span>
                          <i className="bi bi-tag-fill me-1 text-primary" />
                          Request Type: <strong>{displayType}</strong>
                        </span>
                        <span>
                          <i className="bi bi-clock me-1 text-secondary" />
                          Submitted Date: <strong>{formatDateTime(selectedRequest.createdAt)}</strong>
                        </span>
                        <span>
                          <i className="bi bi-person me-1 text-secondary" />
                          Requester: <strong>{selectedRequest.requesterName || currentUser?.fullName || "Admin Staff"}</strong>
                        </span>
                      </div>
                    </div>
                    <div className="d-flex flex-column align-items-end gap-1">
                      <DotStatusBadge status={getRequestStatus(selectedRequest)} />
                      <StatusBadge status={selectedRequest.priority || "Medium"} />
                    </div>
                  </div>

                  {/* 2-column details info */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-3 h-100 border">
                        <small className="text-muted d-block mb-1 fw-semibold">
                          <i className="bi bi-person-badge me-1" /> Student / Related Subject
                        </small>
                        <div className="fw-bold text-dark fs-6">
                          {selectedRequest.studentName || "Not associated with a specific student"}
                        </div>
                        {selectedRequest.className && (
                          <div className="small text-muted mt-1">
                            Class: <strong>{selectedRequest.className}</strong>
                          </div>
                        )}
                        {selectedRequest.invoiceId && (
                          <div className="small text-muted mt-1">
                            Reference Invoice: <strong>#{selectedRequest.invoiceId}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-3 h-100 border">
                        <small className="text-muted d-block mb-1 fw-semibold">
                          <i className="bi bi-shield-check me-1" /> Approver (Center Manager)
                        </small>
                        <div className="fw-bold text-dark fs-6">
                          {reviewerInfo.reviewerText}
                        </div>
                        <div className="small text-muted mt-1">
                          Response Time: <strong>{reviewerInfo.reviewedAtText}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content / Reason */}
                  <div className="mb-3">
                    <label className="text-muted small fw-semibold d-block mb-1">
                      <i className="bi bi-card-text me-1" /> Details &amp; Justification:
                    </label>
                    <div className="p-3 bg-light rounded border text-secondary" style={{ whiteSpace: "pre-line", minHeight: "70px" }}>
                      {content}
                    </div>
                  </div>

                  {/* Review Notes from Center Manager */}
                  {reviewerInfo.reviewNotes ? (
                    <div className="mb-3">
                      <label className="text-muted small fw-semibold d-block mb-1">
                        <i className="bi bi-chat-left-quote-fill text-warning me-1" /> Feedback from Center Manager:
                      </label>
                      <div
                        className="p-3 bg-warning-subtle text-dark rounded border border-warning"
                        style={{ whiteSpace: "pre-line" }}
                      >
                        {reviewerInfo.reviewNotes}
                      </div>
                    </div>
                  ) : reviewerInfo.isReviewed ? (
                    <div className="mb-3">
                      <div className="p-2 bg-light text-muted small rounded border text-center">
                        <i className="bi bi-info-circle me-1" />
                        The Center Manager has {normalizedStatus === "approved" ? "approved" : "rejected"} this request without additional notes.
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="modal-footer bg-light d-flex justify-content-between">
                  <Link
                    to="/admin-staff/approval-requests"
                    className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1"
                    onClick={() => setSelectedRequest(null)}
                  >
                    <i className="bi bi-box-arrow-up-right" /> Open request management
                  </Link>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedRequest(null)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
