import { Link } from "react-router-dom";

export interface TeachingAssistantProfileCardProps {
  id?: string;
  name?: string;
  avatar?: string;
  role?: string;
  classes?: string;
  subject?: string;
  profileUrl?: string;
}

export const teachingAssistantProfileData: TeachingAssistantProfileCardProps = {
  id: "#T594651",
  name: "Henriques Morgan",
  avatar: "/assets/img/profiles/avatar-27.jpg",
  role: "Teaching Assistant",
  classes: "I-A, V-B",
  subject: "Physics",
  profileUrl: "/teaching-assistant/profile",
};

export function TeachingAssistantProfileCard({
  id = teachingAssistantProfileData.id,
  name = teachingAssistantProfileData.name,
  avatar = teachingAssistantProfileData.avatar,
  role = teachingAssistantProfileData.role,
  subject = teachingAssistantProfileData.subject,
  profileUrl = teachingAssistantProfileData.profileUrl,
}: TeachingAssistantProfileCardProps = {}) {
  return (
    <div className="card teacher-profile-card border-0 mb-4">
      <div className="card-body d-flex flex-column flex-sm-row align-items-sm-center justify-content-between p-4 gap-3">
        <div className="d-flex align-items-center gap-3">
          <div className="profile-avatar-wrap">
            <img
              src={avatar}
              alt={name}
              className="profile-avatar-img"
            />
          </div>
          <div>
            <span className="badge bg-primary-subtle text-primary mb-1">
              {id}
            </span>
            <h4 className="mb-1 text-dark fw-bold">{name}</h4>
            <div className="d-flex align-items-center flex-wrap gap-2 text-muted small">
              <span className="d-inline-flex align-items-center gap-1">
                <img
                  src="/assets/img/icons/teacher.svg"
                  alt="Role"
                  width={16}
                  height={16}
                />
                {role}
              </span>
              <span className="d-inline-flex align-items-center gap-1 ms-2">
                <img
                  src="/assets/img/icons/subject.svg"
                  alt="Subject"
                  width={16}
                  height={16}
                />
                {subject}
              </span>
            </div>
          </div>
        </div>
        <Link
          to={profileUrl ?? "/teaching-assistant/profile"}
          className="btn btn-primary d-inline-flex align-items-center gap-2"
        >
          <i className="bi bi-pencil-square" /> View Profile
        </Link>
      </div>
    </div>
  );
}

export default TeachingAssistantProfileCard;
