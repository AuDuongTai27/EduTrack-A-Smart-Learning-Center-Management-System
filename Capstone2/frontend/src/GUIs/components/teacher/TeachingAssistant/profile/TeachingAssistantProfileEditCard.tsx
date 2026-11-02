import React, { useState } from 'react';
import type { TeacherProfileDto, UpdateTeacherProfilePayload } from '../../../../../BLL/models/teaching/TeachingProfileDto';

export interface TeachingAssistantProfileEditCardProps {
  profile: TeacherProfileDto;
  isSaving?: boolean;
  onSave: (payload: UpdateTeacherProfilePayload) => void | Promise<void>;
  onCancel: () => void;
}

const PRESET_AVATARS = [
  { label: 'Avatar TA', url: '/assets/img/profiles/avatar-27.jpg' },
  { label: 'Trainer 1', url: '/assets/img/trainer-1.jpg' },
  { label: 'Trainer 2', url: '/assets/img/trainer-2.jpg' },
  { label: 'Trainer 3', url: '/assets/img/trainer-3.jpg' },
];

export function TeachingAssistantProfileEditCard({
  profile,
  isSaving = false,
  onSave,
  onCancel,
}: TeachingAssistantProfileEditCardProps) {
  const [fullName, setFullName] = useState(profile.fullName || '');
  const [dateOfBirth, setDateOfBirth] = useState(() => {
    if (!profile.dateOfBirth) return '';
    if (profile.dateOfBirth.includes('-')) return profile.dateOfBirth.slice(0, 10);
    const parts = profile.dateOfBirth.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return profile.dateOfBirth;
  });
  const [gender, setGender] = useState(profile.gender || 'Nam');
  const [specialty, setSpecialty] = useState(profile.specialty || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [email, setEmail] = useState(profile.email || '');
  const [address, setAddress] = useState(profile.address || '123 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || '/assets/img/profiles/avatar-27.jpg');
  const [customAvatarInput, setCustomAvatarInput] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setValidationError('Họ và tên không được để trống.');
      return;
    }
    if (!email.trim()) {
      setValidationError('Email liên hệ không được để trống.');
      return;
    }
    if (!phone.trim()) {
      setValidationError('Số điện thoại không được để trống.');
      return;
    }

    setValidationError(null);
    onSave({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      dateOfBirth,
      gender,
      specialty: specialty.trim(),
      address: address.trim(),
      avatarUrl: avatarUrl.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-3 p-4 bg-white shadow-sm">
      <div className="d-flex align-items-center justify-content-between pb-3 mb-4 border-bottom">
        <div>
          <h5 className="mb-1 text-dark fw-bold">
            <i className="bi bi-pencil-square text-primary me-2" />
            Chỉnh sửa thông tin Trợ giảng
          </h5>
          <p className="text-muted small mb-0">
            Cập nhật thông tin cá nhân và tài khoản hỗ trợ giảng dạy của bạn trên hệ thống EduTrack.
          </p>
        </div>
        <span className="badge bg-warning-subtle text-warning-emphasis border border-warning px-3 py-2">
          <i className="bi bi-pencil-fill me-1" /> Đang chỉnh sửa
        </span>
      </div>

      {validationError && (
        <div className="alert alert-danger py-2 px-3 mb-4 d-flex align-items-center gap-2" role="alert">
          <i className="bi bi-exclamation-triangle-fill flex-shrink-0" />
          <div>{validationError}</div>
        </div>
      )}

      {/* Avatar Section */}
      <div className="card bg-light border-0 p-3 mb-4 rounded-3">
        <label className="form-label fw-bold text-dark small mb-2">
          <i className="bi bi-person-bounding-box me-1 text-primary" />
          Ảnh đại diện
        </label>
        <div className="d-flex flex-wrap align-items-center gap-4">
          <img
            src={avatarUrl}
            alt={fullName}
            className="rounded-circle border border-2 border-primary"
            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/img/profiles/avatar-27.jpg';
            }}
          />
          <div className="flex-grow-1">
            <div className="small text-muted mb-2">Chọn ảnh có sẵn hoặc nhập link ảnh trực tiếp:</div>
            <div className="d-flex flex-wrap gap-2 mb-2">
              {PRESET_AVATARS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setAvatarUrl(item.url);
                    setCustomAvatarInput(false);
                  }}
                  className={`btn btn-sm d-flex align-items-center gap-1.5 ${
                    avatarUrl === item.url ? 'btn-primary' : 'btn-outline-secondary'
                  }`}
                >
                  <img
                    src={item.url}
                    alt={item.label}
                    className="rounded-circle"
                    style={{ width: '20px', height: '20px', objectFit: 'cover' }}
                  />
                  <span>{item.label}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCustomAvatarInput(!customAvatarInput)}
                className={`btn btn-sm ${customAvatarInput ? 'btn-secondary' : 'btn-outline-secondary'}`}
              >
                <i className="bi bi-link-45deg me-1" />
                Nhập link tùy chọn
              </button>
            </div>
            {customAvatarInput && (
              <div className="input-group input-group-sm mt-2">
                <span className="input-group-text bg-white">
                  <i className="bi bi-image" />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="https://... hoặc /assets/img/..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid Fields */}
      <div className="row g-3 mb-4">
        {/* Full Name */}
        <div className="col-md-6">
          <label className="form-label fw-bold text-dark small" htmlFor="ta-edit-fullName">
            Họ và tên <span className="text-danger">*</span>
          </label>
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <i className="bi bi-person text-primary" />
            </span>
            <input
              id="ta-edit-fullName"
              type="text"
              className="form-control border-start-0 ps-0"
              placeholder="Nhập họ và tên đầy đủ"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Specialty */}
        <div className="col-md-6">
          <label className="form-label fw-bold text-dark small" htmlFor="ta-edit-specialty">
            Chuyên môn / Hỗ trợ bộ môn
          </label>
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <i className="bi bi-mortarboard text-primary" />
            </span>
            <input
              id="ta-edit-specialty"
              type="text"
              className="form-control border-start-0 ps-0"
              placeholder="Ví dụ: Trợ giảng Toán & Khoa học"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
            />
          </div>
        </div>

        {/* Date of Birth */}
        <div className="col-md-6">
          <label className="form-label fw-bold text-dark small" htmlFor="ta-edit-dob">
            Ngày sinh
          </label>
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <i className="bi bi-calendar-event text-primary" />
            </span>
            <input
              id="ta-edit-dob"
              type="date"
              className="form-control border-start-0 ps-0"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </div>
        </div>

        {/* Gender */}
        <div className="col-md-6">
          <label className="form-label fw-bold text-dark small" htmlFor="ta-edit-gender">
            Giới tính
          </label>
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <i className="bi bi-gender-ambiguous text-primary" />
            </span>
            <select
              id="ta-edit-gender"
              className="form-select border-start-0 ps-0"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
        </div>

        {/* Phone */}
        <div className="col-md-6">
          <label className="form-label fw-bold text-dark small" htmlFor="ta-edit-phone">
            Số điện thoại <span className="text-danger">*</span>
          </label>
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <i className="bi bi-telephone text-primary" />
            </span>
            <input
              id="ta-edit-phone"
              type="tel"
              className="form-control border-start-0 ps-0"
              placeholder="0912345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className="col-md-6">
          <label className="form-label fw-bold text-dark small" htmlFor="ta-edit-email">
            Email liên hệ <span className="text-danger">*</span>
          </label>
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <i className="bi bi-envelope text-primary" />
            </span>
            <input
              id="ta-edit-email"
              type="email"
              className="form-control border-start-0 ps-0"
              placeholder="name@edutrack.edu.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Address */}
        <div className="col-12">
          <label className="form-label fw-bold text-dark small" htmlFor="ta-edit-address">
            Địa chỉ công tác / liên lạc
          </label>
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <i className="bi bi-geo-alt text-primary" />
            </span>
            <input
              id="ta-edit-address"
              type="text"
              className="form-control border-start-0 ps-0"
              placeholder="123 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* System Controlled Fields Notice */}
      <div className="p-3 bg-light rounded-3 border mb-4">
        <div className="d-flex align-items-center gap-2 mb-2 text-primary fw-semibold small">
          <i className="bi bi-shield-lock-fill" />
          <span>Thông tin do hệ thống quản trị EduTrack quản lý</span>
        </div>
        <div className="row g-2 text-muted small">
          <div className="col-md-4">
            <span className="me-1">Mã cán bộ:</span>
            <strong className="badge bg-secondary-subtle text-secondary-emphasis">#{profile.userCode}</strong>
          </div>
          <div className="col-md-4">
            <span className="me-1">Vai trò hệ thống:</span>
            <strong className="badge bg-primary-subtle text-primary">{profile.roleTitle || profile.role}</strong>
          </div>
          <div className="col-md-4">
            <span className="me-1">Ngày tham gia:</span>
            <strong className="text-dark">{profile.enrolledSince || '15/08/2023'}</strong>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="d-flex justify-content-end align-items-center gap-2 pt-3 border-top">
        <button
          type="button"
          className="btn btn-outline-secondary px-4 d-inline-flex align-items-center gap-2"
          onClick={onCancel}
          disabled={isSaving}
        >
          <i className="bi bi-x-lg" /> Hủy
        </button>
        <button
          type="submit"
          className="btn btn-primary px-4 d-inline-flex align-items-center gap-2"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
              <span>Đang lưu...</span>
            </>
          ) : (
            <>
              <i className="bi bi-check-lg fs-6" />
              <span>Lưu thay đổi</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default TeachingAssistantProfileEditCard;

