import React from 'react';
import { ATTACHED_FILES } from './assignmentDetailData';
import type { AttachedFileItem } from './assignmentDetailData';

interface AssignmentAttachedFilesProps {
  onDownload: (fileName: string, fileUrl?: string) => void;
  fileUrl?: string | null;
  fileName?: string;
}

export function AssignmentAttachedFiles({
  onDownload,
  fileUrl,
  fileName,
}: AssignmentAttachedFilesProps) {
  const realFile: AttachedFileItem | null = fileUrl
    ? {
        id: -1,
        name: fileName ? `${fileName}.pdf` : 'Assignment_Instructions_and_Prompt.pdf',
        size: '1.2 MB',
        type: 'pdf',
        icon: 'bi-file-earmark-pdf-fill',
        iconBg: '#fee2e2',
        iconColor: '#dc2626',
      }
    : null;

  const filesToDisplay = realFile ? [realFile, ...ATTACHED_FILES] : ATTACHED_FILES;

  return (
    <section className="mb-4">
      <h2 className="asg-section-heading">Attached Materials</h2>
      <div className="asg-attached-files-card">
        {filesToDisplay.map((file: AttachedFileItem) => (
          <div key={file.id} className="asg-file-item">
            <div
              className="asg-file-icon"
              style={{ backgroundColor: file.iconBg, color: file.iconColor }}
            >
              <i className={`bi ${file.icon}`}></i>
            </div>
            <div className="asg-file-info">
              <div className="asg-file-name" title={file.name}>
                {file.name}
              </div>
              <div className="asg-file-size">{file.size}</div>
            </div>
            <button
              type="button"
              className="btn-file-download border-0"
              onClick={() => onDownload(file.name, file.id === -1 ? (fileUrl || undefined) : undefined)}
            >
              <i className="bi bi-download"></i>
              <span>Download</span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AssignmentAttachedFiles;
