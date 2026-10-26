import { useState, useEffect, useMemo } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import DotStatusBadge from "../../../components/Common/DotStatusBadge";
import SubjectBadge from "../../../components/Common/SubjectBadge";
import Pagination from "../../../components/Common/Pagination";
import TableToolbar from "../../../components/Common/TableToolbar";
import UserAvatar from "../../../components/Common/UserAvatar";
import userDAL from "../../../../DAL/userDAL";
import type { UserDto } from "../../../../BLL/models/UserDto";

export default function CenterManagerStudentPage() {
  const [students, setStudents] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedSort, setSelectedSort] = useState<string>("az");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);

  // Detail Modal state (GetById)
  const [selectedStudent, setSelectedStudent] = useState<UserDto | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  // Add Student Modal state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [addForm, setAddForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    specialty: "Class 7",
    gender: "male",
  });
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchStudents() {
      try {
        setLoading(true);
        const res = await userDAL.getAllUsers();
        if (isMounted && res.data) {
          const studentList = res.data.filter((u) => u.roles && u.roles.includes("student"));
          setStudents(studentList);
        }
      } catch (err) {
        console.warn("Lỗi tải danh sách học viên center manager:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchStudents();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter & Search logic
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const matchSearch =
          searchTerm === "" ||
          s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (s.phone && s.phone.includes(searchTerm)) ||
          (s.userCode && s.userCode.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchSpecialty =
          selectedSpecialty === "All" ||
          (s.specialty && s.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase()));

        const matchStatus =
          selectedStatus === "All" ||
          (s.status && s.status.toLowerCase() === selectedStatus.toLowerCase());

        return matchSearch && matchSpecialty && matchStatus;
      })
      .sort((a, b) => {
        if (selectedSort === "az") return a.fullName.localeCompare(b.fullName);
        if (selectedSort === "za") return b.fullName.localeCompare(a.fullName);
        if (selectedSort === "newest") return b.userId - a.userId;
        if (selectedSort === "oldest") return a.userId - b.userId;
        return 0;
      });
  }, [students, searchTerm, selectedSpecialty, selectedStatus, selectedSort]);

  // Paginated list
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredStudents.slice(start, start + entriesPerPage);
  }, [filteredStudents, currentPage, entriesPerPage]);

  // Handle View Details (GetById)
  const handleViewDetails = async (s: UserDto) => {
    setLoadingDetail(true);
    try {
      const detail = await userDAL.getUserById(s.userId);
      setSelectedStudent(detail || s);
    } catch {
      setSelectedStudent(s);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Handle Add Student Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.fullName.trim()) return;

    const newId = students.length > 0 ? Math.max(...students.map((x) => x.userId)) + 1 : 201;
    const newStudentObj: UserDto = {
      userId: newId,
      userCode: `STU${String(newId).padStart(3, "0")}`,
      fullName: addForm.fullName.trim(),
      phone: addForm.phone || "0987 654 321",
      email: addForm.email || `student${newId}@edutrack.edu.vn`,
      specialty: addForm.specialty,
      roles: ["student"],
      status: "active",
      gender: addForm.gender,
      createdAt: new Date().toISOString(),
    };

    setStudents([newStudentObj, ...students]);
    setShowAddModal(false);
    setAddForm({
      fullName: "",
      phone: "",
      email: "",
      specialty: "Class 7",
      gender: "male",
    });
    setActionSuccessMsg(`Đã thêm học viên mới: "${newStudentObj.fullName}" (${newStudentObj.userCode}) thành công!`);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  return (
    <>
      {/* Breadcrumb and Quick Access */}
      <PageHeader
        title="Student Management"
        breadcrumbItems={[
          { label: "Center Manager", path: "/center-manager" },
          { label: "Students Management" },
        ]}
        action={
          <button
            type="button"
            className="btn btn-primary d-flex align-items-center shadow-sm"
            onClick={() => setShowAddModal(true)}
          >
            <i className="bi bi-plus-square me-2" />
            Add Student
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

      {/* Student List */}
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
                  placeholder="Search by student name, phone, code..."
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
                value={selectedSpecialty}
                onChange={(e) => {
                  setSelectedSpecialty(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Classes / Grades</option>
                <option value="7">Class 7</option>
                <option value="8">Class 8</option>
                <option value="9">Class 9</option>
                <option value="12">Class 12</option>
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
                <option value="on hold">On Hold</option>
                <option value="inactive">Inactive</option>
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
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Controls */}
        <TableToolbar
          totalItems={filteredStudents.length}
          totalLabel="Total students"
          entriesPerPage={entriesPerPage}
          onEntriesPerPageChange={(value) => {
            setEntriesPerPage(value);
            setCurrentPage(1);
          }}
        />

        {/* Student Table */}
        <div className="table-responsive">
          <table className="table user-table align-middle mb-0 table-hover">
            <thead className="table-light">
              <tr>
                <th className="fw-bold">No.</th>
                <th className="fw-bold">Student Code</th>
                <th className="fw-bold">Student Name</th>
                <th className="fw-bold">Class / Specialty</th>
                <th className="fw-bold">Phone Number</th>
                <th className="fw-bold">Status</th>
                <th className="text-center fw-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    Đang nạp danh sách học viên...
                  </td>
                </tr>
              ) : paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    <i className="bi bi-mortarboard fs-2 d-block mb-2 text-secondary" />
                    Không tìm thấy học viên nào phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((s, idx) => {
                  const itemIndex = (currentPage - 1) * entriesPerPage + idx + 1;

                  return (
                    <tr key={s.userId}>
                      <td>{itemIndex}</td>
                      <td>
                        <span className="badge bg-light text-primary border font-monospace">
                          #{s.userCode || `STU${s.userId}`}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <UserAvatar name={s.fullName} />
                          <div>
                            <h6 className="mb-0 fw-bold text-dark">{s.fullName}</h6>
                            <small className="text-muted">{s.email || "—"}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <SubjectBadge subject={s.specialty || "Class 7"} />
                      </td>
                      <td>{s.phone || "—"}</td>
                      <td>
                        <DotStatusBadge status={s.status || "active"} />
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleViewDetails(s)}
                          title="View Student Profile"
                        >
                          <i className="bi bi-eye me-1" />
                          Hồ sơ
                        </button>
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
            totalItems={filteredStudents.length}
            entriesPerPage={entriesPerPage}
            itemLabel="students"
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* ADD STUDENT MODAL */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-mortarboard-fill me-2" />
                  Tiếp nhận học viên mới (Center Manager)
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
                      <label className="form-label fw-bold">Họ và tên học sinh <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nhập tên học sinh..."
                        value={addForm.fullName}
                        onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Khối lớp theo học</label>
                      <select
                        className="form-select"
                        value={addForm.specialty}
                        onChange={(e) => setAddForm({ ...addForm, specialty: e.target.value })}
                      >
                        <option value="Class 7">Class 7 - THCS</option>
                        <option value="Class 8">Class 8 - THCS</option>
                        <option value="Class 9">Class 9 - Luyện thi vào 10</option>
                        <option value="Class 10">Class 10 - THPT</option>
                        <option value="Class 11">Class 11 - THPT</option>
                        <option value="Class 12">Class 12 - Luyện thi Đại học</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Số điện thoại liên hệ</label>
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
                        placeholder="hocsinh@edutrack.edu.vn"
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
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                      </select>
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
                    Thêm học viên
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL (GetById) */}
      {selectedStudent && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-light border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-primary fs-6 font-monospace">
                    #{selectedStudent.userCode || `STU${selectedStudent.userId}`}
                  </span>
                  <h5 className="modal-title fw-bold mb-0 text-dark">
                    Hồ sơ chi tiết học viên
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedStudent(null)}
                />
              </div>

              <div className="modal-body p-4">
                {loadingDetail ? (
                  <div className="text-center py-4 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    Đang nạp thông tin học viên...
                  </div>
                ) : (
                  <>
                    <div className="d-flex align-items-center gap-3 pb-3 mb-4 border-bottom">
                      <UserAvatar name={selectedStudent.fullName} />
                      <div className="flex-grow-1">
                        <h4 className="fw-bold mb-1 text-dark">{selectedStudent.fullName}</h4>
                        <div className="d-flex align-items-center gap-2">
                          <SubjectBadge subject={selectedStudent.specialty || "Học sinh"} />
                          <DotStatusBadge status={selectedStudent.status || "active"} />
                        </div>
                      </div>
                    </div>

                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3">
                          <small className="text-muted d-block mb-1">Số điện thoại phụ huynh / học sinh</small>
                          <strong className="text-dark">{selectedStudent.phone || "—"}</strong>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3">
                          <small className="text-muted d-block mb-1">Email liên lạc</small>
                          <strong className="text-dark">{selectedStudent.email || "—"}</strong>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3">
                          <small className="text-muted d-block mb-1">Khối lớp theo học</small>
                          <strong className="text-dark">{selectedStudent.specialty || "Toán 12 Chuyên sâu"}</strong>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3">
                          <small className="text-muted d-block mb-1">Ngày nhập học</small>
                          <strong className="text-dark">
                            {selectedStudent.createdAt ? new Date(selectedStudent.createdAt).toLocaleDateString("vi-VN") : "01/08/2026"}
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
                  onClick={() => setSelectedStudent(null)}
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
