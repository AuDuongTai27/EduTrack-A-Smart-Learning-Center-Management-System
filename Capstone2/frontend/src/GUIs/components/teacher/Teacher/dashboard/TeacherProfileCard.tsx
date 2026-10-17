import React from "react";
import { Link } from "react-router-dom";

export interface TeacherProfileCardProps {
  /** Teacher unique ID code (e.g. "#T594651") */
  id?: string;
  /** Full name of the teacher */
  name?: string;
  /** Avatar image URL */
  avatar?: string;
  /** Teacher's role (e.g. "Teacher", "Teaching Assistant") */
  role?: string;
  /** Subject assigned to teacher */
  subject?: string;
  /** URL for editing profile */
  editProfileUrl?: string;
  /** Optional profile object for override */
  profile?: Omit<TeacherProfileCardProps, "profile">;
}

/**
 * Default teacher profile data object
 */
export const teacherProfileData: Omit<TeacherProfileCardProps, "profile"> = {
  id: "#T594651",
  name: "Henriques Morgan",
  avatar: "/assets/img/profiles/avatar-27.jpg",
  role: "Teacher",
  subject: "Physics",
  editProfileUrl: "/teacher/profile",
};

export function TeacherProfileCard({
  profile,
  id,
  name,
  avatar,
  role,
  subject,
  editProfileUrl,
}: TeacherProfileCardProps = {}) {
  // Merge teacherProfileData with any passed-in profile/prop overrides
  const teacher: Omit<TeacherProfileCardProps, "profile"> = {
    ...teacherProfileData,
    ...profile,
    ...(id !== undefined ? { id } : {}),
    ...(name !== undefined ? { name } : {}),
    ...(avatar !== undefined ? { avatar } : {}),
    ...(role !== undefined ? { role } : {}),
    ...(subject !== undefined ? { subject } : {}),
    ...(editProfileUrl !== undefined ? { editProfileUrl } : {}),
  };

  return (
    <div className="card teacher-profile-card border-0 mb-4">
      <div className="card-body d-flex flex-column flex-sm-row align-items-sm-center justify-content-between p-4 gap-3">
        <div className="d-flex align-items-center gap-3">
          <div className="profile-avatar-wrap">
            <img
              src={teacher.avatar}
              alt={teacher.name}
              className="profile-avatar-img"
            />
          </div>
          <div>
            <span className="badge bg-primary-subtle text-primary mb-1">
              {teacher.id}
            </span>
            <h4 className="mb-1 text-dark fw-bold">{teacher.name}</h4>
            <div className="d-flex align-items-center flex-wrap gap-2 text-muted small">
              <span className="d-inline-flex align-items-center gap-1">
                <img
                  src="/assets/img/icons/teacher.svg"
                  alt="Role"
                  width={16}
                  height={16}
                />
                {teacher.role}
              </span>
              <span className="d-inline-flex align-items-center gap-1 ms-2">
                <img
                  src="/assets/img/icons/subject.svg"
                  alt="Subject"
                  width={16}
                  height={16}
                />
                {teacher.subject}
              </span>
            </div>
          </div>
        </div>
        <Link
          to={teacher.editProfileUrl ?? "/teacher/profile"}
          className="btn btn-primary d-inline-flex align-items-center gap-2"
        >
          <i className="bi bi-pencil-square" /> View Profile
        </Link>
      </div>
    </div>
  );
}

export default TeacherProfileCard;
