import React, { useState, useEffect } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import {
  GreetingSection,
  TeacherProfileCard,
  TeacherKpiCards,
  TodayClassesSection,
  NotificationsSection,
  type TodayClassItem,
} from "../../../components/teacher/Teacher/dashboard";
import { teachingDAL, type TeachingDashboardViewModel } from "../../../../DAL/teachingDAL";
import type { TeacherNotification } from "../../../components/teacher/notificationsData";

const DEFAULT_TEACHER_ID = 3; // ThS. Hoàng Quốc Việt

export default function TeacherDashboardPage() {
  const [dashboardData, setDashboardData] = useState<TeachingDashboardViewModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        const data = await teachingDAL.getDashboard(DEFAULT_TEACHER_ID);
        if (isMounted) {
          setDashboardData(data);
        }
      } catch (err) {
        console.warn("Lỗi tải TeacherDashboard:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const profile = dashboardData?.profile;
  const kpis = dashboardData?.kpis;
  const teacherName = profile?.fullName || "ThS. Hoàng Quốc Việt";
  const userCode = profile?.userCode ? `#${profile.userCode}` : "#TC001";
  const specialty = profile?.specialty || "Toán học & Luyện thi";
  const avatar = profile?.avatarUrl || "/assets/img/profiles/avatar-27.jpg";
  const roleTitle = profile?.roleTitle || "Giáo viên chuyên môn";

  const mappedTodayClasses: TodayClassItem[] = (dashboardData?.todayClasses || []).map((cls) => ({
    id: cls.classId,
    className: cls.className,
    timePeriod: cls.timePeriod,
  }));

  const mappedNotifications: TeacherNotification[] = (dashboardData?.notifications || []).map((n) => ({
    id: n.notificationId,
    sender: n.sender || "Ban Giám Đốc EduTrack",
    initials: n.initials || "ET",
    initialsBgClass: n.initialsBgClass || "bg-primary-subtle",
    initialsColorClass: n.initialsColorClass || "text-primary",
    isNew: n.isNew,
    isRead: n.isRead,
    timeAgo: n.timeAgo || "Hôm nay",
    title: n.title,
    description: n.description,
    hasBottomBorder: true,
  }));

  return (
    <>
      {/* Breadcrumb & Page Title */}
      <PageHeader
        title="Bảng Điều Khiển Giáo Viên"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teacher/dashboard" },
          { label: "Tổng quan giảng dạy" },
        ]}
      />

      {/* Greeting section */}
      <GreetingSection name={teacherName} message="Chúc thầy/cô một ngày giảng dạy hiệu quả tại EduTrack!" />

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="text-muted mt-2">Đang tải thông tin bảng điều khiển...</p>
        </div>
      ) : (
        <div className="row">
          <div className="col-xxl-6 col-xl-12">
            {/* Teacher profile */}
            <TeacherProfileCard
              id={userCode}
              name={teacherName}
              avatar={avatar}
              role={roleTitle}
              subject={specialty}
              profileUrl="/teacher/profile"
            />

            {/* Dashboard KPI Cards */}
            <TeacherKpiCards
              activeAssignments={kpis?.activeAssignments ?? 8}
              assignmentsDueToday={kpis?.assignmentsDueToday ?? 3}
              activeClasses={kpis?.activeClasses ?? 6}
              classesToday={kpis?.classesToday ?? (mappedTodayClasses.length > 0 ? mappedTodayClasses.length : 2)}
            />

            {/* Today's class */}
            <TodayClassesSection classes={mappedTodayClasses} />
          </div>

          <div className="col-xxl-6 col-xl-12 d-flex flex-column">
            {/* Notifications */}
            <NotificationsSection
              notifications={mappedNotifications.length > 0 ? mappedNotifications : undefined}
              viewAllUrl="/teacher/notifications"
            />
          </div>
        </div>
      )}
    </>
  );
}
