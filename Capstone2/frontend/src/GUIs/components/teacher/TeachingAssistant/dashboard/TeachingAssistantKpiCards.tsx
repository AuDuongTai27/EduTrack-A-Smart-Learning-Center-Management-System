import TeachingDashboardKpis from "../../shared/TeachingDashboardKpis";

export interface TeachingAssistantKpiCardsProps {
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

export function TeachingAssistantKpiCards(props: TeachingAssistantKpiCardsProps = {}) {
  return <TeachingDashboardKpis {...props} classTitle="Active Classes" />;
}

export default TeachingAssistantKpiCards;
