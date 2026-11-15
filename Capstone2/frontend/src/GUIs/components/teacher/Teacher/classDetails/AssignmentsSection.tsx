import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import type { AssignmentDto } from "../../../../../BLL/models/AssignmentDto";
import type { TeachingAssignmentItemDto } from "../../../../../BLL/models/teaching/TeachingAssignmentDto";
import teachingDAL from "../../../../../DAL/teachingDAL";
import { MATERIALS_DATA, type MaterialItem } from "../../../student/classDetail/classDetailData";

export interface AssignmentsSectionProps {
  classId?: string | number;
  assignments?: (AssignmentDto | TeachingAssignmentItemDto | any)[];
  onAssignmentDeleted?: (deletedId: number) => void;
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

export default function AssignmentsSection({
  classId = "1",
  assignments = [],
  onAssignmentDeleted,
}: AssignmentsSectionProps) {
  const numClassId = Number(classId);

  // Expanded weeks state (Default Week 1 open, matching LMS prototype)
  const [openWeeks, setOpenWeeks] = useState<Set<number>>(new Set([1, 4]));
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Material upload modal states
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [targetWeek, setTargetWeek] = useState<number>(1);
  const [newMaterialTitle, setNewMaterialTitle] = useState<string>("");
  const [newMaterialDesc, setNewMaterialDesc] = useState<string>("");
  const [newMaterialType, setNewMaterialType] = useState<string>("PDF");

  // Materials state initialized from existing class materials or defaults
  const [materials, setMaterials] = useState<WeekMaterialItem[]>(() => {
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
        fileName: "EIKARY - K-ary Tree & Vieta Theorem.pdf",
        description: "Specialized material on polynomial problems and k-ary hierarchical trees",
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
        description: "Foundations of quadratic equations and root analysis methods",
      },
      {
        weekNumber: 2,
        title: "Connectivity & Vieta Theorem Applications",
        description: "Vieta's theorem, symmetric expressions among roots of equations",
      },
      {
        weekNumber: 3,
        title: "Advanced Systems of Equations",
        description: "Advanced systems of equations and advanced solution methods",
      },
      {
        weekNumber: 4,
        title: "Plane Trigonometry & Midterm Review",
        description: "Trigonometric identities, comprehensive review, and assessment exercises",
      },
    ];

    const getAssignmentWeek = (a: any): number => {
      if (a.contentUnitId) {
        // contentUnitId 1 & 2 -> Week 1; 3 -> Week 2; 4 -> Week 3; 5 -> Week 4
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

      // Bài tập mới tạo hoặc không chứa từ khóa đặc biệt sẽ mặc định ở Tuần 1
      return 1;
    };

    return weekDefs.map((def) => {
      // Find materials for this week
      const weekMats = materials.filter((m) => m.weekNumber === def.weekNumber);

      // Find assignments for this week (đảm bảo mỗi bài tập chỉ thuộc duy nhất 1 tuần, không nhân bản)
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

  const handleDelete = async (asgId: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete assignment "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(asgId);
      await teachingDAL.deleteAssignment(asgId);
      if (onAssignmentDeleted) {
        onAssignmentDeleted(asgId);
      }
    } catch (err: any) {
      alert(err?.message || "Error deleting assignment.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterialTitle.trim()) {
      alert("Please enter the material title.");
      return;
    }
    const newMat: WeekMaterialItem = {
      id: Date.now(),
      weekNumber: targetWeek,
      fileName: newMaterialTitle.trim(),
      description: newMaterialDesc.trim() || `Lecture material for Week ${targetWeek}`,
      type: newMaterialType,
      uploadDate: new Date().toLocaleDateString("en-US"),
      sizeMb: 1.5,
      fileUrl: "/assets/docs/assignment_default.pdf",
    };
    setMaterials((prev) => [...prev, newMat]);
    setNewMaterialTitle("");
    setNewMaterialDesc("");
    setShowUploadModal(false);
    // Auto open the target week
    setOpenWeeks((prev) => new Set([...prev, targetWeek]));
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
            <h4 className="class-list-title mb-0">Course Content &amp; Weekly Assignments</h4>
            <span className="text-muted small">
              Manage lecture materials, learning resources, and assignments by week (Content Units)
            </span>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-outline-primary btn-sm d-inline-flex align-items-center justify-content-center gap-1.5 shadow-sm"
            style={{ height: "36px", fontSize: "13.5px", fontWeight: 500, padding: "0 14px", lineHeight: 1 }}
            onClick={() => setShowUploadModal(true)}
          >
            <i className="bi bi-cloud-upload" /> Add Material
          </button>
          <Link
            to={`/teacher/classes/${classId}/assignment/new-assignment`}
            className="btn btn-primary btn-sm d-inline-flex align-items-center justify-content-center gap-1.5 shadow-sm text-decoration-none"
            style={{ height: "36px", fontSize: "13.5px", fontWeight: 500, padding: "0 14px", lineHeight: 1 }}
          >
            <i className="bi bi-plus-lg" /> Add New Assignment
          </Link>
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
            Total: <strong>{totalMaterials}</strong> materials &middot; <strong>{totalAssignments}</strong> assignments
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
                    {week.materials.length} materials
                  </span>
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 small">
                    <i className="bi bi-journal-check me-1" />
                    {week.assignments.length} assignments
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
                        <i className="bi bi-folder2-open text-primary" /> Weekly Lecture Materials &amp; Resources
                      </span>
                      <button
                        type="button"
                        className="btn btn-link btn-sm text-decoration-none p-0 text-primary small d-inline-flex align-items-center gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTargetWeek(week.weekNumber);
                          setShowUploadModal(true);
                        }}
                      >
                        <i className="bi bi-plus-circle" /> Add File
                      </button>
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
                              {/* Magenta/Pink document icon box like the user's uploaded prototype */}
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
                                    alert(`Downloading document: ${mat.fileName}`);
                                  }
                                }}
                                className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center justify-content-center"
                                style={{ height: "32px", width: "32px", padding: 0 }}
                                title="Download material"
                              >
                                <i className="bi bi-download" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 text-center text-muted small bg-light-subtle rounded-2 border border-dashed">
                        No materials attached for this week. Click <strong>"Add File"</strong> to attach lecture materials.
                      </div>
                    )}
                  </div>

                  {/* Part B: Assignments Table for this week */}
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-2 pb-1 border-bottom">
                      <span className="text-muted fw-bold text-uppercase small d-flex align-items-center gap-2">
                        <i className="bi bi-journal-text text-primary" /> Assignments &amp; Tests
                      </span>
                      <Link
                        to={`/teacher/classes/${classId}/assignment/new-assignment`}
                        className="btn btn-link btn-sm text-decoration-none p-0 text-primary small d-inline-flex align-items-center gap-1"
                      >
                        <i className="bi bi-plus-circle" /> Add Assignment
                      </Link>
                    </div>

                    {week.assignments.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table custom-table align-middle mb-0">
                          <thead>
                            <tr>
                              <th style={{ width: "32%" }}>Assignment Title</th>
                              <th style={{ width: "13%" }}>Assigned Date</th>
                              <th style={{ width: "20%" }}>Deadline</th>
                              <th style={{ width: "20%" }}>Submissions &amp; Grading</th>
                              <th style={{ width: "10%" }}>Max Score</th>
                              <th className="text-end" style={{ width: "5%" }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {week.assignments.map((asg: any, idx: number) => {
                              const isOverdue = asg.dueDate ? new Date(asg.dueDate) < new Date() : false;
                              const submissionCount = asg.submissionCount ?? 0;
                              const gradedCount = asg.gradedCount ?? 0;
                              const asgId = asg.assignmentId || idx;

                              // Đánh giá trạng thái chấm bài
                              const isGradedDone = submissionCount > 0 && gradedCount === submissionCount;
                              const isPendingGrading = isOverdue && !isGradedDone;
                              const isOverdueCompleted = isOverdue && isGradedDone;

                              // Màu nền hàng (tr):
                              // - Hết hạn và chưa chấm xong: màu vàng nhạt (#fffbeb / #fef9c3 / #fff9db)
                              // - Hết hạn và chấm xong: màu xám nhạt #e9ecef
                              const rowBg = isPendingGrading
                                ? "#fff9db"
                                : isOverdueCompleted
                                ? "#e9ecef"
                                : undefined;

                              return (
                                <tr
                                  key={asgId}
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
                                        to={`/teacher/classes/${classId}/assignment/${asg.assignmentId}`}
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
                                            ? new Date(asg.dueDate).toLocaleDateString("en-US")
                                            : "No deadline")}
                                      </span>
                                      <span
                                        className={`badge ${
                                          isOverdue ? "bg-danger-subtle text-danger" : "bg-success-subtle text-success"
                                        } fw-normal`}
                                      >
                                        {isOverdue ? "Overdue" : "Open"}
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
                                          Pending grading ({gradedCount}/{submissionCount})
                                        </span>
                                      ) : (
                                        <span
                                          className={`badge ${
                                            isGradedDone
                                              ? "bg-success-subtle text-success"
                                              : "bg-warning-subtle text-warning"
                                          } fw-medium px-2 py-1`}
                                        >
                                          {isGradedDone ? "Graded" : "Pending grading"} ({gradedCount}/{submissionCount})
                                        </span>
                                      )
                                    ) : (
                                      <span className="badge bg-secondary-subtle text-secondary fw-normal">
                                        No submissions
                                      </span>
                                    )}
                                  </td>
                                  <td style={rowBg ? { backgroundColor: "inherit" } : undefined}>
                                    <span className="fw-bold text-dark">{asg.maxScore ?? "10.0"}</span>{" "}
                                    <small className="text-muted">pts</small>
                                  </td>
                                  <td
                                    className="text-end"
                                    style={rowBg ? { backgroundColor: "inherit" } : undefined}
                                  >
                                    <div className="d-inline-flex align-items-center justify-content-end">
                                      <Link
                                        to={`/teacher/classes/${classId}/assignment/${asg.assignmentId}`}
                                        className="btn btn-sm btn-outline-primary d-inline-flex align-items-center justify-content-center"
                                        style={{ height: "32px", width: "32px", padding: 0 }}
                                        title="Grade"
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
                        No assignments assigned for this week yet. Click <strong>"Add Assignment"</strong> to create a new assignment.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. Modal: Upload Material to Week */}
      {showUploadModal && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(15, 23, 42, 0.45)", zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom px-4 py-3">
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center"
                    style={{ width: "36px", height: "36px", backgroundColor: "#EFF6FF", color: "#2563EB" }}
                  >
                    <i className="bi bi-cloud-arrow-up-fill fs-5" />
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold text-dark mb-0">Add Weekly Study Material</h5>
                    <span className="text-muted small">Attach lecture slides or reference materials</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowUploadModal(false)}
                />
              </div>

              <form onSubmit={handleAddMaterialSubmit}>
                <div className="modal-body px-4 py-3">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-secondary">Select Week</label>
                    <select
                      className="form-select"
                      value={targetWeek}
                      onChange={(e) => setTargetWeek(Number(e.target.value))}
                    >
                      {weeks.map((w) => (
                        <option key={w.weekNumber} value={w.weekNumber}>
                          Week {w.weekNumber}: {w.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-secondary">Material Title / File Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Week 1 Lecture Slides.pdf"
                      value={newMaterialTitle}
                      onChange={(e) => setNewMaterialTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-secondary">File Format</label>
                    <select
                      className="form-select"
                      value={newMaterialType}
                      onChange={(e) => setNewMaterialType(e.target.value)}
                    >
                      <option value="PDF">PDF Document (.pdf)</option>
                      <option value="DOC">Word Document (.docx)</option>
                      <option value="PPT">PowerPoint Presentation (.pptx)</option>
                      <option value="IMG">Images / Diagrams (.png, .jpg)</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-secondary">Brief Description</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="Notes on key topics covered in this material..."
                      value={newMaterialDesc}
                      onChange={(e) => setNewMaterialDesc(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer border-top px-4 py-2 bg-light-subtle rounded-bottom-4">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ height: "34px", fontSize: "13.5px" }}
                    onClick={() => setShowUploadModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm d-inline-flex align-items-center justify-content-center gap-1"
                    style={{ height: "34px", fontSize: "13.5px" }}
                  >
                    <i className="bi bi-check-lg" /> Save Material
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
