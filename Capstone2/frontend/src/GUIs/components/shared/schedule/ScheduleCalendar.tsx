import type {ScheduleSession} from '../../../../BLL/models/ScheduleSession';
import {ScheduleTimetableCard} from '../../student/schedule/ScheduleTimetableCard';

// Compatibility export: all official actors use the original teammate timetable renderer.
export function ScheduleCalendar(props: {sessions: ScheduleSession[]; monday: string; now: Date;
  onOpen: (session: ScheduleSession) => void; partner?: 'teacher' | 'ta'}) {
  return <ScheduleTimetableCard official={props} />;
}
