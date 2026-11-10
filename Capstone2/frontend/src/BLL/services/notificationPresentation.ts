export const notificationTypes = {
  announcement: 'Thông báo chung', academic: 'Học tập', tuition: 'Học phí', reminder: 'Nhắc nhở',
  schedule: 'Lịch học', system: 'Hệ thống', homework: 'Bài tập', class: 'Lớp học',
};
export const notificationRoles = {
  center_manager: 'Quản lý trung tâm (Center Manager)', admin_staff: 'Nhân viên giáo vụ (Admin Staff)',
  teacher: 'Giáo viên (Teacher)', teaching_assistant: 'Trợ giảng (Teaching Assistant)', student: 'Học viên (Student)',
};
// Audience label only: a Student send expands linked guardians at the backend.
// Account/search labels continue to describe the user's actual role.
export const notificationRecipientRoles = {
  ...notificationRoles, student: 'Học viên / Phụ huynh (Student / Parent)',
};
export const studentParentNotificationHint = 'Thông báo gửi đến học viên cũng được gửi cho phụ huynh liên kết.';
export const notificationScopes = { all: 'Toàn trung tâm', role: 'Theo vai trò', class: 'Theo lớp', user: 'Cá nhân' };
export type NotificationScope = keyof typeof notificationScopes;
const label = (labels: Record<string, string>, value: string, fallback: string) => labels[value] ?? fallback;
export const notificationTypeLabel = (value: string) => label(notificationTypes, value, 'Thông báo');
export const notificationRoleLabel = (value: string) => value === 'parent' ? 'Phụ huynh (tài khoản hiện có)'
  : value === 'ta' ? notificationRoles.teaching_assistant : label(notificationRoles, value, 'Vai trò khác');
export const notificationScopeLabel = (value: string) => label(notificationScopes, value, 'Thông báo');

export function notificationDraftErrors(title: string, content: string, scope: NotificationScope, target: string) {
  return {
    title: !title.trim() ? 'Vui lòng nhập tiêu đề.' : title.length > 200 ? 'Tiêu đề tối đa 200 ký tự.' : '',
    content: !content.trim() ? 'Vui lòng nhập nội dung.' : content.length > 4000 ? 'Nội dung tối đa 4000 ký tự.' : '',
    target: scope !== 'all' && !target ? `Vui lòng chọn ${scope === 'role' ? 'vai trò nhận' : scope === 'class' ? 'lớp học' : 'người nhận'}.` : '',
  };
}
