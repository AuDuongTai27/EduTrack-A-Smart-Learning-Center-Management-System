import { useEffect, useState } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import centerSettingDAL from "../../../../DAL/centerSettingDAL";
import type { CenterSettingChange } from "../../../../api/centerSettingApi";
import type { CenterSettingDto } from "../../../../BLL/models/CenterSettingDto";

type Tab = "general" | "academic" | "tuition" | "notifications";

type FormData = {
  centerName: string;
  centerHotline: string;
  centerEmail: string;
  centerAddress: string;
  academicYear: string;
  defaultClassStatus: string;
  operatingGrades: number[];
  tuitionCycle: string;
  tuitionDueDay: string;
  tuitionReminder: boolean;
  absenceAlert: boolean;
  gradeNotification: boolean;
};

const EMPTY_FORM: FormData = {
  centerName: "",
  centerHotline: "",
  centerEmail: "",
  centerAddress: "",
  academicYear: "",
  defaultClassStatus: "",
  operatingGrades: [],
  tuitionCycle: "",
  tuitionDueDay: "",
  tuitionReminder: false,
  absenceAlert: false,
  gradeNotification: false,
};

const GRADE_OPTIONS = [7, 8, 9, 10, 11, 12];
const TAB_LABELS: Record<Tab, string> = {
  general: "Center Information",
  academic: "Academic Settings",
  tuition: "Tuition Settings",
  notifications: "Notification Settings",
};

function loadForm(settings: CenterSettingDto[]): FormData {
  const values = new Map(
    settings.map(s => [s.settingKey.toLowerCase(), s.settingValue ?? ""]),
  );
  const value = (key: string) => values.get(key) ?? "";
  const operatingGrades = value("operating_grades")
    .split(",")
    .map(x => Number(x))
    .filter(n => GRADE_OPTIONS.includes(n));

  return {
    centerName: value("center_name"),
    centerHotline: value("center_hotline"),
    centerEmail: value("center_email"),
    centerAddress: value("center_address"),
    academicYear: value("academic_year"),
    defaultClassStatus: value("default_class_status"),
    operatingGrades,
    tuitionCycle: value("tuition_cycle"),
    tuitionDueDay: value("tuition_due_day"),
    tuitionReminder: value("tuition_reminder_enabled") === "true",
    absenceAlert: value("absence_alert_enabled") === "true",
    gradeNotification: value("grade_notification_enabled") === "true",
  };
}

function settingsForTab(tab: Tab, data: FormData): CenterSettingChange[] {
  const entry = (settingKey: string, settingValue: string): CenterSettingChange => ({
    settingKey, settingValue,
  });
  switch (tab) {
    case "general":
      return [
        entry("center_name", data.centerName.trim()),
        entry("center_hotline", data.centerHotline.trim()),
        entry("center_email", data.centerEmail.trim()),
        entry("center_address", data.centerAddress.trim()),
      ];
    case "academic":
      return [
        entry("academic_year", data.academicYear.trim()),
        entry("default_class_status", data.defaultClassStatus),
        entry("operating_grades", [...data.operatingGrades].sort((a, b) => a - b).join(",")),
      ];
    case "tuition":
      return [
        entry("tuition_cycle", data.tuitionCycle),
        entry("tuition_due_day", data.tuitionDueDay),
      ];
    case "notifications":
      return [
        entry("tuition_reminder_enabled", String(data.tuitionReminder)),
        entry("absence_alert_enabled", String(data.absenceAlert)),
        entry("grade_notification_enabled", String(data.gradeNotification)),
      ];
  }
}

