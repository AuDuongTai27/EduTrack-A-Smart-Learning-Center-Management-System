import React from 'react';
import type { MaterialItem } from '../classDetailData';

export interface ClassMaterialRowProps {
  material: MaterialItem;
  onDownload: (fileName: string) => void;
}

export function ClassMaterialRow({
  material: mat,
  onDownload,
}: ClassMaterialRowProps) {
  let tagClass = 'file-tag-pdf';
  let icon = 'bi-file-earmark-text';
  if (mat.type === 'DOC') {
    tagClass = 'file-tag-doc';
    icon = 'bi-file-earmark-word';
  } else if (mat.type === 'PPT') {
    tagClass = 'file-tag-ppt';
    icon = 'bi-file-earmark-slides';
  } else if (mat.type === 'IMG') {
    tagClass = 'file-tag-img';
    icon = 'bi-file-earmark-image';
  }

  return (
    <div className="material-row">
      <div className={`file-type-tag ${tagClass}`}>
        <i className={`bi ${icon}`}></i>
        <span>{mat.type}</span>
      </div>
      <div className="material-details">
        <h4 className="material-filename" title={mat.fileName}>
          {mat.fileName}
        </h4>
        <p className="material-desc">{mat.description}</p>
      </div>
      <div className="material-meta">
        <p className="material-date">{mat.uploadDate}</p>
        <p className="material-uploader">
          bởi {mat.uploadedBy} &middot; {mat.sizeMb} MB
        </p>
      </div>
      <button
        type="button"
        className="btn-download-mat"
        onClick={() => onDownload(mat.fileName)}
      >
        <i className="bi bi-download"></i>
        <span>Tải xuống</span>
      </button>
    </div>
  );
};

export default ClassMaterialRow;
