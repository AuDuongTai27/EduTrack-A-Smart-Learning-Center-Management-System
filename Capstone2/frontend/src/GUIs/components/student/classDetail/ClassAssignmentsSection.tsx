import React from 'react';
import type { AssignmentItem } from './classDetailData';
import { ClassAssignmentRow } from './components/ClassAssignmentRow';

interface ClassAssignmentsSectionProps {
  assignments: AssignmentItem[];
}

export function ClassAssignmentsSection({
  assignments,
}: ClassAssignmentsSectionProps) {
  const asgCounts = {
    submitted: assignments.filter((a) => a.status === 'Đã nộp').length,
    pending: assignments.filter((a) => a.status === 'Chưa nộp').length,
    overdue: assignments.filter((a) => a.status === 'Quá hạn').length,
  };

  return (
    <section className="assignments-section">
      <div className="section-header flex-wrap gap-2">
        <div className="section-title-wrap">
          <h2 className="section-title">Assignments</h2>
          <span className="section-count-badge" id="assignmentsCountBadge">
            {assignments.length} {assignments.length === 1 ? 'assignment' : 'assignments'}
          </span>
        </div>
        <div className="d-flex align-items-center gap-2" id="asgSummaryBadges">
          <span className="asg-status-badge asg-status-danop">
            {asgCounts.submitted} Submitted
          </span>
          <span className="asg-status-badge asg-status-chuanop">
            {asgCounts.pending} Not Submitted
          </span>
          <span className="asg-status-badge asg-status-quahan">
            {asgCounts.overdue} Overdue
          </span>
        </div>
      </div>

      <div id="assignmentsList">
        {assignments.map((asg) => (
          <ClassAssignmentRow key={asg.id} assignment={asg} />
        ))}
      </div>
    </section>
  );
};

export default ClassAssignmentsSection;
