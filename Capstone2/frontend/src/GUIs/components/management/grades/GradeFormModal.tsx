import { useEffect, useRef, useState } from "react";
import type { ManagedGradeDto } from "../../../../BLL/models/GradeDto";
import { gradeManagementApi } from "../../../../api/gradeManagementApi";
import { gradeNameError, normalizeGradeName } from "../../../../BLL/services/gradeManagementService";
import { classError } from "../../../../BLL/services/classManagementService";

export default function GradeFormModal({id, onClose, onSaved}: {
  id?: number; onClose: () => void; onSaved: (grade: ManagedGradeDto) => void;
}) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(id !== undefined);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const busy = useRef(false);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true; let active = true;
    if (id !== undefined) {
      gradeManagementApi.getById(id).then(item => {if (active) setName(item.gradeName);})
        .catch(cause => {if (active) setError(classError(cause));})
        .finally(() => {if (active) setLoading(false);});
    }
    return () => {active = false; mounted.current = false;};
  }, [id, revision]);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); if (busy.current || loading) return;
    const validation = gradeNameError(name); setFieldError(validation); if (validation) return;
    busy.current = true; setSaving(true); setError(null);
    try {
      const item = id === undefined ? await gradeManagementApi.create(normalizeGradeName(name))
        : await gradeManagementApi.rename(id, normalizeGradeName(name));
      if (mounted.current) onSaved(item);
    } catch (cause) {if (mounted.current) setError(classError(cause));}
    finally {busy.current = false; if (mounted.current) setSaving(false);}
  };
  return <div className="modal show d-block" role="dialog" aria-modal="true" aria-labelledby="grade-form-title" style={{backgroundColor: "rgba(0,0,0,0.5)"}}>
    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable"><div className="modal-content border-0 shadow-lg">
      <div className="modal-header bg-primary text-white"><h5 id="grade-form-title" className="modal-title fw-bold">{id === undefined ? "Add Grade" : "Edit Grade"}</h5>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" disabled={saving} onClick={onClose} /></div>
      <form onSubmit={submit} noValidate>
        <div className="modal-body p-4">
          {loading && <div className="text-muted" role="status">Loading grade...</div>}
          {error && <div className="alert alert-danger" role="alert">{error}{id !== undefined && !name && <button type="button" className="btn btn-sm btn-outline-danger ms-2" onClick={() => {setLoading(true); setError(null); setRevision(v => v + 1);}}>Retry</button>}</div>}
          {!loading && <div><label htmlFor="grade-name" className="form-label fw-semibold">Grade Name <span className="text-danger">*</span></label>
            <input id="grade-name" name="gradeName" className={`form-control${fieldError ? " is-invalid" : ""}`} value={name} maxLength={50} required
              placeholder="e.g., Grade 10, University Prep" disabled={saving || (id !== undefined && !!error && !name)}
              aria-invalid={!!fieldError} aria-describedby={fieldError ? "grade-name-error" : undefined}
              onChange={event => {setName(event.target.value); setFieldError(null);}} />
            {fieldError && <div id="grade-name-error" className="invalid-feedback">{fieldError}</div>}
          </div>}
        </div>
        <div className="modal-footer bg-light"><button type="button" className="btn btn-outline-secondary" disabled={saving} onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading || saving || (id !== undefined && !!error && !name)}>{saving ? "Saving..." : "Save Grade"}</button></div>
      </form>
    </div></div>
  </div>;
}
