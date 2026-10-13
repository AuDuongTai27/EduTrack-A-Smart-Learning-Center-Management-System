import React from 'react';
import { Link } from 'react-router-dom';
import { useParent } from '../../../contexts/ParentContext';

/**
 * ParentEmptyState: Giao diện hiển thị khi Phụ huynh chưa có tài khoản liên kết nào.
 * Theo yêu cầu đặc tả: Không cho phép phụ huynh tự tìm học sinh để liên kết,
 * mà hướng dẫn phụ huynh gửi Feedback / Yêu cầu tới bộ phận Staff/Giáo vụ
 * để nhân viên đối soát hồ sơ và liên kết thủ công bằng tay.
 */
export const ParentEmptyState: React.FC = () => {
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
                  <i className="bi bi-shield-check me-1"></i> Cổng thông tin Phụ huynh EduTrack
                </span>
                <h1 className="display-6 fw-bold mb-2">
                  Chào mừng Quý Phụ huynh!
                </h1>
                <p className="fs-6 opacity-90 mb-4" style={{ maxWidth: '640px' }}>
                  Tài khoản của bạn hiện tại chưa được liên kết với hồ sơ học sinh nào.
                  Để đảm bảo an toàn thông tin và bảo mật dữ liệu học viên, hệ thống <strong>không hỗ trợ tự tìm kiếm và liên kết tự do</strong>.
                  Quý phụ huynh vui lòng gửi phiếu phản hồi/yêu cầu để bộ phận Giáo vụ đối soát và liên kết giúp bạn.
                </p>
                <div className="d-flex flex-wrap gap-2.5">
                  <Link
                    to="/parent/feedback"
                    className="btn btn-warning text-dark fw-bold px-4 py-2.5 rounded-3 shadow-sm d-flex align-items-center gap-2"
                  >
                    <i className="bi bi-chat-dots-fill"></i>
                    <span>Gửi phản hồi yêu cầu liên kết hồ sơ</span>
                  </Link>
                  <button
                    type="button"
                    className="btn btn-outline-light px-3.5 py-2.5 rounded-3"
                    onClick={resetDemoChildren}
                    title="Khôi phục dữ liệu demo 2 học sinh"
                  >
                    <i className="bi bi-arrow-counterclockwise me-1"></i>
                    Khôi phục dữ liệu Demo (2 HS)
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
              Quy trình an toàn
            </span>
            <h2 className="h5 fw-bold text-dark">
              Cách thức kết nối hồ sơ học sinh với tài khoản Phụ huynh
            </h2>
            <p className="text-secondary small mb-0">
              Mọi hồ sơ liên kết đều được nhân viên Giáo vụ tiếp nhận và giải quyết trực tiếp trên hệ thống quản lý
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
                <h3 className="h6 fw-bold text-dark mb-1">Gửi phiếu Feedback</h3>
                <p className="small text-muted mb-0">
                  Phụ huynh điền Họ tên con, Ngày sinh, Trường học và SĐT liên hệ qua trang Phản hồi.
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
                <h3 className="h6 fw-bold text-dark mb-1">Giáo vụ đối soát</h3>
                <p className="small text-muted mb-0">
                  Nhân viên Staff kiểm tra đối chiếu với danh sách học viên đăng ký thực tế tại trung tâm.
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
                <h3 className="h6 fw-bold text-dark mb-1">Xử lý & Phản hồi</h3>
                <p className="small text-muted mb-0">
                  Giáo vụ kích hoạt liên kết tay và gửi phản hồi xác nhận tới Quý phụ huynh.
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
                <h3 className="h6 fw-bold text-dark mb-1">Hoàn tất kết nối</h3>
                <p className="small text-muted mb-0">
                  Hồ sơ con hiển thị trên thanh menu, phụ huynh bắt đầu xem điểm danh và đóng học phí.
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
              Đi tới trang Phản hồi & Gửi yêu cầu ngay
            </Link>
          </div>
        </div>

        {/* Hotline Hỗ trợ Trực tiếp */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 p-3 bg-light rounded-4 border">
          <div className="d-flex align-items-center gap-2 text-muted small">
            <i className="bi bi-telephone-fill text-primary"></i>
            <span>Hotline Giáo vụ hỗ trợ nhanh: <strong>1900 6868</strong> (8:00 – 21:00 hàng ngày)</span>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-outline-secondary rounded-pill px-3"
            onClick={resetDemoChildren}
          >
            <i className="bi bi-arrow-counterclockwise me-1"></i>
            Khôi phục 2 học sinh mẫu (Demo)
          </button>
        </div>
      </div>
    </main>
  );
};

export default ParentEmptyState;
