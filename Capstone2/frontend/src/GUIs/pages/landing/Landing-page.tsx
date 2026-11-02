import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { HeroSection } from '../../components/landing/HeroSection';
import { AboutSection } from '../../components/landing/AboutSection';
import { CountsSection } from '../../components/landing/CountsSection';
import { FeaturesSection } from '../../components/landing/FeaturesSection';
import { CoursesSection } from '../../components/landing/CoursesSection';
import { TrainersSection } from '../../components/landing/TrainersSection';

// Tầng DAL điều phối dữ liệu
import { landingDAL } from '../../../DAL/landingDAL';
import type { LandingOverviewDto } from '../../../BLL/models/LandingOverviewDto';

interface LandingOutletContext {
  onOpenLogin?: () => void;
}

export function LandingPage() {
  const context = useOutletContext<LandingOutletContext>();
  const handleOpenLogin = context?.onOpenLogin;

  const [overview, setOverview] = useState<LandingOverviewDto | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadLandingData() {
      try {
        const res = await landingDAL.getLandingOverview();
        if (isMounted && res.data) {
          setOverview(res.data);
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

  const centerInfo = overview?.centerInfo;
  const stats = overview?.stats;
  const subjects = overview?.subjects || [];
  const courses = overview?.courses || [];
  const trainers = overview?.trainers || [];

  return (
    <main className="main">
      {/* 1. Hero Section */}
      <HeroSection
        centerName={centerInfo?.centerName}
        slogan={centerInfo?.slogan}
        onOpenLogin={handleOpenLogin}
      />

      {/* 2. Counts Section (Chỉ số quy mô trung tâm thực tế từ Database) */}
      <CountsSection
        studentCount={stats?.totalStudents}
        courseCount={stats?.totalCourses}
        eventCount={stats?.totalSchedules}
        trainerCount={stats?.totalTrainers}
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
