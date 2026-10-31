import React from 'react';
import type { UserDto } from '../../../BLL/models/UserDto';
import type { LandingTrainerItemDto } from '../../../BLL/models/LandingOverviewDto';

export interface TrainersSectionProps {
  trainers?: Array<UserDto | LandingTrainerItemDto>;
}

const DEFAULT_TRAINERS: LandingTrainerItemDto[] = [
  {
    userId: 3,
    userCode: 'TC001',
    fullName: 'ThS. Hoàng Quốc Việt',
    email: 'viet.hoang@edutrack.edu.vn',
    phone: '0923456789',
    avatarUrl: '/assets/img/trainer-1.jpg',
    specialty: 'Chuyên gia Toán Học & Luyện thi THPT',
    roleTitle: 'Giáo viên Toán học',
  },
  {
    userId: 4,
    userCode: 'TC002',
    fullName: 'ThS. Huỳnh Khánh Duy',
    email: 'duy.huynh@edutrack.edu.vn',
    phone: '0934567890',
    avatarUrl: '/assets/img/trainer-2.jpg',
    specialty: 'Thạc sĩ Vật Lý Ứng Dụng',
    roleTitle: 'Giáo viên Vật lý',
  },
  {
    userId: 5,
    userCode: 'TA001',
    fullName: 'Thầy Âu Dương Tài',
    email: 'tai.auduong@edutrack.edu.vn',
    phone: '0945678901',
    avatarUrl: '/assets/img/trainer-3.jpg',
    specialty: 'Giảng viên Tiếng Anh IELTS 8.5',
    roleTitle: 'Trợ giảng Tiếng Anh',
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
    ? trainers.filter((u) => {
        const roles = 'roles' in u ? (u.roles as string[]) : undefined;
        return (
          roles?.some((r) => r.toLowerCase().includes('teacher') || r.toLowerCase().includes('assistant')) ||
          Boolean(u.specialty) ||
          ('roleTitle' in u && Boolean((u as LandingTrainerItemDto).roleTitle))
        );
      })
    : DEFAULT_TRAINERS;

  const displayTrainers = (teacherList.length > 0 ? teacherList : DEFAULT_TRAINERS).slice(0, 3);

  return (
    <section id="trainers-index" className="section trainers-index light-background py-5">
      <div className="container section-title aos-init aos-animate text-center mb-5" data-aos="fade-up">
        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-1.5 rounded-pill fw-medium mb-2">
          Đội ngũ giảng viên
        </span>
        <h2 className="fw-bold fs-2 text-dark">Thầy cô tâm huyết & giàu kinh nghiệm</h2>
        <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
          Đội ngũ giáo viên và trợ giảng chuyên môn cao, đồng hành cùng sự tiến bộ của từng học viên.
        </p>
      </div>

      <div className="container">
        <div className="row g-4">
          {displayTrainers.map((trainer, idx) => {
            const roleBadge = ('roleTitle' in trainer && trainer.roleTitle)
              ? trainer.roleTitle
              : (trainer.specialty || 'Giảng viên chuyên trách');

            return (
              <div
                key={trainer.userId || idx}
                className="col-lg-4 col-md-6 d-flex aos-init aos-animate"
                data-aos="fade-up"
                data-aos-delay={(idx + 1) * 100}
              >
                <div className="member shadow-sm rounded-4 overflow-hidden w-100 bg-white border border-light d-flex flex-column">
                  <div className="position-relative overflow-hidden" style={{ height: '280px' }}>
                    <img
                      src={trainer.avatarUrl || fallbackImages[idx % fallbackImages.length]}
                      className="img-fluid w-100 h-100"
                      style={{ objectFit: 'cover' }}
                      alt={trainer.fullName}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = fallbackImages[idx % fallbackImages.length];
                      }}
                    />
                  </div>
                  <div className="member-content p-4 d-flex flex-column flex-grow-1">
                    <h4 className="fw-bold mb-1 text-dark fs-5">{trainer.fullName}</h4>
                    <div className="mb-2">
                      <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-1 rounded-pill small fw-medium">
                        {roleBadge}
                      </span>
                    </div>
                    <p className="text-muted small mb-4 flex-grow-1">
                      {trainer.specialty || (trainer.email ? `Email: ${trainer.email}` : 'Giảng viên giàu kinh nghiệm sư phạm và truyền cảm hứng.')}
                    </p>
                    <div className="social d-flex gap-2 pt-3 border-top mt-auto">
                      <a href={`mailto:${trainer.email || 'info@edutrack.edu.vn'}`} className="btn btn-sm btn-outline-secondary rounded-circle" title="Gửi email">
                        <i className="bi bi-envelope"></i>
                      </a>
                      <a href="#trainers-index" className="btn btn-sm btn-outline-secondary rounded-circle" title="Facebook">
                        <i className="bi bi-facebook"></i>
                      </a>
                      <a href="#trainers-index" className="btn btn-sm btn-outline-secondary rounded-circle" title="LinkedIn">
                        <i className="bi bi-linkedin"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default TrainersSection;
