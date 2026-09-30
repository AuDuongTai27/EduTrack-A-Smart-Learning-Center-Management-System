import { Link } from "react-router-dom";

export default function CenterManagerSettingPage() {
  return (
    <>
      {/* Breadcrumb */}
      <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
        <div className="my-auto mb-2">
          <h3 className="page-title mb-1">Center Settings</h3>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/center-manager/dashboard">Dashboard</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Settings
              </li>
            </ol>
          </nav>
        </div>
      </div>
      {/* Settings */}
      <div className="card settings-card">
        {/* Tabs */}
        <div className="settings-tabs">
          <ul className="nav nav-tabs" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className="nav-link active"
                data-bs-toggle="tab"
                data-bs-target="#general-settings"
                type="button"
              >
                General Information
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className="nav-link"
                data-bs-toggle="tab"
                data-bs-target="#academic-settings"
                type="button"
              >
                Academic Settings
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className="nav-link"
                data-bs-toggle="tab"
                data-bs-target="#tuition-settings"
                type="button"
              >
                Tuition Settings
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className="nav-link"
                data-bs-toggle="tab"
                data-bs-target="#notification-settings"
                type="button"
              >
                Notifications &amp; Alerts
              </button>
            </li>
          </ul>
        </div>
        <div className="tab-content">
          {/* General Information */}
          <div className="tab-pane fade show active" id="general-settings">
            <div className="settings-section">
              <div className="settings-section-header">
                <h5>General Information</h5>
                <p>Manage basic information of the learning center.</p>
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Center Name</label>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue="EduTrack Center"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue="0901 234 567"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    defaultValue="contact@edutrack.edu.vn"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Logo</label>
                  <input type="file" className="form-control" />
                </div>
                <div className="col-12">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue="Binh Duong, Vietnam"
                  />
                </div>
              </div>
            </div>
            <div className="settings-footer">
              <button type="button" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </div>
          {/* Academic Settings */}
          <div className="tab-pane fade" id="academic-settings">
            <div className="settings-section">
              <div className="settings-section-header">
                <h5>Academic Settings</h5>
                <p>Configure the academic year and supported classes.</p>
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Current Academic Year</label>
                  <select className="form-select">
                    <option>2025 / 2026</option>
                    <option selected>2026 / 2027</option>
                    <option>2027 / 2028</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Default Class Status</label>
                  <select className="form-select">
                    <option selected>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">Supported Classes</label>
                  <div className="settings-checkbox-list">
                    <label>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        defaultChecked
                      />
                      Class 7
                    </label>
                    <label>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        defaultChecked
                      />
                      Class 8
                    </label>
                    <label>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        defaultChecked
                      />
                      Class 9
                    </label>
                    <label>
                      <input className="form-check-input" type="checkbox" />
                      Class 10
                    </label>
                    <label>
                      <input className="form-check-input" type="checkbox" />
                      Class 11
                    </label>
                    <label>
                      <input className="form-check-input" type="checkbox" />
                      Class 12
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="settings-footer">
              <button type="button" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </div>
          {/* Tuition Settings */}
          <div className="tab-pane fade" id="tuition-settings">
            <div className="settings-section">
              <div className="settings-section-header">
                <h5>Tuition Settings</h5>
                <p>Configure tuition periods, due dates and adjustments.</p>
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Tuition Cycle</label>
                  <select className="form-select">
                    <option selected>Monthly</option>
                    <option>Quarterly</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label"> Default Due Day </label>
                  <select className="form-select">
                    <option>5th of each month</option>
                    <option>10th of each month</option>
                    <option selected>15th of each month</option>
                    <option>20th of each month</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Tuition Generation Day</label>
                  <select className="form-select">
                    <option selected>1st of each month</option>
                    <option>5th of each month</option>
                    <option>10th of each month</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label"> Default Currency </label>
                  <select className="form-select">
                    <option selected>VND</option>
                  </select>
                </div>
                <div className="col-12">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="allowAdjustment"
                      defaultChecked
                    />
                    <label
                      className="form-check-label"
                      htmlFor="allowAdjustment"
                    >
                      Allow tuition discounts or exemptions
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="settings-footer">
              <button type="button" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </div>
          {/* Notifications & Alerts */}
          <div className="tab-pane fade" id="notification-settings">
            <div className="settings-section">
              <div className="settings-section-header">
                <h5>Notifications &amp; Alerts</h5>
                <p>Configure default reminders and system alerts.</p>
              </div>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label"> Tuition Reminder </label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      defaultValue={3}
                    />
                    <span className="input-group-text">
                      days before due date
                    </span>
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Overdue Tuition Alert</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      defaultValue={1}
                    />
                    <span className="input-group-text">
                      days after due date
                    </span>
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    Attendance Warning Threshold
                  </label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      defaultValue={3}
                    />
                    <span className="input-group-text"> absences </span>
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    Incomplete Assignment Alert
                  </label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      defaultValue={2}
                    />
                    <span className="input-group-text"> assignments </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="settings-footer">
              <button type="button" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
