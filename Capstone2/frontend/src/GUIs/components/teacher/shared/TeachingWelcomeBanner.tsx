import teacherIllustration from '../../../../assets/illustrations/academy-books-cap.svg';
import assistantIllustration from '../../../../assets/illustrations/staff-welcome.svg';
import { useEffect, useState } from 'react';
import { CENTER_TIME_ZONE, centerDateKey } from '../../../../BLL/services/adminStaffDashboardService';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: CENTER_TIME_ZONE,
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
});

export default function TeachingWelcomeBanner({ greeting, name, message, role }: {
  greeting: string; name?: string; message?: string; role: 'teacher' | 'assistant';
}) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let timer: number;
    // Align with minute boundaries, including midnight in the center's timezone.
    const schedule = () => {
      timer = window.setTimeout(() => {
        setNow(new Date());
        schedule();
      }, 60_000 - (Date.now() % 60_000));
    };
    const refresh = () => {
      setNow(new Date());
      window.clearTimeout(timer);
      schedule();
    };
    schedule();
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

  return <div className="card dashboard-welcome teaching-welcome mb-4 border-0">
    <div className="card-body d-flex align-items-center justify-content-between">
      <div className="cm-welcome-copy">
        <h3 className="welcome-title text-white mb-2 fw-bold">{greeting} {name}</h3>
        <p className="welcome-text text-white mb-0">{message}</p>
      </div>
      <time className="welcome-date teaching-welcome-date text-white rounded-pill" dateTime={centerDateKey(now)}>
        <i className="bi bi-calendar3 me-2" aria-hidden="true" />
        {dateFormatter.format(now)}
      </time>
      <div className="cm-welcome-aside">
        <img className="cm-welcome-illustration" src={role === 'teacher' ? teacherIllustration : assistantIllustration} alt="" aria-hidden="true" />
      </div>
    </div>
  </div>;
}
