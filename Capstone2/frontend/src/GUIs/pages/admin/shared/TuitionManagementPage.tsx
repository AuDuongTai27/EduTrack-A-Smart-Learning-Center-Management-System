import { useState, useEffect, useMemo, useRef } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import DotStatusBadge from "../../../components/Common/DotStatusBadge";
import SubjectBadge from "../../../components/Common/SubjectBadge";
import Pagination from "../../../components/Common/Pagination";
import TableToolbar from "../../../components/Common/TableToolbar";
import UserAvatar from "../../../components/Common/UserAvatar";
import TuitionOverview from "../../../components/Common/TuitionOverview";
import MoneyInput from "../../../components/Common/MoneyInput";
import tuitionDAL from "../../../../DAL/tuitionDAL";
import managementDAL from "../../../../DAL/managementDAL";
import GenerateTuitionModal from "../../../components/management/GenerateTuitionModal";
import { useStudentGrades } from "../../../hooks/useStudentGrades";
import { filterTuitionInvoices } from "../../../../BLL/services/tuitionFilterService";
import classDAL from "../../../../DAL/classDAL";
import { useTuitionData } from "../../../hooks/useTuitionData";
import { calculateTuitionMetrics, invoiceTotal, invoicePeriodLabel, withInvoiceBalances, paymentInstant } from "../../../../BLL/services/tuitionMetricsService";
import { tuitionActions } from "../../../../BLL/services/tuitionActionService";
import { formatVND } from "../../../utils/formatCurrency";

import type { ClassDto } from "../../../../BLL/models/ClassDto";
import type { TuitionDto, PaymentDto } from "../../../../BLL/models/TuitionDto";

function receiptDateLabel(paidAt: string) {
  try { return paymentInstant(paidAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }); }
  catch { return "Ngày thanh toán cần đối soát"; }
}

