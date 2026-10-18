import { Outlet } from "react-router-dom";
import "../../../assets/css/teacher-layout.css";
import TeachingAssistantSidebar from "./TeachingAssistantSidebar";
import TeachingAssistantTopBar from "./TeachingAssistantTopBar";

export default function TeachingAssistantLayout() {
    return (
        <div className="teacher-scope">
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
            <div className="sidebar-overlay" id="sidebarOverlay" />
        </div>
    );
}
