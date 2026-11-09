import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import Module, {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {emptyScheduleFilters, filterSchedule, scheduleStatus} from '../src/BLL/services/scheduleViewService.ts';

// Opt-in audit of an immutable git archive, never a production entry point.
// No copying incoming modules into Duy, no API calls, no database or identity stubs.
const root = process.cwd();
const snapshot = path.resolve(process.env.EDUTRACK_TEAMMATE_FRONTEND || '');
const output = process.env.EDUTRACK_SCHEDULE_AUDIT_OUTPUT;
assert.ok(process.env.EDUTRACK_TEAMMATE_FRONTEND && output, 'Explicit snapshot and output paths required');
assert.notEqual(snapshot, root, 'Use a separate git archive');
const requireLocal = createRequire(path.join(root, 'package.json'));
const ts = requireLocal('typescript'), React = requireLocal('react');
const {renderToStaticMarkup} = requireLocal('react-dom/server');
const {MemoryRouter} = requireLocal('react-router-dom');
const loaded = new Map(), sourceHashes = {}, checks = [];
function check(condition, label) {assert.ok(condition, label); checks.push(label);}
function read(relative) {
  const absolute = path.resolve(snapshot, relative);
  assert.ok(absolute.startsWith(snapshot + path.sep), 'Snapshot path containment');
  const source = fs.readFileSync(absolute, 'utf8');
  sourceHashes[relative] = createHash('sha256').update(source).digest('hex');
  return source;
}
function load(relative) {
  if (loaded.has(relative)) return loaded.get(relative).exports;
  const absolute = path.resolve(snapshot, relative), source = read(relative);
  const compiled = ts.transpileModule(source, {fileName: absolute, compilerOptions: {
    module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, esModuleInterop: true,
  }}).outputText;
  const instance = new Module(absolute);
  loaded.set(relative, instance);
  instance.filename = absolute;
  instance.require = specifier => {
    if (!specifier.startsWith('.')) return requireLocal(specifier);
    const relativeBase = path.relative(snapshot, path.resolve(path.dirname(absolute), specifier));
    const resolved = ['.tsx', '.ts', '.js'].map(extension => relativeBase + extension).find(file => fs.existsSync(path.join(snapshot, file)));
    assert.ok(resolved, 'Known snapshot import: ' + specifier);
    return load(resolved.replaceAll(path.sep, '/'));
  };
  instance._compile(compiled, absolute);
  return instance.exports;
}
const render = element => renderToStaticMarkup(React.createElement(MemoryRouter, null, element));
function flatten(element) {
  if (!element || typeof element !== 'object') return [];
  return [element, ...React.Children.toArray(element.props?.children).flatMap(flatten)];
}

const {PaginationNavGroup} = load('src/GUIs/components/teacher/CommonPaginationUtils.tsx');
for (const [total, current, links, jump] of [
  [1,1,[],false], [3,2,[1,3],false], [10,1,[2,10],true],
  [10,2,[1,10],true], [10,3,[1,10],true], [10,9,[1,10],true], [10,10,[1,9],true],
]) {
  const events = [];
  const tree = PaginationNavGroup({currentPage: current, totalPages: total, onPageChange: page => events.push(page)});
  const buttons = flatten(tree).filter(element => element.type === 'button');
  assert.deepEqual(buttons.map(button => Number(button.props.children)), links);
  buttons.forEach(button => button.props.onClick());
  assert.deepEqual(events, links);
  const html = render(tree);
  check(html.includes('pagination-jump-input') === jump, 'Teammate pagination branch ' + current + '/' + total);
}
for (const role of ['Teacher', 'TeachingAssistant']) {
  const base = 'src/GUIs/components/teacher/' + role + '/schedule/';
  const Pagination = load(base + 'ScheduleListPagination.tsx').default;
  const empty = render(React.createElement(Pagination, {totalItems: 0, currentPage: 1, rowsPerPage: 10}));
  check(empty.includes('Hiển thị 0 ca') && !empty.includes('pagination-jump-input'), role + ' pagination preserves empty data');
  const many = render(React.createElement(Pagination, {totalItems: 100, currentPage: 3, rowsPerPage: 10}));
  check(many.includes('pagination-jump-input'), role + ' pagination delegates to original shared jump component');
  const Toolbar = load(base + 'ScheduleListToolbar.tsx').default;
  const toolbar = render(React.createElement(Toolbar));
  check(toolbar.includes('value="active"') && toolbar.includes('value="inactive"') && !toolbar.includes('value="scheduled"'),
    role + ' toolbar needs session-status contract adaptation before integration');
  const Table = load(base + 'ScheduleTable.tsx').default;
  const sortEvents = [];
  const tableTree = Table({schedules: [], sortField: 'className', sortOrder: 'asc', onSort: field => sortEvents.push(field)});
  flatten(tableTree).filter(element => element.type === 'span' && element.props.role === 'button').forEach(button => button.props.onClick());
  assert.deepEqual(sortEvents, ['className', 'dayOfWeek', 'time', 'studentCount']);
  check(true, role + ' original table sorting callbacks work');
}

const mapper = load('src/GUIs/components/student/schedule/scheduleData.ts').mapTeachingScheduleDtoToSessionItem;
const OriginalDate = globalThis.Date;
let mapped;
try {
  globalThis.Date = class extends OriginalDate {
    constructor(...args) {super(...(args.length ? args : ['2026-11-09T05:00:00Z']));}
    getDay() {return 1;} getHours() {return 12;} getMinutes() {return 0;}
  };
  mapped = mapper({scheduleId: 1, classId: 8, className: 'Synthetic class', subjectName: 'Synthetic subject',
    dayOfWeek: 'Monday', startTime: '08:00:00', endTime: '10:00:00', status: 'active'}, false, 0);
} finally {globalThis.Date = OriginalDate;}
check(mapped.status === 'completed' && !('sessionDate' in mapped), 'Audit confirms legacy mapper derives completion without an actual session date');
const official = {sessionId: 11, classId: 8, className: 'Synthetic class', subjectId: 1, subjectName: 'Synthetic subject',
  sessionDate: '2026-11-09', startTime: '08:00:00', endTime: '10:00:00', status: 'scheduled', room: null,
  teachers: [], teachingAssistants: [], hasAttendance: false, scheduleId: 1};
check(scheduleStatus(official, new Date('2026-11-09T05:00:00Z')).key === 'scheduled', 'Existing canonical status does not invent completion');
const visible = filterSchedule([official, {...official, sessionId: 12, sessionDate: '2026-11-16'}], '2026-11-09', '2026-11-16', emptyScheduleFilters());
check(visible.length === 1 && visible[0].sessionId === 11, 'Canonical date filtering can feed original UI without repeating next week');
const calendarSource = read('src/GUIs/components/student/schedule/ScheduleTimetableCard.tsx');
check(calendarSource.includes('sessions = SESSIONS') && calendarSource.includes('s.day === di'), 'Audit confirms original Calendar needs explicit real-data and date boundaries');
const calendarCss = read('src/assets/css/schedule-calendar.css');
check(calendarCss.includes('scrollbar-gutter: stable') && calendarCss.includes('overflow-y: scroll'), 'Latest original Calendar alignment fixes are available for reuse');
check(['upcoming','ongoing','completed','cancelled'].every(status => calendarCss.includes('.session-card-' + status)), 'Latest original Calendar supplies all four visual status styles');
fs.writeFileSync(output, JSON.stringify({checks, count: checks.length, sourceHashes, productionFilesModified: false,
  limitations: ['SSR/component contract audit, not end-to-end integration', 'No changes to incoming source', 'Status/date/identity adaptation still requires approved scope']}, null, 2));
console.log(checks.length + ' teammate compatibility/audit checks passed; original source loaded from snapshot, no production integration.');
console.log('RESULT: ' + output);
