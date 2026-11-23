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
import subjectDAL from "../../../../DAL/subjectDAL";
import { gradeApi } from "../../../../api/gradeApi";
import type {
  UserDto,
  UserSpecialtyGroupDto,
  UserSubjectGradeInputDto,
} from "../../../../BLL/models/UserDto";
import type { SubjectDto } from "../../../../BLL/models/SubjectDto";
import type { GradeDto } from "../../../../BLL/models/GradeDto";

const INTERNAL_STAFF_ROLES = ["center_manager", "admin_staff", "teacher", "teaching_assistant"];

function isTeachingRole(role?: string | null): boolean {
  const normalized = (role || "").toLowerCase();
  return normalized === "teacher" || normalized === "teaching_assistant" || normalized === "ta";
}

export default function CenterManagerUserAccountPage() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [grades, setGrades] = useState<GradeDto[]>([]);
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
    specialty: "",
    subjectGrades: [] as UserSubjectGradeInputDto[],
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
    subjectGrades: [] as UserSubjectGradeInputDto[],
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
    async function fetchInitialData() {
      try {
        setLoading(true);
        const [usersRes, subjectsRes, gradesRes] = await Promise.all([
          userDAL.getAllUsers(),
          subjectDAL.getAllSubjects().catch(() => ({ data: [] as SubjectDto[] })),
          gradeApi.getAll().catch(() => [] as GradeDto[]),
        ]);
        if (isMounted) {
          if (usersRes.data) {
            const staffOnly = usersRes.data.filter((u) =>
              u.roles && u.roles.some((r) => INTERNAL_STAFF_ROLES.includes(r.toLowerCase()))
            );
            setUsers(staffOnly);
          }
          if (subjectsRes.data) setSubjects(subjectsRes.data);
          if (gradesRes) setGrades(gradesRes);
        }
      } catch (err) {
        console.warn("Failed to load user accounts:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  const getUserSpecialtyGroups = (u: UserDto): UserSpecialtyGroupDto[] => {
    if (u.subjectGrades && u.subjectGrades.length > 0) {
      return u.subjectGrades.map((sg) => {
        const resolvedSubjName =
          sg.subjectName ||
          subjects.find((s) => s.subjectId === sg.subjectId)?.subjectName ||
          `Subject #${sg.subjectId}`;
        const resolvedGradeNames =
          sg.gradeNames && sg.gradeNames.length > 0
            ? sg.gradeNames
            : (sg.gradeIds || [])
                .map((gid) => grades.find((g) => g.gradeId === gid)?.gradeName)
                .filter((name): name is string => Boolean(name));
        return {
          subjectId: sg.subjectId,
          subjectName: resolvedSubjName,
          gradeIds: sg.gradeIds || [],
          gradeNames: resolvedGradeNames,
        };
      });
    }

    const fallbackGradeIds = u.gradeIds || [];
    const fallbackGradeNames =
      u.gradeNames && u.gradeNames.length > 0
        ? u.gradeNames
        : grades.filter((g) => fallbackGradeIds.includes(g.gradeId)).map((g) => g.gradeName);

    if (u.subjectIds && u.subjectIds.length > 0) {
      return u.subjectIds.map((sid, idx) => ({
        subjectId: sid,
        subjectName:
          u.subjectNames?.[idx] ||
          subjects.find((s) => s.subjectId === sid)?.subjectName ||
          `Subject #${sid}`,
        gradeIds: fallbackGradeIds,
        gradeNames: fallbackGradeNames,
      }));
    }

    if (u.specialty && u.specialty.trim()) {
      const tokens = u.specialty
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      return tokens.map((token, idx) => {
        const matched = subjects.find(
          (s) =>
            s.subjectName.toLowerCase() === token.toLowerCase() ||
            s.subjectCode.toLowerCase() === token.toLowerCase(),
        );
        return {
          subjectId: matched?.subjectId ?? -(idx + 1),
          subjectName: matched?.subjectName ?? token,
          gradeIds: fallbackGradeIds,
          gradeNames: fallbackGradeNames,
        };
      });
    }

    return [];
  };

  const toggleSubjectInGroups = (
    groups: UserSubjectGradeInputDto[],
    subjectId: number,
  ): UserSubjectGradeInputDto[] => {
    const exists = groups.some((g) => g.subjectId === subjectId);
    if (exists) {
      return groups.filter((g) => g.subjectId !== subjectId);
    }
    return [...groups, { subjectId, gradeIds: [] }];
  };

  const toggleGradeInSubjectGroup = (
    groups: UserSubjectGradeInputDto[],
    subjectId: number,
    gradeId: number,
  ): UserSubjectGradeInputDto[] => {
    return groups.map((g) => {
      if (g.subjectId !== subjectId) return g;
      const hasGrade = g.gradeIds.includes(gradeId);
      return {
        ...g,
        gradeIds: hasGrade
          ? g.gradeIds.filter((id) => id !== gradeId)
          : [...g.gradeIds, gradeId].sort((a, b) => a - b),
      };
    });
  };

  const setGradesForSubjectGroup = (
    groups: UserSubjectGradeInputDto[],
    subjectId: number,
    gradeIds: number[],
  ): UserSubjectGradeInputDto[] => {
    return groups.map((g) => (g.subjectId === subjectId ? { ...g, gradeIds: [...gradeIds] } : g));
  };

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

    const teaching = isTeachingRole(addForm.role);
    if (teaching && addForm.subjectGrades.length > 0 && grades.length > 0) {
      const missingGradeGroup = addForm.subjectGrades.find((g) => g.gradeIds.length === 0);
      if (missingGradeGroup) {
        const subjName =
          subjects.find((s) => s.subjectId === missingGradeGroup.subjectId)?.subjectName ||
          `Subject #${missingGradeGroup.subjectId}`;
        setActionErrorMsg(`Please select at least one grade level for "${subjName}".`);
        return;
      }
    }

    const chosenSubjectIds = addForm.subjectGrades.map((g) => g.subjectId);
    const chosenGradeIds = Array.from(
      new Set(addForm.subjectGrades.flatMap((g) => g.gradeIds)),
    ).sort((a, b) => a - b);
    const chosenSubjectNames = subjects
      .filter((s) => chosenSubjectIds.includes(s.subjectId))
      .map((s) => s.subjectName);
    const resolvedSpecialty = teaching
      ? chosenSubjectNames.join(", ") || addForm.specialty.trim() || undefined
      : addForm.specialty.trim() || undefined;

    setSubmitting(true);
    setActionErrorMsg(null);
    try {
      const res = await managementDAL.createUser({
        fullName: addForm.fullName.trim(),
        phone: addForm.phone.trim() || undefined,
        email: addForm.email.trim() || undefined,
        role: addForm.role,
        specialty: resolvedSpecialty,
        subjectGrades: teaching ? addForm.subjectGrades : [],
        subjectIds: teaching ? chosenSubjectIds : [],
        gradeIds: teaching ? chosenGradeIds : [],
        gender: addForm.gender,
      });

      setUsers([res.data, ...users]);
      setShowAddModal(false);
      setAddForm({
        fullName: "",
        phone: "",
        email: "",
        role: "teacher",
        specialty: "",
        subjectGrades: [],
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
    const primaryRole = u.roles && u.roles.length > 0 ? u.roles[0] : "teacher";
    const existingGroups = getUserSpecialtyGroups(u);
    const initialSubjectGrades: UserSubjectGradeInputDto[] = existingGroups
      .filter((g) => g.subjectId > 0)
      .map((g) => ({
        subjectId: g.subjectId,
        gradeIds: [...g.gradeIds],
      }));

    setEditForm({
      userId: u.userId,
      userCode: u.userCode || `USR${u.userId}`,
      fullName: u.fullName,
      phone: u.phone || "",
      email: u.email || "",
      role: primaryRole,
      specialty: u.specialty || "",
      subjectGrades: initialSubjectGrades,
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

    const teaching = isTeachingRole(editForm.role);
    if (teaching && editForm.subjectGrades.length > 0 && grades.length > 0) {
      const missingGradeGroup = editForm.subjectGrades.find((g) => g.gradeIds.length === 0);
      if (missingGradeGroup) {
        const subjName =
          subjects.find((s) => s.subjectId === missingGradeGroup.subjectId)?.subjectName ||
          `Subject #${missingGradeGroup.subjectId}`;
        setActionErrorMsg(`Please select at least one grade level for "${subjName}".`);
        return;
      }
    }

    const chosenSubjectIds = editForm.subjectGrades.map((g) => g.subjectId);
    const chosenGradeIds = Array.from(
      new Set(editForm.subjectGrades.flatMap((g) => g.gradeIds)),
    ).sort((a, b) => a - b);
    const chosenSubjectNames = subjects
      .filter((s) => chosenSubjectIds.includes(s.subjectId))
      .map((s) => s.subjectName);
    const resolvedSpecialty = teaching
      ? chosenSubjectNames.join(", ") || editForm.specialty.trim() || undefined
      : editForm.specialty.trim() || undefined;

    setSubmitting(true);
    setActionErrorMsg(null);
    try {
      const res = await managementDAL.updateUser(editForm.userId, {
        fullName: editForm.fullName.trim(),
        phone: editForm.phone.trim() || undefined,
        email: editForm.email.trim() || undefined,
        role: editForm.role,
        specialty: resolvedSpecialty,
        subjectGrades: teaching ? editForm.subjectGrades : [],
        subjectIds: teaching ? chosenSubjectIds : [],
        gradeIds: teaching ? chosenGradeIds : [],
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

  // Open Status Toggle Confirmation Modal
  const handleOpenDeleteModal = (u: UserDto) => {
    setUserToDelete(u);
    setShowDeleteModal(true);
    setActionErrorMsg(null);
  };

  // Handle Confirm Status Toggle (active <-> inactive)
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    const currentStatus = (userToDelete.status || "active").toLowerCase();
    const nextStatus = currentStatus === "active" ? "inactive" : "active";

    setSubmitting(true);
    setActionErrorMsg(null);
    try {
      await managementDAL.updateUserStatus(userToDelete.userId, nextStatus);
      setUsers(users.map((item) => (item.userId === userToDelete.userId ? { ...item, status: nextStatus } : item)));
      setShowDeleteModal(false);
      setActionSuccessMsg(
        `Changed account status for "${userToDelete.fullName}" (#${userToDelete.userCode}) to ${nextStatus.toUpperCase()}!`
      );
      setTimeout(() => setActionSuccessMsg(null), 3500);
    } catch (err: any) {
      setActionErrorMsg(err.message || "Error updating user account status.");
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
                <th className="fw-bold">Staff Name</th>
                <th className="fw-bold">Phone Number</th>
                <th className="fw-bold">Specialties &amp; Grades</th>
                <th className="fw-bold">Role</th>
                <th className="fw-bold">Status</th>
                <th className="text-center fw-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    Loading staff accounts...
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    <i className="bi bi-people fs-2 d-block mb-2 text-secondary" />
                    No matching staff accounts found.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u, idx) => {
                  const itemIndex = (currentPage - 1) * entriesPerPage + idx + 1;
                  const primaryRole = u.roles && u.roles.length > 0 ? u.roles[0] : "user";
                  const teaching = isTeachingRole(primaryRole);
                  const specialtyGroups = getUserSpecialtyGroups(u);
                  const visibleGroups = specialtyGroups.slice(0, 3);
                  const extraGroupCount = specialtyGroups.length > 3 ? specialtyGroups.length - 3 : 0;
                  const fullSummaryTooltip = specialtyGroups
                    .map((g) =>
                      g.gradeNames.length > 0
                        ? `${g.subjectName}: ${g.gradeNames.join(", ")}`
                        : g.subjectName,
                    )
                    .join(" | ");

                  return (
                    <tr key={u.userId}>
                      <td>{itemIndex}</td>
                      <td>
                        <div>
                          <h6 className="mb-0 fw-bold text-dark">{u.fullName}</h6>
                          <small className="text-muted">{u.email || "No email"}</small>
                        </div>
                      </td>
                      <td>{u.phone || "—"}</td>
                      <td>
                        {teaching ? (
                          specialtyGroups.length > 0 ? (
                            <div className="d-flex flex-column gap-1" title={fullSummaryTooltip}>
                              {visibleGroups.map((group) => {
                                const visibleGrades = group.gradeNames.slice(0, 3);
                                const extraGrades =
                                  group.gradeNames.length > 3 ? group.gradeNames.length - 3 : 0;
                                return (
                                  <div
                                    key={group.subjectId}
                                    className="d-flex flex-wrap align-items-center gap-1"
                                  >
                                    <SubjectBadge subject={group.subjectName} />
                                    {visibleGrades.length > 0 ? (
                                      <>
                                        <span className="text-muted small">:</span>
                                        {visibleGrades.map((gr) => (
                                          <span
                                            key={gr}
                                            className="badge bg-info-subtle text-info-emphasis border border-info-subtle fw-semibold"
                                          >
                                            {gr}
                                          </span>
                                        ))}
                                        {extraGrades > 0 && (
                                          <span
                                            className="badge rounded-pill bg-secondary-subtle text-secondary-emphasis border fw-semibold"
                                            title={`${group.subjectName}: ${group.gradeNames.join(", ")}`}
                                          >
                                            +{extraGrades}
                                          </span>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-muted small fst-italic">(No grades)</span>
                                    )}
                                  </div>
                                );
                              })}
                              {extraGroupCount > 0 && (
                                <div>
                                  <span
                                    className="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle fw-semibold"
                                    title={fullSummaryTooltip}
                                  >
                                    +{extraGroupCount} more subject{extraGroupCount > 1 ? "s" : ""}
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted small">Not assigned</span>
                          )
                        ) : (
                          <SubjectBadge subject={u.specialty || "General"} />
                        )}
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
                            action={(u.status || "active").toLowerCase() === "active" ? "Lock" : "Unlock"}
                            onClick={() => handleOpenDeleteModal(u)}
                            title={
                              (u.status || "active").toLowerCase() === "active"
                                ? "Set account to Inactive"
                                : "Activate account"
                            }
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
                    {isTeachingRole(addForm.role) ? (
                      <>
                        <div className="col-12">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <label className="form-label fw-bold mb-0">
                              <i className="bi bi-journal-bookmark-fill text-primary me-1" />
                              1. Select Specialties / Subjects (Chọn 1 hoặc nhiều môn chuyên môn)
                            </label>
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                              {addForm.subjectGrades.length} subject{addForm.subjectGrades.length === 1 ? "" : "s"} selected
                            </span>
                          </div>
                          {subjects.length > 0 ? (
                            <div className="p-3 bg-light rounded-3 border d-flex flex-wrap gap-2">
                              {subjects.map((subj) => {
                                const checked = addForm.subjectGrades.some(
                                  (g) => g.subjectId === subj.subjectId,
                                );
                                return (
                                  <button
                                    key={subj.subjectId}
                                    type="button"
                                    className={`btn btn-sm d-inline-flex align-items-center gap-1 fw-semibold ${
                                      checked ? "btn-primary shadow-sm" : "btn-outline-secondary bg-white"
                                    }`}
                                    onClick={() =>
                                      setAddForm({
                                        ...addForm,
                                        subjectGrades: toggleSubjectInGroups(
                                          addForm.subjectGrades,
                                          subj.subjectId,
                                        ),
                                      })
                                    }
                                  >
                                    <i className={`bi ${checked ? "bi-check-circle-fill" : "bi-plus-circle"}`} />
                                    {subj.subjectName}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <input
                              type="text"
                              className="form-control"
                              placeholder="e.g. Mathematics, Physics..."
                              value={addForm.specialty}
                              onChange={(e) => setAddForm({ ...addForm, specialty: e.target.value })}
                            />
                          )}
                        </div>
                        <div className="col-12">
                          <label className="form-label fw-bold mb-2">
                            <i className="bi bi-mortarboard-fill text-info me-1" />
                            2. Assign Grade Levels per Subject (Chọn khối lớp phụ trách riêng cho từng môn)
                          </label>
                          {addForm.subjectGrades.length === 0 ? (
                            <div className="p-3 bg-light rounded-3 border text-muted small">
                              <i className="bi bi-info-circle me-1" />
                              Please select at least one subject above to assign grade levels for each subject.
                            </div>
                          ) : (
                            <div className="d-flex flex-column gap-3">
                              {addForm.subjectGrades.map((group) => {
                                const subj = subjects.find((s) => s.subjectId === group.subjectId);
                                const subjName = subj?.subjectName || `Subject #${group.subjectId}`;
                                const allGradeIds = grades.map((gr) => gr.gradeId);
                                const allSelected =
                                  allGradeIds.length > 0 &&
                                  allGradeIds.every((id) => group.gradeIds.includes(id));

                                return (
                                  <div
                                    key={group.subjectId}
                                    className="p-3 bg-light rounded-3 border"
                                  >
                                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2 pb-2 border-bottom">
                                      <div className="d-flex align-items-center gap-2">
                                        <SubjectBadge subject={subjName} />
                                        <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle">
                                          {group.gradeIds.length} grade{group.gradeIds.length === 1 ? "" : "s"}
                                        </span>
                                      </div>
                                      <div className="d-flex align-items-center gap-2">
                                        {grades.length > 0 && (
                                          <button
                                            type="button"
                                            className="btn btn-sm btn-link text-decoration-none p-0 small"
                                            onClick={() =>
                                              setAddForm({
                                                ...addForm,
                                                subjectGrades: setGradesForSubjectGroup(
                                                  addForm.subjectGrades,
                                                  group.subjectId,
                                                  allSelected ? [] : allGradeIds,
                                                ),
                                              })
                                            }
                                          >
                                            {allSelected ? "Clear all" : "Select all grades"}
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    {grades.length > 0 ? (
                                      <div className="d-flex flex-wrap gap-2">
                                        {grades.map((gr) => {
                                          const checked = group.gradeIds.includes(gr.gradeId);
                                          return (
                                            <button
                                              key={gr.gradeId}
                                              type="button"
                                              className={`btn btn-sm d-inline-flex align-items-center gap-1 fw-semibold ${
                                                checked
                                                  ? "btn-info text-white shadow-sm"
                                                  : "btn-outline-secondary bg-white"
                                              }`}
                                              onClick={() =>
                                                setAddForm({
                                                  ...addForm,
                                                  subjectGrades: toggleGradeInSubjectGroup(
                                                    addForm.subjectGrades,
                                                    group.subjectId,
                                                    gr.gradeId,
                                                  ),
                                                })
                                              }
                                            >
                                              <i
                                                className={`bi ${
                                                  checked ? "bi-check-circle-fill" : "bi-circle"
                                                }`}
                                              />
                                              {gr.gradeName}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <div className="text-muted small">No grade levels available.</div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Department / Function</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Center Administration, Customer Service & Billing..."
                          value={addForm.specialty}
                          onChange={(e) => setAddForm({ ...addForm, specialty: e.target.value })}
                        />
                      </div>
                    )}
                    {actionErrorMsg && (
                      <div className="col-12">
                        <div className="alert alert-danger py-2 mb-0 small" role="alert">
                          <i className="bi bi-exclamation-triangle-fill me-1" />
                          {actionErrorMsg}
                        </div>
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
                    {isTeachingRole(editForm.role) ? (
                      <>
                        <div className="col-12">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <label className="form-label fw-bold mb-0">
                              <i className="bi bi-journal-bookmark-fill text-primary me-1" />
                              1. Select Specialties / Subjects (Chọn 1 hoặc nhiều môn chuyên môn)
                            </label>
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                              {editForm.subjectGrades.length} subject{editForm.subjectGrades.length === 1 ? "" : "s"} selected
                            </span>
                          </div>
                          {subjects.length > 0 ? (
                            <div className="p-3 bg-light rounded-3 border d-flex flex-wrap gap-2">
                              {subjects.map((subj) => {
                                const checked = editForm.subjectGrades.some(
                                  (g) => g.subjectId === subj.subjectId,
                                );
                                return (
                                  <button
                                    key={subj.subjectId}
                                    type="button"
                                    className={`btn btn-sm d-inline-flex align-items-center gap-1 fw-semibold ${
                                      checked ? "btn-primary shadow-sm" : "btn-outline-secondary bg-white"
                                    }`}
                                    onClick={() =>
                                      setEditForm({
                                        ...editForm,
                                        subjectGrades: toggleSubjectInGroups(
                                          editForm.subjectGrades,
                                          subj.subjectId,
                                        ),
                                      })
                                    }
                                  >
                                    <i className={`bi ${checked ? "bi-check-circle-fill" : "bi-plus-circle"}`} />
                                    {subj.subjectName}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <input
                              type="text"
                              className="form-control"
                              value={editForm.specialty}
                              onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value })}
                            />
                          )}
                        </div>
                        <div className="col-12">
                          <label className="form-label fw-bold mb-2">
                            <i className="bi bi-mortarboard-fill text-info me-1" />
                            2. Assign Grade Levels per Subject (Chọn khối lớp phụ trách riêng cho từng môn)
                          </label>
                          {editForm.subjectGrades.length === 0 ? (
                            <div className="p-3 bg-light rounded-3 border text-muted small">
                              <i className="bi bi-info-circle me-1" />
                              Please select at least one subject above to assign grade levels for each subject.
                            </div>
                          ) : (
                            <div className="d-flex flex-column gap-3">
                              {editForm.subjectGrades.map((group) => {
                                const subj = subjects.find((s) => s.subjectId === group.subjectId);
                                const subjName = subj?.subjectName || `Subject #${group.subjectId}`;
                                const allGradeIds = grades.map((gr) => gr.gradeId);
                                const allSelected =
                                  allGradeIds.length > 0 &&
                                  allGradeIds.every((id) => group.gradeIds.includes(id));

                                return (
                                  <div
                                    key={group.subjectId}
                                    className="p-3 bg-light rounded-3 border"
                                  >
                                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2 pb-2 border-bottom">
                                      <div className="d-flex align-items-center gap-2">
                                        <SubjectBadge subject={subjName} />
                                        <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle">
                                          {group.gradeIds.length} grade{group.gradeIds.length === 1 ? "" : "s"}
                                        </span>
                                      </div>
                                      <div className="d-flex align-items-center gap-2">
                                        {grades.length > 0 && (
                                          <button
                                            type="button"
                                            className="btn btn-sm btn-link text-decoration-none p-0 small"
                                            onClick={() =>
                                              setEditForm({
                                                ...editForm,
                                                subjectGrades: setGradesForSubjectGroup(
                                                  editForm.subjectGrades,
                                                  group.subjectId,
                                                  allSelected ? [] : allGradeIds,
                                                ),
                                              })
                                            }
                                          >
                                            {allSelected ? "Clear all" : "Select all grades"}
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    {grades.length > 0 ? (
                                      <div className="d-flex flex-wrap gap-2">
                                        {grades.map((gr) => {
                                          const checked = group.gradeIds.includes(gr.gradeId);
                                          return (
                                            <button
                                              key={gr.gradeId}
                                              type="button"
                                              className={`btn btn-sm d-inline-flex align-items-center gap-1 fw-semibold ${
                                                checked
                                                  ? "btn-info text-white shadow-sm"
                                                  : "btn-outline-secondary bg-white"
                                              }`}
                                              onClick={() =>
                                                setEditForm({
                                                  ...editForm,
                                                  subjectGrades: toggleGradeInSubjectGroup(
                                                    editForm.subjectGrades,
                                                    group.subjectId,
                                                    gr.gradeId,
                                                  ),
                                                })
                                              }
                                            >
                                              <i
                                                className={`bi ${
                                                  checked ? "bi-check-circle-fill" : "bi-circle"
                                                }`}
                                              />
                                              {gr.gradeName}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <div className="text-muted small">No grade levels available.</div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Department / Function</label>
                        <input
                          type="text"
                          className="form-control"
                          value={editForm.specialty}
                          onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value })}
                        />
                      </div>
                    )}
                    {actionErrorMsg && (
                      <div className="col-12">
                        <div className="alert alert-danger py-2 mb-0 small" role="alert">
                          <i className="bi bi-exclamation-triangle-fill me-1" />
                          {actionErrorMsg}
                        </div>
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

      {/* STATUS TOGGLE CONFIRMATION MODAL */}
      {showDeleteModal && userToDelete && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div
                className={`modal-header ${
                  (userToDelete.status || "active").toLowerCase() === "active"
                    ? "bg-warning text-dark"
                    : "bg-success text-white"
                }`}
              >
                <h5 className="modal-title fw-bold">
                  <i
                    className={`bi ${
                      (userToDelete.status || "active").toLowerCase() === "active"
                        ? "bi-lock-fill"
                        : "bi-unlock-fill"
                    } me-2`}
                  />
                  {(userToDelete.status || "active").toLowerCase() === "active"
                    ? "Confirm Deactivate Staff Account"
                    : "Confirm Activate Staff Account"}
                </h5>
                <button
                  type="button"
                  className={`btn-close ${
                    (userToDelete.status || "active").toLowerCase() === "active" ? "" : "btn-close-white"
                  }`}
                  onClick={() => setShowDeleteModal(false)}
                />
              </div>
              <div className="modal-body p-4">
                <p className="mb-2">
                  {(userToDelete.status || "active").toLowerCase() === "active"
                    ? "Are you sure you want to set this staff account to INACTIVE?"
                    : "Are you sure you want to reactivate this staff account to ACTIVE?"}
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
                    <DotStatusBadge status={userToDelete.status || "active"} />
                  </div>
                </div>
                <div className="alert alert-info py-2 mb-0 small">
                  <i className="bi bi-info-circle me-1" />
                  {(userToDelete.status || "active").toLowerCase() === "active"
                    ? "Deactivating preserves all academic history and assignments while disabling system sign-in."
                    : "Reactivating restores sign-in access for this staff member."}
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
                  className={`btn ${
                    (userToDelete.status || "active").toLowerCase() === "active"
                      ? "btn-warning fw-bold"
                      : "btn-success"
                  } px-4`}
                  onClick={handleConfirmDelete}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Updating...
                    </>
                  ) : (userToDelete.status || "active").toLowerCase() === "active" ? (
                    "Set Inactive"
                  ) : (
                    "Activate Account"
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
                      <div className="col-12">
                        <div className="p-3 bg-light rounded-3 h-100">
                          <small className="text-muted d-block mb-2">
                            {isTeachingRole(selectedUser.roles?.[0])
                              ? "Specialties & Grade Levels"
                              : "Department / Function"}
                          </small>
                          {isTeachingRole(selectedUser.roles?.[0]) ? (
                            getUserSpecialtyGroups(selectedUser).length > 0 ? (
                              <div className="d-flex flex-column gap-2">
                                {getUserSpecialtyGroups(selectedUser).map((group) => (
                                  <div
                                    key={group.subjectId}
                                    className="d-flex flex-wrap align-items-center gap-1"
                                  >
                                    <SubjectBadge subject={group.subjectName} />
                                    <span className="text-muted small">:</span>
                                    {group.gradeNames.length > 0 ? (
                                      group.gradeNames.map((gr) => (
                                        <span
                                          key={gr}
                                          className="badge bg-info-subtle text-info-emphasis border border-info-subtle fw-semibold"
                                        >
                                          {gr}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-muted small fst-italic">No grades assigned</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <strong className="text-dark">Not assigned</strong>
                            )
                          ) : (
                            <strong className="text-dark">{selectedUser.specialty || "General"}</strong>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3 h-100">
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
