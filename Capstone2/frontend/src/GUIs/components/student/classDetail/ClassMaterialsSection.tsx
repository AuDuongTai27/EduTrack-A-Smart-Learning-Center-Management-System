import React from 'react';
import type { MaterialItem } from './classDetailData';

interface ClassMaterialsSectionProps {
  materials: MaterialItem[];
  onDownload: (fileName: string) => void;
}

export const ClassMaterialsSection: React.FC<ClassMaterialsSectionProps> = ({
  materials,
  onDownload,
}) => {
  return (
    <section className="materials-section">
      <div className="section-header">
        <div className="section-title-wrap">
          <h2 className="section-title">Tài liệu &amp; Lý thuyết</h2>
          <span className="section-count-badge" id="materialsCountBadge">
            {materials.length} tài liệu
          </span>
        </div>
      </div>

      {/* Material Items List */}
      <div id="materialsList">
        {materials.map((mat) => {
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
            <div key={mat.id} className="material-row">
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
                  bởi {mat.uploadedBy} · {mat.sizeMb} MB
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
        })}
      </div>
    </section>
  );
};

export default ClassMaterialsSection;
