import React, { useState } from 'react';
import { useParent } from '../../context/ParentContext';
import { LinkStudentModal } from './LinkStudentModal';

/**
 * ParentEmptyState: Giao diện hiển thị khi Phụ huynh chưa có hoặc chưa liên kết học sinh nào.
 * Cung cấp 2 Giải pháp (Solution 1 & Solution 2) trực tiếp trên trang để phụ huynh lựa chọn:
 * - Cách 1: Nhập Mã học sinh (Liên kết tức thì)
 * - Cách 2: Gửi yêu cầu tới Trung tâm (Dành cho phụ huynh chưa có mã)
 */
export const ParentEmptyState: React.FC = () => {
  const { pendingRequests, resetDemoChildren } = useParent();
  const [modalOpen, setModalOpen] = useState(false);
  const [defaultTab, setDefaultTab] = useState<'code' | 'request'>('code');

  const openModalWithTab = (tab: 'code' | 'request') => {
    setDefaultTab(tab);
    setModalOpen(true);
  };

  return (
    <main className="main-content">
      <div className="content-container py-4">
        {/* Banner Welcome / Empty State Header */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white">
          <div
            className="p-4 p-md-5 text-white position-relative"
            style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            }}
          >
            <div className="row align-items-center">
              <div className="col-lg-8">
                <span className="badge bg-white text-primary px-3 py-2 rounded-pill fw-bold mb-3">
                  <i className="bi bi-people-fill me-1"></i> Cổng thông tin Phụ huynh EduTrack
                </span>
                <h1 className="display-6 fw-bold mb-2">
                  Chào mừng Quý Phụ huynh!
                </h1>
                <p className="fs-6 opacity-90 mb-4" style={{ maxWidth: '640px' }}>
                  Tài khoản của bạn hiện tại chưa được liên kết với hồ sơ học sinh nào.
                  Để bắt đầu theo dõi thời khóa biểu, điểm danh, kết quả học tập và đóng học phí trực tuyến cho con, vui lòng chọn một trong hai phương thức bên dưới.
                </p>
                <div className="d-flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn btn-warning text-dark fw-bold px-4 py-2 rounded-3 shadow-sm"
                    onClick={() => openModalWithTab('code')}
                  >
                    <i className="bi bi-upc-scan me-2"></i>
                    Nhập mã học sinh ngay
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-light px-4 py-2 rounded-3"
                    onClick={() => openModalWithTab('request')}
                  >
                    <i className="bi bi-headset me-2"></i>
                    Gửi yêu cầu tới Trung tâm
                  </button>
                </div>
              </div>
              <div className="col-lg-4 d-none d-lg-flex justify-content-center">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center bg-white bg-opacity-10 text-white border border-white border-opacity-25"
                  style={{ width: '160px', height: '160px' }}
                >
                  <i className="bi bi-mortarboard fs-1" style={{ fontSize: '4rem' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2 Lựa chọn / Solutions chi tiết */}
        <div className="row g-4 mb-5">
          {/* Solution 1: Nhập mã học sinh */}
          <div className="col-md-6">
            <div className="card h-100 border-0 shadow-sm rounded-4 p-4 bg-white transition-all hover-shadow">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary"
                  style={{ width: '52px', height: '52px' }}
                >
                  <i className="bi bi-lightning-charge-fill fs-3"></i>
                </div>
                <div>
                  <span className="badge bg-primary-subtle text-primary fw-bold mb-1">
                    Phương thức 1 (Khuyên dùng)
                  </span>
                  <h3 className="h5 fw-bold mb-0 text-dark">
                    Nhập Mã học sinh (Tức thì)
                  </h3>
                </div>
              </div>

              <p className="text-secondary mb-4 flex-grow-1">
                Nếu con bạn đã theo học tại EduTrack và bạn đã có <strong>Mã học sinh</strong> (in trên Thẻ học viên, hóa đơn học phí hoặc tin nhắn SMS từ trung tâm), hãy nhập mã cùng ngày sinh để kích hoạt liên kết tức thì.
              </p>

              <div className="bg-light p-3 rounded-3 mb-4 border">
                <div className="small fw-semibold text-secondary mb-1">Ưu điểm:</div>
                <ul className="small text-muted mb-0 ps-3">
                  <li>Xem được thời khóa biểu và lớp học của con ngay sau 3 giây.</li>
                  <li>Tự động đồng bộ hóa đơn học phí và lịch sử điểm danh.</li>
                  <li>Bảo mật cao bằng cơ chế xác thực ngày sinh học sinh.</li>
                </ul>
              </div>

              <button
                type="button"
                className="btn btn-primary w-100 py-2.5 rounded-3 fw-bold"
                onClick={() => openModalWithTab('code')}
              >
                <i className="bi bi-link-45deg me-1"></i>
                Liên kết bằng Mã học sinh
              </button>
            </div>
          </div>

          {/* Solution 2: Gửi phiếu hỗ trợ */}
          <div className="col-md-6">
            <div className="card h-100 border-0 shadow-sm rounded-4 p-4 bg-white transition-all hover-shadow">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success"
                  style={{ width: '52px', height: '52px' }}
                >
                  <i className="bi bi-file-earmark-person-fill fs-3"></i>
                </div>
                <div>
                  <span className="badge bg-success-subtle text-success fw-bold mb-1">
                    Phương thức 2
                  </span>
                  <h3 className="h5 fw-bold mb-0 text-dark">
                    Gửi yêu cầu tới Trung tâm
                  </h3>
                </div>
              </div>

              <p className="text-secondary mb-4 flex-grow-1">
                Dành cho Quý phụ huynh chưa có Mã học sinh hoặc mới đăng ký lần đầu. Bạn chỉ cần điền thông tin cơ bản của con, nhân viên Giáo vụ EduTrack sẽ đối soát dữ liệu và phê duyệt trong vòng 24 giờ.
              </p>

              <div className="bg-light p-3 rounded-3 mb-4 border">
                <div className="small fw-semibold text-secondary mb-1">Ưu điểm:</div>
                <ul className="small text-muted mb-0 ps-3">
                  <li>Không cần nhớ mã số hay lục tìm giấy tờ biên nhận.</li>
                  <li>Được nhân viên trung tâm hỗ trợ trực tiếp qua điện thoại.</li>
                  <li>Dễ dàng ghi chú các nhu cầu đặc biệt về xếp lớp hay học phí.</li>
                </ul>
              </div>

              <button
                type="button"
                className="btn btn-outline-success w-100 py-2.5 rounded-3 fw-bold"
                onClick={() => openModalWithTab('request')}
              >
                <i className="bi bi-send me-1"></i>
                Gửi phiếu yêu cầu liên kết
              </button>
            </div>
          </div>
        </div>

        {/* Danh sách yêu cầu đang chờ xử lý (nếu có) */}
        {pendingRequests.length > 0 && (
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h4 className="h6 fw-bold mb-0 text-dark">
                <i className="bi bi-clock-history text-warning me-2"></i>
                Yêu cầu liên kết đang chờ Trung tâm xét duyệt ({pendingRequests.length})
              </h4>
              <span className="badge bg-warning-subtle text-warning-emphasis">Đang xử lý</span>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Mã phiếu</th>
                    <th>Học sinh</th>
                    <th>Ngày sinh</th>
                    <th>Trường học</th>
                    <th>Ngày gửi</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map((req) => (
                    <tr key={req.id}>
                      <td className="fw-semibold text-primary">#{req.id}</td>
                      <td className="fw-medium">{req.studentName}</td>
                      <td>{req.dob}</td>
                      <td>{req.school || '—'}</td>
                      <td>{req.createdAt}</td>
                      <td>
                        <span className="badge bg-warning text-dark">
                          Chờ duyệt (24h)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Hotline Hỗ trợ & Khôi phục dữ liệu mẫu */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 p-3 bg-light rounded-4 border">
          <div className="d-flex align-items-center gap-2 text-muted small">
            <i className="bi bi-telephone-fill text-primary"></i>
            <span>Hotline Giáo vụ hỗ trợ: <strong>1900 6868</strong> (8:00 – 21:00)</span>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-outline-secondary rounded-pill px-3"
            onClick={resetDemoChildren}
            title="Khôi phục lại 2 học sinh demo ban đầu"
          >
            <i className="bi bi-arrow-counterclockwise me-1"></i>
            Khôi phục dữ liệu Demo (2 học sinh)
          </button>
        </div>
      </div>

      {/* Modal liên kết */}
      <LinkStudentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultTab={defaultTab}
      />
    </main>
  );
};

export default ParentEmptyState;
