import { Outlet } from "react-router-dom";
import "../../../assets/css/teacher-layout.css";
import { TeacherTopBar } from "./TeacherTopBar";
import TeacherSidebar from "./TeacherSidebar";

export default function TeacherLayout() {
  return (
    <div className="admin-scope">
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
    </div>
  );
}
