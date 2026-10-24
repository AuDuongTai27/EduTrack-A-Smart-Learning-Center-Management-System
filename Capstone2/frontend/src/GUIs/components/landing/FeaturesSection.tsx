import React from 'react';
import type { SubjectDto } from '../../../BLL/models/SubjectDto';

export interface FeaturesSectionProps {
  subjects?: SubjectDto[];
}

const DEFAULT_SUBJECTS: SubjectDto[] = [
  { subjectId: 1, subjectCode: 'MATH', subjectName: 'Toán Học (Mathematics)', description: 'Đại số, Hình học & Giải tích' },
  { subjectId: 2, subjectCode: 'PHYS', subjectName: 'Vật Lý (Physics)', description: 'Cơ học, Nhiệt học & Điện từ' },
  { subjectId: 3, subjectCode: 'CHEM', subjectName: 'Hóa Học (Chemistry)', description: 'Hóa vô cơ, Hữu cơ & Thí nghiệm' },
  { subjectId: 4, subjectCode: 'ENG', subjectName: 'Tiếng Anh (English)', description: 'Ngữ pháp, Giao tiếp & Luyện thi IELTS' },
  { subjectId: 5, subjectCode: 'BIO', subjectName: 'Sinh Học (Biology)', description: 'Di truyền học & Sinh thái học' },
  { subjectId: 6, subjectCode: 'IT', subjectName: 'Tin Học & AI (Computer Science)', description: 'Lập trình tư duy & Công nghệ số' },
  { subjectId: 7, subjectCode: 'LIT', subjectName: 'Ngữ Văn (Literature)', description: 'Tác phẩm văn học & Kỹ năng nghị luận' },
  { subjectId: 8, subjectCode: 'HIST', subjectName: 'Lịch Sử & Địa Lý', description: 'Kiến thức xã hội & Lịch sử văn minh' },
];

export function FeaturesSection({ subjects }: FeaturesSectionProps) {
  const iconPalette = [
    { icon: 'bi-calculator', color: '#5578ff' },
    { icon: 'bi-lightning-charge', color: '#ffbb2c' },
    { icon: 'bi-droplet-half', color: '#e80368' },
    { icon: 'bi-translate', color: '#11dbcf' },
    { icon: 'bi-flower1', color: '#ffa76e' },
    { icon: 'bi-cpu', color: '#e361ff' },
    { icon: 'bi-book', color: '#47aeff' },
    { icon: 'bi-globe', color: '#20c997' },
  ];

  const displaySubjects = (subjects && subjects.length > 0) ? subjects : DEFAULT_SUBJECTS;

  return (
    <section id="features" className="features section">
      <div className="container section-title aos-init aos-animate" data-aos="fade-up">
        <h2>Chương trình đào tạo</h2>
        <p>Các môn học trọng điểm tại EduTrack</p>
      </div>

      <div className="container">
        <div className="row gy-4">
          {displaySubjects.map((sub, idx) => {
            const styleItem = iconPalette[idx % iconPalette.length];
            return (
              <div
                key={sub.subjectId || idx}
                className="col-lg-3 col-md-4 aos-init aos-animate"
                data-aos="fade-up"
                data-aos-delay={(idx + 1) * 100}
              >
                <div className="features-item d-flex align-items-center gap-3 p-3 shadow-sm rounded-3 bg-white h-100 border">
                  <i className={`bi ${styleItem.icon} fs-3 flex-shrink-0`} style={{ color: styleItem.color }}></i>
                  <div>
                    <h3 className="fs-6 fw-bold mb-1">
                      <a href="#courses" className="stretched-link text-decoration-none text-dark">
                        {sub.subjectName}
                      </a>
                    </h3>
                    <small className="text-muted d-block">{sub.description || `Mã môn: ${sub.subjectCode}`}</small>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
