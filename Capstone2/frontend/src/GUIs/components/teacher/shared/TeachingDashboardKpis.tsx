import type { TeacherKpiCardsProps } from '../Teacher/dashboard/TeacherKpiCards';

/** Display-only KPIs; supporting figures remain available in the dashboard data. */
export default function TeachingDashboardKpis({
  activeAssignments = 0, activeClasses = 0,
  totalStudents = 0, pendingAttendance = 0, classTitle,
}: TeacherKpiCardsProps & { classTitle: 'Assigned Classes' | 'Active Classes' }) {
  const cards = [
    { title: 'Active Assignments', value: activeAssignments, icon: 'bi-mortarboard-fill', color: 'primary' },
    { title: classTitle, value: activeClasses, icon: 'bi-collection-fill', color: 'info' },
    { title: 'My Students', value: totalStudents, icon: 'bi-people-fill', color: 'success' },
    { title: 'Pending Attendance', value: pendingAttendance, icon: 'bi-calendar-check-fill', color: 'warning' },
  ];
  return <div className="dashboard-kpis teacher-kpis mb-4">
    {cards.map(card => <div className={`card dashboard-kpi teaching-kpi--${card.color}`} key={card.title}>
      <div className="card-body">
        <i className={`bi ${card.icon} cm-kpi-watermark`} aria-hidden="true" />
        <div className="d-flex align-items-center justify-content-between">
          <div><p className="text-muted mb-1">{card.title}</p><h3 className={`mb-0${card.color === 'warning' ? ' text-warning' : ''}`}>{card.value}</h3></div>
          <div className={`kpi-icon bg-${card.color}-subtle text-${card.color}`}><i className={`bi ${card.icon}`} aria-hidden="true" /></div>
        </div>
      </div>
    </div>)}
  </div>;
}
