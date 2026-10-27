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
import parentStudentDAL from "../../../../DAL/parentStudentDAL";
import managementDAL from "../../../../DAL/managementDAL";
import type { UserDto } from "../../../../BLL/models/UserDto";
import type { ParentStudentDto } from "../../../../api/parentStudentApi";

export default function AdminStaffStudentPage() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [links, setLinks] = useState<ParentStudentDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Tabs: 'students' or 'parents'
  const [activeTab, setActiveTab] = useState<"students" | "parents">("students");

  // Filters state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("All");
  const [selectedLinkStatus, setSelectedLinkStatus] = useState<string>("All"); // 'All', 'linked', 'unlinked'
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedSort, setSelectedSort] = useState<string>("az");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);

  // Modals state
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  // Add User Modal state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [addForm, setAddForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    specialty: "Class 7",
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
    role: "student",
    specialty: "",
    gender: "male",
    status: "active",
  });

  // Context-aware Link Modal state (Option C)
  const [showLinkModal, setShowLinkModal] = useState<boolean>(false);
  const [linkContext, setLinkContext] = useState<{
    mode: "student" | "parent" | "general";
    targetUser?: UserDto;
  }>({ mode: "general" });

  const [linkForm, setLinkForm] = useState({
    parentId: 0,
    studentId: 0,
    relationship: "Father",
    isPrimaryContact: true,
  });

  // Delete User Modal state
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<UserDto | null>(null);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [usersRes, linksRes] = await Promise.all([
          userDAL.getAllUsers(),
          parentStudentDAL.getAllLinks(),
        ]);

        if (isMounted) {
          if (usersRes.data) setUsers(usersRes.data);
          if (linksRes.data) setLinks(linksRes.data);
        }
      } catch (err) {
        console.warn("Lỗi nạp dữ liệu học sinh & phụ huynh:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter students and parents separately
  const studentsList = useMemo(() => {
    return users.filter(
      (u) => u.roles?.includes("student") || (u.userCode && u.userCode.startsWith("STU"))
    );
  }, [users]);

  const parentsList = useMemo(() => {
    return users.filter(
      (u) => u.roles?.includes("parent") || (u.userCode && u.userCode.startsWith("PAR"))
    );
  }, [users]);

  // Map each student to their linked parent(s)
  const studentParentMap = useMemo(() => {
    const map = new Map<number, ParentStudentDto[]>();
    links.forEach((link) => {
      const arr = map.get(link.studentId) || [];
      arr.push(link);
      map.set(link.studentId, arr);
    });
    return map;
  }, [links]);

  // Map each parent to their linked student(s)
  const parentStudentMap = useMemo(() => {
    const map = new Map<number, ParentStudentDto[]>();
    links.forEach((link) => {
      const arr = map.get(link.parentId) || [];
      arr.push(link);
      map.set(link.parentId, arr);
    });
    return map;
  }, [links]);

  // Filtered dataset based on activeTab
  const currentDataset = useMemo(() => {
    const baseList = activeTab === "students" ? studentsList : parentsList;

    return baseList
      .filter((item) => {
        const matchSearch =
          searchTerm === "" ||
          item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.phone && item.phone.includes(searchTerm)) ||
          (item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.userCode && item.userCode.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchSpecialty =
          activeTab !== "students" ||
          selectedSpecialty === "All" ||
          (item.specialty && item.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase()));

        const matchStatus =
          selectedStatus === "All" ||
          (item.status && item.status.toLowerCase() === selectedStatus.toLowerCase());

        // Link status filter
        let matchLink = true;
        if (activeTab === "students") {
          const hasParent = studentParentMap.has(item.userId) && (studentParentMap.get(item.userId)?.length || 0) > 0;
          if (selectedLinkStatus === "linked") matchLink = hasParent;
          if (selectedLinkStatus === "unlinked") matchLink = !hasParent;
        } else {
          const hasChildren = parentStudentMap.has(item.userId) && (parentStudentMap.get(item.userId)?.length || 0) > 0;
          if (selectedLinkStatus === "linked") matchLink = hasChildren;
          if (selectedLinkStatus === "unlinked") matchLink = !hasChildren;
        }

        return matchSearch && matchSpecialty && matchStatus && matchLink;
      })
      .sort((a, b) => {
        if (selectedSort === "az") return a.fullName.localeCompare(b.fullName);
        if (selectedSort === "za") return b.fullName.localeCompare(a.fullName);
        if (selectedSort === "newest") return b.userId - a.userId;
        if (selectedSort === "oldest") return a.userId - b.userId;
        return 0;
      });
  }, [
    activeTab,
    studentsList,
    parentsList,
    searchTerm,
    selectedSpecialty,
    selectedStatus,
    selectedLinkStatus,
    selectedSort,
    studentParentMap,
    parentStudentMap,
  ]);

  // Paginated list
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return currentDataset.slice(start, start + entriesPerPage);
  }, [currentDataset, currentPage, entriesPerPage]);

  // View details
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

  // Add Submit (Student or Parent)
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.fullName.trim()) return;

    setSubmitting(true);
    setActionErrorMsg(null);
    try {
      const role = activeTab === "students" ? "student" : "parent";
      const res = await managementDAL.createUser({
        fullName: addForm.fullName.trim(),
        phone: addForm.phone.trim() || undefined,
        email: addForm.email.trim() || undefined,
        role: role,
        specialty: activeTab === "students" ? addForm.specialty : undefined,
        gender: addForm.gender,
      });

      setUsers([res.data, ...users]);
      setShowAddModal(false);
      setAddForm({
        fullName: "",
        phone: "",
        email: "",
        specialty: "Class 7",
        gender: "male",
      });
      setActionSuccessMsg(
        `Đã tạo tài khoản ${activeTab === "students" ? "học viên" : "phụ huynh"} mới: "${res.data.fullName}" (${res.data.userCode}) thành công!`
      );
      setTimeout(() => setActionSuccessMsg(null), 3500);
    } catch (err: any) {
      setActionErrorMsg(err.message || "Không thể tạo tài khoản.");
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
      role: u.roles && u.roles.length > 0 ? u.roles[0] : activeTab === "students" ? "student" : "parent",
      specialty: u.specialty || "",
      gender: u.gender || "male",
      status: u.status || "active",
    });
    setShowEditModal(true);
    setActionErrorMsg(null);
  };

  // Handle Edit Submit
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
      setActionSuccessMsg(`Đã cập nhật hồ sơ "${res.data.fullName}" thành công!`);
      setTimeout(() => setActionSuccessMsg(null), 3500);
    } catch (err: any) {
      setActionErrorMsg(err.message || "Không thể cập nhật hồ sơ.");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Context-aware Link Modal (Option C)
  const handleOpenLinkModalForStudent = (student: UserDto) => {
    setLinkContext({ mode: "student", targetUser: student });
    setLinkForm({
      studentId: student.userId,
      parentId: parentsList[0]?.userId || 0,
      relationship: "Father",
      isPrimaryContact: true,
    });
    setShowLinkModal(true);
    setActionErrorMsg(null);
  };

  const handleOpenLinkModalForParent = (parent: UserDto) => {
    setLinkContext({ mode: "parent", targetUser: parent });
    setLinkForm({
      parentId: parent.userId,
      studentId: studentsList[0]?.userId || 0,
      relationship: "Father",
      isPrimaryContact: true,
    });
    setShowLinkModal(true);
    setActionErrorMsg(null);
  };

  const handleOpenGeneralLinkModal = () => {
    setLinkContext({ mode: "general" });
    setLinkForm({
      parentId: parentsList[0]?.userId || 0,
      studentId: studentsList[0]?.userId || 0,
      relationship: "Father",
      isPrimaryContact: true,
    });
    setShowLinkModal(true);
    setActionErrorMsg(null);
  };

  // Handle Link Submit
  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkForm.parentId || !linkForm.studentId) {
      setActionErrorMsg("Vui lòng chọn đầy đủ Phụ huynh và Học sinh.");
      return;
    }

    setSubmitting(true);
    setActionErrorMsg(null);
    try {
      const res = await managementDAL.assignLink(linkForm);
      // Update links state
      const existingIdx = links.findIndex(
        (l) => l.parentId === linkForm.parentId && l.studentId === linkForm.studentId
      );
      if (existingIdx >= 0) {
        const updated = [...links];
        updated[existingIdx] = res.data;
        setLinks(updated);
      } else {
        setLinks([res.data, ...links]);
      }

      setShowLinkModal(false);
      setActionSuccessMsg(`Đã liên kết thành công giữa Phụ huynh và Học sinh!`);
      setTimeout(() => setActionSuccessMsg(null), 3500);
    } catch (err: any) {
      setActionErrorMsg(err.message || "Không thể lưu liên kết.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Unlink
  const handleUnlink = async (parentId: number, studentId: number) => {
    setSubmitting(true);
    setActionErrorMsg(null);
    try {
      const res = await managementDAL.removeLink(parentId, studentId);
      if (res.success) {
        setLinks(links.filter((l) => !(l.parentId === parentId && l.studentId === studentId)));
        setActionSuccessMsg("Đã hủy liên kết Phụ huynh - Học sinh thành công!");
        setTimeout(() => setActionSuccessMsg(null), 3500);
      }
    } catch (err: any) {
      setActionErrorMsg(err.message || "Lỗi hủy liên kết.");
    } finally {
      setSubmitting(false);
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
        // Remove related links
        setLinks(links.filter((l) => l.studentId !== userToDelete.userId && l.parentId !== userToDelete.userId));
        setShowDeleteModal(false);
        setActionSuccessMsg(`Đã xóa tài khoản "${userToDelete.fullName}" (${userToDelete.userCode}) thành công!`);
        setTimeout(() => setActionSuccessMsg(null), 3500);
      } else {
        setActionErrorMsg(res.message || "Không thể xóa tài khoản.");
      }
    } catch (err: any) {
      setActionErrorMsg(err.message || "Lỗi khi xóa tài khoản.");
    } finally {
      setSubmitting(false);
      setUserToDelete(null);
    }
  };

  // Currently linked items for the target user in the modal
  const targetLinkedParents = useMemo(() => {
    if (linkContext.mode === "student" && linkContext.targetUser) {
      return studentParentMap.get(linkContext.targetUser.userId) || [];
    }
    return [];
  }, [linkContext, studentParentMap]);

  const targetLinkedStudents = useMemo(() => {
    if (linkContext.mode === "parent" && linkContext.targetUser) {
      return parentStudentMap.get(linkContext.targetUser.userId) || [];
    }
    return [];
  }, [linkContext, parentStudentMap]);

  return (
    <>
      {/* Breadcrumb and Quick Access */}
      <PageHeader
        title="Student & Parent Management"
        breadcrumbItems={[
          { label: "Admin Staff", path: "/admin-staff" },
          { label: activeTab === "students" ? "Students" : "Parents" },
        ]}
        action={
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-outline-primary d-flex align-items-center shadow-sm"
              onClick={handleOpenGeneralLinkModal}
              title="Tạo liên kết Phụ huynh - Học sinh mới"
            >
              <i className="bi bi-link-45deg me-1 fs-5" />
              Tạo liên kết PH - HS
            </button>
            <button
              type="button"
              className="btn btn-primary d-flex align-items-center shadow-sm"
              onClick={() => {
                setShowAddModal(true);
                setActionErrorMsg(null);
              }}
            >
              <i className={activeTab === "students" ? "bi bi-mortarboard-fill me-2" : "bi bi-people-fill me-2"} />
              {activeTab === "students" ? "Add Student" : "Add Parent"}
            </button>
          </div>
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

      {/* Tab Switcher: Students vs Parents */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <ul className="nav nav-pills bg-white p-1 rounded-3 shadow-sm border">
          <li className="nav-item">
            <button
              className={`nav-link px-4 fw-bold ${activeTab === "students" ? "active" : "text-muted"}`}
              onClick={() => {
                setActiveTab("students");
                setCurrentPage(1);
                setSelectedLinkStatus("All");
              }}
            >
              <i className="bi bi-mortarboard me-2" />
              Học viên (Students)
              <span className="badge bg-primary-subtle text-primary ms-2">{studentsList.length}</span>
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link px-4 fw-bold ${activeTab === "parents" ? "active" : "text-muted"}`}
              onClick={() => {
                setActiveTab("parents");
                setCurrentPage(1);
                setSelectedLinkStatus("All");
              }}
            >
              <i className="bi bi-people me-2" />
              Phụ huynh (Parents)
              <span className="badge bg-info-subtle text-info ms-2">{parentsList.length}</span>
            </button>
          </li>
        </ul>
      </div>

      {/* Main Table Card */}
      <div className="card user-list-card border-0 shadow-sm">
        {/* Filters Header */}
        <div className="card-header user-list-header bg-white py-3 border-bottom">
          <div className="row g-3 align-items-center">
            <div className="col-xl-4 col-lg-5">
              <div className="user-search position-relative">
                <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                <input
                  type="text"
                  className="form-control ps-5"
                  placeholder={activeTab === "students" ? "Search student name, code, phone..." : "Search parent name, phone, email..."}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            {/* Parent/Student Link Filter */}
            <div className="col-xl-3 col-lg-3 col-md-4">
              <select
                className="form-select border-primary-subtle"
                value={selectedLinkStatus}
                onChange={(e) => {
                  setSelectedLinkStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">🔗 Tất cả trạng thái liên kết</option>
                <option value="linked">
                  {activeTab === "students" ? "✅ Đã có phụ huynh" : "✅ Đã có học sinh"}
                </option>
                <option value="unlinked">
                  {activeTab === "students" ? "⚠️ Chưa có phụ huynh (Chưa liên kết)" : "⚠️ Chưa có học sinh"}
                </option>
              </select>
            </div>

            {/* Specialty / Class (Only on students) */}
            {activeTab === "students" && (
              <div className="col-xl-2 col-lg-2 col-md-4">
                <select
                  className="form-select"
                  value={selectedSpecialty}
                  onChange={(e) => {
                    setSelectedSpecialty(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="All">All Grades</option>
                  <option value="7">Class 7</option>
                  <option value="8">Class 8</option>
                  <option value="9">Class 9</option>
                  <option value="12">Class 12</option>
                </select>
              </div>
            )}

            {/* Status Filter */}
            <div className="col-xl-2 col-lg-2 col-md-4">
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

            {/* Sort Filter */}
            <div className="col-xl-1 col-lg-2 col-md-4">
              <select
                className="form-select"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
              >
                <option value="az">A-Z</option>
                <option value="za">Z-A</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Toolbar */}
        <TableToolbar
          totalItems={currentDataset.length}
          totalLabel={activeTab === "students" ? "Total students" : "Total parents"}
          entriesPerPage={entriesPerPage}
          onEntriesPerPageChange={(value) => {
            setEntriesPerPage(value);
            setCurrentPage(1);
          }}
        />

        {/* Table Content */}
        <div className="table-responsive">
          <table className="table user-table align-middle mb-0 table-hover">
            <thead className="table-light">
              <tr>
                <th className="fw-bold">No.</th>
                <th className="fw-bold">Mã</th>
                <th className="fw-bold">{activeTab === "students" ? "Học viên" : "Phụ huynh"}</th>
                {activeTab === "students" && <th className="fw-bold">Lớp / Khối</th>}
                <th className="fw-bold">Số điện thoại</th>
                <th className="fw-bold">
                  {activeTab === "students" ? "Phụ huynh liên kết" : "Học sinh phụ trách"}
                </th>
                <th className="fw-bold">Trạng thái</th>
                <th className="text-center fw-bold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    Đang nạp danh sách {activeTab === "students" ? "học viên" : "phụ huynh"}...
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">
                    <i className="bi bi-inbox fs-2 d-block mb-2 text-secondary" />
                    Không tìm thấy {activeTab === "students" ? "học viên" : "phụ huynh"} nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, idx) => {
                  const itemIndex = (currentPage - 1) * entriesPerPage + idx + 1;

                  // Get linked parents or children
                  const linkedParents = activeTab === "students" ? studentParentMap.get(item.userId) || [] : [];
                  const linkedStudents = activeTab === "parents" ? parentStudentMap.get(item.userId) || [] : [];

                  return (
                    <tr key={item.userId}>
                      <td>{itemIndex}</td>
                      <td>
                        <span className="badge bg-light text-primary border font-monospace">
                          #{item.userCode || (activeTab === "students" ? `STU${item.userId}` : `PAR${item.userId}`)}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <UserAvatar name={item.fullName} />
                          <div>
                            <h6 className="mb-0 fw-bold text-dark">{item.fullName}</h6>
                            <small className="text-muted">{item.email || "—"}</small>
                          </div>
                        </div>
                      </td>
                      {activeTab === "students" && (
                        <td>
                          <SubjectBadge subject={item.specialty || "Class 7"} />
                        </td>
                      )}
                      <td>{item.phone || "—"}</td>

                      {/* Parent or Student Linkage Column */}
                      <td>
                        {activeTab === "students" ? (
                          linkedParents.length > 0 ? (
                            <div>
                              {linkedParents.map((lp) => (
                                <div key={lp.parentId} className="d-flex align-items-center gap-1 mb-1">
                                  <span className="badge bg-info-subtle text-info border">
                                    {lp.relationship || "Phụ huynh"}
                                  </span>
                                  <span className="fw-semibold text-dark small">{lp.parentName}</span>
                                  <small className="text-muted">({lp.parentPhone || "—"})</small>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="badge bg-warning-subtle text-warning border">
                              <i className="bi bi-exclamation-triangle me-1" />
                              Chưa có phụ huynh
                            </span>
                          )
                        ) : (
                          linkedStudents.length > 0 ? (
                            <div className="d-flex flex-wrap gap-1">
                              {linkedStudents.map((ls) => (
                                <span key={ls.studentId} className="badge bg-light text-dark border">
                                  🎓 {ls.studentName} ({ls.relationship || "Con"})
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="badge bg-secondary-subtle text-secondary border">
                              <i className="bi bi-person-x me-1" />
                              Chưa có học sinh
                            </span>
                          )
                        )}
                      </td>

                      <td>
                        <DotStatusBadge status={item.status || "active"} />
                      </td>

                      <td className="text-center">
                        <div className="d-flex align-items-center justify-content-center gap-1">
                          {/* View details */}
                          <TableActionButton
                            action="View"
                            onClick={() => handleViewDetails(item)}
                            title="Xem chi tiết hồ sơ"
                          />

                          {/* Link Action (Context-Aware) */}
                          <TableActionButton
                            action="Link"
                            onClick={() => {
                              if (activeTab === "students") {
                                handleOpenLinkModalForStudent(item);
                              } else {
                                handleOpenLinkModalForParent(item);
                              }
                            }}
                            title={activeTab === "students" ? "Gán phụ huynh cho học sinh này" : "Gán học sinh cho phụ huynh này"}
                          />

                          {/* Edit */}
                          <TableActionButton
                            action="Edit"
                            onClick={() => handleOpenEditModal(item)}
                            title="Sửa thông tin"
                          />

                          {/* Delete */}
                          <TableActionButton
                            action="Delete"
                            onClick={() => handleOpenDeleteModal(item)}
                            title="Xóa tài khoản"
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
            totalItems={currentDataset.length}
            entriesPerPage={entriesPerPage}
            itemLabel={activeTab === "students" ? "students" : "parents"}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">
                  <i className={activeTab === "students" ? "bi bi-mortarboard-fill me-2" : "bi bi-people-fill me-2"} />
                  {activeTab === "students" ? "Thêm học viên mới" : "Thêm phụ huynh mới"} (Admin Staff)
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
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Giới tính</label>
                      <select
                        className="form-select"
                        value={addForm.gender}
                        onChange={(e) => setAddForm({ ...addForm, gender: e.target.value })}
                      >
                        <option value="male">Nam (Male)</option>
                        <option value="female">Nữ (Female)</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>

                    {activeTab === "students" && (
                      <div className="col-md-12">
                        <label className="form-label fw-bold">Khối lớp / Chương trình học</label>
                        <select
                          className="form-select"
                          value={addForm.specialty}
                          onChange={(e) => setAddForm({ ...addForm, specialty: e.target.value })}
                        >
                          <option value="Class 7">Class 7</option>
                          <option value="Class 8">Class 8</option>
                          <option value="Class 9">Class 9</option>
                          <option value="Class 12">Class 12</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowAddModal(false)}
                    disabled={submitting}
                  >
                    Hủy bỏ
                  </button>
                  <button type="submit" className="btn btn-primary px-4" disabled={submitting}>
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        Đang lưu...
                      </>
                    ) : (
                      "Lưu hồ sơ"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-warning-subtle border-bottom">
                <h5 className="modal-title fw-bold text-dark">
                  <i className="bi bi-pencil-square me-2 text-warning" />
                  Chỉnh sửa hồ sơ: #{editForm.userCode}
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
                      <label className="form-label fw-bold">Họ và tên <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Số điện thoại</label>
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
                      <label className="form-label fw-bold">Trạng thái</label>
                      <select
                        className="form-select"
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      >
                        <option value="active">Active (Hoạt động)</option>
                        <option value="inactive">Inactive (Tạm ngừng)</option>
                        <option value="locked">Locked (Đã khóa)</option>
                      </select>
                    </div>

                    {editForm.role === "student" && (
                      <div className="col-md-12">
                        <label className="form-label fw-bold">Khối lớp / Chuyên môn</label>
                        <input
                          type="text"
                          className="form-control"
                          value={editForm.specialty}
                          onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value })}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowEditModal(false)}
                    disabled={submitting}
                  >
                    Hủy bỏ
                  </button>
                  <button type="submit" className="btn btn-warning px-4 fw-bold" disabled={submitting}>
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        Đang lưu...
                      </>
                    ) : (
                      "Cập nhật hồ sơ"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CONTEXT-AWARE LINK PARENT-STUDENT MODAL (Option C) */}
      {showLinkModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-link-45deg me-2" />
                  {linkContext.mode === "student" && linkContext.targetUser
                    ? `Liên kết Phụ huynh cho Học sinh: ${linkContext.targetUser.fullName}`
                    : linkContext.mode === "parent" && linkContext.targetUser
                    ? `Gán Học sinh cho Phụ huynh: ${linkContext.targetUser.fullName}`
                    : "Thiết lập liên kết Phụ huynh & Học sinh"}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowLinkModal(false)}
                />
              </div>
              <form onSubmit={handleLinkSubmit}>
                <div className="modal-body p-4">
                  {/* CONTEXT HEADER: SHOW TARGET USER INFORMATION LOCKED */}
                  {linkContext.mode === "student" && linkContext.targetUser && (
                    <div className="p-3 bg-primary-subtle rounded-3 border mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <UserAvatar name={linkContext.targetUser.fullName} />
                        <div>
                          <small className="text-muted d-block">Học sinh đang được chọn (Cố định):</small>
                          <h6 className="fw-bold mb-0 text-dark">
                            {linkContext.targetUser.fullName}{" "}
                            <span className="badge bg-primary font-monospace ms-1">
                              #{linkContext.targetUser.userCode}
                            </span>
                          </h6>
                          <small className="text-secondary">{linkContext.targetUser.specialty || "Lớp 7"}</small>
                        </div>
                      </div>
                    </div>
                  )}

                  {linkContext.mode === "parent" && linkContext.targetUser && (
                    <div className="p-3 bg-info-subtle rounded-3 border mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <UserAvatar name={linkContext.targetUser.fullName} />
                        <div>
                          <small className="text-muted d-block">Phụ huynh đang được chọn (Cố định):</small>
                          <h6 className="fw-bold mb-0 text-dark">
                            {linkContext.targetUser.fullName}{" "}
                            <span className="badge bg-info text-dark font-monospace ms-1">
                              #{linkContext.targetUser.userCode}
                            </span>
                          </h6>
                          <small className="text-secondary">{linkContext.targetUser.phone || "Chưa có SĐT"}</small>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* LIST CURRENTLY LINKED PERSONS WITH UNLINK BUTTON */}
                  {linkContext.mode === "student" && targetLinkedParents.length > 0 && (
                    <div className="mb-3">
                      <label className="form-label fw-bold text-muted small">Phụ huynh hiện đang liên kết:</label>
                      <div className="list-group">
                        {targetLinkedParents.map((lp) => (
                          <div
                            key={lp.parentId}
                            className="list-group-item d-flex align-items-center justify-content-between p-2"
                          >
                            <div className="d-flex align-items-center gap-2">
                              <span className="badge bg-secondary-subtle text-secondary border">
                                {lp.relationship || "Phụ huynh"}
                              </span>
                              <span className="fw-bold text-dark">{lp.parentName}</span>
                              <small className="text-muted">({lp.parentPhone || "—"})</small>
                            </div>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm py-0 px-2"
                              onClick={() => handleUnlink(lp.parentId, lp.studentId)}
                              disabled={submitting}
                              title="Hủy liên kết với phụ huynh này"
                            >
                              <i className="bi bi-x-circle me-1" />
                              Hủy
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {linkContext.mode === "parent" && targetLinkedStudents.length > 0 && (
                    <div className="mb-3">
                      <label className="form-label fw-bold text-muted small">Các học sinh hiện đang phụ trách:</label>
                      <div className="list-group">
                        {targetLinkedStudents.map((ls) => (
                          <div
                            key={ls.studentId}
                            className="list-group-item d-flex align-items-center justify-content-between p-2"
                          >
                            <div className="d-flex align-items-center gap-2">
                              <span className="badge bg-secondary-subtle text-secondary border">
                                {ls.relationship || "Con"}
                              </span>
                              <span className="fw-bold text-dark">{ls.studentName}</span>
                              <small className="text-muted font-monospace">#{ls.studentCode}</small>
                            </div>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm py-0 px-2"
                              onClick={() => handleUnlink(ls.parentId, ls.studentId)}
                              disabled={submitting}
                              title="Hủy liên kết với học sinh này"
                            >
                              <i className="bi bi-x-circle me-1" />
                              Hủy
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* INPUT FIELDS ACCORDING TO MODE */}
                  <div className="border-top pt-3">
                    <h6 className="fw-bold text-primary mb-3">
                      {linkContext.mode === "student"
                        ? "➕ Thêm / Đổi Phụ huynh cho học sinh này"
                        : linkContext.mode === "parent"
                        ? "➕ Gán thêm Học sinh cho phụ huynh này"
                        : "🔗 Chọn Học sinh và Phụ huynh"}
                    </h6>

                    {/* Show Student Select only if general mode or parent mode */}
                    {linkContext.mode !== "student" && (
                      <div className="mb-3">
                        <label className="form-label fw-bold">Chọn Học sinh <span className="text-danger">*</span></label>
                        <select
                          className="form-select font-monospace"
                          value={linkForm.studentId}
                          onChange={(e) => setLinkForm({ ...linkForm, studentId: Number(e.target.value) })}
                          required
                        >
                          <option value="">-- Chọn học sinh cần gán --</option>
                          {studentsList.map((s) => (
                            <option key={s.userId} value={s.userId}>
                              #{s.userCode} - {s.fullName} ({s.specialty || "Lớp"})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Show Parent Select only if general mode or student mode */}
                    {linkContext.mode !== "parent" && (
                      <div className="mb-3">
                        <label className="form-label fw-bold">Chọn Phụ huynh phụ trách <span className="text-danger">*</span></label>
                        <select
                          className="form-select font-monospace"
                          value={linkForm.parentId}
                          onChange={(e) => setLinkForm({ ...linkForm, parentId: Number(e.target.value) })}
                          required
                        >
                          <option value="">-- Chọn phụ huynh liên kết --</option>
                          {parentsList.map((p) => (
                            <option key={p.userId} value={p.userId}>
                              #{p.userCode} - {p.fullName} ({p.phone || p.email || "Liên hệ"})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Mối quan hệ thân nhân</label>
                        <select
                          className="form-select"
                          value={linkForm.relationship}
                          onChange={(e) => setLinkForm({ ...linkForm, relationship: e.target.value })}
                        >
                          <option value="Father">Bố (Father)</option>
                          <option value="Mother">Mẹ (Mother)</option>
                          <option value="Guardian">Người giám hộ (Guardian)</option>
                          <option value="Relative">Người thân khác</option>
                        </select>
                      </div>

                      <div className="col-md-6 d-flex align-items-center">
                        <div className="form-check mt-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="primaryContactCheck"
                            checked={linkForm.isPrimaryContact}
                            onChange={(e) => setLinkForm({ ...linkForm, isPrimaryContact: e.target.checked })}
                          />
                          <label className="form-check-label small" htmlFor="primaryContactCheck">
                            Người liên hệ chính nhận thông báo
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowLinkModal(false)}
                    disabled={submitting}
                  >
                    Đóng
                  </button>
                  <button type="submit" className="btn btn-info text-white px-4 fw-bold" disabled={submitting}>
                    {submitting ? "Đang lưu..." : "Xác nhận liên kết"}
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
                  Xác nhận xóa tài khoản
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowDeleteModal(false)}
                />
              </div>
              <div className="modal-body p-4">
                <p className="mb-2">
                  Bạn có chắc chắn muốn xóa tài khoản sau khỏi hệ thống không?
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
                  Dữ liệu liên kết học sinh - phụ huynh liên quan cũng sẽ được tự động giải phóng.
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={submitting}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  className="btn btn-danger px-4"
                  onClick={handleConfirmDelete}
                  disabled={submitting}
                >
                  {submitting ? "Đang xóa..." : "Xác nhận xóa"}
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
                    Hồ sơ chi tiết {selectedUser.roles?.[0] === "student" ? "Học viên" : "Phụ huynh"}
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
                    Đang nạp thông tin...
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
                          <small className="text-muted d-block mb-1">Khối lớp / Chuyên môn</small>
                          <strong className="text-dark">{selectedUser.specialty || "Chưa cập nhật"}</strong>
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
