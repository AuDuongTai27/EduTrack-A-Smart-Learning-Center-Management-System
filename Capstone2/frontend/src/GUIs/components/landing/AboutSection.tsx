import React from 'react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="about section">

      <div className="container">

        <div className="row gy-4">

          <div className="col-lg-6 order-1 order-lg-2 aos-init aos-animate" data-aos="fade-up" data-aos-delay="100">
            <img src="/assets/img/about.jpg" className="img-fluid" alt="" />
          </div>

          <div className="col-lg-6 order-2 order-lg-1 content aos-init aos-animate" data-aos="fade-up" data-aos-delay="200">
            <h3>Thông tin của trung tâm</h3>
            <p className="fst-italic">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore
              magna aliqua.
            </p>
            <ul>
              <li><i className="bi bi-check-circle"></i> <span>Ullamco laboris nisi ut aliquip ex ea commodo
                  consequat.</span></li>
              <li><i className="bi bi-check-circle"></i> <span>Duis aute irure dolor in reprehenderit in voluptate
                  velit.</span></li>
              <li><i className="bi bi-check-circle"></i> <span>Ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis
                  aute irure dolor in reprehenderit in voluptate trideta storacalaperda mastiro dolore eu fugiat nulla
                  pariatur.</span></li>
            </ul>
            <a href="https://bootstrapmade.com/content/demo/Mentor/#" className="read-more"><span>Read More</span><i
                className="bi bi-arrow-right"></i></a>
          </div>

        </div>

      </div>

    </section>
  );
};

export default AboutSection;
