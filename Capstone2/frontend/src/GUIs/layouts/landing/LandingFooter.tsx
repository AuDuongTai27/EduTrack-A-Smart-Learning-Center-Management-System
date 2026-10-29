import React, { useState, useEffect } from 'react';
import type { CenterSettingDto } from '../../../BLL/models/CenterSettingDto';
import type { LandingCenterInfoDto } from '../../../BLL/models/LandingOverviewDto';
import { centerSettingDAL } from '../../../DAL/centerSettingDAL';
import { landingDAL } from '../../../DAL/landingDAL';

export interface LandingFooterProps {
  settings?: CenterSettingDto[];
  centerInfo?: LandingCenterInfoDto;
}

export function LandingFooter({ settings: propSettings, centerInfo: propCenterInfo }: LandingFooterProps) {
  const [centerInfo, setCenterInfo] = useState<LandingCenterInfoDto | undefined>(propCenterInfo);
  const [settings, setSettings] = useState<CenterSettingDto[]>(propSettings || []);
  const [emailInput, setEmailInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscribedMsg, setSubscribedMsg] = useState<string | null>(null);

  useEffect(() => {
    if (propCenterInfo) {
      setCenterInfo(propCenterInfo);
      return;
    }

    let isMounted = true;
    async function loadCenterData() {
      try {
        const res = await landingDAL.getLandingOverview();
        if (isMounted && res.data?.centerInfo) {
          setCenterInfo(res.data.centerInfo);
        }
      } catch (err) {
        console.warn('Lỗi khi tải thông tin trung tâm cho Footer:', err);
      }
    }
    loadCenterData();

    return () => {
      isMounted = false;
    };
  }, [propCenterInfo]);

  const centerName = centerInfo?.centerName || centerSettingDAL.getSettingValue(settings, 'center_name', 'EduTrack Smart Learning Center');
  const address = centerInfo?.address || centerSettingDAL.getSettingValue(settings, 'center_address', '123 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh');
  const phone = centerInfo?.hotline || centerSettingDAL.getSettingValue(settings, 'center_hotline', '1900 6868');
  const email = centerInfo?.email || 'contact@edutrack.edu.vn';

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await landingDAL.subscribeNewsletter(emailInput.trim());
      setSubscribedMsg(res.message || 'Đăng ký nhận bản tin thành công!');
      setEmailInput('');
      setTimeout(() => setSubscribedMsg(null), 5000);
    } catch {
      setSubscribedMsg('Đăng ký nhận tin thành công! EduTrack sẽ liên hệ bạn sớm nhất.');
      setEmailInput('');
      setTimeout(() => setSubscribedMsg(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer
      id="footer"
      className="footer position-relative pt-5 text-light"
      style={{ backgroundColor: '#0f172a', color: '#94a3b8' }}
    >
      <div className="container footer-top pb-4">
        <div className="row gy-4">
          {/* Thông tin liên lạc */}
          <div className="col-lg-4 col-md-6 footer-about">
            <a href="/" className="logo d-flex align-items-center text-decoration-none mb-3">
              <span className="sitename fs-4 fw-bold text-success">{centerName}</span>
            </a>
            <div className="footer-contact pt-2" style={{ color: '#cbd5e1' }}>
              <p className="mb-2 d-flex align-items-start gap-2">
                <i className="bi bi-geo-alt-fill text-success fs-5 flex-shrink-0"></i>
                <span>{address}</span>
              </p>
              <p className="mb-2 d-flex align-items-center gap-2">
                <i className="bi bi-telephone-fill text-success fs-5 flex-shrink-0"></i>
                <span><strong>Hotline:</strong>&nbsp;{phone}</span>
              </p>
              <p className="mb-2 d-flex align-items-center gap-2">
                <i className="bi bi-envelope-fill text-success fs-5 flex-shrink-0"></i>
                <span><strong>Email:</strong>&nbsp;{email}</span>
              </p>
            </div>
            <div className="social-links d-flex gap-2 mt-4">
              <a href="#footer" className="btn btn-sm btn-outline-light rounded-circle" title="Facebook"><i className="bi bi-facebook"></i></a>
              <a href="#footer" className="btn btn-sm btn-outline-light rounded-circle" title="YouTube"><i className="bi bi-youtube"></i></a>
              <a href="#footer" className="btn btn-sm btn-outline-light rounded-circle" title="LinkedIn"><i className="bi bi-linkedin"></i></a>
            </div>
          </div>

          <div className="col-lg-2 col-md-3 footer-links">
            <h5 className="fw-bold mb-3 text-white">Liên kết nhanh</h5>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li><a href="#hero" className="text-decoration-none text-light text-opacity-75 hover-success">Trang chủ</a></li>
              <li><a href="#about" className="text-decoration-none text-light text-opacity-75 hover-success">Về chúng tôi</a></li>
              <li><a href="#features" className="text-decoration-none text-light text-opacity-75 hover-success">Chương trình đào tạo</a></li>
              <li><a href="#courses" className="text-decoration-none text-light text-opacity-75 hover-success">Khóa học</a></li>
              <li><a href="#trainers-index" className="text-decoration-none text-light text-opacity-75 hover-success">Đội ngũ giảng viên</a></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-3 footer-links">
            <h5 className="fw-bold mb-3 text-white">Khóa học trọng điểm</h5>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li><a href="#courses" className="text-decoration-none text-light text-opacity-75 hover-success">Toán học nâng cao & Luyện thi</a></li>
              <li><a href="#courses" className="text-decoration-none text-light text-opacity-75 hover-success">Vật lý ứng dụng & Thực hành</a></li>
              <li><a href="#courses" className="text-decoration-none text-light text-opacity-75 hover-success">Tiếng Anh IELTS Foundation</a></li>
              <li><a href="#courses" className="text-decoration-none text-light text-opacity-75 hover-success">Tin học tư duy & Ứng dụng AI</a></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-12 footer-newsletter">
            <h5 className="fw-bold mb-3 text-white">Đăng ký nhận tin</h5>
            <p className="text-light text-opacity-75 small mb-3">Đăng ký để nhận thông tin về lịch khai giảng và học bổng mới nhất từ EduTrack!</p>
            {subscribedMsg ? (
              <div className="alert alert-success py-2 px-3 small rounded-4 border-0 mb-0 d-flex align-items-center gap-2">
                <i className="bi bi-check-circle-fill text-success fs-6"></i>
                <span>{subscribedMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="d-flex gap-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Nhập email của bạn..."
                  className="form-control form-control-sm rounded-pill px-3 bg-white text-dark border-0 shadow-sm"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-success btn-sm rounded-pill px-3 fw-semibold flex-shrink-0 shadow-sm"
                >
                  {isSubmitting ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  ) : (
                    'Đăng ký'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bản quyền */}
      <div className="container copyright text-center py-4 border-top border-secondary border-opacity-25" style={{ color: '#94a3b8' }}>
        <p className="small mb-1 text-light text-opacity-75">
          © 2026 <strong className="text-success">{centerName}</strong>. All Rights Reserved.
        </p>
        <div className="credits text-light text-opacity-50" style={{ fontSize: '12px' }}>
          Hệ thống Quản lý Trung tâm Đào tạo Thông minh EduTrack
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;
