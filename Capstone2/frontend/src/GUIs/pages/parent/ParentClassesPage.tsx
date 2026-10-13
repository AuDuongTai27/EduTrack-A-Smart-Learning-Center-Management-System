import React from 'react';
import { Link } from 'react-router-dom';
import { useParent } from '../../../contexts/ParentContext';

export const ParentClassesPage: React.FC = () => {
  const { selectedChild } = useParent();

  if (!selectedChild) {
    return null;
  }

  return (
    <main className="main-content">
      <div className="content-container">
        {/* Page Header */}
        <div className="page-header d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <h1 className="page-title mb-1">Lớp học của con</h1>
            <p className="page-subtitle text-muted mb-0">
              Danh sách các lớp học bé <strong>{selectedChild.name}</strong> đang tham gia trong học kỳ này
            </p>
          </div>

          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fw-semibold">
            {selectedChild.grade} · {selectedChild.classes.length} môn học
          </span>
        </div>

        {/* Classes Grid */}
        <div className="classes-grid">
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

                {/* Chuyên cần buổi học */}
                <div className="mt-3 pt-2 border-top">
                  <div className="d-flex justify-content-between small text-muted mb-1">
                    <span>Số buổi đã học:</span>
                    <strong className="text-dark">
                      {cls.attendedLessons}/{cls.totalLessons} buổi
                    </strong>
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
                  <p className="small text-muted mt-2 mb-0 line-clamp-1 fst-italic">
                    "{cls.notes}"
                  </p>
                </div>
              </div>

              <div className="class-card-footer">
                <span>Xem thông tin lớp & lịch học</span>
                <i className="bi bi-chevron-right"></i>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
};

export default ParentClassesPage;
