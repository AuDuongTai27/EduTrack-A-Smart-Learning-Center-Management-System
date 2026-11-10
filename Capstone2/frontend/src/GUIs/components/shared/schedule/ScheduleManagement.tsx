import { useEffect, useRef, useState, type FormEvent } from 'react';
import type {
  ScheduleCapabilities,
  ScheduleGenerationInput,
  ScheduleGenerationPreview,
  ScheduleTemplate,
  ScheduleTemplateInput,
  ScheduleTemplatePreview,
} from '../../../../BLL/models/ScheduleManagement';
import { scheduleManagementDAL as api } from '../../../../DAL/scheduleManagementDAL';
import { addScheduleDays, vietnamClock } from '../../../../BLL/services/scheduleViewService';
import { useSelectedUser } from '../../../hooks/useSelectedUser';

const days = [
  ['Monday', 'Thứ Hai'],
  ['Tuesday', 'Thứ Ba'],
  ['Wednesday', 'Thứ Tư'],
  ['Thursday', 'Thứ Năm'],
  ['Friday', 'Thứ Sáu'],
  ['Saturday', 'Thứ Bảy'],
  ['Sunday', 'Chủ Nhật'],
];

const outcomes: Record<string, string> = {
  eligible: 'Hợp lệ (Sẽ tạo mới)',
  existing: 'Đã có sẵn (Giữ nguyên)',
  conflict: 'Xung đột lịch',
  outside_class: 'Ngoài thời gian khóa học',
  created: 'Đã tạo thành công',
};

const errorText = (cause: unknown) =>
  cause instanceof Error ? cause.message : 'Không thực hiện được yêu cầu. Vui lòng tải lại.';

const emptyForm = () => ({
  dayOfWeek: 'Monday',
  startTime: '18:00',
  endTime: '20:00',
  room: '',
  effectiveFrom: '',
});

const dayLabel = (value: string) => days.find(([key]) => key === value)?.[1] || value;

export function ScheduleManagement({
  onCreated,
  initialClassId,
  onClose,
}: {
  onCreated: () => void;
  initialClassId?: number;
  onClose?: () => void;
}) {
  const { user } = useSelectedUser();
  return (
    <ManagementPanel
      key={`${user?.userId ?? 'anonymous'}:${initialClassId ?? 'all'}`}
      onCreated={onCreated}
      initialClassId={initialClassId}
      onClose={onClose}
    />
  );
}

