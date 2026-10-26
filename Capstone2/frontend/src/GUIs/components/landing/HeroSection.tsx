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
        <div className="d-flex mt-4 aos-init aos-animate" data-aos="fade-up" data-aos-delay="300">
          <button
            type="button"
            className="btn-get-started me-3 border-0"
            onClick={onOpenLogin}
          >
            Đăng nhập ngay
          </button>
          <a href="#courses" className="btn btn-outline-light rounded-pill px-4 py-2 d-inline-flex align-items-center">
            Xem khóa học
          </a>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
