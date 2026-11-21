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
  const roleTitle = profile?.roleTitle || "Teaching Assistant";

  const mappedTodayClasses: TodayClassItem[] = (dashboardData?.todayClasses || [])
    .map((cls) => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      let computedStatus = cls.status || "Upcoming";
      const normalized = computedStatus.toLowerCase();

      if (cls.startTime && cls.endTime) {
        const [startH, startM] = cls.startTime.split(":").map(Number);
        const [endH, endM] = cls.endTime.split(":").map(Number);
        const startMinutes = (startH || 0) * 60 + (startM || 0);
        const endMinutes = (endH || 0) * 60 + (endM || 0);

        if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
          computedStatus = "Ongoing";
        } else if (currentMinutes >= endMinutes || normalized === "completed") {
          computedStatus = "Completed";
        } else {
          computedStatus = "Upcoming";
        }
      } else if (normalized === "completed") {
        computedStatus = "Completed";
      } else if (normalized === "in progress" || normalized === "ongoing") {
        computedStatus = "Ongoing";
      } else {
        computedStatus = "Upcoming";
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
    });

  return (
    <>
      {/* Breadcrumb & Page Title */}
      <PageHeader
        title="Teaching Assistant Dashboard"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teaching-assistant/dashboard" },
          { label: "Teaching Assistant Overview" },
        ]}
      />

      {/* Greeting section */}
      <GreetingSection name={taName} message="Wishing you an effective day supporting classes at EduTrack!" />

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-2">Loading dashboard information...</p>
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
