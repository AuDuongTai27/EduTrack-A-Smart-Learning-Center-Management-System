import React from 'react';
import type { CenterSettingDto } from '../../../BLL/models/CenterSettingDto';
import type { LandingCenterInfoDto } from '../../../BLL/models/LandingOverviewDto';
import { centerSettingDAL } from '../../../DAL/centerSettingDAL';

export interface AboutSectionProps {
  settings?: CenterSettingDto[];
  centerInfo?: LandingCenterInfoDto;
}

export function AboutSection({ settings = [], centerInfo }: AboutSectionProps) {
  const centerName = centerInfo?.centerName || centerSettingDAL.getSettingValue(settings, 'center_name', 'EduTrack Smart Learning Center');
  const centerAddress = centerInfo?.address || centerSettingDAL.getSettingValue(settings, 'center_address', '123 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh');
  const hotline = centerInfo?.hotline || centerSettingDAL.getSettingValue(settings, 'center_hotline', '1900 6868');
  const academicYear = centerInfo?.academicYear || centerSettingDAL.getSettingValue(settings, 'academic_year', '2026 - 2027');

  const handleScrollToCourses = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById('courses');
    if (element) {
      const header = document.getElementById('header');
      const headerOffset = header ? header.offsetHeight : 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section id="about" className="about section py-5">
      <div className="container">
        <div className="row gy-4 align-items-center">
          <div className="col-lg-6 order-1 order-lg-2 aos-init aos-animate" data-aos="fade-up" data-aos-delay="100">
            <div className="position-relative">
              <img src="/assets/img/about.jpg" className="img-fluid rounded-4 shadow" alt={centerName} />
              <div className="position-absolute bottom-0 start-0 m-3 p-3 bg-white bg-opacity-95 rounded-4 shadow-sm d-flex align-items-center gap-3 border">
                <div className="rounded-circle bg-success-subtle text-success p-2 d-flex align-items-center justify-content-center" style={{ width: '44px', height: '44px' }}>
                  <i className="bi bi-shield-check fs-4"></i>
                </div>
                <div>
                  <div className="fw-bold small text-dark">Chất lượng kiểm định</div>
                  <small className="text-muted" style={{ fontSize: '12px' }}>100% Giảng viên đạt chuẩn sư phạm</small>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6 order-2 order-lg-1 content aos-init aos-animate" data-aos="fade-up" data-aos-delay="200">
            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2 rounded-pill fw-medium mb-3">
              Năm học {academicYear}
            </span>
            <h3 className="fw-bold mb-3">{centerName}</h3>
            <p className="fst-italic text-secondary mb-4">
              Hệ thống quản lý trung tâm bồi dưỡng văn hóa và kỹ năng số hàng đầu, đồng hành cùng học sinh và phụ huynh trong kỷ nguyên số.
            </p>
            <ul className="list-unstyled d-flex flex-column gap-3 mb-4">
              <li className="d-flex align-items-start gap-3">
                <i className="bi bi-geo-alt-fill text-success fs-5"></i>
                <span><strong>Trụ sở chính:</strong> {centerAddress}</span>
              </li>
              <li className="d-flex align-items-start gap-3">
                <i className="bi bi-telephone-fill text-success fs-5"></i>
                <span><strong>Hotline tư vấn tuyển sinh:</strong> {hotline}</span>
              </li>
              <li className="d-flex align-items-start gap-3">
                <i className="bi bi-robot text-primary fs-5"></i>
                <span><strong>Hệ thống quản lý & Chấm bài AI:</strong> Đánh giá tiến độ học tập và gợi ý bài tập nâng cao tự động.</span>
              </li>
            </ul>
            <a
              href="#courses"
              onClick={handleScrollToCourses}
              className="btn btn-success px-4 py-2.5 rounded-pill fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
            >
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
