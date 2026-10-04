import { Navigate, type RouteObject } from "react-router-dom";
import AdminStaffLayout from "../GUIs/layouts/admin/AdminStaffLayout";
import AdminStaffDashboardPage from "../GUIs/pages/admin/AdminStaff/AdminStaffDashboardPage";
import AdminStaffNotificationPage from "../GUIs/pages/admin/AdminStaff/AdminStaffNotificationPage";
import AdminStaffStudentPage from "../GUIs/pages/admin/AdminStaff/AdminStaffStudentPage";
import AdminStaffTeachingMonitoring from "../GUIs/pages/admin/AdminStaff/AdminStaffTeachingMonitoring";
import AdminStaffClassPage from "../GUIs/pages/admin/AdminStaff/AdminStaffClassPage";
import AdminStaffTuitionPage from "../GUIs/pages/admin/AdminStaff/AdminStaffTuitionPage";
import AdminStaffApprovalRequestPage from "../GUIs/pages/admin/AdminStaff/AdminStaffApprovalRequestPage";
import AdminStaffReportPage from "../GUIs/pages/admin/AdminStaff/AdminStaffReportPage";

export const adminStaffRoutes: RouteObject = {
  path: "/admin-staff",
  element: <AdminStaffLayout />,
  children: [
    {
      index: true,
      element: <Navigate to="dashboard" replace />,
    },
    {
      path: "dashboard",
      element: <AdminStaffDashboardPage />,
    },
    {
      path: "students",
      element: <AdminStaffStudentPage />,
    },
    {
      path: "classes",
      element: <AdminStaffClassPage />,
    },
    {
      path: "teaching-monitoring",
      element: <AdminStaffTeachingMonitoring />,
    },
    {
      path: "tuition",
      element: <AdminStaffTuitionPage />,
    },
    {
      path: "approval-requests",
      element: <AdminStaffApprovalRequestPage />,
    },
    {
      path: "notifications",
      element: <AdminStaffNotificationPage />,
    },
    {
      path: "reports",
      element: <AdminStaffReportPage />,
    },
  ],
};
