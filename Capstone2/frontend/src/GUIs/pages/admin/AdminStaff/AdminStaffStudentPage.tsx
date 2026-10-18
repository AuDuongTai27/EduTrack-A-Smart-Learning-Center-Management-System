import { Link } from "react-router-dom";
import PageHeader from "../../../components/Common/PageHeader";
import DotStatusBadge from "../../../components/Common/DotStatusBadge";
import SubjectBadge from "../../../components/Common/SubjectBadge";
import { useState } from "react";
import Pagination from "../../../components/Common/Pagination";
import TableToolbar from "../../../components/Common/TableToolbar";
import UserAvatar from "../../../components/Common/UserAvatar";
import TableActionButton from "../../../components/Common/TableActionButton";

export default function AdminStaffStudentPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const totalStudents = 128;

  return (
    <>
      {/* Breadcrumb and Quick Access */}
      <PageHeader
        title="Student Management"
        breadcrumbItems={[
          { label: "Admin Staff", path: "/admin-staff" },
          { label: "Students" },
        ]}
        action={
          <button
            type="button"
            className="btn btn-primary d-flex align-items-center"
          >
            <i className="bi bi-plus-square me-2" />
            Add Student
          </button>
        }
      />

      {/* Student List */}
      <div className="card user-list-card">
        {/* Filter */}
        <div className="card-header user-list-header">
          <div className="row g-3 align-items-center">
            {/* Search */}
            <div className="col-xl-4 col-lg-6">
              <div className="user-search">
                <i className="bi bi-search" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by student name or parent phone..."
                />
              </div>
            </div>
            {/* Class */}
            <div className="col-xl-2 col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>All Classes</option>
                <option>Class 7</option>
                <option>Class 8</option>
                <option>Class 9</option>
              </select>
            </div>
            {/* Subject */}
            <div className="col-xl-2 col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>All Subjects</option>
                <option>Mathematics</option>
                <option>Chemistry</option>
                <option>Physics</option>
                <option>English</option>
              </select>
            </div>
            {/* Status */}
            <div className="col-xl-2 col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>All Statuses</option>
                <option>Active</option>
                <option>On Hold</option>
                <option>Inactive</option>
              </select>
            </div>
            {/* Sort */}
            <div className="col-xl-2 col-lg-3 col-md-6">
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
          totalItems={totalStudents}
          totalLabel="Total Students"
          entriesPerPage={entriesPerPage}
          onEntriesPerPageChange={(value) => {
            setEntriesPerPage(value);
            setCurrentPage(1);
          }}
        />
        {/* Student Table */}
        <div className="table-responsive">
          <table className="table user-table align-middle mb-0">
            <thead>
              <tr>
                <th className="fw-bold">No.</th>
                <th className="fw-bold">Student Name</th>
                <th className="fw-bold">Parent Name</th>
                <th className="fw-bold">Parent Phone</th>
                <th className="fw-bold">Class</th>
                <th className="fw-bold">Subjects</th>
                <th className="fw-bold">Status</th>
                <th className="text-center fw-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <UserAvatar name="Nguyen Minh An" />
                    <h6 className="mb-0">Nguyen Minh An</h6>
                  </div>
                </td>
                <td>Nguyen Van Binh</td>
                <td>0901 234 567</td>
                <td>Class 7</td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    <SubjectBadge subject="Mathematics - 7" />
                    <SubjectBadge subject="English - 7" />
                  </div>
                </td>
                <td>
                  <DotStatusBadge status="Active" />
                </td>
                <td className="text-center">
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    <TableActionButton action="View / Edit" />
                    <TableActionButton action="Change Status" />
                    <TableActionButton action="Record Payment" />
                    <div className="dropdown">
                      <TableActionButton action="More" />
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-person-lines-fill me-2" />
                            Parent Information
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-receipt me-2" />
                            Tuition Details
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td>2</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <UserAvatar name="Tran Gia Huy" />
                    <h6 className="mb-0">Tran Gia Huy</h6>
                  </div>
                </td>
                <td>Tran Quoc Minh</td>
                <td>0912 345 678</td>
                <td>Class 8</td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    <SubjectBadge subject="Chemistry - 8" />
                    <SubjectBadge subject="Mathematics - 8" />
                  </div>
                </td>
                <td>
                  <DotStatusBadge status="Active" />
                </td>
                <td className="text-center">
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    <TableActionButton action="View / Edit" />
                    <TableActionButton action="Change Status" />
                    <TableActionButton action="Record Payment" />
                    <div className="dropdown">
                      <TableActionButton action="More" />
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-person-lines-fill me-2" />
                            Parent Information
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-receipt me-2" />
                            Tuition Details
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td>3</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <UserAvatar name="Le Minh Long" />
                    <h6 className="mb-0">Le Minh Long</h6>
                  </div>
                </td>
                <td>Le Thanh Ha</td>
                <td>0988 765 432</td>
                <td>Class 9</td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    <SubjectBadge subject="Physics - 9" />
                    <SubjectBadge subject="English - 9" />
                  </div>
                </td>
                <td>
                  <DotStatusBadge status="On Hold" />
                </td>
                <td className="text-center">
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    <TableActionButton action="View / Edit" />
                    <TableActionButton action="Change Status" />
                    <TableActionButton action="Record Payment" />
                    <div className="dropdown">
                      <TableActionButton action="More" />
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-person-lines-fill me-2" />
                            Parent Information
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-receipt me-2" />
                            Tuition Details
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td>4</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <UserAvatar name="Pham Hoang Nam" />
                    <h6 className="mb-0">Pham Hoang Nam</h6>
                  </div>
                </td>
                <td>Pham Van Hung</td>
                <td>0934 567 890</td>
                <td>Class 8</td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    <SubjectBadge subject="Mathematics - 8" />
                    <SubjectBadge subject="Physics - 8" />
                    <SubjectBadge subject="Chemistry - 8" />
                    <SubjectBadge subject="English - 8" />
                  </div>
                </td>
                <td>
                  <DotStatusBadge status="Inactive" />
                </td>
                <td className="text-center">
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    <TableActionButton action="View / Edit" />
                    <TableActionButton action="Change Status" />
                    <TableActionButton action="Record Payment" />
                    <div className="dropdown">
                      <TableActionButton action="More" />
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-person-lines-fill me-2" />
                            Parent Information
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-receipt me-2" />
                            Tuition Details
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
          totalItems={totalStudents}
          entriesPerPage={entriesPerPage}
          itemLabel="students"
          onPageChange={setCurrentPage}
        />
      </div>
    </>
  );
}
