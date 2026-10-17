import PageHeader from "../../../components/Common/PageHeader";
import DotStatusBadge from "../../../components/Common/DotStatusBadge";
import { useState } from "react";
import Pagination from "../../../components/Common/Pagination";
import TableToolbar from "../../../components/Common/TableToolbar";

export default function CenterManagerSubjectPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const totalSubjects = 5;

  return (
    <>
      {/* Breadcrumb and Quick Access */}
      <PageHeader
        title="Subject Management"
        breadcrumbItems={[
          { label: "Center Manager", path: "/center-manager" },
          { label: "Subjects Management" },
        ]}
        action={
          <button
            type="button"
            className="btn btn-primary d-flex align-items-center"
          >
            <i className="bi bi-plus-square me-2" />
            Add Subject
          </button>
        }
      />

      {/* Subject List */}
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
                  placeholder="Search by subject name..."
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
          totalItems={totalSubjects}
          totalLabel="Total subjects"
          entriesPerPage={entriesPerPage}
          onEntriesPerPageChange={(value) => {
            setEntriesPerPage(value);
            setCurrentPage(1);
          }}
        />
        {/* Subject Table */}
        <div className="table-responsive">
          <table className="table user-table align-middle mb-0">
            <thead>
              <tr>
                <th className="fw-bold">No.</th>
                <th className="fw-bold">Subject Name</th>
                <th className="fw-bold">Description</th>
                <th className="fw-bold">Status</th>
                <th className="text-center fw-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <h6 className="mb-0">Mathematics</h6>
                  </div>
                </td>
                <td>
                  Mathematics courses for students at the learning center.
                </td>
                <td>
                  <DotStatusBadge status="Active" />
                </td>
                <td className="text-center">
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="View / Edit"
                      data-bs-toggle="modal"
                      data-bs-target="#subjectDetailModal"
                    >
                      <i className="bi bi-pencil-square" />
                    </button>
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="Change Status"
                      data-bs-toggle="modal"
                      data-bs-target="#changeSubjectStatusModal"
                    >
                      <i className="bi bi-arrow-repeat" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>2</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <h6 className="mb-0">Physics</h6>
                  </div>
                </td>
                <td>
                  Physics courses covering theory and practical exercises.
                </td>
                <td>
                  <DotStatusBadge status="Active" />
                </td>
                <td className="text-center">
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="View / Edit"
                    >
                      <i className="bi bi-pencil-square" />
                    </button>
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="Change Status"
                    >
                      <i className="bi bi-arrow-repeat" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>3</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <h6 className="mb-0">Chemistry</h6>
                  </div>
                </td>
                <td>Chemistry courses including theory and problem solving.</td>
                <td>
                  <DotStatusBadge status="Active" />
                </td>
                <td className="text-center">
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="View / Edit"
                    >
                      <i className="bi bi-pencil-square" />
                    </button>
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="Change Status"
                    >
                      <i className="bi bi-arrow-repeat" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>4</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <h6 className="mb-0">English</h6>
                  </div>
                </td>
                <td>
                  English courses focusing on communication and language skills.
                </td>
                <td>
                  <DotStatusBadge status="Active" />
                </td>
                <td className="text-center">
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="View / Edit"
                    >
                      <i className="bi bi-pencil-square" />
                    </button>
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="Change Status"
                    >
                      <i className="bi bi-arrow-repeat" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>5</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <h6 className="mb-0">Biology</h6>
                  </div>
                </td>
                <td>
                  Biology courses covering fundamental biological concepts.
                </td>
                <td>
                  <DotStatusBadge status="Inactive" />
                </td>
                <td className="text-center">
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="View / Edit"
                    >
                      <i className="bi bi-pencil-square" />
                    </button>
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="Change Status"
                    >
                      <i className="bi bi-arrow-repeat" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={totalSubjects}
          entriesPerPage={entriesPerPage}
          itemLabel="subjects"
          onPageChange={setCurrentPage}
        />
      </div>
    </>
  );
}
