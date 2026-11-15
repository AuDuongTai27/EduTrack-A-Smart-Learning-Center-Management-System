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
          <div className="overdue-title">Assignment is overdue</div>
          <div className="overdue-desc">
            The submission deadline of {dueDate} has passed. Please contact your teacher for assistance.
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverdueAlertBox;
