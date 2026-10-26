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

export default function AdminStaffTuitionPage() {
  const [tuitions, setTuitions] = useState<TuitionDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

  // Form Generate
  const [genStudentName, setGenStudentName] = useState("");
  const [genClassName, setGenClassName] = useState("Toán 12 Chuyên Sâu");
  const [genAmount, setGenAmount] = useState("3500000");

  useEffect(() => {
    let isMounted = true;
    async function loadTuitionData() {
      try {
        setLoading(true);
        const res = await tuitionDAL.getAllTuitions();
        if (isMounted && res.data) {
          setTuitions(res.data);
        }
      } catch (err) {
        console.warn("Lỗi tải danh sách học phí:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadTuitionData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter
  const filteredTuitions = useMemo(() => {
    return tuitions.filter((t) => {
      const matchSearch =
        searchTerm === "" ||
        (t.studentName && t.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.invoiceCode && t.invoiceCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.className && t.className.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus =
        selectedStatus === "All" ||
        t.status.toLowerCase() === selectedStatus.toLowerCase();

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

  // KPI Calculations
  const totalDue = tuitions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const collected = tuitions
    .filter((t) => t.status.toLowerCase() === "paid")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const outstanding = tuitions
    .filter((t) => t.status.toLowerCase() === "pending" || t.status.toLowerCase() === "unpaid")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const overdueCount = tuitions.filter((t) => t.status.toLowerCase() === "overdue").length;

  const formatM = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    return `${num.toLocaleString("vi-VN")} đ`;
  };

  // View Receipt (GetById)
  const handleViewReceipt = async (tuitionId: number) => {
    try {
      const detail = await tuitionDAL.getTuitionById(tuitionId);
      setSelectedTuition(detail);
    } catch (err) {
      console.warn("Lỗi nạp chi tiết phiếu thu:", err);
    }
  };

  // Submit Generate Tuition
  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!genStudentName.trim()) return;

    const validIds = tuitions.map((t) => t.tuitionId || t.invoiceId || 0);
    const newId = validIds.length > 0 ? Math.max(...validIds) + 1 : 201;
    const newInvoice: TuitionDto = {
      invoiceId: newId,
      tuitionId: newId,
      studentId: 6,
      studentCode: "STU006",
      studentName: genStudentName.trim(),
      classId: 1,
      className: genClassName,
      amountDue: Number(genAmount) || 3500000,
      amount: Number(genAmount) || 3500000,
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
      status: "pending",
      invoiceCode: `INV${String(newId).padStart(4, "0")}`,
      createdAt: new Date().toISOString(),
    };

    setTuitions((prev) => [newInvoice, ...prev]);
    setIsGenerateModalOpen(false);
    setGenStudentName("");
    setActionSuccessMsg(`Đã lập hóa đơn #${newInvoice.invoiceCode} cho học viên "${newInvoice.studentName}" thành công!`);
    setTimeout(() => setActionSuccessMsg(null), 3500);
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
              onClick={() => setIsGenerateModalOpen(true)}
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

      {/* Tuition Summary KPIs */}
      <div className="row g-3 mb-4">
        <div className="col-xl-3 col-md-6">
          <KpiCard
            type="tuition"
            status="total"
            title="Tổng Doanh Thu Niêm Yết"
            value={formatM(totalDue)}
            footerValue="Học kỳ hiện tại"
          />
        </div>
        <div className="col-xl-3 col-md-6">
          <KpiCard
            type="tuition"
            status="collected"
            title="Đã Thu Thực Tế"
            value={formatM(collected)}
            footerValue={totalDue > 0 ? `${Math.round((collected / totalDue) * 100)}%` : "0%"}
            footerLabel="đã hoàn tất"
          />
        </div>
        <div className="col-xl-3 col-md-6">
          <KpiCard
            type="tuition"
            status="outstanding"
            title="Công Nợ Cần Thu"
            value={formatM(outstanding)}
            footerValue={totalDue > 0 ? `${Math.round((outstanding / totalDue) * 100)}%` : "0%"}
            footerLabel="còn lại"
          />
        </div>
        <div className="col-xl-3 col-md-6">
          <KpiCard
            type="tuition"
            status="overdue"
            title="Hóa Đơn Quá Hạn"
            value={overdueCount}
            footerValue={overdueCount}
            footerLabel="học viên cần nhắc phí"
          />
        </div>
      </div>

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
                <option value="pending">Chờ thanh toán (Pending)</option>
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
                      : "Pending";
                  const dueDateStr = t.dueDate ? new Date(t.dueDate).toLocaleDateString("vi-VN") : "15/09/2026";
                  const amountStr = t.amount ? `${t.amount.toLocaleString("vi-VN")} đ` : "3.500.000 đ";

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
                        <SubjectBadge subject={t.className || "Toán 12 Chuyên Sâu"} />
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
                    <span>{selectedTuition.dueDate ? new Date(selectedTuition.dueDate).toLocaleDateString("vi-VN") : "15/09/2026"}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center border-top pt-2">
                    <span className="text-muted small">Trạng thái</span>
                    <DotStatusBadge status={selectedTuition.status === "paid" ? "Paid" : "Pending"} />
                  </div>
                </div>
                <div className="text-center p-3 bg-success bg-opacity-10 rounded">
                  <small className="text-muted d-block">SỐ TIỀN THANH TOÁN</small>
                  <h3 className="fw-bold text-success mb-0">
                    {selectedTuition.amount ? `${selectedTuition.amount.toLocaleString("vi-VN")} VND` : "3.500.000 VND"}
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
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Tên học viên *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="VD: Lê Văn An"
                      required
                      value={genStudentName}
                      onChange={(e) => setGenStudentName(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Khóa học / Lớp đào tạo</label>
                    <select
                      className="form-select"
                      value={genClassName}
                      onChange={(e) => setGenClassName(e.target.value)}
                    >
                      <option value="Toán 12 Chuyên Sâu">Toán 12 Chuyên Sâu</option>
                      <option value="Vật Lý 12 Nâng Cao">Vật Lý 12 Nâng Cao</option>
                      <option value="Hóa Học 11 Cơ Bản">Hóa Học 11 Cơ Bản</option>
                      <option value="Tiếng Anh Giao Tiếp">Tiếng Anh Giao Tiếp</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Mức học phí (VND) *</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="3500000"
                      required
                      value={genAmount}
                      onChange={(e) => setGenAmount(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setIsGenerateModalOpen(false)}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1">
                    <i className="bi bi-check-lg" /> Phát hành hóa đơn
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
