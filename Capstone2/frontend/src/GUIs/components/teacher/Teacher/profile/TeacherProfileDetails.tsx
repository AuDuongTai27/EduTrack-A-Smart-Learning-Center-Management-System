import React from "react";
import type { TeacherProfileDto } from "../../../../../BLL/models/teaching/TeachingProfileDto";
import type { UserDto } from "../../../../../BLL/models/UserDto";

export interface TeacherProfileDetailsProps {
  teacher?: TeacherProfileDto | UserDto | null;
  profile?: TeacherProfileDto | null;
}

export function TeacherProfileDetails({ teacher, profile }: TeacherProfileDetailsProps) {
  const data = profile || teacher;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "10/11/1990";
    try {
      if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
        }
      }
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      }
    } catch {
      // ignore
    }
    return dateStr;
  };

  const fullName = data?.fullName || "Hoang Quoc Viet, M.Sc.";
  const email = data?.email || "viet.hoang@edutrack.edu.vn";
  const phone = data?.phone || "0903 123 456";
  const gender =
    data?.gender === "female" || data?.gender === "Nữ"
      ? "Female"
      : data?.gender === "other" || data?.gender === "Khác"
      ? "Other"
      : "Male";
  const specialty = data?.specialty || "Mathematics & Teaching Methodology";
  const dob = formatDate((data as any)?.dateOfBirth);
  const enrolledSince = formatDate((data as any)?.enrolledSince || (data as any)?.createdAt);
  const address = (data as any)?.address || "123 Nguyen Van Cu, District 5, Ho Chi Minh City";
  const roleLabel = (data as any)?.roleTitle || "Subject Teacher";

  return (
    <div className="row g-4 mb-4">
      <div className="col-md-6 col-lg-4">
        <div className="p-3 bg-light rounded-3 border h-100">
          <small className="text-muted d-block mb-1">
            <i className="bi bi-person me-1 text-primary" />
            Full Name
          </small>
          <span className="fw-semibold text-dark">{fullName}</span>
        </div>
      </div>
      <div className="col-md-6 col-lg-4">
        <div className="p-3 bg-light rounded-3 border h-100">
          <small className="text-muted d-block mb-1">
            <i className="bi bi-briefcase me-1 text-primary" />
            Role &amp; Specialty
          </small>
          <span className="fw-semibold text-dark">{roleLabel} ({specialty})</span>
        </div>
      </div>
      <div className="col-md-6 col-lg-4">
        <div className="p-3 bg-light rounded-3 border h-100">
          <small className="text-muted d-block mb-1">
            <i className="bi bi-calendar-event me-1 text-primary" />
            Date of Birth
          </small>
          <span className="fw-semibold text-dark">{dob}</span>
        </div>
      </div>
      <div className="col-md-6 col-lg-4">
        <div className="p-3 bg-light rounded-3 border h-100">
          <small className="text-muted d-block mb-1">
            <i className="bi bi-gender-ambiguous me-1 text-primary" />
            Gender
          </small>
          <span className="fw-semibold text-dark">{gender}</span>
        </div>
      </div>
      <div className="col-md-6 col-lg-4">
        <div className="p-3 bg-light rounded-3 border h-100">
          <small className="text-muted d-block mb-1">
            <i className="bi bi-calendar-check me-1 text-primary" />
            Joined Date
          </small>
          <span className="fw-semibold text-dark">{enrolledSince}</span>
        </div>
      </div>
      <div className="col-md-6 col-lg-4">
        <div className="p-3 bg-light rounded-3 border h-100">
          <small className="text-muted d-block mb-1">
            <i className="bi bi-telephone me-1 text-primary" />
            Phone Number
          </small>
          <span className="fw-semibold text-dark">{phone}</span>
        </div>
      </div>
      <div className="col-md-6 col-lg-6">
        <div className="p-3 bg-light rounded-3 border h-100">
          <small className="text-muted d-block mb-1">
            <i className="bi bi-envelope me-1 text-primary" />
            Contact Email
          </small>
          <span className="fw-semibold text-dark">{email}</span>
        </div>
      </div>
      <div className="col-md-6 col-lg-6">
        <div className="p-3 bg-light rounded-3 border h-100">
          <small className="text-muted d-block mb-1">
            <i className="bi bi-geo-alt me-1 text-primary" />
            Work Address
          </small>
          <span className="fw-semibold text-dark">{address}</span>
        </div>
      </div>
    </div>
  );
}

export default TeacherProfileDetails;
