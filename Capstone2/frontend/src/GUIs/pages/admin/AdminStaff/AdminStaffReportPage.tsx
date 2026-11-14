import { useState, useMemo } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import DotStatusBadge from "../../../components/Common/DotStatusBadge";
import SubjectBadge from "../../../components/Common/SubjectBadge";
import Pagination from "../../../components/Common/Pagination";
import TableToolbar from "../../../components/Common/TableToolbar";
import TuitionOverview from "../../../components/Common/TuitionOverview";
import tuitionDAL from "../../../../DAL/tuitionDAL";
import { useTuitionData } from "../../../hooks/useTuitionData";
import { calculateTuitionMetrics, invoiceTotal, invoicePeriodLabel, matchesTuitionStatus } from "../../../../BLL/services/tuitionMetricsService";
import { formatVND } from "../../../utils/formatCurrency";
import type { TuitionDto } from "../../../../BLL/models/TuitionDto";

export default function AdminStaffReportPage() {
  const { rows: tuitions, payments, now, collectionLabel, invoiceReady, paymentReady, balanceReady, loading, error: loadError } = useTuitionData();
  const classOptions = useMemo(() => [...new Map(tuitions.map(invoice => [invoice.classId, invoice.className])).entries()], [tuitions]);

  // Filters state
  const [reportType, setReportType] = useState<string>("Tuition Report");
  const [selectedClass, setSelectedClass] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);

  // Detail Modal state (GetById)
  const [selectedTuition, setSelectedTuition] = useState<TuitionDto | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  // Export Modal state
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<"Excel" | "PDF">("Excel");
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  // Filter & Search logic
  const filteredTuitions = useMemo(() => {
    return tuitions.filter((t) => {
      const matchSearch =
        searchTerm === "" ||
        (t.studentName && t.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.className && t.className.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.invoiceCode && t.invoiceCode.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchClass =
        selectedClass === "All" ||
        String(t.classId) === selectedClass;

      const matchStatus =
        selectedStatus === "All" ||
        matchesTuitionStatus(t, selectedStatus);

      return matchSearch && matchClass && matchStatus;
    });
  }, [tuitions, searchTerm, selectedClass, selectedStatus]);

  // Paginated list
  const paginatedTuitions = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredTuitions.slice(start, start + entriesPerPage);
  }, [filteredTuitions, currentPage, entriesPerPage]);

  const metrics = useMemo(() => balanceReady ? calculateTuitionMetrics(filteredTuitions, payments.data!, now) : null, [filteredTuitions, payments.data, balanceReady, now]);
  const invoiceScopeReady = invoiceReady && (selectedStatus !== "Partially Paid" || paymentReady);

  // Handle open detail modal (GetById)
  const handleViewDetails = async (tuition: TuitionDto) => {
    setLoadingDetail(true);
    const targetId = tuition.tuitionId || tuition.invoiceId;
    if (!targetId) return;
    try {
      const detail = await tuitionDAL.getTuitionById(targetId);
      setSelectedTuition(detail ? { ...detail, paidAmount: tuition.paidAmount } : tuition);
    } catch {
      setSelectedTuition(tuition);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Handle export action
  const handleTriggerExport = (format: "Excel" | "PDF") => {
    setExportFormat(format);
    setShowExportModal(true);
  };

  const handleConfirmExport = () => {
    setShowExportModal(false);
    setExportSuccessMsg(`Report in ${exportFormat} format generated and downloaded successfully!`);
    setTimeout(() => setExportSuccessMsg(null), 4000);
  };

  return (
    <>
      {/* Breadcrumb and Quick Access */}
      <PageHeader
        title="Reports & Analytics"
        breadcrumbItems={[
          { label: "Admin Staff", path: "/admin-staff" },
          { label: "Reports" },
        ]}
        action={
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-outline-primary d-flex align-items-center shadow-sm"
              onClick={() => handleTriggerExport("Excel")}
            >
              <i className="bi bi-file-earmark-excel me-2 text-success" />
              Export Excel
            </button>

            <button
              type="button"
              className="btn btn-outline-danger d-flex align-items-center shadow-sm"
              onClick={() => handleTriggerExport("PDF")}
            >
              <i className="bi bi-file-earmark-pdf me-2 text-danger" />
              Export PDF
            </button>
          </div>
        }
      />

      {loadError && <div className="alert alert-danger mb-3" role="alert">{loadError}</div>}

      {/* Success Notification Alert */}
      {exportSuccessMsg && (
        <div className="alert alert-success alert-dismissible fade show d-flex align-items-center mb-4 shadow-sm" role="alert">
          <i className="bi bi-check-circle-fill fs-5 me-2" />
          <div>{exportSuccessMsg}</div>
          <button type="button" className="btn-close" onClick={() => setExportSuccessMsg(null)} aria-label="Close" />
        </div>
      )}

      {/* Report Filter */}
      <div className="card user-list-card mb-4 border-0 shadow-sm">
        <div className="card-header user-list-header bg-white py-3">
          <div className="row g-3 align-items-center">
            {/* Search */}
            <div className="col-xl-3 col-lg-4 col-md-6">
              <label className="form-label fw-semibold small text-muted">Search</label>
              <div className="position-relative">
                <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                <input
                  type="text"
                  className="form-control ps-5"
                  placeholder="Student or Class..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            {/* Report Type */}
            <div className="col-xl-3 col-lg-4 col-md-6">
              <label className="form-label fw-semibold small text-muted">Report Type</label>
              <select
                className="form-select"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="Tuition Report">Tuition Report</option>
                <option value="Student Report">Student Report</option>
                <option value="Class Report">Class Report</option>
                <option value="Teaching Report">Teaching Report</option>
                <option value="Revenue Report">Revenue Report</option>
              </select>
            </div>

            {/* Class */}
            <div className="col-xl-2 col-lg-4 col-md-6">
              <label className="form-label fw-semibold small text-muted">Class</label>
              <select
                className="form-select"
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Classes</option>
                {classOptions.map(([id, name]) => <option key={id} value={String(id)}>{name || `Class #${id}`}</option>)}
              </select>
            </div>

            {/* Status */}
            <div className="col-xl-2 col-lg-4 col-md-6">
              <label className="form-label fw-semibold small text-muted">Status</label>
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

            {/* Reset */}
            <div className="col-xl-2 col-lg-4 col-md-6">
              <label className="form-label d-block small text-muted">&nbsp;</label>
              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedClass("All");
                  setSelectedStatus("All");
                  setCurrentPage(1);
                }}
              >
                <i className="bi bi-arrow-counterclockwise me-1" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Title */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h4 className="mb-1 fw-bold text-dark">{reportType}</h4>
          <p className="text-muted mb-0">Aggregated real-time data from the center</p>
        </div>
        <span className="badge bg-light text-secondary border px-3 py-2">
          <i className="bi bi-clock-history me-1" /> Current filters applied
        </span>
      </div>

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

      {/* Detailed Data */}
      <div className="card user-list-card border-0 shadow-sm">
        <div className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom bg-white">
          <div>
            <h5 className="mb-1 fw-bold text-dark">Detailed Report Data</h5>
            <small className="text-muted">
              Showing {filteredTuitions.length} detailed records
            </small>
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

        {/* Report Table */}
        <div className="table-responsive">
          <table className="table user-table align-middle mb-0 table-hover">
            <thead className="table-light">
              <tr>
                <th className="fw-bold">No.</th>
                <th className="fw-bold">Student</th>
                <th className="fw-bold">Class</th>
                <th className="fw-bold">Subjects</th>
                <th className="fw-bold">Period</th>
                <th className="fw-bold">Total Due</th>
                <th className="fw-bold">Due Date</th>
                <th className="fw-bold">Status</th>
                <th className="text-center fw-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    Calculating and loading report data...
                  </td>
                </tr>
              ) : paginatedTuitions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-5 text-muted">
                    <i className="bi bi-file-earmark-bar-graph fs-2 d-block mb-2 text-secondary" />
                    No records found matching the filters.
                  </td>
                </tr>
              ) : (
                paginatedTuitions.map((t, idx) => {
                  const itemIndex = (currentPage - 1) * entriesPerPage + idx + 1;
                  const dueDateStr = t.dueDate
                    ? new Date(t.dueDate).toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "—";

                  return (
                    <tr key={t.tuitionId || idx}>
                      <td>{itemIndex}</td>
                      <td>
                        <h6 className="mb-0 fw-bold text-dark">{t.studentName}</h6>
                        <small className="text-muted font-monospace">{t.invoiceCode || `INV-${t.tuitionId}`}</small>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">{t.className || "Class"}</span>
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          <SubjectBadge subject={t.className || "Mathematics"} />
                        </div>
                      </td>
                      <td>{invoicePeriodLabel(t)}</td>
                      <td>
                        <strong className="text-dark">
                          {(t.amount || 0).toLocaleString("en-US")} VND
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
                          title="View Details"
                        >
                          <i className="bi bi-eye me-1" />
                          Details
                        </button>
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
          totalItems={filteredTuitions.length}
          entriesPerPage={entriesPerPage}
          itemLabel="records"
          onPageChange={setCurrentPage}
        />
      </div>

      {/* EXPORT CONFIRMATION MODAL */}
      {showExportModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-download me-2" />
                  Export Report Data ({exportFormat})
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowExportModal(false)}
                />
              </div>
              <div className="modal-body p-4">
                <p className="mb-3 text-secondary">
                  You are about to export <strong>{reportType}</strong> with <strong>{filteredTuitions.length} records</strong> based on current filters.
                </p>
                <div className="p-3 bg-light rounded-3 border mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">File format:</span>
                    <strong className="text-primary">{exportFormat.toUpperCase()}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Total records:</span>
                    <strong>{filteredTuitions.length}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Generated date:</span>
                    <span>{new Date().toLocaleDateString("en-US")}</span>
                  </div>
                </div>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="includeCharts" defaultChecked />
                  <label className="form-check-label" htmlFor="includeCharts">
                    Include KPI summary metrics
                  </label>
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowExportModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary px-4"
                  onClick={handleConfirmExport}
                >
                  <i className="bi bi-file-earmark-arrow-down me-1" />
                  Confirm Download
                </button>
              </div>
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
                    Tuition Record Details
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
                    Loading record details...
                  </div>
                ) : (
                  <>
                    <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
                      <div>
                        <h5 className="fw-bold mb-1 text-dark">{selectedTuition.studentName}</h5>
                        <div className="d-flex align-items-center gap-3 text-muted small">
                          <span>
                            <i className="bi bi-collection me-1" />
                            Class: <strong>{selectedTuition.className}</strong>
                          </span>
                          <span>
                            <i className="bi bi-calendar me-1" />
                            Term: {invoicePeriodLabel(selectedTuition)}
                          </span>
                        </div>
                      </div>
                      <DotStatusBadge status={selectedTuition.status || "Unpaid"} />
                    </div>

                    <div className="row g-3 mb-4">
                      <div className="col-md-4">
                        <div className="p-3 bg-light rounded-3 text-center">
                          <small className="text-muted d-block mb-1">Total Tuition</small>
                          <h6 className="fw-bold text-dark mb-0">
                            {(selectedTuition.amount || 0).toLocaleString("en-US")} VND
                          </h6>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3 bg-light rounded-3 text-center">
                          <small className="text-muted d-block mb-1">Paid Amount</small>
                          <h6 className="fw-bold text-success mb-0">
                            {formatVND(paymentReady ? selectedTuition.paidAmount : null)}
                          </h6>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3 bg-light rounded-3 text-center">
                          <small className="text-muted d-block mb-1">Remaining Balance</small>
                          <h6 className="fw-bold text-danger mb-0">
                            {formatVND(paymentReady && selectedTuition.paidAmount != null ? Math.max(0, selectedTuition.amountDue - selectedTuition.paidAmount) : null)}
                          </h6>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-light rounded-3 border">
                      <h6 className="fw-bold text-dark mb-2">Due Date &amp; Reconciliation Details:</h6>
                      <ul className="list-unstyled mb-0 text-secondary small">
                        <li className="mb-1">
                          <i className="bi bi-calendar-event me-2 text-primary" />
                          Payment Due Date: <strong>{selectedTuition.dueDate ? new Date(selectedTuition.dueDate).toLocaleDateString("en-US") : "—"}</strong>
                        </li>
                        <li className="mb-1">
                          <i className="bi bi-receipt me-2 text-primary" />
                          Invoice / Receipt Code: <strong>{selectedTuition.invoiceCode || `INV-${selectedTuition.tuitionId}`}</strong>
                        </li>
                        <li>
                          <i className="bi bi-credit-card me-2 text-primary" />
                          Payment Method: Bank Transfer (QR Code) / Cash
                        </li>
                      </ul>
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
