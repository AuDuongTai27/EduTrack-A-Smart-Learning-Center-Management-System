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

  const fullName = data?.fullName || "ThS. Hoàng Quốc Việt";
  const email = data?.email || "viet.hoang@edutrack.edu.vn";
  const phone = data?.phone || "0903 123 456";
  const gender =
    data?.gender === "female" || data?.gender === "Nữ"
      ? "Nữ"
      : data?.gender === "other" || data?.gender === "Khác"
      ? "Khác"
      : "Nam";
  const specialty = data?.specialty || "Toán Học & Phương Pháp Giảng Dạy";
  const dob = formatDate((data as any)?.dateOfBirth);
  const enrolledSince = formatDate((data as any)?.enrolledSince || (data as any)?.createdAt);
  const address = (data as any)?.address || "123 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh";
  const roleLabel = (data as any)?.roleTitle || "Giáo viên chuyên môn";

  return (
    <div className="row g-4 mb-4">
      <div className="col-md-6 col-lg-4">
        <div className="p-3 bg-light rounded-3 border h-100">
          <small className="text-muted d-block mb-1">
            <i className="bi bi-person me-1 text-primary" />
            Họ và tên
          </small>
          <span className="fw-semibold text-dark">{fullName}</span>
        </div>
      </div>
      <div className="col-md-6 col-lg-4">
        <div className="p-3 bg-light rounded-3 border h-100">
          <small className="text-muted d-block mb-1">
            <i className="bi bi-briefcase me-1 text-primary" />
            Vai trò &amp; Chuyên môn
          </small>
          <span className="fw-semibold text-dark">{roleLabel} ({specialty})</span>
        </div>
      </div>
      <div className="col-md-6 col-lg-4">
        <div className="p-3 bg-light rounded-3 border h-100">
          <small className="text-muted d-block mb-1">
            <i className="bi bi-calendar-event me-1 text-primary" />
            Ngày sinh
          </small>
          <span className="fw-semibold text-dark">{dob}</span>
        </div>
      </div>
      <div className="col-md-6 col-lg-4">
        <div className="p-3 bg-light rounded-3 border h-100">
          <small className="text-muted d-block mb-1">
            <i className="bi bi-gender-ambiguous me-1 text-primary" />
            Giới tính
          </small>
          <span className="fw-semibold text-dark">{gender}</span>
        </div>
      </div>
      <div className="col-md-6 col-lg-4">
        <div className="p-3 bg-light rounded-3 border h-100">
          <small className="text-muted d-block mb-1">
            <i className="bi bi-calendar-check me-1 text-primary" />
            Ngày gia nhập trung tâm
          </small>
          <span className="fw-semibold text-dark">{enrolledSince}</span>
        </div>
      </div>
      <div className="col-md-6 col-lg-4">
        <div className="p-3 bg-light rounded-3 border h-100">
          <small className="text-muted d-block mb-1">
            <i className="bi bi-telephone me-1 text-primary" />
            Số điện thoại
          </small>
          <span className="fw-semibold text-dark">{phone}</span>
        </div>
      </div>
      <div className="col-md-6 col-lg-6">
        <div className="p-3 bg-light rounded-3 border h-100">
          <small className="text-muted d-block mb-1">
            <i className="bi bi-envelope me-1 text-primary" />
            Email liên hệ
          </small>
          <span className="fw-semibold text-dark">{email}</span>
        </div>
      </div>
      <div className="col-md-6 col-lg-6">
        <div className="p-3 bg-light rounded-3 border h-100">
          <small className="text-muted d-block mb-1">
            <i className="bi bi-geo-alt me-1 text-primary" />
            Địa chỉ công tác
          </small>
          <span className="fw-semibold text-dark">{address}</span>
        </div>
      </div>
    </div>
  );
}

export default TeacherProfileDetails;
