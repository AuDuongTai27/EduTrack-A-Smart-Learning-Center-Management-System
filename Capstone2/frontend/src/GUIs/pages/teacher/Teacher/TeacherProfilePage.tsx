import React, { useState, useEffect } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import {
  TeacherProfilePrimaryInfo,
  TeacherProfileDetails,
  TeacherProfileBottomAction,
  TeacherProfileEditCard,
} from "../../../components/teacher/Teacher/profile";
import ChangePasswordModal from "../../../components/teacher/ChangePasswordModal";
import {
  teachingDAL,
  DEFAULT_TEACHER_ID,
  type TeacherProfileDto,
  type UpdateTeacherProfilePayload,
} from "../../../../DAL/teachingDAL";

export default function TeacherProfilePage() {
  const [profile, setProfile] = useState<TeacherProfileDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "danger" } | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadTeacherProfile() {
      try {
        setLoading(true);
        // Teacher TC001 có DEFAULT_TEACHER_ID = 3
        const data = await teachingDAL.getProfile(DEFAULT_TEACHER_ID);
        if (isMounted && data) {
          setProfile(data);
        }
      } catch (err: any) {
        console.warn("Lỗi tải thông tin hồ sơ giáo viên:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadTeacherProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = (message: string, type: "success" | "danger" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleSaveProfile = async (payload: UpdateTeacherProfilePayload) => {
    try {
      setIsSaving(true);
      const updated = await teachingDAL.updateProfile(DEFAULT_TEACHER_ID, payload);
      setProfile(updated);
      setIsEditing(false);
      showToast("Cập nhật thông tin hồ sơ Giáo viên thành công và đã lưu vào hệ thống!", "success");
    } catch (err: any) {
      console.error("Lỗi khi cập nhật hồ sơ Giáo viên:", err);
      showToast(err?.message || "Không thể cập nhật hồ sơ. Vui lòng kiểm tra lại kết nối máy chủ.", "danger");
    } finally {
      setIsSaving(false);
    }
  };

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

      {/* Toast Alert */}
      {toast && (
        <div
          className={`alert ${
            toast.type === "success" ? "alert-success border-success" : "alert-danger border-danger"
          } alert-dismissible fade show d-flex align-items-center gap-2 shadow-sm mb-4`}
          role="alert"
        >
          <i
            className={`bi ${
              toast.type === "success" ? "bi-check-circle-fill text-success" : "bi-exclamation-triangle-fill text-danger"
            } fs-5 flex-shrink-0`}
          />
          <div className="flex-grow-1 fw-medium">{toast.message}</div>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => setToast(null)}
          />
        </div>
      )}

      {loading && (
        <div className="alert alert-info py-2 px-3 mb-4 d-flex align-items-center gap-2">
          <div className="spinner-border spinner-border-sm" role="status" />
          <span>Đang tải thông tin hồ sơ Giáo viên từ máy chủ...</span>
        </div>
      )}

      {/* Profile Card */}
      {isEditing && profile ? (
        <TeacherProfileEditCard
          profile={profile}
          isSaving={isSaving}
          onSave={handleSaveProfile}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="card class-list-card border-0 mb-4 shadow-sm">
          <div className="class-list-header d-flex align-items-center justify-content-between p-3 border-bottom">
            <h4 className="class-list-title mb-0">Thông tin tài khoản Giáo viên</h4>
            <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1">
              <i className="bi bi-shield-check me-1" /> Tài khoản hoạt động
            </span>
          </div>
          <div className="card-body p-4">
            {/* Avatar & Primary Info */}
            <TeacherProfilePrimaryInfo profile={profile} />

            {/* Details Grid */}
            <TeacherProfileDetails profile={profile} />

            {/* Bottom Action */}
            <TeacherProfileBottomAction
              onEdit={() => setIsEditing(true)}
              onChangePassword={() => setIsPasswordModalOpen(true)}
            />
          </div>
        </div>
      )}

      {/* Modal Đổi mật khẩu */}
      <ChangePasswordModal
        userId={DEFAULT_TEACHER_ID}
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={(msg) => showToast(msg, "success")}
      />
    </>
  );
}
