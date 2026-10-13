import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useParent } from '../../../contexts/ParentContext';

export const ParentClassDetailPage: React.FC = () => {
  const { id: paramId } = useParams<{ id: string }>();
  const { selectedChild } = useParent();

  const classId = parseInt(paramId || '1', 10);
  const cls =
    selectedChild?.classes.find((c) => c.id === classId) ||
    selectedChild?.classes[0];

  useEffect(() => {
    if (cls) {
      document.title = `${cls.name} – Chi tiết lớp (Phụ huynh) – EduTrack`;
    }
  }, [cls]);

  if (!cls || !selectedChild) {
    return (
      <main className="main-content">
        <div className="content-container py-5 text-center">
          <p className="text-muted">Không tìm thấy thông tin lớp học của học sinh.</p>
          <Link to="/parent/classes" className="btn btn-primary btn-sm rounded-pill">
            Quay lại danh sách lớp
          </Link>
        </div>
      </main>
    );
  }

  // Danh sách các buổi học mô phỏng theo dõi điểm danh của con
  const sessions = [
    {
      sessionNo: 1,
      date: 'Thứ 2, 01/09/2026',
      topic: 'Buổi 1: Giới thiệu đề cương & Ôn tập kiến thức nền tảng',
      status: 'present',
      statusLabel: 'Có mặt',
      notes: 'Đúng giờ, hăng hái xây dựng bài.',
    },
    {
      sessionNo: 2,
      date: 'Thứ 4, 03/09/2026',
      topic: 'Buổi 2: Chuyên đề nâng cao phần 1 & Bài tập ứng dụng',
      status: 'present',
      statusLabel: 'Có mặt',
      notes: 'Làm bài nhanh, hiểu sâu phương pháp.',
    },
    {
      sessionNo: 3,
      date: 'Thứ 6, 05/09/2026',
      topic: 'Buổi 3: Luyện tập kỹ năng giải nhanh dạng đề trọng tâm',
      status: 'present',
      statusLabel: 'Có mặt',
      notes: 'Tham gia thảo luận nhóm tích cực.',
    },
    {
      sessionNo: 4,
      date: 'Thứ 2, 08/09/2026',
      topic: 'Buổi 4: Kiểm tra định kỳ 15 phút & Phân tích lỗi sai',
      status: 'present',
      statusLabel: 'Có mặt',
      notes: 'Đạt điểm 9.0 bài kiểm tra ngắn.',
    },
    {
      sessionNo: 5,
      date: 'Thứ 4, 10/09/2026',
      topic: 'Buổi 5: Chuyên đề nâng cao phần 2 & Bài toán thực tế',
      status: 'excused',
      statusLabel: 'Nghỉ có phép',
      notes: 'Phụ huynh đã xin phép nghỉ gia đình có việc.',
    },
    {
      sessionNo: 6,
      date: 'Thứ 6, 12/09/2026',
      topic: 'Buổi 6: Thực hành tổng hợp kiến thức chương',
      status: 'present',
      statusLabel: 'Có mặt',
      notes: 'Đã hoàn thành bài bù buổi trước.',
    },
  ];

  return (
    <main className="main-content">
      <div className={`content-container class-detail-container ${cls.subjectClass}`}>
        {/* 1. Hero Banner Thân Thiện Dành Cho Phụ Huynh */}
        <div
          className="class-hero-banner mb-4"
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            borderRadius: '20px',
            padding: '28px',
            color: '#fff',
          }}
        >
          {/* Back Button */}
          <Link
            to="/parent/classes"
            className="btn btn-sm btn-light bg-white bg-opacity-20 text-white border-0 rounded-pill px-3 py-1.5 mb-3 d-inline-flex align-items-center gap-1.5"
          >
            <i className="bi bi-arrow-left"></i>
            <span>Quay lại danh sách lớp</span>
          </Link>

          {/* Breadcrumbs */}
          <div className="d-flex align-items-center gap-2 small opacity-80 mb-2">
            <Link to="/parent/dashboard" className="text-white text-decoration-none">
              Dashboard
            </Link>
            <i className="bi bi-chevron-right fs-xs"></i>
            <Link to="/parent/classes" className="text-white text-decoration-none">
              Lớp học của con
            </Link>
            <i className="bi bi-chevron-right fs-xs"></i>
            <span className="fw-semibold text-white">{cls.name}</span>
          </div>

          {/* Hero Main Info */}
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-2">
            <div>
              <span className="badge bg-white text-primary fw-bold px-3 py-1.5 rounded-pill mb-2">
                {cls.subject}
              </span>
              <h1 className="h3 fw-bold mb-2">{cls.name}</h1>
              <p className="mb-0 opacity-90 small">
                <span>Học sinh: <strong>{selectedChild.name}</strong> ({selectedChild.grade})</span>
                <span className="mx-2">·</span>
                <span>Giáo viên phụ trách: <strong>{cls.teacher}</strong></span>
              </p>
            </div>

            {/* Quick Progress Badge */}
            <div className="d-flex align-items-center gap-3 bg-white bg-opacity-15 p-3 rounded-4 border border-white border-opacity-25">
              <div className="text-center">
                <div className="h4 fw-bold mb-0">
                  {cls.attendedLessons}/{cls.totalLessons}
                </div>
                <div className="small opacity-80">Buổi đã học</div>
              </div>
              <div className="vr bg-white opacity-50"></div>
              <div className="text-center">
                <div className="h4 fw-bold text-warning mb-0">
                  {Math.round((cls.attendedLessons / cls.totalLessons) * 100)}%
                </div>
                <div className="small opacity-80">Chuyên cần</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Thẻ Thông Tin Cơ Bản Của Lớp (Không chứa tài liệu & nộp bài) */}
        <div className="row g-4 mb-4">
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
              <h3 className="h6 fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-info-circle-fill text-primary"></i>
                Thông tin lớp học cơ bản
              </h3>

              <div className="d-flex flex-column gap-3">
                <div className="d-flex align-items-start gap-3 p-2.5 rounded-3 bg-light">
                  <div className="p-2 rounded-3 bg-white text-primary shadow-xs">
                    <i className="bi bi-calendar-week fs-5"></i>
                  </div>
                  <div>
                    <div className="small text-muted">Lịch học hàng tuần</div>
                    <div className="fw-semibold text-dark">{cls.schedule}</div>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3 p-2.5 rounded-3 bg-light">
                  <div className="p-2 rounded-3 bg-white text-primary shadow-xs">
                    <i className="bi bi-geo-alt fs-5"></i>
                  </div>
                  <div>
                    <div className="small text-muted">Phòng học</div>
                    <div className="fw-semibold text-dark">{cls.room} (EduTrack CS1)</div>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3 p-2.5 rounded-3 bg-light">
                  <div className="p-2 rounded-3 bg-white text-primary shadow-xs">
                    <i className="bi bi-person-workspace fs-5"></i>
                  </div>
                  <div>
                    <div className="small text-muted">Giáo viên đứng lớp</div>
                    <div className="fw-semibold text-dark">{cls.teacher}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
              <h3 className="h6 fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-chat-heart-fill text-danger"></i>
                Nhận xét & Đánh giá của giáo viên về con
              </h3>

              <div className="p-3 rounded-4 bg-primary bg-opacity-10 border border-primary-subtle mb-3">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <div className="badge bg-primary text-white rounded-pill px-2.5 py-1">
                    Đánh giá gần nhất
                  </div>
                  <small className="text-muted">Kỳ 1 - Năm học 2026</small>
                </div>
                <p className="fw-medium text-dark mb-0 fst-italic">
                  "{cls.notes}"
                </p>
              </div>

              <div className="d-flex align-items-center justify-content-between small text-muted border-top pt-3 mt-auto">
                <span>Trợ giảng phụ trách lớp: <strong>Lê Minh Đức (TA)</strong></span>
                <span className="badge bg-success-subtle text-success">Đang theo sát</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Bảng Theo Dõi Chuyên Cần & Buổi Học Của Con */}
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
            <div>
              <h3 className="h6 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                <i className="bi bi-check2-square text-success fs-5"></i>
                Nhật ký điểm danh & Nội dung các buổi học
              </h3>
              <p className="small text-muted mb-0">
                Ghi nhận tình trạng tham gia từng buổi học của con để phụ huynh an tâm nắm bắt
              </p>
            </div>
            <span className="badge bg-light text-secondary border px-3 py-1.5 rounded-pill">
              Cập nhật tự động sau mỗi buổi
            </span>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="small text-secondary">
                  <th style={{ width: '80px' }}>Buổi</th>
                  <th style={{ width: '160px' }}>Thời gian</th>
                  <th>Chủ đề bài học</th>
                  <th style={{ width: '130px' }}>Điểm danh</th>
                  <th>Ghi chú của lớp</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((ses) => (
                  <tr key={ses.sessionNo}>
                    <td className="fw-bold text-primary">#{ses.sessionNo}</td>
                    <td className="small text-muted">{ses.date}</td>
                    <td className="fw-medium text-dark">{ses.topic}</td>
                    <td>
                      {ses.status === 'present' ? (
                        <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2.5 py-1">
                          <i className="bi bi-check-circle-fill me-1"></i> {ses.statusLabel}
                        </span>
                      ) : (
                        <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-2.5 py-1">
                          <i className="bi bi-exclamation-circle-fill me-1"></i> {ses.statusLabel}
                        </span>
                      )}
                    </td>
                    <td className="small text-muted">{ses.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lưu ý thân thiện dành riêng cho Phụ huynh */}
        <div className="alert alert-light border rounded-4 d-flex align-items-center gap-3 p-3">
          <i className="bi bi-shield-check fs-4 text-primary"></i>
          <div className="small text-secondary">
            <strong>Ghi chú dành cho Phụ huynh:</strong> Trang chi tiết lớp học này chỉ cung cấp thông tin tổng quan, lịch học, điểm danh và tiến độ của con. Các tài liệu bài giảng và bài tập thực hành được bảo lưu trong tài khoản của học sinh để con chủ động làm bài và nộp bài trực tiếp.
          </div>
        </div>
      </div>
    </main>
  );
};

export default ParentClassDetailPage;