function ManagementPanel({
  onCreated,
  initialClassId,
  onClose,
}: {
  onCreated: () => void;
  initialClassId?: number;
  onClose?: () => void;
}) {
  const [capabilities, setCapabilities] = useState<ScheduleCapabilities | null>(null);
  const [classId, setClassId] = useState(initialClassId ? String(initialClassId) : '');
  const [templates, setTemplates] = useState<ScheduleTemplate[] | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reload, setReload] = useState(0);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const mounted = useRef(true);

  // Tab state: 'templates' | 'month'
  const [activeTab, setActiveTab] = useState<'templates' | 'month'>('templates');

  // Template Form State
  const [editing, setEditing] = useState<ScheduleTemplate | null>(null);
  const [operation, setOperation] = useState<ScheduleTemplateInput['operation']>('create');
  const [form, setForm] = useState(emptyForm);
  const [templatePreview, setTemplatePreview] = useState<{
    input: ScheduleTemplateInput;
    result: ScheduleTemplatePreview;
  } | null>(null);

  // Month Generation State
  const [month, setMonth] = useState(() => vietnamClock().date.slice(0, 7));
  const [preview, setPreview] = useState<{
    input: ScheduleGenerationInput;
    result: ScheduleGenerationPreview;
    keys: string[];
  } | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    const abort = new AbortController();
    api
      .capabilities(abort.signal)
      .then((data) => {
        if (!abort.signal.aborted) setCapabilities(data);
      })
      .catch((cause) => {
        if (!abort.signal.aborted) setError(errorText(cause));
      });
    return () => abort.abort();
  }, [reload]);

  useEffect(() => {
    if (!classId) return;
    const abort = new AbortController();
    api
      .templates(Number(classId), abort.signal)
      .then((data) => {
        if (!abort.signal.aborted) setTemplates(data);
      })
      .catch((cause) => {
        if (!abort.signal.aborted) setError(errorText(cause));
      });
    return () => abort.abort();
  }, [classId, reload]);

  function invalidate() {
    setPreview(null);
    setTemplatePreview(null);
    setConfirmed(false);
    setNotice('');
    setError('');
  }

  function selectClass(value: string) {
    setClassId(value);
    setTemplates(null);
    setEditing(null);
    setOperation('create');
    setForm(emptyForm());
    invalidate();
  }

  function changeForm(key: keyof typeof form, value: string) {
    setForm((previous) => ({ ...previous, [key]: value }));
    invalidate();
  }

  async function run(action: () => Promise<void>) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await action();
    } catch (cause) {
      if (mounted.current) setError(errorText(cause));
    } finally {
      pending.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  function refreshTemplates() {
    setTemplates(null);
    setEditing(null);
    setOperation('create');
    setForm(emptyForm());
    setTemplatePreview(null);
    setPreview(null);
    setReload((value) => value + 1);
  }

  function beginChange(root: ScheduleTemplate, action: 'replace' | 'retire') {
    const last = root.versions.at(-1)!;
    const from = [
      capabilities!.earliestEffectiveFrom,
      last.effectiveTo || addScheduleDays(last.effectiveFrom, 7),
    ]
      .sort()
      .at(-1)!;
    setEditing(root);
    setOperation(action);
    setForm({
      dayOfWeek: last.dayOfWeek,
      startTime: last.startTime.slice(0, 5),
      endTime: last.endTime.slice(0, 5),
      room: last.room || '',
      effectiveFrom: from,
    });
    invalidate();
  }

  async function handlePreviewTemplate(event: FormEvent) {
    event.preventDefault();
    setTemplatePreview(null);
    if (operation !== 'retire' && (!form.startTime || !form.endTime || form.startTime >= form.endTime)) {
      setError('Giờ bắt đầu phải trước giờ kết thúc.');
      return;
    }
    const input: ScheduleTemplateInput = {
      classId: Number(classId),
      operation,
      ...form,
      effectiveFrom: form.effectiveFrom || capabilities!.earliestEffectiveFrom,
      room: form.room.trim() || null,
      ...(editing ? { scheduleId: editing.scheduleId, version: editing.version } : {}),
    };
    await run(async () => {
      const result = await api.previewTemplate(input);
      if (mounted.current) setTemplatePreview({ input, result });
    });
  }

  async function handleBuildMonthPreview(event: FormEvent) {
    event.preventDefault();
    setPreview(null);
    setConfirmed(false);
    const input: ScheduleGenerationInput = {
      classId: Number(classId),
      mode: 'month',
      year: Number(month.slice(0, 4)),
      month: Number(month.slice(5, 7)),
    };
    await run(async () => {
      const result = await api.preview(input);
      if (mounted.current) {
        setPreview({
          input,
          result,
          keys: result.rows.filter((r) => r.outcome === 'eligible').map((r) => r.key),
        });
      }
    });
  }

  const selectedClass = capabilities?.classes.find((c) => String(c.classId) === classId);
  const canManage = capabilities?.canManageTemplates === true;
  const canCreate = capabilities?.canCreateSessions === true;

  const content = (
    <div className="schedule-management-inner">
      {/* Notifications / Alerts */}
      {error && (
        <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3" role="alert">
          <i className="bi bi-exclamation-triangle-fill flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {notice && (
        <div className="alert alert-success py-2 small d-flex align-items-center gap-2 mb-3" role="status">
          <i className="bi bi-check-circle-fill flex-shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {!capabilities ? (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
          Đang tải dữ liệu lớp và phân quyền hệ thống…
        </div>
      ) : (
        <>
          {/* Quick class switch if not locked */}
          {!initialClassId && (
            <div className="mb-3 p-3 bg-light rounded-3 border">
              <label className="form-label small fw-semibold text-secondary mb-1">
                <i className="bi bi-mortarboard me-1" />
                Chọn Lớp Học Cần Quản Lý:
              </label>
              <select
                aria-label="Chọn Lớp Học"
                className="form-select form-select-sm"
                value={classId}
                disabled={busy}
                onChange={(e) => selectClass(e.target.value)}
              >
                <option value="">-- Vui lòng chọn lớp học --</option>
                {capabilities.classes.map((c) => (
                  <option key={c.classId} value={c.classId}>
                    #{c.classId} · {c.className}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!selectedClass ? (
            <div className="text-center py-4 text-muted border rounded-3 bg-light">
              <i className="bi bi-arrow-up-circle fs-3 d-block mb-1 text-primary" />
              Vui lòng chọn một lớp học ở trên để quản lý ca học và xếp lịch tự động.
            </div>
          ) : (
            <>
              {/* Class Header Banner */}
              <div className="p-3 bg-primary-subtle text-primary-emphasis rounded-3 border border-primary-subtle mb-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div>
                  <h6 className="fw-bold mb-1 text-dark">
                    <i className="bi bi-journal-check me-2 text-primary" />
                    Lớp: {selectedClass.className}
                  </h6>
                  <small className="text-muted">
                    Thời gian khóa học: <strong>{selectedClass.startDate}</strong> →{' '}
                    <strong>{selectedClass.endDate || 'Chưa định ngày kết thúc'}</strong>
                  </small>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  disabled={busy}
                  onClick={() => {
                    invalidate();
                    refreshTemplates();
                  }}
                >
                  <i className="bi bi-arrow-clockwise me-1" />
                  Làm mới
                </button>
              </div>

              {/* TABS NAVIGATION */}
              <ul className="nav nav-pills nav-fill mb-3 p-1 bg-light rounded-3 border">
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link fw-semibold d-flex align-items-center justify-content-center gap-2 ${
                      activeTab === 'templates' ? 'active shadow-sm' : 'text-secondary'
                    }`}
                    onClick={() => {
                      setActiveTab('templates');
                      invalidate();
                    }}
                  >
                    <i className="bi bi-calendar-week" />
                    1. Ca Học Cố Định Hàng Tuần
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link fw-semibold d-flex align-items-center justify-content-center gap-2 ${
                      activeTab === 'month' ? 'active shadow-sm' : 'text-secondary'
                    }`}
                    onClick={() => {
                      setActiveTab('month');
                      invalidate();
                    }}
                  >
                    <i className="bi bi-calendar-check" />
                    2. Tự Động Xếp Lịch Cả Tháng
                  </button>
                </li>
              </ul>

              {/* TAB 1: CA HỌC CỐ ĐỊNH HÀNG TUẦN */}
              {activeTab === 'templates' && (
                <div className="schedule-tab-templates">
                  <div className="mb-3">
                    <h6 className="fw-bold text-dark mb-1">Các Ca Học Cố Định Hiện Có:</h6>
                    <small className="text-muted d-block mb-3">
                      Đây là các khung giờ học định kỳ hàng tuần. Khi bạn tạo lịch theo tháng ở Tab 2, hệ thống sẽ tự động điền các buổi học theo đúng những ca này.
                    </small>

                    {!templates ? (
                      <div className="text-center py-3 text-muted">
                        <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                        Đang tải danh sách ca học…
                      </div>
                    ) : templates.length === 0 ? (
                      <div className="p-3 text-center border rounded-3 bg-light text-muted mb-3">
                        <i className="bi bi-calendar-x fs-3 d-block mb-1 text-secondary" />
                        Lớp này hiện chưa có ca học cố định nào. Vui lòng thiết lập ở form bên dưới.
                      </div>
                    ) : (
                      <div className="row g-2 mb-3">
                        {templates.map((s) => {
                          const isRetiring = s.versions.at(-1)?.effectiveTo !== null;
                          return (
                            <div key={s.scheduleId} className="col-12 col-md-6">
                              <div className="border rounded-3 p-3 bg-white h-100 shadow-xs">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <span className="badge bg-primary fs-6 px-2 py-1">
                                    {dayLabel(s.dayOfWeek)}
                                  </span>
                                  {isRetiring ? (
                                    <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                                      Ngừng từ {s.versions.at(-1)?.effectiveTo}
                                    </span>
                                  ) : (
                                    <span className="badge bg-success-subtle text-success border border-success-subtle">
                                      Đang áp dụng
                                    </span>
                                  )}
                                </div>
                                <div className="fs-5 fw-bold text-dark mb-1">
                                  <i className="bi bi-clock me-2 text-primary" />
                                  {s.startTime.slice(0, 5)} – {s.endTime.slice(0, 5)}
                                </div>
                                <div className="text-muted small mb-2">
                                  <i className="bi bi-geo-alt me-1 text-danger" />
                                  Phòng học: <strong>{s.room || 'Chưa xếp phòng'}</strong>
                                </div>
                                <div className="small text-muted mb-2">
                                  Hiệu lực từ: <strong>{s.versions.at(-1)?.effectiveFrom}</strong>
                                </div>

                                {canManage && !isRetiring && (
                                  <div className="d-flex gap-2 pt-2 border-top mt-2">
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                                      disabled={busy}
                                      onClick={() => beginChange(s, 'replace')}
                                    >
                                      <i className="bi bi-pencil-square" />
                                      Đổi giờ / phòng
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
                                      disabled={busy}
                                      onClick={() => beginChange(s, 'retire')}
                                    >
                                      <i className="bi bi-slash-circle" />
                                      Ngừng ca này
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* FORM THÊM / CẬP NHẬT CA HỌC */}
                  {canManage && (
                    <div className="card border rounded-3 p-3 bg-light shadow-xs">
                      <div className="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom">
                        <h6 className="fw-bold mb-0 text-dark">
                          {operation === 'retire'
                            ? `Ngừng áp dụng Ca học #${editing?.scheduleId}`
                            : editing
                            ? `Cập nhật khung giờ mới cho Ca học #${editing.scheduleId}`
                            : 'Thêm Ca Học Định Kỳ Mới'}
                        </h6>
                        {editing && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => {
                              setEditing(null);
                              setOperation('create');
                              setForm(emptyForm());
                              invalidate();
                            }}
                          >
                            Hủy sửa, tạo ca mới
                          </button>
                        )}
                      </div>

                      <form onSubmit={handlePreviewTemplate}>
                        <fieldset disabled={busy}>
                          <div className="row g-2 mb-3">
                            {operation !== 'retire' && (
                              <>
                                <div className="col-12 col-md-3">
                                  <label className="form-label small fw-semibold mb-1">Thứ trong tuần</label>
                                  <select
                                    aria-label="Thứ trong tuần"
                                    className="form-select form-select-sm"
                                    value={form.dayOfWeek}
                                    onChange={(e) => changeForm('dayOfWeek', e.target.value)}
                                  >
                                    {days.map(([key, label]) => (
                                      <option key={key} value={key}>
                                        {label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="col-6 col-md-2">
                                  <label className="form-label small fw-semibold mb-1">Bắt đầu</label>
                                  <input
                                    type="time"
                                    className="form-control form-control-sm"
                                    required
                                    value={form.startTime}
                                    onChange={(e) => changeForm('startTime', e.target.value)}
                                  />
                                </div>
                                <div className="col-6 col-md-2">
                                  <label className="form-label small fw-semibold mb-1">Kết thúc</label>
                                  <input
                                    type="time"
                                    className="form-control form-control-sm"
                                    required
                                    value={form.endTime}
                                    onChange={(e) => changeForm('endTime', e.target.value)}
                                  />
                                </div>
                                <div className="col-12 col-md-2">
                                  <label className="form-label small fw-semibold mb-1">Phòng học</label>
                                  <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    maxLength={50}
                                    placeholder="VD: Phòng 201"
                                    value={form.room}
                                    onChange={(e) => changeForm('room', e.target.value)}
                                  />
                                </div>
                              </>
                            )}

                            <div className="col-12 col-md-3">
                              <label className="form-label small fw-semibold mb-1">
                                Áp dụng từ Thứ Hai tuần:
                              </label>
                              <input
                                type="date"
                                className="form-control form-control-sm"
                                required
                                min={capabilities.earliestEffectiveFrom}
                                step={7}
                                value={form.effectiveFrom || capabilities.earliestEffectiveFrom}
                                onChange={(e) => changeForm('effectiveFrom', e.target.value)}
                              />
                            </div>
                          </div>

                          <button type="submit" className="btn btn-sm btn-primary" disabled={busy}>
                            <i className="bi bi-eye me-1" />
                            {busy ? 'Đang kiểm tra…' : 'Xem trước & Áp dụng'}
                          </button>
                        </fieldset>
                      </form>

                      {/* TEMPLATE PREVIEW BOX */}
                      {templatePreview && (
                        <div className="mt-3 p-3 bg-white border border-primary rounded-3 shadow-xs">
                          <h6 className="fw-bold text-dark mb-1">
                            <i className="bi bi-check2-circle text-primary me-2" />
                            Xác nhận áp dụng {templatePreview.result.operation === 'retire' ? 'ngừng ca' : 'ca học cố định'} từ ngày {templatePreview.result.effectiveFrom}
                          </h6>
                          <p className="small text-muted mb-2">{templatePreview.result.message}</p>
                          {templatePreview.result.retainedSessions.length > 0 && (
                            <div className="alert alert-info py-2 small mb-2">
                              <i className="bi bi-shield-check me-1" />
                              Bảo lưu <strong>{templatePreview.result.retainedSessions.length}</strong> buổi học đã tạo trong quá khứ không bị ảnh hưởng.
                            </div>
                          )}
                          <div className="d-flex gap-2 mt-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              disabled={busy}
                              onClick={() =>
                                run(async () => {
                                  const result = await api.confirmTemplate({
                                    ...templatePreview.input,
                                    previewToken: templatePreview.result.previewToken,
                                  });
                                  if (!mounted.current) return;
                                  refreshTemplates();
                                  setNotice(
                                    `Đã lưu ${
                                      result.operation === 'retire' ? 'ngừng ca học' : 'ca học cố định mới'
                                    } thành công!`
                                  );
                                  onCreated();
                                })
                              }
                            >
                              <i className="bi bi-check-lg me-1" />
                              {busy ? 'Đang lưu…' : 'Xác nhận Lưu Ca Học'}
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => setTemplatePreview(null)}
                            >
                              Đóng
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: TỰ ĐỘNG XẾP LỊCH CẢ THÁNG */}
              {activeTab === 'month' && (
                <div className="schedule-tab-month">
                  <div className="p-3 bg-light rounded-3 border mb-3">
                    <h6 className="fw-bold text-dark mb-1">
                      <i className="bi bi-magic me-2 text-primary" />
                      Tự Động Điền Lịch Cho Cả Tháng
                    </h6>
                    <p className="small text-muted mb-3">
                      Hệ thống sẽ quét các ca học cố định ở Tab 1 và tự động xếp tất cả các buổi học trong tháng bạn chọn vào thời khóa biểu. Các buổi học đã tồn tại hoặc đã dời ngày sẽ được giữ nguyên an toàn.
                    </p>

                    {templates && templates.length === 0 ? (
                      <div className="alert alert-warning py-2 small" role="alert">
                        <i className="bi bi-exclamation-circle me-1" />
                        Lớp học chưa có ca học cố định nào. Vui lòng chuyển sang Tab 1 để thiết lập ca học trước khi xếp lịch tự động.
                      </div>
                    ) : (
                      <form onSubmit={handleBuildMonthPreview} className="row g-2 align-items-end">
                        <div className="col-12 col-md-4">
                          <label className="form-label small fw-semibold mb-1">Chọn Tháng &amp; Năm Cần Xếp Lịch</label>
                          <input
                            type="month"
                            className="form-control form-control-sm"
                            required
                            min="2020-01"
                            max="2035-12"
                            value={month}
                            onChange={(e) => {
                              setMonth(e.target.value);
                              invalidate();
                            }}
                          />
                        </div>
                        <div className="col-12 col-md-4">
                          <button type="submit" className="btn btn-sm btn-primary w-100" disabled={busy}>
                            <i className="bi bi-search me-1" />
                            {busy ? 'Đang kiểm tra lịch…' : 'Kiểm tra & Xem trước lịch tháng'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* PREVIEW KẾT QUẢ XẾP LỊCH THÁNG */}
                  {preview && (
                    <div className="card border rounded-3 p-3 bg-white shadow-xs mb-3">
                      <h6 className="fw-bold text-dark mb-2">
                        {confirmed ? 'Kết Quả Xác Nhận Xếp Lịch:' : `Xem Trước Lịch Học Tháng ${month}:`}
                      </h6>

                      {/* Summary Cards */}
                      <div className="row g-2 mb-3">
                        <div className="col-4">
                          <div className="p-2 border rounded-3 text-center bg-success-subtle border-success-subtle">
                            <span className="small text-success d-block fw-semibold">Sẽ Tạo Mới</span>
                            <strong className="fs-5 text-success">
                              {preview.result.rows.filter((r) => r.outcome === 'eligible').length} buổi
                            </strong>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="p-2 border rounded-3 text-center bg-info-subtle border-info-subtle">
                            <span className="small text-info-emphasis d-block fw-semibold">Đã Có Sẵn</span>
                            <strong className="fs-5 text-info-emphasis">
                              {preview.result.rows.filter((r) => r.outcome === 'existing').length} buổi
                            </strong>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="p-2 border rounded-3 text-center bg-light border">
                            <span className="small text-muted d-block fw-semibold">Khác/Xung Đột</span>
                            <strong className="fs-5 text-muted">
                              {
                                preview.result.rows.filter((r) => !['eligible', 'existing'].includes(r.outcome))
                                  .length
                              }
                            </strong>
                          </div>
                        </div>
                      </div>

                      {/* Danh sách các ngày sẽ học */}
                      <div className="mb-3">
                        <small className="text-muted fw-semibold d-block mb-1">
                          Danh sách các buổi học dự kiến trong tháng:
                        </small>
                        <div className="d-flex flex-wrap gap-1" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                          {preview.result.rows.map((r) => {
                            const isNew = r.outcome === 'eligible';
                            const isOld = r.outcome === 'existing';
                            const badgeBg = isNew
                              ? 'bg-success-subtle text-success border border-success-subtle'
                              : isOld
                              ? 'bg-info-subtle text-info-emphasis border border-info-subtle'
                              : 'bg-light text-muted border';
                            return (
                              <span key={r.key} className={`badge px-2 py-1 ${badgeBg} small`}>
                                <i className={`bi ${isNew ? 'bi-plus-circle' : isOld ? 'bi-check2' : 'bi-dash'} me-1`} />
                                {r.sessionDate} ({r.startTime.slice(0, 5)}–{r.endTime.slice(0, 5)})
                                {' · '}
                                {outcomes[r.outcome] || r.outcome}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {!confirmed && (
                        <div className="d-flex flex-wrap gap-2 pt-2 border-top">
                          <button
                            type="button"
                            className="btn btn-success fw-semibold px-4"
                            disabled={busy || preview.keys.length === 0}
                            onClick={() =>
                              run(async () => {
                                const result = await api.confirm({
                                  ...preview.input,
                                  previewToken: preview.result.previewToken,
                                  selectedKeys: preview.keys,
                                });
                                if (!mounted.current) return;
                                setPreview({ ...preview, result });
                                setConfirmed(true);
                                setNotice(
                                  `Đã tạo thành công ${result.created} buổi học cho tháng ${month}!`
                                );
                                onCreated();
                              })
                            }
                          >
                            <i className="bi bi-calendar-check me-2" />
                            {busy
                              ? 'Đang tạo phiên học…'
                              : `Xác nhận tạo ${preview.keys.length} buổi học`}
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            disabled={busy}
                            onClick={() => setPreview(null)}
                          >
                            Đóng xem trước
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );

  // If onClose is provided, render inside a modal dialog
  if (onClose) {
    return (
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-header bg-light border-bottom">
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-primary fs-6">
                  <i className="bi bi-gear-fill me-1" />
                  Cấu hình lịch
                </span>
                <h5 className="modal-title fw-bold mb-0 text-dark">
                  Quản Lý Lịch Cố Định &amp; Xếp Lịch Theo Tháng
                </h5>
              </div>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body p-4">{content}</div>
            <div className="modal-footer bg-light">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standalone panel
  return (
    <div className="schedule-management border rounded-4 bg-white p-3 mb-3" aria-label="Quản lý Schedule">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
        <h2 className="h5 mb-0">Lịch Cố Định &amp; Phiên Học</h2>
      </div>
      {content}
    </div>
  );
}
