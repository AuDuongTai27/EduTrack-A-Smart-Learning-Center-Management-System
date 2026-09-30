import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

interface LandingHeaderProps {
  onOpenLogin?: () => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({ onOpenLogin }) => {
  const [activeSection, setActiveSection] = useState('hero');

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
    { id: 'about', label: 'Giới thiệu' },
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
          <button
            type="button"
            className="btn btn-outline-success btn-sm rounded-pill px-3"
            onClick={onOpenLogin}
          >
            <i className="bi bi-box-arrow-in-right me-1"></i>Đăng nhập
          </button>

          {/* Dùng Link để chuyển trang sang Cổng học sinh */}
          <Link
            to="/student/dashboard"
            className="btn btn-success btn-sm rounded-pill px-3 text-white text-decoration-none"
          >
            Cổng học sinh <i className="bi bi-arrow-right ms-1"></i>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;
