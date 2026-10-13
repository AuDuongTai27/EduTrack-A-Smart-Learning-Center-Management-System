import React, { useState, useRef, useEffect } from 'react';
import { useParent } from '../../context/ParentContext';
import { LinkStudentModal } from './LinkStudentModal';

interface ChildSwitcherProps {
  className?: string;
}

/**
 * ChildSwitcher: Selector chọn học sinh đặt tại Header / Topbar của Cổng phụ huynh.
 * Cho phép chuyển đổi linh hoạt giữa các con, xem danh sách và mở modal liên kết thêm học sinh mới.
 */
export const ChildSwitcher: React.FC<ChildSwitcherProps> = ({ className = '' }) => {
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
      <div className={`d-flex align-items-center gap-2 ${className}`}>
        <button
          type="button"
          className="btn btn-sm btn-primary rounded-pill px-3 py-1.5 fw-semibold d-flex align-items-center gap-1.5 shadow-sm"
          onClick={() => setModalOpen(true)}
        >
          <i className="bi bi-person-plus-fill"></i>
          <span>+ Liên kết học sinh</span>
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary rounded-pill px-2.5 py-1"
          onClick={resetDemoChildren}
          title="Nạp lại 2 học sinh mẫu"
        >
          <i className="bi bi-arrow-counterclockwise"></i>
        </button>
        <LinkStudentModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className={`position-relative ${className}`} ref={dropdownRef}>
      {/* Nút bấm hiển thị học sinh hiện tại */}
      <button
        type="button"
        className="btn d-flex align-items-center gap-2.5 px-3 py-1.5 rounded-pill border bg-white shadow-sm hover-shadow text-start"
        style={{ minWidth: '190px', borderColor: '#e2e8f0' }}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div
          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
          style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
            fontSize: '12px',
          }}
        >
          {selectedChild?.avatar || 'HS'}
        </div>
        <div className="d-flex flex-column line-clamp-1 flex-grow-1" style={{ maxWidth: '140px' }}>
          <span className="small text-muted" style={{ fontSize: '10px', lineHeight: '1.1' }}>
            Đang xem hồ sơ của:
          </span>
          <span className="fw-bold text-dark text-truncate" style={{ fontSize: '13px' }}>
            {selectedChild?.name || 'Chọn học sinh'}
          </span>
        </div>
        <i className="bi bi-chevron-down text-muted fs-xs ms-1"></i>
      </button>

      {/* Dropdown Menu danh sách các con */}
      {isOpen && (
        <div
          className="position-absolute end-0 mt-2 bg-white rounded-4 shadow-lg border p-2"
          style={{ width: '280px', zIndex: 1050, borderColor: '#e2e8f0' }}
        >
          <div className="px-3 py-2 border-bottom mb-1 d-flex align-items-center justify-content-between">
            <span className="fw-bold text-dark small">
              <i className="bi bi-people me-1.5 text-primary"></i>
              Danh sách con của bạn ({childrenList.length})
            </span>
          </div>

          <div className="d-flex flex-column gap-1 my-1">
            {childrenList.map((child) => {
              const isSelected = child.id === selectedChildId;
              return (
                <button
                  key={child.id}
                  type="button"
                  className={`btn d-flex align-items-center gap-2.5 p-2 rounded-3 text-start w-100 border-0 ${
                    isSelected ? 'bg-primary-subtle' : 'hover-bg-light'
                  }`}
                  onClick={() => {
                    setSelectedChildId(child.id);
                    setIsOpen(false);
                  }}
                >
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                    style={{
                      width: '34px',
                      height: '34px',
                      background: isSelected
                        ? 'linear-gradient(135deg, #1d4ed8, #2563eb)'
                        : '#94a3b8',
                      fontSize: '12px',
                    }}
                  >
                    {child.avatar}
                  </div>
                  <div className="flex-grow-1 overflow-hidden">
                    <div className="fw-bold text-dark text-truncate small">
                      {child.name}
                    </div>
                    <div className="text-muted text-truncate" style={{ fontSize: '11px' }}>
                      {child.grade} · {child.classesCount} lớp
                    </div>
                  </div>
                  {isSelected && (
                    <i className="bi bi-check-circle-fill text-primary fs-6"></i>
                  )}
                </button>
              );
            })}
          </div>

          <div className="border-top pt-2 mt-1">
            <button
              type="button"
              className="btn btn-light w-100 py-1.5 rounded-3 text-primary fw-semibold small d-flex align-items-center justify-content-center gap-1.5 mb-1"
              onClick={() => {
                setIsOpen(false);
                setModalOpen(true);
              }}
            >
              <i className="bi bi-plus-circle-fill"></i>
              <span>Liên kết thêm học sinh</span>
            </button>

            {/* Công cụ hỗ trợ demo: Cho phép test thử Empty State (0 học sinh) */}
            <button
              type="button"
              className="btn btn-outline-danger w-100 py-1 rounded-3 text-danger small d-flex align-items-center justify-content-center gap-1 opacity-75"
              style={{ fontSize: '11px' }}
              onClick={() => {
                setIsOpen(false);
                setDemoEmptyState();
              }}
              title="Thử nghiệm trạng thái Phụ huynh chưa có học sinh nào"
            >
              <i className="bi bi-eye"></i>
              <span>Demo trạng thái chưa có học sinh (0 HS)</span>
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
