import React from 'react';

export const CountsSection: React.FC = () => {
  return (
    <section id="counts" className="section counts light-background">

      <div className="container aos-init aos-animate" data-aos="fade-up" data-aos-delay="100">

        <div className="row gy-4">

          <div className="col-lg-3 col-md-6">
            <div className="stats-item text-center w-100 h-100">
              <span data-purecounter-start="0" data-purecounter-end="1232" data-purecounter-duration="0"
                className="purecounter">1232</span>
              <p>Students</p>
            </div>
          </div>{/* End Stats Item */}

          <div className="col-lg-3 col-md-6">
            <div className="stats-item text-center w-100 h-100">
              <span data-purecounter-start="0" data-purecounter-end="64" data-purecounter-duration="0"
                className="purecounter">64</span>
              <p>Courses</p>
            </div>
          </div>{/* End Stats Item */}

          <div className="col-lg-3 col-md-6">
            <div className="stats-item text-center w-100 h-100">
              <span data-purecounter-start="0" data-purecounter-end="42" data-purecounter-duration="0"
                className="purecounter">42</span>
              <p>Events</p>
            </div>
          </div>{/* End Stats Item */}

          <div className="col-lg-3 col-md-6">
            <div className="stats-item text-center w-100 h-100">
              <span data-purecounter-start="0" data-purecounter-end="24" data-purecounter-duration="0"
                className="purecounter">24</span>
              <p>Trainers</p>
            </div>
          </div>{/* End Stats Item */}

        </div>

      </div>

    </section>
  );
};

export default CountsSection;
