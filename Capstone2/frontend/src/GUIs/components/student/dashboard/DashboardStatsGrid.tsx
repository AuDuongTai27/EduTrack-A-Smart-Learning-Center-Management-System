import React from 'react';
import { DASHBOARD_STATS } from './dashboardData';

export function DashboardStatsGrid() {
  return (
    <div className="stats-grid">
      {DASHBOARD_STATS.map((stat) => (
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
};

export default DashboardStatsGrid;
