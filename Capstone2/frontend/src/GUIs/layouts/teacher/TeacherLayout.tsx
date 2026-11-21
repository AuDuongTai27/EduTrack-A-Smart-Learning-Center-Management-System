import "../../../assets/css/teacher-layout.css";
import "../../../assets/css/center-manager-academy.css";
import "../../../assets/css/teaching-academy.css";
import { CenterSettingsProvider } from "../../../contexts/CenterSettingsContext";
import { Outlet } from "react-router-dom";
import { TeacherTopBar } from "./TeacherTopBar";
import TeacherSidebar from "./TeacherSidebar";

export default function TeacherLayout() {
  return (
    <CenterSettingsProvider><div className="teacher-scope teaching-academy">
      <div className="app-shell">
        {/* Sidebar */}
        <TeacherSidebar />
        {/* Main area */}
        <div className="main-area">
          {/* Header */}
          <TeacherTopBar />
          {/* Intentionally blank content area */}
          <main className="page-wrapper">
            <div className="page-content">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <div className="sidebar-overlay" id="sidebarOverlay" />
    </div></CenterSettingsProvider>
  );
}