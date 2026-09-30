import React from 'react';

export const HeroSection: React.FC = () => {
  return (
    <section id="hero" className="hero section dark-background">

      <img src="/assets/img/hero-bg.jpg" alt="" data-aos="fade-in" className="aos-init aos-animate" />

      <div className="container">
        <h2 data-aos="fade-up" data-aos-delay="100" className="aos-init aos-animate">Tên trung tâm<br />Slogan
        </h2>
        <p data-aos="fade-up" data-aos-delay="200" className="aos-init aos-animate">Mô tả ngắn về trung tâm</p>
        <div className="d-flex mt-4 aos-init aos-animate" data-aos="fade-up" data-aos-delay="300">
          <a href="#" className="btn-get-started me-3" data-bs-toggle="modal" data-bs-target="#loginModal">Đăng nhập
            ngay</a>
        </div>
      </div>

    </section>
  );
};

export default HeroSection;
