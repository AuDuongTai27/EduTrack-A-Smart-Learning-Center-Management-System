import { useState, useEffect, useMemo } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import DotStatusBadge from "../../../components/Common/DotStatusBadge";
import StatusBadge from "../../../components/Common/StatusBadge";
import Pagination from "../../../components/Common/Pagination";
import TableToolbar from "../../../components/Common/TableToolbar";
import feedbackDAL from "../../../../DAL/feedbackDAL";
import type { ApprovalRequestDto } from "../../../../BLL/models/ApprovalRequestDto";

const REQUEST_TYPE_LABELS: Record<string, string> = {
  feedback: "Feedback",
  leave_request: "Leave Request",
  class_transfer: "Class Transfer",
  academic_support: "Academic Support",
  tuition_adjustment: "Tuition Adjustment",
  refund_request: "Refund Request",
  due_date_extension: "Due Date Extension",
  student_information_change: "Student Info Change",
  other: "Other",
};

function formatRequestType(type?: string | null): string {
  if (!type) return "Other";
  const key = type.trim().toLowerCase();
  return REQUEST_TYPE_LABELS[key] || type;
}

function isFromAdminStaff(req: ApprovalRequestDto): boolean {
  if (req.requesterRole) {
    const role = req.requesterRole.trim().toLowerCase();
    return role === "admin_staff" || role === "center_manager";
  }
  return (
    req.requestedBy === 2 &&
    (req.requestType || "").trim().toLowerCase() !== "feedback"
  );
}

function formatRequesterRole(req: ApprovalRequestDto): string {
  const role = (req.requesterRole || "").trim().toLowerCase();
  switch (role) {
    case "student":
      return "Student";
    case "parent":
      return "Parent";
    case "teacher":
      return "Teacher";
    case "ta":
      return "Teaching Assistant";
    default:
      if (req.requestedBy === 9 || req.requestedBy === 10)
        return "Parent";
      if (req.requestedBy === 3 || req.requestedBy === 4)
        return "Teacher";
      if (req.requestedBy === 5) return "Teaching Assistant";
      return "Student";
  }
}

function getDisplayStatus(req: ApprovalRequestDto): string {
  const s = (req.status || "pending").trim().toLowerCase();
  if (s === "approved") return "Approved";
  if (s === "rejected") return "Rejected";
  if (req.reviewedBy != null) return "Pending";
  return "Waiting";
}

