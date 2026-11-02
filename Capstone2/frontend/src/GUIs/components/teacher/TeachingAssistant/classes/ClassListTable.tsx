import React from "react";
import { Link } from "react-router-dom";
import type { ClassDto } from "../../../../../BLL/models/ClassDto";
import type { TeachingClassItemDto } from "../../../../../BLL/models/TeachingClassItemDto";

export interface ClassListTableProps {
  classes?: (ClassDto | TeachingClassItemDto)[];
}

const DEFAULT_CLASSES: TeachingClassItemDto[] = [
  {
    classId: 1,
    className: "Class 9 - Advanced Mathematics",
    subjectId: 1,
    subjectName: "Mathematics",
    subjectCode: "MATH",
    room: "Room 201",
    tuitionFee: 3500000,
    startDate: "2026-09-01",
    status: "active",
    studentCount: 3,
    teacherName: "ThS. Hoàng Quốc Việt",
    taName: "Âu Dương Tài",
    partnerName: "ThS. Hoàng Quốc Việt",
    scheduleSummary: "Thứ Hai, Thứ Tư (18:00 - 20:00)",
  },
  {
    classId: 2,
    className: "Class 9 - Intensive Physics",
    subjectId: 2,
    subjectName: "Physics",
    subjectCode: "PHYS",
    room: "Room 202",
    tuitionFee: 3200000,
    startDate: "2026-09-01",
    status: "active",
    studentCount: 2,
    teacherName: "ThS. Huỳnh Khánh Duy",
    taName: "Âu Dương Tài",
    partnerName: "ThS. Huỳnh Khánh Duy",
    scheduleSummary: "Thứ Ba, Thứ Năm (18:00 - 20:00)",
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
            <th>Giáo Viên Phụ Trách</th>
            <th>Trạng Thái</th>
            <th className="text-end">Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          {displayClasses.map((cls) => {
            const item = cls as any;
            const isActive = cls.status?.toLowerCase() === "active" || cls.status === "Đang học" || cls.status === "open";
            const teacherName = item.teacherName || item.partnerName || "ThS. Hoàng Quốc Việt";
            const teacherInitials = teacherName
              .split(" ")
              .map((w: string) => w[0])
              .join("")
              .toUpperCase()
              .slice(-2) || "GV";

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
                    {cls.room || "Phòng P.201"}
                  </span>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="rounded-circle bg-light text-primary fw-bold d-flex align-items-center justify-content-center"
                      style={{ width: "28px", height: "28px", fontSize: "12px", border: "1px solid #dee2e6" }}
                    >
                      {teacherInitials}
                    </div>
                    <span className="small">{teacherName}</span>
                  </div>
                </td>
                <td>
                  <span className={`badge-status ${isActive ? "badge-status-active" : "badge-status-inactive"}`}>
                    {isActive ? "Đang hỗ trợ" : "Đã kết thúc"}
                  </span>
                </td>
                <td className="text-end">
                  <Link
                    to={`/teaching-assistant/classes/${cls.classId}`}
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
