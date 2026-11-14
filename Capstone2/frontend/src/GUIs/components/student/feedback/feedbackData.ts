export interface FeedbackApprovalRequest {
  id: number;
  requestCode?: string;
  requestType: 'feedback';
  title: string;
  description: string;
  senderName: string;
  senderRole: 'parent' | 'student';
  className?: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  statusLabel: string;
  canEdit: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export const INITIAL_FEEDBACK_REQUESTS: FeedbackApprovalRequest[] = [
  {
    id: 1,
    requestCode: 'FB0001',
    requestType: 'feedback',
    title: 'Proposal to add midterm exam review exercises for Math 9',
    description: 'Dear Teachers, could I please request more multiple-choice practice tests for the Trigonometric Relations in Right Triangles chapter to prepare for the midterm exam?',
    senderName: 'Le Van An',
    senderRole: 'student',
    createdAt: '15/10/2026 14:20',
    status: 'pending',
    statusLabel: 'Pending Review',
    canEdit: true,
  },
  {
    id: 2,
    requestCode: 'FB0002',
    requestType: 'feedback',
    title: 'Feedback on English listening materials and Room 202 speakers',
    description: 'The speakers in Room 202 are a bit quiet in the back rows. Could the center please check them before our class next week?',
    senderName: 'Le Van An',
    senderRole: 'student',
    createdAt: '12/10/2026 09:15',
    status: 'pending',
    statusLabel: 'Pending',
    canEdit: false,
    reviewedBy: 'Tran Thi Nhan Vien (Admin Staff)',
  },
  {
    id: 3,
    requestCode: 'FB0003',
    requestType: 'feedback',
    title: 'Feedback on air conditioner in Room 201',
    description: "The air conditioner in Room 201 was leaking water and too cold during last night's class.",
    senderName: 'Le Van An',
    senderRole: 'student',
    createdAt: '09/09/2026 20:45',
    status: 'approved',
    statusLabel: 'Resolved',
    canEdit: false,
    reviewedBy: 'Tran Thi Nhan Vien (Admin Staff)',
    reviewedAt: '10/09/2026 08:30',
    reviewNotes: 'The center has noted this and dispatched the technical team to service the air conditioner this morning. Thank you!',
  },
];
