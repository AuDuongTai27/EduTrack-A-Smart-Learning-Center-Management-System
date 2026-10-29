import React from 'react';

export interface HeroSectionProps {
  centerName?: string;
  slogan?: string;
  onOpenLogin?: () => void;
}

export function HeroSection({
  centerName = 'EduTrack Smart Learning Center',
  slogan = 'Đồng Hành Cùng Tri Thức - Nâng Tầm Tương Lai',
  onOpenLogin,
}: HeroSectionProps) {
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
    <section id="hero" className="hero section dark-background">
      <img src="/assets/img/hero-bg.jpg" alt={centerName} data-aos="fade-in" className="aos-init aos-animate" />

      <div className="container">
        <h2 data-aos="fade-up" data-aos-delay="100" className="aos-init aos-animate">
          {centerName}<br />
          <span className="fs-3 fw-normal opacity-75">{slogan}</span>
        </h2>
        <p data-aos="fade-up" data-aos-delay="200" className="aos-init aos-animate">
          Nền tảng quản lý học tập, lịch học, điểm danh và chấm bài tự động bằng AI thế hệ mới.
        </p>
        <div className="d-flex align-items-center flex-wrap gap-3 mt-4 aos-init aos-animate" data-aos="fade-up" data-aos-delay="300">
          <button
            type="button"
            className="btn btn-success rounded-pill px-4 py-2.5 fw-semibold d-inline-flex align-items-center shadow-sm"
            onClick={onOpenLogin}
          >
            <i className="bi bi-box-arrow-in-right me-2"></i>
            Đăng nhập ngay
          </button>
          <a
            href="#courses"
            onClick={handleScrollToCourses}
            className="btn btn-outline-light rounded-pill px-4 py-2.5 fw-semibold d-inline-flex align-items-center"
          >
            Xem khóa học
            <i className="bi bi-arrow-down-short ms-1 fs-5"></i>
          </a>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
