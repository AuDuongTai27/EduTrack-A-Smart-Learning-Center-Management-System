import React from 'react';

export const CoursesSection: React.FC = () => {
  return (
    <section id="courses" className="courses section">

      {/* Section Title */}
      <div className="container section-title aos-init aos-animate" data-aos="fade-up">
        <h2>Khóa học </h2>
        <p>Khóa học</p>
      </div>{/* End Section Title */}

      <div className="container">

        <div className="row">

          <div className="col-lg-4 col-md-6 d-flex align-items-stretch aos-init aos-animate" data-aos="zoom-in"
            data-aos-delay="100">
            <div className="course-item">
              <img src="/assets/img/course-1.webp" className="img-fluid" alt="..." />
              <div className="course-content">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <p className="category">Web Development</p>
                  <p className="price">$169</p>
                </div>

                <h3><a href="https://bootstrapmade.com/content/demo/Mentor/course-details.html">Website Design</a></h3>
                <p className="description">Et architecto provident deleniti facere repellat nobis iste. Id facere quia quae
                  dolores dolorem tempore.</p>
                <div className="trainer d-flex justify-content-between align-items-center">
                  <div className="trainer-profile d-flex align-items-center">
                    <img src="/assets/img/person-m-7.webp" className="img-fluid" alt="" />
                    <a href="https://bootstrapmade.com/content/demo/Mentor/" className="trainer-link">Antonio</a>
                  </div>
                  <div className="trainer-rank d-flex align-items-center">
                    <i className="bi bi-person user-icon"></i>&nbsp;50
                    &nbsp;&nbsp;
                    <i className="bi bi-heart heart-icon"></i>&nbsp;65
                  </div>
                </div>
              </div>
            </div>
          </div> {/* End Course Item */}

          <div className="col-lg-4 col-md-6 d-flex align-items-stretch mt-4 mt-md-0 aos-init aos-animate" data-aos="zoom-in"
            data-aos-delay="200">
            <div className="course-item">
              <img src="/assets/img/course-2.webp" className="img-fluid" alt="..." />
              <div className="course-content">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <p className="category">Marketing</p>
                  <p className="price">$250</p>
                </div>

                <h3><a href="https://bootstrapmade.com/content/demo/Mentor/course-details.html">Search Engine
                    Optimization</a></h3>
                <p className="description">Et architecto provident deleniti facere repellat nobis iste. Id facere quia quae
                  dolores dolorem tempore.</p>
                <div className="trainer d-flex justify-content-between align-items-center">
                  <div className="trainer-profile d-flex align-items-center">
                    <img src="/assets/img/person-f-14.webp" className="img-fluid" alt="" />
                    <a href="https://bootstrapmade.com/content/demo/Mentor/" className="trainer-link">Lana</a>
                  </div>
                  <div className="trainer-rank d-flex align-items-center">
                    <i className="bi bi-person user-icon"></i>&nbsp;35
                    &nbsp;&nbsp;
                    <i className="bi bi-heart heart-icon"></i>&nbsp;42
                  </div>
                </div>
              </div>
            </div>
          </div> {/* End Course Item */}

          <div className="col-lg-4 col-md-6 d-flex align-items-stretch mt-4 mt-lg-0 aos-init aos-animate" data-aos="zoom-in"
            data-aos-delay="300">
            <div className="course-item">
              <img src="/assets/img/course-3.webp" className="img-fluid" alt="..." />
              <div className="course-content">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <p className="category">Content</p>
                  <p className="price">$180</p>
                </div>

                <h3><a href="https://bootstrapmade.com/content/demo/Mentor/course-details.html">Copywriting</a></h3>
                <p className="description">Et architecto provident deleniti facere repellat nobis iste. Id facere quia quae
                  dolores dolorem tempore.</p>
                <div className="trainer d-flex justify-content-between align-items-center">
                  <div className="trainer-profile d-flex align-items-center">
                    <img src="/assets/img/person-m-12.webp" className="img-fluid" alt="" />
                    <a href="https://bootstrapmade.com/content/demo/Mentor/" className="trainer-link">Brandon</a>
                  </div>
                  <div className="trainer-rank d-flex align-items-center">
                    <i className="bi bi-person user-icon"></i>&nbsp;20
                    &nbsp;&nbsp;
                    <i className="bi bi-heart heart-icon"></i>&nbsp;85
                  </div>
                </div>
              </div>
            </div>
          </div> {/* End Course Item */}

        </div>

      </div>

    </section>
  );
};

export default CoursesSection;
