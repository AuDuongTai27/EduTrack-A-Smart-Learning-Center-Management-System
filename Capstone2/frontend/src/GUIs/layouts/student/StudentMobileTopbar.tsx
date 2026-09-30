import React from 'react';

interface StudentMobileTopbarProps {
  onToggleSidebar: () => void;
}

export const StudentMobileTopbar: React.FC<StudentMobileTopbarProps> = ({ onToggleSidebar }) => {
  return (
    <header className="mobile-topbar">
      <button
        className="btn-hamburger"
        type="button"
        onClick={onToggleSidebar}
        aria-label="Mở menu"
      >
        <i className="bi bi-list fs-5"></i>
      </button>
      <div className="d-flex align-items-center gap-2">
        <div className="brand-logo-icon" style={{ width: '28px', height: '28px', borderRadius: '8px' }}>
          <i className="bi bi-mortarboard-fill fs-6"></i>
        </div>
        <span className="brand-title fs-6">EduTrack</span>
      </div>
      <div className="student-avatar" style={{ width: '32px', height: '32px', fontSize: '11px' }}>MA</div>
    </header>
  );
};

export default StudentMobileTopbar;
