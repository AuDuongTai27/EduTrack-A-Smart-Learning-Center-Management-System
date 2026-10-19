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
    sender: "EduTrack Center Manager",
    avatarUrl: "/assets/img/profiles/avatar-27.jpg",
    isNew: true,
    isRead: false,
    timeAgo: "10 minutes ago",
    title: "Updated Teaching Schedule for Academic Term 2026/2027",
    description:
      "Please review your updated class room allocations and time slots for the upcoming term starting next Monday.",
    hasBottomBorder: true,
  },
  {
    id: 2,
    sender: "EduTrack Staff",
    initials: "ES",
    initialsBgClass: "bg-primary-subtle",
    initialsColorClass: "text-primary",
    isNew: true,
    isRead: false,
    timeAgo: "2 hours ago",
    title: "New Teaching Assistant Assigned to Mathematics Class IV",
    description:
      "Teaching Assistant Sarah Jenkins has been assigned to support your Mathematics Class IV sessions.",
    hasBottomBorder: true,
  },
  {
    id: 3,
    sender: "EduTrack Center Manager",
    avatarUrl: "/assets/img/profiles/avatar-27.jpg",
    isNew: true,
    isRead: false,
    timeAgo: "5 hours ago",
    title: "Leave Request Approved",
    description:
      "Your request for leave on August 20, 2026 has been approved by the management team.",
    hasBottomBorder: true,
  },
  {
    id: 4,
    sender: "EduTrack Staff",
    initials: "ES",
    initialsBgClass: "bg-info-subtle",
    initialsColorClass: "text-info",
    isNew: false,
    isRead: true,
    timeAgo: "1 day ago",
    title: "Monthly Learning Progress Assessment Submission Reminder",
    description:
      "Reminder to submit monthly learning progress evaluations for Physics Class I-A by August 18.",
    hasBottomBorder: true,
  },
  {
    id: 5,
    sender: "EduTrack Center Manager",
    avatarUrl: "/assets/img/profiles/avatar-27.jpg",
    isNew: false,
    isRead: true,
    timeAgo: "3 days ago",
    title: "Upcoming Staff Development & Training Session",
    description:
      "Join us for the quarterly teacher workshop scheduled for Friday, August 22 at 14:00 in Hall B.",
    hasBottomBorder: false,
  },
];

// Alias for general notification usage
export const MOCK_NOTIFICATIONS = MOCK_TEACHER_NOTIFICATIONS;

export default MOCK_TEACHER_NOTIFICATIONS;