import { Navigate } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { ParentLayout } from "../GUIs/layouts/parent/ParentLayout";
import { ParentDashboardPage } from "../GUIs/pages/parent/ParentDashboardPage";
import { ParentClassesPage } from "../GUIs/pages/parent/ParentClassesPage";
import { ParentSchedulePage } from "../GUIs/pages/parent/ParentSchedulePage";
import { ParentProgressPage } from "../GUIs/pages/parent/ParentProgressPage";
import { ParentTuitionPage } from "../GUIs/pages/parent/ParentTuitionPage";
import { ParentNotificationsPage } from "../GUIs/pages/parent/ParentNotificationsPage";
import { ParentProfilePage } from "../GUIs/pages/parent/ParentProfilePage";
import { ParentClassDetailPage } from "../GUIs/pages/parent/ParentClassDetailPage";

export const parentRoutes: RouteObject = {
  path: "/parent",
  element: <ParentLayout />,
  children: [
    { index: true, element: <Navigate to="/parent/dashboard" replace /> },
    { path: "dashboard", element: <ParentDashboardPage /> },
    { path: "classes", element: <ParentClassesPage /> },
    { path: "schedule", element: <ParentSchedulePage /> },
    { path: "progress", element: <ParentProgressPage /> },
    { path: "tuition", element: <ParentTuitionPage /> },
    { path: "notifications", element: <ParentNotificationsPage /> },
    { path: "profile", element: <ParentProfilePage /> },
    { path: "classes/:id", element: <ParentClassDetailPage /> },
    { path: "class-detail", element: <ParentClassDetailPage /> },
    // Lưu ý: Không có route assignment detail cho Parent theo yêu cầu đặc tả nghiệp vụ
  ],
};

export default parentRoutes;