export default function CenterManagerSettingPage() {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const setField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setSaveError(null);
    setSaveSuccess(null);
  };

  const refresh = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await centerSettingDAL.getAllSettings();
      setForm(loadForm(response.data));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to load settings from Backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Do not populate any business data from mock defaults.
    void refresh();
  }, []);

  const handleSave = async (tab: Tab) => {
    if (loading || saving || loadError) return;
    setSaveError(null);
    setSaveSuccess(null);

    if (tab === "general" && !form.centerName.trim()) {
      setSaveError("Please enter the center name.");
      return;
    }
    if (tab === "general" && form.centerEmail.trim() &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.centerEmail.trim())) {
      setSaveError("Invalid center email.");
      return;
    }
    if (tab === "academic" && (!form.academicYear.trim() || !form.defaultClassStatus)) {
      setSaveError("Please enter the academic year and select the default class status.");
      return;
    }
    if (tab === "tuition" &&
        (!form.tuitionCycle || !/^(?:[1-9]|1\d|2[0-8])$/.test(form.tuitionDueDay))) {
      setSaveError("Please select the tuition cycle and payment due day between 1 and 28.");
      return;
    }

    setSaving(true);
    try {
      await centerSettingDAL.saveSettings(settingsForTab(tab, form));
      window.dispatchEvent(new Event("edutrack:center-settings-updated"));
      setSaveSuccess(`Saved ${TAB_LABELS[tab]} to database successfully.`);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const changeTab = (tab: Tab) => {
    setActiveTab(tab);
    setSaveError(null);
    setSaveSuccess(null);
  };

  const toggleGrade = (grade: number, checked: boolean) => {
    setField("operatingGrades", checked
      ? [...new Set([...form.operatingGrades, grade])]
      : form.operatingGrades.filter(g => g !== grade));
  };

  const saveButton = (tab: Tab) => (
    <div className="settings-footer pt-3 border-top d-flex justify-content-end">
      <button type="button" className="btn btn-primary px-4 shadow-sm"
        disabled={saving || loading || !!loadError}
        onClick={() => void handleSave(tab)}>
        <i className="bi bi-save me-1" />
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );

  return (
    <>
      <PageHeader title="Settings & System Configurations"
        breadcrumbItems={[
          { label: "Center Manager", path: "/center-manager" },
          { label: "Settings" },
        ]} />

      {saveSuccess && (
        <div className="alert alert-success d-flex justify-content-between align-items-center" role="status">
          <span><i className="bi bi-check-circle-fill me-2" />{saveSuccess}</span>
          <button type="button" className="btn-close" onClick={() => setSaveSuccess(null)} />
        </div>
      )}
      {saveError && <div className="alert alert-danger" role="alert">{saveError}</div>}
      {loadError && (
        <div className="alert alert-danger" role="alert">
          Failed to load real data from Backend: {loadError}
          <button type="button" className="btn btn-sm btn-outline-danger ms-3" onClick={() => void refresh()}>
            Retry
          </button>
        </div>
      )}

      <div className="card settings-card border-0 shadow-sm">
        <div className="settings-tabs border-bottom px-3 pt-3 bg-white">
          <ul className="nav nav-tabs border-0" role="tablist">
            {([
              ["general", "bi bi-info-circle", "General Information"],
              ["academic", "bi bi-mortarboard", "Academic Settings"],
              ["tuition", "bi bi-cash-stack", "Tuition Settings"],
              ["notifications", "bi bi-bell", "Notifications & Alerts"],
            ] as const).map(([tab, icon, label]) => (
              <li className="nav-item" role="presentation" key={tab}>
                <button type="button" role="tab"
                  className={`nav-link ${activeTab === tab ? "active fw-bold text-primary border-bottom border-primary border-3" : "text-secondary"}`}
                  aria-selected={activeTab === tab}
                  onClick={() => changeTab(tab)}>
                  <i className={`${icon} me-2`} />{label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-body p-4 bg-white">
          {loading ? (
            <div className="text-center py-5 text-muted">
              <div className="spinner-border text-primary mb-3" role="status" />
              <p>Loading settings from database...</p>
            </div>
          ) : loadError ? (
            <div className="text-center py-4 text-muted">
              Sample data is not displayed when Backend encounters an error.
            </div>
          ) : (
            <div className="tab-content">
              {activeTab === "general" && (
                <div className="tab-pane fade show active">
                  <div className="settings-section mb-4">
                    <div className="settings-section-header mb-3 pb-2 border-bottom">
                      <h5 className="fw-bold text-dark">General Information</h5>
                      <p className="text-muted small">Data is loaded and saved via the center_settings table.</p>
                    </div>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Center Name *</label>
                        <input className="form-control" value={form.centerName}
                          onChange={e => setField("centerName", e.target.value)} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Phone Number</label>
                        <input className="form-control" value={form.centerHotline}
                          onChange={e => setField("centerHotline", e.target.value)} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Email</label>
                        <input className="form-control" type="email" value={form.centerEmail}
                          onChange={e => setField("centerEmail", e.target.value)} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Center Logo</label>
                        <div className="form-control text-muted bg-light">
                          Not supported: Backend currently does not have a logo upload API.
                        </div>
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-bold">Headquarters Address</label>
                        <input className="form-control" value={form.centerAddress}
                          onChange={e => setField("centerAddress", e.target.value)} />
                      </div>
                    </div>
                  </div>
                  {saveButton("general")}
                </div>
              )}

              {activeTab === "academic" && (
                <div className="tab-pane fade show active">
                  <div className="settings-section mb-4">
                    <div className="settings-section-header mb-3 pb-2 border-bottom">
                      <h5 className="fw-bold text-dark">Academic Settings</h5>
                    </div>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Current Academic Year *</label>
                        <input className="form-control" value={form.academicYear}
                          placeholder="e.g. 2026 - 2027"
                          onChange={e => setField("academicYear", e.target.value)} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Default Class Status *</label>
                        <select className="form-select" value={form.defaultClassStatus}
                          onChange={e => setField("defaultClassStatus", e.target.value)}>
                          <option value="">Select status...</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-bold">Operating Grades at Center</label>
                        <div className="d-flex flex-wrap gap-4 p-3 bg-light rounded border">
                          {GRADE_OPTIONS.map(grade => (
                            <label className="form-check-label d-flex align-items-center gap-2" key={grade}>
                              <input className="form-check-input" type="checkbox"
                                checked={form.operatingGrades.includes(grade)}
                                onChange={e => toggleGrade(grade, e.target.checked)} />
                              Class {grade}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  {saveButton("academic")}
                </div>
              )}

              {activeTab === "tuition" && (
                <div className="tab-pane fade show active">
                  <div className="settings-section mb-4">
                    <div className="settings-section-header mb-3 pb-2 border-bottom">
                      <h5 className="fw-bold text-dark">Tuition &amp; Billing Settings</h5>
                    </div>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Tuition Cycle *</label>
                        <select className="form-select" value={form.tuitionCycle}
                          onChange={e => setField("tuitionCycle", e.target.value)}>
                          <option value="">Select cycle...</option>
                          <option value="Monthly">Monthly</option>
                          <option value="Quarterly">Quarterly</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Monthly Tuition Due Day *</label>
                        <select className="form-select" value={form.tuitionDueDay}
                          onChange={e => setField("tuitionDueDay", e.target.value)}>
                          <option value="">Select day...</option>
                          {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                            <option key={day} value={day}>Day {day} of each month</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <p className="small text-muted mt-3 mb-0">
                      Saves cycle and due day in configuration; automated recurring invoice generation is not yet implemented.
                    </p>
                  </div>
                  {saveButton("tuition")}
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="tab-pane fade show active">
                  <div className="settings-section mb-4">
                    <div className="settings-section-header mb-3 pb-2 border-bottom">
                      <h5 className="fw-bold text-dark">System Alerts &amp; Notifications</h5>
                      <p className="text-muted small">
                        Preferences are saved to database. Automated scheduled jobs are not yet connected to these options.
                      </p>
                    </div>
                    <div className="d-flex flex-column gap-3">
                      {([
                        ["tuitionReminder", "tuitionReminderSwitch", "Tuition Due Reminder"],
                        ["absenceAlert", "absenceAlertSwitch", "Student Absence Alert"],
                        ["gradeNotification", "gradeNotificationSwitch", "Exam Grade Notification"],
                      ] as const).map(([key, id, label]) => (
                        <div className="form-check form-switch" key={key}>
                          <input className="form-check-input" type="checkbox" id={id}
                            checked={form[key]} onChange={e => setField(key, e.target.checked)} />
                          <label className="form-check-label fw-bold" htmlFor={id}>{label}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  {saveButton("notifications")}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
