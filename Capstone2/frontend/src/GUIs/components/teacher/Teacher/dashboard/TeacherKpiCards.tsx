import TeachingDashboardKpis from "../../shared/TeachingDashboardKpis";

export interface TeacherKpiCardsProps {
  /** Count of currently active assignments */
  activeAssignments?: number;
  /** Count of assignments due today */
  assignmentsDueToday?: number;
  /** Count of currently active classes */
  activeClasses?: number;
  /** Count of classes scheduled for today */
  classesToday?: number;
  /** Total students across assigned classes */
  totalStudents?: number;
  /** Pending attendance sessions count */
  pendingAttendance?: number;
}

export function TeacherKpiCards(props: TeacherKpiCardsProps) {
  return <TeachingDashboardKpis {...props} classTitle="Assigned Classes" />;
}

export default TeacherKpiCards;
