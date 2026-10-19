import PageHeader from "../../../components/Common/PageHeader";
import {
  LearningProgressHeader,
  ProgressPagination,
  ProgressTable,
} from "../../../components/teacher/TeachingAssistant/learningProgress";

export default function TeachingAssistantLearningProgressPage() {
  return (
    <>
      {/* Breadcrumb & Page Title */}
      <PageHeader
        title="Learning Progress"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teaching-assistant/dashboard" },
          { label: "Learning Progress" },
        ]}
      />

      {/* Learning Progress Card */}
      <div className="card class-list-card border-0 mb-4">
        {/* Card Header & Class Selector */}
        <LearningProgressHeader />

        {/* Toolbar & Table */}
        <ProgressTable />

        {/* Footer Pagination */}
        <ProgressPagination />
      </div>
    </>
  );
}
