import { Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { StudentLayout } from '../GUIs/layouts/student/Student-layout';
import { StudentDashboardPage } from '../GUIs/pages/student/StudentDashboardPage';
import { StudentClassesPage } from '../GUIs/pages/student/StudentClassesPage';
import { StudentSchedulePage } from '../GUIs/pages/student/StudentSchedulePage';

export const studentRoutes: RouteObject = {
  path: '/student',
  element: <StudentLayout />,
  children: [
    { index: true, element: <Navigate to="/student/dashboard" replace /> },
    { path: 'dashboard', element: <StudentDashboardPage /> },
    { path: 'classes', element: <StudentClassesPage /> },
    { path: 'schedule', element: <StudentSchedulePage /> },
  ],
};

export default studentRoutes;
