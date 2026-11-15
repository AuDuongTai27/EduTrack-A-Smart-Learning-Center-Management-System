export interface TeacherNotification {
  id: string | number;
  sender: string;
  avatarUrl?: string;
  initials?: string;
  initialsBgClass?: string;
  initialsColorClass?: string;
  isNew?: boolean;
  isRead?: boolean;
  timeAgo: string;
  title: string;
  description: string;
  hasBottomBorder?: boolean;
  addedOn?: string;
  daysAgo?: string;
  icon?: string;
  iconBgClass?: string;
  iconColorClass?: string;
}

export const MOCK_TEACHER_NOTIFICATIONS: TeacherNotification[] = [
  {
    id: 1,
    sender: "Academic Affairs Department",
    initials: "AA",
    initialsBgClass: "bg-info-subtle",
    initialsColorClass: "text-info",
    isNew: true,
    isRead: false,
    timeAgo: "10 minutes ago",
    title: "New Semester Teaching Schedule Update 2026/2027",
    description:
      "The official schedule for the new semester has been updated. Please check the classrooms and start times starting next week.",
    hasBottomBorder: true,
  },
  {
    id: 2,
    sender: "EduTrack Board of Directors",
    initials: "ET",
    initialsBgClass: "bg-primary-subtle",
    initialsColorClass: "text-primary",
    isNew: true,
    isRead: false,
    timeAgo: "2 hours ago",
    title: "Assigned Teaching Assistant Au Duong Tai to support Math Class 9A1",
    description:
      "Teaching Assistant Au Duong Tai has been assigned to coordinate attendance management and grade assignments for Class 9 - Advanced Mathematics.",
    hasBottomBorder: true,
  },
  {
    id: 3,
    sender: "Administration & HR Department",
    initials: "HR",
    initialsBgClass: "bg-warning-subtle",
    initialsColorClass: "text-warning",
    isNew: true,
    isRead: false,
    timeAgo: "5 hours ago",
    title: "Teaching schedule change request has been approved",
    description:
      "Your teaching schedule change request has been reviewed and approved by Center Management.",
    hasBottomBorder: true,
  },
  {
    id: 4,
    sender: "Academic Department",
    initials: "AC",
    initialsBgClass: "bg-success-subtle",
    initialsColorClass: "text-success",
    isNew: false,
    isRead: true,
    timeAgo: "1 day ago",
    title: "Reminder: Update test results & student evaluations",
    description:
      "The system has opened the portal for submitting periodic feedback and assignment grades from last week for students requiring tutoring.",
    hasBottomBorder: true,
  },
  {
    id: 5,
    sender: "EduTrack Board of Directors",
    initials: "ET",
    initialsBgClass: "bg-primary-subtle",
    initialsColorClass: "text-primary",
    isNew: false,
    isRead: true,
    timeAgo: "3 days ago",
    title: "Academic Council Meeting & Q4 Professional Training",
    description:
      "Teachers and teaching assistants are invited to attend the professional meeting on evaluating new teaching methods in Hall A.",
    hasBottomBorder: false,
  },
];

// Alias for general notification usage
export const MOCK_NOTIFICATIONS = MOCK_TEACHER_NOTIFICATIONS;

export default MOCK_TEACHER_NOTIFICATIONS;
