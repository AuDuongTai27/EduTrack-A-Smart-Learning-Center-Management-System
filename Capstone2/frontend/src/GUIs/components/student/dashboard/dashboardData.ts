export interface DashboardStatItem {
  id: string;
  label: string;
  value: number | string;
  badge?: string;
  icon: string;
  bgColor: string;
  color: string;
}

export const DASHBOARD_STATS: DashboardStatItem[] = [
  {
    id: 'classes',
    label: 'Total Active Classes',
    value: 6,
    icon: 'bi-journal-bookmark-fill',
    bgColor: '#EFF6FF',
    color: '#2563EB',
  },
  {
    id: 'assignments',
    label: 'Assignments Due Soon',
    value: 2,
    badge: 'Due Soon',
    icon: 'bi-clock-fill',
    bgColor: '#FFFBEB',
    color: '#D97706',
  },
];
