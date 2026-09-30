import { Outlet } from "react-router-dom";
import "../../../assets/css/center-manager-layout.css";
import AdminTopBar from "./AdminTopBar";
import AdminStaffSidebar from "./AdminStaffSidebar";

export default function StaffLayout() {
  return (
    <>
      <div className="app-shell">
        {/* Sidebar */}
        <AdminStaffSidebar />
        {/* Main area */}
        <div className="main-area">
          {/* Header */}
          <AdminTopBar />
          {/* Intentionally blank content area */}
          <main className="page-wrapper">
            <div className="page-content">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <div className="sidebar-overlay" id="sidebarOverlay" />
    </>
  );
}
