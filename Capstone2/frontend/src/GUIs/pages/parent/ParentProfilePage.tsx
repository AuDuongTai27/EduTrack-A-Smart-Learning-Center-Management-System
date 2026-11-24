import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParent } from '../../../contexts/ParentContext';
import { LearnerPageLoader } from '../../components/student/common/LearnerPageLoader';
import { StudentPageHeader } from '../../components/student/common/StudentPageHeader';
import { learningDAL } from '../../../DAL/learningDAL';
import { getSelectedUserId } from '../../../BLL/services/userSelection';

interface ParentProfileState {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  relationship: string;
}

interface ParentFieldErrors {
  fullName?: string;
  phone?: string;
  email?: string;
}

const CARD_SURFACE_STYLE: React.CSSProperties = {
  border: '1px solid var(--et-border)',
  boxShadow: 'var(--et-shadow)',
};

function getInitials(fullName?: string): string {
  const cleaned = (fullName || '').trim();
  if (!cleaned) return 'PA';
  const parts = cleaned.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatRelationshipBadge(rel?: string): string {
  const val = (rel || '').trim();
  const lower = val.toLowerCase();
  if (!val || lower === 'phụ huynh' || lower === 'parent') return 'Parent';
  if (lower === 'bố' || lower === 'father') return 'Parent · Father';
  if (lower === 'mẹ' || lower === 'mother') return 'Parent · Mother';
  return `Parent · ${val}`;
}

export function ParentProfilePage() {
  const navigate = useNavigate();
  const { childrenList, loading: parentLoading, setSelectedChildId } = useParent();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ParentFieldErrors>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const currentParentId = getSelectedUserId('parent');

  const [parentInfo, setParentInfo] = useState<ParentProfileState | null>(null);
  const [formData, setFormData] = useState<ParentProfileState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showToast, setShowToast] = useState(false);
  const [openChildMenuId, setOpenChildMenuId] = useState<number | null>(null);

  useEffect(() => {
    if (openChildMenuId === null) return;
    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest('[data-child-menu]')) {
        setOpenChildMenuId(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenChildMenuId(null);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openChildMenuId]);

  const loadParentProfile = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const dto = await learningDAL.getParentProfile(currentParentId);
      if (!dto) {
        throw new Error('Parent profile data is unavailable.');
      }
      const info: ParentProfileState = {
        fullName: dto.fullName || 'Parent',
        phone: dto.phone || '',
        email: dto.email || '',
        address: dto.address || '',
        relationship: dto.relationship || 'Parent',
      };
      setParentInfo(info);
      setFormData(info);
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : 'Unable to load parent profile. Please check your connection and try again.'
      );
      setParentInfo(null);
      setFormData(null);
    } finally {
      setLoading(false);
    }
  }, [currentParentId]);

  useEffect(() => {
    document.title = 'Parent Profile – EduTrack';
    loadParentProfile();
  }, [loadParentProfile]);

  const handleStartEdit = () => {
    if (!parentInfo) return;
    setFormData(parentInfo);
    setFieldErrors({});
    setSaveError(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (isSaving) return;
    setFormData(parentInfo);
    setFieldErrors({});
    setSaveError(null);
    setIsEditing(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || isSaving) return;

    const trimmedName = formData.fullName.trim();
    const trimmedPhone = formData.phone.trim();
    const trimmedEmail = formData.email.trim();
    const nextErrors: ParentFieldErrors = {};

    if (!trimmedName) {
      nextErrors.fullName = 'Full Name is required.';
    }
    if (trimmedPhone && !/^[0-9+\s().-]{8,20}$/.test(trimmedPhone)) {
      nextErrors.phone = 'Please enter a valid phone number.';
    }
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setSaveError(null);
    setIsSaving(true);

    try {
      const updated = await learningDAL.updateParentProfile(
        {
          fullName: trimmedName,
          phone: trimmedPhone,
          email: trimmedEmail,
          address: formData.address.trim(),
        },
        currentParentId
      );
      const nextInfo: ParentProfileState = {
        fullName: updated.fullName || trimmedName,
        phone: updated.phone ?? trimmedPhone,
        email: updated.email ?? trimmedEmail,
        address: updated.address ?? formData.address.trim(),
        relationship: formData.relationship,
      };
      setParentInfo(nextInfo);
      setFormData(nextInfo);
      setIsEditing(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save profile changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoToFeedbackForLinking = () => {
    navigate('/parent/feedback?type=link_student');
  };

  const handleOpenChildSection = (childId: number, path: string) => {
    setSelectedChildId(childId);
    navigate(path);
  };

  if (parentLoading || loading) {
    return (
      <LearnerPageLoader
        title="Loading parent profile..."
        message="The system is synchronizing contact information and linked students list."
        containerClassName="profile-container"
      />
    );
  }

  if (loadError || !parentInfo || !formData) {
    return (
      <main className="main-content">
        <div className="content-container profile-container">
          <StudentPageHeader
            title="Parent Profile"
            breadcrumbs={[
              { label: 'Dashboard', href: '/parent/dashboard' },
              { label: 'Parent Profile' },
            ]}
          />
          <div className="card rounded-4 p-4 bg-white text-center" style={CARD_SURFACE_STYLE} role="alert">
            <div
              className="rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3"
              style={{
                width: '48px',
                height: '48px',
                background: '#fef2f2',
                color: '#dc2626',
              }}
            >
              <i className="bi bi-exclamation-triangle-fill fs-5" />
            </div>
            <h2 className="h6 fw-bold text-dark mb-1">Unable to load parent profile</h2>
            <p className="small text-muted mb-3">{loadError || 'An unexpected error occurred while loading your profile.'}</p>
            <div>
              <button
                type="button"
                className="btn btn-primary btn-sm rounded-3 px-3 fw-semibold"
                onClick={loadParentProfile}
              >
                <i className="bi bi-arrow-clockwise me-1" />
                Retry
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="content-container profile-container">
        {/* Header & Breadcrumb */}
        <StudentPageHeader
          title="Parent Profile"
          breadcrumbs={[
            { label: 'Dashboard', href: '/parent/dashboard' },
            { label: 'Parent Profile', href: isEditing ? '/parent/profile' : undefined },
            ...(isEditing ? [{ label: 'Edit' }] : []),
          ]}
        />

        {/* Thông báo cập nhật */}
        {showToast && (
          <div
            className="alert alert-success rounded-4 d-flex align-items-center gap-2 mb-4"
            style={{ border: '1px solid var(--et-border)', boxShadow: 'var(--et-shadow)' }}
            role="status"
            aria-live="polite"
          >
            <i className="bi bi-check-circle-fill fs-5"></i>
            <span>Parent profile updated successfully!</span>
          </div>
        )}

        {/* Top Parent Identity Bar */}
        <div className="card rounded-4 overflow-hidden mb-4 bg-white" style={CARD_SURFACE_STYLE}>
          <div style={{ height: '4px', background: 'var(--et-primary)' }} />
          <div className="p-4 d-flex align-items-center justify-content-between gap-3 flex-wrap">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold fs-4 flex-shrink-0"
                style={{
                  width: '64px',
                  height: '64px',
                  background: 'var(--et-primary)',
                }}
              >
                {getInitials(parentInfo.fullName)}
              </div>
              <div>
                <h2 className="h5 fw-bold text-dark mb-1">{parentInfo.fullName}</h2>
                <div className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2 py-1">
                  {formatRelationshipBadge(parentInfo.relationship)}
                </div>
              </div>
            </div>

            {!isEditing && (
              <button
                type="button"
                className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3 fw-semibold"
                onClick={handleStartEdit}
              >
                <i className="bi bi-pencil-square"></i>
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        <div className="row g-4 align-items-start">
          {/* Card Thông tin Liên hệ */}
          <div className="col-12 col-lg-6">
            <div className="card rounded-4 p-4 bg-white" style={CARD_SURFACE_STYLE}>
              <div
                className="d-flex align-items-center justify-content-between pb-3 mb-3"
                style={{ borderBottom: '1px solid var(--et-border)' }}
              >
                <h3 className="h6 fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                  <i className="bi bi-person-lines-fill text-primary"></i>
                  <span>Contact Information</span>
                </h3>
              </div>

              {!isEditing ? (
                <div className="profile-section-list">
                  <div className="profile-section-item">
                    <div className="profile-info-icon-box">
                      <i className="bi bi-telephone-fill"></i>
                    </div>
                    <div className="flex-grow-1">
                      <div className="profile-info-label-group">
                        <span className="profile-info-label">Phone Number</span>
                      </div>
                      <p className="profile-info-value">
                        {parentInfo.phone || (
                          <span className="text-muted fst-italic fw-normal">Not provided</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="profile-section-item">
                    <div className="profile-info-icon-box">
                      <i className="bi bi-envelope-fill"></i>
                    </div>
                    <div className="flex-grow-1">
                      <div className="profile-info-label-group">
                        <span className="profile-info-label">Email</span>
                      </div>
                      <p className="profile-info-value">
                        {parentInfo.email || (
                          <span className="text-muted fst-italic fw-normal">Not provided</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="profile-section-item">
                    <div className="profile-info-icon-box">
                      <i className="bi bi-geo-alt-fill"></i>
                    </div>
                    <div className="flex-grow-1">
                      <div className="profile-info-label-group">
                        <span className="profile-info-label">Contact Address</span>
                      </div>
                      <p className="profile-info-value">
                        {parentInfo.address || (
                          <span className="text-muted fst-italic fw-normal">Not provided</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSave} noValidate className="d-flex flex-column gap-3">
                  {saveError && (
                    <div className="alert alert-danger py-2 px-3 small mb-1 d-flex align-items-center gap-2 rounded-3 border-0" role="alert">
                      <i className="bi bi-exclamation-triangle-fill flex-shrink-0" />
                      <span>{saveError}</span>
                    </div>
                  )}

                  <div className="form-field-group">
                    <label className="form-field-label" htmlFor="parentInputFullName">Full Name</label>
                    <div className="input-icon-wrap">
                      <i className="bi bi-person"></i>
                      <input
                        type="text"
                        id="parentInputFullName"
                        className={`et-form-input${fieldErrors.fullName ? ' border-danger' : ''}`}
                        value={formData.fullName}
                        onChange={(e) => {
                          setFormData({ ...formData, fullName: e.target.value });
                          if (fieldErrors.fullName) {
                            setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
                          }
                        }}
                        placeholder="Enter full name"
                        disabled={isSaving}
                        autoFocus
                        aria-invalid={Boolean(fieldErrors.fullName)}
                        aria-describedby={fieldErrors.fullName ? 'parentFullNameError' : undefined}
                      />
                    </div>
                    {fieldErrors.fullName && (
                      <div id="parentFullNameError" className="text-danger small mt-1">
                        {fieldErrors.fullName}
                      </div>
                    )}
                  </div>

                  <div className="form-field-group">
                    <label className="form-field-label" htmlFor="parentInputPhone">Phone Number</label>
                    <div className="input-icon-wrap">
                      <i className="bi bi-telephone"></i>
                      <input
                        type="tel"
                        id="parentInputPhone"
                        className={`et-form-input${fieldErrors.phone ? ' border-danger' : ''}`}
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({ ...formData, phone: e.target.value });
                          if (fieldErrors.phone) {
                            setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                          }
                        }}
                        placeholder="0900 000 000"
                        disabled={isSaving}
                        aria-invalid={Boolean(fieldErrors.phone)}
                        aria-describedby={fieldErrors.phone ? 'parentPhoneError' : undefined}
                      />
                    </div>
                    {fieldErrors.phone && (
                      <div id="parentPhoneError" className="text-danger small mt-1">
                        {fieldErrors.phone}
                      </div>
                    )}
                  </div>

                  <div className="form-field-group">
                    <label className="form-field-label" htmlFor="parentInputEmail">Email</label>
                    <div className="input-icon-wrap">
                      <i className="bi bi-envelope"></i>
                      <input
                        type="email"
                        id="parentInputEmail"
                        className={`et-form-input${fieldErrors.email ? ' border-danger' : ''}`}
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (fieldErrors.email) {
                            setFieldErrors((prev) => ({ ...prev, email: undefined }));
                          }
                        }}
                        placeholder="example@email.com"
                        disabled={isSaving}
                        aria-invalid={Boolean(fieldErrors.email)}
                        aria-describedby={fieldErrors.email ? 'parentEmailError' : undefined}
                      />
                    </div>
                    {fieldErrors.email && (
                      <div id="parentEmailError" className="text-danger small mt-1">
                        {fieldErrors.email}
                      </div>
                    )}
                  </div>

                  <div className="form-field-group">
                    <label className="form-field-label" htmlFor="parentInputAddress">Contact Address</label>
                    <div className="input-icon-wrap">
                      <i className="bi bi-geo-alt"></i>
                      <input
                        type="text"
                        id="parentInputAddress"
                        className="et-form-input"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Enter contact address"
                        disabled={isSaving}
                      />
                    </div>
                  </div>

                  <div className="d-flex align-items-center justify-content-end gap-2 mt-2 pt-3 border-top">
                    <button
                      type="button"
                      className="btn-cancel-profile"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-save-profile"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-lg"></i>
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Card Danh Sách Con Đã Liên Kết */}
          <div className="col-12 col-lg-6">
            <div className="card rounded-4 p-4 bg-white" style={CARD_SURFACE_STYLE}>
              <div
                className="d-flex align-items-center justify-content-between mb-4 pb-3"
                style={{ borderBottom: '1px solid var(--et-border)' }}
              >
                <h3 className="h6 fw-bold text-dark mb-0">
                  <i className="bi bi-people-fill text-primary me-2"></i>
                  Linked Children ({childrenList.length})
                </h3>

                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary rounded-3 px-3 fw-semibold"
                  onClick={handleGoToFeedbackForLinking}
                  title="Go to Feedback to request linking a child with Admin Staff"
                >
                  <i className="bi bi-plus-lg me-1"></i> Add Child
                </button>
              </div>

              {childrenList.length === 0 ? (
                <div className="text-center py-4 px-2">
                  <div
                    className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{
                      width: '48px',
                      height: '48px',
                      background: 'var(--et-mint)',
                      color: 'var(--et-primary)',
                    }}
                  >
                    <i className="bi bi-people fs-5" />
                  </div>
                  <p className="fw-semibold text-dark mb-1">No students linked yet</p>
                  <p className="small text-muted mb-3">
                    Send a linking request in Feedback so Admin Staff can connect your child&apos;s account.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm rounded-3 px-3 fw-semibold"
                    onClick={handleGoToFeedbackForLinking}
                  >
                    Link Student Now
                  </button>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {childrenList.map((child) => {
                    const isMenuOpen = openChildMenuId === child.id;
                    return (
                      <div
                        key={child.id}
                        className="d-flex align-items-center justify-content-between gap-3 p-3 rounded-4"
                        style={{
                          background: 'var(--et-surface)',
                          border: '1px solid var(--et-border)',
                        }}
                      >
                        <div className="d-flex align-items-center gap-3 min-w-0">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                            style={{
                              width: '42px',
                              height: '42px',
                              background: 'var(--et-mint)',
                              color: 'var(--et-primary)',
                              border: '1px solid var(--et-border)',
                              fontSize: '14px',
                            }}
                          >
                            {child.avatar || getInitials(child.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="fw-bold text-dark text-break">{child.name}</div>
                            <div className="small" style={{ color: 'var(--et-muted)' }}>
                              Code: <strong>{child.code}</strong> · {child.grade}
                            </div>
                            {child.school && (
                              <div className="small text-break" style={{ color: 'var(--et-muted)' }}>
                                {child.school}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="position-relative flex-shrink-0" data-child-menu="true">
                          <button
                            type="button"
                            className="btn btn-sm rounded-3 d-inline-flex align-items-center justify-content-center"
                            style={{
                              width: '34px',
                              height: '34px',
                              background: isMenuOpen ? 'var(--et-mint)' : 'var(--et-card)',
                              color: isMenuOpen ? 'var(--et-primary)' : 'var(--et-heading)',
                              border: '1px solid var(--et-border)',
                            }}
                            onClick={() => setOpenChildMenuId((prev) => (prev === child.id ? null : child.id))}
                            aria-label={`Actions for ${child.name}`}
                            aria-haspopup="menu"
                            aria-expanded={isMenuOpen}
                          >
                            <i className="bi bi-three-dots-vertical" />
                          </button>

                          {isMenuOpen && (
                            <div
                              className="dropdown-menu show end-0 mt-1 py-1 rounded-3"
                              style={{
                                minWidth: '164px',
                                border: '1px solid var(--et-border)',
                                boxShadow: 'var(--et-shadow)',
                              }}
                              role="menu"
                            >
                              <button
                                type="button"
                                className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 small fw-medium"
                                role="menuitem"
                                onClick={() => {
                                  setOpenChildMenuId(null);
                                  handleOpenChildSection(child.id, '/parent/schedule');
                                }}
                              >
                                <i className="bi bi-calendar3 text-primary" />
                                <span>Schedule</span>
                              </button>
                              <button
                                type="button"
                                className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 small fw-medium"
                                role="menuitem"
                                onClick={() => {
                                  setOpenChildMenuId(null);
                                  handleOpenChildSection(child.id, '/parent/tuition');
                                }}
                              >
                                <i className="bi bi-receipt text-primary" />
                                <span>Tuition</span>
                              </button>
                              <button
                                type="button"
                                className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 small fw-medium"
                                role="menuitem"
                                onClick={() => {
                                  setOpenChildMenuId(null);
                                  handleOpenChildSection(child.id, '/parent/progress');
                                }}
                              >
                                <i className="bi bi-graph-up text-primary" />
                                <span>Progress</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ParentProfilePage;
