import React from 'react';

export interface OverdueAlertBoxProps {
  dueDate: string;
}

export function OverdueAlertBox({ dueDate }: OverdueAlertBoxProps) {
  return (
    <div id="viewOverdue">
      <div className="overdue-alert-box">
        <i className="bi bi-exclamation-triangle-fill text-danger fs-5 flex-shrink-0 mt-1"></i>
        <div>
          <div className="overdue-title">Bài tập đã quá hạn nộp</div>
          <div className="overdue-desc">
            Thời hạn nộp bài là {dueDate} đã qua. Vui lòng liên hệ giáo viên để được hỗ trợ thêm.
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverdueAlertBox;
