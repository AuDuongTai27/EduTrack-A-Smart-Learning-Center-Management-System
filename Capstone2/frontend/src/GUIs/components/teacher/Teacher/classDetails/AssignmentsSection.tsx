import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import type { AssignmentDto } from "../../../../../BLL/models/AssignmentDto";
import type { TeachingAssignmentItemDto } from "../../../../../BLL/models/teaching/TeachingAssignmentDto";
import teachingDAL from "../../../../../DAL/teachingDAL";

export interface AssignmentsSectionProps {
  classId?: string | number;
  assignments?: (AssignmentDto | TeachingAssignmentItemDto | any)[];
  onAssignmentDeleted?: (deletedId: number) => void;
}

export interface MaterialItem {
  id: number;
  fileName: string;
  description: string;
  type: string;
  uploadDate: string;
  sizeMb: number;
  fileUrl?: string;
}

export type CourseworkFilterType = "all" | "assignments" | "materials";

function parseDateStrToTime(dateStr?: string): number {
  if (!dateStr) return 0;
  const cleanStr = dateStr.trim();
  if (cleanStr.includes("/")) {
    const parts = cleanStr.split(/[\s,]+/);
    const datePart = parts[0];
    const timePart = parts[1] || "00:00";
    const [d, m, y] = datePart.split("/").map(Number);
    const [hh, mm] = timePart.split(":").map(Number);
    if (d && m && y) {
      return new Date(y, m - 1, d, hh || 0, mm || 0).getTime();
    }
  }
  const parsed = new Date(dateStr).getTime();
  return isNaN(parsed) ? 0 : parsed;
}

