import { Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { StudentLayout } from '../GUIs/layouts/student/Student-layout';
import { StudentDashboardPage } from '../GUIs/pages/student/StudentDashboardPage';
import { StudentClassesPage } from '../GUIs/pages/student/StudentClassesPage';
import { StudentSchedulePage } from '../GUIs/pages/student/StudentSchedulePage';
import { StudentProgressPage } from '../GUIs/pages/student/StudentProgressPage';
import { StudentTuitionPage } from '../GUIs/pages/student/StudentTuitionPage';
import { StudentNotificationsPage } from '../GUIs/pages/student/StudentNotificationsPage';
import { StudentProfilePage } from '../GUIs/pages/student/StudentProfilePage';
import { StudentClassDetailPage } from '../GUIs/pages/student/StudentClassDetailPage';

export const studentRoutes: RouteObject = {
  path: '/student',
  element: <StudentLayout />,
  children: [
    { index: true, element: <Navigate to="/student/dashboard" replace /> },
    { path: 'dashboard', element: <StudentDashboardPage /> },
    { path: 'classes', element: <StudentClassesPage /> },
    { path: 'schedule', element: <StudentSchedulePage /> },
    { path: 'progress', element: <StudentProgressPage /> },
    { path: 'tuition', element: <StudentTuitionPage /> },
    { path: 'notifications', element: <StudentNotificationsPage /> },
    { path: 'profile', element: <StudentProfilePage /> },
    { path: 'classes/:id', element: <StudentClassDetailPage /> },
    { path: 'class-detail', element: <StudentClassDetailPage /> },
  ],
};

export default studentRoutes;
