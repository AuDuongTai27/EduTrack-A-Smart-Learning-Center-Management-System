import React from 'react';
import { DASHBOARD_STATS, type DashboardStatItem } from './dashboardData';

export interface DashboardStatsGridProps {
  enrolledClassesCount?: number;
  pendingAssignmentsCount?: number;
}

export function DashboardStatsGrid({
  enrolledClassesCount,
  pendingAssignmentsCount,
}: DashboardStatsGridProps) {
  const stats: DashboardStatItem[] = DASHBOARD_STATS.map((stat) => {
    if (stat.id === 'classes' && typeof enrolledClassesCount === 'number') {
      return { ...stat, value: enrolledClassesCount };
    }
    if (stat.id === 'assignments' && typeof pendingAssignmentsCount === 'number') {
      return {
        ...stat,
        value: pendingAssignmentsCount,
        badge: pendingAssignmentsCount > 0 ? 'Sắp hết hạn' : 'Đã hoàn thành',
      };
    }
    return stat;
  });

  return (
    <div className="stats-grid">
      {stats.map((stat) => (
        <div key={stat.id} className="stat-card">
          <div
            className="stat-icon-wrapper"
            style={{ backgroundColor: stat.bgColor, color: stat.color }}
          >
            <i className={`bi ${stat.icon}`}></i>
          </div>
          <div className="stat-info">
            <p className="stat-label">{stat.label}</p>
            <div className="stat-value-group">
              <span className="stat-number" style={{ color: stat.color }}>
                {stat.value}
              </span>
              {stat.badge && (
                <span className="stat-due-badge">{stat.badge}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default DashboardStatsGrid;
