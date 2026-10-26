import React, { useState, useEffect } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import {
  TeacherProfilePrimaryInfo,
  TeacherProfileDetails,
  TeacherProfileBottomAction,
} from "../../../components/teacher/Teacher/profile";
import { userDAL } from "../../../../DAL/userDAL";
import type { UserDto } from "../../../../BLL/models/UserDto";

export default function TeacherProfilePage() {
  const [teacher, setTeacher] = useState<UserDto | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadTeacherProfile() {
      try {
        // Teacher TC001 có userId = 3
        const data = await userDAL.getUserById(3);
        if (isMounted && data) {
          setTeacher(data);
        }
      } catch (err) {
        console.warn("Lỗi tải thông tin hồ sơ giáo viên:", err);
      }
    }
    loadTeacherProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      {/* Breadcrumb & Page Title */}
      <PageHeader
        title="Hồ sơ Giáo viên"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teacher/dashboard" },
          { label: "Hồ sơ cá nhân" },
        ]}
      />

      {/* Profile */}
      <div className="card class-list-card border-0 mb-4">
        <div className="class-list-header d-flex align-items-center justify-content-between">
          <h4 className="class-list-title">Thông tin tài khoản Giáo viên</h4>
        </div>
        <div className="card-body p-4">
          {/* Avatar & Primary Info */}
          <TeacherProfilePrimaryInfo teacher={teacher} />

          {/* Details Grid */}
          <TeacherProfileDetails teacher={teacher} />

          {/* Bottom Action */}
          <TeacherProfileBottomAction />
        </div>
      </div>
    </>
  );
}
