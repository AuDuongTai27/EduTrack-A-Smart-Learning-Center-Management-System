import PageHeader from "../../../components/Common/PageHeader";
import {
  TeacherProfilePrimaryInfo,
  TeacherProfileDetails,
  TeacherProfileBottomAction,
} from "../../../components/teacher/Teacher/profile";
export default function TeacherProfilePage() {
  return (
    <>
      {/* Breadcrumb & Page Title */}
      <PageHeader
        title="Profile"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teacher/dashboard" },
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
          <TeacherProfilePrimaryInfo />

          {/* Details Grid */}
          <TeacherProfileDetails />

          {/* Bottom Action */}
          <TeacherProfileBottomAction />
        </div>
      </div>
    </>
  );
}
