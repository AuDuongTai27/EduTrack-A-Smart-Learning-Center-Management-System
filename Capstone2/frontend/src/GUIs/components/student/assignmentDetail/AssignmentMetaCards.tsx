import React from 'react';
import type { AssignmentDetailItem, SubmissionStatus } from './assignmentDetailData';

interface AssignmentMetaCardsProps {
  asg: AssignmentDetailItem;
  currentStatus: SubmissionStatus;
}

export const AssignmentMetaCards: React.FC<AssignmentMetaCardsProps> = ({
  asg,
  currentStatus,
}) => {
  return (
    <div className="asg-meta-cards-row">
      {/* Due Date Card */}
      <div className="asg-meta-card">
        <div className="asg-meta-icon-box" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
          <i className="bi bi-calendar-event"></i>
        </div>
        <div>
          <div className="asg-meta-title">Hạn nộp</div>
          <div className="asg-meta-val" id="asgDueDate">{asg.dueDate}</div>
        </div>
      </div>

      {/* Score Card (Visible when submitted) */}
      {currentStatus === 'submitted' && (
        <div className="asg-meta-card" id="asgScoreCard">
          <div className="asg-meta-icon-box" style={{ backgroundColor: '#FFF7ED', color: '#F59E0B' }}>
            <i className="bi bi-star-fill"></i>
          </div>
          <div>
            <div className="asg-meta-title">Điểm số</div>
            <div className="asg-meta-val" id="asgScoreValue">{asg.score || '8.5 / 10'}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentMetaCards;
