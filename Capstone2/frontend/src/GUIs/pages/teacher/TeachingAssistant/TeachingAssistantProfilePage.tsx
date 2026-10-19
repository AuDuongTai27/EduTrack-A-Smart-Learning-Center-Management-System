import PageHeader from "../../../components/Common/PageHeader";
import {
  TeachingAssistantProfileBottomAction,
  TeachingProfileDetails,
  TeachingProfilePrimaryInfo,
} from "../../../components/teacher/TeachingAssistant/profile";

export default function TeachingAssistantProfilePage() {
  return (
    <>
      {/* Breadcrumb & Page Title */}
      <PageHeader
        title="Profile"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teaching-assistant/dashboard" },
          { label: "Profile" },
        ]}
      />

      {/* Profile */}
      <div className="card class-list-card border-0 mb-4">
        <div className="class-list-header d-flex align-items-center justify-content-between">
          <h4 className="class-list-title">Profile Information</h4>
        </div>
        <div className="card-body p-4">
          {/* Avatar & Primary Info */}
          <TeachingProfilePrimaryInfo />

          {/* Details Grid */}
          <TeachingProfileDetails />

          {/* Bottom Action */}
          <TeachingAssistantProfileBottomAction />
        </div>
      </div>
    </>
  );
}
