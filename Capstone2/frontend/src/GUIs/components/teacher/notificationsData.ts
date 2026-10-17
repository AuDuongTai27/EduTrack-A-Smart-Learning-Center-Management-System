export interface TeacherDashboardNotification {
  id?: string | number;
  title: string;
  addedOn: string;
  daysAgo?: string;
  icon?: string;
  iconBgClass?: string;
  iconColorClass?: string;
}

export const MOCK_TEACHER_NOTIFICATIONS: TeacherDashboardNotification[] = [
  {
    id: 1,
    title: "New Syllabus Instructions",
    addedOn: "11 Mar 2024",
    daysAgo: "20 Days",
    icon: "bi bi-book",
    iconBgClass: "bg-primary-subtle",
    iconColorClass: "text-primary",
  },
  {
    id: 2,
    title: "World Environment Day Program",
    addedOn: "21 Apr 2024",
    daysAgo: "15 Days",
    icon: "bi bi-megaphone",
    iconBgClass: "bg-success-subtle",
    iconColorClass: "text-success",
  },
  {
    id: 3,
    title: "Exam Preparation Notification",
    addedOn: "13 Mar 2024",
    daysAgo: "12 Days",
    icon: "bi bi-bell",
    iconBgClass: "bg-danger-subtle",
    iconColorClass: "text-danger",
  },
  {
    id: 4,
    title: "Online Classes Preparation",
    addedOn: "24 May 2024",
    daysAgo: "02 Days",
    icon: "bi bi-laptop",
    iconBgClass: "bg-info-subtle",
    iconColorClass: "text-info",
  },
  {
    id: 5,
    title: "Exam Time Table Release",
    addedOn: "24 May 2024",
    daysAgo: "06 Days",
    icon: "bi bi-calendar-event",
    iconBgClass: "bg-warning-subtle",
    iconColorClass: "text-warning",
  },
];

// Alias for general notification usage
export const MOCK_NOTIFICATIONS = MOCK_TEACHER_NOTIFICATIONS;

export default MOCK_TEACHER_NOTIFICATIONS;
