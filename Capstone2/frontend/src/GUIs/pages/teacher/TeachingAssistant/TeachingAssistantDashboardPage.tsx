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

  const mappedTodayClasses: TodayClassItem[] = (dashboardData?.todayClasses || [])
    .filter((cls) => {
      // Bỏ qua lớp đã hoàn thành
      if (cls.status?.toLowerCase() === "completed") return false;
      if (cls.endTime) {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const [endH, endM] = cls.endTime.split(":").map(Number);
        const endMinutes = (endH || 0) * 60 + (endM || 0);
        if (currentMinutes >= endMinutes) return false;
      }
      return true;
    })
    .map((cls) => {
      // Xác định trạng thái Ongoing nếu thời gian hiện tại nằm trong khoảng startTime - endTime
      let computedStatus = cls.status || "Upcoming";
      if (cls.startTime && cls.endTime) {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const [startH, startM] = cls.startTime.split(":").map(Number);
        const [endH, endM] = cls.endTime.split(":").map(Number);
        const startMinutes = (startH || 0) * 60 + (startM || 0);
        const endMinutes = (endH || 0) * 60 + (endM || 0);

        if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
          computedStatus = "Ongoing";
        } else {
          computedStatus = "Upcoming";
        }
      } else if (computedStatus.toLowerCase() === "in progress") {
        computedStatus = "Ongoing";
      }

      return {
        id: cls.classId,
        className: cls.className,
        timePeriod: cls.timePeriod,
        room: cls.room || "Room 201",
        studentsCount: cls.studentsCount ?? 0,
        status: computedStatus,
        attendanceTaken: cls.attendanceTaken ?? false,
        startTime: cls.startTime,
        endTime: cls.endTime,
      };
    });

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
