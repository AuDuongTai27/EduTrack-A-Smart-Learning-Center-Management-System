import React from 'react';
import { Link } from 'react-router-dom';
import type { AssignmentItem } from '../classDetailData';

export interface ClassAssignmentRowProps {
  assignment: AssignmentItem;
}

export function ClassAssignmentRow({ assignment: asg }: ClassAssignmentRowProps) {
  let statusClass = 'asg-status-chuanop';
  let icon = 'bi-exclamation-triangle';
  let iconBoxStyle: React.CSSProperties = {
    backgroundColor: '#FFFBEB',
    color: '#B45309',
    border: '1px solid #FDE68A',
  };

  if (asg.status === 'Đã nộp') {
    statusClass = 'asg-status-danop';
    icon = 'bi-check-circle';
    iconBoxStyle = {
      backgroundColor: '#ECFDF5',
      color: '#047857',
      border: '1px solid #A7F3D0',
    };
  } else if (asg.status === 'Quá hạn') {
    statusClass = 'asg-status-quahan';
    icon = 'bi-x-circle';
    iconBoxStyle = {
      backgroundColor: '#FEF2F2',
      color: '#B91C1C',
      border: '1px solid #FECACA',
    };
  }

  return (
    <Link
      to={`/student/assignments/${asg.id}`}
      className="assignment-row"
      title={`Xem chi tiết bài tập ${asg.title}`}
    >
      <div className="asg-icon-box" style={iconBoxStyle}>
        <i className="bi bi-clipboard-check"></i>
      </div>
      <div className="asg-details">
        <h4 className="asg-title">{asg.title}</h4>
        <div className="asg-due">
          <i className="bi bi-clock"></i>
          <span>Hạn nộp: {asg.dueDate}</span>
        </div>
      </div>
      <span className={`asg-status-badge ${statusClass}`}>
        <i className={`bi ${icon}`}></i>
        <span>{asg.status}</span>
      </span>
      <i className="bi bi-chevron-right asg-chevron"></i>
    </Link>
  );
};

export default ClassAssignmentRow;