export default function AssignmentsSection({
  classId = "1",
  assignments = [],
  onAssignmentDeleted,
}: AssignmentsSectionProps) {
  // Filter & Search states
  const [filterType, setFilterType] = useState<CourseworkFilterType>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Material upload modal states
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [newMaterialTitle, setNewMaterialTitle] = useState<string>("");
  const [newMaterialDesc, setNewMaterialDesc] = useState<string>("");
  const [newMaterialType, setNewMaterialType] = useState<string>("PDF");

  const [materials, setMaterials] = useState<MaterialItem[]>([]);

  // Gom chung tất cả Assignments và Materials thành danh sách hợp nhất (Mới nhất hiện lên đầu)
  const unifiedStream = useMemo(() => {
    const asgItems = assignments.map((asg: any) => ({
      id: `asg-${asg.assignmentId || asg.id}`,
      kind: "assignment" as const,
      title: asg.title,
      description: asg.description || asg.assignmentType,
      dateStr: asg.dueDate || asg.createdAt || "08/09/2026",
      timestamp: parseDateStrToTime(asg.createdAt || asg.dueDate),
      rawAssignment: asg,
    }));

    const matItems = materials.map((mat) => ({
      id: `mat-${mat.id}`,
      kind: "material" as const,
      title: mat.fileName,
      description: mat.description,
      dateStr: mat.uploadDate,
      timestamp: parseDateStrToTime(mat.uploadDate),
      rawMaterial: mat,
    }));

    // Sắp xếp mới nhất lên đầu
    return [...asgItems, ...matItems].sort((a, b) => b.timestamp - a.timestamp);
  }, [assignments, materials]);

  // Lọc danh sách stream theo filterType và searchTerm
  const filteredStream = useMemo(() => {
    return unifiedStream.filter((item) => {
      if (filterType === "assignments" && item.kind !== "assignment") return false;
      if (filterType === "materials" && item.kind !== "material") return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(term);
        const matchDesc = item.description?.toLowerCase().includes(term);
        return matchTitle || matchDesc;
      }
      return true;
    });
  }, [unifiedStream, filterType, searchTerm]);

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
    const newMat: MaterialItem = {
      id: Date.now(),
      fileName: newMaterialTitle.trim(),
      description: newMaterialDesc.trim() || "Lecture material & study notes",
      type: newMaterialType,
      uploadDate: new Date().toLocaleDateString("en-US"),
      sizeMb: 1.5,
      fileUrl: "/assets/docs/assignment_default.pdf",
    };
    setMaterials((prev) => [newMat, ...prev]);
    setNewMaterialTitle("");
    setNewMaterialDesc("");
    setShowUploadModal(false);
  };

  const totalMaterials = materials.length;
  const totalAssignments = assignments.length;

  return (
    <>
      <details className="card class-list-card border-0 mb-4">
        {/* 1. Master Section Header (Clicking summary toggles section) */}
        <summary className="class-list-header d-flex align-items-center justify-content-between py-3 px-4 flex-wrap gap-2 cursor-pointer">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-collection-play-fill text-primary fs-5" />
            <h4 className="class-list-title mb-0">
              Coursework &amp; Learning Materials ({unifiedStream.length})
            </h4>
          </div>

          {/* Action buttons + Toggle Chevron */}
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div
              className="d-flex align-items-center gap-2 flex-wrap"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="btn btn-outline-primary btn-sm d-inline-flex align-items-center justify-content-center gap-2 shadow-xs rounded-2"
                style={{ height: "36px", fontSize: "13px", fontWeight: 500, padding: "0 14px" }}
                onClick={() => setShowUploadModal(true)}
              >
                <i className="bi bi-cloud-upload" /> Add Material
              </button>
              <Link
                to={`/teacher/classes/${classId}/assignment/new-assignment`}
                className="btn btn-primary btn-sm d-inline-flex align-items-center justify-content-center gap-2 shadow-sm text-decoration-none rounded-2"
                style={{ height: "36px", fontSize: "13px", fontWeight: 500, padding: "0 14px" }}
              >
                <i className="bi bi-plus-lg" /> Add Assignment
              </Link>
            </div>

            <i className="bi bi-chevron-down details-chevron text-muted" />
          </div>
        </summary>

        {/* 2. Unified Toolbar: Filter Pills (All / Assignments / Materials) & Search Box */}
        <div className="px-4 py-3 border-bottom bg-light bg-opacity-40 d-flex align-items-center justify-content-between flex-wrap gap-2">
          {/* Filter Pills */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 py-1 fw-medium d-inline-flex align-items-center gap-2 transition-all ${
                filterType === "all"
                  ? "btn-primary shadow-xs"
                  : "btn-outline-secondary bg-white text-secondary border"
              }`}
              style={{ fontSize: "13px" }}
              onClick={() => setFilterType("all")}
            >
              <i className="bi bi-grid-fill" style={{ fontSize: "12px" }} />
              <span>All ({unifiedStream.length})</span>
            </button>

            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 py-1 fw-medium d-inline-flex align-items-center gap-2 transition-all ${
                filterType === "assignments"
                  ? "btn-primary shadow-xs"
                  : "btn-outline-secondary bg-white text-secondary border"
              }`}
              style={{ fontSize: "13px" }}
              onClick={() => setFilterType("assignments")}
            >
              <i className="bi bi-journal-check" style={{ fontSize: "12px" }} />
              <span>Assignments ({totalAssignments})</span>
            </button>

            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 py-1 fw-medium d-inline-flex align-items-center gap-2 transition-all ${
                filterType === "materials"
                  ? "btn-primary shadow-xs"
                  : "btn-outline-secondary bg-white text-secondary border"
              }`}
              style={{ fontSize: "13px" }}
              onClick={() => setFilterType("materials")}
            >
              <i className="bi bi-file-earmark-text-fill" style={{ fontSize: "12px" }} />
              <span>Materials ({totalMaterials})</span>
            </button>
          </div>

          {/* Search Box */}
          <div>
            <div className="input-group input-group-sm" style={{ width: 280 }}>
              <span className="input-group-text bg-white border-end-0 text-muted rounded-start-2">
                <i className="bi bi-search" style={{ fontSize: "12px" }} />
              </span>
              <input
                type="search"
                className="form-control form-control-sm border-start-0 ps-1 rounded-end-2"
                placeholder="Search coursework..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ fontSize: "13px" }}
              />
            </div>
          </div>
        </div>

        {/* 3. Stream List (Gom chung mới nhất lên đầu) */}
        <div className="p-4 bg-white d-flex flex-column gap-3">
          {filteredStream.length > 0 ? (
            filteredStream.map((item) => {
              if (item.kind === "assignment" && item.rawAssignment) {
                const asg = item.rawAssignment;
                const isOverdue = asg.dueDate ? new Date(asg.dueDate) < new Date() : false;
                const submissionCount = asg.submissionCount ?? 0;
                const gradedCount = asg.gradedCount ?? 0;
                const asgId = asg.assignmentId || item.id;
                const isGradedDone = submissionCount > 0 && gradedCount === submissionCount;
                const isPendingGrading = isOverdue && !isGradedDone;

                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-3 border bg-white d-flex align-items-center justify-content-between flex-wrap gap-3 hover-shadow-sm transition-all"
                    style={{ borderColor: "#E2E8F0" }}
                  >
                    {/* Left: Icon & Info */}
                    <div className="d-flex align-items-center gap-3 min-w-0 flex-grow-1">
                      {/* Unified Assignment Icon Box (Blue/Primary) */}
                      <div
                        className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                          width: 44,
                          height: 44,
                          backgroundColor: "#EFF6FF",
                          color: "#2563EB",
                          border: "1px solid #BFDBFE",
                        }}
                      >
                        <i className="bi bi-journal-check fs-5" />
                      </div>

                      <div className="min-w-0 flex-grow-1">
                        <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                          <span
                            className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2 py-1 fw-semibold"
                            style={{ fontSize: "11px" }}
                          >
                            Assignment
                          </span>
                          <span
                            className="fw-bold text-dark text-break"
                            style={{ fontSize: "14.5px" }}
                          >
                            {asg.title}
                          </span>
                        </div>
                        <div className="d-flex align-items-center gap-2 text-muted small flex-wrap" style={{ fontSize: "12.5px" }}>
                          <span className="d-inline-flex align-items-center gap-1 text-danger fw-medium">
                            <i className="bi bi-clock" /> Due:{" "}
                            {asg.dueDateFormatted ||
                              (asg.dueDate ? new Date(asg.dueDate).toLocaleDateString("en-US") : "No deadline")}
                          </span>
                          <span>&middot;</span>
                          <span>Max score: {asg.maxScore ?? "10.0"} pts</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Submission Status & Action Buttons */}
                    <div className="d-flex align-items-center gap-2 flex-shrink-0">
                      {submissionCount > 0 ? (
                        isPendingGrading ? (
                          <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-1 rounded-pill fw-medium">
                            Pending grading ({gradedCount}/{submissionCount})
                          </span>
                        ) : (
                          <span
                            className={`badge ${
                              isGradedDone
                                ? "bg-success-subtle text-success border border-success-subtle"
                                : "bg-warning-subtle text-warning-emphasis border border-warning-subtle"
                            } px-2 py-1 rounded-pill fw-medium`}
                          >
                            {isGradedDone ? "Graded" : "Pending grading"} ({gradedCount}/{submissionCount})
                          </span>
                        )
                      ) : (
                        <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1 rounded-pill fw-normal">
                          No submissions
                        </span>
                      )}

                      <Link
                        to={`/teacher/classes/${classId}/assignment/${asg.assignmentId || asgId}`}
                        className="btn btn-sm btn-outline-primary rounded-2 px-3 fw-medium d-inline-flex align-items-center gap-1 shadow-xs"
                        style={{ fontSize: "12.5px" }}
                      >
                        <i className="bi bi-eye" />
                        <span>Grade</span>
                      </Link>

                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger rounded-2 px-2 shadow-xs"
                        style={{ fontSize: "12.5px" }}
                        disabled={deletingId === asg.assignmentId}
                        onClick={() => handleDelete(asg.assignmentId, asg.title)}
                        title="Delete assignment"
                      >
                        <i className="bi bi-trash" />
                      </button>
                    </div>
                  </div>
                );
              }

              // Material Item in Stream
              if (item.kind === "material" && item.rawMaterial) {
                const mat = item.rawMaterial;
                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-3 border bg-white d-flex align-items-center justify-content-between flex-wrap gap-3 hover-shadow-sm transition-all"
                    style={{ borderColor: "#E2E8F0" }}
                  >
                    {/* Left: Icon & Info */}
                    <div className="d-flex align-items-center gap-3 min-w-0 flex-grow-1">
                      {/* Unified Material Icon Box (Rose/Danger) */}
                      <div
                        className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                          width: 44,
                          height: 44,
                          backgroundColor: "#FFF1F2",
                          color: "#E11D48",
                          border: "1px solid #FECDD3",
                        }}
                      >
                        <i className="bi bi-file-earmark-text-fill fs-5" />
                      </div>

                      <div className="min-w-0 flex-grow-1">
                        <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                          <span
                            className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2 py-1 fw-semibold"
                            style={{ fontSize: "11px" }}
                          >
                            Material &middot; {mat.type}
                          </span>
                          <span className="fw-bold text-dark text-break" style={{ fontSize: "14.5px" }}>
                            {mat.fileName}
                          </span>
                        </div>
                        <div className="d-flex align-items-center gap-2 text-muted small flex-wrap" style={{ fontSize: "12.5px" }}>
                          {mat.description && (
                            <span className="text-truncate text-secondary" style={{ maxWidth: 450 }}>
                              {mat.description}
                            </span>
                          )}
                          <span>
                            <i className="bi bi-calendar3 opacity-50 me-1" />
                            Uploaded: {mat.uploadDate} &middot; {mat.sizeMb} MB
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Download Action Button */}
                    <div className="d-flex align-items-center gap-2 flex-shrink-0">
                      <a
                        href={mat.fileUrl || "#"}
                        onClick={(e) => {
                          if (!mat.fileUrl) {
                            e.preventDefault();
                            alert(`Downloading document: ${mat.fileName}`);
                          }
                        }}
                        className="btn btn-sm btn-outline-secondary rounded-2 px-3 fw-medium d-inline-flex align-items-center gap-2 shadow-xs"
                        style={{ fontSize: "12.5px" }}
                      >
                        <i className="bi bi-download" />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                );
              }

              return null;
            })
          ) : (
            <div className="py-5 text-center text-muted">
              <i className="bi bi-inbox fs-1 d-block mb-2 text-secondary opacity-50" />
              <h6 className="fw-semibold text-dark mb-1">No coursework or materials found</h6>
              <small className="text-muted">
                {searchTerm
                  ? "Try adjusting your search keywords or clear the filter."
                  : "No assignments or study resources created for this class yet."}
              </small>
            </div>
          )}
        </div>
      </details>

      {/* 4. Modal: Upload Material */}
      {showUploadModal && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(15, 23, 42, 0.45)", zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
              <div className="modal-header border-bottom px-4 py-3 bg-white">
                <div className="d-flex align-items-center gap-2.5">
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center"
                    style={{ width: "36px", height: "36px", backgroundColor: "var(--et-mint)", color: "var(--et-primary)" }}
                  >
                    <i className="bi bi-file-earmark-plus-fill fs-5" />
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold text-dark mb-0" style={{ fontSize: "16px" }}>Add Study Material</h5>
                    <span className="text-muted small" style={{ fontSize: "12.5px" }}>Attach lecture slides or reference materials</span>
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
                    <label className="form-label small fw-semibold text-dark mb-1">
                      Material Title / File Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control rounded-2"
                      placeholder="e.g. Chapter 1: Quadratic Equations Lecture Slides.pdf"
                      value={newMaterialTitle}
                      onChange={(e) => setNewMaterialTitle(e.target.value)}
                      required
                      style={{ fontSize: "13.5px" }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark mb-1">File Format</label>
                    <select
                      className="form-select rounded-2"
                      value={newMaterialType}
                      onChange={(e) => setNewMaterialType(e.target.value)}
                      style={{ fontSize: "13.5px" }}
                    >
                      <option value="PDF">PDF Document (.pdf)</option>
                      <option value="DOC">Word Document (.docx)</option>
                      <option value="PPT">PowerPoint Presentation (.pptx)</option>
                      <option value="IMG">Images / Diagrams (.png, .jpg)</option>
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold text-dark mb-1">Brief Description</label>
                    <textarea
                      className="form-control rounded-2"
                      rows={2}
                      placeholder="Notes on key topics covered in this material..."
                      value={newMaterialDesc}
                      onChange={(e) => setNewMaterialDesc(e.target.value)}
                      style={{ fontSize: "13.5px" }}
                    />
                  </div>
                </div>

                <div className="modal-footer border-top px-4 py-2.5 bg-light">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm rounded-2 px-3 py-1.5"
                    style={{ fontSize: "13px" }}
                    onClick={() => setShowUploadModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm d-inline-flex align-items-center justify-content-center gap-1.5 rounded-2 px-3 py-1.5 fw-medium shadow-sm"
                    style={{ fontSize: "13px" }}
                  >
                    <i className="bi bi-check-lg" /> Save Material
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
