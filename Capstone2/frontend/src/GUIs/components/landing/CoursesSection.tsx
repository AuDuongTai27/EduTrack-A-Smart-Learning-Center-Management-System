import React from 'react';
import type { ClassDto } from '../../../BLL/models/ClassDto';

export interface CoursesSectionProps {
  courses?: ClassDto[];
}

const DEFAULT_COURSES = [
  {
    classId: 1,
    className: 'Website Design & Development',
    subjectName: 'Tin học & Lập trình',
    tuitionFee: 2500000,
    room: 'Lab 201',
    trainerName: 'ThS. Hoàng Quốc Việt',
    students: 25,
    likes: 65,
    image: '/assets/img/course-1.webp',
  },
  {
    classId: 2,
    className: 'Toán Học 12 Chuyên Sâu',
    subjectName: 'Toán học',
    tuitionFee: 3200000,
    room: 'Phòng 302',
    trainerName: 'Cô Lê Thị Hương',
    students: 30,
    likes: 80,
    image: '/assets/img/course-2.webp',
  },
  {
    classId: 3,
    className: 'Vật Lý Luyện Thi THPT',
    subjectName: 'Vật lý',
    tuitionFee: 2800000,
    room: 'Phòng 104',
    trainerName: 'Thầy Trần Văn Nam',
    students: 22,
    likes: 54,
    image: '/assets/img/course-3.webp',
  },
];

export function CoursesSection({ courses }: CoursesSectionProps) {
  const courseImages = [
    '/assets/img/course-1.webp',
    '/assets/img/course-2.webp',
    '/assets/img/course-3.webp',
  ];

  const formatMoney = (fee: number) => {
    if (!fee) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN').format(fee) + ' đ';
  };

  const displayList = (courses && courses.length > 0)
    ? courses.slice(0, 6).map((cls, idx) => ({
        classId: cls.classId,
        className: cls.className,
        subjectName: cls.subjectName || 'Khóa học chất lượng cao',
        tuitionFee: cls.tuitionFee,
        room: cls.room || 'Phòng học chuẩn quốc tế',
        trainerName: idx % 2 === 0 ? 'ThS. Hoàng Quốc Việt' : 'Cô Lê Thị Hương',
        students: 20 + ((cls.classId * 7) % 15),
        likes: 40 + ((cls.classId * 11) % 50),
        image: courseImages[idx % courseImages.length],
      }))
    : DEFAULT_COURSES;

  return (
    <section id="courses" className="courses section">
      {/* Section Title */}
      <div className="container section-title aos-init aos-animate" data-aos="fade-up">
        <h2>Khóa học & Lớp học</h2>
        <p>Danh sách các lớp học đang tuyển sinh</p>
      </div>{/* End Section Title */}

      <div className="container">
        <div className="row gy-4">
          {displayList.map((item, index) => (
            <div
              key={item.classId || index}
              className="col-lg-4 col-md-6 d-flex align-items-stretch aos-init aos-animate"
              data-aos="zoom-in"
              data-aos-delay={(index + 1) * 100}
            >
              <div className="course-item w-100 shadow-sm border-0 rounded-4 overflow-hidden">
                <img src={item.image} className="img-fluid w-100" style={{ height: '200px', objectFit: 'cover' }} alt={item.className} />
                <div className="course-content p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-medium">
                      {item.subjectName}
                    </span>
                    <span className="text-danger fw-bold fs-5">
                      {formatMoney(item.tuitionFee)}
                    </span>
                  </div>

                  <h3 className="fs-5 fw-bold mb-2">
                    <a href="#courses" className="text-decoration-none text-dark hover-primary">
                      {item.className}
                    </a>
                  </h3>
                  <p className="description text-muted small mb-3">
                    Địa điểm: {item.room}. Giáo trình chuẩn EduTrack với hệ thống bài tập và chấm điểm AI thông minh.
                  </p>

                  <div className="trainer d-flex justify-content-between align-items-center pt-3 border-top">
                    <div className="trainer-profile d-flex align-items-center gap-2">
                      <div className="avatar-circle rounded-circle bg-light text-primary fw-bold d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', border: '1px solid #dee2e6' }}>
                        <i className="bi bi-person-fill"></i>
                      </div>
                      <span className="trainer-link text-secondary small fw-medium">{item.trainerName}</span>
                    </div>
                    <div className="trainer-rank d-flex align-items-center text-muted small">
                      <i className="bi bi-people me-1"></i>{item.students}
                      &nbsp;&nbsp;
                      <i className="bi bi-heart text-danger me-1"></i>{item.likes}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CoursesSection;
