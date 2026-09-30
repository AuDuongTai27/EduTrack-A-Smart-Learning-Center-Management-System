import React from 'react';
import { ATTACHED_FILES } from './assignmentDetailData';
import type { AttachedFileItem } from './assignmentDetailData';

interface AssignmentAttachedFilesProps {
  onDownload: (fileName: string) => void;
}

export const AssignmentAttachedFiles: React.FC<AssignmentAttachedFilesProps> = ({
  onDownload,
}) => {
  return (
    <section className="mb-4">
      <h2 className="asg-section-heading">Tài liệu đính kèm</h2>
      <div className="asg-attached-files-card">
        {ATTACHED_FILES.map((file: AttachedFileItem) => (
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
              onClick={() => onDownload(file.name)}
            >
              <i className="bi bi-download"></i>
              <span>Tải xuống</span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AssignmentAttachedFiles;
