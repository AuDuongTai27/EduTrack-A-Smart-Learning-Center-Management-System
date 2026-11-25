import "../../../assets/css/teacher-layout.css";
import "../../../assets/css/center-manager-academy.css";
import "../../../assets/css/teaching-academy.css";
import { CenterSettingsProvider } from "../../../contexts/CenterSettingsContext";
import { Outlet } from "react-router-dom";
import TeachingAssistantSidebar from "./TeachingAssistantSidebar";
import TeachingAssistantTopBar from "./TeachingAssistantTopBar";
import { closeMobileSidebar } from "../../hooks/useSidebarToggle";

export default function TeachingAssistantLayout() {
    return (
        <CenterSettingsProvider><div className="teacher-scope teaching-academy">
            <div className="app-shell">
                {/* Sidebar */}
                <TeachingAssistantSidebar />
                {/* Main area */}
                <div className="main-area">
                    {/* Header */}
                    <TeachingAssistantTopBar />
                    {/* Content area */}
                    <main className="page-wrapper">
                        <div className="page-content">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
            <div className="sidebar-overlay" id="sidebarOverlay" onClick={closeMobileSidebar} />
        </div></CenterSettingsProvider>
  );
}
