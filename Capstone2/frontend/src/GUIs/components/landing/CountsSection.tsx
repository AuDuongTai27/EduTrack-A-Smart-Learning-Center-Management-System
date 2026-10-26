import React from 'react';

export interface CountsSectionProps {
  studentCount?: number;
  courseCount?: number;
  eventCount?: number;
  trainerCount?: number;
}

export function CountsSection({
  studentCount = 1232,
  courseCount = 64,
  eventCount = 42,
  trainerCount = 24,
}: CountsSectionProps) {
  return (
    <section id="counts" className="section counts light-background">
      <div className="container aos-init aos-animate" data-aos="fade-up" data-aos-delay="100">
        <div className="row gy-4">
          <div className="col-lg-3 col-md-6">
            <div className="stats-item text-center w-100 h-100">
              <span className="purecounter">{studentCount}</span>
              <p>Học sinh (Students)</p>
            </div>
          </div>{/* End Stats Item */}

          <div className="col-lg-3 col-md-6">
            <div className="stats-item text-center w-100 h-100">
              <span className="purecounter">{courseCount}</span>
              <p>Khóa học & Lớp (Courses)</p>
            </div>
          </div>{/* End Stats Item */}

          <div className="col-lg-3 col-md-6">
            <div className="stats-item text-center w-100 h-100">
              <span className="purecounter">{eventCount}</span>
              <p>Ca học & Sự kiện (Sessions)</p>
            </div>
          </div>{/* End Stats Item */}

          <div className="col-lg-3 col-md-6">
            <div className="stats-item text-center w-100 h-100">
              <span className="purecounter">{trainerCount}</span>
              <p>Giảng viên (Trainers)</p>
            </div>
          </div>{/* End Stats Item */}
        </div>
      </div>
    </section>
  );
}

export default CountsSection;
