import React from 'react';
import { useRoutes } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { landingRoutes } from './landing.routes';

export const routes: RouteObject[] = [
  landingRoutes,
  // Sau này bạn Duy & Việt bổ sung adminRoutes, teacherRoutes, studentRoutes ở đây
];

export const AppRoutes: React.FC = () => {
  return useRoutes(routes);
};

export default AppRoutes;
