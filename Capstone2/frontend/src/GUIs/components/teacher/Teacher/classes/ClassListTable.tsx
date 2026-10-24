import React from "react";
import { Link } from "react-router-dom";
import type { ClassDto } from "../../../../../BLL/models/ClassDto";

export interface ClassListTableProps {
  classes?: ClassDto[];
}

const DEFAULT_CLASSES: ClassDto[] = [
  {
    classId: 1,
    className: "Toán 12 Chuyên Sâu – Luyện Thi ĐH",
    subjectId: 1,
    subjectName: "Toán học",
    subjectCode: "MATH",
    room: "Phòng 301",
    tuitionFee: 3500000,
    startDate: "2026-09-01",
    status: "active",
  },
  {
    classId: 2,
    className: "Vật Lý 12 Nâng Cao",
    subjectId: 2,
    subjectName: "Vật lý",
    subjectCode: "PHYS",
    room: "Phòng 202",
    tuitionFee: 3200000,
    startDate: "2026-09-01",
    status: "active",
  },
  {
    classId: 3,
    className: "Toán 11 Cơ Bản & Ôn Tập",
    subjectId: 1,
    subjectName: "Toán học",
    subjectCode: "MATH",
    room: "Phòng 104",
    tuitionFee: 2800000,
    startDate: "2026-09-01",
    status: "active",
  },
];

export function ClassListTable({ classes }: ClassListTableProps) {
  const displayClasses = classes && classes.length > 0 ? classes : DEFAULT_CLASSES;

  return (
    <div className="table-responsive-container">
      <table className="table custom-table align-middle mb-0" id="classesTable">
        <thead>
          <tr>
            <th className="th-checkbox">
              <div className="form-check m-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="selectAllClasses"
                />
              </div>
            </th>
            <th>Mã &amp; Tên Lớp Học <i className="bi bi-arrow-down-up table-sort-icon" /></th>
            <th>Môn Học <i className="bi bi-arrow-down-up table-sort-icon" /></th>
            <th>Phòng Học <i className="bi bi-arrow-down-up table-sort-icon" /></th>
            <th>Trợ Giảng (TA)</th>
            <th>Trạng Thái</th>
            <th className="text-end">Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          {displayClasses.map((cls) => {
            const isActive = cls.status?.toLowerCase() === "active" || cls.status === "Đang học";
            return (
              <tr key={cls.classId}>
                <td>
                  <div className="form-check m-0">
                    <input
                      className="form-check-input row-checkbox"
                      type="checkbox"
                    />
                  </div>
                </td>
                <td>
                  <div className="fw-bold text-dark">{cls.className}</div>
                  <small className="text-muted">Mã lớp: #{cls.classId}</small>
                </td>
                <td>
                  <span className="badge bg-primary bg-opacity-10 text-primary px-2.5 py-1 rounded-pill">
                    {cls.subjectName || "Môn học"}
                  </span>
                </td>
                <td>
                  <span className="text-secondary small">
                    <i className="bi bi-geo-alt me-1 text-muted" />
                    {cls.room || "Phòng P.301"}
                  </span>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="rounded-circle bg-light text-primary fw-bold d-flex align-items-center justify-content-center"
                      style={{ width: "28px", height: "28px", fontSize: "12px", border: "1px solid #dee2e6" }}
                    >
                      TA
                    </div>
                    <span className="small">Phạm Đức Minh</span>
                  </div>
                </td>
                <td>
                  <span className={`badge-status ${isActive ? "badge-status-active" : "badge-status-inactive"}`}>
                    {isActive ? "Đang dạy" : "Đã kết thúc"}
                  </span>
                </td>
                <td className="text-end">
                  <Link
                    to={`/teacher/classes/${cls.classId}`}
                    className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                  >
                    <i className="bi bi-eye" /> Chi tiết
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ClassListTable;
