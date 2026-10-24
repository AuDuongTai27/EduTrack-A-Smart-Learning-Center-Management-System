import React, { useState, useEffect } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import {
  TeachingAssistantProfileBottomAction,
  TeachingProfileDetails,
  TeachingProfilePrimaryInfo,
} from "../../../components/teacher/TeachingAssistant/profile";
import { userDAL } from "../../../../DAL/userDAL";
import type { UserDto } from "../../../../BLL/models/UserDto";

export default function TeachingAssistantProfilePage() {
  const [ta, setTa] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadTaProfile() {
      try {
        setLoading(true);
        const res = await userDAL.getUserById(5); // Âu Dương Tài
        if (isMounted && res) {
          setTa(res);
        }
      } catch (err) {
        console.warn("Lỗi tải thông tin hồ sơ TA:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadTaProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      {/* Breadcrumb & Page Title */}
      <PageHeader
        title="Hồ Sơ Cá Nhân Trợ Giảng"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teaching-assistant/dashboard" },
          { label: "Hồ sơ cá nhân" },
        ]}
      />

      {loading && (
        <div className="alert alert-info py-2 px-3 mb-3 d-flex align-items-center gap-2">
          <div className="spinner-border spinner-border-sm" role="status" />
          <span>Đang tải thông tin hồ sơ...</span>
        </div>
      )}

      {/* Profile */}
      <div className="card class-list-card border-0 mb-4">
        <div className="class-list-header d-flex align-items-center justify-content-between">
          <h4 className="class-list-title">Thông Tin Trợ Giảng</h4>
        </div>
        <div className="card-body p-4">
          {/* Avatar & Primary Info */}
          <TeachingProfilePrimaryInfo ta={ta} />

          {/* Details Grid */}
          <TeachingProfileDetails ta={ta} />

          {/* Bottom Action */}
          <TeachingAssistantProfileBottomAction />
        </div>
      </div>
    </>
  );
}
