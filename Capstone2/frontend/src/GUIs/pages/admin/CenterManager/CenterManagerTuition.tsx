import { useState, useEffect, useMemo } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import DotStatusBadge from "../../../components/Common/DotStatusBadge";
import SubjectBadge from "../../../components/Common/SubjectBadge";
import Pagination from "../../../components/Common/Pagination";
import TableToolbar from "../../../components/Common/TableToolbar";
import UserAvatar from "../../../components/Common/UserAvatar";
import KpiCard from "../../../components/Common/KpiCard";
import tuitionDAL from "../../../../DAL/tuitionDAL";
import managementDAL from "../../../../DAL/managementDAL";
import userDAL from "../../../../DAL/userDAL";
import classDAL from "../../../../DAL/classDAL";

import type { UserDto } from "../../../../BLL/models/UserDto";
import type { ClassDto } from "../../../../BLL/models/ClassDto";
import type { TuitionDto, PaymentDto } from "../../../../BLL/models/TuitionDto";

// TuitionInvoiceDto không có paidAmount: tính từ lịch sử thanh toán thực tế.
function attachPaidAmounts(
  invoices: TuitionDto[],
  payments: PaymentDto[],
): TuitionDto[] {
  const paidByInvoice = new Map<number, number>();
  for (const payment of payments) {
    paidByInvoice.set(
      payment.invoiceId,
      (paidByInvoice.get(payment.invoiceId) ?? 0) + payment.amount,
    );
  }
  return invoices.map((invoice) => ({
    ...invoice,
    paidAmount: paidByInvoice.get(invoice.invoiceId) ?? 0,
  }));
}

