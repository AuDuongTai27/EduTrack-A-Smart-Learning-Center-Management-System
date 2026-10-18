import { Link } from "react-router-dom";
import PageHeader from "../../../components/Common/PageHeader";
import DotStatusBadge from "../../../components/Common/DotStatusBadge";
import SubjectBadge from "../../../components/Common/SubjectBadge";
import { useState } from "react";
import Pagination from "../../../components/Common/Pagination";
import TableToolbar from "../../../components/Common/TableToolbar";
import UserAvatar from "../../../components/Common/UserAvatar";
import TableActionButton from "../../../components/Common/TableActionButton";

export default function AdminStaffTuitionPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const totalRecords = 128;

  return (
    <>
      {/* Breadcrumb and Quick Access */}
      <PageHeader
        title="Tuition Management"
        breadcrumbItems={[
          { label: "Admin Staff", path: "/admin-staff" },
          { label: "Tuition Management" },
        ]}
        action={
          <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
            <div className="mb-2">
              <button
                type="button"
                className="btn btn-primary d-flex align-items-center"
              >
                <i className="bi bi-plus-square me-2" />
                Generate Tuition
              </button>
            </div>
          </div>
        }
      />

      {/* Tuition Summary */}
      <div className="row g-3 mb-4">
        {/* Total Tuition Due */}
        <div className="col-xl-3 col-md-6">
          <div className="card dashboard-kpi h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted mb-1">Total Tuition Due</p>
                  <h3 className="mb-0">125M</h3>
                </div>
                <div className="kpi-icon bg-primary-subtle text-primary">
                  <i className="bi bi-receipt" />
                </div>
              </div>
              <div className="border-top mt-3 pt-3">
                <span className="text-muted">August 2026</span>
              </div>
            </div>
          </div>
        </div>
        {/* Collected */}
        <div className="col-xl-3 col-md-6">
          <div className="card dashboard-kpi h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted mb-1">Collected</p>
                  <h3 className="mb-0">85M</h3>
                </div>
                <div className="kpi-icon bg-success-subtle text-success">
                  <i className="bi bi-cash-stack" />
                </div>
              </div>
              <div className="border-top mt-3 pt-3">
                <span className="text-success">68% collected</span>
              </div>
            </div>
          </div>
        </div>
        {/* Outstanding */}
        <div className="col-xl-3 col-md-6">
          <div className="card dashboard-kpi h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted mb-1">Outstanding</p>
                  <h3 className="mb-0">40M</h3>
                </div>
                <div className="kpi-icon bg-warning-subtle text-warning">
                  <i className="bi bi-hourglass-split" />
                </div>
              </div>
              <div className="border-top mt-3 pt-3">
                <span className="text-muted">32% remaining</span>
              </div>
            </div>
          </div>
        </div>
        {/* Overdue */}
        <div className="col-xl-3 col-md-6">
          <div className="card dashboard-kpi h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted mb-1">Overdue</p>
                  <h3 className="mb-0">12M</h3>
                </div>
                <div className="kpi-icon bg-danger-subtle text-danger">
                  <i className="bi bi-exclamation-circle" />
                </div>
              </div>
              <div className="border-top mt-3 pt-3">
                <span className="text-danger">18 students</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Tuition List */}
      <div className="card user-list-card">
        {/* Filter */}
        <div className="card-header user-list-header">
          <div className="row g-3 align-items-center">
            {/* Search */}
            <div className="col-xl-3 col-lg-6">
              <div className="user-search">
                <i className="bi bi-search" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search student..."
                />
              </div>
            </div>
            {/* Tuition Period */}
            <div className="col-xl col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>All Periods</option>
                <option>August 2026</option>
                <option>September 2026</option>
                <option>October 2026</option>
              </select>
            </div>
            {/* Class */}
            <div className="col-xl col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>All Classes</option>
                <option>Class 7</option>
                <option>Class 8</option>
                <option>Class 9</option>
              </select>
            </div>
            {/* Subject */}
            <div className="col-xl col-lg-3 col-md-6">
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
            <div className="col-xl col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>All Statuses</option>
                <option>Paid</option>
                <option>Partially Paid</option>
                <option>Unpaid</option>
                <option>Overdue</option>
                <option>Pending Adjustment</option>
              </select>
            </div>
            {/* Sort */}
            <div className="col-xl col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>Sort by Newest</option>
                <option>Sort by Oldest</option>
                <option>Amount High-Low</option>
                <option>Amount Low-High</option>
              </select>
            </div>
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
        {/* Tuition Table */}
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
              {/* Tuition 1 */}
              <tr>
                <td>1</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <UserAvatar name="Nguyen Minh An" />
                    <h6 className="mb-0">Nguyen Minh An</h6>
                  </div>
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
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    <TableActionButton action="View / Edit" />
                    <TableActionButton action="Record Payment" />
                    <TableActionButton action="Change Status" />
                    <div className="dropdown">
                      <TableActionButton action="More" />
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-bell me-2" />
                            Send Reminder
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-calendar-plus me-2" />
                            Extend Due Date
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </td>
              </tr>
              {/* Tuition 2 */}
              <tr>
                <td>2</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <UserAvatar name="Tran Gia Huy" />
                    <h6 className="mb-0">Tran Gia Huy</h6>
                  </div>
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
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    <TableActionButton action="View / Edit" />
                    <TableActionButton action="Record Payment" />
                    <TableActionButton action="Change Status" />
                    <div className="dropdown">
                      <TableActionButton action="More" />
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-bell me-2" />
                            Send Reminder
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-calendar-plus me-2" />
                            Extend Due Date
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </td>
              </tr>
              {/* Tuition 3 */}
              <tr>
                <td>3</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <UserAvatar name="Le Minh Long" />
                    <h6 className="mb-0">Le Minh Long</h6>
                  </div>
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
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    <TableActionButton action="View / Edit" />
                    <TableActionButton action="Record Payment" />
                    <TableActionButton action="Change Status" />
                    <div className="dropdown">
                      <TableActionButton action="More" />
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-bell me-2" />
                            Send Reminder
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-calendar-plus me-2" />
                            Extend Due Date
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </td>
              </tr>
              {/* Tuition 4 */}
              <tr>
                <td>4</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <UserAvatar name="Pham Hoang Nam" />
                    <h6 className="mb-0">Pham Hoang Nam</h6>
                  </div>
                </td>
                <td>Class 8</td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    <SubjectBadge subject="Mathematics - 8" />
                  </div>
                </td>
                <td>August 2026</td>
                <td>
                  <strong>550,000 VND</strong>
                </td>
                <td>20 Aug 2026</td>
                <td>
                  <DotStatusBadge status="Pending Adjustment" />
                </td>
                <td className="text-center">
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    <TableActionButton action="View / Edit" />
                    <TableActionButton action="Record Payment" />
                    <TableActionButton action="Change Status" />
                    <div className="dropdown">
                      <TableActionButton action="More" />
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-bell me-2" />
                            Send Reminder
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-calendar-plus me-2" />
                            Extend Due Date
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
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
