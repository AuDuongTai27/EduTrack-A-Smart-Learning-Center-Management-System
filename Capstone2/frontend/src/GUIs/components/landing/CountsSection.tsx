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
  const stats = [
    {
      count: studentCount,
      suffix: '+',
      label: 'Học sinh đang theo học',
      sublabel: 'Trên toàn hệ thống trung tâm',
      icon: 'bi-people-fill',
      colorClass: 'text-primary',
      bgClass: 'bg-primary-subtle',
      delay: 100,
    },
    {
      count: courseCount,
      suffix: '+',
      label: 'Lớp học & Khóa đào tạo',
      sublabel: 'Các cấp độ từ cơ bản đến nâng cao',
      icon: 'bi-mortarboard-fill',
      colorClass: 'text-success',
      bgClass: 'bg-success-subtle',
      delay: 200,
    },
    {
      count: eventCount,
      suffix: '+',
      label: 'Ca học & Lịch học/tuần',
      sublabel: 'Khung giờ linh hoạt theo ca',
      icon: 'bi-calendar-check-fill',
      colorClass: 'text-warning',
      bgClass: 'bg-warning-subtle',
      delay: 300,
    },
    {
      count: trainerCount,
      suffix: '+',
      label: 'Giảng viên & Trợ giảng',
      sublabel: 'Đội ngũ chuyên môn sư phạm vững vàng',
      icon: 'bi-person-badge-fill',
      colorClass: 'text-info',
      bgClass: 'bg-info-subtle',
      delay: 400,
    },
  ];

  return (
    <section id="counts" className="counts section light-background py-5">
      <div className="container aos-init aos-animate" data-aos="fade-up" data-aos-delay="100">
        <div className="row g-4">
          {stats.map((item, idx) => (
            <div
              key={idx}
              className="col-lg-3 col-md-6 aos-init aos-animate"
              data-aos="fade-up"
              data-aos-delay={item.delay}
            >
              <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center bg-white transition-all">
                <div
                  className={`rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3 ${item.bgClass} ${item.colorClass}`}
                  style={{ width: '64px', height: '64px', fontSize: '26px' }}
                >
                  <i className={`bi ${item.icon}`}></i>
                </div>
                <div className="fw-bold fs-2 text-dark mb-1">
                  {new Intl.NumberFormat('vi-VN').format(item.count)}
                  <span className={item.colorClass}>{item.suffix}</span>
                </div>
                <h6 className="fw-semibold text-secondary mb-1">{item.label}</h6>
                <small className="text-muted" style={{ fontSize: '12px' }}>
                  {item.sublabel}
                </small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CountsSection;
