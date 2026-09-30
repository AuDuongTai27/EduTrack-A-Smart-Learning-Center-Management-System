import { Outlet } from "react-router-dom";
import "../../../assets/css/center-manager-layout.css";
import CenterManagerSidebar from "./CenterManagerSidebar";
import AdminTopBar from "./AdminTopBar";

export default function CenterManagerLayout() {
  return (
    <>
      <div className="app-shell">
        {/* Sidebar */}
        <CenterManagerSidebar />
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
