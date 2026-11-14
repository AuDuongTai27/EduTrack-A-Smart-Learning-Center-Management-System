import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useParent } from '../../../contexts/ParentContext';
import { LearnerPageLoader } from '../../components/student/common/LearnerPageLoader';

export function ParentClassesPage() {
  const { selectedChild, loading } = useParent();
  const classes = selectedChild?.classes || [];

  useEffect(() => {
    document.title = "Child's Classes – EduTrack";
  }, []);

  if (loading || !selectedChild) {
    return (
      <LearnerPageLoader
        title="Loading class list..."
        message="The system is loading your child's classes for this semester."
      />
    );
  }

  return (
    <main className="main-content">
      <div className="content-container">
        {/* Page Header */}
        <div className="page-header d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <h1 className="page-title mb-1">Child's Classes</h1>
            <p className="page-subtitle text-muted mb-0">
              List of classes that <strong>{selectedChild.name}</strong> is attending this semester
            </p>
          </div>

          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fw-semibold">
            {selectedChild.grade} · {classes.length} {classes.length === 1 ? 'subject' : 'subjects'}
          </span>
        </div>

        {/* Classes Grid */}
        <div className="classes-grid">
          {classes.map((cls) => (
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
                    <span className="teacher-label">Teacher:</span> {cls.teacher}
                  </span>
                </div>

                <div className="meta-row">
                  <i className="bi bi-calendar-event"></i>
                  <span>{cls.schedule}</span>
                </div>

                <div className="meta-row room">
                  <i className="bi bi-geo-alt"></i>
                  <span>{cls.room || 'Center Classroom'}</span>
                </div>

                {/* Chuyên cần buổi học */}
                <div className="mt-3 pt-2 border-top">
                  <div className="d-flex justify-content-between small text-muted mb-1">
                    <span>Sessions Attended:</span>
                    <strong className="text-dark">
                      {cls.attendedLessons}/{cls.totalLessons} sessions
                    </strong>
                  </div>
                  <div className="progress" style={{ height: '6px' }}>
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      style={{
                        width: `${cls.totalLessons > 0 ? Math.round((cls.attendedLessons / cls.totalLessons) * 100) : 0}%`,
                      }}
                    ></div>
                  </div>
                  <p className="small text-muted mt-2 mb-0 line-clamp-1 fst-italic">
                    "{cls.notes || 'Full attendance, actively participates in class.'}"
                  </p>
                </div>
              </div>

              <div className="class-card-footer">
                <span>View class info &amp; schedule</span>
                <i className="bi bi-chevron-right"></i>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

export default ParentClassesPage;
