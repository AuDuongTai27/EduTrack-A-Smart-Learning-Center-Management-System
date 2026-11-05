import { Navigate, type RouteObject } from "react-router-dom";
import TeachingAssistantLayout from "../GUIs/layouts/teacher/TeachingAssistantLayout";
import TeachingAssistantDashboardPage from "../GUIs/pages/teacher/TeachingAssistant/TeachingAssistantDashboardPage";
import TeachingAssistantClassesPage from "../GUIs/pages/teacher/TeachingAssistant/TeachingAssistantClassesPage";
import TeachingAssistantClassDetailsPage from "../GUIs/pages/teacher/TeachingAssistant/TeachingAssistantClassDetailsPage";
import TeachingAssistantAttendancePage from "../GUIs/pages/teacher/TeachingAssistant/TeachingAssistantAttendancePage";
import TeachingAssistantAssignmentPage from "../GUIs/pages/teacher/TeachingAssistant/TeachingAssistantAssignmentPage";
import TeachingAssistantSchedulePage from "../GUIs/pages/teacher/TeachingAssistant/TeachingAssistantSchedulePage";
import TeachingAssistantLearningProgressPage from "../GUIs/pages/teacher/TeachingAssistant/TeachingAssistantLearningProgressPage";
import TeachingAssistantStudentProgressDetailPage from "../GUIs/pages/teacher/TeachingAssistant/TeachingAssistantStudentProgressDetailPage";
import TeachingAssistantNotificationPage from "../GUIs/pages/teacher/TeachingAssistant/TeachingAssistantNotificationPage";
import TeachingAssistantRequestPage from "../GUIs/pages/teacher/TeachingAssistant/TeachingAssistantRequestPage";
import TeachingAssistantProfilePage from "../GUIs/pages/teacher/TeachingAssistant/TeachingAssistantProfilePage";

export const teachingAssistantRoutes: RouteObject = {
  path: "/teaching-assistant",
  element: <TeachingAssistantLayout />,
  children: [
    { index: true, element: <Navigate to="/teaching-assistant/dashboard" replace /> },
    { path: "dashboard", element: <TeachingAssistantDashboardPage /> },
    { path: "classes", element: <TeachingAssistantClassesPage /> },
    { path: "classes/:id", element: <TeachingAssistantClassDetailsPage /> },
    { path: "classes/:id/attendance", element: <TeachingAssistantAttendancePage /> },
    { path: "classes/:classId/attendance", element: <TeachingAssistantAttendancePage /> },
    { path: "classes/:classId/assignment/:assignmentId", element: <TeachingAssistantAssignmentPage /> },
    { path: "classes/:id/assignment/:id", element: <TeachingAssistantAssignmentPage /> },
    { path: "schedule", element: <TeachingAssistantSchedulePage /> },
    { path: "learning-progress", element: <TeachingAssistantLearningProgressPage /> },
    { path: "learning-progress/class/:classId/student/:studentId", element: <TeachingAssistantStudentProgressDetailPage /> },
    { path: "learning-progress/student/:studentId", element: <TeachingAssistantStudentProgressDetailPage /> },
    { path: "notifications", element: <TeachingAssistantNotificationPage /> },
    { path: "request", element: <TeachingAssistantRequestPage /> },
    { path: "profile", element: <TeachingAssistantProfilePage /> },
  ],
};

export default teachingAssistantRoutes;
