import React from 'react';
import type { MaterialItem } from './classDetailData';
import { ClassMaterialRow } from './components/ClassMaterialRow';

interface ClassMaterialsSectionProps {
  materials: MaterialItem[];
  onDownload: (fileName: string) => void;
}

export function ClassMaterialsSection({
  materials,
  onDownload,
}: ClassMaterialsSectionProps) {
  return (
    <section className="materials-section">
      <div className="section-header">
        <div className="section-title-wrap">
          <h2 className="section-title">Tài liệu học tập</h2>
          <span className="section-count-badge" id="materialsCountBadge">
            {materials.length} tài liệu
          </span>
        </div>
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
