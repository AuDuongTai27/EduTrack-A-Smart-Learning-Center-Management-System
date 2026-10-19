import { Link } from "react-router-dom";
import PageHeader from "../../../components/Common/PageHeader";
import DotStatusBadge from "../../../components/Common/DotStatusBadge";
import SubjectBadge from "../../../components/Common/SubjectBadge";
import { useState } from "react";
import Pagination from "../../../components/Common/Pagination";
import TableToolbar from "../../../components/Common/TableToolbar";
import UserAvatar from "../../../components/Common/UserAvatar";
import RoleBadge from "../../../components/Common/RoleBadge";
import TableActionButton from "../../../components/Common/TableActionButton";

export default function CenterManagerUserAccountPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const totalUsers = 24;
  return (
    <>
      {/* Breadcrumb and Quick Access */}
      <PageHeader
        title="User Account Management"
        breadcrumbItems={[
          { label: "Center Manager", path: "/center-manager" },
          { label: "User Accounts" },
        ]}
        action={
          <button
            type="button"
            className="btn btn-primary d-flex align-items-center"
          >
            <i className="bi bi-plus-square me-2" />
            Add User
          </button>
        }
      />

      {/* User Accounts List */}
      <div className="card user-list-card">
        {/* Filter */}
        <div className="card-header user-list-header">
          <div className="row g-3 align-items-center">
            <div className="col-xl-4 col-lg-6">
              <div className="user-search">
                <i className="bi bi-search" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name or phone..."
                />
              </div>
            </div>
            <div className="col-xl-2 col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>All Specialties</option>
                <option>Mathematics</option>
                <option>Physics</option>
                <option>Chemistry</option>
                <option>English</option>
              </select>
            </div>
            <div className="col-xl-2 col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>All Roles</option>
                <option>Center Manager</option>
                <option>Admin Staff</option>
                <option>Teacher</option>
                <option>Teaching Assistant</option>
              </select>
            </div>
            <div className="col-xl-2 col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>All Statuses</option>
                <option>Active</option>
                <option>Inactive</option>
                <option>Locked</option>
              </select>
            </div>
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
          totalItems={totalUsers}
          totalLabel="Total users"
          entriesPerPage={entriesPerPage}
          onEntriesPerPageChange={(value) => {
            setEntriesPerPage(value);
            setCurrentPage(1);
          }}
        />
        {/* User Table */}
        <div className="table-responsive">
          <table className="table user-table align-middle mb-0">
            <thead>
              <tr>
                <th className="fw-bold">No.</th>
                <th className="fw-bold">Full Name</th>
                <th className="fw-bold">Phone</th>
                <th className="fw-bold">Specialty</th>
                <th className="fw-bold">Role</th>
                <th className="fw-bold">Note</th>
                <th className="fw-bold">Status</th>
                <th className="text-center fw-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <UserAvatar name="Huỳnh Khánh Duy" />
                    <h6 className="mb-0">Huỳnh Khánh Duy</h6>
                  </div>
                </td>
                <td>0901 234 567</td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    <SubjectBadge subject="Mathematics" />
                    <SubjectBadge subject="Chemistry" />
                    <SubjectBadge subject="Physics" />
                  </div>
                </td>
                <td>
                  <RoleBadge role="Teacher" />
                </td>
                <td>
                  <span className="user-note">Main teacher - Grade 12</span>
                </td>
                <td>
                  <DotStatusBadge status="Active" />
                </td>
                <td className="text-center">
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    <TableActionButton
                      action="View / Edit"
                      target="#userDetailModal"
                    />
                    <TableActionButton
                      action="Change Status"
                      target="#changeStatusModal"
                    />
                    <div className="dropdown">
                      <button
                        className="btn table-action-btn"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        title="More actions"
                      >
                        <i className="bi bi-three-dots-vertical" />
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-person-gear me-2" />
                            Edit Role
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-key me-2" />
                            Reset Password
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
                    <UserAvatar name="Âu Dương Tài" />
                    <h6 className="mb-0">Âu Dương Tài</h6>
                  </div>
                </td>
                <td>0912 456 789</td>
                <td>
                  <SubjectBadge subject="Chemistry" />
                </td>
                <td>
                  <RoleBadge role="Teaching Assistant" />
                </td>
                <td>
                  <span className="user-note">Supports Grade 11</span>
                </td>
                <td>
                  <DotStatusBadge status="Active" />
                </td>
                <td className="text-center">
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    <TableActionButton
                      action="View / Edit"
                      target="#userDetailModal"
                    />
                    <TableActionButton
                      action="Change Status"
                      target="#changeStatusModal"
                    />
                    <div className="dropdown">
                      <button
                        className="btn table-action-btn"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        title="More actions"
                      >
                        <i className="bi bi-three-dots-vertical" />
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-person-gear me-2" />
                            Edit Role
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-key me-2" />
                            Reset Password
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
                    <UserAvatar name="Hoàng Quốc Việt" />
                    <h6 className="mb-0">Hoàng Quốc Việt</h6>
                  </div>
                </td>
                <td>0988 765 432</td>
                <td>
                  <span className="text-muted">—</span>
                </td>
                <td>
                  <RoleBadge role="Admin Staff" />
                </td>
                <td>
                  <span className="user-note">Tuition management</span>
                </td>
                <td>
                  <DotStatusBadge status="Inactive" />
                </td>
                <td className="text-center">
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    <TableActionButton
                      action="View / Edit"
                      target="#userDetailModal"
                    />
                    <TableActionButton
                      action="Change Status"
                      target="#changeStatusModal"
                    />
                    <div className="dropdown">
                      <button
                        className="btn table-action-btn"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        title="More actions"
                      >
                        <i className="bi bi-three-dots-vertical" />
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-person-gear me-2" />
                            Edit Role
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-key me-2" />
                            Reset Password
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
                    <UserAvatar name="No Name ABC" />
                    <h6 className="mb-0">No Name ABC</h6>
                  </div>
                </td>
                <td>0934 111 222</td>
                <td>
                  <SubjectBadge subject="English" />
                </td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    <RoleBadge role="Teacher" />
                    <RoleBadge role="Center Manager" />
                  </div>
                </td>
                <td>
                  <span className="user-note">Center owner</span>
                </td>
                <td>
                  <DotStatusBadge status="Locked" />
                </td>
                <td className="text-center">
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    <TableActionButton
                      action="View / Edit"
                      target="#userDetailModal"
                    />
                    <TableActionButton
                      action="Change Status"
                      target="#changeStatusModal"
                    />
                    <div className="dropdown">
                      <button
                        className="btn table-action-btn"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        title="More actions"
                      >
                        <i className="bi bi-three-dots-vertical" />
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-person-gear me-2" />
                            Edit Role
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-key me-2" />
                            Reset Password
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
          totalItems={totalUsers}
          entriesPerPage={entriesPerPage}
          itemLabel="users"
          onPageChange={setCurrentPage}
        />
      </div>
    </>
  );
}
