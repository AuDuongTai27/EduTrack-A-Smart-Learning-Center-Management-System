import React, { useState, useMemo } from "react";
import type { UserDto } from "../../../../../BLL/models/UserDto";
import type { AttendanceDto } from "../../../../../BLL/models/ProgressDto";
import type { TeachingStudentProgressItemDto } from "../../../../../BLL/models/teaching/TeachingLearningProgressDto";

export interface ProgressTableProps {
  students?: UserDto[];
  attendances?: AttendanceDto[];
  latestAssignmentTitle?: string;
  progressStudents?: TeachingStudentProgressItemDto[];
}

export default function ProgressTable({
  students = [],
  attendances = [],
  latestAssignmentTitle = "Homework 01: Quadratic Equations",
  progressStudents = [],
}: ProgressTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<TeachingStudentProgressItemDto | null>(null);

  const getInitials = (name?: string) => {
    if (!name) return "ST";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarClass = (idx: number) => {
    const classes = [
      "avatar-initials-indigo",
      "avatar-initials-emerald",
      "avatar-initials-amber",
      "avatar-initials-rose",
    ];
    return classes[idx % classes.length];
  };

  // Chuẩn hóa dữ liệu hiển thị ưu tiên từ progressStudents nếu có
  const displayItems: TeachingStudentProgressItemDto[] = useMemo(() => {
    if (progressStudents.length > 0) {
      return progressStudents;
    }

    if (students.length > 0) {
      return students.map((stu, idx) => {
        const studentAtts = attendances.filter((a) => a.studentId === stu.userId);
        const totalDays = studentAtts.length > 0 ? studentAtts.length : 20;
        const presentDays = studentAtts.length > 0
          ? studentAtts.filter((a) => a.status === "present").length
          : 18 + (idx % 3);
        const pct = Math.round((presentDays / totalDays) * 100);

        return {
          studentId: stu.userId,
          studentCode: stu.userCode || `STU${stu.userId || idx + 1}`,
          fullName: stu.fullName,
          avatarInitials: getInitials(stu.fullName),
          email: stu.email || "",
          phone: stu.phone || "",
          presentDays,
          absentDays: Math.max(totalDays - presentDays, 0),
          lateDays: 0,
          totalDays,
          attendancePercentage: pct,
          attendanceStatus: pct >= 80 ? "Present" : "Late",
          latestAssignmentTitle,
          latestAssignmentStatus: idx % 3 === 0 ? "Late" : "Submitted",
          latestAssignmentScore: 9.0,
          maxScore: 10,
          latestNote: "Tiến độ học tập và chuyên cần tốt.",
        };
      });
    }

    return [];
  }, [progressStudents, students, attendances, latestAssignmentTitle]);

  // Bộ lọc tìm kiếm
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return displayItems;
    const term = searchTerm.toLowerCase();
    return displayItems.filter(
      (s) =>
        s.fullName.toLowerCase().includes(term) ||
        s.studentCode.toLowerCase().includes(term) ||
        s.latestAssignmentTitle.toLowerCase().includes(term)
    );
  }, [displayItems, searchTerm]);

  // Phân trang
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredItems.slice(start, start + rowsPerPage);
  }, [filteredItems, currentPage, rowsPerPage]);

  return (
    <>
      {/* Toolbar */}
      <div className="table-toolbar d-flex align-items-center justify-content-between flex-wrap gap-2 px-3 py-2 border-bottom">
        <div className="table-entries-select d-flex align-items-center gap-2">
          <span className="small text-muted">Hiển thị</span>
          <select
            className="form-select form-select-sm"
            id="entriesSelect"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{ width: "auto" }}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
          <span className="small text-muted">học viên / trang</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="input-group input-group-sm" style={{ width: 260 }}>
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search text-muted" />
            </span>
            <input
              type="search"
              className="form-control form-control-sm border-start-0 ps-0"
              id="tableSearchInput"
              placeholder="Tìm theo tên hoặc mã học viên..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Student List Table */}
      <div className="table-responsive-container">
        <table className="table custom-table align-middle mb-0" id="progressTable">
          <thead className="table-light">
            <tr>
              <th className="th-checkbox" style={{ width: 40 }}>
                <div className="form-check m-0">
                  <input className="form-check-input" type="checkbox" id="selectAllStudents" />
                </div>
              </th>
              <th>Học Viên <i className="bi bi-arrow-down-up table-sort-icon small text-muted" /></th>
              <th>Chuyên Cần (Có mặt / Tổng số) <i className="bi bi-arrow-down-up table-sort-icon small text-muted" /></th>
              <th>Bài Tập Mới Nhất</th>
              <th>Tình Trạng Nộp Bài</th>
              <th className="text-end">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.length > 0 ? (
              paginatedItems.map((stu, idx) => {
                const pct = stu.attendancePercentage;

                return (
                  <tr key={stu.studentId || idx}>
                    <td>
                      <div className="form-check m-0">
                        <input className="form-check-input row-checkbox" type="checkbox" />
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className={`ta-avatar-initials avatar-initials-sm ${getAvatarClass(idx)}`}>
                          {stu.avatarInitials || getInitials(stu.fullName)}
                        </div>
                        <div>
                          <span className="fw-semibold d-block text-dark">{stu.fullName}</span>
                          <small className="text-muted">{stu.studentCode}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-bold text-dark">
                          {stu.presentDays}/{stu.totalDays} Buổi
                        </span>
                        <span
                          className={`badge ${
                            pct >= 90
                              ? "bg-success-subtle text-success border border-success-subtle"
                              : pct >= 75
                              ? "bg-primary-subtle text-primary border border-primary-subtle"
                              : "bg-warning-subtle text-warning border border-warning-subtle"
                          }`}
                        >
                          {pct}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="fw-medium text-dark">{stu.latestAssignmentTitle}</span>
                      {stu.latestAssignmentScore != null && (
                        <small className="d-block text-muted">
                          Điểm: <strong className="text-primary">{stu.latestAssignmentScore}</strong>/{stu.maxScore ?? 10}
                        </small>
                      )}
                    </td>
                    <td>
                      {stu.latestAssignmentStatus === "Submitted" ? (
                        <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 rounded-2 fw-semibold">
                          <i className="bi bi-check-circle-fill me-1" />
                          Đã nộp
                        </span>
                      ) : stu.latestAssignmentStatus === "Graded" ? (
                        <span className="badge bg-info-subtle text-info border border-info-subtle px-2 py-1 rounded-2 fw-semibold">
                          <i className="bi bi-award-fill me-1" />
                          Đã chấm ({stu.latestAssignmentScore ?? 10}đ)
                        </span>
                      ) : stu.latestAssignmentStatus === "Late" ? (
                        <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1 rounded-2 fw-semibold">
                          <i className="bi bi-exclamation-triangle-fill me-1" />
                          Nộp trễ
                        </span>
                      ) : stu.latestAssignmentStatus === "Missing" ? (
                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 rounded-2 fw-semibold">
                          <i className="bi bi-x-circle-fill me-1" />
                          Chưa nộp (Quá hạn)
                        </span>
                      ) : (
                        <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1 rounded-2 fw-semibold">
                          <i className="bi bi-clock-fill me-1" />
                          Chờ nộp
                        </span>
                      )}
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                        onClick={() => setSelectedStudent(stu)}
                      >
                        <i className="bi bi-eye" /> Chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-4 text-muted">
                  <i className="bi bi-inbox fs-3 d-block mb-1" />
                  Không tìm thấy học sinh nào phù hợp trong lớp này.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal chi tiết học viên */}
      {selectedStudent && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <i className="bi bi-person-badge text-primary" />
                  Chi Tiết Tiến Độ - {selectedStudent.fullName}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedStudent(null)}
                />
              </div>
              <div className="modal-body">
                <div className="d-flex align-items-center gap-3 mb-3 p-3 bg-light rounded-3">
                  <div className="ta-avatar-initials avatar-initials-md avatar-initials-indigo">
                    {selectedStudent.avatarInitials}
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold">{selectedStudent.fullName}</h6>
                    <small className="text-muted d-block">Mã số: {selectedStudent.studentCode}</small>
                    {selectedStudent.email && (
                      <small className="text-muted d-block">Email: {selectedStudent.email}</small>
                    )}
                    {selectedStudent.phone && (
                      <small className="text-muted d-block">SĐT: {selectedStudent.phone}</small>
                    )}
                  </div>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-4">
                    <div className="p-2 border rounded-2 text-center bg-white">
                      <small className="text-muted d-block">Chuyên cần</small>
                      <strong className="text-success fs-5">{selectedStudent.attendancePercentage}%</strong>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-2 border rounded-2 text-center bg-white">
                      <small className="text-muted d-block">Có mặt</small>
                      <strong className="text-dark fs-5">{selectedStudent.presentDays}/{selectedStudent.totalDays}</strong>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-2 border rounded-2 text-center bg-white">
                      <small className="text-muted d-block">Vắng / Trễ</small>
                      <strong className="text-danger fs-5">{selectedStudent.absentDays + selectedStudent.lateDays}</strong>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted mb-1">Bài tập mới nhất:</label>
                  <div className="p-2 bg-light rounded-2 border">
                    <span className="fw-semibold d-block">{selectedStudent.latestAssignmentTitle}</span>
                    <div className="d-flex align-items-center justify-content-between mt-1">
                      <span className="small text-muted">Trạng thái: <strong>{selectedStudent.latestAssignmentStatus}</strong></span>
                      {selectedStudent.latestAssignmentScore != null && (
                        <span className="badge bg-primary">
                          Điểm: {selectedStudent.latestAssignmentScore}/{selectedStudent.maxScore ?? 10}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {selectedStudent.latestNote && (
                  <div>
                    <label className="form-label small fw-bold text-muted mb-1">Ghi chú & Nhận xét:</label>
                    <div className="p-2 bg-light rounded-2 border text-secondary small fst-italic">
                      "{selectedStudent.latestNote}"
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
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
