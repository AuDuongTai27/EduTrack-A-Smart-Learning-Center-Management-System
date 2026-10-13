import React from "react";
import { useRoutes, Navigate } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { landingRoutes } from "./landing.routes";
import { studentRoutes } from "./student.routes";
import { parentRoutes } from "./parent.routes";
import { centerManagerRoutes } from "./centerManager.routes";
import { adminStaffRoutes } from "./adminStaff.routes";
import { teacherRoutes } from "./teacher.routes";

export const routes: RouteObject[] = [
  landingRoutes,
  studentRoutes,
  parentRoutes,
  centerManagerRoutes,
  adminStaffRoutes,
  teacherRoutes,
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
];

export const AppRoutes: React.FC = () => {
  return useRoutes(routes);
};

export default AppRoutes;
