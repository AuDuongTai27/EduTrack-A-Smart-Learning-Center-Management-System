import { useState, useEffect, useMemo } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import DotStatusBadge from "../../../components/Common/DotStatusBadge";
import Pagination from "../../../components/Common/Pagination";
import TableToolbar from "../../../components/Common/TableToolbar";
import TableActionButton from "../../../components/Common/TableActionButton";
import subjectDAL from "../../../../DAL/subjectDAL";
import managementDAL from "../../../../DAL/managementDAL";
import type { SubjectDto } from "../../../../BLL/models/SubjectDto";

export default function CenterManagerSubjectPage() {
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedSort, setSelectedSort] = useState<string>("az");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);

  // Detail Modal state (GetById)
  const [selectedSubject, setSelectedSubject] = useState<SubjectDto | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  // Add Subject Modal state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [addForm, setAddForm] = useState({
    subjectName: "",
    subjectCode: "",
    description: "",
  });

  // Edit Subject Modal state
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editForm, setEditForm] = useState({
    subjectId: 0,
    subjectName: "",
    subjectCode: "",
    description: "",
  });

  // Delete Subject Modal state
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [subjectToDelete, setSubjectToDelete] = useState<SubjectDto | null>(null);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchSubjects() {
      try {
        setLoading(true);
        const res = await subjectDAL.getAllSubjects();
        if (isMounted && res.data) {
          setSubjects(res.data);
        }
      } catch (err) {
        console.warn("Failed to load subject list for center manager:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchSubjects();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter & Search logic
  const filteredSubjects = useMemo(() => {
    return subjects
      .filter((s) => {
        const matchSearch =
          searchTerm === "" ||
          s.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (s.subjectCode && s.subjectCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase()));

        return matchSearch;
      })
      .sort((a, b) => {
        if (selectedSort === "az") return a.subjectName.localeCompare(b.subjectName);
        if (selectedSort === "za") return b.subjectName.localeCompare(a.subjectName);
        if (selectedSort === "newest") return b.subjectId - a.subjectId;
        if (selectedSort === "oldest") return a.subjectId - b.subjectId;
        return 0;
      });
  }, [subjects, searchTerm, selectedSort]);

  // Paginated list
  const paginatedSubjects = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredSubjects.slice(start, start + entriesPerPage);
  }, [filteredSubjects, currentPage, entriesPerPage]);

  // Handle View Details (GetById)
  const handleViewDetails = async (sub: SubjectDto) => {
    setLoadingDetail(true);
    try {
      const res = await subjectDAL.getSubjectById(sub.subjectId);
      setSelectedSubject(res.data || sub);
    } catch {
      setSelectedSubject(sub);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Handle Add Subject Submit (Create)
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.subjectName.trim()) return;

    setSubmitting(true);
    setActionErrorMsg(null);
    try {
      const code = addForm.subjectCode.trim().toUpperCase() || `SUB${Date.now().toString().slice(-4)}`;
      const res = await managementDAL.createSubject({
        subjectCode: code,
        subjectName: addForm.subjectName.trim(),
        description: addForm.description.trim() || undefined,
      });

      setSubjects([res.data, ...subjects]);
      setShowAddModal(false);
      setAddForm({ subjectName: "", subjectCode: "", description: "" });
      setActionSuccessMsg(`New subject created: "${res.data.subjectName}" (${res.data.subjectCode}) successfully!`);
      setTimeout(() => setActionSuccessMsg(null), 3500);
    } catch (err: any) {
      setActionErrorMsg(err.message || "Failed to create new subject.");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (sub: SubjectDto) => {
    setEditForm({
      subjectId: sub.subjectId,
      subjectName: sub.subjectName,
      subjectCode: sub.subjectCode,
      description: sub.description || "",
    });
    setShowEditModal(true);
    setActionErrorMsg(null);
  };

  // Handle Edit Subject Submit (Update)
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.subjectName.trim()) return;

    setSubmitting(true);
    setActionErrorMsg(null);
    try {
      const res = await managementDAL.updateSubject(editForm.subjectId, {
        subjectCode: editForm.subjectCode.trim().toUpperCase(),
        subjectName: editForm.subjectName.trim(),
        description: editForm.description.trim() || undefined,
      });

      setSubjects(subjects.map((s) => (s.subjectId === editForm.subjectId ? res.data : s)));
      setShowEditModal(false);
      setActionSuccessMsg(`Subject updated: "${res.data.subjectName}" (${res.data.subjectCode}) successfully!`);
      setTimeout(() => setActionSuccessMsg(null), 3500);
    } catch (err: any) {
      setActionErrorMsg(err.message || "Failed to update subject.");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Delete Confirmation Modal
  const handleOpenDeleteModal = (sub: SubjectDto) => {
    setSubjectToDelete(sub);
    setShowDeleteModal(true);
    setActionErrorMsg(null);
  };

  // Handle Confirm Delete (Delete)
  const handleConfirmDelete = async () => {
    if (!subjectToDelete) return;

    setSubmitting(true);
    setActionErrorMsg(null);
    try {
      const res = await managementDAL.deleteSubject(subjectToDelete.subjectId);
      if (res.success) {
        setSubjects(subjects.filter((s) => s.subjectId !== subjectToDelete.subjectId));
        setShowDeleteModal(false);
        setActionSuccessMsg(`Deleted subject "${subjectToDelete.subjectName}" successfully!`);
        setTimeout(() => setActionSuccessMsg(null), 3500);
      } else {
        setActionErrorMsg(res.message || "Failed to delete subject.");
      }
    } catch (err: any) {
      setActionErrorMsg(err.message || "Error deleting subject.");
    } finally {
      setSubmitting(false);
      setSubjectToDelete(null);
    }
  };

  return (
    <>
      {/* Breadcrumb and Quick Access */}
      <PageHeader
        title="Subject Management"
        breadcrumbItems={[
          { label: "Center Manager", path: "/center-manager" },
          { label: "Subjects Management" },
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
            <i className="bi bi-plus-square me-2" />
            Add Subject
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

      {/* Subject List */}
      <div className="card user-list-card border-0 shadow-sm">
        {/* Filter */}
        <div className="card-header user-list-header bg-white py-3 border-bottom">
          <div className="row g-3 align-items-center">
            <div className="col-xl-8 col-lg-8">
              <div className="user-search position-relative">
                <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                <input
                  type="text"
                  className="form-control ps-5"
                  placeholder="Search by subject name, code, description..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
            <div className="col-xl-4 col-lg-4">
              <select
                className="form-select"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
              >
                <option value="az">Sort by Name A-Z</option>
                <option value="za">Sort by Name Z-A</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Controls */}
        <TableToolbar
          totalItems={filteredSubjects.length}
          totalLabel="Total subjects"
          entriesPerPage={entriesPerPage}
          onEntriesPerPageChange={(value) => {
            setEntriesPerPage(value);
            setCurrentPage(1);
          }}
        />

        {/* Subject Table */}
        <div className="table-responsive">
          <table className="table user-table align-middle mb-0 table-hover">
            <thead className="table-light">
              <tr>
                <th className="fw-bold">No.</th>
                <th className="fw-bold">Subject Code</th>
                <th className="fw-bold">Subject Name</th>
                <th className="fw-bold">Description</th>
                <th className="fw-bold text-center">Total Classes</th>
                <th className="fw-bold">Status</th>
                <th className="text-center fw-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    Loading subjects...
                  </td>
                </tr>
              ) : paginatedSubjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    <i className="bi bi-journal-x fs-2 d-block mb-2 text-secondary" />
                    No matching subjects found.
                  </td>
                </tr>
              ) : (
                paginatedSubjects.map((sub, idx) => {
                  const itemIndex = (currentPage - 1) * entriesPerPage + idx + 1;

                  return (
                    <tr key={sub.subjectId}>
                      <td>{itemIndex}</td>
                      <td>
                        <span className="badge bg-light text-primary border font-monospace">
                          #{sub.subjectCode}
                        </span>
                      </td>
                      <td>
                        <h6 className="mb-0 fw-bold text-dark">{sub.subjectName}</h6>
                      </td>
                      <td>
                        <p className="mb-0 text-muted small text-truncate" style={{ maxWidth: "320px" }}>
                          {sub.description || "—"}
                        </p>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-secondary-subtle text-secondary px-3 py-1">
                          {sub.totalClasses || 0} classes
                        </span>
                      </td>
                      <td>
                        <DotStatusBadge status="Active" />
                      </td>
                      <td className="text-center">
                        <div className="d-flex align-items-center justify-content-center gap-1">
                          <TableActionButton
                            action="View"
                            onClick={() => handleViewDetails(sub)}
                            title="View subject details"
                          />
                          <TableActionButton
                            action="Edit"
                            onClick={() => handleOpenEditModal(sub)}
                            title="Edit subject"
                          />
                          <TableActionButton
                            action="Delete"
                            onClick={() => handleOpenDeleteModal(sub)}
                            title="Delete subject"
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
            totalItems={filteredSubjects.length}
            entriesPerPage={entriesPerPage}
            itemLabel="subjects"
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* ADD SUBJECT MODAL */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-journal-plus me-2" />
                  Add New Subject (Center Manager)
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowAddModal(false)}
                />
              </div>
              <form onSubmit={handleAddSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Subject Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Python Programming, Advanced Biology..."
                      value={addForm.subjectName}
                      onChange={(e) => setAddForm({ ...addForm, subjectName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Subject Code <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control font-monospace"
                      placeholder="e.g. BIO, PYT, ENG..."
                      value={addForm.subjectCode}
                      onChange={(e) => setAddForm({ ...addForm, subjectCode: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Curriculum Description / Objectives</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Summary description of subject content..."
                      value={addForm.description}
                      onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                    />
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
                        Saving...
                      </>
                    ) : (
                      "Save Subject"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* EDIT SUBJECT MODAL */}
      {showEditModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-warning-subtle border-bottom">
                <h5 className="modal-title fw-bold text-dark">
                  <i className="bi bi-pencil-square me-2 text-warning" />
                  Edit Subject: #{editForm.subjectCode}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                />
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Subject Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.subjectName}
                      onChange={(e) => setEditForm({ ...editForm, subjectName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Subject Code</label>
                    <input
                      type="text"
                      className="form-control font-monospace"
                      value={editForm.subjectCode}
                      onChange={(e) => setEditForm({ ...editForm, subjectCode: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Curriculum Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    />
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
                      "Update Subject"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && subjectToDelete && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-exclamation-triangle-fill me-2" />
                  Confirm Delete Subject
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowDeleteModal(false)}
                />
              </div>
              <div className="modal-body p-4">
                <p className="mb-2">
                  Are you sure you want to delete this subject from the system?
                </p>
                <div className="p-3 bg-light rounded border mb-3">
                  <h6 className="fw-bold mb-1 text-dark">{subjectToDelete.subjectName}</h6>
                  <span className="badge bg-secondary font-monospace me-2">#{subjectToDelete.subjectCode}</span>
                  <small className="text-muted">Currently has {subjectToDelete.totalClasses || 0} classes</small>
                </div>
                <div className="alert alert-warning py-2 mb-0 small">
                  <i className="bi bi-info-circle me-1" />
                  This action cannot be undone if the subject has not been linked to any classes.
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
                  className="btn btn-danger px-4"
                  onClick={handleConfirmDelete}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Deleting...
                    </>
                  ) : (
                    "Confirm Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL (GetById) */}
      {selectedSubject && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-light border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-primary fs-6 font-monospace">
                    #{selectedSubject.subjectCode}
                  </span>
                  <h5 className="modal-title fw-bold mb-0 text-dark">
                    Subject Details
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedSubject(null)}
                />
              </div>

              <div className="modal-body p-4">
                {loadingDetail ? (
                  <div className="text-center py-4 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    Loading subject information...
                  </div>
                ) : (
                  <>
                    <div className="mb-3">
                      <small className="text-muted d-block mb-1">Subject Name</small>
                      <h4 className="fw-bold text-dark">{selectedSubject.subjectName}</h4>
                    </div>

                    <div className="mb-3">
                      <small className="text-muted d-block mb-1">Identifier Code</small>
                      <span className="badge bg-light text-dark border font-monospace fs-6">
                        {selectedSubject.subjectCode}
                      </span>
                    </div>

                    <div className="mb-3">
                      <small className="text-muted d-block mb-1">Active Classes Count</small>
                      <strong className="text-primary">{selectedSubject.totalClasses || 0} classes</strong>
                    </div>

                    <div className="mb-3">
                      <small className="text-muted d-block mb-1">Curriculum Description</small>
                      <div className="p-3 bg-light rounded border text-secondary">
                        {selectedSubject.description || "No additional notes."}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="modal-footer bg-light">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedSubject(null)}
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

