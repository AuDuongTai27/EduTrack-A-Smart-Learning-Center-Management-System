import React from 'react';
import type { CenterSettingDto } from '../../../BLL/models/CenterSettingDto';
import { centerSettingDAL } from '../../../DAL/centerSettingDAL';

export interface AboutSectionProps {
  settings?: CenterSettingDto[];
}

export function AboutSection({ settings = [] }: AboutSectionProps) {
  const centerName = centerSettingDAL.getSettingValue(settings, 'center_name', 'EduTrack Smart Learning Center');
  const centerAddress = centerSettingDAL.getSettingValue(settings, 'center_address', '123 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh');
  const hotline = centerSettingDAL.getSettingValue(settings, 'center_hotline', '1900 6868');
  const academicYear = centerSettingDAL.getSettingValue(settings, 'academic_year', '2026 - 2027');

  return (
    <section id="about" className="about section">
      <div className="container">
        <div className="row gy-4 align-items-center">
          <div className="col-lg-6 order-1 order-lg-2 aos-init aos-animate" data-aos="fade-up" data-aos-delay="100">
            <img src="/assets/img/about.jpg" className="img-fluid rounded-4 shadow-sm" alt={centerName} />
          </div>

          <div className="col-lg-6 order-2 order-lg-1 content aos-init aos-animate" data-aos="fade-up" data-aos-delay="200">
            <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-medium mb-3">
              Năm học {academicYear}
            </span>
            <h3 className="fw-bold mb-3">{centerName}</h3>
            <p className="fst-italic text-secondary mb-4">
              Hệ thống quản lý trung tâm bồi dưỡng văn hóa và kỹ năng số hàng đầu, đồng hành cùng học sinh và phụ huynh trong kỷ nguyên số.
            </p>
            <ul className="list-unstyled d-flex flex-column gap-3 mb-4">
              <li className="d-flex align-items-start gap-2">
                <i className="bi bi-geo-alt-fill text-primary fs-5"></i>
                <span><strong>Trụ sở chính:</strong> {centerAddress}</span>
              </li>
              <li className="d-flex align-items-start gap-2">
                <i className="bi bi-telephone-fill text-success fs-5"></i>
                <span><strong>Hotline tư vấn tuyển sinh:</strong> {hotline}</span>
              </li>
              <li className="d-flex align-items-start gap-2">
                <i className="bi bi-robot text-info fs-5"></i>
                <span><strong>Hệ thống quản lý & Chấm bài AI:</strong> Đánh giá tiến độ học tập và gợi ý bài tập nâng cao tự động.</span>
              </li>
            </ul>
            <a href="#courses" className="btn btn-primary px-4 py-2 rounded-pill d-inline-flex align-items-center gap-2">
              <span>Khám phá khóa học</span>
              <i className="bi bi-arrow-right"></i>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
