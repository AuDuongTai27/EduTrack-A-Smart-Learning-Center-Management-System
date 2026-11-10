import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export function WorkspaceChooser({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!isOpen) return;
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', key); return () => document.removeEventListener('keydown', key);
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return <div className="modal d-block" style={{ background: '#0007' }} onClick={onClose}>
    <div className="modal-dialog modal-dialog-centered" role="dialog" aria-modal="true" aria-label="Chọn giao diện" onClick={e => e.stopPropagation()}>
      <div className="modal-content"><div className="modal-header"><h5>Chọn giao diện</h5><button type="button" className="btn-close" aria-label="Đóng" onClick={onClose} /></div>
        <div className="modal-body d-grid gap-2">{[
          ['center-manager', 'Quản lý trung tâm'], ['admin-staff', 'Giáo vụ'], ['teacher', 'Giáo viên'],
          ['teaching-assistant', 'Trợ giảng'], ['student', 'Học sinh'], ['parent', 'Phụ huynh'],
        ].map(([route, label]) => <Link key={route} className="btn btn-outline-primary" to={`/${route}/dashboard`} onClick={onClose}>{label}</Link>)}
          <small>Chọn giao diện và tài khoản dữ liệu. Hệ thống hiện chưa có Authentication/Authorization.</small>
        </div></div>
    </div>
  </div>;
}
