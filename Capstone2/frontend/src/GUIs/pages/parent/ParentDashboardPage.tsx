import React from 'react';
import { Link } from 'react-router-dom';
import { useParent } from '../../context/ParentContext';

export const ParentDashboardPage: React.FC = () => {
  const { selectedChild } = useParent();

  if (!selectedChild) {
    return null;
  }

  return (
    <main className="main-content">
      <div className="content-container">
        {/* 1. Page Header */}
        <div className="page-header d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <h1 className="page-title mb-1">Tổng quan học tập</h1>
            <p className="page-subtitle text-muted mb-0">
              Theo dõi kết quả học tập và hoạt động của con tại trung tâm EduTrack
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fw-semibold">
              <i className="bi bi-person-badge me-1"></i> {selectedChild.name} · {selectedChild.grade}
            </span>
          </div>
        </div>

        {/* 2. Welcome Banner Thân thiện cho Phụ Huynh */}
        <div
          className="card border-0 shadow-sm rounded-4 p-4 text-white mb-4 position-relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)',
          }}
        >
          <div className="row align-items-center">
            <div className="col-lg-8">
              <span className="badge bg-white bg-opacity-25 text-white mb-2 px-3 py-1.5 rounded-pill small">
                <i className="bi bi-clock-history me-1"></i> Cập nhật mới nhất hôm nay
              </span>
              <h2 className="h4 fw-bold mb-2">
                Xin chào Quý phụ huynh của bé {selectedChild.name}!
              </h2>
              <p className="opacity-90 mb-3 small" style={{ maxWidth: '620px' }}>
                Con đang theo học <strong>{selectedChild.classesCount} lớp</strong> tại trung tâm. Tỷ lệ chuyên cần hiện tại đạt <strong>{selectedChild.attendanceRate}%</strong>. Hãy đồng hành cùng con bằng việc theo dõi tiến độ và nhận xét định kỳ từ giáo viên.
              </p>
              <div className="d-flex flex-wrap gap-2">
                <Link
                  to="/parent/schedule"
                  className="btn btn-sm btn-light text-primary fw-bold px-3 py-2 rounded-3 shadow-xs"
                >
                  <i className="bi bi-calendar-check me-1"></i> Xem lịch học tuần này
                </Link>
                {selectedChild.unpaidAmount > 0 ? (
                  <Link
                    to="/parent/tuition"
                    className="btn btn-sm btn-warning text-dark fw-bold px-3 py-2 rounded-3 shadow-xs"
                  >
                    <i className="bi bi-credit-card me-1"></i> Thanh toán học phí ({selectedChild.unpaidAmount.toLocaleString('vi-VN')} ₫)
                  </Link>
                ) : (
                  <span className="btn btn-sm btn-outline-light px-3 py-2 rounded-3 disabled">
                    <i className="bi bi-check-circle me-1"></i> Đã hoàn thành học phí
                  </span>
                )}
              </div>
            </div>
            <div className="col-lg-4 d-none d-lg-flex justify-content-center">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center bg-white bg-opacity-15 text-white"
                style={{ width: '120px', height: '120px' }}
              >
                <i className="bi bi-award fs-1"></i>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Thẻ Thống Kê Nhanh (Stats Row) */}
        <div className="row g-3 mb-4">
          <div className="col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-secondary small fw-semibold">Lớp đang học</span>
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary"
                  style={{ width: '38px', height: '38px' }}
                >
                  <i className="bi bi-journal-bookmark-fill"></i>
                </div>
              </div>
              <div className="h3 fw-bold text-dark mb-0">{selectedChild.classesCount}</div>
              <small className="text-muted">Kỳ học 2026</small>
            </div>
          </div>

          <div className="col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-secondary small fw-semibold">Chuyên cần</span>
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success"
                  style={{ width: '38px', height: '38px' }}
                >
                  <i className="bi bi-calendar-check-fill"></i>
                </div>
              </div>
              <div className="h3 fw-bold text-success mb-0">{selectedChild.attendanceRate}%</div>
              <small className="text-muted">Rất chăm chỉ</small>
            </div>
          </div>

          <div className="col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-secondary small fw-semibold">Đánh giá trung bình</span>
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center bg-info bg-opacity-10 text-info"
                  style={{ width: '38px', height: '38px' }}
                >
                  <i className="bi bi-star-fill"></i>
                </div>
              </div>
              <div className="h3 fw-bold text-dark mb-0">{selectedChild.averageScore} <span className="fs-6 text-muted fw-normal">/ 10</span></div>
              <small className="text-muted">Xếp loại: Giỏi</small>
            </div>
          </div>

          <div className="col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-secondary small fw-semibold">Học phí cần đóng</span>
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center bg-warning bg-opacity-10 text-warning"
                  style={{ width: '38px', height: '38px' }}
                >
                  <i className="bi bi-wallet2"></i>
                </div>
              </div>
              <div className={`h4 fw-bold mb-0 ${selectedChild.unpaidAmount > 0 ? 'text-danger' : 'text-success'}`}>
                {selectedChild.unpaidAmount > 0
                  ? `${selectedChild.unpaidAmount.toLocaleString('vi-VN')} ₫`
                  : '0 ₫'}
              </div>
              <small className="text-muted">
                {selectedChild.unpaidAmount > 0 ? (
                  <Link to="/parent/tuition" className="text-primary fw-semibold">
                    Đóng ngay <i className="bi bi-arrow-right"></i>
                  </Link>
                ) : (
                  'Đã tất toán'
                )}
              </small>
            </div>
          </div>
        </div>

        {/* 4. Section Header & Danh sách các lớp học của con */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="section-title-wrap">
            <h2 className="section-title h5 fw-bold mb-0">Lớp học con đang tham gia</h2>
            <span className="section-count-badge">{selectedChild.classes.length} lớp</span>
          </div>
          <Link to="/parent/classes" className="btn btn-sm btn-outline-primary rounded-pill px-3">
            Xem tất cả <i className="bi bi-chevron-right ms-1"></i>
          </Link>
        </div>

        <div className="classes-grid mb-4">
          {selectedChild.classes.map((cls) => (
            <Link
              key={cls.id}
              to={`/parent/classes/${cls.id}`}
              className={`class-card ${cls.subjectClass}`}
            >
              <div className="card-accent-bar"></div>
              <div className="class-card-body">
                <div className="class-card-header">
                  <span className="subject-badge">{cls.badge}</span>
                  <div className="subject-icon-box">
                    <i className="bi bi-book"></i>
                  </div>
                </div>
                <h3 className="class-name">{cls.name}</h3>
                <div className="card-spacer"></div>

                <div className="teacher-row">
                  <div className="teacher-avatar-mini">{cls.teacherInitials}</div>
                  <span className="teacher-name">
                    <span className="teacher-label">GV:</span> {cls.teacher}
                  </span>
                </div>

                <div className="meta-row">
                  <i className="bi bi-calendar-event"></i>
                  <span>{cls.schedule}</span>
                </div>

                <div className="meta-row room">
                  <i className="bi bi-geo-alt"></i>
                  <span>{cls.room}</span>
                </div>

                {/* Tóm tắt buổi học & chuyên cần con */}
                <div className="mt-2 pt-2 border-top">
                  <div className="d-flex justify-content-between small text-muted mb-1">
                    <span>Đã học: <strong>{cls.attendedLessons}/{cls.totalLessons} buổi</strong></span>
                    <span className="text-success fw-bold">
                      {Math.round((cls.attendedLessons / cls.totalLessons) * 100)}%
                    </span>
                  </div>
                  <div className="progress" style={{ height: '6px' }}>
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      style={{
                        width: `${Math.round((cls.attendedLessons / cls.totalLessons) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="class-card-footer">
                <span>Xem thông tin lớp & điểm danh</span>
                <i className="bi bi-chevron-right"></i>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
};

export default ParentDashboardPage;
