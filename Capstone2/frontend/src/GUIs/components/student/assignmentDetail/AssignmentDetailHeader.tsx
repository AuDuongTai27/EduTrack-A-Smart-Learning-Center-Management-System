import React from 'react';
import { Link } from 'react-router-dom';
import type { AssignmentDetailItem, SubmissionStatus } from './assignmentDetailData';

interface AssignmentDetailHeaderProps {
  asg: AssignmentDetailItem;
  currentStatus: SubmissionStatus;
}

export const AssignmentDetailHeader: React.FC<AssignmentDetailHeaderProps> = ({
  asg,
  currentStatus,
}) => {
  return (
    <>
      {/* 1. Back Link */}
      <Link to={`/student/classes/${asg.classId || 1}`} className="btn-back-page" id="btnBackToClass">
        <i className="bi bi-arrow-left"></i>
        <span>Quay lại lớp học</span>
      </Link>

      {/* 2. Assignment Header */}
      <div className="asg-detail-header">
        <div className="asg-detail-title-row">
          <h1 className="asg-detail-title" id="asgTitle">
            {asg.title}
          </h1>
          {currentStatus === 'not-submitted' && (
            <span className="asg-status-badge asg-status-chuanop" id="asgStatusBadge">
              <i className="bi bi-clock"></i>
              <span>Chưa nộp</span>
            </span>
          )}
          {currentStatus === 'submitted' && (
            <span className="asg-status-badge asg-status-danop" id="asgStatusBadge">
              <i className="bi bi-check-circle"></i>
              <span>Đã nộp</span>
            </span>
          )}
          {currentStatus === 'overdue' && (
            <span className="asg-status-badge asg-status-quahan" id="asgStatusBadge">
              <i className="bi bi-exclamation-circle"></i>
              <span>Quá hạn</span>
            </span>
          )}
        </div>
        <p className="asg-detail-class-info" id="asgClassInfo">
          {asg.class}
        </p>
      </div>
    </>
  );
};

export default AssignmentDetailHeader;
