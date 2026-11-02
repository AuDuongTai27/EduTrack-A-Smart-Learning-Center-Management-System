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

  // Dữ liệu hiển thị ưu tiên từ progressStudents
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
          latestNote: "Học tập tốt, trợ giảng đã hỗ trợ làm bài.",
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
        <div>
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
                  <input className="form-check-input" type="checkbox" id="selectAllProgress" />
                </div>
              </th>
              <th>Avatar</th>
              <th>Học Viên <i className="bi bi-arrow-down-up table-sort-icon small text-muted" /></th>
              <th>Mã Học Viên</th>
              <th>Chuyên Cần &amp; Điểm Danh</th>
              <th>Tình Trạng Bài Tập</th>
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
                      <div className={`ta-avatar-initials avatar-initials-sm ${getAvatarClass(idx)}`}>
                        {stu.avatarInitials || getInitials(stu.fullName)}
                      </div>
                    </td>
                    <td className="fw-semibold text-dark">{stu.fullName}</td>
                    <td>
                      <span className="text-muted small">#{stu.studentCode}</span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-bold text-dark">{stu.presentDays}/{stu.totalDays}</span>
                        {pct >= 80 ? (
                          <span className="badge-status badge-status-active">Có mặt ({pct}%)</span>
                        ) : pct >= 60 ? (
                          <span className="badge-status badge-status-pending">Đi trễ ({pct}%)</span>
                        ) : (
                          <span className="badge-status badge-status-inactive">Vắng ({pct}%)</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {stu.latestAssignmentStatus === "Submitted" ? (
                          <span className="badge bg-success-subtle text-success fw-medium px-2 py-1">Đã nộp</span>
                        ) : stu.latestAssignmentStatus === "Graded" ? (
                          <span className="badge bg-info-subtle text-info fw-medium px-2 py-1">Đã chấm ({stu.latestAssignmentScore}đ)</span>
                        ) : stu.latestAssignmentStatus === "Late" ? (
                          <span className="badge bg-warning-subtle text-warning fw-medium px-2 py-1">Nộp trễ</span>
                        ) : stu.latestAssignmentStatus === "Missing" ? (
                          <span className="badge bg-danger-subtle text-danger fw-medium px-2 py-1">Chưa nộp</span>
                        ) : (
                          <span className="badge bg-secondary-subtle text-secondary fw-medium px-2 py-1">Chờ nộp</span>
                        )}
                        <small className="text-muted d-none d-md-inline">({stu.latestAssignmentTitle})</small>
                      </div>
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
                <td colSpan={7} className="text-center py-4 text-muted">
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
                  Tiến Độ Học Tập - {selectedStudent.fullName}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedStudent(null)}
                />
              </div>
              <div className="modal-body">
                <div className="d-flex align-items-center gap-3 mb-3 p-3 bg-light rounded-3">
                  <div className="ta-avatar-initials avatar-initials-md avatar-initials-emerald">
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
                  <label className="form-label small fw-bold text-muted mb-1">Bài tập gần nhất:</label>
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
                    <label className="form-label small fw-bold text-muted mb-1">Ghi chú trợ giảng:</label>
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
