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
import { userDAL } from "../../../../DAL/userDAL";
import { classDAL } from "../../../../DAL/classDAL";
import { scheduleDAL } from "../../../../DAL/scheduleDAL";
import { notificationDAL } from "../../../../DAL/notificationDAL";
import type { UserDto } from "../../../../BLL/models/UserDto";
import type { ClassDto } from "../../../../BLL/models/ClassDto";
import type { ClassScheduleDto } from "../../../../BLL/models/ClassScheduleDto";
import type { NotificationDto } from "../../../../BLL/models/NotificationDto";
import type { TeacherNotification } from "../../../components/teacher/notificationsData";

export default function TeachingAssistantDashboardPage() {
  const [ta, setTa] = useState<UserDto | null>(null);
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [todayClasses, setTodayClasses] = useState<TodayClassItem[]>([]);
  const [notifications, setNotifications] = useState<TeacherNotification[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        const [userRes, classesRes, schedulesRes, notifsRes] = await Promise.all([
          userDAL.getUserById(5), // Âu Dương Tài
          classDAL.getAllClasses(),
          scheduleDAL.getAllClassSchedules(),
          notificationDAL.getAllNotifications(),
        ]);

        if (isMounted) {
          if (userRes) setTa(userRes);
          if (classesRes.data) setClasses(classesRes.data);

          // Lấy các ca học hôm nay từ schedules hoặc classes
          if (schedulesRes.data && schedulesRes.data.length > 0) {
            const mappedToday: TodayClassItem[] = schedulesRes.data.slice(0, 3).map((s: ClassScheduleDto) => ({
              id: s.classId,
              className: s.className || `Lớp học #${s.classId}`,
              timePeriod: `${s.startTime?.substring(0, 5) || "08:00"} - ${s.endTime?.substring(0, 5) || "09:45"}`,
            }));
            setTodayClasses(mappedToday);
          } else if (classesRes.data && classesRes.data.length > 0) {
            const mappedToday: TodayClassItem[] = classesRes.data.slice(0, 2).map((c: ClassDto, idx: number) => ({
              id: c.classId,
              className: c.className,
              timePeriod: idx === 0 ? "08:00 - 09:45" : "10:00 - 11:45",
            }));
            setTodayClasses(mappedToday);
          }

          // Map thông báo sang format TeacherNotification
          if (notifsRes.data && notifsRes.data.length > 0) {
            const mappedNotifs: TeacherNotification[] = notifsRes.data.slice(0, 4).map((n: NotificationDto) => ({
              id: n.notificationId,
              sender: "Ban Giám Đốc EduTrack",
              initials: "ET",
              initialsBgClass: "bg-primary-subtle",
              initialsColorClass: "text-primary",
              isNew: !n.isRead,
              isRead: n.isRead,
              timeAgo: n.createdAt ? new Date(n.createdAt).toLocaleDateString("vi-VN") : "Hôm nay",
              title: n.title,
              description: n.content,
              hasBottomBorder: true,
            }));
            setNotifications(mappedNotifs);
          }
        }
      } catch (err) {
        console.warn("Lỗi tải dữ liệu TeachingAssistantDashboard:", err);
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const taName = ta?.fullName || "Âu Dương Tài";
  const userCode = ta?.userCode ? `#${ta.userCode}` : "#TA001";
  const specialty = ta?.specialty || "Teaching Assistant";
  const avatar = ta?.avatarUrl || "/assets/img/profiles/avatar-27.jpg";

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

      <div className="row">
        <div className="col-xxl-6 col-xl-12">
          {/* Teaching Assistant profile */}
          <TeachingAssistantProfileCard
            id={userCode}
            name={taName}
            avatar={avatar}
            role="Trợ giảng chuyên môn"
            subject={specialty}
            profileUrl="/teaching-assistant/profile"
          />

          {/* Dashboard KPI Cards */}
          <TeachingAssistantKpiCards
            activeAssignments={10}
            assignmentsDueToday={4}
            activeClasses={classes.length > 0 ? classes.length : 6}
            classesToday={todayClasses.length > 0 ? todayClasses.length : 3}
          />

          {/* Today's class */}
          <TodayClassesSection classes={todayClasses} />
        </div>

        <div className="col-xxl-6 col-xl-12 d-flex flex-column">
          {/* Notifications */}
          <NotificationsSection
            notifications={notifications.length > 0 ? notifications : undefined}
            viewAllUrl="/teaching-assistant/notifications"
          />
        </div>
      </div>
    </>
  );
}
