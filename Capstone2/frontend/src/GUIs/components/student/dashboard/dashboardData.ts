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
    label: 'Tổng số lớp đang học',
    value: 6,
    icon: 'bi-journal-bookmark-fill',
    bgColor: '#EFF6FF',
    color: '#2563EB',
  },
  {
    id: 'assignments',
    label: 'Bài tập sắp hết hạn',
    value: 2,
    badge: 'Sắp hết hạn',
    icon: 'bi-clock-fill',
    bgColor: '#FFFBEB',
    color: '#D97706',
  },
];
