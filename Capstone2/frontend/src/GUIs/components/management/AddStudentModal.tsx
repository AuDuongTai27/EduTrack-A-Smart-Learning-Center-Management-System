import { useState, useEffect, useRef } from 'react';
import { useStudentGrades } from '../../hooks/useStudentGrades';
import { useStudentEnrollment } from '../../hooks/useStudentEnrollment';
import StudentGradeSelect from './StudentGradeSelect';
import StudentEnrollmentSection from './StudentEnrollmentSection';
import ModalSurface, { ModalHeader } from '../Common/ModalSurface';
import managementDAL from '../../../DAL/managementDAL';
import userDAL from '../../../DAL/userDAL';
import { StudentCreationConflictError } from '../../../api/managementApi';
import type { UserDto } from '../../../BLL/models/UserDto';

export default function AddStudentModal({ open, onClose, onSaved }: {
  open: boolean; onClose: () => void; onSaved: (student: UserDto, recovered?: boolean) => void;
}) {
  const catalogue = useStudentGrades();
  const busy = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);
  const { refresh } = catalogue;
  useEffect(() => { if (open) refresh(); }, [open, refresh]);
  const close = () => {
    if (busy.current) return;
    setActionErrorMsg(null);
    onClose();
  };
  const [addForm, setAddForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    gradeId: "",
    gender: "male",
  });

  const selectedGradeId = catalogue.grades.some(g => String(g.gradeId) === addForm.gradeId) ? Number(addForm.gradeId) : null;
  const enrollment = useStudentEnrollment(selectedGradeId, open);

  const [enrollmentConflict, setEnrollmentConflict] = useState<StudentCreationConflictError | null>(null);

  const handleViewSavedStudent = async () => {
    if (!enrollmentConflict || busy.current) return;
    busy.current = true;
    setSubmitting(true);
    try {
      const saved = await userDAL.getUserById(enrollmentConflict.studentId);
      if (!saved || saved.userId !== enrollmentConflict.studentId || saved.userCode !== enrollmentConflict.studentCode)
        throw new Error("Could not verify saved profile. Please check again.");
      enrollment.saved();
      onSaved(saved, true);
      onClose();
      setAddForm({ fullName: "", phone: "", email: "", gradeId: "", gender: "male" });
      setEnrollmentConflict(null);
      setActionErrorMsg(null);
    } catch (error) {
      setActionErrorMsg(error instanceof Error ? error.message : "Failed to load saved profile. Please try again.");
    } finally {
      busy.current = false;
      setSubmitting(false);
    }
  };

  // Keep one atomic request and the same attempt identity across retries.
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy.current || !addForm.fullName.trim()) return;
    busy.current = true;

    setEnrollmentConflict(null);
    setSubmitting(true);
    setActionErrorMsg(null);
    try {
      const profile = {
        fullName: addForm.fullName.trim(),
        phone: addForm.phone.trim() || undefined,
        email: addForm.email.trim() || undefined,
        gender: addForm.gender,
      };
      const res = await managementDAL.createStudent({ ...profile, role: "student",
        userCode: enrollment.creationCode(), gradeId: addForm.gradeId ? Number(addForm.gradeId) : null, classIds: enrollment.selected });

      enrollment.saved();
      onClose();
      setAddForm({
        fullName: "",
        phone: "",
        email: "",
        gradeId: "",
        gender: "male",
      });
      onSaved(res.data);
    } catch (err: unknown) {
      if (err instanceof StudentCreationConflictError) setEnrollmentConflict(err);
      setActionErrorMsg(err instanceof Error ? err.message : "Unable to create account.");
    } finally {
      busy.current = false;
      setSubmitting(false);
    }
  };

  if (!open) return null;
  return <div className="modal show d-block" tabIndex={-1}>
    <div className="modal-dialog modal-dialog-centered modal-lg">
      <ModalSurface className="modal-content" aria-busy={submitting}>
        <ModalHeader title="Add Student" icon="student" onClose={close} busy={submitting} />
        <form onSubmit={handleAddSubmit}>
          <div className="modal-body p-4">
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="add-student-fullName" className="form-label fw-bold">Full Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter full name..."
                  id="add-student-fullName" value={addForm.fullName}
                  onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="add-student-phone" className="form-label fw-bold">Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="09xx xxx xxx"
                  id="add-student-phone" value={addForm.phone}
                  onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="add-student-email" className="form-label fw-bold">Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="example@edutrack.edu.vn"
                  id="add-student-email" value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="add-student-gender" className="form-label fw-bold">Gender</label>
                <select
                  className="form-select"
                  id="add-student-gender" value={addForm.gender}
                  onChange={(e) => setAddForm({ ...addForm, gender: e.target.value })}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="col-md-12">
                <label className="form-label fw-bold">Grade</label>
                <StudentGradeSelect {...catalogue} value={addForm.gradeId} disabled={submitting}
                  onChange={gradeId => setAddForm({ ...addForm, gradeId })} />
              </div>
              <StudentEnrollmentSection enrollment={enrollment} disabled={submitting} />
              {actionErrorMsg && <div className="col-12"><div className="alert alert-danger mb-0" role="alert">
                <div>{actionErrorMsg}</div>
                {enrollmentConflict && <button type="button" className="btn btn-sm btn-outline-danger mt-2" disabled={submitting} onClick={handleViewSavedStudent}>View saved profile</button>}
              </div></div>}
            </div>
          </div>
          <div className="modal-footer bg-light">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={close}
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
                "Save Student"
              )}
            </button>
          </div>
        </form>
      </ModalSurface>
    </div>
  </div>;
}
