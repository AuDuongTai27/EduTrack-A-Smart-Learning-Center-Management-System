import userDAL from "./userDAL";
import tuitionDAL from "./tuitionDAL";
import feedbackDAL from "./feedbackDAL";
import {
  countActiveStudents,
  getMyRequests,
  getTodaySessions,
  loadDashboardSection,
  summarizeTuition,
  type DashboardSection,
} from "../BLL/services/adminStaffDashboardService";
import type { MonitoringSessionDto, TeacherClassAssignmentDto } from "../api/teachingMonitoringApi";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

async function getList<T>(endpoint: string): Promise<T[]> {
  const response = await fetch(`${API_BASE_URL}/${endpoint}`, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Failed to load schedule (HTTP ${response.status}). Please try again.`);
  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new Error("Failed to load schedule. Please try again.");
  return data as T[];
}

async function getCurrentStaff(userId: number | null) {
  if (userId == null) {
    throw new Error("Unable to select admin staff account from system data.");
  }
  const user = await userDAL.getUserById(userId);
  if (!user || user.userId !== userId || user.status.trim().toLowerCase() !== "active"
    || !user.roles?.some((role) => role.trim().toLowerCase() === "admin_staff")) {
    throw new Error("Current account does not have active admin staff permissions.");
  }
  return user;
}

interface DashboardSections {
  students: DashboardSection<number>;
  tuition: DashboardSection<ReturnType<typeof summarizeTuition>>;
  schedule: DashboardSection<ReturnType<typeof getTodaySessions>>;
  staff: DashboardSection<Awaited<ReturnType<typeof getCurrentStaff>>>;
  requests: DashboardSection<ReturnType<typeof getMyRequests>>;
}

export interface AdminStaffDashboardData extends DashboardSections {
  userId: number | null;
  today: string;
}

export const adminStaffDashboardDAL = {
  async getDashboard(userId: number | null, today: string, onUpdate?: (data: AdminStaffDashboardData) => void): Promise<AdminStaffDashboardData> {
    const empty = () => ({ data: null, error: null });
    const data: AdminStaffDashboardData = {
      userId, today, students: empty(), tuition: empty(), schedule: empty(),
      staff: empty(), requests: empty(),
    };
    const sections: DashboardSections = data;
    // Publish each section as it resolves so a slow Payments request cannot hide student data.
    const update = <K extends keyof DashboardSections>(key: K) => (section: DashboardSections[K]) => {
      sections[key] = section;
      onUpdate?.({ ...data });
    };
    const currentStaff = getCurrentStaff(userId);
    await Promise.all([
      loadDashboardSection(userDAL.getAllUsers().then((result) => countActiveStudents(result.data))).then(update("students")),
      loadDashboardSection(Promise.all([tuitionDAL.getAllInvoices(), tuitionDAL.getAllPayments()])
        .then(([invoices, payments]) => summarizeTuition(invoices.data, payments.data))).then(update("tuition")),
      loadDashboardSection(Promise.all([
        getList<MonitoringSessionDto>("classsessions"),
        getList<TeacherClassAssignmentDto>("teacherclasses"),
      ]).then(([sessions, assignments]) => getTodaySessions(sessions, assignments, today))).then(update("schedule")),
      loadDashboardSection(currentStaff).then(update("staff")),
      loadDashboardSection(currentStaff.then(async (user) => {
        const result = await feedbackDAL.getAllRequests();
        return getMyRequests(result.data, user.userId);
      })).then(update("requests")),
    ]);
    return data;
  },
};
