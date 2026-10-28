import React from 'react';
import type { SubmissionStatus } from './assignmentDetailData';
import type { StudentSubmissionDetailApiDto } from '../../../api/learningApi';
import { AssignmentDropzone } from './components/AssignmentDropzone';
import { SubmittedFileCard } from './components/SubmittedFileCard';
import { OverdueAlertBox } from './components/OverdueAlertBox';

interface AssignmentSubmissionSectionProps {
  status: SubmissionStatus;
  submittedFileName: string;
  submittedMeta: string;
  dueDate: string;
  submission?: StudentSubmissionDetailApiDto | null;
  onSubmit: (file: File | null) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function AssignmentSubmissionSection({
  status,
  submittedFileName,
  submittedMeta,
  dueDate,
  submission,
  onSubmit,
  onEdit,
  onDelete,
}: AssignmentSubmissionSectionProps) {
  return (
    <section>
      <h2 className="asg-section-heading">Nộp bài & Kết quả chấm</h2>

      {status === 'not-submitted' && <AssignmentDropzone onSubmit={onSubmit} />}

      {status === 'submitted' && (
        <SubmittedFileCard
          fileName={submittedFileName}
          meta={submittedMeta}
          submission={submission}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}

      {status === 'overdue' && <OverdueAlertBox dueDate={dueDate} />}
    </section>
  );
}

export default AssignmentSubmissionSection;
