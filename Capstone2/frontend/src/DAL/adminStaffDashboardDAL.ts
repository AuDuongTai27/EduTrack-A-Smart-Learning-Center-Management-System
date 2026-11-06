import userDAL from "./userDAL";
import tuitionDAL from "./tuitionDAL";
import notificationDAL from "./notificationDAL";
import feedbackDAL from "./feedbackDAL";
import {
  countActiveStudents,
  getMyRequests,
  getTodaySessions,
  loadDashboardSection,
  summarizeTuition,
} from "../BLL/services/adminStaffDashboardService";
import type { MonitoringSessionDto, TeacherClassAssignmentDto } from "../api/teachingMonitoringApi";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

async function getList<T>(endpoint: string): Promise<T[]> {
  const response = await fetch(`${API_BASE_URL}/${endpoint}`, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Không tải được lịch học (HTTP ${response.status}). Vui lòng thử lại.`);
  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new Error("Không tải được lịch học. Vui lòng thử lại.");
  return data as T[];
}

async function getCurrentStaff(userId: number | null) {
  if (userId == null) {
    throw new Error("Chưa xác định được tài khoản giáo vụ. Vui lòng đăng nhập để xem dữ liệu cá nhân.");
  }
  const user = await userDAL.getUserById(userId);
  if (!user || user.userId !== userId || user.status.trim().toLowerCase() !== "active"
    || !user.roles?.some((role) => role.trim().toLowerCase() === "admin_staff")) {
    throw new Error("Tài khoản hiện tại không có quyền giáo vụ đang hoạt động.");
  }
  return user;
}

export const adminStaffDashboardDAL = {
  async getDashboard(userId: number | null, today: string) {
    const currentStaff = getCurrentStaff(userId);
    const [students, tuition, schedule, staff, notifications, requests] = await Promise.all([
      loadDashboardSection(userDAL.getAllUsers().then((result) => countActiveStudents(result.data))),
      loadDashboardSection(Promise.all([tuitionDAL.getAllInvoices(), tuitionDAL.getAllPayments()])
        .then(([invoices, payments]) => summarizeTuition(invoices.data, payments.data))),
      loadDashboardSection(Promise.all([
        getList<MonitoringSessionDto>("classsessions"),
        getList<TeacherClassAssignmentDto>("teacherclasses"),
      ]).then(([sessions, assignments]) => getTodaySessions(sessions, assignments, today))),
      loadDashboardSection(currentStaff),
      loadDashboardSection(currentStaff.then((user) => notificationDAL.getInbox(user.userId))
        .then((items) => [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.notificationId - a.notificationId))),
      loadDashboardSection(currentStaff.then(async (user) => {
        const result = await feedbackDAL.getAllRequests();
        return getMyRequests(result.data, user.userId);
      })),
    ]);
    return { userId, today, students, tuition, schedule, staff, notifications, requests };
  },
};

export type AdminStaffDashboardData = Awaited<ReturnType<typeof adminStaffDashboardDAL.getDashboard>>;
