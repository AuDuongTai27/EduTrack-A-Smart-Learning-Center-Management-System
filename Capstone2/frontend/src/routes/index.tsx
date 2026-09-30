import React from 'react';
import { useRoutes, Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { landingRoutes } from './landing.routes';
import { studentRoutes } from './student.routes';

export const routes: RouteObject[] = [
  landingRoutes,
  studentRoutes,
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];

export const AppRoutes: React.FC = () => {
  return useRoutes(routes);
};

export default AppRoutes;
