import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../../components/Common/PageHeader';
import { ScheduleWorkspace } from '../../../components/shared/schedule/ScheduleWorkspace';
import { scheduleManagementDAL } from '../../../../DAL/scheduleManagementDAL';
import type { ScheduleCapabilities, ScheduleClassOption } from '../../../../BLL/models/ScheduleManagement';
import { useSelectedUser } from '../../../hooks/useSelectedUser';

export default function ManagementSchedulePage({role}: {role: 'center-manager' | 'admin-staff'}) {
  const { user } = useSelectedUser();
  const [capabilities, setCapabilities] = useState<ScheduleCapabilities | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'upcoming'>('all');

  useEffect(() => {
    const abort = new AbortController();
    setLoading(true);
    setError('');
    scheduleManagementDAL
      .capabilities(abort.signal)
      .then((data) => {
        if (!abort.signal.aborted) {
          setCapabilities(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!abort.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Không tải được danh sách lớp học.');
          setLoading(false);
        }
      });
    return () => abort.abort();
  }, [user?.userId, reload]);

  const classes = useMemo(() => capabilities?.classes ?? [], [capabilities]);

  const filteredClasses = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return classes.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (!q) return true;
      const teacherNames = (c.teachers ?? []).map((t) => t.name).join(' ').toLowerCase();
      const taNames = (c.teachingAssistants ?? []).map((t) => t.name).join(' ').toLowerCase();
      return (
        c.className.toLowerCase().includes(q) ||
        String(c.classId).includes(q) ||
        (c.subjectName ?? '').toLowerCase().includes(q) ||
        (c.room ?? '').toLowerCase().includes(q) ||
        teacherNames.includes(q) ||
        taNames.includes(q)
      );
    });
  }, [classes, searchTerm, statusFilter]);

  const selectedClass: ScheduleClassOption | undefined = useMemo(
    () => classes.find((c) => c.classId === selectedClassId),
    [classes, selectedClassId]
  );

  return (
    <>
      <PageHeader
        title="Quản lý Lịch học theo Lớp"
        breadcrumbItems={[
          { label: role === 'center-manager' ? 'Center Manager' : 'Admin Staff', path: `/${role}/dashboard` },
          { label: 'Lịch học trung tâm' },
          ...(selectedClass ? [{ label: selectedClass.className }] : []),
        ]}
      />

      {loading && !capabilities ? (
        <div className="p-5 text-center bg-white rounded-4 border shadow-sm my-3">
          <div className="spinner-border text-primary mb-2" role="status" />
          <p className="text-muted mb-0">Đang tải danh sách lớp học của trung tâm…</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger d-flex align-items-center justify-content-between rounded-4 my-3" role="alert">
          <span>{error}</span>
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setReload((r) => r + 1)}>
            Thử lại
          </button>
        </div>
      ) : !selectedClass ? (
        /* BƯỚC 1: CHƯA CHỌN LỚP -> CHỈ HIỆN DANH SÁCH LỚP ĐỂ CHỌN, KHÔNG HIỆN LỊCH */
        <section className="bg-white rounded-4 border shadow-sm p-4 mb-4" aria-label="Chọn lớp học để xem lịch">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 pb-3 border-bottom">
            <div>
              <h2 className="h5 fw-bold mb-1">
                <i className="bi bi-journal-bookmark-fill text-primary me-2" />
                Chọn lớp học để xem & điều chỉnh lịch
              </h2>
              <p className="text-muted small mb-0">
                Vui lòng chọn một lớp học bên dưới để xem thời khóa biểu chi tiết, dời buổi học sang ngày bất kỳ, xóa buổi nghỉ hoặc tạo buổi học bù.
              </p>
            </div>
            <div className="d-flex flex-wrap align-items-center gap-2">
              <div className="input-group input-group-sm" style={{ minWidth: 240 }}>
                <span className="input-group-text bg-light">
                  <i className="bi bi-search" />
                </span>
                <input
                  type="search"
                  className="form-control"
                  placeholder="Tìm tên lớp, môn, giáo viên, phòng…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                aria-label="Lọc trạng thái lớp"
                className="form-select form-select-sm"
                style={{ width: 'auto' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'upcoming')}
              >
                <option value="all">Tất cả trạng thái ({classes.length})</option>
                <option value="active">Đang học (Active)</option>
                <option value="upcoming">Sắp khai giảng (Upcoming)</option>
              </select>
            </div>
          </div>

          {filteredClasses.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-inbox fs-2 d-block mb-2" />
              Không tìm thấy lớp học nào phù hợp với bộ lọc.
            </div>
          ) : (
            <div className="row g-3">
              {filteredClasses.map((c) => {
                const teachers = (c.teachers ?? []).map((t) => t.name).join(', ') || 'Chưa phân công';
                const tas = (c.teachingAssistants ?? []).map((t) => t.name).join(', ') || 'Chưa phân công';
                const schedules = c.scheduleSummary ?? [];
                return (
                  <div key={c.classId} className="col-12 col-md-6 col-xl-4">
                    <div className="card h-100 border rounded-4 shadow-xs hover-shadow transition">
                      <div className="card-body d-flex flex-column justify-content-between p-3">
                        <div>
                          <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                            <div>
                              <span className="badge bg-light text-secondary border me-1">#{c.classId}</span>
                              {c.subjectName && (
                                <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                                  {c.subjectName}
                                </span>
                              )}
                            </div>
                            <span
                              className={
                                'badge rounded-pill ' +
                                (c.status === 'active'
                                  ? 'bg-success-subtle text-success border border-success-subtle'
                                  : 'bg-warning-subtle text-warning-emphasis border border-warning-subtle')
                              }
                            >
                              {c.status === 'active' ? 'Đang học' : 'Sắp mở'}
                            </span>
                          </div>

                          <h3 className="h6 fw-bold mb-2 text-dark">{c.className}</h3>

                          <div className="small text-muted mb-2">
                            <div className="mb-1">
                              <i className="bi bi-person-workspace me-1 text-primary" />
                              <strong>GV:</strong> {teachers}
                            </div>
                            <div className="mb-1">
                              <i className="bi bi-person-badge me-1 text-info" />
                              <strong>TA:</strong> {tas}
                            </div>
                            <div className="mb-1">
                              <i className="bi bi-geo-alt me-1 text-danger" />
                              <strong>Phòng mặc định:</strong> {c.room || 'Chưa xếp phòng'}
                            </div>
                            <div>
                              <i className="bi bi-calendar-range me-1 text-secondary" />
                              <strong>Khóa học:</strong> {c.startDate} → {c.endDate || 'Chưa định ngày kết thúc'}
                            </div>
                          </div>

                          <div className="bg-light rounded-3 p-2 mb-3 small">
                            <div className="fw-semibold text-secondary mb-1">
                              <i className="bi bi-clock-history me-1" />
                              Lịch cố định hàng tuần:
                            </div>
                            {schedules.length > 0 ? (
                              <ul className="list-unstyled mb-0 ps-2">
                                {schedules.map((line, idx) => (
                                  <li key={idx} className="text-dark">
                                    • {line}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-muted fst-italic">Chưa thiết lập ca cố định</span>
                            )}
                          </div>
                        </div>

                        <div className="d-flex align-items-center justify-content-between pt-2 border-top mt-auto">
                          <span className="small text-muted">
                            Đã xếp: <strong>{c.totalSessions ?? 0}</strong> buổi học
                          </span>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary fw-semibold px-3"
                            onClick={() => setSelectedClassId(c.classId)}
                          >
                            <i className="bi bi-calendar3 me-1" />
                            Xem & Sửa lịch
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        /* BƯỚC 2: ĐÃ CHỌN LỚP -> CHỈ GIỮ VỀ DANH SÁCH LỚP VÀ ĐỔI NHANH LỚP */
        <>
          <div className="bg-white rounded-4 border shadow-sm p-3 mb-3">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary fw-semibold d-inline-flex align-items-center gap-1"
                onClick={() => setSelectedClassId(null)}
              >
                <i className="bi bi-arrow-left" />
                Về danh sách lớp
              </button>

              <div className="d-flex align-items-center gap-2">
                <label className="small text-muted text-nowrap mb-0 fw-semibold" htmlFor="quickClassSwitch">
                  <i className="bi bi-arrow-left-right text-primary me-1" />
                  Đổi nhanh lớp:
                </label>
                <select
                  id="quickClassSwitch"
                  className="form-select form-select-sm"
                  style={{ width: 'auto', minWidth: 230 }}
                  value={selectedClass.classId}
                  onChange={(e) => setSelectedClassId(Number(e.target.value))}
                >
                  {classes.map((c) => (
                    <option key={c.classId} value={c.classId}>
                      #{c.classId} · {c.className}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <ScheduleWorkspace
            key={`${role}:${selectedClass.classId}`}
            role={role}
            lockedClassId={selectedClass.classId}
            defaultRoom={selectedClass.room}
            onSessionMutated={() => setReload((r) => r + 1)}
          />
        </>
      )}
    </>
  );
}
