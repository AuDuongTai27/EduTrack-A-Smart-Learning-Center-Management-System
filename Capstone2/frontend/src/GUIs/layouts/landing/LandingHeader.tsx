import React, { useState, useSyncExternalStore } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { authApi, getAuthUser, subscribeAuth } from '../../../api/authApi';

interface LandingHeaderProps {
  onOpenWorkspace?: () => void;
}

export function LandingHeader({ onOpenWorkspace }: LandingHeaderProps) {
  const [activeSection, setActiveSection] = useState('hero');
  const authUser = useSyncExternalStore(subscribeAuth, getAuthUser);

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const header = document.getElementById('header');
      const headerOffset = header ? header.offsetHeight : 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const navItems = [
    { id: 'hero', label: 'Trang chủ' },
    { id: 'about', label: 'Về trung tâm' },
    { id: 'features', label: 'Chương trình học' },
    { id: 'courses', label: 'Khóa học' },
    { id: 'trainers-index', label: 'Giảng viên' },
  ];

  return (
    <header id="header" className="header d-flex align-items-center sticky-top">
      <div className="container-fluid container-xl position-relative d-flex align-items-center">
        {/* Dùng Link chuyển về trang chủ */}
        <Link to="/" className="logo d-flex align-items-center me-auto text-decoration-none">
          <h1 className="sitename mb-0 fw-bold">EduTrack</h1>
        </Link>

        {/* Menu điều hướng với NavLink/Link và Smooth Scroll chuẩn vị trí */}
        <nav id="navmenu" className="navmenu">
          <ul className="d-flex list-unstyled mb-0 gap-3">
            {navItems.map((item) => (
              <li key={item.id}>
                <NavLink
                  to={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo(item.id);
                  }}
                  className={`text-decoration-none ${activeSection === item.id ? 'active' : ''}`}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="d-flex align-items-center gap-2 ms-4">
          {authUser ? (
            <>
              <Link
                to={authUser.redirectPath || '/student/dashboard'}
                className="btn btn-success btn-sm rounded-pill px-3 text-white text-decoration-none fw-semibold"
              >
                <i className="bi bi-person-check-fill me-1.5" />
                {authUser.fullName}
              </Link>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                onClick={() => authApi.logout()}
                title="Đăng xuất tài khoản"
              >
                <i className="bi bi-box-arrow-right me-1" />
                Đăng xuất
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-success btn-sm rounded-pill px-4 py-1.5 fw-semibold text-white shadow-sm"
              onClick={onOpenWorkspace}
            >
              <i className="bi bi-box-arrow-in-right me-1.5" />
              Đăng nhập
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default LandingHeader;
