import React, { useState, useEffect } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import {
  GreetingSection,
  TeachingAssistantProfileCard,
  TeachingAssistantKpiCards,
  TodayClassesSection,
  NotificationsSection,
  type TodayClassItem,
} from "../../../components/teacher/TeachingAssistant/dashboard";
import { teachingDAL, type TeachingDashboardViewModel } from "../../../../DAL/teachingDAL";
import type { TeacherNotification } from "../../../components/teacher/notificationsData";

const DEFAULT_TA_ID = 5; // Âu Dương Tài

export default function TeachingAssistantDashboardPage() {
  const [dashboardData, setDashboardData] = useState<TeachingDashboardViewModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        const data = await teachingDAL.getDashboard(DEFAULT_TA_ID);
        if (isMounted) {
          setDashboardData(data);
        }
      } catch (err) {
        console.warn("Lỗi tải TeachingAssistantDashboard:", err);
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
  const taName = profile?.fullName || "Âu Dương Tài";
  const userCode = profile?.userCode ? `#${profile.userCode}` : "#TA001";
  const specialty = profile?.specialty || "Teaching Assistant";
  const avatar = profile?.avatarUrl || "/assets/img/profiles/avatar-27.jpg";
  const roleTitle = profile?.roleTitle || "Trợ giảng chuyên môn";

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
        title="Bảng Điều Khiển Trợ Giảng"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teaching-assistant/dashboard" },
          { label: "Tổng quan trợ giảng" },
        ]}
      />

      {/* Greeting section */}
      <GreetingSection name={taName} message="Chúc bạn một ngày làm việc hỗ trợ lớp học thật hiệu quả tại EduTrack!" />

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
            {/* Teaching Assistant profile */}
            <TeachingAssistantProfileCard
              id={userCode}
              name={taName}
              avatar={avatar}
              role={roleTitle}
              subject={specialty}
              profileUrl="/teaching-assistant/profile"
            />

            {/* Dashboard KPI Cards */}
            <TeachingAssistantKpiCards
              activeAssignments={kpis?.activeAssignments ?? 10}
              assignmentsDueToday={kpis?.assignmentsDueToday ?? 4}
              activeClasses={kpis?.activeClasses ?? 6}
              classesToday={kpis?.classesToday ?? (mappedTodayClasses.length > 0 ? mappedTodayClasses.length : 3)}
            />

            {/* Today's class */}
            <TodayClassesSection classes={mappedTodayClasses} />
          </div>

          <div className="col-xxl-6 col-xl-12 d-flex flex-column">
            {/* Notifications */}
            <NotificationsSection
              notifications={mappedNotifications.length > 0 ? mappedNotifications : undefined}
              viewAllUrl="/teaching-assistant/notifications"
            />
          </div>
        </div>
      )}
    </>
  );
}
