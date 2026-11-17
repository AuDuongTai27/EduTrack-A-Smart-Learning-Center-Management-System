import React from 'react';
import type { MaterialItem } from './classDetailData';
import { ClassMaterialRow } from './components/ClassMaterialRow';

interface ClassMaterialsSectionProps {
  materials: MaterialItem[];
  onDownload: (fileName: string, fileUrl?: string) => void;
  classId?: number;
}

export function ClassMaterialsSection({
  materials,
  onDownload,
  classId,
}: ClassMaterialsSectionProps) {
  const handleDownloadAllZip = () => {
    const targetClassId = classId || (materials.length > 0 ? materials[0].classId : undefined);
    if (!targetClassId) return;
    window.open(`/api/learning/student/classes/${targetClassId}/materials/download-all`, '_blank');
  };

  return (
    <section className="materials-section">
      <div className="section-header d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="section-title-wrap d-flex align-items-center gap-2">
          <h2 className="section-title m-0">Materials</h2>
          <span className="section-count-badge" id="materialsCountBadge">
            {materials.length} {materials.length === 1 ? 'material' : 'materials'}
          </span>
        </div>
        {materials.length > 0 && (
          <button
            type="button"
            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-2 px-3 py-1 fw-medium"
            style={{ borderRadius: '8px' }}
            title="Download all lecture materials for this class as a .zip file"
            onClick={handleDownloadAllZip}
          >
            <i className="bi bi-file-earmark-zip fs-6"></i>
            <span>Tải toàn bộ (.zip)</span>
          </button>
        )}
      </div>

      <div id="materialsList">
        {materials.map((mat) => (
          <ClassMaterialRow key={mat.id} material={mat} onDownload={onDownload} />
        ))}
      </div>
    </section>
  );
};

export default ClassMaterialsSection;
