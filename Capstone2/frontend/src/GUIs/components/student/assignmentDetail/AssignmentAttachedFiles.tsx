import React from 'react';

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
  const realFile = fileUrl
    ? {
        id: -1,
        name: decodeURIComponent(fileUrl.split('?')[0].split('/').pop() || fileName || 'Attachment'),
        size: 'Attachment',
        type: 'pdf',
        icon: 'bi-file-earmark-text-fill',
        iconBg: '#fee2e2',
        iconColor: '#dc2626',
      }
    : null;

  return (
    <section className="mb-4">
      <h2 className="asg-section-heading">Attached Materials</h2>
      <div className="asg-attached-files-card">
        {realFile ? (
          <div className="asg-file-item">
            <div
              className="asg-file-icon"
              style={{ backgroundColor: realFile.iconBg, color: realFile.iconColor }}
            >
              <i className={`bi ${realFile.icon}`}></i>
            </div>
            <div className="asg-file-info">
              <div className="asg-file-name" title={realFile.name}>
                {realFile.name}
              </div>
              <div className="asg-file-size">{realFile.size}</div>
            </div>
            <button
              type="button"
              className="btn-file-download border-0"
              onClick={() => onDownload(realFile.name, fileUrl || undefined)}
            >
              <i className="bi bi-download"></i>
              <span>Download</span>
            </button>
          </div>
        ) : (
          <p className="text-muted small mb-0 p-2">No attached materials for this assignment.</p>
        )}
      </div>
    </section>
  );
};

export default AssignmentAttachedFiles;
