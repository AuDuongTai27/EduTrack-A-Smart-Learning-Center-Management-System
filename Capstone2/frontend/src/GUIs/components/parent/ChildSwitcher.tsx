import React, { useState, useRef, useEffect } from 'react';
import { useParent } from '../../context/ParentContext';
import { LinkStudentModal } from './LinkStudentModal';

interface ChildSwitcherProps {
  className?: string;
  onChildSelected?: () => void;
}

/**
 * ChildSwitcher: Selector chọn học sinh tích hợp trực tiếp trong Sidebar của Cổng phụ huynh.
 * Tuân theo chuẩn layout của student, không có header desktop trong main-wrapper.
 */
export const ChildSwitcher: React.FC<ChildSwitcherProps> = ({
  className = '',
  onChildSelected,
}) => {
  const {
    childrenList,
    selectedChildId,
    selectedChild,
    setSelectedChildId,
    setDemoEmptyState,
    resetDemoChildren,
  } = useParent();

  const [isOpen, setIsOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (childrenList.length === 0) {
    return (
      <div className={`sidebar-child-switcher px-3 py-2 border-bottom ${className}`}>
        <div className="sidebar-nav-title px-0 pb-1" style={{ fontSize: '10px' }}>
          Hồ sơ học sinh
        </div>
        <div className="d-flex align-items-center gap-1.5">
          <button
            type="button"
            className="btn btn-sm btn-primary w-100 py-1.5 rounded-3 fw-semibold small d-flex align-items-center justify-content-center gap-1 shadow-xs"
            onClick={() => setModalOpen(true)}
          >
            <i className="bi bi-person-plus-fill"></i>
            <span>+ Liên kết học sinh</span>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary py-1.5 px-2 rounded-3"
            onClick={resetDemoChildren}
            title="Nạp lại học sinh mẫu"
          >
            <i className="bi bi-arrow-counterclockwise"></i>
          </button>
        </div>
        <LinkStudentModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </div>
    );
  }

  return (
    <div
      className={`sidebar-child-switcher position-relative px-3 py-2 border-bottom ${className}`}
      ref={dropdownRef}
    >
      <div className="d-flex align-items-center justify-content-between mb-1.5">
        <span
          className="sidebar-nav-title px-0 pb-0"
          style={{ fontSize: '10px', letterSpacing: '0.08em', color: 'var(--et-subtle)' }}
        >
          HỌC SINH ĐANG CHỌN
        </span>
        <span
          className="badge bg-light text-muted border px-1.5 py-0.5 rounded-pill"
          style={{ fontSize: '9px' }}
        >
          {childrenList.length} con
        </span>
      </div>

      {/* Button Selector Card trong Sidebar */}
      <button
        type="button"
        className="w-100 d-flex align-items-center gap-2 p-2 rounded-3 border text-start bg-light hover-shadow transition-all"
        style={{
          borderColor: isOpen ? '#3b82f6' : '#E2E8F0',
          cursor: 'pointer',
        }}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div
          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-xs flex-shrink-0"
          style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
            fontSize: '11px',
          }}
        >
          {selectedChild?.avatar || 'HS'}
        </div>

        <div className="flex-grow-1 overflow-hidden">
          <div
            className="fw-bold text-dark text-truncate"
            style={{ fontSize: '12.5px', lineHeight: '1.2' }}
          >
            {selectedChild?.name || 'Chọn học sinh'}
          </div>
          <div
            className="text-muted text-truncate"
            style={{ fontSize: '10.5px', marginTop: '2px' }}
          >
            {selectedChild?.grade} · {selectedChild?.classesCount} lớp
          </div>
        </div>

        <i
          className={`bi bi-chevron-down text-muted flex-shrink-0 fs-xs transition-transform ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
          style={{ fontSize: '11px' }}
        ></i>
      </button>

      {/* Dropdown Menu nổi trong Sidebar */}
      {isOpen && (
        <div
          className="position-absolute bg-white rounded-3 shadow-lg border p-2 mt-1"
          style={{
            top: '100%',
            left: '12px',
            right: '12px',
            zIndex: 1050,
            borderColor: '#E2E8F0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
          }}
        >
          <div className="px-2 py-1 mb-1 border-bottom d-flex align-items-center justify-content-between">
            <span className="fw-bold text-dark" style={{ fontSize: '11px' }}>
              Danh sách con của bạn
            </span>
          </div>

          <div className="d-flex flex-column gap-1 my-1">
            {childrenList.map((child) => {
              const isSelected = child.id === selectedChildId;
              return (
                <button
                  key={child.id}
                  type="button"
                  className={`btn d-flex align-items-center gap-2 p-1.5 rounded-2 text-start w-100 border-0 ${
                    isSelected ? 'bg-primary-subtle' : 'hover-bg-light'
                  }`}
                  onClick={() => {
                    setSelectedChildId(child.id);
                    setIsOpen(false);
                    if (onChildSelected) onChildSelected();
                  }}
                >
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                    style={{
                      width: '28px',
                      height: '28px',
                      background: isSelected
                        ? 'linear-gradient(135deg, #1d4ed8, #2563eb)'
                        : '#94a3b8',
                      fontSize: '10px',
                    }}
                  >
                    {child.avatar}
                  </div>
                  <div className="flex-grow-1 overflow-hidden">
                    <div
                      className="fw-bold text-dark text-truncate"
                      style={{ fontSize: '12px' }}
                    >
                      {child.name}
                    </div>
                    <div
                      className="text-muted text-truncate"
                      style={{ fontSize: '10px' }}
                    >
                      {child.grade}
                    </div>
                  </div>
                  {isSelected && (
                    <i className="bi bi-check-circle-fill text-primary" style={{ fontSize: '12px' }}></i>
                  )}
                </button>
              );
            })}
          </div>

          <div className="border-top pt-1.5 mt-1">
            <button
              type="button"
              className="btn btn-light w-100 py-1 rounded-2 text-primary fw-semibold small d-flex align-items-center justify-content-center gap-1 mb-1"
              style={{ fontSize: '11.5px' }}
              onClick={() => {
                setIsOpen(false);
                setModalOpen(true);
              }}
            >
              <i className="bi bi-plus-circle-fill"></i>
              <span>+ Thêm học sinh</span>
            </button>

            {/* Công cụ hỗ trợ demo */}
            <button
              type="button"
              className="btn btn-outline-danger w-100 py-0.5 rounded-2 text-danger small d-flex align-items-center justify-content-center gap-1 opacity-75"
              style={{ fontSize: '10px' }}
              onClick={() => {
                setIsOpen(false);
                setDemoEmptyState();
              }}
              title="Thử nghiệm trạng thái 0 học sinh"
            >
              <i className="bi bi-eye"></i>
              <span>Demo 0 học sinh</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal liên kết */}
      <LinkStudentModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default ChildSwitcher;