export default function TuitionManagementPage({ role }: { role: "center-manager" | "admin-staff" }) {
  const roleLabel = role === "center-manager" ? "Center Manager" : "Admin Staff";
  const catalogue = useStudentGrades();
  const [selectedGrade, setSelectedGrade] = useState("All");
  const [periodMonth, setPeriodMonth] = useState("");
  const [periodYear, setPeriodYear] = useState("");
  const [lookupRevision, setLookupRevision] = useState(0);
  const [editError, setEditError] = useState<string | null>(null);
  const [editBusy, setEditBusy] = useState(false);
  const [externalVerified, setExternalVerified] = useState(false);
  const { rows: tuitions, payments, now, collectionLabel, invoiceReady, paymentReady, balanceReady, loading, error: paymentDataWarning, refresh, upsertInvoice } = useTuitionData();
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [classes, setClasses] = useState<ClassDto[]>([]);

  // Filters state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedSort, setSelectedSort] = useState<string>("newest");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);

  // Detail Modal state (GetById)
  const [selectedTuition, setSelectedTuition] = useState<TuitionDto | null>(
    null,
  );
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [detailPayments, setDetailPayments] = useState<PaymentDto[] | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const detailRequest = useRef(0);
  const closeDetail = () => { detailRequest.current++; setSelectedTuition(null); setLoadingDetail(false); };

  // Generate Tuition Modal state
  const [showGenerateModal, setShowGenerateModal] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [payingTuition, setPayingTuition] = useState<TuitionDto | null>(null);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentNeedsReview, setPaymentNeedsReview] = useState(false);
  const paymentSubmission = useRef(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentMethod: "cash",
    transactionCode: "",
    note: "",
    additionalChargeNote: "",
  });
  const [editingTuition, setEditingTuition] = useState<TuitionDto | null>(null);

  const [editForm, setEditForm] = useState({
    periodMonth: new Date().getMonth() + 1,
    periodYear: new Date().getFullYear(),
    amountDue: "",
    dueDate: "",
  });

  const paymentAmount = Number(paymentForm.amount);
  const actionsFor = (invoice: TuitionDto) => tuitionActions(invoice, balanceReady && !paymentDataWarning,
    !!payments.data?.some(payment => payment.invoiceId === invoice.invoiceId));
  const currentEdit = editingTuition && (tuitions.find(t => t.invoiceId === editingTuition.invoiceId) ?? editingTuition);
  const editAllowed = !!currentEdit && actionsFor(currentEdit).canEdit;

  useEffect(() => {
    let active = true;
    classDAL.getAllClasses().then(classRes => {
      if (active) {
        setClasses(classRes.data); setLookupError(null);
        setSelectedClass(previous => previous === "All" || selectedGrade === "All" || classRes.data.some(c => String(c.classId) === previous && String(c.gradeId) === selectedGrade) ? previous : "All");
      }
    }).catch(cause => { if (active) setLookupError(cause instanceof Error ? cause.message : "Không tải được lớp học."); });
    const focus = () => setLookupRevision(value => value + 1);
    window.addEventListener("focus", focus);
    return () => { active = false; window.removeEventListener("focus", focus); };
  }, [lookupRevision, selectedGrade]);

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingTuition || editBusy) return;
    if (!editAllowed) { setEditError("Hóa đơn đã có khoản thu hoặc đang chờ điều chỉnh; không sửa trực tiếp các trường tài chính. Tải lại để đối soát."); return; }
    setEditBusy(true); setEditError(null);

    try {
      const res = await managementDAL.updateTuitionInvoice(
        editingTuition.invoiceId,
        {
          periodMonth: editForm.periodMonth,
          periodYear: editForm.periodYear,
          amountDue: Number(editForm.amountDue),
          dueDate: editForm.dueDate,
        },
      );

      upsertInvoice(res.data);

      await refresh();

      setEditingTuition(null);

      setActionSuccessMsg(
        `Đã cập nhật hóa đơn #${res.data.invoiceId} thành công!`,
      );

      setTimeout(() => setActionSuccessMsg(null), 3500);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Không cập nhật được hóa đơn.");
    } finally {
      setEditBusy(false);
    }
  };

  const handleOpenEdit = (tuition: TuitionDto) => {
    if (!actionsFor(tuition).canEdit) return;

    setEditingTuition(tuition);
    setEditError(null);

    setEditForm({
      periodMonth: tuition.periodMonth ?? new Date().getMonth() + 1,
      periodYear: tuition.periodYear ?? new Date().getFullYear(),
      amountDue: String(tuition.amountDue || tuition.amount || 0),
      dueDate: tuition.dueDate ? tuition.dueDate.split("T")[0] : "",
    });
  };

  // Record Payment: không tự tạo payment giả nếu API thất bại.
  const handleOpenPayment = (tuition: TuitionDto) => {
    const remaining = actionsFor(tuition).remaining ?? 0;
    // Không mở phiếu thu với dữ liệu giả hoặc chưa tải được công nợ thực.
    if (!actionsFor(tuition).canPay || !tuition.invoiceId) return;

    setPayingTuition(tuition);
    setPaymentNeedsReview(false);
    setExternalVerified(false);
    setPaymentForm({
      amount: String(remaining),
      paymentMethod: "cash",
      transactionCode: "",
      note: "",
      additionalChargeNote: "",
    });
    setPaymentError(null);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingTuition || paymentSubmitting || paymentNeedsReview || paymentSubmission.current) return;
    const current = tuitions.find(t => t.invoiceId === payingTuition.invoiceId) ?? payingTuition;
    if (!actionsFor(current).canPay) { setPaymentNeedsReview(true); setPaymentError("Hóa đơn không còn dư nợ hợp lệ hoặc dữ liệu thanh toán chưa sẵn sàng; cần tải lại để đối soát, không thu thêm phụ phí vào hóa đơn đã tất toán."); return; }

    const remaining = actionsFor(current).remaining!;
    const amount = Number(paymentForm.amount);

    if (!Number.isSafeInteger(amount) || amount <= 0) {
      setPaymentError("Số tiền thanh toán phải là số nguyên VND lớn hơn 0.");
      return;
    }

    // Phần vượt công nợ được ghi riêng thành phí bổ sung (không phải trả dư học phí).
    const additionalChargeAmount = Math.max(0, amount - remaining);
    if (
      additionalChargeAmount > 0 &&
      !paymentForm.additionalChargeNote.trim()
    ) {
      setPaymentError(
        "Vui lòng ghi rõ lý do thu thêm (ví dụ: phí tài liệu) trước khi xác nhận.",
      );
      return;
    }

    if (paymentForm.paymentMethod !== "cash" && (!externalVerified || !paymentForm.transactionCode.trim())) {
      setPaymentError("Cần mã giao dịch và xác nhận đã đối soát thanh toán bên ngoài; không tự đánh dấu giao dịch online thành công."); return;
    }
    paymentSubmission.current = true;
    setPaymentSubmitting(true);
    setPaymentError(null);
    try {
      await managementDAL.recordTuitionPayment(payingTuition.invoiceId, {
        amount,
        paymentMethod: paymentForm.paymentMethod,
        externalPaymentVerified: externalVerified,
        transactionCode: paymentForm.transactionCode.trim() || undefined,
        note: paymentForm.note.trim() || undefined,
        additionalChargeAmount,
        additionalChargeNote:
          paymentForm.additionalChargeNote.trim() || undefined,
        // PaidByUserId và RecordedBy có thể bỏ trống theo DTO backend.
        // Khi tích hợp đăng nhập, lấy recordedBy từ user đã xác thực.
      });

      const invoiceId = payingTuition.invoiceId;
      setPayingTuition(null);
      setActionSuccessMsg(
        `Đã ghi nhận thanh toán ${amount.toLocaleString("vi-VN")} VND cho hóa đơn #${invoiceId}.`,
      );

      await refresh();
    } catch (error) {
      console.error("Lỗi ghi nhận thanh toán:", error);
      setPaymentNeedsReview(true);
      setPaymentError(
        error instanceof Error
          ? error.message
          : "Không ghi nhận được thanh toán.",
      );
    } finally {
      paymentSubmission.current = false;
      setPaymentSubmitting(false);
    }
  };

  // Filter & Search logic
  const filteredTuitions = useMemo(() => {
    return filterTuitionInvoices(tuitions, classes, { grade: selectedGrade, classId: selectedClass, month: periodMonth, year: periodYear, search: searchTerm, status: selectedStatus })
      .sort((a, b) => {
        if (selectedSort === "newest") {
          return (
            new Date(b.dueDate || 0).getTime() -
            new Date(a.dueDate || 0).getTime()
          );
        }
        if (selectedSort === "oldest") {
          return (
            new Date(a.dueDate || 0).getTime() -
            new Date(b.dueDate || 0).getTime()
          );
        }
        if (selectedSort === "az") {
          return a.studentName.localeCompare(b.studentName);
        }
        if (selectedSort === "za") {
          return b.studentName.localeCompare(a.studentName);
        }
        return 0;
      });
  }, [tuitions, classes, selectedGrade, periodMonth, periodYear, searchTerm, selectedClass, selectedStatus, selectedSort]);

  const metrics = useMemo(() => balanceReady ? calculateTuitionMetrics(filteredTuitions, payments.data!, now) : null, [filteredTuitions, payments.data, balanceReady, now]);
  const invoiceScopeReady = invoiceReady && (selectedStatus === "All" || paymentReady) && (selectedGrade === "All" || !lookupError);

  // Paginated list
  const paginatedTuitions = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredTuitions.slice(start, start + entriesPerPage);
  }, [filteredTuitions, currentPage, entriesPerPage]);

  // Handle View Details (GetById)
  const handleViewDetails = async (t: TuitionDto) => {
    const targetId = t.tuitionId || t.invoiceId;
    if (!targetId) return;
    const request = ++detailRequest.current;
    setLoadingDetail(true);
    setSelectedTuition({ ...t, paidAmount: undefined }); setDetailPayments(null); setDetailError(null);
    try {
      const [detail, receipts] = await Promise.all([tuitionDAL.getTuitionById(targetId), tuitionDAL.getAllPayments()]);
      if (request !== detailRequest.current) return;
      if (!detail) throw new Error("Không tải được hóa đơn để đối soát.");
      setSelectedTuition(withInvoiceBalances([detail], receipts.data, new Date())[0]);
      setDetailPayments(receipts.data.filter(payment => payment.invoiceId === targetId));
    } catch (cause) {
      if (request === detailRequest.current) setDetailError(cause instanceof Error ? cause.message : "Không tải được dữ liệu thanh toán; không giả định đã thu bằng 0.");
    } finally {
      if (request === detailRequest.current) setLoadingDetail(false);
    }
  };

  return (
    <>
      {/* Breadcrumb and Quick Access */}
      <PageHeader
        title="Tuition Management"
        breadcrumbItems={[
          { label: roleLabel, path: `/${role}` },
          { label: "Tuition Management" },
        ]}
        action={
          <button
            type="button"
            className="btn btn-primary d-flex align-items-center shadow-sm"
            onClick={() => {
              setShowGenerateModal(true);
            }}
          >
            <i className="bi bi-plus-square me-2" />
            Lập hóa đơn
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

      {lookupError && <div className="alert alert-warning mb-3" role="alert">{lookupError} <button type="button" className="btn btn-link" onClick={() => setLookupRevision(v => v + 1)}>Tải lại Class</button></div>}
      {catalogue.error && <div className="alert alert-warning" role="alert">{catalogue.error} <button type="button" className="btn btn-link" onClick={catalogue.refresh}>Tải lại Grade</button></div>}
      {paymentDataWarning && (
        <div className="alert alert-warning" role="alert">
          <i className="bi bi-exclamation-triangle me-2" />
          {paymentDataWarning}
        </div>
      )}

      <TuitionOverview
        totalDue={invoiceScopeReady ? invoiceTotal(filteredTuitions) : null}
        collected={metrics?.monthlyCollected ?? null}
        collectionLabel={collectionLabel}
        collectionError={metrics?.monthlyCollectionError}
        outstanding={metrics?.outstanding ?? null}
        overdueAmount={metrics?.overdueAmount ?? null}
        overdueCount={metrics?.overdueCount ?? null}
        filtered={searchTerm.trim() !== "" || selectedGrade !== "All" || !!periodMonth || !!periodYear || selectedClass !== "All" || selectedStatus !== "All"}
      />

      {/* Tuition List */}
      <div className="card user-list-card border-0 shadow-sm">
        {/* Filter */}
        <div className="card-header user-list-header bg-white py-3 border-bottom">
          <div className="row g-3 align-items-center">
            <div className="col-md-4"><label className="form-label" htmlFor="tuition-grade-filter">Grade của Class</label><select id="tuition-grade-filter" className="form-select" value={selectedGrade} disabled={catalogue.loading} onChange={e => { setSelectedGrade(e.target.value); setSelectedClass("All"); setCurrentPage(1); }}><option value="All">All Grades</option>{catalogue.grades.map(g => <option key={g.gradeId} value={g.gradeId}>{g.gradeName}</option>)}</select></div>
            <div className="col-md-4"><label className="form-label" htmlFor="tuition-month-filter">Kỳ thu - Tháng</label><select id="tuition-month-filter" className="form-select" value={periodMonth} onChange={e => { setPeriodMonth(e.target.value); setCurrentPage(1); }}><option value="">Tất cả tháng</option>{Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}</select></div>
            <div className="col-md-4"><label className="form-label" htmlFor="tuition-year-filter">Kỳ thu - Năm</label><input id="tuition-year-filter" type="text" inputMode="numeric" className="form-control" placeholder="Tất cả năm" value={periodYear} onChange={e => { setPeriodYear(e.target.value); setCurrentPage(1); }} /></div>
            <div className="col-xl-4 col-lg-6">
              <div className="user-search position-relative">
                <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                <input
                  type="text"
                  className="form-control ps-5"
                  placeholder="Search by student, class, invoice code..."
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
                aria-label="Lọc Class"
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Classes</option>
                {classes.filter(c => selectedGrade === "All" || String(c.gradeId) === selectedGrade).map(cls => <option key={cls.classId} value={String(cls.classId)}>{cls.className}</option>)}
              </select>
            </div>
            <div className="col-xl-2 col-lg-3 col-md-6">
              <select
                className="form-select"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Overdue">Overdue</option>
                <option value="pending_adjustment">Pending adjustment</option>
              </select>
            </div>
            <div className="col-xl-3 col-lg-3 col-md-6">
              <select
                className="form-select"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
              >
                <option value="newest">Due Date: Newest First</option>
                <option value="oldest">Due Date: Oldest First</option>
                <option value="az">Student Name: A-Z</option>
                <option value="za">Student Name: Z-A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Controls */}
        <TableToolbar
          totalItems={filteredTuitions.length}
          totalLabel="Total records"
          entriesPerPage={entriesPerPage}
          onEntriesPerPageChange={(value) => {
            setEntriesPerPage(value);
            setCurrentPage(1);
          }}
        />

        {/* Tuition Table */}
        <div className="table-responsive">
          <table className="table user-table align-middle mb-0 table-hover">
            <thead className="table-light">
              <tr>
                <th className="fw-bold">No.</th>
                <th className="fw-bold">Invoice Code</th>
                <th className="fw-bold">Student Name</th>
                <th className="fw-bold">Class</th>
                <th className="fw-bold">Amount Due</th>
                <th className="fw-bold">Due Date</th>
                <th className="fw-bold">Status</th>
                <th className="text-center fw-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">
                    <div
                      className="spinner-border spinner-border-sm text-primary me-2"
                      role="status"
                    />
                    Đang nạp danh sách học phí...
                  </td>
                </tr>
              ) : paginatedTuitions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">
                    <i className="bi bi-cash fs-2 d-block mb-2 text-secondary" />
                    Không tìm thấy bản ghi học phí nào phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedTuitions.map((t, idx) => {
                  const actions = actionsFor(t);
                  const itemIndex =
                    (currentPage - 1) * entriesPerPage + idx + 1;
                  const dueDateStr = t.dueDate
                    ? new Date(t.dueDate).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "—";

                  return (
                    <tr key={t.tuitionId || t.invoiceId || idx}>
                      <td>{itemIndex}</td>
                      <td>
                        <strong className="text-primary font-monospace">
                          {t.invoiceCode || `INV-${t.invoiceId}`}
                        </strong>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <UserAvatar name={t.studentName || "Học viên"} />
                          <div>
                            <h6 className="mb-0 fw-bold text-dark">
                              {t.studentName}
                            </h6>
                            <small className="text-muted">
                              {t.studentCode || `STU${t.studentId}`}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <SubjectBadge subject={t.className || "Class"} />
                      </td>
                      <td>
                        <strong className="text-dark">
                          {(t.amount || t.amountDue || 0).toLocaleString(
                            "vi-VN",
                          )}{" "}
                          VND
                        </strong>
                        {balanceReady && <div className="small text-muted">Đã thu: {formatVND(t.paidAmount)} · Còn: {formatVND(actions.remaining)}</div>}
                      </td>
                      <td>{dueDateStr}</td>
                      <td>
                        <DotStatusBadge status={t.status || "Unpaid"} />
                        {actions.partiallyPaid && <small className="d-block text-muted">Thanh toán một phần</small>}
                      </td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          {actions.canEdit && <button
                            type="button"
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => handleOpenEdit(t)}
                            title="Chỉnh sửa hóa đơn"
                          >
                            <i className="bi bi-pencil-square me-1" />
                            Sửa
                          </button>}

                          {actions.canPay && <button
                            type="button"
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleOpenPayment(t)}
                            disabled={!balanceReady || !t.invoiceId}
                            title={
                              paymentDataWarning
                                ? "Chưa tải được dữ liệu thật: kiểm tra kết nối backend"
                                : "Ghi nhận thanh toán"
                            }
                          >
                            <i className="bi bi-cash-coin me-1" />
                            Thanh toán
                          </button>}

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleViewDetails(t)}
                            title="Xem hóa đơn"
                          >
                            <i className="bi bi-receipt me-1" />
                            Xem hóa đơn
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 border-top bg-white">
          <Pagination
            currentPage={currentPage}
            totalItems={filteredTuitions.length}
            entriesPerPage={entriesPerPage}
            itemLabel="records"
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {showGenerateModal && <GenerateTuitionModal close={() => setShowGenerateModal(false)} saved={() => { void refresh(); }} />}

      {/* EDIT TUITION MODAL */}
      {editingTuition && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-warning">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-pencil-square me-2" />
                  Chỉnh sửa hóa đơn #{editingTuition.invoiceId}
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditingTuition(null)}
                />
              </div>

              <form onSubmit={handleUpdateSubmit}>
                {editError && <div className="alert alert-danger m-3" role="alert">{editError}</div>}
                <div className="modal-body p-4">
                  {!editAllowed && <div className="alert alert-warning">Không thể sửa trực tiếp khi đã có khoản thu hoặc đang chờ điều chỉnh. Cần đối soát và xử lý theo quy trình phê duyệt hiện có.</div>}
                  <fieldset className="row g-3" disabled={editBusy || !editAllowed}>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Học viên</label>

                      <input
                        type="text"
                        className="form-control"
                        value={editingTuition.studentName}
                        disabled
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold">Lớp</label>

                      <input
                        type="text"
                        className="form-control"
                        value={editingTuition.className}
                        disabled
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label fw-bold">Tháng</label>

                      <input
                        type="number"
                        min={1}
                        max={12}
                        className="form-control"
                        value={editForm.periodMonth}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            periodMonth: Number(e.target.value),
                          })
                        }
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label fw-bold">Năm</label>

                      <input
                        type="number"
                        min={2000}
                        max={2100}
                        className="form-control"
                        value={editForm.periodYear}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            periodYear: Number(e.target.value),
                          })
                        }
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold" htmlFor="manager-edit-amount">
                        Số tiền học phí
                      </label>

                      <MoneyInput
                        id="manager-edit-amount"
                        name="amountDue"
                        value={editForm.amountDue}
                        onValueChange={amountDue => setEditForm({...editForm, amountDue})}
                        placeholder="Nhập số tiền học phí"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        Hạn thanh toán
                      </label>

                      <input
                        type="date"
                        className="form-control"
                        value={editForm.dueDate}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            dueDate: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold">Trạng thái</label>

                      <div data-testid="invoice-edit-status"><DotStatusBadge status={currentEdit?.status || "unpaid"} /></div>
                      <small className="text-muted">Do hệ thống tính từ khoản thu và hạn thanh toán. Không thể chọn trạng thái thủ công.</small>
                    </div>
                  </fieldset>
                </div>

                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setEditingTuition(null)}
                  >
                    Hủy
                  </button>

                  <button type="submit" className="btn btn-warning px-4" disabled={editBusy || !editAllowed}>
                    <i className="bi bi-save me-2" />
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* RECORD PAYMENT MODAL */}
      {payingTuition && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-cash-coin me-2" />
                  Ghi nhận thanh toán – Hóa đơn #{payingTuition.invoiceId}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  disabled={paymentSubmitting}
                  onClick={() => setPayingTuition(null)}
                />
              </div>

              <form onSubmit={handlePaymentSubmit}>
                <p className="small text-muted px-4 pt-3">Ghi nhận thủ công sau khi nhận tiền. Đây không phải xác nhận tự động từ cổng online.</p>
                {paymentForm.paymentMethod !== "cash" && <label className="form-check mx-4"><input className="form-check-input" type="checkbox" checked={externalVerified} onChange={e => setExternalVerified(e.target.checked)} /><span>Đã đối soát và xác nhận nhận tiền từ giao dịch bên ngoài</span></label>}
                <div className="modal-body p-4">
                  <p className="mb-2">
                    <strong>Học viên:</strong> {payingTuition.studentName}
                    {" · "}
                    <strong>Lớp:</strong> {payingTuition.className}
                  </p>
                  <div className="row g-2 mb-3">
                    <div className="col-md-4">
                      <small className="text-muted d-block">Tổng học phí</small>
                      <strong>
                        {(
                          payingTuition.amountDue ??
                          payingTuition.amount ??
                          0
                        ).toLocaleString("vi-VN")}{" "}
                        VND
                      </strong>
                    </div>
                    <div className="col-md-4">
                      <small className="text-muted d-block">Đã đóng</small>
                      <strong className="text-success">
                        {(payingTuition.paidAmount ?? 0).toLocaleString(
                          "vi-VN",
                        )}{" "}
                        VND
                      </strong>
                    </div>
                    <div className="col-md-4">
                      <small className="text-muted d-block">Còn nợ</small>
                      <strong className="text-danger">
                        {Math.max(
                          0,
                          (payingTuition.amountDue ??
                            payingTuition.amount ??
                            0) - (payingTuition.paidAmount ?? 0),
                        ).toLocaleString("vi-VN")}{" "}
                        VND
                      </strong>
                    </div>
                  </div>

                  {paymentError && (
                    <div className="alert alert-danger" role="alert">
                      {paymentError}
                      {paymentNeedsReview && <div className="mt-2">Kết quả có thể chưa được xác nhận. Không gửi lại khoản thu trước khi đối chiếu. <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => { setPayingTuition(null); void refresh(); }}>Đóng và tải lại công nợ/Payments</button></div>}
                    </div>
                  )}
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold" htmlFor="manager-payment-amount">
                        Số tiền thanh toán *
                      </label>
                      <MoneyInput
                        id="manager-payment-amount"
                        name="amount"
                        value={paymentForm.amount}
                        onValueChange={amount => setPaymentForm({...paymentForm, amount})}
                        placeholder="Nhập số tiền thanh toán"
                        required
                      />
                      <small className="text-muted">
                        Mặc định là công nợ còn lại. Bạn có thể sửa số tiền, kể
                        cả trường hợp thu thêm phí tài liệu.
                      </small>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        Phương thức thanh toán *
                      </label>
                      <select
                        className="form-select"
                        value={paymentForm.paymentMethod}
                        onChange={(e) => {
                          setExternalVerified(false);
                          setPaymentForm({ ...paymentForm, paymentMethod: e.target.value, transactionCode: "" });
                        }}
                        required
                      >
                        <option value="cash">Tiền mặt (Cash)</option>
                        <option value="bank_transfer">
                          Chuyển khoản ngân hàng
                        </option>
                        <option value="momo">MoMo</option>
                        <option value="vnpay">VNPay</option>
                      </select>
                    </div>
                    {paymentAmount >
                      Math.max(
                        0,
                        (payingTuition.amountDue ?? payingTuition.amount ?? 0) -
                          (payingTuition.paidAmount ?? 0),
                      ) && (
                      <div className="col-12">
                        <div className="alert alert-info py-2 mb-2">
                          <strong>Phí bổ sung: </strong>
                          {(
                            paymentAmount -
                            Math.max(
                              0,
                              (payingTuition.amountDue ??
                                payingTuition.amount ??
                                0) - (payingTuition.paidAmount ?? 0),
                            )
                          ).toLocaleString("vi-VN")}{" "}
                          VND. Khoản này sẽ được cộng vào tổng phải thu của hóa
                          đơn và lưu kèm lý do thu thêm.
                        </div>
                        <label className="form-label fw-bold">
                          Lý do thu thêm *
                        </label>
                        <input
                          className="form-control"
                          type="text"
                          maxLength={255}
                          placeholder="Ví dụ: Phí tài liệu ôn tập tháng 10"
                          value={paymentForm.additionalChargeNote}
                          onChange={(e) =>
                            setPaymentForm({
                              ...paymentForm,
                              additionalChargeNote: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    )}
                    <div className="col-12">
                      <label className="form-label fw-bold">Mã giao dịch</label>
                      <input
                        type="text"
                        className="form-control"
                        maxLength={100}
                        required={paymentForm.paymentMethod !== "cash"}
                        value={paymentForm.transactionCode}
                        onChange={(e) =>
                          setPaymentForm({
                            ...paymentForm,
                            transactionCode: e.target.value,
                          })
                        }
                        placeholder={
                          paymentForm.paymentMethod === "cash"
                            ? "Không bắt buộc với tiền mặt"
                            : "Mã ngân hàng / VNPay / MoMo đã đối soát (bắt buộc)"
                        }
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-bold">Ghi chú</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={paymentForm.note}
                        onChange={(e) =>
                          setPaymentForm({
                            ...paymentForm,
                            note: e.target.value,
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
                    disabled={paymentSubmitting}
                    onClick={() => setPayingTuition(null)}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success px-4"
                    disabled={paymentSubmitting || paymentNeedsReview || !Number.isSafeInteger(paymentAmount) || paymentAmount <= 0}
                  >
                    {paymentSubmitting
                      ? "Đang ghi nhận..."
                      : "Xác nhận thanh toán"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL (GetById) */}
      {selectedTuition && (
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
                    {selectedTuition.invoiceCode ||
                      `INV-${selectedTuition.tuitionId}`}
                  </span>
                  <h5 className="modal-title fw-bold mb-0 text-dark">
                    Chi tiết hóa đơn học phí
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeDetail}
                />
              </div>

              <div className="modal-body p-4">
                {loadingDetail ? (
                  <div className="text-center py-4 text-muted">
                    <div
                      className="spinner-border spinner-border-sm text-primary me-2"
                      role="status"
                    />
                    Đang nạp chi tiết hóa đơn...
                  </div>
                ) : (
                  <>
                    <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
                      <div>
                        <h4 className="fw-bold mb-1 text-dark">
                          {selectedTuition.studentName}
                        </h4>
                        <div className="d-flex align-items-center gap-3 text-muted small">
                          <span>
                            Lớp: <strong>{selectedTuition.className}</strong>
                          </span>
                          <span>
                            Kỳ:{" "}
                            <strong>
                              {invoicePeriodLabel(selectedTuition)}
                            </strong>
                          </span>
                        </div>
                      </div>
                      <DotStatusBadge
                        status={selectedTuition.status || "Unpaid"}
                      />
                    </div>

                    <div className="row g-3 mb-4">
                      <div className="col-md-4">
                        <div className="p-3 bg-light rounded-3 text-center">
                          <small className="text-muted d-block mb-1">
                            Tổng học phí
                          </small>
                          <h6 className="fw-bold text-dark mb-0">
                            {(
                              selectedTuition.amount ||
                              selectedTuition.amountDue ||
                              0
                            ).toLocaleString("vi-VN")}{" "}
                            VND
                          </h6>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3 bg-light rounded-3 text-center">
                          <small className="text-muted d-block mb-1">
                            Đã đóng
                          </small>
                          <h6 className="fw-bold text-success mb-0">
                            {formatVND(detailPayments != null ? selectedTuition.paidAmount : null)}
                          </h6>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3 bg-light rounded-3 text-center">
                          <small className="text-muted d-block mb-1">
                            Còn nợ
                          </small>
                          <h6 className="fw-bold text-danger mb-0">
                            {formatVND(detailPayments != null && selectedTuition.paidAmount != null ? Math.max(0, Math.round(selectedTuition.amountDue * 100) - Math.round(selectedTuition.paidAmount * 100)) / 100 : null)}
                          </h6>
                        </div>
                      </div>
                    </div>
                    {detailError && <div role="alert" className="alert alert-danger">{detailError} Chưa xác nhận được số đã thu/còn nợ; đóng và tải lại để đối soát.</div>}
                    <h6>Lịch sử thanh toán</h6>
                    {detailPayments == null ? <p className="text-muted">Chưa tải được lịch sử thanh toán.</p> : detailPayments.length === 0 ? <p>Chưa có khoản thanh toán.</p> : <ul className="list-group" data-testid="invoice-payment-history">{detailPayments.map(payment => <li key={payment.paymentId} className="list-group-item small">
                      <strong>{formatVND(payment.amount)}</strong> · {payment.paymentMethod} · {receiptDateLabel(payment.paidAt)}
                      {payment.transactionCode && <div>Mã giao dịch: {payment.transactionCode}</div>}{payment.additionalChargeNote && <div>Phụ phí: {formatVND(payment.additionalChargeAmount)} — {payment.additionalChargeNote}</div>}
                    </li>)}</ul>}
                  </>
                )}
              </div>

              <div className="modal-footer bg-light">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeDetail}
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
