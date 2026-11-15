import { useOutletContext } from 'react-router-dom';
import { HeroSection } from '../../components/landing/HeroSection';
import { AboutSection } from '../../components/landing/AboutSection';
import { CountsSection } from '../../components/landing/CountsSection';
import { FeaturesSection } from '../../components/landing/FeaturesSection';
import { CoursesSection } from '../../components/landing/CoursesSection';
import { TrainersSection } from '../../components/landing/TrainersSection';
import type { LandingOverviewDto } from '../../../BLL/models/LandingOverviewDto';

interface LandingOutletContext {
  onOpenWorkspace?: () => void;
}

const STATIC_LANDING_DATA: LandingOverviewDto = {
  centerInfo: {
    centerName: 'EduTrack Smart Learning Center',
    slogan: 'Đồng Hành Cùng Tri Thức - Nâng Tầm Tương Lai',
    address: '123 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh',
    hotline: '1900 6868',
    email: 'contact@edutrack.edu.vn',
    academicYear: '2026 - 2027',
  },
  stats: {
    totalStudents: 1230,
    totalCourses: 64,
    totalSchedules: 42,
    totalTrainers: 24,
  },
  subjects: [
    { subjectId: 1, subjectCode: 'MATH', subjectName: 'Toán Học (Mathematics)', description: 'Đại số, Hình học & Giải tích nâng cao', activeClassesCount: 4 },
    { subjectId: 2, subjectCode: 'PHYS', subjectName: 'Vật Lý (Physics)', description: 'Cơ học, Nhiệt học, Điện từ & Ứng dụng thực tế', activeClassesCount: 3 },
    { subjectId: 3, subjectCode: 'CHEM', subjectName: 'Hóa Học (Chemistry)', description: 'Hóa vô cơ, Hữu cơ & Thí nghiệm chuyên sâu', activeClassesCount: 2 },
    { subjectId: 4, subjectCode: 'ENG', subjectName: 'Tiếng Anh (English)', description: 'Ngữ pháp, Giao tiếp & Luyện thi IELTS Foundation', activeClassesCount: 5 },
    { subjectId: 5, subjectCode: 'BIO', subjectName: 'Sinh Học (Biology)', description: 'Di truyền học, Tế bào & Sinh thái học', activeClassesCount: 2 },
    { subjectId: 6, subjectCode: 'IT', subjectName: 'Tin Học & AI (Computer Science)', description: 'Lập trình tư duy thuật toán & Công nghệ số', activeClassesCount: 3 },
    { subjectId: 7, subjectCode: 'LIT', subjectName: 'Ngữ Văn (Literature)', description: 'Tác phẩm văn học & Kỹ năng tư duy nghị luận', activeClassesCount: 2 },
    { subjectId: 8, subjectCode: 'HIST', subjectName: 'Lịch Sử & Địa Lý', description: 'Kiến thức xã hội & Lịch sử văn minh thế giới', activeClassesCount: 1 },
  ],
  courses: [
    {
      classId: 1,
      className: 'Class 9 - Advanced Mathematics',
      subjectId: 1,
      subjectName: 'Toán học nâng cao',
      subjectCode: 'MATH',
      tuitionFee: 1500000,
      room: 'Room 201',
      teacherName: 'ThS. Hoàng Quốc Việt',
      teacherAvatar: null,
      studentsCount: 28,
      likesCount: 65,
      imageUrl: '/assets/img/course-1.webp',
    },
    {
      classId: 2,
      className: 'Class 9 - Intensive Physics',
      subjectId: 2,
      subjectName: 'Vật lý ứng dụng & Luyện thi',
      subjectCode: 'PHYS',
      tuitionFee: 1400000,
      room: 'Room 202',
      teacherName: 'ThS. Huỳnh Khánh Duy',
      teacherAvatar: null,
      studentsCount: 24,
      likesCount: 58,
      imageUrl: '/assets/img/course-2.webp',
    },
    {
      classId: 3,
      className: 'Class 8 - English Foundation',
      subjectId: 4,
      subjectName: 'Tiếng Anh IELTS Foundation',
      subjectCode: 'ENG',
      tuitionFee: 1800000,
      room: 'Lab 101',
      teacherName: 'Thầy Phạm Đức Minh',
      teacherAvatar: null,
      studentsCount: 20,
      likesCount: 72,
      imageUrl: '/assets/img/course-3.webp',
    },
  ],
  trainers: [
    {
      userId: 3,
      userCode: 'TC001',
      fullName: 'ThS. Hoàng Quốc Việt',
      specialty: 'Chuyên gia Toán Học & Luyện thi THPT',
      email: 'viet.hoang@edutrack.edu.vn',
      phone: '0923456789',
      avatarUrl: '/assets/img/trainer-1.jpg',
      roleTitle: 'Giảng viên bộ môn Toán',
    },
    {
      userId: 4,
      userCode: 'TC002',
      fullName: 'ThS. Huỳnh Khánh Duy',
      specialty: 'Thạc sĩ Vật Lý Ứng Dụng',
      email: 'duy.huynh@edutrack.edu.vn',
      phone: '0934567890',
      avatarUrl: '/assets/img/trainer-2.jpg',
      roleTitle: 'Giảng viên bộ môn Vật Lý',
    },
    {
      userId: 5,
      userCode: 'TA001',
      fullName: 'Thầy Phạm Đức Minh',
      specialty: 'Giảng viên Tiếng Anh IELTS 8.5',
      email: 'minh.pham@edutrack.edu.vn',
      phone: '0945678901',
      avatarUrl: '/assets/img/trainer-3.jpg',
      roleTitle: 'Trợ giảng chuyên trách',
    },
  ],
};

export function LandingPage() {
  const context = useOutletContext<LandingOutletContext>();
  const handleOpenWorkspace = context?.onOpenWorkspace;

  const { centerInfo, stats, subjects, courses, trainers } = STATIC_LANDING_DATA;

  return (
    <main className="main">
      {/* 1. Hero Section */}
      <HeroSection
        centerName={centerInfo.centerName}
        slogan={centerInfo.slogan}
        onOpenWorkspace={handleOpenWorkspace}
      />

      {/* 2. Counts Section */}
      <CountsSection
        studentCount={stats.totalStudents}
        courseCount={stats.totalCourses}
        eventCount={stats.totalSchedules}
        trainerCount={stats.totalTrainers}
      />

      {/* 3. About Section */}
      <AboutSection centerInfo={centerInfo} />

      {/* 4. Features Section (Môn học) */}
      <FeaturesSection subjects={subjects} />

      {/* 5. Courses Section (Khóa học/Lớp học) */}
      <CoursesSection courses={courses} />

      {/* 6. Trainers Section (Giảng viên) */}
      <TrainersSection trainers={trainers} />
    </main>
  );
}

export default LandingPage;
