import React, { useState, useEffect } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import {
  GreetingSection,
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
  const [dashboardNotifications, setDashboardNotifications] = useState<TeacherNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        const [dashData, notifRes] = await Promise.all([
          teachingDAL.getDashboard(DEFAULT_TA_ID),
          teachingDAL.getNotifications(DEFAULT_TA_ID, "unread"),
        ]);

        if (isMounted) {
          setDashboardData(dashData);

          // Chỉ lấy và hiển thị các thông báo MỚI (chưa đọc) tại Dashboard
          const rawUnread = Array.isArray(notifRes?.data)
            ? notifRes.data.filter((n) => !n.isRead || n.isNew)
            : Array.isArray(dashData?.notifications)
            ? dashData.notifications.filter((n) => !n.isRead || n.isNew)
            : [];

          setDashboardNotifications(
            rawUnread.map((n: any) => ({
              id: n.notificationId,
              title: n.title,
              description: n.content || n.description,
              sender: n.sender || "Ban Giám Đốc EduTrack",
              initials: n.initials || "ET",
              initialsBgClass: n.initialsBgClass || "bg-primary-subtle",
              initialsColorClass: n.initialsColorClass || "text-primary",
              isNew: !n.isRead || n.isNew,
              isRead: n.isRead,
              timeAgo: n.timeAgo || "Hôm nay",
              hasBottomBorder: true,
            }))
          );
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

  const mappedTodayClasses: TodayClassItem[] = (dashboardData?.todayClasses || []).map((cls, idx) => ({
    id: cls.classId,
    className: cls.className,
    timePeriod: cls.timePeriod,
    room: cls.room || `Room ${201 + idx}`,
    studentsCount: idx === 0 ? 15 : 18,
    status: "Upcoming",
    attendanceTaken: idx === 0 ? false : true,
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
        <>
          {/* Dashboard KPI Cards - Chiếm toàn bộ chiều ngang */}
          <TeachingAssistantKpiCards
            activeAssignments={kpis?.activeAssignments}
            assignmentsDueToday={kpis?.assignmentsDueToday}
            activeClasses={kpis?.activeClasses}
            classesToday={kpis?.classesToday ?? mappedTodayClasses.length}
            totalStudents={kpis?.totalStudents}
            pendingAttendance={kpis?.pendingAttendance}
          />

          <div className="row">
            <div className="col-xxl-6 col-xl-12">
              {/* Today's class */}
              <TodayClassesSection classes={mappedTodayClasses} />
            </div>

            <div className="col-xxl-6 col-xl-12 align-self-start">
              {/* Notifications */}
              <NotificationsSection
                notifications={dashboardNotifications}
                viewAllUrl="/teaching-assistant/notifications"
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
