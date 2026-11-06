import { useState, useEffect, useMemo } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import DotStatusBadge from "../../../components/Common/DotStatusBadge";
import SubjectBadge from "../../../components/Common/SubjectBadge";
import Pagination from "../../../components/Common/Pagination";
import TableToolbar from "../../../components/Common/TableToolbar";
import UserAvatar from "../../../components/Common/UserAvatar";
import TuitionOverview from "../../../components/Common/TuitionOverview";
import tuitionDAL from "../../../../DAL/tuitionDAL";
import managementDAL from "../../../../DAL/managementDAL";
import userDAL from "../../../../DAL/userDAL";
import classDAL from "../../../../DAL/classDAL";
import { defaultTuitionDueDate } from "../../../../BLL/services/tuitionPolicyService";
import { useTuitionData } from "../../../hooks/useTuitionData";
import { calculateTuitionMetrics, invoiceTotal, matchesTuitionStatus } from "../../../../BLL/services/tuitionMetricsService";
import type { UserDto } from "../../../../BLL/models/UserDto";
import type { ClassDto } from "../../../../BLL/models/ClassDto";
import type { TuitionDto } from "../../../../BLL/models/TuitionDto";

export default function AdminStaffTuitionPage() {
  const { rows: tuitions, payments, now, collectionLabel, invoiceReady, balanceReady, loading, error: loadError, refresh, upsertInvoice } = useTuitionData();

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);

  // Modals
  const [selectedTuition, setSelectedTuition] = useState<TuitionDto | null>(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [lookupsLoading, setLookupsLoading] = useState(false);
  const [students, setStudents] = useState<UserDto[]>([]);
  const [classes, setClasses] = useState<ClassDto[]>([]);

  // Form: only IDs fetched from Backend are submitted (never a typed mock name).
  const [genStudentId, setGenStudentId] = useState("");
  const [genClassId, setGenClassId] = useState("");
  const [genAmount, setGenAmount] = useState("");
  const [genDueDate, setGenDueDate] = useState(() => defaultTuitionDueDate());

  useEffect(() => {
    if (!isGenerateModalOpen) return;
    setGenDueDate(defaultTuitionDueDate());
    let active = true;
    async function loadInvoiceReferences() {
      setLookupsLoading(true);
      setGenerateError(null);
      try {
        const [users, classes] = await Promise.all([
          userDAL.getAllUsers(),
          classDAL.getAllClasses(),
        ]);
        if (!active) return;
        setStudents(users.data.filter(user =>
          user.roles?.some(role => role.toLowerCase() === "student") &&
          user.status.toLowerCase() === "active"
        ));
        setClasses(classes.data);
      } catch (error) {
        if (active) {
          setStudents([]);
          setClasses([]);
          setGenerateError(error instanceof Error ? error.message : "Unable to load students/classes from Backend.");
        }
      } finally {
        if (active) setLookupsLoading(false);
      }
    }
    void loadInvoiceReferences();
    return () => { active = false; };
  }, [isGenerateModalOpen]);

  // Filter
  const filteredTuitions = useMemo(() => {
    return tuitions.filter((t) => {
      const matchSearch =
        searchTerm === "" ||
        (t.studentName && t.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.invoiceCode && t.invoiceCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.className && t.className.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = matchesTuitionStatus(t, selectedStatus);

      return matchSearch && matchStatus;
    });
  }, [tuitions, searchTerm, selectedStatus]);

  // Pagination
  const totalItems = filteredTuitions.length;
  const totalPages = Math.ceil(totalItems / entriesPerPage) || 1;
  const paginatedTuitions = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredTuitions.slice(start, start + entriesPerPage);
  }, [filteredTuitions, currentPage, entriesPerPage]);

  const metrics = useMemo(() => balanceReady ? calculateTuitionMetrics(filteredTuitions, payments.data!, now) : null, [filteredTuitions, payments.data, balanceReady, now]);
  const totalDue = invoiceReady ? invoiceTotal(filteredTuitions) : null;

  // View Receipt (GetById)
  const handleViewReceipt = async (tuitionId: number) => {
    try {
      const detail = await tuitionDAL.getTuitionById(tuitionId);
      setSelectedTuition(detail);
    } catch (err) {
      console.warn("Lỗi nạp chi tiết phiếu thu:", err);
    }
  };

  // Submit to MySQL via POST /api/tuitioninvoices.
  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const studentId = Number(genStudentId);
    const classId = Number(genClassId);
    const amountDue = Number(genAmount);
    if (!students.some(s => s.userId === studentId) ||
        !classes.some(c => c.classId === classId)) {
      setGenerateError("Select a valid student and class from Backend.");
      return;
    }
    if (!Number.isSafeInteger(amountDue) || amountDue <= 0) {
      setGenerateError("Invoice amount must be a positive integer (VND).");
      return;
    }
    setSubmitting(true);
    setGenerateError(null);
    try {
      const now = new Date();
      const result = await managementDAL.createTuitionInvoice({
        studentId, classId,
        periodMonth: now.getMonth() + 1,
        periodYear: now.getFullYear(),
        amountDue,
      });
      // Only show a server-confirmed invoice. Never invent an ID on Frontend.
      upsertInvoice(result.data);
      setIsGenerateModalOpen(false);
      setGenStudentId("");
      setGenClassId("");
      setGenAmount("");
      setActionSuccessMsg(`Invoice #${result.data.invoiceId} saved successfully.`);
      await refresh();
    } catch (error) {
      setGenerateError(error instanceof Error ? error.message : "Could not create invoice.");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <>
      {/* Breadcrumb and Quick Access */}
      <PageHeader
        title="Quản Lý Học Phí &amp; Công Nợ (Tuition Management)"
        breadcrumbItems={[
          { label: "Admin Staff", path: "/admin-staff" },
          { label: "Tuition Management" },
        ]}
        action={
          <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
            <button
              type="button"
              className="btn btn-primary d-flex align-items-center gap-2"
              onClick={() => { setGenerateError(null); setIsGenerateModalOpen(true); }}
            >
              <i className="bi bi-file-earmark-plus-fill" />
              Lập phiếu thu học phí mới
            </button>
          </div>
        }
      />

      {loading && (
        <div className="alert alert-info py-2 px-3 mb-3 d-flex align-items-center gap-2">
          <div className="spinner-border spinner-border-sm" role="status" />
          <span>Đang nạp dữ liệu hóa đơn và đối soát thu chi...</span>
        </div>
      )}

      {actionSuccessMsg && (
        <div className="alert alert-success alert-dismissible fade show py-2 px-3 mb-3" role="alert">
          <i className="bi bi-check-circle-fill me-2" />
          {actionSuccessMsg}
          <button type="button" className="btn-close" onClick={() => setActionSuccessMsg(null)} />
        </div>
      )}

      {loadError && (
        <div className="alert alert-danger mb-3" role="alert">{loadError}</div>
      )}

      <TuitionOverview
        totalDue={totalDue}
        collected={metrics?.monthlyCollected ?? null}
        collectionLabel={collectionLabel}
        collectionError={metrics?.monthlyCollectionError}
        outstanding={metrics?.outstanding ?? null}
        overdueAmount={metrics?.overdueAmount ?? null}
        overdueCount={metrics?.overdueCount ?? null}
        filtered={searchTerm.trim() !== "" || selectedStatus !== "All"}
      />

      {/* Tuition List */}
      <div className="card user-list-card border-0 mb-4">
        {/* Filter */}
        <div className="card-header user-list-header">
          <div className="row g-3 align-items-center">
            {/* Search */}
            <div className="col-xl-5 col-lg-6">
              <div className="user-search">
                <i className="bi bi-search" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm theo mã hóa đơn, tên học viên hoặc lớp học..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
            {/* Status */}
            <div className="col-xl-3 col-lg-3 col-md-6">
              <select
                className="form-select"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">Tất cả trạng thái thanh toán</option>
                <option value="paid">Đã thanh toán (Paid)</option>
                <option value="unpaid">Chưa thanh toán (Unpaid)</option>
                <option value="pending_adjustment">Chờ điều chỉnh (Pending adjustment)</option>
                <option value="overdue">Quá hạn (Overdue)</option>
              </select>
            </div>
            <div className="col-xl-4 col-lg-3 col-md-6 d-flex justify-content-end">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedStatus("All");
                  setCurrentPage(1);
                }}
              >
                <i className="bi bi-arrow-clockwise" /> Đặt lại bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Table Controls */}
        <TableToolbar
          totalItems={totalItems}
          totalLabel="Tổng số phiếu thu"
          entriesPerPage={entriesPerPage}
          onEntriesPerPageChange={(value) => {
            setEntriesPerPage(value);
            setCurrentPage(1);
          }}
        />

        {/* Tuition Table */}
        <div className="table-responsive">
          <table className="table user-table align-middle mb-0">
            <thead>
              <tr>
                <th className="fw-bold">Mã Hóa Đơn</th>
                <th className="fw-bold">Học Viên Thanh Toán</th>
                <th className="fw-bold">Khóa Học / Lớp</th>
                <th className="fw-bold">Số Tiền (VND)</th>
                <th className="fw-bold">Hạn Nộp Phí</th>
                <th className="fw-bold">Trạng Thái</th>
                <th className="text-center fw-bold">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTuitions.length > 0 ? (
                paginatedTuitions.map((t) => {
                  const statusFormatted =
                    t.status.toLowerCase() === "paid"
                      ? "Paid"
                      : t.status.toLowerCase() === "overdue"
                      ? "Overdue"
                      : t.status.toLowerCase() === "unpaid" ? "Unpaid" : t.status;
                  const dueDateStr = t.dueDate ? new Date(t.dueDate).toLocaleDateString("vi-VN") : "-";
                  const amountStr = `${(t.amount ?? t.amountDue).toLocaleString("vi-VN")} VND`;

                  return (
                    <tr key={t.tuitionId}>
                      <td>
                        <strong className="text-primary">{t.invoiceCode || `#INV${t.tuitionId}`}</strong>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <UserAvatar name={t.studentName || "Học viên"} />
                          <div>
                            <div className="fw-bold text-dark">{t.studentName || `Học viên #${t.studentId}`}</div>
                            <small className="text-muted">ID: #{t.studentId}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <SubjectBadge subject={t.className || "-"} />
                      </td>
                      <td>
                        <strong className="text-dark">{amountStr}</strong>
                      </td>
                      <td>
                        <span className="small text-muted">{dueDateStr}</span>
                      </td>
                      <td>
                        <DotStatusBadge status={statusFormatted} />
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                          onClick={() => handleViewReceipt(t.tuitionId || t.invoiceId || 0)}
                        >
                          <i className="bi bi-receipt" /> Biên lai
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-muted">
                    Không có phiếu thu nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="card-footer bg-white border-top py-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <small className="text-muted">
            Hiển thị {paginatedTuitions.length} trên tổng {totalItems} hóa đơn
          </small>
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            entriesPerPage={entriesPerPage}
            itemLabel="invoices"
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>

      {/* DETAIL MODAL: BIÊN LAI HỌC PHÍ (GetById) */}
      {selectedTuition && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0">
              <div className="modal-header bg-light">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <i className="bi bi-receipt text-primary" />
                  Biên Lai Thu Học Phí: {selectedTuition.invoiceCode || `#INV${selectedTuition.tuitionId}`}
                </h5>
                <button type="button" className="btn-close" onClick={() => setSelectedTuition(null)} />
              </div>
              <div className="modal-body p-4">
                <div className="p-3 bg-light rounded border mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted small">Học viên</span>
                    <strong className="text-dark">{selectedTuition.studentName || `Học viên #${selectedTuition.studentId}`}</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted small">Lớp học</span>
                    <span className="badge bg-primary bg-opacity-10 text-primary">{selectedTuition.className}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted small">Hạn thanh toán</span>
                    <span>{selectedTuition.dueDate ? new Date(selectedTuition.dueDate).toLocaleDateString("vi-VN") : "-"}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center border-top pt-2">
                    <span className="text-muted small">Trạng thái</span>
                    <DotStatusBadge status={selectedTuition.status} />
                  </div>
                </div>
                <div className="text-center p-3 bg-success bg-opacity-10 rounded">
                  <small className="text-muted d-block">SỐ TIỀN THANH TOÁN</small>
                  <h3 className="fw-bold text-success mb-0">
                    {(selectedTuition.amount ?? selectedTuition.amountDue).toLocaleString("vi-VN") + " VND"}
                  </h3>
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedTuition(null)}>
                  Đóng
                </button>
                <button type="button" className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1" onClick={() => window.print()}>
                  <i className="bi bi-printer" /> In phiếu thu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL: LẬP HÓA ĐƠN MỚI */}
      {isGenerateModalOpen && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <i className="bi bi-cash-stack" />
                  Lập Phiếu Thu Học Phí
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setIsGenerateModalOpen(false)}
                />
              </div>
              <form onSubmit={handleGenerateSubmit}>
                <div className="modal-body p-4">
                  {lookupsLoading && <div className="alert alert-info">Loading students and classes from Backend...</div>}
                  {generateError && <div className="alert alert-danger" role="alert">{generateError}</div>}
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Student *</label>
                    <select className="form-select" required value={genStudentId}
                      onChange={e => setGenStudentId(e.target.value)} disabled={lookupsLoading}>
                      <option value="">Choose student...</option>
                      {students.map(student => (
                        <option key={student.userId} value={student.userId}>
                          {student.fullName} ({student.userCode})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Class *</label>
                    <select className="form-select" required value={genClassId}
                      onChange={e => {
                        setGenClassId(e.target.value);
                        const selected = classes.find(c => c.classId === Number(e.target.value));
                        if (selected) setGenAmount(String(selected.tuitionFee));
                      }} disabled={lookupsLoading}>
                      <option value="">Choose class...</option>
                      {classes.map(cls => (
                        <option key={cls.classId} value={cls.classId}>
                          {cls.className}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Invoice amount (VND) *</label>
                    <input type="number" className="form-control" min="1" step="1" required
                      value={genAmount} onChange={e => setGenAmount(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Due date</label>
                    <input type="date" className="form-control" readOnly value={genDueDate} />
                    <small className="text-muted">Một tháng kể từ ngày tạo; được thanh toán hết ngày đến hạn. Hạn chính thức được xác định khi lưu.</small>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary btn-sm"
                    onClick={() => setIsGenerateModalOpen(false)} disabled={submitting}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm"
                    disabled={submitting || lookupsLoading || students.length === 0 || classes.length === 0}>
                    {submitting ? "Saving..." : "Create invoice"}
                  </button>
                </div>              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
