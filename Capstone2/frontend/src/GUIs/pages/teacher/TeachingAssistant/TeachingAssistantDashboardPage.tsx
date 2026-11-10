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

const DEFAULT_TA_ID = 5; // Âu Dương Tài

export default function TeachingAssistantDashboardPage() {
  const [dashboardData, setDashboardData] = useState<TeachingDashboardViewModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        const dashData = await teachingDAL.getDashboard(DEFAULT_TA_ID);
        if (isMounted) setDashboardData(dashData);
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
      // Bỏ qua lớp đã hoàn thành hoặc đã quá giờ kết thúc
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
        sessionId: cls.sessionId,
        className: cls.className,
        timePeriod: cls.timePeriod,
        room: cls.room || "Room 201",
        studentsCount: cls.studentsCount ?? 0,
        status: computedStatus,
        attendanceTaken: cls.attendanceTaken ?? false,
        startTime: cls.startTime,
        endTime: cls.endTime,
      };
    })
    .sort((a, b) => {
      const aOngoing = a.status === "Ongoing";
      const bOngoing = b.status === "Ongoing";
      if (aOngoing && !bOngoing) return -1;
      if (!aOngoing && bOngoing) return 1;
      return (a.startTime || "").localeCompare(b.startTime || "");
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
            activeAssignments={kpis?.activeAssignments ?? 0}
            assignmentsDueToday={kpis?.assignmentsDueToday ?? 0}
            activeClasses={kpis?.activeClasses ?? 0}
            classesToday={kpis?.classesToday ?? 0}
            totalStudents={kpis?.totalStudents ?? 0}
            pendingAttendance={kpis?.pendingAttendance ?? 0}
          />

          <div className="row">
            <div className="col-xxl-6 col-xl-12">
              {/* Today's class */}
              <TodayClassesSection classes={mappedTodayClasses} />
            </div>

            <div className="col-xxl-6 col-xl-12 align-self-start">
              {/* Notifications */}
              <NotificationsSection />
            </div>
          </div>
        </>
      )}
    </>
  );
}
