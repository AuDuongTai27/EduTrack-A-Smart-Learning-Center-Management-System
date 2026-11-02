import { useState, useEffect, useMemo } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import DotStatusBadge from "../../../components/Common/DotStatusBadge";
import StatusBadge from "../../../components/Common/StatusBadge";
import Pagination from "../../../components/Common/Pagination";
import TableToolbar from "../../../components/Common/TableToolbar";
import TableActionButton from "../../../components/Common/TableActionButton";
import feedbackDAL from "../../../../DAL/feedbackDAL";
import userApi from "../../../../api/userApi";
import tuitionApi from "../../../../api/tuitionApi";
import type { UserDto } from "../../../../BLL/models/UserDto";
import type { TuitionInvoiceDto } from "../../../../BLL/models/TuitionDto";
import type { ApprovalRequestDto } from "../../../../BLL/models/ApprovalRequestDto";

export default function AdminStaffApprovalRequestPage() {
  const [requests, setRequests] = useState<ApprovalRequestDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedPriority, setSelectedPriority] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedSort, setSelectedSort] = useState<string>("newest");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);

  // Detail Modal state (GetById)
  const [selectedRequest, setSelectedRequest] =
    useState<ApprovalRequestDto | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  // New Request Modal state
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [newRequestForm, setNewRequestForm] = useState({
    requestType: "other",
    studentId: "",
    invoiceId: "",
    priority: "medium",
    title: "",
    reason: "",
  });
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  // Student search: visible label is name/code, submitted value is verified userId.
  const [students, setStudents] = useState<UserDto[]>([]);
  const [invoices, setInvoices] = useState<TuitionInvoiceDto[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [showStudentSuggestions, setShowStudentSuggestions] = useState(false);
  const [referenceLoading, setReferenceLoading] = useState(false);
  const [referenceError, setReferenceError] = useState<string | null>(null);

  const selectedStudent = students.find(
    (student) => String(student.userId) === newRequestForm.studentId,
  );
  const studentInvoices = invoices.filter(
    (invoice) => invoice.studentId === selectedStudent?.userId,
  );
  const selectedInvoice = studentInvoices.find(
    (invoice) => String(invoice.invoiceId) === newRequestForm.invoiceId,
  );
  const studentSuggestions = students
    .filter((student) => {
      const q = studentSearch.trim().toLocaleLowerCase("vi-VN");
      return (
        !q ||
        [student.fullName, student.userCode, student.phone || ""].some((v) =>
          v.toLocaleLowerCase("vi-VN").includes(q),
        )
      );
    })
    .slice(0, 8);

  const requiresInvoice = [
    "tuition_adjustment",
    "due_date_extension",
    "refund_request",
  ].includes(newRequestForm.requestType);
  const requiresStudent =
    newRequestForm.requestType === "student_information_change";

  useEffect(() => {
    if (!showNewModal) return;
    let active = true;
    async function loadReferences() {
      setReferenceLoading(true);
      setReferenceError(null);
      try {
        const [allUsers, allInvoices] = await Promise.all([
          userApi.getAll(),
          tuitionApi.getAllInvoices(),
        ]);
        if (!active) return;
        setStudents(
          allUsers.filter(
            (u) =>
              u.roles?.some((role) => role.toLowerCase() === "student") &&
              u.status.toLowerCase() === "active",
          ),
        );
        setInvoices(allInvoices);
      } catch (error) {
        if (active) {
          setReferenceError(
            error instanceof Error
              ? error.message
              : "Không tải được học sinh hoặc hóa đơn từ Backend.",
          );
        }
      } finally {
        if (active) setReferenceLoading(false);
      }
    }
    void loadReferences();
    return () => {
      active = false;
    };
  }, [showNewModal]);

  useEffect(() => {
    let isMounted = true;
    async function fetchRequests() {
      try {
        setLoading(true);
        setLoadError(null);
        const res = await feedbackDAL.getAllRequests();
        if (isMounted && res.data) {
          // Admin Staff's approval requests: requests initiated by staff or internal requests
          setRequests(res.data);
        }
      } catch (err) {
        console.warn("Lỗi tải danh sách yêu cầu phê duyệt:", err);
        if (isMounted) {
          setLoadError(
            err instanceof Error
              ? err.message
              : "Không thể tải danh sách yêu cầu từ Backend.",
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchRequests();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter & Search logic
  const filteredRequests = useMemo(() => {
    return requests
      .filter((r) => {
        const matchSearch =
          searchTerm === "" ||
          (r.requestCode &&
            r.requestCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (r.title &&
            r.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (r.studentName &&
            r.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (r.description &&
            r.description.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchType =
          selectedType === "All" ||
          r.requestType?.toLowerCase() === selectedType;
        const matchPriority =
          selectedPriority === "All" ||
          r.priority?.toLowerCase() === selectedPriority.toLowerCase();
        const matchStatus =
          selectedStatus === "All" ||
          r.status?.toLowerCase() === selectedStatus.toLowerCase();

        return matchSearch && matchType && matchPriority && matchStatus;
      })
      .sort((a, b) => {
        if (selectedSort === "newest") {
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        }
        if (selectedSort === "oldest") {
          return (
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime()
          );
        }
        if (selectedSort === "priority-desc") {
          const pMap: Record<string, number> = { high: 3, medium: 2, low: 1 };
          return (
            (pMap[b.priority?.toLowerCase() || "low"] || 0) -
            (pMap[a.priority?.toLowerCase() || "low"] || 0)
          );
        }
        if (selectedSort === "priority-asc") {
          const pMap: Record<string, number> = { high: 3, medium: 2, low: 1 };
          return (
            (pMap[a.priority?.toLowerCase() || "low"] || 0) -
            (pMap[b.priority?.toLowerCase() || "low"] || 0)
          );
        }
        return 0;
      });
  }, [
    requests,
    searchTerm,
    selectedType,
    selectedPriority,
    selectedStatus,
    selectedSort,
  ]);

  // Paginated list
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredRequests.slice(start, start + entriesPerPage);
  }, [filteredRequests, currentPage, entriesPerPage]);

  // Handle open detail modal (GetById)
  const handleViewDetails = async (req: ApprovalRequestDto) => {
    setLoadingDetail(true);
    try {
      const detail = await feedbackDAL.getRequestById(req.requestId);
      setSelectedRequest(detail || req);
    } catch {
      setSelectedRequest(req);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Create the request on Backend. Never create a fake local request.
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creating) return;

    if (!newRequestForm.title.trim() || !newRequestForm.reason.trim()) {
      alert("Vui lòng nhập đầy đủ tiêu đề và lý do yêu cầu.");
      return;
    }
    if (referenceLoading || referenceError) {
      alert("Chưa tải được dữ liệu học sinh và hóa đơn. Vui lòng thử lại.");
      return;
    }
    if ((requiresInvoice || requiresStudent) && !selectedStudent) {
      alert("Vui lòng chọn một học sinh hợp lệ từ danh sách gợi ý.");
      return;
    }
    if (newRequestForm.studentId && !selectedStudent) {
      alert("Học sinh đã chọn không còn hợp lệ. Vui lòng tìm lại.");
      return;
    }
    if (requiresInvoice && !selectedInvoice) {
      alert("Vui lòng chọn hóa đơn thuộc đúng học sinh đã chọn.");
      return;
    }

    setCreating(true);
    try {
      const created = await feedbackDAL.createRequest({
        requestedBy: 2, // Tài khoản Admin Staff seed để test; thay bằng auth khi có đăng nhập thật.
        requestType: newRequestForm.requestType,
        title: newRequestForm.title.trim(),
        reason: newRequestForm.reason.trim(),
        description: newRequestForm.reason.trim(),
        priority: newRequestForm.priority,
        studentId: newRequestForm.studentId
          ? Number(newRequestForm.studentId)
          : null,
        invoiceId: newRequestForm.invoiceId
          ? Number(newRequestForm.invoiceId)
          : null,
        classId: null,
      });

      setRequests((prev) => [
        created,
        ...prev.filter((item) => item.requestId !== created.requestId),
      ]);
      setSearchTerm("");
      setSelectedType("All");
      setSelectedPriority("All");
      setSelectedStatus("All");
      setCurrentPage(1);
      setShowNewModal(false);
      setNewRequestForm({
        requestType: "other",
        studentId: "",
        invoiceId: "",
        priority: "medium",
        title: "",
        reason: "",
      });
      setStudentSearch("");
      setShowStudentSuggestions(false);
      setActionSuccessMsg(`Đã tạo yêu cầu ${created.requestCode} thành công!`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Tạo yêu cầu thất bại.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      {/* Breadcrumb and Quick Access */}
      <PageHeader
        title="My Approval Requests"
        breadcrumbItems={[
          { label: "Admin Staff", path: "/admin-staff" },
          { label: "My Approval Requests" },
        ]}
        action={
          <button
            type="button"
            className="btn btn-primary d-flex align-items-center shadow-sm"
            onClick={() => setShowNewModal(true)}
          >
            <i className="bi bi-plus-square me-2" />
            New Request
          </button>
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

      {loadError && (
        <div className="alert alert-danger" role="alert">
          Không thể kết nối Backend Approval Requests: {loadError}
        </div>
      )}

      {/* Approval Request Filters */}
      <div className="card user-list-card mb-4 border-0 shadow-sm">
        <div className="card-header user-list-header bg-white py-3">
          <div className="row g-3 align-items-center">
            <div className="col-xl-3 col-lg-6">
              <div className="user-search position-relative">
                <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                <input
                  type="text"
                  className="form-control ps-5"
                  placeholder="Search by code, title, student..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
            <div className="col-xl col-lg-3 col-md-6">
              <select
                className="form-select"
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Request Types</option>
                <option value="tuition_adjustment">Tuition Adjustment</option>
                <option value="due_date_extension">Due Date Extension</option>
                <option value="refund_request">Refund Request</option>
                <option value="student_information_change">
                  Student Information Change
                </option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="col-xl col-lg-3 col-md-6">
              <select
                className="form-select"
                value={selectedPriority}
                onChange={(e) => {
                  setSelectedPriority(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="col-xl col-lg-3 col-md-6">
              <select
                className="form-select"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="col-xl col-lg-3 col-md-6">
              <select
                className="form-select"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
              >
                <option value="newest">Sort by Newest</option>
                <option value="oldest">Sort by Oldest</option>
                <option value="priority-desc">Priority High-Low</option>
                <option value="priority-asc">Priority Low-High</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Approval Request List */}
      <div className="card user-list-card border-0 shadow-sm">
        <div className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom bg-white">
          <div>
            <h5 className="mb-1 fw-bold text-dark">Approval Request List</h5>
            <small className="text-muted">
              Track requests submitted by Admin Staff for Center Manager
              approval
            </small>
          </div>
        </div>

        <TableToolbar
          totalItems={filteredRequests.length}
          totalLabel="Total Requests"
          entriesPerPage={entriesPerPage}
          onEntriesPerPageChange={(value) => {
            setEntriesPerPage(value);
            setCurrentPage(1);
          }}
        />

        {/* Table */}
        <div className="table-responsive">
          <table className="table user-table align-middle mb-0 table-hover">
            <thead className="table-light">
              <tr>
                <th>No.</th>
                <th>Request Code</th>
                <th>Request Type</th>
                <th>Related To</th>
                <th>Request Content</th>
                <th>Submitted Date</th>
                <th>Priority</th>
                <th>Status</th>
                <th className="text-center">Action</th>
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
                    Đang tải danh sách yêu cầu phê duyệt...
                  </td>
                </tr>
              ) : paginatedRequests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-5 text-muted">
                    <i className="bi bi-inbox fs-2 d-block mb-2 text-secondary" />
                    Không tìm thấy yêu cầu phê duyệt nào phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((req, idx) => {
                  const itemIndex =
                    (currentPage - 1) * entriesPerPage + idx + 1;
                  const dateStr = req.createdAt
                    ? new Date(req.createdAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "—";

                  return (
                    <tr key={req.requestId || idx}>
                      <td>{itemIndex}</td>
                      <td>
                        <strong className="text-primary font-monospace">
                          {req.requestCode || `AR${req.requestId}`}
                        </strong>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {req.requestType}
                        </span>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">
                          {req.studentName || "Trung tâm"}
                        </div>
                        {req.className && (
                          <small className="text-muted">{req.className}</small>
                        )}
                      </td>
                      <td>
                        <div
                          className="text-truncate fw-medium"
                          style={{ maxWidth: "260px" }}
                          title={req.title || undefined}
                        >
                          {req.title}
                        </div>
                        <small
                          className="text-muted text-truncate d-block"
                          style={{ maxWidth: "260px" }}
                        >
                          {req.description || req.reason || "—"}
                        </small>
                      </td>
                      <td>{dateStr}</td>
                      <td>
                        <StatusBadge status={req.priority || "Medium"} />
                      </td>
                      <td>
                        <DotStatusBadge status={req.status || "Pending"} />
                      </td>
                      <td className="text-center">
                        <div className="d-flex align-items-center justify-content-center gap-1">
                          <TableActionButton
                            action="View Details"
                            title="Xem chi tiết đơn yêu cầu"
                            onClick={() => handleViewDetails(req)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredRequests.length}
          entriesPerPage={entriesPerPage}
          itemLabel="requests"
          onPageChange={setCurrentPage}
        />
      </div>

      {/* CREATE NEW REQUEST MODAL */}
      {showNewModal && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-plus-circle me-2" />
                  Tạo yêu cầu phê duyệt mới lên Quản lý trung tâm
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowNewModal(false)}
                />
              </div>
              <form onSubmit={handleCreateSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        Loại yêu cầu <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        value={newRequestForm.requestType}
                        onChange={(e) =>
                          setNewRequestForm({
                            ...newRequestForm,
                            requestType: e.target.value,
                            invoiceId: "",
                          })
                        }
                        required
                      >
                        <option value="tuition_adjustment">
                          Tuition Adjustment (Miễn giảm / Điều chỉnh học phí)
                        </option>
                        <option value="due_date_extension">
                          Due Date Extension (Gia hạn đóng học phí)
                        </option>
                        <option value="refund_request">
                          Refund Request (Yêu cầu hoàn trả học phí)
                        </option>
                        <option value="student_information_change">
                          Student Information Change (Sửa thông tin học viên)
                        </option>
                        <option value="other">
                          Other (Yêu cầu đặc biệt khác)
                        </option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold">Độ ưu tiên</label>
                      <select
                        className="form-select"
                        value={newRequestForm.priority}
                        onChange={(e) =>
                          setNewRequestForm({
                            ...newRequestForm,
                            priority: e.target.value,
                          })
                        }
                      >
                        <option value="low">Low (Thấp)</option>
                        <option value="medium">Medium (Trung bình)</option>
                        <option value="high">High (Khẩn cấp / Cao)</option>
                      </select>
                    </div>

                    <div className={requiresInvoice ? "col-md-6" : "col-md-12"}>
                      <label className="form-label fw-bold">
                        Học sinh liên quan
                        {(requiresStudent || requiresInvoice) && (
                          <span className="text-danger"> *</span>
                        )}
                      </label>
                      <div className="position-relative">
                        <input
                          type="search"
                          className="form-control"
                          placeholder="Tìm tên, mã học sinh hoặc số điện thoại..."
                          autoComplete="off"
                          value={studentSearch}
                          onFocus={() => setShowStudentSuggestions(true)}
                          onBlur={() => setShowStudentSuggestions(false)}
                          onChange={(e) => {
                            setStudentSearch(e.target.value);
                            setShowStudentSuggestions(true);
                            // Editing the display text invalidates any previous selection.
                            setNewRequestForm((prev) => ({
                              ...prev,
                              studentId: "",
                              invoiceId: "",
                            }));
                          }}
                        />
                        {showStudentSuggestions &&
                          !referenceLoading &&
                          !referenceError && (
                            <div
                              className="list-group position-absolute w-100 shadow border rounded bg-white"
                              style={{
                                top: "100%",
                                maxHeight: 220,
                                overflowY: "auto",
                                zIndex: 1060,
                              }}
                            >
                              {studentSuggestions.length ? (
                                studentSuggestions.map((student) => (
                                  <button
                                    key={student.userId}
                                    type="button"
                                    className="list-group-item list-group-item-action text-start"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => {
                                      setStudentSearch(
                                        `${student.fullName} (${student.userCode})`,
                                      );
                                      setNewRequestForm((prev) => ({
                                        ...prev,
                                        studentId: String(student.userId),
                                        invoiceId: "",
                                      }));
                                      setShowStudentSuggestions(false);
                                    }}
                                  >
                                    <span className="fw-semibold">
                                      {student.fullName}
                                    </span>
                                    <span className="ms-2 text-muted small">
                                      {student.userCode}
                                    </span>
                                    {student.phone && (
                                      <small className="d-block text-muted">
                                        {student.phone}
                                      </small>
                                    )}
                                  </button>
                                ))
                              ) : (
                                <div className="list-group-item text-muted">
                                  Không tìm thấy học sinh phù hợp.
                                </div>
                              )}
                            </div>
                          )}
                      </div>
                      {selectedStudent && (
                        <div className="small text-success mt-1">
                          <i className="bi bi-check-circle me-1" />
                          Đã xác nhận: {selectedStudent.fullName} —{" "}
                          {selectedStudent.userCode}
                        </div>
                      )}
                      {referenceLoading && (
                        <small className="text-muted">
                          Đang tải danh sách học sinh...
                        </small>
                      )}
                      {referenceError && (
                        <small className="text-danger">{referenceError}</small>
                      )}
                    </div>
                    {requiresInvoice && (
                      <div className="col-md-6">
                        <label className="form-label fw-bold">
                          Hóa đơn liên quan{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select"
                          value={newRequestForm.invoiceId}
                          onChange={(e) =>
                            setNewRequestForm((prev) => ({
                              ...prev,
                              invoiceId: e.target.value,
                            }))
                          }
                          disabled={
                            !selectedStudent ||
                            referenceLoading ||
                            !!referenceError
                          }
                          required
                        >
                          <option value="">Chọn hóa đơn của học sinh...</option>
                          {studentInvoices.map((invoice) => (
                            <option
                              key={invoice.invoiceId}
                              value={invoice.invoiceId}
                            >
                              HĐ #{invoice.invoiceId} — {invoice.className}
                              {invoice.periodMonth && invoice.periodYear
                                ? ` — ${invoice.periodMonth}/${invoice.periodYear}`
                                : ""}
                              {` — ${invoice.amountDue.toLocaleString("vi-VN")}đ`}
                            </option>
                          ))}
                        </select>
                        {selectedStudent && studentInvoices.length === 0 && (
                          <small className="text-danger">
                            Học sinh chưa có hóa đơn. Không thể tạo yêu cầu học
                            phí.
                          </small>
                        )}
                        {selectedInvoice && (
                          <div className="small bg-light border rounded p-2 mt-2">
                            <div>
                              <strong>Học sinh:</strong>{" "}
                              {selectedInvoice.studentName} (
                              {selectedInvoice.studentCode})
                            </div>
                            <div>
                              <strong>Lớp:</strong> {selectedInvoice.className}
                            </div>
                            <div>
                              <strong>Số tiền:</strong>{" "}
                              {selectedInvoice.amountDue.toLocaleString(
                                "vi-VN",
                              )}{" "}
                              đ
                            </div>
                            <div>
                              <strong>Trạng thái:</strong>{" "}
                              {selectedInvoice.status}
                            </div>
                          </div>
                        )}
                        <small className="text-muted d-block mt-1">
                          Hiện Backend chỉ cung cấp Invoice ID; HĐ # là mã tham
                          chiếu tạm trên giao diện.
                        </small>
                      </div>
                    )}

                    <div className="col-md-12">
                      <label className="form-label fw-bold">
                        Tiêu đề yêu cầu <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ví dụ: Xin gia hạn đóng học phí tháng 8 cho học sinh Nguyễn Minh An..."
                        value={newRequestForm.title}
                        onChange={(e) =>
                          setNewRequestForm({
                            ...newRequestForm,
                            title: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="col-md-12">
                      <label className="form-label fw-bold">
                        Nội dung chi tiết & Lý do đề xuất
                      </label>
                      <textarea
                        className="form-control"
                        rows={4}
                        required
                        placeholder="Nêu rõ lý do, bằng chứng hoặc căn cứ cần Center Manager phê duyệt..."
                        value={newRequestForm.reason}
                        onChange={(e) =>
                          setNewRequestForm({
                            ...newRequestForm,
                            reason: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowNewModal(false)}
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-4"
                    disabled={creating}
                  >
                    <i className="bi bi-send me-1" />
                    {creating ? "Đang gửi yêu cầu..." : "Gửi yêu cầu phê duyệt"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL (GetById) */}
      {selectedRequest && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-light border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-primary fs-6 font-monospace">
                    {selectedRequest.requestCode ||
                      `AR${selectedRequest.requestId}`}
                  </span>
                  <h5 className="modal-title fw-bold mb-0 text-dark">
                    Chi tiết yêu cầu phê duyệt
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedRequest(null)}
                />
              </div>

              <div className="modal-body p-4">
                {loadingDetail ? (
                  <div className="text-center py-4 text-muted">
                    <div
                      className="spinner-border spinner-border-sm text-primary me-2"
                      role="status"
                    />
                    Đang tải chi tiết yêu cầu...
                  </div>
                ) : (
                  <>
                    <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom">
                      <div>
                        <h5 className="fw-bold mb-1">
                          {selectedRequest.title}
                        </h5>
                        <div className="d-flex align-items-center gap-3 text-muted small">
                          <span>
                            <i className="bi bi-tag me-1" />
                            {selectedRequest.requestType}
                          </span>
                          <span>
                            <i className="bi bi-clock me-1" />
                            {selectedRequest.createdAt
                              ? new Date(
                                  selectedRequest.createdAt,
                                ).toLocaleString("vi-VN")
                              : "—"}
                          </span>
                          <span>
                            <i className="bi bi-person me-1" />
                            Người gửi:{" "}
                            <strong>
                              {selectedRequest.requesterName || "Admin Staff"}
                            </strong>
                          </span>
                        </div>
                      </div>
                      <div className="d-flex flex-column align-items-end gap-1">
                        <DotStatusBadge
                          status={selectedRequest.status || "Pending"}
                        />
                        <StatusBadge
                          status={selectedRequest.priority || "Medium"}
                        />
                      </div>
                    </div>

                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3">
                          <small className="text-muted d-block mb-1">
                            Học sinh / Đối tượng áp dụng
                          </small>
                          <div className="fw-bold text-dark">
                            {selectedRequest.studentName || "Không xác định"}
                          </div>
                          {selectedRequest.className && (
                            <small className="text-muted">
                              Lớp: {selectedRequest.className}
                            </small>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3">
                          <small className="text-muted d-block mb-1">
                            Người phê duyệt (Center Manager)
                          </small>
                          <div className="fw-bold text-dark">
                            {selectedRequest.reviewerName ||
                              (selectedRequest.status?.toLowerCase() ===
                              "pending"
                                ? "Đang chờ duyệt"
                                : "Chưa có thông tin người duyệt")}
                          </div>
                          {selectedRequest.reviewedAt && (
                            <small className="text-muted">
                              Thời gian:{" "}
                              {new Date(
                                selectedRequest.reviewedAt,
                              ).toLocaleDateString("vi-VN")}
                            </small>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h6 className="fw-bold text-dark mb-2">
                        Nội dung chi tiết & Căn cứ đề xuất:
                      </h6>
                      <div
                        className="p-3 bg-light rounded border text-secondary"
                        style={{ whiteSpace: "pre-line", minHeight: "80px" }}
                      >
                        {selectedRequest.description ||
                          selectedRequest.reason ||
                          "Không có ghi chú thêm."}
                      </div>
                    </div>

                    {selectedRequest.reviewNotes && (
                      <div className="mb-3">
                        <h6 className="fw-bold text-dark mb-2">
                          Phản hồi từ Center Manager:
                        </h6>
                        <div
                          className="p-3 bg-warning-subtle text-dark rounded border border-warning"
                          style={{ whiteSpace: "pre-line" }}
                        >
                          <i className="bi bi-chat-left-quote-fill me-2 text-warning" />
                          {selectedRequest.reviewNotes}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="modal-footer bg-light">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedRequest(null)}
                >
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
