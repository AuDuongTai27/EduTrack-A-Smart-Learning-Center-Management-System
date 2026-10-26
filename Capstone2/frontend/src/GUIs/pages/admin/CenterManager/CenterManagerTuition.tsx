import { useState, useEffect, useMemo } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import DotStatusBadge from "../../../components/Common/DotStatusBadge";
import SubjectBadge from "../../../components/Common/SubjectBadge";
import Pagination from "../../../components/Common/Pagination";
import TableToolbar from "../../../components/Common/TableToolbar";
import UserAvatar from "../../../components/Common/UserAvatar";
import KpiCard from "../../../components/Common/KpiCard";
import tuitionDAL from "../../../../DAL/tuitionDAL";
import type { TuitionDto } from "../../../../BLL/models/TuitionDto";

export default function CenterManagerTuitionPage() {
  const [tuitions, setTuitions] = useState<TuitionDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedSort, setSelectedSort] = useState<string>("newest");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);

  // Detail Modal state (GetById)
  const [selectedTuition, setSelectedTuition] = useState<TuitionDto | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  // Generate Tuition Modal state
  const [showGenerateModal, setShowGenerateModal] = useState<boolean>(false);
  const [generateForm, setGenerateForm] = useState({
    studentName: "",
    className: "Class 7",
    amount: 3000000,
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
  });
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchTuitions() {
      try {
        setLoading(true);
        const res = await tuitionDAL.getAllTuitions();
        if (isMounted && res.data) {
          setTuitions(res.data);
        }
      } catch (err) {
        console.warn("Lỗi tải danh sách học phí center manager:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchTuitions();
    return () => {
      isMounted = false;
    };
  }, []);

  // Summary Metrics calculations
  const metrics = useMemo(() => {
    let totalDue = 0;
    let collected = 0;
    let outstanding = 0;
    let overdueAmount = 0;
    let overdueCount = 0;

    tuitions.forEach((t) => {
      const amount = t.amount || t.amountDue || 0;
      const paid = t.paidAmount || (t.status === "Paid" ? amount : 0);
      totalDue += amount;
      collected += paid;

      const remaining = Math.max(0, amount - paid);
      outstanding += remaining;

      if (t.status === "Overdue" || (remaining > 0 && t.dueDate && new Date(t.dueDate) < new Date())) {
        overdueCount++;
        overdueAmount += remaining;
      }
    });

    const collectedPercent = totalDue > 0 ? Math.round((collected / totalDue) * 100) : 0;
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
          (t.studentName && t.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (t.className && t.className.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (t.invoiceCode && t.invoiceCode.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchClass =
          selectedClass === "All" ||
          (t.className && t.className.toLowerCase().includes(selectedClass.toLowerCase()));

        const matchStatus =
          selectedStatus === "All" ||
          (t.status && t.status.toLowerCase() === selectedStatus.toLowerCase());

        return matchSearch && matchClass && matchStatus;
      })
      .sort((a, b) => {
        if (selectedSort === "newest") {
          return new Date(b.dueDate || 0).getTime() - new Date(a.dueDate || 0).getTime();
        }
        if (selectedSort === "oldest") {
          return new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime();
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
      setSelectedTuition(detail || t);
    } catch {
      setSelectedTuition(t);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Handle Generate Submit
  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!generateForm.studentName.trim()) return;

    const validIds = tuitions.map((t) => t.tuitionId || t.invoiceId || 0);
    const newId = validIds.length > 0 ? Math.max(...validIds) + 1 : 301;

    const newInvoice: TuitionDto = {
      invoiceId: newId,
      tuitionId: newId,
      studentId: 7,
      studentCode: "STU007",
      studentName: generateForm.studentName.trim(),
      classId: 1,
      className: generateForm.className,
      amountDue: Number(generateForm.amount) || 3000000,
      amount: Number(generateForm.amount) || 3000000,
      dueDate: generateForm.dueDate,
      status: "Unpaid",
      invoiceCode: `INV${String(newId).padStart(4, "0")}`,
      period: "August 2026",
      createdAt: new Date().toISOString(),
    };

    setTuitions([newInvoice, ...tuitions]);
    setShowGenerateModal(false);
    setGenerateForm({
      studentName: "",
      className: "Class 7",
      amount: 3000000,
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
    });
    setActionSuccessMsg(`Đã tạo phiếu thu học phí #${newInvoice.invoiceCode} cho học viên "${newInvoice.studentName}" thành công!`);
    setTimeout(() => setActionSuccessMsg(null), 3500);
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
        <div className="alert alert-success alert-dismissible fade show d-flex align-items-center mb-4 shadow-sm" role="alert">
          <i className="bi bi-check-circle-fill fs-5 me-2" />
          <div>{actionSuccessMsg}</div>
          <button type="button" className="btn-close" onClick={() => setActionSuccessMsg(null)} aria-label="Close" />
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
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
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
                  const itemIndex = (currentPage - 1) * entriesPerPage + idx + 1;
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
                            <h6 className="mb-0 fw-bold text-dark">{t.studentName}</h6>
                            <small className="text-muted">{t.studentCode || `STU${t.studentId}`}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <SubjectBadge subject={t.className || "Class"} />
                      </td>
                      <td>
                        <strong className="text-dark">
                          {(t.amount || t.amountDue || 0).toLocaleString("vi-VN")} VND
                        </strong>
                      </td>
                      <td>{dueDateStr}</td>
                      <td>
                        <DotStatusBadge status={t.status || "Unpaid"} />
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleViewDetails(t)}
                          title="View Receipt"
                        >
                          <i className="bi bi-receipt me-1" />
                          Biên lai
                        </button>
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
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
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
                      <label className="form-label fw-bold">Tên học viên <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nhập tên học viên..."
                        value={generateForm.studentName}
                        onChange={(e) => setGenerateForm({ ...generateForm, studentName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Khối lớp</label>
                      <select
                        className="form-select"
                        value={generateForm.className}
                        onChange={(e) => setGenerateForm({ ...generateForm, className: e.target.value })}
                      >
                        <option value="Class 7">Class 7</option>
                        <option value="Class 8">Class 8</option>
                        <option value="Class 9">Class 9</option>
                        <option value="Class 12">Class 12</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Số tiền học phí (VND) <span className="text-danger">*</span></label>
                      <input
                        type="number"
                        className="form-control"
                        value={generateForm.amount}
                        onChange={(e) => setGenerateForm({ ...generateForm, amount: Number(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Hạn chót thanh toán</label>
                      <input
                        type="date"
                        className="form-control"
                        value={generateForm.dueDate}
                        onChange={(e) => setGenerateForm({ ...generateForm, dueDate: e.target.value })}
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

      {/* DETAIL MODAL (GetById) */}
      {selectedTuition && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-light border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-primary fs-6 font-monospace">
                    {selectedTuition.invoiceCode || `INV-${selectedTuition.tuitionId}`}
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
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    Đang nạp chi tiết hóa đơn...
                  </div>
                ) : (
                  <>
                    <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
                      <div>
                        <h4 className="fw-bold mb-1 text-dark">{selectedTuition.studentName}</h4>
                        <div className="d-flex align-items-center gap-3 text-muted small">
                          <span>Lớp: <strong>{selectedTuition.className}</strong></span>
                          <span>Kỳ: <strong>{selectedTuition.period || "August 2026"}</strong></span>
                        </div>
                      </div>
                      <DotStatusBadge status={selectedTuition.status || "Unpaid"} />
                    </div>

                    <div className="row g-3 mb-4">
                      <div className="col-md-4">
                        <div className="p-3 bg-light rounded-3 text-center">
                          <small className="text-muted d-block mb-1">Tổng học phí</small>
                          <h6 className="fw-bold text-dark mb-0">
                            {(selectedTuition.amount || selectedTuition.amountDue || 0).toLocaleString("vi-VN")} VND
                          </h6>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3 bg-light rounded-3 text-center">
                          <small className="text-muted d-block mb-1">Đã đóng</small>
                          <h6 className="fw-bold text-success mb-0">
                            {(selectedTuition.paidAmount || (selectedTuition.status === "Paid" ? selectedTuition.amountDue : 0) || 0).toLocaleString("vi-VN")} VND
                          </h6>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3 bg-light rounded-3 text-center">
                          <small className="text-muted d-block mb-1">Còn nợ</small>
                          <h6 className="fw-bold text-danger mb-0">
                            {Math.max(0, (selectedTuition.amount || selectedTuition.amountDue || 0) - (selectedTuition.paidAmount || (selectedTuition.status === "Paid" ? selectedTuition.amountDue : 0) || 0)).toLocaleString("vi-VN")} VND
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
