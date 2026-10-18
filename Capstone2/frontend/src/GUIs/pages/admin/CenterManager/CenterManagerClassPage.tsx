import PageHeader from "../../../components/Common/PageHeader";
import DotStatusBadge from "../../../components/Common/DotStatusBadge";
import { useState } from "react";
import Pagination from "../../../components/Common/Pagination";
import TableToolbar from "../../../components/Common/TableToolbar";
import TableActionButton from "../../../components/Common/TableActionButton";

export default function CenterManagerClassPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const totalClasses = 6;

  return (
    <>
      {/* Breadcrumb and Quick Access */}
      <PageHeader
        title="Class Management"
        breadcrumbItems={[
          { label: "Center Manager", path: "/center-manager" },
          { label: "Classes" },
        ]}
        action={
          <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
            <div className="mb-2">
              <button
                type="button"
                className="btn btn-primary d-flex align-items-center"
              >
                <i className="bi bi-plus-square me-2" />
                Add Class
              </button>
            </div>
          </div>
        }
      />

      {/* Class List */}
      <div className="card user-list-card">
        {/* Filter */}
        <div className="card-header user-list-header">
          <div className="row g-3 align-items-center">
            {/* Search */}
            <div className="col-xl-6 col-lg-6">
              <div className="user-search">
                <i className="bi bi-search" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by class name..."
                />
              </div>
            </div>
            {/* Status */}
            <div className="col-xl-3 col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>All Statuses</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            {/* Sort */}
            <div className="col-xl-3 col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>Sort by A-Z</option>
                <option>Sort by Z-A</option>
                <option>Newest</option>
                <option>Oldest</option>
              </select>
            </div>
          </div>
        </div>
        {/* Table Controls */}
        <TableToolbar
          totalItems={totalClasses}
          totalLabel="Total classes"
          entriesPerPage={entriesPerPage}
          onEntriesPerPageChange={(value) => {
            setEntriesPerPage(value);
            setCurrentPage(1);
          }}
        />
        {/* Class Table */}
        <div className="table-responsive">
          <table className="table user-table align-middle mb-0">
            <thead>
              <tr>
                <th className="fw-bold">No.</th>
                <th className="fw-bold">Class Name</th>
                <th className="fw-bold">Subjects</th>
                <th className="fw-bold">Students</th>
                <th className="fw-bold">Start Date</th>
                <th className="fw-bold">End Date</th>
                <th className="fw-bold">Status</th>
                <th className="text-center fw-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {/* Class 1 */}
              <tr>
                <td>1</td>
                <td>
                  <h6 className="mb-0">Class 7</h6>
                </td>
                <td>4 Subjects</td>
                <td>25 Students</td>
                <td>01 Aug 2026</td>
                <td>31 May 2027</td>
                <td>
                  <DotStatusBadge status="Active" />
                </td>
                <td className="text-center">
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    <TableActionButton
                      action="View / Edit"
                      target="#classDetailModal"
                    />

                    <TableActionButton
                      action="Change Status"
                      target="#changeClassStatusModal"
                    />

                    <TableActionButton action="Manage Subjects" />
                  </div>
                </td>
              </tr>
              {/* Class 2 */}
              <tr>
                <td>2</td>
                <td>
                  <h6 className="mb-0">Class 8</h6>
                </td>
                <td>5 Subjects</td>
                <td>30 Students</td>
                <td>01 Aug 2026</td>
                <td>31 May 2027</td>
                <td>
                  <DotStatusBadge status="Active" />
                </td>
                <td className="text-center">
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    <TableActionButton
                      action="View / Edit"
                      target="#classDetailModal"
                    />

                    <TableActionButton
                      action="Change Status"
                      target="#changeClassStatusModal"
                    />

                    <TableActionButton action="Manage Subjects" />
                  </div>
                </td>
              </tr>
              {/* Class 3 */}
              <tr>
                <td>3</td>
                <td>
                  <h6 className="mb-0">Class 9</h6>
                </td>
                <td>4 Subjects</td>
                <td>22 Students</td>
                <td>05 Aug 2026</td>
                <td>31 May 2027</td>
                <td>
                  <DotStatusBadge status="Active" />
                </td>
                <td className="text-center">
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    <TableActionButton
                      action="View / Edit"
                      target="#classDetailModal"
                    />

                    <TableActionButton
                      action="Change Status"
                      target="#changeClassStatusModal"
                    />

                    <TableActionButton action="Manage Subjects" />
                  </div>
                </td>
              </tr>
              {/* Class 4 */}
              <tr>
                <td>4</td>
                <td>
                  <h6 className="mb-0">Class 10</h6>
                </td>
                <td>5 Subjects</td>
                <td>28 Students</td>
                <td>10 Aug 2026</td>
                <td>31 May 2027</td>
                <td>
                  <DotStatusBadge status="Inactive" />
                </td>
                <td className="text-center">
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    <TableActionButton
                      action="View / Edit"
                      target="#classDetailModal"
                    />

                    <TableActionButton
                      action="Change Status"
                      target="#changeClassStatusModal"
                    />

                    <TableActionButton action="Manage Subjects" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={totalClasses}
          entriesPerPage={entriesPerPage}
          itemLabel="classes"
          onPageChange={setCurrentPage}
        />
      </div>
    </>
  );
}
