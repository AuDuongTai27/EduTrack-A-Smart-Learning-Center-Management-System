import React from 'react';
import { Link } from 'react-router-dom';
import { useParent } from '../../../contexts/ParentContext';

/**
 * ParentEmptyState: Giao diện hiển thị khi Phụ huynh chưa có tài khoản liên kết nào.
 * Theo yêu cầu đặc tả: Không cho phép phụ huynh tự tìm học sinh để liên kết,
 * mà hướng dẫn phụ huynh gửi Feedback / Yêu cầu tới bộ phận Staff/Giáo vụ
 * để nhân viên đối soát hồ sơ và liên kết thủ công bằng tay.
 */
export function ParentEmptyState() {
  const { resetDemoChildren } = useParent();

  return (
    <main className="main-content">
      <div className="content-container py-4">
        {/* Banner Welcome / Empty State Header */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white">
          <div
            className="p-4 p-md-5 text-white position-relative"
            style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            }}
          >
            <div className="row align-items-center">
              <div className="col-lg-8">
                <span className="badge bg-white text-primary px-3 py-1.5 rounded-pill fw-bold mb-3">
                  <i className="bi bi-shield-check me-1"></i> EduTrack Parent Portal
                </span>
                <h1 className="display-6 fw-bold mb-2">
                  Welcome, Parents!
                </h1>
                <p className="fs-6 opacity-90 mb-4" style={{ maxWidth: '640px' }}>
                  Your account is currently not linked to any student profile.
                  To ensure information security and student data privacy, the system <strong>does not support manual search and open linking</strong>.
                  Please submit a feedback/request ticket so Admin Staff can verify and link the profile for you.
                </p>
                <div className="d-flex flex-wrap gap-2.5">
                  <Link
                    to="/parent/feedback"
                    className="btn btn-warning text-dark fw-bold px-4 py-2.5 rounded-3 shadow-sm d-flex align-items-center gap-2"
                  >
                    <i className="bi bi-chat-dots-fill"></i>
                    <span>Send Feedback to Request Profile Link</span>
                  </Link>
                  <button
                    type="button"
                    className="btn btn-outline-light px-3.5 py-2.5 rounded-3"
                    onClick={resetDemoChildren}
                    title="Restore demo data (2 students)"
                  >
                    <i className="bi bi-arrow-counterclockwise me-1"></i>
                    Restore Demo Data (2 Students)
                  </button>
                </div>
              </div>

              <div className="col-lg-4 d-none d-lg-flex justify-content-center">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center bg-white bg-opacity-10 text-white border border-white border-opacity-25"
                  style={{ width: '150px', height: '150px' }}
                >
                  <i className="bi bi-person-lines-fill fs-1" style={{ fontSize: '3.5rem' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quy trình giải quyết 4 bước rõ ràng */}
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
          <div className="text-center max-w-xl mx-auto mb-4">
            <span className="badge bg-primary-subtle text-primary fw-bold px-3 py-1.5 rounded-pill mb-2">
              Secure Process
            </span>
            <h2 className="h5 fw-bold text-dark">
              How to Connect Student Profiles with Parent Accounts
            </h2>
            <p className="text-secondary small mb-0">
              All link requests are received and processed directly by Admin Staff on the management system
            </p>
          </div>

          <div className="row g-3">
            {/* Bước 1 */}
            <div className="col-md-3">
              <div className="p-3 rounded-4 bg-light h-100 border text-center">
                <div
                  className="rounded-circle bg-primary text-white mx-auto d-flex align-items-center justify-content-center fw-bold mb-2.5"
                  style={{ width: '40px', height: '40px' }}
                >
                  1
                </div>
                <h3 className="h6 fw-bold text-dark mb-1">Submit Feedback Ticket</h3>
                <p className="small text-muted mb-0">
                  Parents provide child's Full Name, Date of Birth, School, and Contact Phone via the Feedback page.
                </p>
              </div>
            </div>

            {/* Bước 2 */}
            <div className="col-md-3">
              <div className="p-3 rounded-4 bg-light h-100 border text-center">
                <div
                  className="rounded-circle bg-primary text-white mx-auto d-flex align-items-center justify-content-center fw-bold mb-2.5"
                  style={{ width: '40px', height: '40px' }}
                >
                  2
                </div>
                <h3 className="h6 fw-bold text-dark mb-1">Admin Staff Verification</h3>
                <p className="small text-muted mb-0">
                  Admin Staff cross-checks against actual student enrollment records at the center.
                </p>
              </div>
            </div>

            {/* Bước 3 */}
            <div className="col-md-3">
              <div className="p-3 rounded-4 bg-light h-100 border text-center">
                <div
                  className="rounded-circle bg-primary text-white mx-auto d-flex align-items-center justify-content-center fw-bold mb-2.5"
                  style={{ width: '40px', height: '40px' }}
                >
                  3
                </div>
                <h3 className="h6 fw-bold text-dark mb-1">Processing & Response</h3>
                <p className="small text-muted mb-0">
                  Admin Staff manually activates the link and sends confirmation to parents.
                </p>
              </div>
            </div>

            {/* Bước 4 */}
            <div className="col-md-3">
              <div className="p-3 rounded-4 bg-light h-100 border text-center">
                <div
                  className="rounded-circle bg-success text-white mx-auto d-flex align-items-center justify-content-center fw-bold mb-2.5"
                  style={{ width: '40px', height: '40px' }}
                >
                  <i className="bi bi-check-lg"></i>
                </div>
                <h3 className="h6 fw-bold text-dark mb-1">Connection Completed</h3>
                <p className="small text-muted mb-0">
                  Child profile appears on the menu; parents can start viewing attendance and paying tuition.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-4 pt-2">
            <Link
              to="/parent/feedback"
              className="btn btn-primary px-4 py-2.5 rounded-3 fw-bold"
            >
              <i className="bi bi-send-fill me-1.5"></i>
              Go to Feedback Page & Send Request Now
            </Link>
          </div>
        </div>

        {/* Hotline Hỗ trợ Trực tiếp */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 p-3 bg-light rounded-4 border">
          <div className="d-flex align-items-center gap-2 text-muted small">
            <i className="bi bi-telephone-fill text-primary"></i>
            <span>Admin Staff quick support hotline: <strong>1900 6868</strong> (8:00 – 21:00 daily)</span>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-outline-secondary rounded-pill px-3"
            onClick={resetDemoChildren}
          >
            <i className="bi bi-arrow-counterclockwise me-1"></i>
            Restore 2 Sample Students (Demo)
          </button>
        </div>
      </div>
    </main>
  );
};

export default ParentEmptyState;
