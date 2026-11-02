import React from 'react';
import type { SubjectDto } from '../../../BLL/models/SubjectDto';
import type { LandingSubjectItemDto } from '../../../BLL/models/LandingOverviewDto';

export interface FeaturesSectionProps {
  subjects?: Array<SubjectDto | LandingSubjectItemDto>;
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
    { icon: 'bi-calculator', color: '#2563eb' },
    { icon: 'bi-lightning-charge', color: '#d97706' },
    { icon: 'bi-droplet-half', color: '#dc2626' },
    { icon: 'bi-translate', color: '#0d9488' },
    { icon: 'bi-flower1', color: '#ea580c' },
    { icon: 'bi-cpu', color: '#7c3aed' },
    { icon: 'bi-book', color: '#0284c7' },
    { icon: 'bi-globe', color: '#16a34a' },
  ];

  const displaySubjects = (subjects && subjects.length > 0) ? subjects : DEFAULT_SUBJECTS;

  return (
    <section id="features" className="features section light-background py-5">
      <div className="container section-title aos-init aos-animate text-center mb-5" data-aos="fade-up">
        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-1.5 rounded-pill fw-medium mb-2">
          Chương trình đào tạo
        </span>
        <h2 className="fw-bold fs-2 text-dark">Các môn học trọng điểm tại EduTrack</h2>
        <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
          Được thiết kế bám sát chuẩn kiến thức của Bộ GD&ĐT kết hợp phương pháp tư duy số và ứng dụng thực tiễn.
        </p>
      </div>

      <div className="container">
        <div className="row g-4">
          {displaySubjects.map((sub, idx) => {
            const styleItem = iconPalette[idx % iconPalette.length];
            return (
              <div
                key={sub.subjectId || idx}
                className="col-lg-3 col-md-4 col-sm-6 aos-init aos-animate"
                data-aos="fade-up"
                data-aos-delay={(idx + 1) * 80}
              >
                <div className="features-item d-flex align-items-center gap-3 p-3.5 shadow-sm rounded-4 bg-white h-100 border border-light">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: `${styleItem.color}15`,
                    }}
                  >
                    <i className={`bi ${styleItem.icon} fs-4`} style={{ color: styleItem.color }}></i>
                  </div>
                  <div>
                    <h3 className="fs-6 fw-bold mb-1">
                      <a href="#courses" className="stretched-link text-decoration-none text-dark hover-success">
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