export default function AdminStaffFeedbackPage() {
  const [requests, setRequests] = useState<ApprovalRequestDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedPriority, setSelectedPriority] = useState<string>("All");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);

  // Detail & Processing Modal state (GetById)
  const [selectedRequest, setSelectedRequest] =
    useState<ApprovalRequestDto | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [reviewNotes, setReviewNotes] = useState<string>("");
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadRequests() {
      try {
        setLoading(true);
        setLoadError(null);
        const res = await feedbackDAL.getAllRequests();
        if (isMounted && res.data) {
          // Only show feedback and requests submitted by Students, Parents, Teachers, or TAs
          setRequests(res.data.filter((r) => !isFromAdminStaff(r)));
        }
      } catch (err) {
        console.warn("Failed to load incoming requests list:", err);
        if (isMounted) {
          setLoadError(
            err instanceof Error
              ? err.message
              : "Failed to load feedback and request list from server.",
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadRequests();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter & Search logic
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const q = searchTerm.trim().toLowerCase();
      const matchSearch =
        q === "" ||
        (r.requestCode && r.requestCode.toLowerCase().includes(q)) ||
        (r.title && r.title.toLowerCase().includes(q)) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        (r.reason && r.reason.toLowerCase().includes(q)) ||
        (r.requesterName && r.requesterName.toLowerCase().includes(q)) ||
        (r.studentName && r.studentName.toLowerCase().includes(q)) ||
        (r.requestId && String(r.requestId).includes(q));

      const matchType =
        selectedType === "All" ||
        (r.requestType &&
          r.requestType.toLowerCase() === selectedType.toLowerCase());

      const statusLower = (r.status || "pending").trim().toLowerCase();
      let matchStatus = true;
      if (selectedStatus === "waiting") {
        matchStatus = statusLower === "pending" && r.reviewedBy == null;
      } else if (selectedStatus === "pending") {
        matchStatus = statusLower === "pending" && r.reviewedBy != null;
      } else if (selectedStatus !== "All") {
        matchStatus = statusLower === selectedStatus.toLowerCase();
      }

      const matchPriority =
        selectedPriority === "All" ||
        (r.priority &&
          r.priority.toLowerCase() === selectedPriority.toLowerCase());

      return matchSearch && matchType && matchStatus && matchPriority;
    });
  }, [requests, searchTerm, selectedType, selectedStatus, selectedPriority]);

  // Pagination slicing
  const totalItems = filteredRequests.length;
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredRequests.slice(start, start + entriesPerPage);
  }, [filteredRequests, currentPage, entriesPerPage]);

  // Handle open review modal (GetById via API)
  const handleReviewRequest = async (req: ApprovalRequestDto) => {
    setSelectedRequest(req);
    setReviewNotes(req.reviewNotes || "");
    setLoadingDetail(true);
    try {
      const detail = await feedbackDAL.getRequestById(req.requestId);
      if (detail) {
        setSelectedRequest(detail);
        setReviewNotes(detail.reviewNotes || "");
      }
    } catch {
      // Fallback to row data if detail fetch fails
    } finally {
      setLoadingDetail(false);
    }
  };

  // Step 1: Mark request as "Pending"
  // Locks sender (Student / Parent / Teacher / TA) from editing and unlocks Approve / Reject buttons
  const handleMarkPending = async () => {
    if (!selectedRequest || submittingReview) return;

    setSubmittingReview(true);
    try {
      const updated = await feedbackDAL.reviewRequest(
        selectedRequest.requestId,
        {
          reviewedBy: 2, // Admin Staff
          status: "pending",
          reviewNotes: reviewNotes.trim() || undefined,
        },
      );

      setRequests((prev) =>
        prev.map((req) =>
          req.requestId === updated.requestId ? updated : req,
        ),
      );
      setSelectedRequest(updated);
      setActionSuccessMsg(
        `Request ${updated.requestCode || `#${updated.requestId}`} moved to "Pending (Under Review)". You can now Approve or Reject it.`,
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to change status to under review.",
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  // Step 2: Handle Approve or Reject (only available after request is in Pending state)
  const handleProcessRequest = async (newStatus: "Approved" | "Rejected") => {
    if (!selectedRequest || submittingReview) return;

    if (selectedRequest.status.toLowerCase() !== "pending") {
      alert("This request has already been processed.");
      return;
    }

    if (selectedRequest.reviewedBy == null) {
      alert(
        "Please click 'Pending (Under Review)' before approving or rejecting.",
      );
      return;
    }

    if (newStatus === "Rejected" && !reviewNotes.trim()) {
      alert("Please enter a rejection reason.");
      return;
    }

    setSubmittingReview(true);
    try {
      const updated = await feedbackDAL.reviewRequest(
        selectedRequest.requestId,
        {
          reviewedBy: 2, // Admin Staff
          status: newStatus.toLowerCase() as "approved" | "rejected",
          reviewNotes: reviewNotes.trim(),
        },
      );

      setRequests((prev) =>
        prev.map((req) =>
          req.requestId === updated.requestId ? updated : req,
        ),
      );

      setSelectedRequest(null);
      setActionSuccessMsg(
        `Request ${updated.requestCode || `#${updated.requestId}`} ${newStatus === "Approved" ? "approved / resolved" : "rejected"} successfully!`,
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to process request.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const isSelectedWaiting =
    selectedRequest != null &&
    selectedRequest.status?.toLowerCase() === "pending" &&
    selectedRequest.reviewedBy == null;

  const isSelectedPendingReview =
    selectedRequest != null &&
    selectedRequest.status?.toLowerCase() === "pending" &&
    selectedRequest.reviewedBy != null;

  const isSelectedProcessed =
    selectedRequest != null &&
    selectedRequest.status?.toLowerCase() !== "pending";

  return (
    <>
      {/* Breadcrumb */}
      <PageHeader
        title="Received Feedback &amp; Requests"
        breadcrumbItems={[
          { label: "Admin Staff", path: "/admin-staff/dashboard" },
          { label: "Received Feedback" },
        ]}
      />

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

      {loadError && (
        <div className="alert alert-danger mb-4 shadow-sm" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2" />
          {loadError}
        </div>
      )}

      {/* Feedback & Request List */}
      <div className="card user-list-card border-0 shadow-sm">
        {/* Filter Toolbar */}
        <div className="card-header user-list-header bg-white py-3 border-bottom">
          <div className="row g-3 align-items-center">
            <div className="col-xl-4 col-lg-6">
              <div className="user-search position-relative">
                <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                <input
                  type="text"
                  className="form-control ps-5"
                  placeholder="Search by request code, title, or sender name..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
            <div className="col-xl-3 col-lg-3 col-md-6">
              <select
                className="form-select"
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Request Types</option>
                <option value="feedback">Feedback</option>
                <option value="leave_request">
                  Leave Request
                </option>
                <option value="class_transfer">
                  Class Transfer
                </option>
                <option value="academic_support">
                  Academic Support
                </option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="col-xl-2 col-lg-3 col-md-6">
              <select
                className="form-select"
                value={selectedPriority}
                onChange={(e) => {
                  setSelectedPriority(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="col-xl-3 col-lg-3 col-md-6">
              <select
                className="form-select"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Statuses</option>
                <option value="waiting">Waiting</option>
                <option value="pending">
                  Pending (Under Review)
                </option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Controls */}
        <TableToolbar
          totalItems={totalItems}
          totalLabel="Total received requests"
          entriesPerPage={entriesPerPage}
          onEntriesPerPageChange={(value) => {
            setEntriesPerPage(value);
            setCurrentPage(1);
          }}
        />

        {/* Request Table */}
        <div className="table-responsive">
          <table className="table user-table align-middle mb-0 table-hover">
            <thead className="table-light">
              <tr>
                <th className="fw-bold">No.</th>
                <th className="fw-bold">Request Code</th>
                <th className="fw-bold">Type</th>
                <th className="fw-bold">Related Student / Class</th>
                <th className="fw-bold">Content Summary</th>
                <th className="fw-bold">Sender</th>
                <th className="fw-bold">Priority</th>
                <th className="fw-bold">Status</th>
                <th className="text-center fw-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-5 text-muted">
                    <div
                      className="spinner-border spinner-border-sm text-primary me-2"
                      role="status"
                    />
                    Loading feedback and requests...
                  </td>
                </tr>
              ) : paginatedRequests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-5 text-muted">
                    <i className="bi bi-inbox fs-2 d-block mb-2 text-secondary" />
                    No requests or feedback match the filters.
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((req, idx) => {
                  const itemIndex =
                    (currentPage - 1) * entriesPerPage + idx + 1;

                  return (
                    <tr key={req.requestId || idx}>
                      <td>{itemIndex}</td>
                      <td>
                        <strong className="text-primary font-monospace">
                          {req.requestCode ||
                            `AR${String(req.requestId).padStart(4, "0")}`}
                        </strong>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {formatRequestType(req.requestType)}
                        </span>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">
                          {req.studentName || "Center"}
                        </div>
                        {req.className && (
                          <small className="text-muted">{req.className}</small>
                        )}
                      </td>
                      <td>
                        <div
                          className="text-truncate fw-medium"
                          style={{ maxWidth: "250px" }}
                          title={req.title || undefined}
                        >
                          {req.title || formatRequestType(req.requestType)}
                        </div>
                        <small
                          className="text-muted text-truncate d-block"
                          style={{ maxWidth: "250px" }}
                        >
                          {req.description || req.reason || "—"}
                        </small>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">
                          {req.requesterName || req.studentName || "Sender"}
                        </div>
                        <small className="text-muted">
                          {formatRequesterRole(req)}
                        </small>
                      </td>
                      <td>
                        <StatusBadge status={req.priority || "Medium"} />
                      </td>
                      <td>
                        <DotStatusBadge status={getDisplayStatus(req)} />
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 shadow-sm"
                          onClick={() => handleReviewRequest(req)}
                        >
                          <i className="bi bi-shield-check" />
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 border-top bg-white">
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            entriesPerPage={entriesPerPage}
            itemLabel="requests"
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* DETAIL & PROCESSING MODAL (GetById) */}
      {selectedRequest && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-white text-primary font-monospace fs-6">
                    {selectedRequest.requestCode ||
                      `AR${String(selectedRequest.requestId).padStart(4, "0")}`}
                  </span>
                  <h5 className="modal-title fw-bold mb-0">
                    Review &amp; Resolve Request / Feedback
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedRequest(null)}
                />
              </div>

              <div className="modal-body p-4">
                {loadingDetail && (
                  <div className="alert alert-light border py-2 mb-3 d-flex align-items-center gap-2 text-muted small">
                    <div
                      className="spinner-border spinner-border-sm text-primary"
                      role="status"
                    />
                    <span>Synchronizing detailed data from server...</span>
                  </div>
                )}

                {isSelectedWaiting && (
                  <div className="alert alert-info d-flex align-items-start gap-2 mb-3 py-2 px-3">
                    <i className="bi bi-info-circle-fill mt-1" />
                    <div className="small">
                      Request status is <strong>Waiting</strong> (Sender
                      can still edit). Click{" "}
                      <strong>Pending (Under Review)</strong> to accept
                      for processing and unlock Approve / Reject actions.
                    </div>
                  </div>
                )}

                {isSelectedPendingReview && (
                  <div className="alert alert-warning d-flex align-items-start gap-2 mb-3 py-2 px-3">
                    <i className="bi bi-hourglass-split mt-1" />
                    <div className="small">
                      Request status is{" "}
                      <strong>Pending (Under Review)</strong>. Sender
                      editing is locked. You can now select{" "}
                      <strong>Reject Request</strong> or{" "}
                      <strong>Approve Request</strong>.
                    </div>
                  </div>
                )}

                <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
                  <div>
                    <h5 className="fw-bold mb-1 text-dark">
                      {selectedRequest.title ||
                        formatRequestType(selectedRequest.requestType)}
                    </h5>
                    <div className="d-flex align-items-center gap-3 text-muted small flex-wrap">
                      <span>
                        Type:{" "}
                        <strong>
                          {formatRequestType(selectedRequest.requestType)}
                        </strong>
                      </span>
                      <span>
                        Sender:{" "}
                        <strong>
                          {selectedRequest.requesterName ||
                            selectedRequest.studentName ||
                            "Sender"}{" "}
                          ({formatRequesterRole(selectedRequest)})
                        </strong>
                      </span>
                      <span>
                        Submitted Date:{" "}
                        {selectedRequest.createdAt
                          ? new Date(selectedRequest.createdAt).toLocaleString(
                              "en-US",
                            )
                          : "—"}
                      </span>
                    </div>
                  </div>
                  <div className="d-flex flex-column align-items-end gap-1">
                    <DotStatusBadge status={getDisplayStatus(selectedRequest)} />
                    <StatusBadge
                      status={selectedRequest.priority || "Medium"}
                    />
                  </div>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3">
                      <small className="text-muted d-block mb-1">
                        Related Student / Class
                      </small>
                      <strong className="text-dark">
                        {selectedRequest.studentName || "Unknown"}
                      </strong>
                      {selectedRequest.className && (
                        <div className="small text-muted">
                          {selectedRequest.className}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3">
                      <small className="text-muted d-block mb-1">
                        Priority
                      </small>
                      <strong className="text-dark text-capitalize">
                        {selectedRequest.priority || "Medium"}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h6 className="fw-bold text-dark mb-2">
                    Details &amp; Reason from Sender:
                  </h6>
                  <div
                    className="p-3 bg-light rounded border text-secondary"
                    style={{ whiteSpace: "pre-line", minHeight: "90px" }}
                  >
                    {selectedRequest.description ||
                      selectedRequest.reason ||
                      "No additional details provided."}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold text-dark">
                    Feedback &amp; Resolution by Admin Staff:
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Enter notes/feedback for student / parent / teacher or reason for rejection..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    readOnly={isSelectedProcessed}
                  />
                </div>
              </div>

              <div className="modal-footer bg-light d-flex justify-content-between align-items-center">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setSelectedRequest(null)}
                >
                  Close
                </button>

                <div className="d-flex gap-2 align-items-center">
                  {/* Step 1: When request is newly submitted ("Waiting"), prioritize the Pending button */}
                  {isSelectedWaiting && (
                    <button
                      type="button"
                      className="btn btn-warning text-dark fw-semibold px-4 d-inline-flex align-items-center gap-2 shadow-sm"
                      disabled={submittingReview}
                      onClick={handleMarkPending}
                    >
                      <i className="bi bi-hourglass-split" />
                      {submittingReview
                        ? "Receiving..."
                        : "Pending (Under Review)"}
                    </button>
                  )}

                  {/* Step 2: Once Pending is clicked, Pending button disappears and Reject / Approve buttons appear */}
                  {isSelectedPendingReview && (
                    <>
                      <button
                        type="button"
                        className="btn btn-danger px-3"
                        disabled={submittingReview}
                        onClick={() => handleProcessRequest("Rejected")}
                      >
                        <i className="bi bi-x-circle me-1" />
                        Reject Request
                      </button>
                      <button
                        type="button"
                        className="btn btn-success px-4"
                        disabled={submittingReview}
                        onClick={() => handleProcessRequest("Approved")}
                      >
                        <i className="bi bi-check-circle me-1" />
                        Approve Request
                      </button>
                    </>
                  )}

                  {/* Step 3: Already Approved or Rejected */}
                  {isSelectedProcessed && (
                    <span className="text-muted small">
                      <i className="bi bi-check2-all me-1" />
                      This request has been resolved (
                      <strong>{getDisplayStatus(selectedRequest)}</strong>).
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
