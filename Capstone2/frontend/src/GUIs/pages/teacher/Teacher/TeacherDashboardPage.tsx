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
  const [dashboardNotifications, setDashboardNotifications] = useState<TeacherNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        const [dashData, notifRes] = await Promise.all([
          teachingDAL.getDashboard(DEFAULT_TEACHER_ID),
          teachingDAL.getNotifications(DEFAULT_TEACHER_ID, "unread"),
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
        <>
          {/* Dashboard KPI Cards - Chiếm toàn bộ chiều ngang */}
          <TeacherKpiCards
            activeAssignments={kpis?.activeAssignments}
            assignmentsDueToday={kpis?.assignmentsDueToday}
            activeClasses={kpis?.activeClasses}
            classesToday={kpis?.classesToday ?? mappedTodayClasses.length}
            totalStudents={kpis?.totalStudents}
            pendingAttendance={kpis?.pendingAttendance}
          />

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

              {/* Today's class */}
              <TodayClassesSection classes={mappedTodayClasses} />
            </div>

            <div className="col-xxl-6 col-xl-12 align-self-start">
              {/* Notifications */}
              <NotificationsSection
                notifications={dashboardNotifications}
                viewAllUrl="/teacher/notifications"
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
