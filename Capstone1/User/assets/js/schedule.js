/**
 * EduTrack - Schedule Timetable JavaScript Controller
 * All CSS class names aligned with style.css definitions.
 */

const GRID_START = 7;
const GRID_END   = 21;
const TOTAL_H    = GRID_END - GRID_START;  // 14 hours
const HOUR_PX    = 80;
const DAY_LABELS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];

/* Status → CSS class map (matches style.css .session-card-* rules) */
const STATUS_CLASS = {
  upcoming:  'session-card-upcoming',
  ongoing:   'session-card-ongoing',
  completed: 'session-card-completed',
  cancelled: 'session-card-cancelled',
};

const SESSIONS = [
  { id: 's1',  className: 'Lớp Toán A1', subject: 'Toán học',  startH: 15, startM: 0,  endH: 16, endM: 30, teacher: 'Nguyễn Văn An',   initials: 'NA', avatarBg: '#2563EB', room: 'P.A203', day: 0, status: 'upcoming'  },
  { id: 's2',  className: 'Lớp Văn B2',  subject: 'Ngữ văn',   startH: 9,  startM: 0,  endH: 10, endM: 30, teacher: 'Trần Thị Mai',    initials: 'TM', avatarBg: '#7C3AED', room: 'P.B105', day: 1, status: 'completed' },
  { id: 's3',  className: 'Lớp Toán A1', subject: 'Toán học',  startH: 14, startM: 0,  endH: 15, endM: 30, teacher: 'Nguyễn Văn An',   initials: 'NA', avatarBg: '#2563EB', room: 'P.A203', day: 1, status: 'completed' },
  { id: 's4',  className: 'Lớp Anh C1',  subject: 'Tiếng Anh', startH: 9,  startM: 30, endH: 11, endM: 0,  teacher: 'Lê Minh Tuấn',   initials: 'LT', avatarBg: '#0EA5E9', room: 'P.C302', day: 2, status: 'completed' },
  { id: 's5',  className: 'Lớp Lý A3',   subject: 'Vật lý',    startH: 17, startM: 0,  endH: 18, endM: 30, teacher: 'Phạm Thu Hà',    initials: 'PH', avatarBg: '#0D9488', room: 'P.D104', day: 3, status: 'upcoming'  },
  { id: 's6',  className: 'Lớp Hóa B1',  subject: 'Hóa học',   startH: 8,  startM: 0,  endH: 9,  endM: 30, teacher: 'Hoàng Văn Nam',  initials: 'HN', avatarBg: '#D97706', room: 'P.A101', day: 4, status: 'completed' },
  { id: 's7',  className: 'Lớp Toán A2', subject: 'Toán học',  startH: 15, startM: 0,  endH: 16, endM: 30, teacher: 'Nguyễn Văn An',   initials: 'NA', avatarBg: '#2563EB', room: 'P.A203', day: 4, status: 'ongoing'   },
  { id: 's8',  className: 'Lớp Sinh C2', subject: 'Sinh học',  startH: 10, startM: 0,  endH: 11, endM: 30, teacher: 'Vũ Thị Lan',     initials: 'VL', avatarBg: '#059669', room: 'P.B202', day: 5, status: 'upcoming'  },
  { id: 's9',  className: 'Lớp Sử D1',   subject: 'Lịch sử',   startH: 14, startM: 0,  endH: 15, endM: 30, teacher: 'Đặng Minh Khoa', initials: 'ĐK', avatarBg: '#DC2626', room: 'P.C401', day: 6, status: 'cancelled' },
  { id: 's10', className: 'Lớp Địa E1',  subject: 'Địa lý',    startH: 8,  startM: 30, endH: 10, endM: 0,  teacher: 'Bùi Thị Nga',    initials: 'BN', avatarBg: '#9333EA', room: 'P.E201', day: 3, status: 'completed' },
];

let weekOffset = 0;
/* Fixed reference date (matches the date shown in the screenshot) */
const TODAY_SRC = new Date('2026-08-15T15:20:00');

