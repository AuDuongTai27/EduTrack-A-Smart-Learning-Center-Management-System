import { useState, useEffect, useMemo } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import DotStatusBadge from "../../../components/Common/DotStatusBadge";
import SubjectBadge from "../../../components/Common/SubjectBadge";
import Pagination from "../../../components/Common/Pagination";
import TableToolbar from "../../../components/Common/TableToolbar";
import UserAvatar from "../../../components/Common/UserAvatar";
import userDAL from "../../../../DAL/userDAL";
import type { UserDto } from "../../../../BLL/models/UserDto";

export default function AdminStaffStudentPage() {
  const [students, setStudents] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);

  // Modals state
  const [selectedStudent, setSelectedStudent] = useState<UserDto | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // New Student form state
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentPhone, setNewStudentPhone] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentGender, setNewStudentGender] = useState("male");
  const [newStudentClass, setNewStudentClass] = useState("Toán 12 Chuyên Sâu");

  useEffect(() => {
    let isMounted = true;
    async function loadStudents() {
      try {
        setLoading(true);
        const res = await userDAL.getAllUsers();
        if (isMounted && res.data) {
          const studentList = res.data.filter(
            (u) => u.roles?.includes("student") || u.userCode.startsWith("STU")
          );
          setStudents(studentList);
        }
      } catch (err) {
        console.warn("Lỗi tải danh sách học sinh:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadStudents();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter logic
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        searchTerm === "" ||
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.phone && s.phone.includes(searchTerm)) ||
        (s.userCode && s.userCode.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus =
        selectedStatus === "All" ||
        s.status?.toLowerCase() === selectedStatus.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [students, searchTerm, selectedStatus]);

  // Pagination
  const totalItems = filteredStudents.length;
  const totalPages = Math.ceil(totalItems / entriesPerPage) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredStudents.slice(start, start + entriesPerPage);
  }, [filteredStudents, currentPage, entriesPerPage]);

  // Handle View Student (GetById)
  const handleViewStudent = async (studentId: number) => {
    try {
      setIsDetailLoading(true);
      const detail = await userDAL.getUserById(studentId);
      setSelectedStudent(detail);
    } catch (err) {
      console.warn("Lỗi tải chi tiết học sinh:", err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  // Handle Add Student submit
  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const newId = students.length > 0 ? Math.max(...students.map((s) => s.userId)) + 1 : 101;
    const newStudentObj: UserDto = {
      userId: newId,
      userCode: `STU${String(newId).padStart(3, "0")}`,
      fullName: newStudentName.trim(),
      email: newStudentEmail || `student${newId}@student.edutrack.vn`,
      phone: newStudentPhone || "0912345678",
      gender: newStudentGender,
      specialty: newStudentClass,
      status: "active",
      enrolledSince: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
      roles: ["student"],
    };

    setStudents((prev) => [newStudentObj, ...prev]);
    setIsAddModalOpen(false);
    setNewStudentName("");
    setNewStudentPhone("");
    setNewStudentEmail("");
    setActionSuccessMsg(`Đã tiếp nhận hồ sơ học viên mới: "${newStudentObj.fullName}" thành công!`);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  return (
    <>
      {/* Breadcrumb and Quick Access */}
      <PageHeader
        title="Quản Lý Hồ Sơ Học Viên (Student Management)"
        breadcrumbItems={[
          { label: "Admin Staff", path: "/admin-staff" },
          { label: "Students" },
        ]}
        action={
          <button
            type="button"
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={() => setIsAddModalOpen(true)}
          >
            <i className="bi bi-person-plus-fill" />
            Tiếp nhận học viên mới
          </button>
        }
      />

      {loading && (
        <div className="alert alert-info py-2 px-3 mb-3 d-flex align-items-center gap-2">
          <div className="spinner-border spinner-border-sm" role="status" />
          <span>Đang nạp dữ liệu danh sách học viên từ hệ thống...</span>
        </div>
      )}

      {actionSuccessMsg && (
        <div className="alert alert-success alert-dismissible fade show py-2 px-3 mb-3" role="alert">
          <i className="bi bi-check-circle-fill me-2" />
          {actionSuccessMsg}
          <button type="button" className="btn-close" onClick={() => setActionSuccessMsg(null)} />
        </div>
      )}

      {/* Student List */}
      <div className="card user-list-card border-0 mb-4">
        {/* Filter Toolbar */}
        <div className="card-header user-list-header">
          <div className="row g-3 align-items-center">
            {/* Search */}
            <div className="col-xl-5 col-lg-6">
              <div className="user-search">
                <i className="bi bi-search" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm kiếm theo mã số, họ tên hoặc số điện thoại..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
            {/* Status Filter */}
            <div className="col-xl-3 col-lg-3 col-md-6">
              <select
                className="form-select"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">Tất cả trạng thái</option>
                <option value="active">Đang theo học (Active)</option>
                <option value="inactive">Đã tạm nghỉ / Thôi học</option>
              </select>
            </div>
            {/* Reset Button */}
            <div className="col-xl-4 col-lg-3 col-md-6 d-flex justify-content-end">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedStatus("All");
                  setCurrentPage(1);
                }}
              >
                <i className="bi bi-arrow-clockwise" /> Đặt lại bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Table Controls */}
        <TableToolbar
          totalItems={totalItems}
          totalLabel="Tổng số học sinh"
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
                <th className="fw-bold">Mã Học Viên</th>
                <th className="fw-bold">Họ Và Tên</th>
                <th className="fw-bold">Khóa Học / Lớp Ghi Danh</th>
                <th className="fw-bold">Số Điện Thoại</th>
                <th className="fw-bold">Email Học Viên</th>
                <th className="fw-bold">Ngày Nhập Học</th>
                <th className="fw-bold">Trạng Thái</th>
                <th className="text-center fw-bold">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map((s) => {
                  const isActive = s.status?.toLowerCase() === "active";
                  const enrollDate = s.enrolledSince
                    ? new Date(s.enrolledSince).toLocaleDateString("vi-VN")
                    : "05/01/2026";
                  return (
                    <tr key={s.userId}>
                      <td>
                        <span className="badge bg-primary bg-opacity-10 text-primary fw-bold">
                          #{s.userCode}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <UserAvatar name={s.fullName} />
                          <div>
                            <div className="fw-bold text-dark">{s.fullName}</div>
                            <small className="text-muted">
                              {s.gender === "female" ? "Nữ" : "Nam"}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <SubjectBadge subject={s.specialty || "Toán 12 Chuyên Sâu"} />
                      </td>
                      <td>{s.phone || "0912 345 678"}</td>
                      <td>
                        <span className="small text-muted">{s.email}</span>
                      </td>
                      <td>{enrollDate}</td>
                      <td>
                        <DotStatusBadge status={isActive ? "Active" : "Inactive"} />
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                          onClick={() => handleViewStudent(s.userId)}
                        >
                          <i className="bi bi-eye" /> Chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-muted">
                    Không tìm thấy học sinh nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="card-footer bg-white border-top py-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <small className="text-muted">
            Hiển thị {paginatedStudents.length} trên tổng {totalItems} học viên
          </small>
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            entriesPerPage={entriesPerPage}
            itemLabel="students"
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>

      {/* DETAIL MODAL (GetById) */}
      {selectedStudent && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content shadow border-0">
              <div className="modal-header bg-light">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <i className="bi bi-person-badge-fill text-primary" />
                  Hồ Sơ Chi Tiết Học Viên: {selectedStudent.fullName}
                </h5>
                <button type="button" className="btn-close" onClick={() => setSelectedStudent(null)} />
              </div>
              <div className="modal-body p-4">
                <div className="d-flex align-items-center gap-3 pb-3 mb-3 border-bottom">
                  <UserAvatar name={selectedStudent.fullName} />
                  <div>
                    <h4 className="fw-bold mb-1 text-dark">{selectedStudent.fullName}</h4>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-primary">#{selectedStudent.userCode}</span>
                      <DotStatusBadge status={selectedStudent.status || "Active"} />
                    </div>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="text-muted small d-block">Lớp ghi danh</label>
                    <span className="fw-bold text-dark">{selectedStudent.specialty || "Toán 12 Chuyên Sâu"}</span>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small d-block">Giới tính</label>
                    <span className="fw-semibold text-dark">{selectedStudent.gender === "female" ? "Nữ" : "Nam"}</span>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small d-block">Số điện thoại liên hệ</label>
                    <span className="fw-semibold text-dark">{selectedStudent.phone || "0912 345 678"}</span>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small d-block">Email tài khoản</label>
                    <span className="fw-semibold text-dark">{selectedStudent.email}</span>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small d-block">Ngày sinh</label>
                    <span>{selectedStudent.dateOfBirth ? new Date(selectedStudent.dateOfBirth).toLocaleDateString("vi-VN") : "14/02/2010"}</span>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small d-block">Ngày bắt đầu nhập học</label>
                    <span>{selectedStudent.enrolledSince ? new Date(selectedStudent.enrolledSince).toLocaleDateString("vi-VN") : "05/01/2026"}</span>
                  </div>
                  <div className="col-12">
                    <label className="text-muted small d-block">Địa chỉ liên hệ</label>
                    <span className="text-dark">123 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedStudent(null)}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL: TIẾP NHẬN HỌC VIÊN MỚI (ADD STUDENT MODAL) */}
      {isAddModalOpen && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <i className="bi bi-person-plus-fill" />
                  Tiếp Nhận Học Viên Mới
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setIsAddModalOpen(false)}
                />
              </div>
              <form onSubmit={handleAddStudentSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Họ và tên học viên *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="VD: Nguyễn Hoàng Long"
                      required
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                    />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Số điện thoại *</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="09xx xxx xxx"
                        required
                        value={newStudentPhone}
                        onChange={(e) => setNewStudentPhone(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Giới tính</label>
                      <select
                        className="form-select"
                        value={newStudentGender}
                        onChange={(e) => setNewStudentGender(e.target.value)}
                      >
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="student@edutrack.edu.vn"
                      value={newStudentEmail}
                      onChange={(e) => setNewStudentEmail(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Lớp ghi danh ban đầu</label>
                    <select
                      className="form-select"
                      value={newStudentClass}
                      onChange={(e) => setNewStudentClass(e.target.value)}
                    >
                      <option value="Toán 12 Chuyên Sâu">Toán 12 Chuyên Sâu</option>
                      <option value="Vật Lý 12 Nâng Cao">Vật Lý 12 Nâng Cao</option>
                      <option value="Hóa Học 11 Cơ Bản">Hóa Học 11 Cơ Bản</option>
                      <option value="Tiếng Anh Giao Tiếp">Tiếng Anh Giao Tiếp</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1">
                    <i className="bi bi-check-lg" /> Lưu hồ sơ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
