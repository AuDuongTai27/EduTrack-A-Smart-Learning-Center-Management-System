import PageHeader from "../../../components/Common/PageHeader";
import DotStatusBadge from "../../../components/Common/DotStatusBadge";
import SubjectBadge from "../../../components/Common/SubjectBadge";
import { useState } from "react";
import Pagination from "../../../components/Common/Pagination";
import TableToolbar from "../../../components/Common/TableToolbar";
import TableActionButton from "../../../components/Common/TableActionButton";
import KpiCard from "../../../components/Common/KpiCard";

export default function CenterManagerReportPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const totalRecords = 128;

  return (
    <>
      {/* Breadcrumb and Quick Access */}
      <PageHeader
        title="Reports"
        breadcrumbItems={[
          { label: "Center Manager", path: "/center-manager" },
          { label: "Reports" },
        ]}
        action={
          <div className="d-flex align-items-center gap-2 mb-2">
            <button
              type="button"
              className="btn btn-outline-primary d-flex align-items-center"
            >
              <i className="bi bi-file-earmark-excel me-2" />
              Export Excel
            </button>
            <button
              type="button"
              className="btn btn-outline-danger d-flex align-items-center"
            >
              <i className="bi bi-file-earmark-pdf me-2" />
              Export PDF
            </button>
          </div>
        }
      />

      {/* Report Filter */}
      <div className="card user-list-card mb-4">
        <div className="card-header user-list-header">
          <div className="row g-3 align-items-center">
            {/* Report Type */}
            <div className="col-xl-3 col-lg-4 col-md-6">
              <label className="form-label fw-semibold">Report Type</label>
              <select className="form-select">
                <option>Student Report</option>
                <option>Class Report</option>
                <option>Teaching Report</option>
                <option>Attendance &amp; Progress Report</option>
                <option selected>Tuition Report</option>
                <option>Revenue Report</option>
              </select>
            </div>
            {/* Time Range */}
            <div className="col-xl-2 col-lg-4 col-md-6">
              <label className="form-label fw-semibold">Time Range</label>
              <select className="form-select">
                <option>This Month</option>
                <option selected>August 2026</option>
                <option>Last Month</option>
                <option>This Quarter</option>
                <option>This Year</option>
              </select>
            </div>
            {/* Class */}
            <div className="col-xl-2 col-lg-4 col-md-6">
              <label className="form-label fw-semibold">Class</label>
              <select className="form-select">
                <option selected>All Classes</option>
                <option>Class 7</option>
                <option>Class 8</option>
                <option>Class 9</option>
              </select>
            </div>
            {/* Subject */}
            <div className="col-xl-2 col-lg-4 col-md-6">
              <label className="form-label fw-semibold">Subject</label>
              <select className="form-select">
                <option selected>All Subjects</option>
                <option>Mathematics</option>
                <option>Physics</option>
                <option>Chemistry</option>
                <option>English</option>
                <option>Biology</option>
              </select>
            </div>
            {/* Status */}
            <div className="col-xl-2 col-lg-4 col-md-6">
              <label className="form-label fw-semibold">Status</label>
              <select className="form-select">
                <option selected>All Statuses</option>
                <option>Paid</option>
                <option>Partially Paid</option>
                <option>Unpaid</option>
                <option>Overdue</option>
              </select>
            </div>
            {/* Apply */}
            <div className="col-xl-1 col-lg-4 col-md-6">
              <label className="form-label d-block">&nbsp;</label>
              <button type="button" className="btn btn-primary w-100">
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Report Title */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h4 className="mb-1 fw-bold">Tuition Report</h4>
          <p className="text-muted mb-0">Tuition overview for August 2026</p>
        </div>
      </div>
      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        {/* Total Tuition Due */}
        <div className="col-xl-3 col-md-6">
          <KpiCard
            type="tuition"
            status="total"
            title="Total Tuition Due"
            value="125M"
            footerValue="128 tuition records"
          />
        </div>

        {/* Collected */}
        <div className="col-xl-3 col-md-6">
          <KpiCard
            type="tuition"
            status="collected"
            title="Collected"
            value="85M"
            footerValue="68%"
            footerLabel="collected"
          />
        </div>

        {/* Outstanding */}
        <div className="col-xl-3 col-md-6">
          <KpiCard
            type="tuition"
            status="outstanding"
            title="Outstanding"
            value="40M"
            footerValue="32%"
            footerLabel="remaining"
          />
        </div>

        {/* Overdue */}
        <div className="col-xl-3 col-md-6">
          <KpiCard
            type="tuition"
            status="overdue"
            title="Overdue"
            value="12M"
            footerValue={18}
            footerLabel="students"
          />
        </div>
      </div>
      {/* Report Charts */}
      <div className="row g-4 mb-4">
        {/* Tuition by Month */}
        <div className="col-xl-7">
          <div className="card dashboard-card h-100">
            <div className="dashboard-card-header">
              <div>
                <h5>Tuition by Month</h5>
                <small>Collected and outstanding tuition</small>
              </div>
            </div>
            <div className="dashboard-card-body">
              <div className="report-chart-container">
                <canvas id="tuitionReportChart" />
              </div>
            </div>
          </div>
        </div>
        {/* Payment Status */}
        <div className="col-xl-5">
          <div className="card dashboard-card h-100">
            <div className="dashboard-card-header">
              <div>
                <h5>Payment Status</h5>
                <small>Distribution of tuition records</small>
              </div>
            </div>
            <div className="dashboard-card-body">
              <div className="report-doughnut-container">
                <canvas id="paymentStatusChart" />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Detailed Data */}
      <div className="card user-list-card">
        <div className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom">
          <div>
            <h5 className="mb-1 fw-bold">Detailed Data</h5>
            <small className="text-muted">
              Tuition records included in this report
            </small>
          </div>
        </div>
        {/* Table Controls */}
        <TableToolbar
          totalItems={totalRecords}
          totalLabel="Total records"
          entriesPerPage={entriesPerPage}
          onEntriesPerPageChange={(value) => {
            setEntriesPerPage(value);
            setCurrentPage(1);
          }}
        />
        {/* Report Table */}
        <div className="table-responsive">
          <table className="table user-table align-middle mb-0">
            <thead>
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
              <tr>
                <td>1</td>
                <td>
                  <h6 className="mb-0">Nguyen Minh An</h6>
                </td>
                <td>Class 7</td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    <SubjectBadge subject="Mathematics - 7" />
                    <SubjectBadge subject="English - 7" />
                  </div>
                </td>
                <td>August 2026</td>
                <td>
                  <strong>1,000,000 VND</strong>
                </td>
                <td>15 Aug 2026</td>
                <td>
                  <DotStatusBadge status="Partially Paid" />
                </td>
                <td className="text-center">
                  <TableActionButton action="View Details" />
                </td>
              </tr>
              <tr>
                <td>2</td>
                <td>
                  <h6 className="mb-0">Tran Gia Huy</h6>
                </td>
                <td>Class 8</td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    <SubjectBadge subject="Chemistry - 8" />
                    <SubjectBadge subject="Mathematics - 8" />
                  </div>
                </td>
                <td>August 2026</td>
                <td>
                  <strong>1,100,000 VND</strong>
                </td>
                <td>15 Aug 2026</td>
                <td>
                  <DotStatusBadge status="Paid" />
                </td>
                <td className="text-center">
                  <TableActionButton action="View Details" />
                </td>
              </tr>
              <tr>
                <td>3</td>
                <td>
                  <h6 className="mb-0">Le Minh Long</h6>
                </td>
                <td>Class 9</td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    <SubjectBadge subject="Physics - 9" />
                    <SubjectBadge subject="English - 9" />
                  </div>
                </td>
                <td>August 2026</td>
                <td>
                  <strong>1,200,000 VND</strong>
                </td>
                <td>10 Aug 2026</td>
                <td>
                  <DotStatusBadge status="Overdue" />
                </td>
                <td className="text-center">
                  <TableActionButton action="View Details" />
                </td>
              </tr>
              <tr>
                <td>4</td>
                <td>
                  <h6 className="mb-0">Pham Hoang Nam</h6>
                </td>
                <td>Class 8</td>
                <td>
                  <SubjectBadge subject="Mathematics - 8" />
                </td>
                <td>August 2026</td>
                <td>
                  <strong>550,000 VND</strong>
                </td>
                <td>20 Aug 2026</td>
                <td>
                  <DotStatusBadge status="Unpaid" />
                </td>
                <td className="text-center">
                  <TableActionButton action="View Details" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={totalRecords}
          entriesPerPage={entriesPerPage}
          itemLabel="records"
          onPageChange={setCurrentPage}
        />
      </div>
    </>
  );
}
