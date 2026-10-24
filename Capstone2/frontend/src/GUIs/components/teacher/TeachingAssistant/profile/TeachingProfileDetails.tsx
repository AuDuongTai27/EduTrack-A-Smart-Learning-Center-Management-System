import React from "react";
import type { UserDto } from "../../../../../BLL/models/UserDto";

export interface TeachingProfileDetailsProps {
  ta?: UserDto | null;
}

export function TeachingProfileDetails({ ta }: TeachingProfileDetailsProps) {
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "15/08/1995";
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      }
    } catch {
      // ignore
    }
    return dateStr;
  };

  const fullName = ta?.fullName || "Âu Dương Tài";
  const email = ta?.email || "tai.auduong@edutrack.edu.vn";
  const phone = ta?.phone || "0934567890";
  const gender = ta?.gender === "female" ? "Nữ" : "Nam";
  const specialty = ta?.specialty || "Trợ giảng chuyên môn & Hỗ trợ học tập";
  const dob = formatDate(ta?.dateOfBirth);
  const enrolledSince = formatDate(ta?.enrolledSince || ta?.createdAt);

  return (
    <div className="row g-4 mb-4">
      <div className="col-md-6 col-lg-4">
        <div className="p-3 bg-light rounded-3 border">
          <small className="text-muted d-block mb-1">
            <i className="bi bi-person me-1 text-primary" />Họ và tên
          </small>
          <span className="fw-semibold text-dark">{fullName}</span>
        </div>
      </div>
      <div className="col-md-6 col-lg-4">
        <div className="p-3 bg-light rounded-3 border">
          <small className="text-muted d-block mb-1">
            <i className="bi bi-briefcase me-1 text-primary" />Vai trò &amp; Chuyên môn
          </small>
          <span className="fw-semibold text-dark">Trợ giảng ({specialty})</span>
        </div>
      </div>
      <div className="col-md-6 col-lg-4">
        <div className="p-3 bg-light rounded-3 border">
          <small className="text-muted d-block mb-1">
            <i className="bi bi-calendar-event me-1 text-primary" />Ngày sinh
          </small>
          <span className="fw-semibold text-dark">{dob}</span>
        </div>
      </div>
      <div className="col-md-6 col-lg-4">
        <div className="p-3 bg-light rounded-3 border">
          <small className="text-muted d-block mb-1">
            <i className="bi bi-gender-ambiguous me-1 text-primary" />Giới tính
          </small>
          <span className="fw-semibold text-dark">{gender}</span>
        </div>
      </div>
      <div className="col-md-6 col-lg-4">
        <div className="p-3 bg-light rounded-3 border">
          <small className="text-muted d-block mb-1">
            <i className="bi bi-calendar-check me-1 text-primary" />Ngày gia nhập trung tâm
          </small>
          <span className="fw-semibold text-dark">{enrolledSince}</span>
        </div>
      </div>
      <div className="col-md-6 col-lg-4">
        <div className="p-3 bg-light rounded-3 border">
          <small className="text-muted d-block mb-1">
            <i className="bi bi-telephone me-1 text-primary" />Số điện thoại
          </small>
          <span className="fw-semibold text-dark">{phone}</span>
        </div>
      </div>
      <div className="col-md-6 col-lg-6">
        <div className="p-3 bg-light rounded-3 border">
          <small className="text-muted d-block mb-1">
            <i className="bi bi-envelope me-1 text-primary" />Email liên hệ
          </small>
          <span className="fw-semibold text-dark">{email}</span>
        </div>
      </div>
      <div className="col-md-6 col-lg-6">
        <div className="p-3 bg-light rounded-3 border">
          <small className="text-muted d-block mb-1">
            <i className="bi bi-geo-alt me-1 text-primary" />Địa chỉ công tác
          </small>
          <span className="fw-semibold text-dark">
            123 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh
          </span>
        </div>
      </div>
    </div>
  );
}

export default TeachingProfileDetails;
