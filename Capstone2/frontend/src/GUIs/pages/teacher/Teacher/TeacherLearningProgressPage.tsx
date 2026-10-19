import PageHeader from "../../../components/Common/PageHeader";
import {
  LearningProgressHeader,
  ProgressTable,
  ProgressPagination,
} from "../../../components/teacher/Teacher/learningProgress";
export default function TeacherLearningProgressPage() {
  return (
    <>
      {/* Breadcrumb & Page Title */}
      <PageHeader
        title="Learning Progress"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teacher/dashboard" },
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
