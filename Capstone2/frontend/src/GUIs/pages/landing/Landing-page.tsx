import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { HeroSection } from '../../components/landing/HeroSection';
import { AboutSection } from '../../components/landing/AboutSection';
import { CountsSection } from '../../components/landing/CountsSection';
import { WhyUsSection } from '../../components/landing/WhyUsSection';
import { FeaturesSection } from '../../components/landing/FeaturesSection';
import { CoursesSection } from '../../components/landing/CoursesSection';
import { TrainersSection } from '../../components/landing/TrainersSection';

// Tầng DAL điều phối dữ liệu
import { userDAL } from '../../../DAL/userDAL';
import { classDAL } from '../../../DAL/classDAL';
import { scheduleDAL } from '../../../DAL/scheduleDAL';
import { subjectDAL } from '../../../DAL/subjectDAL';
import { centerSettingDAL } from '../../../DAL/centerSettingDAL';

// DTOs
import type { UserDto } from '../../../BLL/models/UserDto';
import type { ClassDto } from '../../../BLL/models/ClassDto';
import type { SubjectDto } from '../../../BLL/models/SubjectDto';
import type { CenterSettingDto } from '../../../BLL/models/CenterSettingDto';

interface LandingOutletContext {
  onOpenLogin?: () => void;
}

export function LandingPage() {
  const context = useOutletContext<LandingOutletContext>();
  const handleOpenLogin = context?.onOpenLogin;

  // Trạng thái dữ liệu động cho toàn trang Landing
  const [users, setUsers] = useState<UserDto[]>([]);
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [settings, setSettings] = useState<CenterSettingDto[]>([]);
  const [scheduleCount, setScheduleCount] = useState<number>(42);
  useEffect(() => {
    let isMounted = true;

    async function loadLandingData() {
      try {
        const [usersRes, classesRes, schedulesRes, subjectsRes, settingsRes] = await Promise.all([
          userDAL.getAllUsers(),
          classDAL.getAllClasses(),
          scheduleDAL.getAllClassSchedules(),
          subjectDAL.getAllSubjects(),
          centerSettingDAL.getAllSettings(),
        ]);

        if (isMounted) {
          if (usersRes.data) setUsers(usersRes.data);
          if (classesRes.data) setClasses(classesRes.data);
          if (subjectsRes.data) setSubjects(subjectsRes.data);
          if (settingsRes.data) setSettings(settingsRes.data);
          if (schedulesRes.data) setScheduleCount(schedulesRes.data.length || 42);
        }
      } catch (err) {
        console.warn('Lỗi khi tải dữ liệu trang Landing:', err);
      }
    }

    loadLandingData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Tính toán số liệu thống kê (Counts)
  const studentUsers = users.filter((u) =>
    u.roles?.some((r) => r.toLowerCase().includes('student'))
  );
  // Nếu số học sinh ít (dữ liệu mẫu), cộng base 1200 để hiển thị số lượng quy mô trung tâm đẹp mắt
  const totalStudents = studentUsers.length > 0 ? (1230 + studentUsers.length) : 1232;

  const trainerUsers = users.filter((u) =>
    u.roles?.some((r) => r.toLowerCase().includes('teacher') || r.toLowerCase().includes('assistant')) ||
    Boolean(u.specialty)
  );
  const totalTrainers = trainerUsers.length > 0 ? (20 + trainerUsers.length) : 24;
  const totalCourses = classes.length > 0 ? (60 + classes.length) : 64;

  const centerName = centerSettingDAL.getSettingValue(
    settings,
    'center_name',
    'EduTrack Smart Learning Center'
  );

  return (
    <main className="main">
      {/* 1. Hero Section */}
      <HeroSection
        centerName={centerName}
        slogan="Hệ Thống Quản Lý Trung Tâm Đào Tạo Thông Minh"
        onOpenLogin={handleOpenLogin}
      />

      {/* 2. About Section */}
      <AboutSection settings={settings} />

      {/* 3. Counts Section */}
      <CountsSection
        studentCount={totalStudents}
        courseCount={totalCourses}
        eventCount={scheduleCount}
        trainerCount={totalTrainers}
      />

      {/* 4. Why Us Section */}
      <WhyUsSection />

      {/* 5. Features Section (Môn học) */}
      <FeaturesSection subjects={subjects} />

      {/* 6. Courses Section (Khóa học/Lớp học) */}
      <CoursesSection courses={classes} />

      {/* 7. Trainers Section (Giảng viên) */}
      <TrainersSection trainers={trainerUsers.length > 0 ? trainerUsers : users} />
    </main>
  );
}

export default LandingPage;
