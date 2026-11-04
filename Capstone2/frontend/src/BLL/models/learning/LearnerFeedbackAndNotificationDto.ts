export interface LearnerFeedbackItemApiDto {
  requestId: number;
  requestCode: string;
  requestType: string;
  title: string;
  description: string;
  studentId?: number | null;
  studentName?: string | null;
  classId?: number | null;
  className?: string | null;
  requestedBy: number;
  requesterName: string;
  requesterRole: 'student' | 'parent' | string;
  reviewedBy?: number | null;
  reviewerName?: string | null;
  priority: string;
  status: 'pending' | 'approved' | 'rejected' | string;
  statusLabel?: string;
  canEdit?: boolean;
  createdAt: string;
  reviewedAt?: string | null;
  reviewNotes?: string | null;
}

export interface CreateLearnerFeedbackPayload {
  userId: number;
  studentId?: number | null;
  classId?: number | null;
  title: string;
  description: string;
  priority?: string;
}

export interface UpdateLearnerFeedbackPayload {
  userId: number;
  title: string;
  description: string;
}

export interface LearnerNotificationItemApiDto {
  notificationId: number;
  userId?: number | null;
  userName?: string | null;
  classId?: number | null;
  className?: string | null;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