export default function CenterManagerTuitionPage() {
  const [tuitions, setTuitions] = useState<TuitionDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [students, setStudents] = useState<UserDto[]>([]);
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

  // Generate Tuition Modal state
  const [showGenerateModal, setShowGenerateModal] = useState<boolean>(false);
  const [generateForm, setGenerateForm] = useState({
    studentId: 0,
    classId: 0,
    amount: 3000000,
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
  });

  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [paymentDataWarning, setPaymentDataWarning] = useState<string | null>(
    null,
  );
  const [payingTuition, setPayingTuition] = useState<TuitionDto | null>(null);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentMethod: "cash",
    transactionCode: "",
    note: "",
    additionalChargeNote: "",
  });
  const [editingTuition, setEditingTuition] = useState<TuitionDto | null>(null);

  const [editForm, setEditForm] = useState({
    periodMonth: new Date().getMonth() + 1,
    periodYear: new Date().getFullYear(),
    amountDue: 0,
    dueDate: "",
    status: "unpaid",
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        setLoading(true);

        const [tuitionRes, userRes, classRes, paymentRes] = await Promise.all([
          tuitionDAL.getAllTuitions(),
          userDAL.getAllUsers(),
          classDAL.getAllClasses(),
          tuitionDAL.getAllPayments(),
        ]);

        if (!isMounted) return;

        if (tuitionRes.isLiveApi && paymentRes.isLiveApi) {
          setTuitions(
            attachPaidAmounts(tuitionRes.data || [], paymentRes.data || []),
          );
          setPaymentDataWarning(null);
        } else {
          setTuitions(tuitionRes.data || []);
          setPaymentDataWarning(
            "Chưa tải được dữ liệu thật của hóa đơn hoặc lịch sử thanh toán. Số tiền đã đóng/còn nợ có thể không chính xác.",
          );
        }

        const studentUsers = userRes.data.filter((u) =>
          u.roles?.some((role) => role.toLowerCase() === "student"),
        );

        setStudents(studentUsers);
        setClasses(classRes.data || []);
      } catch (err) {
        console.warn("Lỗi tải dữ liệu học phí:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingTuition) return;

    try {
      const res = await managementDAL.updateTuitionInvoice(
        editingTuition.invoiceId,
        {
          periodMonth: editForm.periodMonth,
          periodYear: editForm.periodYear,
          amountDue: editForm.amountDue,
          dueDate: editForm.dueDate,
          status: editForm.status,
        },
      );

      setTuitions((prev) =>
        prev.map((t) =>
          t.invoiceId === editingTuition.invoiceId
            ? {
                ...t,
                ...res.data,

                amount: res.data.amountDue,
              }
            : t,
        ),
      );

      setEditingTuition(null);

      setActionSuccessMsg(
        `Đã cập nhật hóa đơn #${res.data.invoiceId} thành công!`,
      );

      setTimeout(() => setActionSuccessMsg(null), 3500);
    } catch (err) {
      console.error("Lỗi cập nhật hóa đơn học phí:", err);
    }
  };

  const handleOpenEdit = (tuition: TuitionDto) => {
    const rawStatus = (tuition.status || "unpaid").toLowerCase();

    const validStatus = [
      "unpaid",
      "paid",
      "overdue",
      "pending_adjustment",
    ].includes(rawStatus)
      ? rawStatus
      : "unpaid";

    setEditingTuition(tuition);

    setEditForm({
      periodMonth: tuition.periodMonth ?? new Date().getMonth() + 1,
      periodYear: tuition.periodYear ?? new Date().getFullYear(),
      amountDue: tuition.amountDue || tuition.amount || 0,
      dueDate: tuition.dueDate ? tuition.dueDate.split("T")[0] : "",
      status: validStatus,
    });
  };

  // Record Payment: không tự tạo payment giả nếu API thất bại.
  const handleOpenPayment = (tuition: TuitionDto) => {
    const amountDue = tuition.amountDue ?? tuition.amount ?? 0;
    const remaining = Math.max(0, amountDue - (tuition.paidAmount ?? 0));
    // Không mở phiếu thu với dữ liệu giả hoặc chưa tải được công nợ thực.
    if (paymentDataWarning || !tuition.invoiceId) return;

    setPayingTuition(tuition);
    setPaymentForm({
      amount: remaining,
      paymentMethod: "cash",
      transactionCode: "",
      note: "",
      additionalChargeNote: "",
    });
    setPaymentError(null);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingTuition || paymentSubmitting) return;

    const amountDue = payingTuition.amountDue ?? payingTuition.amount ?? 0;
    const remaining = Math.max(0, amountDue - (payingTuition.paidAmount ?? 0));
    const amount = Number(paymentForm.amount);

    if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(amount)) {
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

    setPaymentSubmitting(true);
    setPaymentError(null);
    try {
      await managementDAL.recordTuitionPayment(payingTuition.invoiceId, {
        amount,
        paymentMethod: paymentForm.paymentMethod,
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

      // Cập nhật tạm thời từ response POST, không dựa vào mock.
      setTuitions((prev) =>
        prev.map((tuition) => {
          if (tuition.invoiceId !== invoiceId) return tuition;
          const newPaid = (tuition.paidAmount ?? 0) + amount;
          const due =
            (tuition.amountDue ?? tuition.amount ?? 0) + additionalChargeAmount;
          const newStatus =
            newPaid >= due
              ? "paid"
              : tuition.dueDate && new Date(tuition.dueDate) < new Date()
                ? "overdue"
                : "unpaid";
          return {
            ...tuition,
            amountDue: due,
            amount: due,
            paidAmount: newPaid,
            status: newStatus,
          };
        }),
      );

      // Đọc lại MySQL để cả thanh toán một phần và KPI được hiển thị chính xác.
      try {
        const [invoiceRes, paymentRes] = await Promise.all([
          tuitionDAL.getAllTuitions(),
          tuitionDAL.getAllPayments(),
        ]);
        if (!invoiceRes.isLiveApi || !paymentRes.isLiveApi) {
          throw new Error("API GET đã fallback sang mock.");
        }
        setTuitions(attachPaidAmounts(invoiceRes.data, paymentRes.data));
        setPaymentDataWarning(null);
      } catch (refreshError) {
        console.warn(
          "Đã ghi nhận thanh toán nhưng không đọc lại được dữ liệu:",
          refreshError,
        );
        setPaymentDataWarning(
          "Thanh toán đã được API xác nhận, nhưng chưa đọc lại được lịch sử thanh toán. Hãy kiểm tra kết nối backend trước khi đối chiếu số liệu.",
        );
      }
    } catch (error) {
      console.error("Lỗi ghi nhận thanh toán:", error);
      setPaymentError(
        error instanceof Error
          ? error.message
          : "Không ghi nhận được thanh toán.",
      );
    } finally {
      setPaymentSubmitting(false);
    }
  };

  // Summary Metrics calculations
  const metrics = useMemo(() => {
    let totalDue = 0;
    let collected = 0;
    let outstanding = 0;
    let overdueAmount = 0;
    let overdueCount = 0;

    tuitions.forEach((t) => {
      const amount = t.amount || t.amountDue || 0;
      const paid =
        t.paidAmount ?? (t.status.toLowerCase() === "paid" ? amount : 0);
      totalDue += amount;
      collected += paid;

      const remaining = Math.max(0, amount - paid);
      outstanding += remaining;

      if (
        t.status.toLowerCase() === "overdue" ||
        (remaining > 0 && t.dueDate && new Date(t.dueDate) < new Date())
      ) {
        overdueCount++;
        overdueAmount += remaining;
      }
    });

    const collectedPercent =
      totalDue > 0 ? Math.round((collected / totalDue) * 100) : 0;
    const remainingPercent = 100 - collectedPercent;

    return {
      totalDue,
      collected,
      outstanding,
      overdueCount,
      overdueAmount,
      collectedPercent,
      remainingPercent,
    };
  }, [tuitions]);

  // Filter & Search logic
  const filteredTuitions = useMemo(() => {
    return tuitions
      .filter((t) => {
        const matchSearch =
          searchTerm === "" ||
          (t.studentName &&
            t.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (t.className &&
            t.className.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (t.invoiceCode &&
            t.invoiceCode.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchClass =
          selectedClass === "All" ||
          (t.className &&
            t.className.toLowerCase().includes(selectedClass.toLowerCase()));

        const matchStatus =
          selectedStatus === "All" ||
          (t.status && t.status.toLowerCase() === selectedStatus.toLowerCase());

        return matchSearch && matchClass && matchStatus;
      })
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
  }, [tuitions, searchTerm, selectedClass, selectedStatus, selectedSort]);

  // Paginated list
  const paginatedTuitions = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredTuitions.slice(start, start + entriesPerPage);
  }, [filteredTuitions, currentPage, entriesPerPage]);

  // Handle View Details (GetById)
  const handleViewDetails = async (t: TuitionDto) => {
    setLoadingDetail(true);
    const targetId = t.tuitionId || t.invoiceId;
    if (!targetId) return;
    try {
      const detail = await tuitionDAL.getTuitionById(targetId);
      setSelectedTuition(detail ? { ...detail, paidAmount: t.paidAmount } : t);
    } catch {
      setSelectedTuition(t);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Handle Generate Submit
  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (generateForm.studentId <= 0 || generateForm.classId <= 0) {
      return;
    }

    try {
      const now = new Date();

      const res = await managementDAL.createTuitionInvoice({
        studentId: generateForm.studentId,
        classId: generateForm.classId,
        periodMonth: now.getMonth() + 1,
        periodYear: now.getFullYear(),
        amountDue: Number(generateForm.amount),
        dueDate: generateForm.dueDate,
      });

      setTuitions((prev) => [res.data, ...prev]);

      setShowGenerateModal(false);

      setGenerateForm({
        studentId: 0,
        classId: 0,
        amount: 3000000,
        dueDate: new Date(Date.now() + 15 * 86400000)
          .toISOString()
          .split("T")[0],
      });

      setActionSuccessMsg(
        `Đã tạo hóa đơn học phí #${res.data.invoiceId} cho "${res.data.studentName}" thành công!`,
      );

      setTimeout(() => setActionSuccessMsg(null), 3500);
    } catch (err) {
      console.error("Lỗi tạo hóa đơn học phí:", err);
    }
  };

  return (
    <>
      {/* Breadcrumb and Quick Access */}
      <PageHeader
        title="Tuition Management"
        breadcrumbItems={[
          { label: "Center Manager", path: "/center-manager" },
          { label: "Tuition Management" },
        ]}
        action={
          <button
            type="button"
            className="btn btn-primary d-flex align-items-center shadow-sm"
            onClick={() => setShowGenerateModal(true)}
          >
            <i className="bi bi-plus-square me-2" />
            Generate Tuition
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

      {paymentDataWarning && (
        <div className="alert alert-warning" role="alert">
          <i className="bi bi-exclamation-triangle me-2" />
          {paymentDataWarning}
        </div>
      )}

      {/* Tuition Summary KPIs */}
      <div className="row g-3 mb-4">
        {/* Total Tuition Due */}
        <div className="col-xl-3 col-md-6">
          <KpiCard
            type="tuition"
            status="total"
            title="Total Tuition Due"
            value={`${Math.round(metrics.totalDue / 1000000)}M`}
            footerValue="August 2026"
          />
        </div>

        {/* Collected */}
        <div className="col-xl-3 col-md-6">
          <KpiCard
            type="tuition"
            status="collected"
            title="Collected"
            value={`${Math.round(metrics.collected / 1000000)}M`}
            footerValue={`${metrics.collectedPercent}%`}
            footerLabel="collected"
          />
        </div>

        {/* Outstanding */}
        <div className="col-xl-3 col-md-6">
          <KpiCard
            type="tuition"
            status="outstanding"
            title="Outstanding"
            value={`${Math.round(metrics.outstanding / 1000000)}M`}
            footerValue={`${metrics.remainingPercent}%`}
            footerLabel="remaining"
          />
        </div>

        {/* Overdue */}
        <div className="col-xl-3 col-md-6">
          <KpiCard
            type="tuition"
            status="overdue"
            title="Overdue"
            value={`${Math.round(metrics.overdueAmount / 1000000)}M`}
            footerValue={metrics.overdueCount}
            footerLabel="records"
          />
        </div>
      </div>

      {/* Tuition List */}
      <div className="card user-list-card border-0 shadow-sm">
        {/* Filter */}
        <div className="card-header user-list-header bg-white py-3 border-bottom">
          <div className="row g-3 align-items-center">
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
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Classes</option>
                <option value="7">Class 7</option>
                <option value="8">Class 8</option>
                <option value="9">Class 9</option>
                <option value="12">Class 12</option>
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
                      </td>
                      <td>{dueDateStr}</td>
                      <td>
                        <DotStatusBadge status={t.status || "Unpaid"} />
                      </td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => handleOpenEdit(t)}
                            title="Chỉnh sửa hóa đơn"
                          >
                            <i className="bi bi-pencil-square me-1" />
                            Sửa
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleOpenPayment(t)}
                            disabled={!!paymentDataWarning || !t.invoiceId}
                            title={
                              paymentDataWarning
                                ? "Chưa tải được dữ liệu thật: kiểm tra kết nối backend"
                                : "Ghi nhận thanh toán"
                            }
                          >
                            <i className="bi bi-cash-coin me-1" />
                            Thanh toán
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleViewDetails(t)}
                            title="View Receipt"
                          >
                            <i className="bi bi-receipt me-1" />
                            Biên lai
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

      {/* GENERATE TUITION MODAL */}
      {showGenerateModal && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-receipt me-2" />
                  Lập phiếu thu học phí mới (Center Manager)
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowGenerateModal(false)}
                />
              </div>
              <form onSubmit={handleGenerateSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        Tên học viên <span className="text-danger">*</span>
                      </label>
                      {/* <input
                        type="text"
                        className="form-control"
                        placeholder="Nhập tên học viên..."
                        value={generateForm.studentName}
                        onChange={(e) =>
                          setGenerateForm({
                            ...generateForm,
                            studentName: e.target.value,
                          })
                        }
                        required
                      /> */}
                      <select
                        className="form-select"
                        value={generateForm.studentId}
                        onChange={(e) =>
                          setGenerateForm({
                            ...generateForm,
                            studentId: Number(e.target.value),
                          })
                        }
                        required
                      >
                        <option value={0}>-- Chọn học viên --</option>

                        {students.map((student) => (
                          <option key={student.userId} value={student.userId}>
                            {student.fullName} - {student.userCode}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Khối lớp</label>
                      {/* <select
                        className="form-select"
                        value={generateForm.className}
                        onChange={(e) =>
                          setGenerateForm({
                            ...generateForm,
                            className: e.target.value,
                          })
                        }
                      >
                        <option value="Class 7">Class 7</option>
                        <option value="Class 8">Class 8</option>
                        <option value="Class 9">Class 9</option>
                        <option value="Class 12">Class 12</option>
                      </select> */}
                      <select
                        className="form-select"
                        value={generateForm.classId}
                        onChange={(e) =>
                          setGenerateForm({
                            ...generateForm,
                            classId: Number(e.target.value),
                          })
                        }
                        required
                      >
                        <option value={0}>-- Chọn lớp học --</option>

                        {classes.map((cls) => (
                          <option key={cls.classId} value={cls.classId}>
                            {cls.className}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        Số tiền học phí (VND){" "}
                        <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        value={generateForm.amount}
                        onChange={(e) =>
                          setGenerateForm({
                            ...generateForm,
                            amount: Number(e.target.value),
                          })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        Hạn chót thanh toán
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        value={generateForm.dueDate}
                        onChange={(e) =>
                          setGenerateForm({
                            ...generateForm,
                            dueDate: e.target.value,
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
                    onClick={() => setShowGenerateModal(false)}
                  >
                    Hủy bỏ
                  </button>
                  <button type="submit" className="btn btn-primary px-4">
                    Lập hóa đơn
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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
                <div className="modal-body p-4">
                  <div className="row g-3">
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
                      <label className="form-label fw-bold">
                        Số tiền học phí
                      </label>

                      <div className="input-group">
                        <input
                          type="text"
                          inputMode="numeric"
                          className="form-control"
                          value={
                            editForm.amountDue
                              ? editForm.amountDue.toLocaleString("vi-VN")
                              : ""
                          }
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, "");
                            const amount = digits ? Number(digits) : 0;

                            if (!Number.isSafeInteger(amount)) return;

                            setEditForm({
                              ...editForm,
                              amountDue: amount,
                            });
                          }}
                          placeholder="Nhập số tiền học phí"
                          required
                        />
                        <span className="input-group-text">VND</span>
                      </div>
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

                      <select
                        className="form-select"
                        value={editForm.status}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            status: e.target.value,
                          })
                        }
                      >
                        <option value="unpaid">Unpaid</option>

                        <option value="paid">Paid</option>

                        <option value="overdue">Overdue</option>

                        <option value="pending_adjustment">
                          Pending Adjustment
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setEditingTuition(null)}
                  >
                    Hủy
                  </button>

                  <button type="submit" className="btn btn-warning px-4">
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
                    </div>
                  )}
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        Số tiền thanh toán (VND) *
                      </label>
                      <div className="input-group">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9. ]*"
                          className="form-control"
                          value={
                            paymentForm.amount
                              ? paymentForm.amount.toLocaleString("vi-VN")
                              : ""
                          }
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, "");
                            const amount = digits ? Number(digits) : 0;
                            setPaymentForm({
                              ...paymentForm,
                              amount: Number.isSafeInteger(amount) ? amount : 0,
                            });
                          }}
                          placeholder="Nhập số tiền thanh toán"
                          required
                        />
                        <span className="input-group-text">VND</span>
                      </div>
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
                        onChange={(e) =>
                          setPaymentForm({
                            ...paymentForm,
                            paymentMethod: e.target.value,
                          })
                        }
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
                    {paymentForm.amount >
                      Math.max(
                        0,
                        (payingTuition.amountDue ?? payingTuition.amount ?? 0) -
                          (payingTuition.paidAmount ?? 0),
                      ) && (
                      <div className="col-12">
                        <div className="alert alert-info py-2 mb-2">
                          <strong>Phí bổ sung: </strong>
                          {(
                            paymentForm.amount -
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
                            : "Mã tham chiếu từ ngân hàng / VNPay / MoMo (nếu có)"
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
                    disabled={paymentSubmitting || paymentForm.amount <= 0}
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
                    Biên lai chi tiết học phí
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedTuition(null)}
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
                              {selectedTuition.period || "August 2026"}
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
                            {(
                              selectedTuition.paidAmount ??
                              (selectedTuition.status.toLowerCase() === "paid"
                                ? selectedTuition.amountDue
                                : 0)
                            ).toLocaleString("vi-VN")}{" "}
                            VND
                          </h6>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3 bg-light rounded-3 text-center">
                          <small className="text-muted d-block mb-1">
                            Còn nợ
                          </small>
                          <h6 className="fw-bold text-danger mb-0">
                            {Math.max(
                              0,
                              (selectedTuition.amount ||
                                selectedTuition.amountDue ||
                                0) -
                                (selectedTuition.paidAmount ??
                                  (selectedTuition.status.toLowerCase() ===
                                  "paid"
                                    ? selectedTuition.amountDue
                                    : 0)),
                            ).toLocaleString("vi-VN")}{" "}
                            VND
                          </h6>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="modal-footer bg-light">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedTuition(null)}
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
