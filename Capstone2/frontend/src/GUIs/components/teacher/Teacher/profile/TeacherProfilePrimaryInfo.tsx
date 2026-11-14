import React from "react";
import type { TeacherProfileDto } from "../../../../../BLL/models/teaching/TeachingProfileDto";
import type { UserDto } from "../../../../../BLL/models/UserDto";

export interface TeacherProfilePrimaryInfoProps {
  teacher?: TeacherProfileDto | UserDto | null;
  profile?: TeacherProfileDto | null;
}

export function TeacherProfilePrimaryInfo({ teacher, profile }: TeacherProfilePrimaryInfoProps) {
  const data = profile || teacher;
  const fullName = data?.fullName || "Hoang Quoc Viet, M.Sc.";
  const userCode = data?.userCode || "TC001";
  const roleRaw =
    (data as any)?.roleTitle ||
    ((data as any)?.roles && (data as any).roles.length > 0 ? (data as any).roles[0] : "Teacher");
  const roleName = roleRaw === "Giáo viên" ? "Teacher" : roleRaw === "Trợ giảng" ? "Teaching Assistant" : roleRaw;
  const avatarUrl = data?.avatarUrl || "/assets/img/profiles/avatar-27.jpg";
  const specialty = data?.specialty || "Mathematics & Teaching Methodology";
  const activeClasses = (data as any)?.activeClassesCount;
  const totalStudents = (data as any)?.totalStudentsCount;

  return (
    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 pb-4 mb-4 border-bottom">
      <div className="d-flex align-items-center gap-3">
        <div className="profile-avatar-wrap" style={{ width: 80, height: 80 }}>
          <img
            src={avatarUrl}
            alt={fullName}
            className="profile-avatar-img rounded-circle border shadow-sm"
            style={{ width: "80px", height: "80px", objectFit: "cover" }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/assets/img/profiles/avatar-27.jpg";
            }}
          />
        </div>
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h4 className="mb-0 text-dark fw-bold">{fullName}</h4>
            <span className="badge bg-primary text-capitalize">{roleName}</span>
            <span className="badge bg-primary-subtle text-primary">#{userCode}</span>
          </div>
          <p className="text-muted mb-0 small">
            <i className="bi bi-buildings me-1 text-primary" />
            EduTrack Smart Learning Center • Specialty: <strong>{specialty}</strong>
          </p>
        </div>
      </div>

      {(activeClasses !== undefined || totalStudents !== undefined) && (
        <div className="d-flex align-items-center gap-2 ms-auto">
          {activeClasses !== undefined && (
            <div className="px-3 py-2 bg-light border rounded-3 text-center">
              <span className="d-block fw-bold text-primary fs-5 lh-1">{activeClasses}</span>
              <small className="text-muted" style={{ fontSize: '11px' }}>Assigned Classes</small>
            </div>
          )}
          {totalStudents !== undefined && (
            <div className="px-3 py-2 bg-light border rounded-3 text-center">
              <span className="d-block fw-bold text-success fs-5 lh-1">{totalStudents}</span>
              <small className="text-muted" style={{ fontSize: '11px' }}>Students</small>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TeacherProfilePrimaryInfo;
