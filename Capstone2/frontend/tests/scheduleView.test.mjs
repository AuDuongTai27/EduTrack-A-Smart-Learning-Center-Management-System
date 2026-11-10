import assert from 'node:assert/strict';
import test from 'node:test';
import { addScheduleDays, calendarHours, dateOnly, emptyScheduleFilters, filterSchedule, mondayOf, placeDaySessions,
  scheduleStatus, sortSchedule, vietnamClock } from '../src/BLL/services/scheduleViewService.ts';
import { createScheduleSessionApi } from '../src/api/scheduleSessionApi.ts';

const row = (patch = {}) => ({sessionId: 1, classId: 100, className: 'Toán 7A', scheduleId: null, subjectId: 30,
  subjectName: 'Toán', sessionDate: '2026-12-28', startTime: '18:00:00', endTime: '20:00:00', room: null,
  status: 'scheduled', teachers: [{userId: 19, name: 'GV Synthetic'}], teachingAssistants: [], hasAttendance: false, ...patch});

test('Vietnam today is UTC+7 regardless of browser timezone, including year boundary', () => {
  assert.deepEqual(vietnamClock(new Date('2026-12-31T17:01:00Z')), {date: '2027-01-01', minutes: 1});
  assert.deepEqual(vietnamClock(new Date('2026-11-08T16:59:00Z')), {date: '2026-11-08', minutes: 1439});
});
test('Monday-to-Sunday range spans months and years without local-time parsing', () => {
  assert.equal(mondayOf('2027-01-03'), '2026-12-28');
  assert.equal(addScheduleDays('2026-12-28', 7), '2027-01-04');
  assert.equal(mondayOf('2026-11-01'), '2026-10-26');
  assert.equal(addScheduleDays('2028-02-28', 1), '2028-02-29');
  for (const date of ['2026-02-29', '2026-02-30', '2026-1-01', '2026-01-01T00:00:00Z']) assert.throws(() => dateOnly(date));
});
test('same weekday in another week never repeats and toExclusive excludes next Monday', () => {
  const data = [row(), row({sessionId: 2, sessionDate: '2027-01-04'}), row({sessionId: 3, sessionDate: '2026-12-21'})];
  assert.deepEqual(filterSchedule(data, '2026-12-28', '2027-01-04', emptyScheduleFilters()).map(s => s.sessionId), [1]);
});
test('shared filtering and sorting do not mutate data or apply List pagination to Calendar', () => {
  const data = Array.from({length: 15}, (_, i) => row({sessionId: i + 1, startTime: `${String(7 + i).padStart(2, '0')}:00:00`}));
  const filtered = filterSchedule(data, '2026-12-28', '2027-01-04', {...emptyScheduleFilters(), teacherId: '19', search: ' synthetic '});
  assert.equal(filtered.length, 15); assert.equal(filtered.slice(0, 10).length, 10); assert.equal(data.length, 15);
  assert.equal(filterSchedule(data, '2026-12-28', '2027-01-04', {...emptyScheduleFilters(), taId: '19'}).length, 0);
  assert.equal(filterSchedule(data, '2026-12-28', '2027-01-04', {...emptyScheduleFilters(), room: 'Room 101'}).length, 0);
  assert.equal(sortSchedule(data, 'latest')[0].sessionId, 15); assert.equal(data[0].sessionId, 1);
});
test('overlap groups allocate separate lanes; touching intervals and disconnected groups reuse width', () => {
  const data = [row({sessionId: 1, startTime: '08:00', endTime: '10:00'}), row({sessionId: 2, startTime: '09:00', endTime: '11:00'}),
    row({sessionId: 3, startTime: '10:00', endTime: '12:00'}), row({sessionId: 4, startTime: '12:00', endTime: '13:00'})];
  const placed = placeDaySessions(data);
  assert.deepEqual(placed.map(p => [p.lane, p.laneCount]), [[0, 2], [1, 2], [0, 2], [0, 1]]);
  assert.equal(placeDaySessions([row(), row({sessionId: 2}), row({sessionId: 3})])[2].laneCount, 3);
});
test('calendar expands outside prototype hours; invalid intervals are not silently plotted', () => {
  assert.deepEqual(calendarHours([row({startTime: '05:30', endTime: '23:30'})]), {start: 5, end: 24});
  assert.equal(placeDaySessions([row({startTime: '23:00', endTime: '08:00'})]).length, 0);
});
test('status is consistent and elapsed time never invents completion', () => {
  const session = row({sessionDate: '2026-11-08'});
  assert.equal(scheduleStatus(session, new Date('2026-11-08T12:00:00Z')).key, 'ongoing');
  assert.equal(scheduleStatus(session, new Date('2026-11-08T14:00:00Z')).key, 'scheduled');
  assert.equal(scheduleStatus({...session, status: 'cancelled'}).key, 'cancelled');
  assert.equal(scheduleStatus({...session, status: 'completed'}).key, 'completed');
  assert.equal(scheduleStatus({...session, status: 'legacy'}).key, 'unknown');
});
test('empty API remains empty; no identity parameters are sent; transport/auth/invalid responses reject', async () => {
  const original = globalThis.fetch;
  const api = createScheduleSessionApi('/api', 501);
  try {
    globalThis.fetch = async (url, options) => {
      assert.equal(String(url), '/api/schedule/sessions?from=2026-12-28&toExclusive=2027-01-04&userId=501');
      assert.equal(options.credentials, 'omit'); assert.equal(options.cache, 'no-store');
      return new Response('[]', {status: 200});
    };
    assert.deepEqual(await api.getWeek('2026-12-28', '2027-01-04'), []);
    for (const status of [401, 403, 500, 503]) {
      globalThis.fetch = async () => new Response('{}', {status});
      await assert.rejects(api.getWeek('2026-12-28', '2027-01-04'));
    }
    globalThis.fetch = async () => {throw new Error('offline');};
    await assert.rejects(api.getWeek('2026-12-28', '2027-01-04'), /offline/);
    for (const data of [{success: true, data: []}, [row({sessionDate: '2026-02-30'})], [row(), row()], [row({teachers: null})]]) {
      globalThis.fetch = async () => new Response(JSON.stringify(data));
      await assert.rejects(api.getWeek('2026-12-28', '2027-01-04'), /không hợp lệ/);
    }
    globalThis.fetch = async () => new Response(JSON.stringify([row()]));
    assert.equal((await api.getWeek('2026-12-28', '2027-01-04'))[0].room, null);
  } finally {globalThis.fetch = original;}
});
