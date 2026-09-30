import React from 'react';
import { Link } from 'react-router-dom';
import type { AssignmentItem } from './classDetailData';

interface ClassAssignmentsSectionProps {
  assignments: AssignmentItem[];
}

export const ClassAssignmentsSection: React.FC<ClassAssignmentsSectionProps> = ({
  assignments,
}) => {
  const asgCounts = {
    submitted: assignments.filter((a) => a.status === 'Đã nộp').length,
    pending: assignments.filter((a) => a.status === 'Chưa nộp').length,
    overdue: assignments.filter((a) => a.status === 'Quá hạn').length,
  };

  return (
    <section className="assignments-section">
      <div className="section-header flex-wrap gap-2">
        <div className="section-title-wrap">
          <h2 className="section-title">Bài tập</h2>
          <span className="section-count-badge" id="assignmentsCountBadge">
            {assignments.length} bài
          </span>
        </div>
        <div className="d-flex align-items-center gap-2" id="asgSummaryBadges">
          <span className="asg-status-badge asg-status-danop">
            {asgCounts.submitted} Đã nộp
          </span>
          <span className="asg-status-badge asg-status-chuanop">
            {asgCounts.pending} Chưa nộp
          </span>
          <span className="asg-status-badge asg-status-quahan">
            {asgCounts.overdue} Quá hạn
          </span>
        </div>
      </div>

      {/* Assignment Items List */}
      <div id="assignmentsList">
        {assignments.map((asg) => {
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
              key={asg.id}
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
        })}
      </div>
    </section>
  );
};

export default ClassAssignmentsSection;
