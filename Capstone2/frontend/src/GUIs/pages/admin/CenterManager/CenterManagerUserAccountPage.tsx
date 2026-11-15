import { useState, useEffect, useMemo } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import DotStatusBadge from "../../../components/Common/DotStatusBadge";
import SubjectBadge from "../../../components/Common/SubjectBadge";
import Pagination from "../../../components/Common/Pagination";
import TableToolbar from "../../../components/Common/TableToolbar";
import UserAvatar from "../../../components/Common/UserAvatar";
import RoleBadge from "../../../components/Common/RoleBadge";
import TableActionButton from "../../../components/Common/TableActionButton";
import userDAL from "../../../../DAL/userDAL";
import managementDAL from "../../../../DAL/managementDAL";
import type { UserDto } from "../../../../BLL/models/UserDto";

const INTERNAL_STAFF_ROLES = ["center_manager", "admin_staff", "teacher", "teaching_assistant"];

export default function CenterManagerUserAccountPage() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedSort, setSelectedSort] = useState<string>("az");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);

  // Detail Modal state (GetById)
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  // Add User Modal state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [addForm, setAddForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    role: "teacher",
    specialty: "Mathematics",
    gender: "male",
  });

  // Edit User Modal state
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editForm, setEditForm] = useState({
    userId: 0,
    userCode: "",
    fullName: "",
    phone: "",
    email: "",
    role: "teacher",
    specialty: "",
    gender: "male",
    status: "active",
  });

  // Delete User Modal state
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<UserDto | null>(null);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchUsers() {
      try {
        setLoading(true);
        const res = await userDAL.getAllUsers();
        if (isMounted && res.data) {
          // Important note: Only manage internal staff (center_manager, admin_staff, teacher, teaching_assistant)
          const staffOnly = res.data.filter((u) =>
            u.roles && u.roles.some((r) => INTERNAL_STAFF_ROLES.includes(r.toLowerCase()))
          );
          setUsers(staffOnly);
        }
      } catch (err) {
        console.warn("Failed to load user accounts:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchUsers();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter & Search logic
  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => {
        const matchSearch =
          searchTerm === "" ||
          u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (u.phone && u.phone.includes(searchTerm)) ||
          (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (u.userCode && u.userCode.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchRole =
          selectedRole === "All" ||
          (u.roles && u.roles.some((r) => r.toLowerCase() === selectedRole.toLowerCase()));

        const matchStatus =
          selectedStatus === "All" ||
          (u.status && u.status.toLowerCase() === selectedStatus.toLowerCase());

        return matchSearch && matchRole && matchStatus;
      })
      .sort((a, b) => {
        if (selectedSort === "az") {
          return a.fullName.localeCompare(b.fullName);
        }
        if (selectedSort === "za") {
          return b.fullName.localeCompare(a.fullName);
        }
        if (selectedSort === "newest") {
          return b.userId - a.userId;
        }
        if (selectedSort === "oldest") {
          return a.userId - b.userId;
        }
        return 0;
      });
  }, [users, searchTerm, selectedRole, selectedStatus, selectedSort]);

  // Paginated list
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredUsers.slice(start, start + entriesPerPage);
  }, [filteredUsers, currentPage, entriesPerPage]);

  // Handle View Details (GetById)
  const handleViewDetails = async (u: UserDto) => {
    setLoadingDetail(true);
    try {
      const detail = await userDAL.getUserById(u.userId);
      setSelectedUser(detail || u);
    } catch {
      setSelectedUser(u);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Handle Add User Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.fullName.trim()) return;

    setSubmitting(true);
    setActionErrorMsg(null);
    try {
      const res = await managementDAL.createUser({
        fullName: addForm.fullName.trim(),
        phone: addForm.phone.trim() || undefined,
        email: addForm.email.trim() || undefined,
        role: addForm.role,
        specialty: addForm.specialty.trim() || undefined,
        gender: addForm.gender,
      });

      setUsers([res.data, ...users]);
      setShowAddModal(false);
      setAddForm({
        fullName: "",
        phone: "",
        email: "",
        role: "teacher",
        specialty: "Mathematics",
        gender: "male",
      });
      setActionSuccessMsg(`Created new account: "${res.data.fullName}" (${res.data.userCode}) successfully!`);
      setTimeout(() => setActionSuccessMsg(null), 3500);
    } catch (err: any) {
      setActionErrorMsg(err.message || "Failed to create account.");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (u: UserDto) => {
    setEditForm({
      userId: u.userId,
      userCode: u.userCode || `USR${u.userId}`,
      fullName: u.fullName,
      phone: u.phone || "",
      email: u.email || "",
      role: u.roles && u.roles.length > 0 ? u.roles[0] : "teacher",
      specialty: u.specialty || "",
      gender: u.gender || "male",
      status: u.status || "active",
    });
    setShowEditModal(true);
    setActionErrorMsg(null);
  };

  // Handle Edit User Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.fullName.trim()) return;

    setSubmitting(true);
    setActionErrorMsg(null);
    try {
      const res = await managementDAL.updateUser(editForm.userId, {
        fullName: editForm.fullName.trim(),
        phone: editForm.phone.trim() || undefined,
        email: editForm.email.trim() || undefined,
        role: editForm.role,
        specialty: editForm.specialty.trim() || undefined,
        gender: editForm.gender,
        status: editForm.status,
      });

      setUsers(users.map((item) => (item.userId === editForm.userId ? res.data : item)));
      setShowEditModal(false);
      setActionSuccessMsg(`Updated account information for "${res.data.fullName}" successfully!`);
      setTimeout(() => setActionSuccessMsg(null), 3500);
    } catch (err: any) {
      setActionErrorMsg(err.message || "Failed to update account.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Status Toggle
  const handleToggleStatus = async (u: UserDto) => {
    const nextStatus = u.status === "active" ? "locked" : "active";
    try {
      await managementDAL.updateUserStatus(u.userId, nextStatus);
      const updated = users.map((item) => (item.userId === u.userId ? { ...item, status: nextStatus } : item));
      setUsers(updated);
      setActionSuccessMsg(`Updated account status for ${u.fullName} to: ${nextStatus.toUpperCase()}!`);
      setTimeout(() => setActionSuccessMsg(null), 3000);
    } catch (err: any) {
      setActionErrorMsg(err.message || "Failed to update status.");
    }
  };

  // Open Delete Modal
  const handleOpenDeleteModal = (u: UserDto) => {
    setUserToDelete(u);
    setShowDeleteModal(true);
    setActionErrorMsg(null);
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    setSubmitting(true);
    setActionErrorMsg(null);
    try {
      const res = await managementDAL.deleteUser(userToDelete.userId);
      if (res.success) {
        setUsers(users.filter((item) => item.userId !== userToDelete.userId));
        setShowDeleteModal(false);
        setActionSuccessMsg(`Deleted account "${userToDelete.fullName}" (${userToDelete.userCode}) successfully!`);
        setTimeout(() => setActionSuccessMsg(null), 3500);
      } else {
        setActionErrorMsg(res.message || "Failed to delete user account.");
      }
    } catch (err: any) {
      setActionErrorMsg(err.message || "Error deleting user account.");
    } finally {
      setSubmitting(false);
      setUserToDelete(null);
    }
  };

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
            className="btn btn-primary d-flex align-items-center shadow-sm"
            onClick={() => {
              setShowAddModal(true);
              setActionErrorMsg(null);
            }}
          >
            <i className="bi bi-person-plus me-2" />
            Add Staff User
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

      {/* Error Notification Alert */}
      {actionErrorMsg && (
        <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center mb-4 shadow-sm" role="alert">
          <i className="bi bi-exclamation-triangle-fill fs-5 me-2" />
          <div>{actionErrorMsg}</div>
          <button type="button" className="btn-close" onClick={() => setActionErrorMsg(null)} aria-label="Close" />
        </div>
      )}

      {/* User Accounts List */}
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
                  placeholder="Search by name, phone, email, code..."
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
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Staff Roles</option>
                <option value="center_manager">Center Manager</option>
                <option value="admin_staff">Admin Staff</option>
                <option value="teacher">Teacher</option>
                <option value="teaching_assistant">Teaching Assistant</option>
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="locked">Locked</option>
              </select>
            </div>
            <div className="col-xl-3 col-lg-3 col-md-6">
              <select
                className="form-select"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
              >
                <option value="az">Sort by A-Z</option>
                <option value="za">Sort by Z-A</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Controls */}
        <TableToolbar
          totalItems={filteredUsers.length}
          totalLabel="Total staff users"
          entriesPerPage={entriesPerPage}
          onEntriesPerPageChange={(value) => {
            setEntriesPerPage(value);
            setCurrentPage(1);
          }}
        />

        {/* User Table */}
        <div className="table-responsive">
          <table className="table user-table align-middle mb-0 table-hover">
            <thead className="table-light">
              <tr>
                <th className="fw-bold">No.</th>
                <th className="fw-bold">User Code</th>
                <th className="fw-bold">Staff Name</th>
                <th className="fw-bold">Phone Number</th>
                <th className="fw-bold">Specialty</th>
                <th className="fw-bold">Role</th>
                <th className="fw-bold">Status</th>
                <th className="text-center fw-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    Loading staff accounts...
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">
                    <i className="bi bi-people fs-2 d-block mb-2 text-secondary" />
                    No matching staff accounts found.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u, idx) => {
                  const itemIndex = (currentPage - 1) * entriesPerPage + idx + 1;
                  const primaryRole = u.roles && u.roles.length > 0 ? u.roles[0] : "user";

                  return (
                    <tr key={u.userId}>
                      <td>{itemIndex}</td>
                      <td>
                        <span className="badge bg-light text-dark border font-monospace">
                          #{u.userCode || `USR${u.userId}`}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <UserAvatar name={u.fullName} />
                          <div>
                            <h6 className="mb-0 fw-bold text-dark">{u.fullName}</h6>
                            <small className="text-muted">{u.email || "No email"}</small>
                          </div>
                        </div>
                      </td>
                      <td>{u.phone || "—"}</td>
                      <td>
                        <SubjectBadge subject={u.specialty || "General"} />
                      </td>
                      <td>
                        <RoleBadge role={primaryRole} />
                      </td>
                      <td>
                        <DotStatusBadge status={u.status || "active"} />
                      </td>
                      <td className="text-center">
                        <div className="d-flex align-items-center justify-content-center gap-1">
                          <TableActionButton
                            action="View"
                            onClick={() => handleViewDetails(u)}
                            title="View details"
                          />
                          <TableActionButton
                            action="Edit"
                            onClick={() => handleOpenEditModal(u)}
                            title="Edit account"
                          />
                          <TableActionButton
                            action={u.status === "active" ? "Lock" : "Unlock"}
                            onClick={() => handleToggleStatus(u)}
                            title={u.status === "active" ? "Lock account" : "Unlock account"}
                          />
                          <TableActionButton
                            action="Delete"
                            onClick={() => handleOpenDeleteModal(u)}
                            title="Delete account"
                          />
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
            totalItems={filteredUsers.length}
            entriesPerPage={entriesPerPage}
            itemLabel="users"
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* ADD USER MODAL */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-person-plus me-2" />
                  Add New Staff User (Center Manager)
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowAddModal(false)}
                />
              </div>
              <form onSubmit={handleAddSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Full Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter full name..."
                        value={addForm.fullName}
                        onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">System Role <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        value={addForm.role}
                        onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                      >
                        <option value="teacher">Teacher</option>
                        <option value="teaching_assistant">Teaching Assistant</option>
                        <option value="admin_staff">Admin Staff</option>
                        <option value="center_manager">Center Manager</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="09xx xxx xxx"
                        value={addForm.phone}
                        onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="example@edutrack.edu.vn"
                        value={addForm.email}
                        onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Gender</label>
                      <select
                        className="form-select"
                        value={addForm.gender}
                        onChange={(e) => setAddForm({ ...addForm, gender: e.target.value })}
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Specialty / Grade Level</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Mathematics, Physics, Grade 12..."
                        value={addForm.specialty}
                        onChange={(e) => setAddForm({ ...addForm, specialty: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowAddModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary px-4" disabled={submitting}>
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        Creating...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {showEditModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-warning-subtle border-bottom">
                <h5 className="modal-title fw-bold text-dark">
                  <i className="bi bi-pencil-square me-2 text-warning" />
                  Edit Staff Account: #{editForm.userCode}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                />
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Full Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">System Role <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        value={editForm.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      >
                        <option value="teacher">Teacher</option>
                        <option value="teaching_assistant">Teaching Assistant</option>
                        <option value="admin_staff">Admin Staff</option>
                        <option value="center_manager">Center Manager</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Account Status</label>
                      <select
                        className="form-select"
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="locked">Locked</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Specialty / Grade Level</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.specialty}
                        onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowEditModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-warning px-4 fw-bold" disabled={submitting}>
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        Saving...
                      </>
                    ) : (
                      "Update Account"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && userToDelete && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-exclamation-triangle-fill me-2" />
                  Confirm Delete User Account
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowDeleteModal(false)}
                />
              </div>
              <div className="modal-body p-4">
                <p className="mb-2">
                  Are you sure you want to delete this staff account from the system?
                </p>
                <div className="p-3 bg-light rounded border mb-3">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <UserAvatar name={userToDelete.fullName} />
                    <div>
                      <h6 className="fw-bold mb-0 text-dark">{userToDelete.fullName}</h6>
                      <small className="text-muted">{userToDelete.email || "No email"}</small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-secondary font-monospace">#{userToDelete.userCode}</span>
                    <RoleBadge role={userToDelete.roles?.[0] || "user"} />
                  </div>
                </div>
                <div className="alert alert-warning py-2 mb-0 small">
                  <i className="bi bi-info-circle me-1" />
                  This action will remove associated role and access credentials.
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger px-4"
                  onClick={handleConfirmDelete}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Deleting...
                    </>
                  ) : (
                    "Confirm Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL (GetById) */}
      {selectedUser && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-light border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-primary fs-6 font-monospace">
                    #{selectedUser.userCode || `USR${selectedUser.userId}`}
                  </span>
                  <h5 className="modal-title fw-bold mb-0 text-dark">
                    User Profile Details
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedUser(null)}
                />
              </div>

              <div className="modal-body p-4">
                {loadingDetail ? (
                  <div className="text-center py-4 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    Loading user profile...
                  </div>
                ) : (
                  <>
                    <div className="d-flex align-items-center gap-3 pb-3 mb-4 border-bottom">
                      <UserAvatar name={selectedUser.fullName} />
                      <div className="flex-grow-1">
                        <h4 className="fw-bold mb-1 text-dark">{selectedUser.fullName}</h4>
                        <div className="d-flex align-items-center gap-2">
                          <RoleBadge role={selectedUser.roles?.[0] || "user"} />
                          <DotStatusBadge status={selectedUser.status || "active"} />
                        </div>
                      </div>
                    </div>

                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3">
                          <small className="text-muted d-block mb-1">Email</small>
                          <strong className="text-dark">{selectedUser.email || "—"}</strong>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3">
                          <small className="text-muted d-block mb-1">Phone Number</small>
                          <strong className="text-dark">{selectedUser.phone || "—"}</strong>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3">
                          <small className="text-muted d-block mb-1">Specialty / Grade Level</small>
                          <strong className="text-dark">{selectedUser.specialty || "All-around"}</strong>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3">
                          <small className="text-muted d-block mb-1">Date Joined</small>
                          <strong className="text-dark">
                            {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString("en-US") : "01/08/2026"}
                          </strong>
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
                  onClick={() => setSelectedUser(null)}
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
