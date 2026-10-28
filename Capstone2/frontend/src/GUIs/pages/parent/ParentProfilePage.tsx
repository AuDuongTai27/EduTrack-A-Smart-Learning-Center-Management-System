import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParent } from '../../../contexts/ParentContext';
import { learningDAL } from '../../../DAL/learningDAL';
import { DEFAULT_PARENT_ID } from '../../../DAL/parentDAL';

export function ParentProfilePage() {
  const navigate = useNavigate();
  const { childrenList, resetDemoChildren, setDemoEmptyState } = useParent();
  const [isEditing, setIsEditing] = useState(false);

  // Thông tin phụ huynh
  const [parentInfo, setParentInfo] = useState({
    fullName: 'Lê Văn Nam',
    phone: '0981 112 233',
    email: 'nam.le@example.com',
    address: 'Số 45, Đường Lê Văn Lương, Cầu Giấy, Hà Nội',
    identityCard: '001085012345',
    relationship: 'Phụ huynh',
  });

  const [formData, setFormData] = useState(parentInfo);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    document.title = 'Hồ sơ phụ huynh – EduTrack';
    let isMounted = true;

    async function loadParentProfile() {
      try {
        const dto = await learningDAL.getParentProfile(DEFAULT_PARENT_ID);
        if (isMounted && dto) {
          const info = {
            fullName: dto.fullName || 'Lê Văn Nam',
            phone: dto.phone || '0981 112 233',
            email: dto.email || 'nam.le@example.com',
            address: dto.address || 'Số 45, Đường Lê Văn Lương, Cầu Giấy, Hà Nội',
            identityCard: dto.identityCard || '001085012345',
            relationship: dto.relationship || 'Phụ huynh',
          };
          setParentInfo(info);
          setFormData(info);
        }
      } catch (err) {
        console.warn('Lỗi khi tải hồ sơ phụ huynh:', err);
      }
    }

    loadParentProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async () => {
    try {
      const updated = await learningDAL.updateParentProfile(
        {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
        },
        DEFAULT_PARENT_ID
      );
      const nextInfo = {
        fullName: updated.fullName || formData.fullName,
        phone: updated.phone || formData.phone,
        email: updated.email || formData.email,
        address: updated.address || formData.address,
        identityCard: formData.identityCard,
        relationship: formData.relationship,
      };
      setParentInfo(nextInfo);
      setFormData(nextInfo);
    } catch (err) {
      console.warn('Không kết nối được Backend khi lưu hồ sơ phụ huynh, cập nhật tạm trên UI:', err);
      setParentInfo(formData);
    }
    setIsEditing(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleGoToFeedbackForLinking = () => {
    navigate('/parent/feedback?type=link_student');
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
                  VN
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
                  onClick={handleGoToFeedbackForLinking}
                  title="Chuyển đến trang Phản hồi để gửi yêu cầu liên kết con tới Admin Staff"
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
                    onClick={handleGoToFeedbackForLinking}
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
    </main>
  );
}

export default ParentProfilePage;
