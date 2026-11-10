import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LandingHeader } from './LandingHeader';
import { LandingFooter } from './LandingFooter';
import { WorkspaceChooser } from '../../components/landing/WorkspaceChooser';
import '../../../assets/css/main.css';

export function LandingPageLayout() {
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  return (
    <div className="landing-layout-wrapper landing-scope">
      {/* 1. Header phụ trợ */}
      <LandingHeader onOpenWorkspace={() => setWorkspaceOpen(true)} />

      {/* 2. Vùng hiển thị nội dung động của trang */}
      <Outlet context={{ onOpenWorkspace: () => setWorkspaceOpen(true) }} />

      {/* 3. Footer phụ trợ */}
      <LandingFooter />

      {/* 4. Modal đăng nhập */}
      <WorkspaceChooser isOpen={workspaceOpen} onClose={() => setWorkspaceOpen(false)} />
    </div>
  );
};

export default LandingPageLayout;
