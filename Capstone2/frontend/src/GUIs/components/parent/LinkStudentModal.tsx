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
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentCode.trim()) {
      setAlert({
        type: 'danger',
        message: 'Please enter Student Code (e.g., HS-2026-003).',
      });
      return;
    }

    const result = await linkStudentByCode(studentCode, studentDob, parentPhone);
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
  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqFullName.trim() || !reqDob.trim()) {
      setAlert({
        type: 'danger',
        message: 'Please enter both Student Full Name and Date of Birth.',
      });
      return;
    }

    const result = await requestLinkStudent(
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
                  Link Student Profile
                </h5>
                <small className="text-muted">
                  Choose the most convenient connection method for you
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
                  <span>Method 1: Enter Student Code (Instant)</span>
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
                  <span>Method 2: Send Request to Center</span>
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
                      Support ticket ID: <strong>#{alert.ticketId}</strong>. You
                      can check ticket status with Admin Staff.
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
                    <span>Instant link in 3 seconds</span>
                  </div>
                  <p className="small text-muted mb-0">
                    Suitable if you already have the Student Code printed on the <strong>Student Card</strong>, tuition invoice, or report card from EduTrack.
                  </p>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold text-secondary">
                    Student Code <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <i className="bi bi-qr-code"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., HS-2026-003 or HS2026001"
                      value={studentCode}
                      onChange={(e) => setStudentCode(e.target.value)}
                      required
                    />
                  </div>
                  <small className="text-muted">
                    Test suggestion: Type <code>HS-2026-003</code> or any student code.
                  </small>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-secondary">
                      Student Date of Birth
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={studentDob}
                      onChange={(e) => setStudentDob(e.target.value)}
                    />
                    <small className="text-muted">Used to verify relationship</small>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-secondary">
                      Registered Parent Phone Number
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
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary px-4 fw-semibold">
                    <i className="bi bi-link-45deg me-1"></i>
                    Confirm Link
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
                    <span>For parents who do not have or forgot the Student Code</span>
                  </div>
                  <p className="small text-muted mb-0">
                    You only need to provide basic student information; EduTrack Admin Staff will verify it against the database and activate the link for you within 24 hours.
                  </p>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-7">
                    <label className="form-label fw-semibold text-secondary">
                      Student Full Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., Nguyen Dang Khoa"
                      value={reqFullName}
                      onChange={(e) => setReqFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-5">
                    <label className="form-label fw-semibold text-secondary">
                      Date of Birth <span className="text-danger">*</span>
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
                      Current School
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., Chu Van An High School"
                      value={reqSchool}
                      onChange={(e) => setReqSchool(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-secondary">
                      Parent Contact Phone Number <span className="text-danger">*</span>
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
                    Notes / Interested Classes
                  </label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="e.g., The student is attending Mr. An's Math class on Mon-Wed-Fri afternoon..."
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
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary px-4 fw-semibold">
                    <i className="bi bi-send-fill me-1"></i>
                    Send Request to Center
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
