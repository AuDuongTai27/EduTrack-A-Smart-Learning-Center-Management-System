import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { StudentSidebar } from "./StudentSidebar";
import { StudentMobileTopbar } from "./StudentMobileTopbar";
import "../../../assets/css/student.css";

export const StudentLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="student-scope">
      <div className="app-container">
      {/* DESKTOP SIDEBAR */}
      <StudentSidebar />

      {/* MOBILE OFFCANVAS SIDEBAR */}
      <StudentSidebar
        isMobileDrawer={true}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* MAIN WRAPPER */}
      <div className="main-wrapper">
        <StudentMobileTopbar onToggleSidebar={() => setMobileMenuOpen(true)} />
        <Outlet />
      </div>
    </div>
  </div>
  );
};

export default StudentLayout;
