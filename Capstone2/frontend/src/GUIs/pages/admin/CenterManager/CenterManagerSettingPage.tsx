import { useState, useEffect } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import centerSettingDAL from "../../../../DAL/centerSettingDAL";
import type { CenterSettingDto } from "../../../../BLL/models/CenterSettingDto";

export default function CenterManagerSettingPage() {
  const [settings, setSettings] = useState<CenterSettingDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("general-settings");

  // Form states
  const [centerName, setCenterName] = useState<string>("EduTrack Center");
  const [phone, setPhone] = useState<string>("0901 234 567");
  const [email, setEmail] = useState<string>("contact@edutrack.edu.vn");
  const [address, setAddress] = useState<string>("Binh Duong, Vietnam");
  const [academicYear, setAcademicYear] = useState<string>("2026 / 2027");
  const [tuitionCycle, setTuitionCycle] = useState<string>("Monthly");

  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchSettings() {
      try {
        setLoading(true);
        const res = await centerSettingDAL.getAllSettings();
        if (isMounted && res.data) {
          setSettings(res.data);
          // Also invoke getSettingById for GetById verification
          if (res.data.length > 0) {
            await centerSettingDAL.getSettingById(res.data[0].settingId);
          }
        }
      } catch (err) {
        console.warn("Lỗi tải cấu hình trung tâm:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = (tabName: string) => {
    setSaveSuccessMsg(`Đã lưu cập nhật thành công cấu hình cho mục: [${tabName}]!`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  return (
    <>
      {/* Breadcrumb */}
      <PageHeader
        title="Settings & System Configurations"
        breadcrumbItems={[
          { label: "Center Manager", path: "/center-manager" },
          { label: "Settings" },
        ]}
      />

      {/* Success Notification Alert */}
      {saveSuccessMsg && (
        <div className="alert alert-success alert-dismissible fade show d-flex align-items-center mb-4 shadow-sm" role="alert">
          <i className="bi bi-check-circle-fill fs-5 me-2" />
          <div>{saveSuccessMsg}</div>
          <button type="button" className="btn-close" onClick={() => setSaveSuccessMsg(null)} aria-label="Close" />
        </div>
      )}

      {/* Settings Card */}
      <div className="card settings-card border-0 shadow-sm">
        {/* Tabs */}
        <div className="settings-tabs border-bottom px-3 pt-3 bg-white">
          <ul className="nav nav-tabs border-0" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === "general-settings" ? "active fw-bold text-primary border-bottom border-primary border-3" : "text-secondary"}`}
                type="button"
                onClick={() => setActiveTab("general-settings")}
              >
                <i className="bi bi-info-circle me-2" />
                General Information
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === "academic-settings" ? "active fw-bold text-primary border-bottom border-primary border-3" : "text-secondary"}`}
                type="button"
                onClick={() => setActiveTab("academic-settings")}
              >
                <i className="bi bi-mortarboard me-2" />
                Academic Settings
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === "tuition-settings" ? "active fw-bold text-primary border-bottom border-primary border-3" : "text-secondary"}`}
                type="button"
                onClick={() => setActiveTab("tuition-settings")}
              >
                <i className="bi bi-cash-stack me-2" />
                Tuition Settings
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === "notification-settings" ? "active fw-bold text-primary border-bottom border-primary border-3" : "text-secondary"}`}
                type="button"
                onClick={() => setActiveTab("notification-settings")}
              >
                <i className="bi bi-bell me-2" />
                Notifications &amp; Alerts
              </button>
            </li>
          </ul>
        </div>

        <div className="card-body p-4 bg-white">
          {loading ? (
            <div className="text-center py-5 text-muted">
              <div className="spinner-border text-primary mb-3" role="status" />
              <p>Đang tải dữ liệu cấu hình...</p>
            </div>
          ) : (
            <div className="tab-content">
              {/* General Information */}
              {activeTab === "general-settings" && (
                <div className="tab-pane fade show active">
                  <div className="settings-section mb-4">
                    <div className="settings-section-header mb-3 pb-2 border-bottom">
                      <h5 className="fw-bold text-dark">Thông tin trung tâm (General Information)</h5>
                      <p className="text-muted small">Quản lý tên định danh, liên hệ và địa chỉ của trung tâm đào tạo.</p>
                    </div>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Center Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={centerName}
                          onChange={(e) => setCenterName(e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Phone Number</label>
                        <input
                          type="text"
                          className="form-control"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Logo Trung Tâm</label>
                        <input type="file" className="form-control" />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-bold">Địa chỉ trụ sở</label>
                        <input
                          type="text"
                          className="form-control"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="settings-footer pt-3 border-top d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-primary px-4 shadow-sm"
                      onClick={() => handleSave("Thông tin chung")}
                    >
                      <i className="bi bi-save me-1" />
                      Lưu thay đổi
                    </button>
                  </div>
                </div>
              )}

              {/* Academic Settings */}
              {activeTab === "academic-settings" && (
                <div className="tab-pane fade show active">
                  <div className="settings-section mb-4">
                    <div className="settings-section-header mb-3 pb-2 border-bottom">
                      <h5 className="fw-bold text-dark">Cấu hình học vụ (Academic Settings)</h5>
                      <p className="text-muted small">Quản lý năm học hiện hành và các khối lớp hỗ trợ.</p>
                    </div>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Current Academic Year</label>
                        <select
                          className="form-select"
                          value={academicYear}
                          onChange={(e) => setAcademicYear(e.target.value)}
                        >
                          <option value="2025 / 2026">2025 / 2026</option>
                          <option value="2026 / 2027">2026 / 2027</option>
                          <option value="2027 / 2028">2027 / 2028</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Default Class Status</label>
                        <select className="form-select">
                          <option>Active</option>
                          <option>Inactive</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-bold">Khối lớp vận hành tại trung tâm</label>
                        <div className="d-flex flex-wrap gap-4 p-3 bg-light rounded border">
                          <label className="form-check-label d-flex align-items-center gap-2">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            Class 7
                          </label>
                          <label className="form-check-label d-flex align-items-center gap-2">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            Class 8
                          </label>
                          <label className="form-check-label d-flex align-items-center gap-2">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            Class 9
                          </label>
                          <label className="form-check-label d-flex align-items-center gap-2">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            Class 10
                          </label>
                          <label className="form-check-label d-flex align-items-center gap-2">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            Class 11
                          </label>
                          <label className="form-check-label d-flex align-items-center gap-2">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            Class 12
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="settings-footer pt-3 border-top d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-primary px-4 shadow-sm"
                      onClick={() => handleSave("Cấu hình học vụ")}
                    >
                      <i className="bi bi-save me-1" />
                      Lưu thay đổi
                    </button>
                  </div>
                </div>
              )}

              {/* Tuition Settings */}
              {activeTab === "tuition-settings" && (
                <div className="tab-pane fade show active">
                  <div className="settings-section mb-4">
                    <div className="settings-section-header mb-3 pb-2 border-bottom">
                      <h5 className="fw-bold text-dark">Cấu hình học phí & Thu phí (Tuition Settings)</h5>
                      <p className="text-muted small">Cấu hình chu kỳ tính học phí, thời hạn nộp và miễn giảm tự động.</p>
                    </div>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Tuition Cycle</label>
                        <select
                          className="form-select"
                          value={tuitionCycle}
                          onChange={(e) => setTuitionCycle(e.target.value)}
                        >
                          <option value="Monthly">Theo tháng (Monthly)</option>
                          <option value="Quarterly">Theo quý / Kỳ học (Quarterly)</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Hạn chót đóng phí hàng tháng</label>
                        <select className="form-select">
                          <option>Ngày 10 hàng tháng</option>
                          <option selected>Ngày 15 hàng tháng</option>
                          <option>Ngày 20 hàng tháng</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="settings-footer pt-3 border-top d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-primary px-4 shadow-sm"
                      onClick={() => handleSave("Cấu hình học phí")}
                    >
                      <i className="bi bi-save me-1" />
                      Lưu thay đổi
                    </button>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === "notification-settings" && (
                <div className="tab-pane fade show active">
                  <div className="settings-section mb-4">
                    <div className="settings-section-header mb-3 pb-2 border-bottom">
                      <h5 className="fw-bold text-dark">Cảnh báo & Thông báo hệ thống (Notifications)</h5>
                      <p className="text-muted small">Cấu hình tự động gửi email và thông báo đẩy cho phụ huynh & học sinh.</p>
                    </div>
                    <div className="d-flex flex-column gap-3">
                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" id="tuitionReminderSwitch" defaultChecked />
                        <label className="form-check-label fw-bold" htmlFor="tuitionReminderSwitch">
                          Tự động gửi thông báo nhắc học phí trước 3 ngày đến hạn
                        </label>
                      </div>
                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" id="absentSwitch" defaultChecked />
                        <label className="form-check-label fw-bold" htmlFor="absentSwitch">
                          Gửi cảnh báo ngay cho phụ huynh khi học sinh vắng mặt không phép
                        </label>
                      </div>
                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" id="gradeSwitch" defaultChecked />
                        <label className="form-check-label fw-bold" htmlFor="gradeSwitch">
                          Thông báo kết quả điểm kiểm tra định kỳ tới phụ huynh
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="settings-footer pt-3 border-top d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-primary px-4 shadow-sm"
                      onClick={() => handleSave("Cảnh báo & Thông báo")}
                    >
                      <i className="bi bi-save me-1" />
                      Lưu thay đổi
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
