import React, { useState, useEffect } from 'react';
import type { CenterSettingDto } from '../../../BLL/models/CenterSettingDto';
import { centerSettingDAL } from '../../../DAL/centerSettingDAL';

export interface LandingFooterProps {
  settings?: CenterSettingDto[];
}

export function LandingFooter({ settings: propSettings }: LandingFooterProps) {
  const [settings, setSettings] = useState<CenterSettingDto[]>(propSettings || []);

  useEffect(() => {
    if (propSettings && propSettings.length > 0) {
      setSettings(propSettings);
      return;
    }

    let isMounted = true;
    async function loadSettings() {
      try {
        const res = await centerSettingDAL.getAllSettings();
        if (isMounted && res.data) {
          setSettings(res.data);
        }
      } catch (err) {
        console.warn('Lỗi khi tải cấu hình trung tâm cho Footer:', err);
      }
    }
    loadSettings();

    return () => {
      isMounted = false;
    };
  }, [propSettings]);

  const centerName = centerSettingDAL.getSettingValue(settings, 'center_name', 'EduTrack Smart Learning Center');
  const address = centerSettingDAL.getSettingValue(settings, 'center_address', '123 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh');
  const phone = centerSettingDAL.getSettingValue(settings, 'center_hotline', '1900 6868');

  return (
    <footer id="footer" className="footer position-relative light-background border-top pt-5">
      <div className="container footer-top">
        <div className="row gy-4">
          {/* Thông tin liên lạc */}
          <div className="col-lg-4 col-md-6 footer-about">
            <a href="/" className="logo d-flex align-items-center text-decoration-none mb-3">
              <span className="sitename fs-4 fw-bold text-primary">{centerName}</span>
            </a>
            <div className="footer-contact pt-2 text-secondary">
              <p className="mb-1"><i className="bi bi-geo-alt me-2 text-primary"></i>{address}</p>
              <p className="mb-1"><i className="bi bi-telephone me-2 text-primary"></i><strong>Hotline:</strong> <span>{phone}</span></p>
              <p className="mb-1"><i className="bi bi-envelope me-2 text-primary"></i><strong>Email:</strong> <span>contact@edutrack.edu.vn</span></p>
            </div>
            <div className="social-links d-flex gap-2 mt-4">
              <a href="#footer" className="btn btn-sm btn-outline-secondary rounded-circle"><i className="bi bi-facebook"></i></a>
              <a href="#footer" className="btn btn-sm btn-outline-secondary rounded-circle"><i className="bi bi-youtube"></i></a>
              <a href="#footer" className="btn btn-sm btn-outline-secondary rounded-circle"><i className="bi bi-linkedin"></i></a>
            </div>
          </div>

          <div className="col-lg-2 col-md-3 footer-links">
            <h5 className="fw-bold mb-3">Liên kết nhanh</h5>
            <ul className="list-unstyled d-flex flex-column gap-2 text-muted">
              <li><a href="#hero" className="text-decoration-none text-secondary">Trang chủ</a></li>
              <li><a href="#about" className="text-decoration-none text-secondary">Về chúng tôi</a></li>
              <li><a href="#courses" className="text-decoration-none text-secondary">Khóa học</a></li>
              <li><a href="#trainers-index" className="text-decoration-none text-secondary">Đội ngũ giảng viên</a></li>
              <li><a href="#features" className="text-decoration-none text-secondary">Chương trình đào tạo</a></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-3 footer-links">
            <h5 className="fw-bold mb-3">Khóa học nổi bật</h5>
            <ul className="list-unstyled d-flex flex-column gap-2 text-muted">
              <li><a href="#courses" className="text-decoration-none text-secondary">Toán học nâng cao & Luyện thi</a></li>
              <li><a href="#courses" className="text-decoration-none text-secondary">Vật lý ứng dụng & Thực hành</a></li>
              <li><a href="#courses" className="text-decoration-none text-secondary">Tiếng Anh IELTS Foundation</a></li>
              <li><a href="#courses" className="text-decoration-none text-secondary">Hóa học chuyên sâu</a></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-12 footer-newsletter">
            <h5 className="fw-bold mb-3">Đăng ký nhận tin</h5>
            <p className="text-muted small">Đăng ký để nhận thông tin về lịch khai giảng và học bổng mới nhất từ EduTrack!</p>
            <form onSubmit={(e) => e.preventDefault()} className="d-flex gap-2">
              <input type="email" placeholder="Email của bạn" className="form-control form-control-sm" required />
              <button type="submit" className="btn btn-primary btn-sm px-3">Gửi</button>
            </form>
          </div>
        </div>
      </div>

      {/* Bản quyền */}
      <div className="container copyright text-center mt-5 pt-3 border-top">
        <p className="text-muted small mb-1">
          © 2026 <strong className="text-primary">{centerName}</strong>. All Rights Reserved.
        </p>
        <div className="credits text-muted" style={{ fontSize: '11px' }}>
          Hệ thống Quản lý Trung tâm Đào tạo Thông minh EduTrack
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;
