import React from 'react';
import type { UserDto } from '../../../BLL/models/UserDto';

export interface TrainersSectionProps {
  trainers?: UserDto[];
}

const DEFAULT_TRAINERS: UserDto[] = [
  {
    userId: 3,
    userCode: 'TC001',
    fullName: 'ThS. Hoàng Quốc Việt',
    email: 'viet.hoang@edutrack.edu.vn',
    phone: '0923456789',
    avatarUrl: '/assets/img/trainer-1.jpg',
    specialty: 'Chuyên gia Toán Học & Luyện thi',
    status: 'active',
    createdAt: '2023-06-01T00:00:00Z',
    roles: ['teacher'],
  },
  {
    userId: 4,
    userCode: 'TC002',
    fullName: 'Cô Lê Thị Hương',
    email: 'huong.le@edutrack.edu.vn',
    phone: '0934567890',
    avatarUrl: '/assets/img/trainer-2.jpg',
    specialty: 'Thạc sĩ Vật Lý Ứng Dụng',
    status: 'active',
    createdAt: '2023-08-15T00:00:00Z',
    roles: ['teacher'],
  },
  {
    userId: 5,
    userCode: 'TA001',
    fullName: 'Thầy Phạm Đức Minh',
    email: 'minh.pham@edutrack.edu.vn',
    phone: '0945678901',
    avatarUrl: '/assets/img/trainer-3.jpg',
    specialty: 'Giảng viên Tiếng Anh IELTS 8.5',
    status: 'active',
    createdAt: '2024-01-10T00:00:00Z',
    roles: ['teaching_assistant'],
  },
];

export function TrainersSection({ trainers }: TrainersSectionProps) {
  const fallbackImages = [
    '/assets/img/trainer-1.jpg',
    '/assets/img/trainer-2.jpg',
    '/assets/img/trainer-3.jpg',
  ];

  // Lọc giảng viên hoặc dùng danh sách mặc định
  const teacherList = (trainers && trainers.length > 0)
    ? trainers.filter((u) => u.roles?.some((r) => r.toLowerCase().includes('teacher') || r.toLowerCase().includes('assistant')) || u.specialty)
    : DEFAULT_TRAINERS;

  const displayTrainers = (teacherList.length > 0 ? teacherList : DEFAULT_TRAINERS).slice(0, 3);

  return (
    <section id="trainers-index" className="section trainers-index">
      <div className="container section-title aos-init aos-animate" data-aos="fade-up">
        <h2>Đội ngũ Giảng viên</h2>
        <p>Các thầy cô giàu kinh nghiệm tại EduTrack</p>
      </div>

      <div className="container">
        <div className="row gy-4">
          {displayTrainers.map((trainer, idx) => (
            <div
              key={trainer.userId || idx}
              className="col-lg-4 col-md-6 d-flex aos-init aos-animate"
              data-aos="fade-up"
              data-aos-delay={(idx + 1) * 100}
            >
              <div className="member shadow-sm rounded-4 overflow-hidden w-100 bg-white">
                <img
                  src={trainer.avatarUrl || fallbackImages[idx % fallbackImages.length]}
                  className="img-fluid w-100"
                  style={{ height: '260px', objectFit: 'cover' }}
                  alt={trainer.fullName}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = fallbackImages[idx % fallbackImages.length];
                  }}
                />
                <div className="member-content p-4">
                  <h4 className="fw-bold mb-1">{trainer.fullName}</h4>
                  <span className="text-primary fw-medium small d-block mb-2">
                    {trainer.specialty || 'Giảng viên EduTrack'}
                  </span>
                  <p className="text-muted small mb-3">
                    {trainer.email ? `Liên hệ: ${trainer.email}` : 'Giảng viên giàu kinh nghiệm sư phạm và truyền cảm hứng.'}
                  </p>
                  <div className="social d-flex gap-2">
                    <a href="#trainers" className="btn btn-sm btn-outline-light text-muted border rounded-circle"><i className="bi bi-envelope"></i></a>
                    <a href="#trainers" className="btn btn-sm btn-outline-light text-muted border rounded-circle"><i className="bi bi-facebook"></i></a>
                    <a href="#trainers" className="btn btn-sm btn-outline-light text-muted border rounded-circle"><i className="bi bi-linkedin"></i></a>
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

export default TrainersSection;
