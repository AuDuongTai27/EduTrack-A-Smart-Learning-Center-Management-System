import React from "react";
import { Link } from "react-router-dom";

export interface TeacherProfileCardProps {
  id?: string;
  name?: string;
  avatar?: string;
  role?: string;
  classes?: string;
  subject?: string;
  profileUrl?: string;
}

export const teacherProfileData: TeacherProfileCardProps = {
  id: "#T594651",
  name: "Henriques Morgan",
  avatar: "/assets/img/profiles/avatar-27.jpg",
  role: "Teacher",
  classes: "I-A, V-B",
  subject: "Physics",
  profileUrl: "/teacher/profile",
};

export function TeacherProfileCard({
  id = teacherProfileData.id,
  name = teacherProfileData.name,
  avatar = teacherProfileData.avatar,
  role = teacherProfileData.role,
  subject = teacherProfileData.subject,
  profileUrl = teacherProfileData.profileUrl,
}: TeacherProfileCardProps = {}) {
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
          to={profileUrl ?? "/teacher/profile"}
          className="btn btn-primary d-inline-flex align-items-center gap-2"
        >
          <i className="bi bi-pencil-square" /> View Profile
        </Link>
      </div>
    </div>
  );
}

export default TeacherProfileCard;
