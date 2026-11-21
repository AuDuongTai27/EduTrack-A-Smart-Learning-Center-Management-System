import { Outlet } from "react-router-dom";
import "../../../assets/css/admin-shared.css";
import "../../../assets/css/center-manager.css";
import "../../../assets/css/center-manager-academy.css";
import CenterManagerSidebar from "./CenterManagerSidebar";
import AdminTopBar from "./AdminTopBar";
import { CenterSettingsProvider } from "../../../contexts/CenterSettingsContext";

export default function CenterManagerLayout() {
  return (
    <CenterSettingsProvider>
      <div className="admin-scope cm-academy">
      <div className="app-shell">
        {/* Sidebar */}
        <CenterManagerSidebar />
        {/* Main area */}
        <div className="main-area">
          {/* Header */}
          <AdminTopBar centerManager />
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
    </CenterSettingsProvider>
  );
}
