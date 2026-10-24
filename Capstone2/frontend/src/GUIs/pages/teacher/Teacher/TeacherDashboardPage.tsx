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
import { userDAL } from "../../../../DAL/userDAL";
import { classDAL } from "../../../../DAL/classDAL";
import { scheduleDAL } from "../../../../DAL/scheduleDAL";
import { notificationDAL } from "../../../../DAL/notificationDAL";
import type { UserDto } from "../../../../BLL/models/UserDto";
import type { ClassDto } from "../../../../BLL/models/ClassDto";
import type { ClassScheduleDto } from "../../../../BLL/models/ClassScheduleDto";
import type { NotificationDto } from "../../../../BLL/models/NotificationDto";
import type { TeacherNotification } from "../../../components/teacher/notificationsData";

export default function TeacherDashboardPage() {
  const [teacher, setTeacher] = useState<UserDto | null>(null);
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [todayClasses, setTodayClasses] = useState<TodayClassItem[]>([]);
  const [notifications, setNotifications] = useState<TeacherNotification[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        const [userRes, classesRes, schedulesRes, notifsRes] = await Promise.all([
          userDAL.getUserById(3), // ThS. Hoàng Quốc Việt
          classDAL.getAllClasses(),
          scheduleDAL.getAllClassSchedules(),
          notificationDAL.getAllNotifications(),
        ]);

        if (isMounted) {
          if (userRes) setTeacher(userRes);
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
        console.warn("Lỗi tải dữ liệu TeacherDashboard:", err);
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const teacherName = teacher?.fullName || "ThS. Hoàng Quốc Việt";
  const userCode = teacher?.userCode ? `#${teacher.userCode}` : "#TC001";
  const specialty = teacher?.specialty || "Toán học & Luyện thi";
  const avatar = teacher?.avatarUrl || "/assets/img/profiles/avatar-27.jpg";

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

      <div className="row">
        <div className="col-xxl-6 col-xl-12">
          {/* Teacher profile */}
          <TeacherProfileCard
            id={userCode}
            name={teacherName}
            avatar={avatar}
            role="Giáo viên chuyên môn"
            subject={specialty}
            profileUrl="/teacher/profile"
          />

          {/* Dashboard KPI Cards */}
          <TeacherKpiCards
            activeAssignments={8}
            assignmentsDueToday={3}
            activeClasses={classes.length > 0 ? classes.length : 6}
            classesToday={todayClasses.length > 0 ? todayClasses.length : 2}
          />

          {/* Today's class */}
          <TodayClassesSection classes={todayClasses} />
        </div>

        <div className="col-xxl-6 col-xl-12 d-flex flex-column">
          {/* Notifications */}
          <NotificationsSection
            notifications={notifications.length > 0 ? notifications : undefined}
            viewAllUrl="/teacher/notifications"
          />
        </div>
      </div>
    </>
  );
}
