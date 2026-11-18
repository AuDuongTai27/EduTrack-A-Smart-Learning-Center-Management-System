import { Navigate } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { StudentLayout } from "../GUIs/layouts/student/Student-layout";
import { RoleRouteGuard } from "./RoleRouteGuard";
import { NotFoundPage } from "../GUIs/pages/shared/NotFoundPage";
import { StudentDashboardPage } from "../GUIs/pages/student/StudentDashboardPage";
import { StudentClassesPage } from "../GUIs/pages/student/StudentClassesPage";
import { StudentSchedulePage } from "../GUIs/pages/student/StudentSchedulePage";
import { StudentProgressPage } from "../GUIs/pages/student/StudentProgressPage";
import { StudentTuitionPage } from "../GUIs/pages/student/StudentTuitionPage";
import { StudentNotificationsPage } from "../GUIs/pages/student/StudentNotificationsPage";
import { StudentProfilePage } from "../GUIs/pages/student/StudentProfilePage";
import { StudentClassDetailPage } from "../GUIs/pages/student/StudentClassDetailPage";
import { StudentAssignmentDetailPage } from "../GUIs/pages/student/StudentAssignmentDetailPage";
import { StudentFeedbackPage } from "../GUIs/pages/student/StudentFeedbackPage";

export const studentRoutes: RouteObject = {
  path: "/student",
  element: (
    <RoleRouteGuard allowedRole="student">
      <StudentLayout />
    </RoleRouteGuard>
  ),
  children: [
    { index: true, element: <Navigate to="/student/dashboard" replace /> },
    { path: "dashboard", element: <StudentDashboardPage /> },
    { path: "classes", element: <StudentClassesPage /> },
    { path: "schedule", element: <StudentSchedulePage /> },
    { path: "progress", element: <Navigate to="/student/classes" replace /> },
    { path: "tuition", element: <StudentTuitionPage /> },
    { path: "notifications", element: <StudentNotificationsPage /> },
    { path: "profile", element: <StudentProfilePage /> },
    { path: "feedback", element: <StudentFeedbackPage /> },
    { path: "classes/:id", element: <StudentClassDetailPage /> },
    { path: "class-detail", element: <StudentClassDetailPage /> },
    { path: "assignments/:id", element: <StudentAssignmentDetailPage /> },
    { path: "assignment-detail", element: <StudentAssignmentDetailPage /> },
    { path: "*", element: <NotFoundPage /> },
  ],
};

export default studentRoutes;
