import React, { useState } from 'react';
import { useParent } from '../../../contexts/ParentContext';

interface LinkStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'code' | 'request';
}

/**
 * Modal liên kết học sinh cho Phụ huynh với 2 Giải pháp (Solution 1 & 2):
 * - Tab 1 (Solution 1): Nhập mã học sinh được trung tâm cấp -> Thêm tức thì
 * - Tab 2 (Solution 2): Gửi phiếu yêu cầu đến Giáo vụ trung tâm -> Chờ phê duyệt 24h
 */
export function LinkStudentModal({
  isOpen,
  onClose,
  defaultTab = 'code',
}: LinkStudentModalProps) {
  const { linkStudentByCode, requestLinkStudent } = useParent();
  const [activeTab, setActiveTab] = useState<'code' | 'request'>(defaultTab);

  // Form State - Solution 1
  const [studentCode, setStudentCode] = useState('');
  const [studentDob, setStudentDob] = useState('');
  const [parentPhone, setParentPhone] = useState('0903 123 456');

  // Form State - Solution 2
  const [reqFullName, setReqFullName] = useState('');
  const [reqDob, setReqDob] = useState('');
  const [reqSchool, setReqSchool] = useState('');
  const [reqPhone, setReqPhone] = useState('0903 123 456');
  const [reqNote, setReqNote] = useState('');

  // Status State
  const [alert, setAlert] = useState<{
    type: 'success' | 'danger';
    message: string;
    ticketId?: string;
  } | null>(null);

  if (!isOpen) return null;

  // Xử lý gửi Solution 1
  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentCode.trim()) {
      setAlert({
        type: 'danger',
        message: 'Vui lòng nhập Mã học sinh (VD: HS-2026-003).',
      });
      return;
    }

    const result = linkStudentByCode(studentCode, studentDob, parentPhone);
    if (result.success) {
      setAlert({
        type: 'success',
        message: result.message,
      });
      setTimeout(() => {
        setAlert(null);
        setStudentCode('');
        setStudentDob('');
        onClose();
      }, 1500);
    } else {
      setAlert({
        type: 'danger',
        message: result.message,
      });
    }
  };

  // Xử lý gửi Solution 2
  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqFullName.trim() || !reqDob.trim()) {
      setAlert({
        type: 'danger',
        message: 'Vui lòng nhập đầy đủ Họ tên và Ngày sinh của học sinh.',
      });
      return;
    }

    const result = requestLinkStudent(
      reqFullName,
      reqDob,
      reqSchool,
      reqPhone,
      reqNote
    );
    setAlert({
      type: 'success',
      message: result.message,
      ticketId: result.ticketId,
    });
    setTimeout(() => {
      setAlert(null);
      setReqFullName('');
      setReqDob('');
      setReqSchool('');
      setReqNote('');
      onClose();
    }, 2500);
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content shadow-lg border-0 rounded-4 overflow-hidden">
          {/* Header */}
          <div className="modal-header bg-light border-bottom px-4 py-3">
            <div className="d-flex align-items-center gap-2">
              <div
                className="d-flex align-items-center justify-content-center rounded-3 bg-primary text-white"
                style={{ width: '38px', height: '38px' }}
              >
                <i className="bi bi-person-plus-fill fs-5"></i>
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0 text-dark">
                  Liên kết hồ sơ học sinh
                </h5>
                <small className="text-muted">
                  Chọn phương thức kết nối thuận tiện nhất cho bạn
                </small>
              </div>
            </div>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>

          {/* Navigation Tabs (2 Solutions) */}
          <div className="px-4 pt-3 border-bottom bg-white">
            <ul className="nav nav-pills nav-fill gap-2">
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link py-2.5 px-3 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2 ${
                    activeTab === 'code'
                      ? 'active bg-primary text-white shadow-sm'
                      : 'text-secondary bg-light'
                  }`}
                  onClick={() => {
                    setActiveTab('code');
                    setAlert(null);
                  }}
                >
                  <i className="bi bi-upc-scan fs-5"></i>
                  <span>Cách 1: Nhập Mã học sinh (Tức thì)</span>
                </button>
              </li>
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link py-2.5 px-3 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2 ${
                    activeTab === 'request'
                      ? 'active bg-primary text-white shadow-sm'
                      : 'text-secondary bg-light'
                  }`}
                  onClick={() => {
                    setActiveTab('request');
                    setAlert(null);
                  }}
                >
                  <i className="bi bi-headset fs-5"></i>
                  <span>Cách 2: Gửi yêu cầu tới Trung tâm</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Body */}
          <div className="modal-body p-4">
            {/* Alert Notification */}
            {alert && (
              <div
                className={`alert alert-${alert.type} d-flex align-items-center gap-2 rounded-3 mb-4`}
              >
                <i
                  className={`bi ${
                    alert.type === 'success'
                      ? 'bi-check-circle-fill text-success'
                      : 'bi-exclamation-triangle-fill text-danger'
                  } fs-5`}
                ></i>
                <div className="flex-grow-1">
                  <div>{alert.message}</div>
                  {alert.ticketId && (
                    <small className="text-muted d-block mt-1">
                      Mã phiếu hỗ trợ: <strong>#{alert.ticketId}</strong>. Bạn
                      có thể tra cứu tình trạng phiếu với Giáo vụ.
                    </small>
                  )}
                </div>
              </div>
            )}

            {/* TAB 1: Solution 1 - Mã học sinh */}
            {activeTab === 'code' && (
              <form onSubmit={handleCodeSubmit}>
                <div className="bg-light p-3 rounded-3 mb-3 border">
                  <div className="d-flex align-items-center gap-2 text-primary fw-semibold mb-1">
                    <i className="bi bi-lightning-charge-fill"></i>
                    <span>Liên kết tức thì trong 3 giây</span>
                  </div>
                  <p className="small text-muted mb-0">
                    Phù hợp khi bạn đã có Mã học sinh được in trên <strong>Thẻ học viên</strong>, hóa đơn học phí hoặc phiếu báo điểm từ EduTrack.
                  </p>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold text-secondary">
                    Mã học sinh <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <i className="bi bi-qr-code"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="VD: HS-2026-003 hoặc HS2026001"
                      value={studentCode}
                      onChange={(e) => setStudentCode(e.target.value)}
                      required
                    />
                  </div>
                  <small className="text-muted">
                    Gợi ý thử nghiệm: Gõ <code>HS-2026-003</code> hoặc bất kỳ mã học sinh nào.
                  </small>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-secondary">
                      Ngày sinh học sinh
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={studentDob}
                      onChange={(e) => setStudentDob(e.target.value)}
                    />
                    <small className="text-muted">Dùng để xác thực mối quan hệ</small>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-secondary">
                      Số điện thoại phụ huynh đăng ký
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 pt-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4"
                    onClick={onClose}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary px-4 fw-semibold">
                    <i className="bi bi-link-45deg me-1"></i>
                    Xác nhận liên kết
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: Solution 2 - Gửi yêu cầu tới Trung tâm */}
            {activeTab === 'request' && (
              <form onSubmit={handleRequestSubmit}>
                <div className="bg-light p-3 rounded-3 mb-3 border">
                  <div className="d-flex align-items-center gap-2 text-primary fw-semibold mb-1">
                    <i className="bi bi-shield-check"></i>
                    <span>Dành cho phụ huynh chưa có hoặc quên Mã học sinh</span>
                  </div>
                  <p className="small text-muted mb-0">
                    Bạn chỉ cần cung cấp thông tin cơ bản của học sinh, bộ phận Giáo vụ EduTrack sẽ đối chiếu với cơ sở dữ liệu và kích hoạt liên kết cho bạn trong vòng 24 giờ.
                  </p>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-7">
                    <label className="form-label fw-semibold text-secondary">
                      Họ và tên học sinh <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="VD: Nguyễn Đăng Khoa"
                      value={reqFullName}
                      onChange={(e) => setReqFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-5">
                    <label className="form-label fw-semibold text-secondary">
                      Ngày tháng năm sinh <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={reqDob}
                      onChange={(e) => setReqDob(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-secondary">
                      Trường phổ thông đang theo học
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="VD: THPT Chu Văn An"
                      value={reqSchool}
                      onChange={(e) => setReqSchool(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-secondary">
                      Số điện thoại phụ huynh nhận phản hồi <span className="text-danger">*</span>
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      value={reqPhone}
                      onChange={(e) => setReqPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold text-secondary">
                    Ghi chú / Lớp học đang quan tâm
                  </label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="VD: Cháu đang học lớp Toán thầy An chiều thứ 2-4-6..."
                    value={reqNote}
                    onChange={(e) => setReqNote(e.target.value)}
                  ></textarea>
                </div>

                <div className="d-flex justify-content-end gap-2 pt-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4"
                    onClick={onClose}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary px-4 fw-semibold">
                    <i className="bi bi-send-fill me-1"></i>
                    Gửi yêu cầu tới Trung tâm
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkStudentModal;
