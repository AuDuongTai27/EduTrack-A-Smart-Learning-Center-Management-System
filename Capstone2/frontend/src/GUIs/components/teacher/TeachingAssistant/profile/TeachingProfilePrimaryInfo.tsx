import React from "react";
import type { UserDto } from "../../../../../BLL/models/UserDto";

export interface TeachingProfilePrimaryInfoProps {
  ta?: UserDto | null;
}

export function TeachingProfilePrimaryInfo({ ta }: TeachingProfilePrimaryInfoProps) {
  const fullName = ta?.fullName || "Âu Dương Tài";
  const userCode = ta?.userCode || "TA001";
  const roleName = ta?.roles && ta.roles.length > 0 ? ta.roles[0] : "Teaching Assistant";
  const avatarUrl = ta?.avatarUrl || "/assets/img/profiles/avatar-27.jpg";

  return (
    <div className="d-flex align-items-center gap-3 pb-4 mb-4 border-bottom">
      <div className="profile-avatar-wrap" style={{ width: 80, height: 80 }}>
        <img
          src={avatarUrl}
          alt={fullName}
          className="profile-avatar-img rounded-circle border"
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
          EduTrack Smart Learning Center • Chuyên môn: <strong>{ta?.specialty || "Trợ giảng chuyên môn"}</strong>
        </p>
      </div>
    </div>
  );
}

export default TeachingProfilePrimaryInfo;
