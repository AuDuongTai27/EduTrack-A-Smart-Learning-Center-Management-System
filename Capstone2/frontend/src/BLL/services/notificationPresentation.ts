export const notificationTypes = {
  announcement: 'General Announcement', academic: 'Academic', tuition: 'Tuition', reminder: 'Reminder',
  schedule: 'Schedule', system: 'System', homework: 'Assignments', class: 'Class',
};
export const notificationRoles = {
  center_manager: 'Center Manager', admin_staff: 'Admin Staff',
  teacher: 'Teacher', teaching_assistant: 'Teaching Assistant', student: 'Student',
};
// Audience label only: a Student send expands linked guardians at the backend.
// Account/search labels continue to describe the user's actual role.
export const notificationRecipientRoles = {
  ...notificationRoles,
  student: 'Student / Parent',
  parent: 'Parent',
};
export const studentParentNotificationHint = 'Notifications sent to students will also be sent to linked parents.';
export const notificationScopes = { all: 'Center-wide', role: 'By Role', class: 'By Class', user: 'Individual' };
export type NotificationScope = keyof typeof notificationScopes;
const label = (labels: Record<string, string>, value: string, fallback: string) => labels[value] ?? fallback;
export const notificationTypeLabel = (value: string) => label(notificationTypes, value, 'Notification');
export const notificationRoleLabel = (value: string) => value === 'parent' ? 'Parent (Existing Account)'
  : value === 'ta' ? notificationRoles.teaching_assistant : label(notificationRoles, value, 'Other Role');
export const notificationScopeLabel = (value: string) => label(notificationScopes, value, 'Notification');

export function notificationDraftErrors(title: string, content: string, scope: NotificationScope, target: string) {
  return {
    title: !title.trim() ? 'Please enter a title.' : title.length > 200 ? 'Title must be at most 200 characters.' : '',
    content: !content.trim() ? 'Please enter content.' : content.length > 4000 ? 'Content must be at most 4,000 characters.' : '',
    target: scope !== 'all' && !target ? `Please select a ${scope === 'role' ? 'recipient role' : scope === 'class' ? 'class' : 'recipient'}.` : '',
  };
}
