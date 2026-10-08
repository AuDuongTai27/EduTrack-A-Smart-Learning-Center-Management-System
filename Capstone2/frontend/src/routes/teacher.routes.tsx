import { Navigate, type RouteObject } from "react-router-dom";
import TeacherLayout from "../GUIs/layouts/teacher/TeacherLayout";
import TeacherDashboardPage from "../GUIs/pages/teacher/TeacherDashboardPage";
import TeacherClassesPage from "../GUIs/pages/teacher/TeacherClassesPage";
import TeacherClassDetailsPage from "../GUIs/pages/teacher/TeacherClassDetailsPage";
import TeacherAttendancePage from "../GUIs/pages/teacher/TeacherAttendancePage";
import TeacherAssignmentPage from "../GUIs/pages/teacher/TeacherAssignmentPage";
import TeacherNewAssignmentPage from "../GUIs/pages/teacher/TeacherNewAssignmentPage";
import TeacherSchedulePage from "../GUIs/pages/teacher/TeacherSchedulePage";
import TeacherLearningProgressPage from "../GUIs/pages/teacher/TeacherLearningProgressPage";
import TeacherNotificationPage from "../GUIs/pages/teacher/TeacherNotificationPage";
import TeacherRequestPage from "../GUIs/pages/teacher/TeacherRequestPage";
import TeacherProfilePage from "../GUIs/pages/teacher/TeacherProfilePage";

export const teacherRoutes: RouteObject = {
  path: "/teacher",
  element: <TeacherLayout />,
  children: [
    { index: true, element: <Navigate to="/teacher/dashboard" replace /> },
    { path: "dashboard", element: <TeacherDashboardPage /> },
    { path: "classes", element: <TeacherClassesPage /> },

    { path: "class-details", element: <TeacherClassDetailsPage /> },
    { path: "classes/:id", element: <TeacherClassDetailsPage /> },

    { path: "attendance", element: <TeacherAttendancePage /> },

    { path: "assignment", element: <TeacherAssignmentPage /> },
    { path: "assignments/:id", element: <TeacherAssignmentPage /> },

    { path: "new-assignment", element: <TeacherNewAssignmentPage /> },
    { path: "schedule", element: <TeacherSchedulePage /> },
    { path: "learning-progress", element: <TeacherLearningProgressPage /> },
    { path: "notifications", element: <TeacherNotificationPage /> },
    { path: "request", element: <TeacherRequestPage /> },
    { path: "profile", element: <TeacherProfilePage /> },
  ],
};

export default teacherRoutes;