/* ── Helpers ─────────────────────────────────────────────────────── */
function getMonday(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const wd = x.getDay();
  x.setDate(x.getDate() - wd + (wd === 0 ? -6 : 1));
  return x;
}

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function pad2(n) { return String(n).padStart(2, '0'); }
function fmtDayMon(d) { return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}`; }
function fmtTime(h, m) { return `${pad2(h)}:${pad2(m)}`; }

/* ── Main render ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  const gridScroll          = document.getElementById('timetableGridScroll');
  const weekRangeText       = document.getElementById('weekRangeText');
  const dayHeaderRow        = document.getElementById('dayHeaderRow');
  const timeGutterCol       = document.getElementById('timeGutterCol');
  const timetableDaysCont   = document.getElementById('timetableDaysContainer');
  const nowTimeLine         = document.getElementById('nowTimeLine');
  const btnToday            = document.getElementById('btnWeekToday');
  const btnPrev             = document.getElementById('btnWeekPrev');
  const btnNext             = document.getElementById('btnWeekNext');

  /* ── 1. Render time gutter labels once (static) ──────────────── */
  if (timeGutterCol) {
    let html = '';
    for (let i = 0; i < TOTAL_H; i++) {
      // Uses CSS class: .time-hour-slot  (defined in style.css line ~1881)
      html += `<div class="time-hour-slot"><span>${pad2(GRID_START + i)}:00</span></div>`;
    }
    timeGutterCol.innerHTML = html;
  }

  /* ── 2. Full calendar render (called on week change) ─────────── */
  function renderCalendar() {
    const today  = new Date(TODAY_SRC.toDateString());
    const monday = addDays(getMonday(today), weekOffset * 7);
    const sunday = addDays(monday, 6);
    const days   = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
    const todayIdx = days.findIndex(d => d.toDateString() === today.toDateString());

    /* Week range label */
    if (weekRangeText) {
      weekRangeText.textContent = `${fmtDayMon(monday)} – ${fmtDayMon(sunday)}`;
    }

    /* ── Day header row ──────────────────────────────────────────
       CSS classes used:
         .day-header-corner  – empty spacer cell (style.css ~1805)
         .day-header-col     – each day column header
         .day-header-col.is-today
         .day-name-label     – weekday text (Thứ 2…)
         .day-num-bubble     – date number circle
    ─────────────────────────────────────────────────────────── */
    if (dayHeaderRow) {
      let html = '<div class="day-header-corner"></div>';
      days.forEach((date, i) => {
        const isToday = (i === todayIdx && weekOffset === 0);
        html += `
          <div class="day-header-col${isToday ? ' is-today' : ''}">
            <div class="day-name-label">${DAY_LABELS[i]}</div>
            <div class="day-num-bubble">${pad2(date.getDate())}</div>
          </div>`;
      });
      dayHeaderRow.innerHTML = html;
    }

    /* ── Day columns + sessions ──────────────────────────────────
       CSS classes used:
         .grid-day-col           – wrapper per day (position: relative)
         .grid-day-col.is-today  – today highlight
         .grid-hour-line         – horizontal hour divider lines
         .session-card           – base session card (position: absolute)
         .session-card-upcoming / ongoing / completed / cancelled
         .session-card-time      – time text
         .session-card-title     – class + subject
         .session-card-footer    – bottom row
         .session-card-teacher   – teacher avatar + name group
         .session-teacher-avatar – tiny avatar circle
         .session-card-room      – room label
    ─────────────────────────────────────────────────────────── */
    if (timetableDaysCont) {
      let html = '';
      days.forEach((_, di) => {
        const isToday      = (di === todayIdx && weekOffset === 0);
        const colSessions  = SESSIONS.filter(s => s.day === di);

        /* Hour lines (grid-hour-line) */
        let linesHtml = '';
        for (let i = 0; i < TOTAL_H; i++) {
          linesHtml += `<div class="grid-hour-line"></div>`;
        }

        /* Session cards */
        let cardsHtml = '';
        colSessions.forEach(s => {
          const statusCls = STATUS_CLASS[s.status] || STATUS_CLASS.upcoming;
          const topPx     = ((s.startH - GRID_START) * 60 + s.startM) / 60 * HOUR_PX;
          const heightPx  = ((s.endH - s.startH) * 60 + (s.endM - s.startM)) / 60 * HOUR_PX;
          const isCompact = heightPx < 76;

          cardsHtml += `
            <div class="session-card ${statusCls}"
                 style="top:${topPx}px; height:${heightPx}px;"
                 title="${s.className} – ${s.subject} (${fmtTime(s.startH, s.startM)}–${fmtTime(s.endH, s.endM)})">
              <div class="session-card-time">${fmtTime(s.startH, s.startM)} – ${fmtTime(s.endH, s.endM)}</div>
              <div class="session-card-title">${s.className} – ${s.subject}</div>
              ${!isCompact ? `
              <div class="session-card-footer">
                <div class="session-card-teacher">
                  <div class="session-teacher-avatar" style="background-color:${s.avatarBg};">${s.initials}</div>
                  <span>${s.teacher}</span>
                </div>
                <div class="session-card-room">${s.room}</div>
              </div>` : ''}
            </div>`;
        });

        html += `
          <div class="grid-day-col${isToday ? ' is-today' : ''}">
            ${linesHtml}
            ${cardsHtml}
          </div>`;
      });
      timetableDaysCont.innerHTML = html;
    }

    /* ── Now-line position ───────────────────────────────────────
       CSS classes used: .now-time-line, .now-time-dot, .now-time-bar
       (defined in style.css ~2014)
       The element already exists in HTML; we just set its top offset.
    ─────────────────────────────────────────────────────────── */
    if (nowTimeLine) {
      if (weekOffset === 0) {
        const nowH = TODAY_SRC.getHours();
        const nowM = TODAY_SRC.getMinutes();
        if (nowH >= GRID_START && nowH < GRID_END) {
          const nowPx = ((nowH - GRID_START) * 60 + nowM) / 60 * HOUR_PX;
          nowTimeLine.style.top = `${nowPx}px`;
          nowTimeLine.classList.remove('d-none');
        } else {
          nowTimeLine.classList.add('d-none');
        }
      } else {
        nowTimeLine.classList.add('d-none');
      }
    }
  }

  /* ── Initial render + auto-scroll to 07:00 ───────────────────── */
  renderCalendar();

  if (gridScroll) {
    // Scroll to show morning sessions (07:00 = top of grid)
    gridScroll.scrollTop = 0;
  }

  /* ── Week navigator buttons ───────────────────────────────────── */
  btnToday?.addEventListener('click', () => { weekOffset = 0; renderCalendar(); });
  btnPrev?.addEventListener('click',  () => { weekOffset--; renderCalendar(); });
  btnNext?.addEventListener('click',  () => { weekOffset++; renderCalendar(); });
});
