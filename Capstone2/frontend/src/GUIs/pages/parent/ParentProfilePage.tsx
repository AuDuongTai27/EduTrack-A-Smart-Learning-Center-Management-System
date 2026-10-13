import React, { useState } from 'react';
import { useParent } from '../../context/ParentContext';
import { LinkStudentModal } from '../../components/parent/LinkStudentModal';

export const ParentProfilePage: React.FC = () => {
  const { childrenList, resetDemoChildren, setDemoEmptyState } = useParent();
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Thông tin phụ huynh
  const [parentInfo, setParentInfo] = useState({
    fullName: 'Nguyễn Văn Bình',
    phone: '0903 123 456',
    email: 'binh.nguyen@example.com',
    address: 'Số 45, Đường Lê Văn Lương, Cầu Giấy, Hà Nội',
    identityCard: '001085012345',
    relationship: 'Bố',
  });

  const [formData, setFormData] = useState(parentInfo);
  const [showToast, setShowToast] = useState(false);

  const handleSave = () => {
    setParentInfo(formData);
    setIsEditing(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <main className="main-content">
      <div className="content-container profile-container">
        {/* Header */}
        <div className="page-header d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <h1 className="page-title mb-1">Hồ sơ phụ huynh</h1>
            <p className="page-subtitle text-muted mb-0">
              Quản lý thông tin liên hệ và các hồ sơ học sinh đã liên kết
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            {!isEditing ? (
              <button
                type="button"
                className="btn btn-primary rounded-pill px-3 py-1.5 fw-semibold d-flex align-items-center gap-1.5"
                onClick={() => {
                  setFormData(parentInfo);
                  setIsEditing(true);
                }}
              >
                <i className="bi bi-pencil-square"></i>
                <span>Chỉnh sửa thông tin</span>
              </button>
            ) : (
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-3"
                  onClick={() => setIsEditing(false)}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-success rounded-pill px-3 fw-semibold"
                  onClick={handleSave}
                >
                  <i className="bi bi-check-lg me-1"></i> Lưu thay đổi
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Thông báo cập nhật */}
        {showToast && (
          <div className="alert alert-success border-0 rounded-4 shadow-sm d-flex align-items-center gap-2 mb-4">
            <i className="bi bi-check-circle-fill fs-5"></i>
            <span>Đã cập nhật thông tin phụ huynh thành công!</span>
          </div>
        )}

        <div className="row g-4">
          {/* Card Thông tin Phụ huynh */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
              <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold fs-4"
                  style={{
                    width: '64px',
                    height: '64px',
                    background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                  }}
                >
                  VB
                </div>
                <div>
                  <h3 className="h5 fw-bold text-dark mb-1">{parentInfo.fullName}</h3>
                  <div className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill">
                    Phụ huynh học sinh · {parentInfo.relationship}
                  </div>
                </div>
              </div>

              {!isEditing ? (
                <div className="d-flex flex-column gap-3">
                  <div>
                    <span className="small text-muted d-block">Số điện thoại liên hệ</span>
                    <strong className="text-dark">{parentInfo.phone}</strong>
                  </div>
                  <div>
                    <span className="small text-muted d-block">Email</span>
                    <strong className="text-dark">{parentInfo.email}</strong>
                  </div>
                  <div>
                    <span className="small text-muted d-block">Số CCCD / CMND</span>
                    <strong className="text-dark">{parentInfo.identityCard}</strong>
                  </div>
                  <div>
                    <span className="small text-muted d-block">Địa chỉ liên hệ</span>
                    <strong className="text-dark">{parentInfo.address}</strong>
                  </div>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  <div>
                    <label className="form-label small fw-semibold text-secondary">Họ và tên</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label small fw-semibold text-secondary">Số điện thoại</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label small fw-semibold text-secondary">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label small fw-semibold text-secondary">Địa chỉ</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card Danh Sách Con Đã Liên Kết */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
              <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
                <div>
                  <h3 className="h6 fw-bold text-dark mb-1">
                    <i className="bi bi-people-fill text-primary me-2"></i>
                    Hồ sơ các con ({childrenList.length})
                  </h3>
                  <small className="text-muted">Các học sinh được liên kết với tài khoản này</small>
                </div>

                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary rounded-pill px-3"
                  onClick={() => setModalOpen(true)}
                >
                  <i className="bi bi-plus-lg me-1"></i> Thêm con
                </button>
              </div>

              {childrenList.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <p>Chưa có học sinh nào được liên kết.</p>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm rounded-pill px-3"
                    onClick={() => setModalOpen(true)}
                  >
                    Liên kết học sinh ngay
                  </button>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3 mb-4">
                  {childrenList.map((child) => (
                    <div
                      key={child.id}
                      className="d-flex align-items-center justify-content-between p-3 rounded-4 bg-light border"
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                          style={{
                            width: '42px',
                            height: '42px',
                            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                            fontSize: '14px',
                          }}
                        >
                          {child.avatar}
                        </div>
                        <div>
                          <div className="fw-bold text-dark">{child.name}</div>
                          <div className="small text-muted">
                            Mã: <strong>{child.code}</strong> · {child.grade}
                          </div>
                          <div className="small text-secondary">{child.school}</div>
                        </div>
                      </div>

                      <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill">
                        Đang theo học
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Hỗ trợ tiện ích kiểm thử demo */}
              <div className="mt-auto pt-3 border-top d-flex gap-2 justify-content-end">
                <button
                  type="button"
                  className="btn btn-xs btn-outline-secondary rounded-pill px-2.5 py-1 small"
                  style={{ fontSize: '11px' }}
                  onClick={resetDemoChildren}
                >
                  <i className="bi bi-arrow-counterclockwise me-1"></i> Khôi phục dữ liệu mẫu
                </button>
                <button
                  type="button"
                  className="btn btn-xs btn-outline-danger rounded-pill px-2.5 py-1 small"
                  style={{ fontSize: '11px' }}
                  onClick={setDemoEmptyState}
                >
                  <i className="bi bi-trash me-1"></i> Thử nghiệm 0 học sinh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LinkStudentModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </main>
  );
};

export default ParentProfilePage;
