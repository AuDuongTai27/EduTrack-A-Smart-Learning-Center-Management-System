import React from 'react';
import type { SessionSlot } from '../scheduleData';
import { fmtTime } from '../scheduleData';

export interface ScheduleSessionCardProps {
  session: SessionSlot;
  topPx: number;
  heightPx: number;
  isCompact: boolean;
  statusCls: string;
}

export function ScheduleSessionCard({
  session: s,
  topPx,
  heightPx,
  isCompact,
  statusCls,
}: ScheduleSessionCardProps) {
  return (
    <div
      className={`session-card ${statusCls}`}
      style={{ top: `${topPx}px`, height: `${heightPx}px` }}
      title={`${s.className} — ${s.subject} (${fmtTime(s.startH, s.startM)}—${fmtTime(s.endH, s.endM)})`}
    >
      <div className="session-card-time">
        {fmtTime(s.startH, s.startM)} — {fmtTime(s.endH, s.endM)}
      </div>
      <div className="session-card-title">
        {s.className} — {s.subject}
      </div>
      {!isCompact && (
        <div className="session-card-footer">
          <div className="session-card-teacher">
            <div
              className="session-teacher-avatar"
              style={{ backgroundColor: s.avatarBg }}
            >
              {s.initials}
            </div>
            <span>{s.teacher}</span>
          </div>
          <div className="session-card-room">{s.room}</div>
        </div>
      )}
    </div>
  );
};

export default ScheduleSessionCard;
