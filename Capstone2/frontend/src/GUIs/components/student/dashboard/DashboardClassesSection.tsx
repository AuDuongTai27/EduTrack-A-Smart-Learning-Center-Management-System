import React from 'react';
import { Link } from 'react-router-dom';

interface ClassItem {
  id: number;
  subjectClass: string;
  badge: string;
  name: string;
  teacher: string;
  teacherInitials: string;
  schedule: string;
  room: string;
}

const CLASSES_DATA: ClassItem[] = [
  {
    id: 1,
    subjectClass: 'subject-toan',
    badge: 'Toán',
    name: 'Toán Nâng Cao – Toán',
    teacher: 'Nguyễn Văn An',
    teacherInitials: 'NA',
    schedule: 'Thứ 2 - 4 - 6, 15:00 – 16:30',
    room: 'Phòng P.201',
  },
  {
    id: 2,
    subjectClass: 'subject-vat-ly',
    badge: 'Vật Lý',
    name: 'Vật Lý Cơ Bản – Vật Lý',
    teacher: 'Trần Thị Mai',
    teacherInitials: 'TM',
    schedule: 'Thứ 3 - 5, 17:00 – 18:30',
    room: 'Phòng P.103',
  },
  {
    id: 3,
    subjectClass: 'subject-tieng-anh',
    badge: 'Tiếng Anh',
    name: 'Tiếng Anh Giao Tiếp – Tiếng Anh',
    teacher: 'Lê Hoàng Nam',
    teacherInitials: 'LN',
    schedule: 'Thứ 7, 09:00 – 11:00',
    room: 'Phòng P.305',
  },
  {
    id: 4,
    subjectClass: 'subject-hoa-hoc',
    badge: 'Hóa Học',
    name: 'Hóa Học 11 – Hóa Học',
    teacher: 'Phạm Thu Hà',
    teacherInitials: 'PH',
    schedule: 'Thứ 2 - 4, 16:00 – 17:30',
    room: 'Phòng P.202',
  },
  {
    id: 5,
    subjectClass: 'subject-ngu-van',
    badge: 'Ngữ Văn',
    name: 'Ngữ Văn Nâng Cao – Ngữ Văn',
    teacher: 'Đỗ Minh Khoa',
    teacherInitials: 'ĐK',
    schedule: 'Thứ 6, 14:00 – 16:00',
    room: 'Phòng P.101',
  },
  {
    id: 6,
    subjectClass: 'subject-sinh-hoc',
    badge: 'Sinh Học',
    name: 'Sinh Học Đại Cương – Sinh Học',
    teacher: 'Vũ Thị Lan',
    teacherInitials: 'VL',
    schedule: 'Thứ 3 - 5, 15:30 – 17:00',
    room: 'Phòng P.204',
  },
];

export const DashboardClassesSection: React.FC = () => {
  return (
    <>
      {/* 4. Section Header: My Classes */}
      <div className="section-header">
        <h2 className="section-title">Lớp học của tôi</h2>
      </div>

      {/* 5. Classes Grid */}
      <div className="classes-grid">
        {CLASSES_DATA.map((cls) => (
          <Link
            key={cls.id}
            to={`/student/classes/${cls.id}`}
            className={`class-card ${cls.subjectClass}`}
          >
            <div className="card-accent-bar"></div>
            <div className="class-card-body">
              <div className="class-card-header">
                <span className="subject-badge">{cls.badge}</span>
                <div className="subject-icon-box">
                  <i className="bi bi-book"></i>
                </div>
              </div>
              <h3 className="class-name">{cls.name}</h3>
              <div className="card-spacer"></div>
              <div className="card-divider"></div>
              <div className="teacher-row">
                <div className="teacher-avatar-mini">{cls.teacherInitials}</div>
                <span className="teacher-name">
                  <span className="teacher-label">GV:</span> {cls.teacher}
                </span>
              </div>
              <div className="meta-row">
                <i className="bi bi-calendar-event"></i>
                <span>{cls.schedule}</span>
              </div>
              <div className="meta-row room">
                <i className="bi bi-geo-alt"></i>
                <span>{cls.room}</span>
              </div>
            </div>
            <div className="class-card-footer">
              <span>Xem chi tiết</span>
              <i className="bi bi-chevron-right"></i>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
};

export default DashboardClassesSection;
