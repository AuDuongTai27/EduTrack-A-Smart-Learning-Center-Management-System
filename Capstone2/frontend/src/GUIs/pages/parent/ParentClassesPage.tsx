import React, { useEffect } from 'react';
import { useParent } from '../../../contexts/ParentContext';
import { LearnerPageLoader } from '../../components/student/common/LearnerPageLoader';
import { ParentClassItem } from '../../components/parent/ParentClassItem';

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

  const activeClasses = classes.filter((c) => !c.isCompleted);
  const pastClasses = classes.filter((c) => c.isCompleted);

  return (
    <main className="main-content">
      <div className="content-container">
        {/* Page Header */}
        <div className="page-header d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <h1 className="page-title mb-0">Child's Classes</h1>
          </div>
        </div>

        {/* 1. Active Classes Section */}
        <div className="section-title-wrap d-flex align-items-center gap-2 mb-3">
          <i className="bi bi-mortarboard-fill text-success fs-5"></i>
          <h2 className="section-title h5 fw-bold mb-0">Active Classes</h2>
          <span className="section-count-badge badge bg-success-subtle text-success border border-success-subtle rounded-pill">
            {activeClasses.length} {activeClasses.length === 1 ? 'class' : 'classes'}
          </span>
        </div>

        <div className="classes-grid mb-5">
          {activeClasses.length === 0 ? (
            <div className="col-12 py-4 text-center text-muted">
              No active classes enrolled for this child.
            </div>
          ) : (
            activeClasses.map((cls) => (
              <ParentClassItem key={cls.id} classItem={cls} />
            ))
          )}
        </div>

        {/* 2. Past Classes Section */}
        <div className="section-title-wrap d-flex align-items-center gap-2 mb-3">
          <i className="bi bi-clock-history text-muted fs-5"></i>
          <h2 className="section-title h5 fw-bold mb-0 text-muted">Past Classes</h2>
          <span className="section-count-badge badge bg-secondary-subtle text-secondary border border-secondary-subtle rounded-pill">
            {pastClasses.length} {pastClasses.length === 1 ? 'class' : 'classes'}
          </span>
        </div>

        {pastClasses.length === 0 ? (
          <div className="card border-0 bg-light p-4 text-center rounded-3 mb-4">
            <p className="text-muted mb-0 small">
              <i className="bi bi-info-circle me-1"></i> No past classes recorded for this child.
            </p>
          </div>
        ) : (
          <div className="classes-grid mb-4">
            {pastClasses.map((cls) => (
              <ParentClassItem key={cls.id} classItem={cls} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default ParentClassesPage;
