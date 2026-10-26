export interface TeachingAssistantKpiCardsProps {
  /** Count of currently active assignments */
  activeAssignments?: number;
  /** Count of assignments due today */
  assignmentsDueToday?: number;
  /** Count of currently active classes */
  activeClasses?: number;
  /** Count of classes scheduled for today */
  classesToday?: number;
}

export function TeachingAssistantKpiCards({
  activeAssignments = 10,
  assignmentsDueToday = 4,
  activeClasses = 6,
  classesToday = 3,
}: TeachingAssistantKpiCardsProps = {}) {
  return (
    <div className="dashboard-kpis teacher-kpis mb-4">
      {/* Active Assignments */}
      <div className="card dashboard-kpi border-0">
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <p className="text-muted mb-1">Bài tập đang mở</p>
              <h3 className="mb-0">{activeAssignments}</h3>
            </div>
            <div className="kpi-icon bg-primary-subtle text-primary">
              <i className="bi bi-mortarboard-fill" />
            </div>
          </div>
          <div className="border-top mt-3 pt-3">
            <span className="text-muted ms-1">{assignmentsDueToday} bài cần chấm / hỗ trợ hôm nay</span>
          </div>
        </div>
      </div>

      {/* Active Classes */}
      <div className="card dashboard-kpi border-0">
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <p className="text-muted mb-1">Lớp học phụ trách</p>
              <h3 className="mb-0">{activeClasses}</h3>
            </div>
            <div className="kpi-icon bg-info-subtle text-info">
              <i className="bi bi-collection-fill" />
            </div>
          </div>
          <div className="border-top mt-3 pt-3">
            <span className="text-muted">{classesToday} ca trực lớp hôm nay</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeachingAssistantKpiCards;
