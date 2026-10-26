import { useState, useEffect, useMemo } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import DotStatusBadge from "../../../components/Common/DotStatusBadge";
import SubjectBadge from "../../../components/Common/SubjectBadge";
import Pagination from "../../../components/Common/Pagination";
import TableToolbar from "../../../components/Common/TableToolbar";
import UserAvatar from "../../../components/Common/UserAvatar";
import RoleBadge from "../../../components/Common/RoleBadge";
import userDAL from "../../../../DAL/userDAL";
import type { UserDto } from "../../../../BLL/models/UserDto";

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
  });
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchUsers() {
      try {
        setLoading(true);
        const res = await userDAL.getAllUsers();
        if (isMounted && res.data) {
          setUsers(res.data);
        }
      } catch (err) {
        console.warn("Lỗi tải danh sách tài khoản người dùng:", err);
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

  // Handle View / Edit Details (GetById)
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
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.fullName.trim()) return;

    const newId = users.length > 0 ? Math.max(...users.map((x) => x.userId)) + 1 : 101;
    const prefix = addForm.role === "teacher" ? "TEA" : addForm.role === "teaching_assistant" ? "TA" : addForm.role === "admin_staff" ? "ADM" : "USR";

    const newUserObj: UserDto = {
      userId: newId,
      userCode: `${prefix}${String(newId).padStart(3, "0")}`,
      fullName: addForm.fullName.trim(),
      phone: addForm.phone || "0912 345 678",
      email: addForm.email || `${prefix.toLowerCase()}${newId}@edutrack.edu.vn`,
      specialty: addForm.specialty,
      roles: [addForm.role],
      status: "active",
      createdAt: new Date().toISOString(),
    };

    setUsers([newUserObj, ...users]);
    setShowAddModal(false);
    setAddForm({
      fullName: "",
      phone: "",
      email: "",
      role: "teacher",
      specialty: "Mathematics",
    });
    setActionSuccessMsg(`Đã tạo tài khoản mới: "${newUserObj.fullName}" (${newUserObj.userCode}) thành công!`);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  // Handle Status Toggle
  const handleToggleStatus = (u: UserDto) => {
    const nextStatus = u.status === "active" ? "locked" : "active";
    const updated = users.map((item) => (item.userId === u.userId ? { ...item, status: nextStatus } : item));
    setUsers(updated);
    setActionSuccessMsg(`Đã cập nhật trạng thái tài khoản ${u.fullName} thành: ${nextStatus.toUpperCase()}!`);
    setTimeout(() => setActionSuccessMsg(null), 3000);
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
            onClick={() => setShowAddModal(true)}
          >
            <i className="bi bi-plus-square me-2" />
            Add User
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
                <option value="All">All Roles</option>
                <option value="center_manager">Center Manager</option>
                <option value="admin_staff">Admin Staff</option>
                <option value="teacher">Teacher</option>
                <option value="teaching_assistant">Teaching Assistant</option>
                <option value="student">Student</option>
                <option value="parent">Parent</option>
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
                <option value="newest">Newest Created</option>
                <option value="oldest">Oldest Created</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Controls */}
        <TableToolbar
          totalItems={filteredUsers.length}
          totalLabel="Total users"
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
                <th className="fw-bold">Full Name</th>
                <th className="fw-bold">Phone / Email</th>
                <th className="fw-bold">Specialty</th>
                <th className="fw-bold">Role</th>
                <th className="fw-bold">Status</th>
                <th className="text-center fw-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    Đang nạp danh sách tài khoản người dùng...
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">
                    <i className="bi bi-people fs-2 d-block mb-2 text-secondary" />
                    Không tìm thấy tài khoản người dùng nào phù hợp.
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
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleViewDetails(u)}
                            title="View / Edit Profile"
                          >
                            <i className="bi bi-eye me-1" />
                            Chi tiết
                          </button>
                          <button
                            type="button"
                            className={`btn btn-sm ${u.status === "active" ? "btn-outline-warning" : "btn-outline-success"}`}
                            onClick={() => handleToggleStatus(u)}
                            title="Toggle Status"
                          >
                            {u.status === "active" ? <i className="bi bi-lock" /> : <i className="bi bi-unlock" />}
                          </button>
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
                  Thêm tài khoản người dùng mới (Center Manager)
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
                      <label className="form-label fw-bold">Họ và tên <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nhập họ và tên..."
                        value={addForm.fullName}
                        onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Vai trò hệ thống <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        value={addForm.role}
                        onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                      >
                        <option value="teacher">Giáo viên (Teacher)</option>
                        <option value="teaching_assistant">Trợ giảng (Teaching Assistant)</option>
                        <option value="admin_staff">Giáo vụ (Admin Staff)</option>
                        <option value="center_manager">Quản lý trung tâm (Center Manager)</option>
                        <option value="student">Học sinh (Student)</option>
                        <option value="parent">Phụ huynh (Parent)</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Số điện thoại</label>
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
                    <div className="col-md-12">
                      <label className="form-label fw-bold">Chuyên môn / Khối lớp</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ví dụ: Mathematics, Physics, Lớp 12..."
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
                  >
                    Hủy bỏ
                  </button>
                  <button type="submit" className="btn btn-primary px-4">
                    Tạo tài khoản
                  </button>
                </div>
              </form>
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
                    Hồ sơ chi tiết người dùng
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
                    Đang nạp hồ sơ người dùng...
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
                          <small className="text-muted d-block mb-1">Số điện thoại</small>
                          <strong className="text-dark">{selectedUser.phone || "—"}</strong>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3">
                          <small className="text-muted d-block mb-1">Chuyên môn / Khối lớp</small>
                          <strong className="text-dark">{selectedUser.specialty || "Toàn năng"}</strong>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3">
                          <small className="text-muted d-block mb-1">Ngày tham gia hệ thống</small>
                          <strong className="text-dark">
                            {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString("vi-VN") : "01/08/2026"}
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
