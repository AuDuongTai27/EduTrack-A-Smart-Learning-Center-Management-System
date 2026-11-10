import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import type { AssignmentDto } from "../../../../../BLL/models/AssignmentDto";
import type { TeachingAssignmentItemDto } from "../../../../../BLL/models/teaching/TeachingAssignmentDto";
import { MATERIALS_DATA } from "../../../student/classDetail/classDetailData";

export interface AssignmentsSectionProps {
  classId?: string | number;
  assignments?: (AssignmentDto | TeachingAssignmentItemDto | any)[];
}

interface WeekMaterialItem {
  id: number;
  weekNumber: number;
  fileName: string;
  description: string;
  type: string;
  uploadDate: string;
  sizeMb: number;
  fileUrl?: string;
}

interface WeekUnit {
  weekNumber: number;
  title: string;
  description: string;
  materials: WeekMaterialItem[];
  assignments: (AssignmentDto | TeachingAssignmentItemDto | any)[];
}

export default function AssignmentsSection({ classId = "1", assignments = [] }: AssignmentsSectionProps) {
  const numClassId = Number(classId);

  // Expanded weeks state (Default Week 1 and 4 open)
  const [openWeeks, setOpenWeeks] = useState<Set<number>>(new Set([1, 4]));

  // Materials state initialized from existing class materials or defaults
  const [materials] = useState<WeekMaterialItem[]>(() => {
    const classMats = MATERIALS_DATA.filter((m) => m.classId === numClassId);
    if (classMats.length > 0) {
      return classMats.map((m, idx) => ({
        id: m.id,
        weekNumber: (idx % 4) + 1,
        fileName: m.fileName,
        description: m.description,
        type: m.type,
        uploadDate: m.uploadDate,
        sizeMb: m.sizeMb,
        fileUrl: "/assets/docs/assignment_default.pdf",
      }));
    }
    return [
      {
        id: 101,
        weekNumber: 1,
        fileName: "Chapter 1: Quadratic Equations & Systems.pdf",
        description: "Fundamental concepts of quadratic forms and discriminant analysis",
        type: "PDF",
        uploadDate: "01/09/2026",
        sizeMb: 2.4,
        fileUrl: "/assets/docs/assignment_default.pdf",
      },
      {
        id: 102,
        weekNumber: 1,
        fileName: "Lesson 1.1: Solving Quadratic Equations.docx",
        description: "Factoring methods and standard quadratic formula application",
        type: "DOC",
        uploadDate: "05/09/2026",
        sizeMb: 1.1,
        fileUrl: "/assets/docs/assignment_default.pdf",
      },
      {
        id: 103,
        weekNumber: 2,
        fileName: "Lesson 1.2: Vieta Formulas and Applications.pdf",
        description: "Relationships between roots and polynomial coefficients",
        type: "PDF",
        uploadDate: "10/09/2026",
        sizeMb: 3.6,
        fileUrl: "/assets/docs/assignment_default.pdf",
      },
      {
        id: 104,
        weekNumber: 4,
        fileName: "EIKARY - Cây k phân & Định lý Viète.pdf",
        description: "Tài liệu chuyên đề giải bài toán đa thức và cây phân cấp k-phân",
        type: "PDF",
        uploadDate: "20/09/2026",
        sizeMb: 1.8,
        fileUrl: "/assets/docs/assignment_default.pdf",
      },
    ];
  });

  // Organize into Weeks (Content Units)
  const weeks: WeekUnit[] = useMemo(() => {
    const weekDefs = [
      {
        weekNumber: 1,
        title: "Introduction to Quadratic Equations & Systems",
        description: "Nền tảng phương trình bậc hai và phương pháp phân tích nghiệm",
      },
      {
        weekNumber: 2,
        title: "Connectivity & Vieta Theorem Applications",
        description: "Định lý Viète, biểu thức đối xứng giữa các nghiệm của phương trình",
      },
      {
        weekNumber: 3,
        title: "Advanced Systems of Equations",
        description: "Hệ phương trình bậc cao và các phương pháp giải nâng cao",
      },
      {
        weekNumber: 4,
        title: "Plane Trigonometry & Midterm Review",
        description: "Hệ thức lượng giác, ôn tập tổng hợp và bài tập đánh giá",
      },
    ];

    const getAssignmentWeek = (a: any): number => {
      if (a.contentUnitId) {
        if (a.contentUnitId === 1 || a.contentUnitId === 2) return 1;
        if (a.contentUnitId === 3) return 2;
        if (a.contentUnitId === 4) return 3;
        if (a.contentUnitId === 5) return 4;
      }
      const t = (a.title || "").toLowerCase();
      if (t.includes("tuần 4") || t.includes("week 4") || t.includes("midterm") || t.includes("test")) return 4;
      if (t.includes("tuần 3") || t.includes("week 3") || t.includes("hw03") || t.includes("hw02") || t.includes("homework 02") || t.includes("quiz 02")) return 3;
      if (t.includes("tuần 2") || t.includes("week 2") || t.includes("hw01b") || t.includes("quiz 01")) return 2;
      if (t.includes("tuần 1") || t.includes("week 1") || t.includes("hw01") || t.includes("homework 01")) return 1;

      return 1;
    };

    return weekDefs.map((def) => {
      const weekMats = materials.filter((m) => m.weekNumber === def.weekNumber);

      const weekAsgs = assignments
        .filter((a: any) => getAssignmentWeek(a) === def.weekNumber)
        .sort((a: any, b: any) => (a.assignmentId || 0) - (b.assignmentId || 0));

      return {
        ...def,
        materials: weekMats,
        assignments: weekAsgs,
      };
    });
  }, [assignments, materials]);

  const toggleWeek = (weekNum: number) => {
    setOpenWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekNum)) {
        next.delete(weekNum);
      } else {
        next.add(weekNum);
      }
      return next;
    });
  };

  const handleOpenAll = () => {
    setOpenWeeks(new Set(weeks.map((w) => w.weekNumber)));
  };

  const handleCloseAll = () => {
    setOpenWeeks(new Set());
  };

  const totalMaterials = weeks.reduce((sum, w) => sum + w.materials.length, 0);
  const totalAssignments = assignments.length;

  return (
    <div className="card class-list-card border-0 mb-4 shadow-sm">
      {/* 1. Master Section Header */}
      <div className="class-list-header d-flex align-items-center justify-content-between py-3 px-4 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-collection-play-fill text-primary fs-5" />
          <div>
            <h4 className="class-list-title mb-0">Nội Dung Khóa Học &amp; Ca Trực Theo Tuần</h4>
            <span className="text-muted small">
              Theo dõi tài liệu bài giảng và hỗ trợ chấm chữa bài tập theo tuần (Content Units)
            </span>
          </div>
        </div>
      </div>

      {/* 2. Global Open all / Close all Controls Bar */}
      <div className="px-4 py-2 bg-light-subtle border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn btn-link text-decoration-none p-0 text-dark fw-semibold d-inline-flex align-items-center gap-1"
            style={{ fontSize: "13.5px" }}
            onClick={handleOpenAll}
          >
            <i className="bi bi-caret-right-fill text-secondary" style={{ fontSize: "12px" }}></i>
            <span>Open all</span>
          </button>
          <span className="text-muted">|</span>
          <button
            type="button"
            className="btn btn-link text-decoration-none p-0 text-dark fw-semibold d-inline-flex align-items-center gap-1"
            style={{ fontSize: "13.5px" }}
            onClick={handleCloseAll}
          >
            <i className="bi bi-caret-down-fill text-secondary" style={{ fontSize: "12px" }}></i>
            <span>Close all</span>
          </button>
        </div>

        <div className="d-flex align-items-center gap-2 text-muted small">
          <span>
            Tổng cộng: <strong>{totalMaterials}</strong> tài liệu &middot; <strong>{totalAssignments}</strong> bài tập
          </span>
        </div>
      </div>

      {/* 3. Weekly Syllabus Accordion List */}
      <div className="p-4 bg-light-subtle d-flex flex-column gap-3">
        {weeks.map((week) => {
          const isOpen = openWeeks.has(week.weekNumber);

          return (
            <div
              key={week.weekNumber}
              className="border rounded-3 bg-white shadow-xs overflow-hidden"
              style={{ borderColor: "#E2E8F0" }}
            >
              {/* Week Accordion Header */}
              <div
                className="d-flex align-items-center justify-content-between p-3 bg-white cursor-pointer select-none"
                onClick={() => toggleWeek(week.weekNumber)}
                style={{ cursor: "pointer", transition: "background-color 0.15s ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F8FAFC")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FFFFFF")}
              >
                <div className="d-flex align-items-center min-w-0 me-2">
                  <span className="me-2 text-secondary d-flex align-items-center">
                    {isOpen ? (
                      <i className="bi bi-caret-down-fill" style={{ fontSize: "13px" }} />
                    ) : (
                      <i className="bi bi-caret-right-fill" style={{ fontSize: "13px" }} />
                    )}
                  </span>
                  <span className="fw-bold text-dark text-break" style={{ fontSize: "15.5px" }}>
                    Week {week.weekNumber}. {week.title}
                  </span>
                </div>

                <div className="d-flex align-items-center gap-2 flex-shrink-0">
                  <span className="badge bg-light text-secondary border px-2 py-1 small">
                    <i className="bi bi-file-earmark-text me-1 text-danger" />
                    {week.materials.length} tài liệu
                  </span>
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 small">
                    <i className="bi bi-journal-check me-1" />
                    {week.assignments.length} bài tập
                  </span>
                </div>
              </div>

              {/* Week Body (Content when Open) */}
              {isOpen && (
                <div className="border-top p-3 bg-white">
                  {/* Part A: Study Materials */}
                  <div className="mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-2 pb-1 border-bottom">
                      <span className="text-muted fw-bold text-uppercase small d-flex align-items-center gap-2">
                        <i className="bi bi-folder2-open text-primary" /> Tài liệu &amp; Bài giảng trong tuần
                      </span>
                    </div>

                    {week.materials.length > 0 ? (
                      <div className="d-flex flex-column gap-2">
                        {week.materials.map((mat) => (
                          <div
                            key={mat.id}
                            className="d-flex align-items-center justify-content-between p-2 px-3 rounded-2 border bg-light-subtle"
                            style={{ borderColor: "#F1F5F9" }}
                          >
                            <div className="d-flex align-items-center gap-3 min-w-0">
                              {/* Magenta/Pink document icon box matching the user's uploaded prototype */}
                              <div
                                className="flex-shrink-0 d-flex align-items-center justify-content-center rounded-2"
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  backgroundColor: "#FDF2F8",
                                  color: "#E11D48",
                                }}
                              >
                                <i className="bi bi-file-earmark-richtext-fill fs-5" />
                              </div>
                              <div className="min-w-0">
                                <div className="d-flex align-items-center gap-2 flex-wrap">
                                  <span className="fw-semibold text-dark text-break small">{mat.fileName}</span>
                                  <span className="badge bg-secondary-subtle text-secondary small py-1">
                                    {mat.type}
                                  </span>
                                </div>
                                {mat.description && (
                                  <p className="text-muted small mb-0 mt-1 text-truncate" style={{ maxWidth: "580px" }}>
                                    {mat.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="d-flex align-items-center gap-3 flex-shrink-0 ms-2">
                              <span className="text-muted small d-none d-md-inline">
                                {mat.uploadDate} &middot; {mat.sizeMb} MB
                              </span>
                              <a
                                href={mat.fileUrl || "#"}
                                onClick={(e) => {
                                  if (!mat.fileUrl) {
                                    e.preventDefault();
                                    alert(`Đang tải xuống tài liệu: ${mat.fileName}`);
                                  }
                                }}
                                className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center justify-content-center"
                                style={{ height: "32px", width: "32px", padding: 0 }}
                                title="Tải xuống tài liệu"
                              >
                                <i className="bi bi-download" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 text-center text-muted small bg-light-subtle rounded-2 border border-dashed">
                        Chưa có tài liệu đính kèm cho tuần này.
                      </div>
                    )}
                  </div>

                  {/* Part B: Assignments Table for this week */}
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-2 pb-1 border-bottom">
                      <span className="text-muted fw-bold text-uppercase small d-flex align-items-center gap-2">
                        <i className="bi bi-journal-text text-primary" /> Bài tập &amp; Đề kiểm tra
                      </span>
                    </div>

                    {week.assignments.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table custom-table align-middle mb-0">
                          <thead>
                            <tr>
                              <th style={{ width: "32%" }}>Tiêu đề bài tập</th>
                              <th style={{ width: "13%" }}>Ngày giao</th>
                              <th style={{ width: "20%" }}>Hạn nộp</th>
                              <th style={{ width: "20%" }}>Nộp bài &amp; Chấm điểm</th>
                              <th style={{ width: "10%" }}>Điểm tối đa</th>
                              <th className="text-end" style={{ width: "5%" }}>Thao tác</th>
                            </tr>
                          </thead>
                          <tbody>
                            {week.assignments.map((asg: any, idx: number) => {
                              const isOverdue = asg.dueDate ? new Date(asg.dueDate) < new Date() : false;
                              const submissionCount = asg.submissionCount ?? 0;
                              const gradedCount = asg.gradedCount ?? 0;

                              // Đánh giá trạng thái chấm bài
                              const isGradedDone = submissionCount > 0 && gradedCount === submissionCount;
                              const isPendingGrading = isOverdue && !isGradedDone;
                              const isOverdueCompleted = isOverdue && isGradedDone;

                              // Màu nền hàng (tr):
                              // - Hết hạn và chưa chấm xong: màu vàng nhạt (#fff9db)
                              // - Hết hạn và chấm xong: màu xám nhạt #e9ecef
                              const rowBg = isPendingGrading
                                ? "#fff9db"
                                : isOverdueCompleted
                                ? "#e9ecef"
                                : undefined;

                              return (
                                <tr
                                  key={asg.assignmentId || idx}
                                  style={rowBg ? { backgroundColor: rowBg } : undefined}
                                >
                                  <td
                                    className="fw-semibold text-dark"
                                    style={{
                                      backgroundColor: rowBg ? "inherit" : undefined,
                                      maxWidth: "280px",
                                    }}
                                  >
                                    <div className="d-flex align-items-center">
                                      <i className="bi bi-file-earmark-text me-1.5 text-primary flex-shrink-0" />
                                      <Link
                                        to={`/teaching-assistant/classes/${classId}/assignment/${asg.assignmentId}`}
                                        className="text-decoration-none text-dark text-truncate d-inline-block"
                                        title={asg.title}
                                      >
                                        {asg.title}
                                      </Link>
                                    </div>
                                    {asg.assignmentType && (
                                      <span className="d-block text-muted small fw-normal text-truncate">
                                        {asg.assignmentType}
                                      </span>
                                    )}
                                  </td>
                                  <td style={rowBg ? { backgroundColor: "inherit" } : undefined}>
                                    {asg.createdAt || "08/09/2026"}
                                  </td>
                                  <td style={rowBg ? { backgroundColor: "inherit" } : undefined}>
                                    <div className="d-inline-flex align-items-center gap-2 flex-wrap">
                                      <span>
                                        {asg.dueDateFormatted ||
                                          (asg.dueDate
                                            ? new Date(asg.dueDate).toLocaleDateString("vi-VN")
                                            : "Không có hạn")}
                                      </span>
                                      <span
                                        className={`badge ${
                                          isOverdue ? "bg-danger-subtle text-danger" : "bg-success-subtle text-success"
                                        } fw-normal`}
                                      >
                                        {isOverdue ? "Quá hạn" : "Đang mở"}
                                      </span>
                                    </div>
                                  </td>
                                  <td style={rowBg ? { backgroundColor: "inherit" } : undefined}>
                                    {submissionCount > 0 ? (
                                      isPendingGrading ? (
                                        <span
                                          className="badge fw-medium px-2 py-1 border shadow-xs"
                                          style={{
                                            backgroundColor: "#ffffff",
                                            color: "#000000",
                                            borderColor: "#dee2e6",
                                          }}
                                        >
                                          Chờ chấm ({gradedCount}/{submissionCount})
                                        </span>
                                      ) : (
                                        <span
                                          className={`badge ${
                                            isGradedDone
                                              ? "bg-success-subtle text-success"
                                              : "bg-warning-subtle text-warning"
                                          } fw-medium px-2 py-1`}
                                        >
                                          {isGradedDone ? "Đã chấm" : "Chờ chấm"} ({gradedCount}/{submissionCount})
                                        </span>
                                      )
                                    ) : (
                                      <span className="badge bg-secondary-subtle text-secondary fw-normal">
                                        Chưa có bài nộp
                                      </span>
                                    )}
                                  </td>
                                  <td style={rowBg ? { backgroundColor: "inherit" } : undefined}>
                                    <span className="fw-bold text-dark">{asg.maxScore ?? "10.0"}</span>{" "}
                                    <small className="text-muted">điểm</small>
                                  </td>
                                  <td
                                    className="text-end"
                                    style={rowBg ? { backgroundColor: "inherit" } : undefined}
                                  >
                                    <div className="d-inline-flex align-items-center justify-content-end">
                                      <Link
                                        to={`/teaching-assistant/classes/${classId}/assignment/${asg.assignmentId}`}
                                        className="btn btn-sm btn-outline-primary d-inline-flex align-items-center justify-content-center"
                                        style={{ height: "32px", width: "32px", padding: 0 }}
                                        title="Hỗ trợ chấm"
                                      >
                                        <i className="bi bi-eye" />
                                      </Link>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-3 text-center text-muted small bg-light-subtle rounded-2 border border-dashed">
                        Chưa có bài tập nào được giao cho tuần này.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
