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
  catch { return "Payment date needs reconciliation"; }
}

export default function TuitionManagementPage({ role }: { role: "center-manager" | "admin-staff" }) {
  const roleLabel = role === "center-manager" ? "Center Manager" : "Admin Staff";
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
        setSelectedClass(previous => previous === "All" || classRes.data.some(c => String(c.classId) === previous) ? previous : "All");
      }
    }).catch(cause => { if (active) setLookupError(cause instanceof Error ? cause.message : "Failed to load classes."); });
    const focus = () => setLookupRevision(value => value + 1);
    window.addEventListener("focus", focus);
    return () => { active = false; window.removeEventListener("focus", focus); };
  }, [lookupRevision]);

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingTuition || editBusy) return;
    if (!editAllowed) { setEditError("The invoice already has recorded payments or is pending adjustment; financial fields cannot be edited directly. Reload to reconcile."); return; }
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
        `Successfully updated invoice #${res.data.invoiceId}!`,
      );

      setTimeout(() => setActionSuccessMsg(null), 3500);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to update invoice.");
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

  // Record Payment: do not create fake payment if API fails.
  const handleOpenPayment = (tuition: TuitionDto) => {
    const remaining = actionsFor(tuition).remaining ?? 0;
    // Do not open payment receipt with fake data or before actual debt is loaded.
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
    if (!actionsFor(current).canPay) {
      setPaymentNeedsReview(true);
      setPaymentError("Invoice has no valid outstanding balance or payment data is not ready; reload to reconcile.");
      return;
    }

    const remaining = actionsFor(current).remaining ?? 0;
    if (remaining <= 0) {
      setPaymentError("This invoice has already been fully paid.");
      return;
    }

    paymentSubmission.current = true;
    setPaymentSubmitting(true);
    setPaymentError(null);
    try {
      await managementDAL.recordTuitionPayment(payingTuition.invoiceId, {
        amount: remaining,
        paymentMethod: "cash",
        externalPaymentVerified: true,
        note: paymentForm.note.trim() || undefined,
        additionalChargeAmount: 0,
      });

      const invoiceId = payingTuition.invoiceId;
      setPayingTuition(null);
      setActionSuccessMsg(
        `Successfully recorded cash payment of ${remaining.toLocaleString("vi-VN")} VND for invoice #${invoiceId}.`,
      );

      await refresh();
    } catch (error) {
      console.error("Error recording payment:", error);
      setPaymentNeedsReview(true);
      setPaymentError(
        error instanceof Error
          ? error.message
          : "Failed to record payment.",
      );
    } finally {
      paymentSubmission.current = false;
      setPaymentSubmitting(false);
    }
  };

  // Filter & Search logic
  const filteredTuitions = useMemo(() => {
    return filterTuitionInvoices(tuitions, classes, { grade: "All", classId: selectedClass, month: "", year: "", search: searchTerm, status: selectedStatus })
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
  }, [tuitions, classes, searchTerm, selectedClass, selectedStatus, selectedSort]);

  const metrics = useMemo(() => balanceReady ? calculateTuitionMetrics(filteredTuitions, payments.data!, now) : null, [filteredTuitions, payments.data, balanceReady, now]);
  const invoiceScopeReady = invoiceReady && (selectedStatus === "All" || paymentReady) && !lookupError;

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
      if (!detail) throw new Error("Failed to load invoice for reconciliation.");
      setSelectedTuition(withInvoiceBalances([detail], receipts.data, new Date())[0]);
      setDetailPayments(receipts.data.filter(payment => payment.invoiceId === targetId));
    } catch (cause) {
      if (request === detailRequest.current) setDetailError(cause instanceof Error ? cause.message : "Failed to load payment data; paid amount cannot be assumed to be 0.");
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
            Create Invoice
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

      {lookupError && <div className="alert alert-warning mb-3" role="alert">{lookupError} <button type="button" className="btn btn-link" onClick={() => setLookupRevision(v => v + 1)}>Reload Classes</button></div>}
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
        filtered={searchTerm.trim() !== "" || selectedClass !== "All" || selectedStatus !== "All"}
      />

      {/* Tuition List */}
      <div className="card user-list-card border-0 shadow-sm">
        {/* Streamlined Filter Toolbar */}
        <div className="card-header user-list-header bg-white py-3 border-bottom">
          <div className="row g-2 align-items-center">
            {/* Search */}
            <div className="col-xl-4 col-lg-4 col-md-6 col-12">
              <div className="user-search position-relative">
                <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                <input
                  type="text"
                  className="form-control ps-5"
                  placeholder="Search by student, student code, invoice code..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            {/* Class Filter */}
            <div className="col-xl-3 col-lg-3 col-md-6 col-12">
              <select
                className="form-select"
                aria-label="Filter by Class"
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Classes ({classes.length})</option>
                {classes.map((cls) => (
                  <option key={cls.classId} value={String(cls.classId)}>
                    {cls.className}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="col-xl-3 col-lg-3 col-md-6 col-12">
              <select
                className="form-select"
                aria-label="Filter by Tuition Status"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Statuses</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
                <option value="pending_adjustment">Pending Adjustment</option>
              </select>
            </div>

            {/* Sort */}
            <div className="col-xl-2 col-lg-2 col-md-6 col-12">
              <select
                className="form-select"
                aria-label="Sort list"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
              >
                <option value="newest">Due Date: Newest</option>
                <option value="oldest">Due Date: Oldest</option>
                <option value="az">Student Name: A → Z</option>
                <option value="za">Student Name: Z → A</option>
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
                    Loading tuition list...
                  </td>
                </tr>
              ) : paginatedTuitions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">
                    <i className="bi bi-cash fs-2 d-block mb-2 text-secondary" />
                    No tuition records found matching filters.
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
                          <UserAvatar name={t.studentName || "Student"} />
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
                        {balanceReady && <div className="small text-muted">Paid: {formatVND(t.paidAmount)} · Remaining: {formatVND(actions.remaining)}</div>}
                      </td>
                      <td>{dueDateStr}</td>
                      <td>
                        <DotStatusBadge status={t.status || "Unpaid"} />
                        {actions.partiallyPaid && <small className="d-block text-muted">Partially Paid</small>}
                      </td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          {actions.canEdit && <button
                            type="button"
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => handleOpenEdit(t)}
                            title="Edit invoice"
                          >
                            <i className="bi bi-pencil-square me-1" />
                            Edit
                          </button>}

                          {actions.canPay && <button
                            type="button"
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleOpenPayment(t)}
                            disabled={!balanceReady || !t.invoiceId}
                            title={
                              paymentDataWarning
                                ? "Real data not loaded: check backend connection"
                                : "Record payment"
                            }
                          >
                            <i className="bi bi-cash-coin me-1" />
                            Pay
                          </button>}

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleViewDetails(t)}
                            title="View invoice"
                          >
                            <i className="bi bi-receipt me-1" />
                            View Invoice
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
                  Edit Invoice #{editingTuition.invoiceId}
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
                  {!editAllowed && <div className="alert alert-warning">Cannot edit directly when payments have been recorded or adjustment is pending. Reconciliation and existing approval process required.</div>}
                  <fieldset className="row g-3" disabled={editBusy || !editAllowed}>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Student</label>

                      <input
                        type="text"
                        className="form-control"
                        value={editingTuition.studentName}
                        disabled
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold">Class</label>

                      <input
                        type="text"
                        className="form-control"
                        value={editingTuition.className}
                        disabled
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label fw-bold">Month</label>

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
                      <label className="form-label fw-bold">Year</label>

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
                        Tuition Amount
                      </label>

                      <MoneyInput
                        id="manager-edit-amount"
                        name="amountDue"
                        value={editForm.amountDue}
                        onValueChange={amountDue => setEditForm({...editForm, amountDue})}
                        placeholder="Enter tuition amount"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        Due Date
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
                      <label className="form-label fw-bold">Status</label>

                      <div data-testid="invoice-edit-status"><DotStatusBadge status={currentEdit?.status || "unpaid"} /></div>
                      <small className="text-muted">Calculated by the system based on collected amount and due date. Cannot be selected manually.</small>
                    </div>
                  </fieldset>
                </div>

                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setEditingTuition(null)}
                  >
                    Cancel
                  </button>

                  <button type="submit" className="btn btn-warning px-4" disabled={editBusy || !editAllowed}>
                    <i className="bi bi-save me-2" />
                    Save Changes
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
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <i className="bi bi-cash-stack" />
                  <span>Record In-Person Cash Payment – Invoice #{payingTuition.invoiceId}</span>
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  disabled={paymentSubmitting}
                  onClick={() => setPayingTuition(null)}
                />
              </div>

              <form onSubmit={handlePaymentSubmit}>
                <div className="modal-body p-4">
                  {/* Student & Class Info */}
                  <div className="bg-light p-3 rounded-3 mb-3 border">
                    <div className="row g-2 small">
                      <div className="col-sm-6">
                        <strong className="text-muted">Student:</strong>{" "}
                        <span className="fw-semibold text-dark">{payingTuition.studentName}</span>
                      </div>
                      <div className="col-sm-6">
                        <strong className="text-muted">Class:</strong>{" "}
                        <span className="fw-semibold text-dark">{payingTuition.className}</span>
                      </div>
                      <div className="col-sm-6">
                        <strong className="text-muted">Period:</strong>{" "}
                        <span className="text-dark">Month {payingTuition.periodMonth}/{payingTuition.periodYear}</span>
                      </div>
                      <div className="col-sm-6">
                        <strong className="text-muted">Total Tuition:</strong>{" "}
                        <span className="text-dark">
                          {(payingTuition.amountDue ?? payingTuition.amount ?? 0).toLocaleString("vi-VN")} VND
                        </span>
                      </div>
                    </div>
                  </div>

                  {paymentError && (
                    <div className="alert alert-danger" role="alert">
                      {paymentError}
                      {paymentNeedsReview && (
                        <div className="mt-2">
                          Result may not have been confirmed. Do not resubmit payment before reconciliation.{" "}
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => {
                              setPayingTuition(null);
                              void refresh();
                            }}
                          >
                            Close and reload balance
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Amount to collect - Fixed 100% full payment */}
                  <div className="p-3 bg-success-subtle bg-opacity-25 rounded-3 border border-success-subtle d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <div className="text-muted small fw-semibold">
                        Amount to collect (100% full payment):
                      </div>
                      <div className="small text-secondary">
                        Fixed to exact remaining balance of invoice
                      </div>
                    </div>
                    <div className="fs-3 fw-bold text-success font-monospace">
                      {Math.max(
                        0,
                        (payingTuition.amountDue ?? payingTuition.amount ?? 0) - (payingTuition.paidAmount ?? 0),
                      ).toLocaleString("vi-VN")}{" "}
                      VND
                    </div>
                  </div>

                  {/* Payment Method - Fixed Cash */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase mb-1">
                      Payment Method
                    </label>
                    <div className="p-3 rounded-3 border bg-light d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-cash text-success fs-5"></i>
                        <div>
                          <strong className="text-dark">Cash</strong>
                          <div className="small text-muted">
                            Collected in person when parent pays tuition at the center office
                          </div>
                        </div>
                      </div>
                      <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 fw-semibold">
                        Default
                      </span>
                    </div>
                  </div>

                  {/* Receipt Note */}
                  <div className="mb-2">
                    <label className="form-label small fw-bold text-muted text-uppercase mb-1">
                      Receipt Note (Optional)
                    </label>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="e.g., Parent paid in person at center office..."
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

                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    disabled={paymentSubmitting}
                    onClick={() => setPayingTuition(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success px-4 fw-semibold d-flex align-items-center gap-2"
                    disabled={
                      paymentSubmitting ||
                      paymentNeedsReview ||
                      Math.max(
                        0,
                        (payingTuition.amountDue ?? payingTuition.amount ?? 0) - (payingTuition.paidAmount ?? 0),
                      ) <= 0
                    }
                  >
                    {paymentSubmitting && <span className="spinner-border spinner-border-sm"></span>}
                    <span>{paymentSubmitting ? "Recording..." : "Confirm Cash Payment"}</span>
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
                    Tuition Invoice Details
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
                    Loading invoice details...
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
                            Class: <strong>{selectedTuition.className}</strong>
                          </span>
                          <span>
                            Period:{" "}
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
                            Total Tuition
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
                            Paid
                          </small>
                          <h6 className="fw-bold text-success mb-0">
                            {formatVND(detailPayments != null ? selectedTuition.paidAmount : null)}
                          </h6>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3 bg-light rounded-3 text-center">
                          <small className="text-muted d-block mb-1">
                            Remaining Balance
                          </small>
                          <h6 className="fw-bold text-danger mb-0">
                            {formatVND(detailPayments != null && selectedTuition.paidAmount != null ? Math.max(0, Math.round(selectedTuition.amountDue * 100) - Math.round(selectedTuition.paidAmount * 100)) / 100 : null)}
                          </h6>
                        </div>
                      </div>
                    </div>
                    {detailError && <div role="alert" className="alert alert-danger">{detailError} Paid/remaining amount not verified; close and reload to reconcile.</div>}
                    <h6>Payment History</h6>
                    {detailPayments == null ? <p className="text-muted">Could not load payment history.</p> : detailPayments.length === 0 ? <p>No payment records found.</p> : <ul className="list-group" data-testid="invoice-payment-history">{detailPayments.map(payment => <li key={payment.paymentId} className="list-group-item small">
                      <strong>{formatVND(payment.amount)}</strong> · {payment.paymentMethod} · {receiptDateLabel(payment.paidAt)}
                      {payment.transactionCode && <div>Transaction Code: {payment.transactionCode}</div>}{payment.additionalChargeNote && <div>Surcharge: {formatVND(payment.additionalChargeAmount)} — {payment.additionalChargeNote}</div>}
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
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
