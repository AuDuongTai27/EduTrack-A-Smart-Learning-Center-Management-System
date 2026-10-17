import { Link } from "react-router-dom";
import PageHeader from "../../../components/Common/PageHeader";
import {
  AssignmentsSection,
  ClassInfoCard,
  ParticipantsSection,
  SessionsSection,
} from "../../../components/teacher/TeachingAssistant/classDetails";

export default function TeachingAssistantClassDetailsPage() {
  return (
    <>
      {/* Breadcrumb & Page Title */}
      <PageHeader
        title="Class Details"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teaching-assistant/dashboard" },
          { label: "My Classes", path: "/teaching-assistant/classes" },
          { label: "Class I-A" },
        ]}
        action={
          <div className="d-flex align-items-center gap-2">
            <Link
              to="/teaching-assistant/classes"
              className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
            >
              <i className="bi bi-arrow-left" /> Back to Classes
            </Link>
          </div>
        }
      />
      {/* Class Header */}
      <ClassInfoCard />
      {/* Participant List */}
      <ParticipantsSection />
      {/* Sessions List */}
      <SessionsSection />
      {/* Assignment list*/}
      <AssignmentsSection />
    </>
  );
}