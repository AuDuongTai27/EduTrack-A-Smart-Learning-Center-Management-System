import React from "react";
import { useRoutes, Navigate } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { landingRoutes } from "./landing.routes";
import { studentRoutes } from "./student.routes";
import { centerManagerRoutes } from "./centerManager.routes";

export const routes: RouteObject[] = [
  landingRoutes,
  studentRoutes,
  centerManagerRoutes,
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
];

export const AppRoutes: React.FC = () => {
  return useRoutes(routes);
};

export default AppRoutes;
