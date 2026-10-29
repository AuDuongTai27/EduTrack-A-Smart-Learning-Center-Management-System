import React from 'react';
import type { ClassDto } from '../../../BLL/models/ClassDto';
import type { LandingCourseItemDto } from '../../../BLL/models/LandingOverviewDto';

export interface CoursesSectionProps {
  courses?: Array<ClassDto | LandingCourseItemDto>;
}

const DEFAULT_COURSES = [
  {
    classId: 1,
    className: 'Class 9 - Advanced Mathematics',
    subjectName: 'Toán học nâng cao',
    tuitionFee: 1500000,
    room: 'Room 201',
    trainerName: 'ThS. Hoàng Quốc Việt',
    students: 28,
    likes: 65,
    image: '/assets/img/course-1.webp',
  },
  {
    classId: 2,
    className: 'Class 9 - Intensive Physics',
    subjectName: 'Vật lý ứng dụng & Luyện thi',
    tuitionFee: 1400000,
    room: 'Room 202',
    trainerName: 'ThS. Huỳnh Khánh Duy',
    students: 24,
    likes: 58,
    image: '/assets/img/course-2.webp',
  },
  {
    classId: 3,
    className: 'Class 8 - English Foundation',
    subjectName: 'Tiếng Anh IELTS Foundation',
    tuitionFee: 1800000,
    room: 'Lab 101',
    trainerName: 'Thầy Phạm Đức Minh',
    students: 20,
    likes: 72,
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
    ? courses.slice(0, 6).map((cls: any, idx) => ({
        classId: cls.classId,
        className: cls.className,
        subjectName: cls.subjectName || 'Khóa học chất lượng cao',
        tuitionFee: cls.tuitionFee,
        room: cls.room || 'Phòng học chuẩn quốc tế',
        trainerName: cls.teacherName || cls.trainerName || (idx % 2 === 0 ? 'ThS. Hoàng Quốc Việt' : 'ThS. Huỳnh Khánh Duy'),
        students: cls.studentsCount || cls.students || 20,
        likes: cls.likesCount || cls.likes || (45 + ((cls.classId * 7) % 30)),
        image: cls.imageUrl || courseImages[idx % courseImages.length],
      }))
    : DEFAULT_COURSES;

  return (
    <section id="courses" className="courses section py-5">
      {/* Section Title */}
      <div className="container section-title aos-init aos-animate text-center mb-5" data-aos="fade-up">
        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-1.5 rounded-pill fw-medium mb-2">
          Khóa học tuyển sinh
        </span>
        <h2 className="fw-bold fs-2 text-dark">Danh sách các lớp học đang mở</h2>
        <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
          Được phân chia theo khối lớp với sĩ số giới hạn, đảm bảo giáo viên theo sát từng học sinh.
        </p>
      </div>

      <div className="container">
        <div className="row g-4">
          {displayList.map((item, index) => (
            <div
              key={item.classId || index}
              className="col-lg-4 col-md-6 d-flex align-items-stretch aos-init aos-animate"
              data-aos="zoom-in"
              data-aos-delay={(index + 1) * 100}
            >
              <div className="course-item w-100 shadow-sm border border-light rounded-4 overflow-hidden bg-white d-flex flex-column">
                <div className="position-relative overflow-hidden" style={{ height: '210px' }}>
                  <img
                    src={item.image}
                    className="img-fluid w-100 h-100"
                    style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
                    alt={item.className}
                  />
                  <div className="position-absolute top-0 start-0 m-3">
                    <span className="badge bg-dark bg-opacity-75 text-white px-3 py-1.5 rounded-pill fw-medium shadow-sm">
                      {item.subjectName}
                    </span>
                  </div>
                </div>

                <div className="course-content p-4 d-flex flex-column flex-grow-1">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-1 rounded-pill small fw-medium">
                      <i className="bi bi-geo-alt me-1"></i>{item.room}
                    </span>
                    <span className="text-danger fw-bold fs-5">
                      {formatMoney(item.tuitionFee)}
                    </span>
                  </div>

                  <h3 className="fs-5 fw-bold mb-2">
                    <a href="#courses" className="text-decoration-none text-dark hover-success">
                      {item.className}
                    </a>
                  </h3>
                  <p className="description text-muted small mb-4 flex-grow-1">
                    Giáo trình chuẩn EduTrack với hệ thống bài tập, điểm danh điện tử và chấm điểm AI thông minh.
                  </p>

                  <div className="trainer d-flex justify-content-between align-items-center pt-3 border-top mt-auto">
                    <div className="trainer-profile d-flex align-items-center gap-2">
                      <div
                        className="rounded-circle bg-success-subtle text-success fw-bold d-flex align-items-center justify-content-center"
                        style={{ width: '36px', height: '36px' }}
                      >
                        <i className="bi bi-person-fill"></i>
                      </div>
                      <span className="text-secondary small fw-medium">{item.trainerName}</span>
                    </div>
                    <div className="trainer-rank d-flex align-items-center text-muted small">
                      <i className="bi bi-people me-1"></i>{item.students} HS
                      &nbsp;&nbsp;
                      <i className="bi bi-heart-fill text-danger me-1"></i>{item.likes}
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
