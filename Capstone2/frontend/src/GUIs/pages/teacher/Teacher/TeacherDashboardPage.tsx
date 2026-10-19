import PageHeader from "../../../components/Common/PageHeader";
import {
  GreetingSection,
  TeacherProfileCard,
  TeacherKpiCards,
  TodayClassesSection,
  NotificationsSection,
} from "../../../components/teacher/Teacher/dashboard";

export default function TeacherDashboardPage() {
  return (
    <>
      {/* Breadcrumb & Page Title */}
      <PageHeader
        title="Teacher Dashboard"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teacher/dashboard" },
          { label: "Teacher Dashboard" },
        ]}
      />

      {/* Greeting section */}
      <GreetingSection />

      <div className="row">
        <div className="col-xxl-6 col-xl-12">
          {/* Teacher profile */}
          <TeacherProfileCard />

          {/* Dashboard KPI Cards */}
          <TeacherKpiCards />

          {/* Today's class */}
          <TodayClassesSection />
        </div>

        <div className="col-xxl-6 col-xl-12 d-flex flex-column">
          {/* Notifications */}
          <NotificationsSection />
        </div>
      </div>
    </>
  );
}

