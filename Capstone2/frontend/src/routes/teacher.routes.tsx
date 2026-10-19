import { Navigate, type RouteObject } from "react-router-dom";
import TeacherLayout from "../GUIs/layouts/teacher/TeacherLayout";
import TeacherDashboardPage from "../GUIs/pages/teacher/Teacher/TeacherDashboardPage";
import TeacherClassesPage from "../GUIs/pages/teacher/Teacher/TeacherClassesPage";
import TeacherClassDetailsPage from "../GUIs/pages/teacher/Teacher/TeacherClassDetailsPage";
import TeacherAttendancePage from "../GUIs/pages/teacher/Teacher/TeacherAttendancePage";
import TeacherAssignmentPage from "../GUIs/pages/teacher/Teacher/TeacherAssignmentPage";
import TeacherNewAssignmentPage from "../GUIs/pages/teacher/Teacher/TeacherNewAssignmentPage";
import TeacherSchedulePage from "../GUIs/pages/teacher/Teacher/TeacherSchedulePage";
import TeacherLearningProgressPage from "../GUIs/pages/teacher/Teacher/TeacherLearningProgressPage";
import TeacherNotificationPage from "../GUIs/pages/teacher/Teacher/TeacherNotificationPage";
import TeacherRequestPage from "../GUIs/pages/teacher/Teacher/TeacherRequestPage";
import TeacherProfilePage from "../GUIs/pages/teacher/Teacher/TeacherProfilePage";

export const teacherRoutes: RouteObject = {
  path: "/teacher",
  element: <TeacherLayout />,
  children: [
    { index: true, element: <Navigate to="/teacher/dashboard" replace /> },
    { path: "dashboard", element: <TeacherDashboardPage /> },
    { path: "classes", element: <TeacherClassesPage /> },
    { path: "classes/:id", element: <TeacherClassDetailsPage /> },
    { path: "classes/:id/attendance", element: <TeacherAttendancePage /> },
    { path: "classes/:id/assignment/:id", element: <TeacherAssignmentPage /> },
    { path: "classes/:id/assignment/new-assignment", element: <TeacherNewAssignmentPage /> },
    { path: "schedule", element: <TeacherSchedulePage /> },
    { path: "learning-progress", element: <TeacherLearningProgressPage /> },
    { path: "notifications", element: <TeacherNotificationPage /> },
    { path: "request", element: <TeacherRequestPage /> },
    { path: "profile", element: <TeacherProfilePage /> },
  ],
};

export default teacherRoutes;