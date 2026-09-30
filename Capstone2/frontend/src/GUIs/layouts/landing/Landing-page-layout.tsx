import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LandingHeader } from './LandingHeader';
import { LandingFooter } from './LandingFooter';
import { LoginModal } from '../../components/landing/LoginModal';
import '../../../assets/css/main.css';

export const LandingPageLayout: React.FC = () => {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <div className="landing-layout-wrapper">
      {/* 1. Header phụ trợ */}
      <LandingHeader onOpenLogin={() => setLoginOpen(true)} />

      {/* 2. Vùng hiển thị nội dung động của trang */}
      <Outlet />

      {/* 3. Footer phụ trợ */}
      <LandingFooter />

      {/* 4. Modal đăng nhập */}
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
};

export default LandingPageLayout;
