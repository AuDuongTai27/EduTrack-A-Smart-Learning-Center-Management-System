import { Navigate, type RouteObject } from "react-router-dom";
import CenterManagerLayout from "../GUIs/layouts/admin/CenterManagerLayout";
import CenterManagerDashboardPage from "../GUIs/pages/admin/CenterManager/CenterManagerDashboardPage";
import CenterManagerUserAccountPage from "../GUIs/pages/admin/CenterManager/CenterManagerUserAccountPage";
import CenterManagerStudentPage from "../GUIs/pages/admin/CenterManager/CenterManagerStudentPage";
import CenterManagerSubjectPage from "../GUIs/pages/admin/CenterManager/CenterManagerSubjectPage";
import CenterManagerClassPage from "../GUIs/pages/admin/CenterManager/CenterManagerClassPage";
import CenterManagerTuitionPage from "../GUIs/pages/admin/CenterManager/CenterManagerTuition";
import CenterManagerApprovalRequestPage from "../GUIs/pages/admin/CenterManager/CenterManagerApprovalRequestPage";
import CenterManagerNotificationPage from "../GUIs/pages/admin/CenterManager/CenterManagerNotificationPage";
import CenterManagerReportPage from "../GUIs/pages/admin/CenterManager/CenterManagerReportPage";
import CenterManagerSettingPage from "../GUIs/pages/admin/CenterManager/CenterManagerSettingPage";

export const centerManagerRoutes: RouteObject = {
  path: "/center-manager",
  element: <CenterManagerLayout />,
  children: [
    {
      index: true,
      element: <Navigate to="dashboard" replace />,
    },
    {
      path: "dashboard",
      element: <CenterManagerDashboardPage />,
    },
    {
      path: "user-accounts",
      element: <CenterManagerUserAccountPage />,
    },
    {
      path: "students",
      element: <CenterManagerStudentPage />,
    },
    {
      path: "subjects",
      element: <CenterManagerSubjectPage />,
    },
    {
      path: "classes",
      element: <CenterManagerClassPage />,
    },
    {
      path: "tuition",
      element: <CenterManagerTuitionPage />,
    },
    {
      path: "approval-requests",
      element: <CenterManagerApprovalRequestPage />,
    },
    {
      path: "notifications",
      element: <CenterManagerNotificationPage />,
    },
    {
      path: "reports",
      element: <CenterManagerReportPage />,
    },
    {
      path: "settings",
      element: <CenterManagerSettingPage />,
    },
  ],
};
