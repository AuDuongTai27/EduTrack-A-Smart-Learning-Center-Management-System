import PageHeader from "../../../components/Common/PageHeader";
import {
  GreetingSection,
  TeachingAssistantProfileCard,
  TeachingAssistantKpiCards,
  TodayClassesSection,
  NotificationsSection,
} from "../../../components/teacher/TeachingAssistant/dashboard";

export default function TeachingAssistantDashboardPage() {
  return (
    <>
      {/* Breadcrumb & Page Title */}
      <PageHeader
        title="Teaching Assistant Dashboard"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teaching-assistant/dashboard" },
          { label: "Teaching Assistant Dashboard" },
        ]}
      />

      {/* Greeting section */}
      <GreetingSection />

      <div className="row">
        <div className="col-xxl-6 col-xl-12">
          {/* Teaching Assistant profile */}
          <TeachingAssistantProfileCard />

          {/* Dashboard KPI Cards */}
          <TeachingAssistantKpiCards />

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
