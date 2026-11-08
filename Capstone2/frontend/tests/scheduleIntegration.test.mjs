import assert from 'node:assert/strict';
import test from 'node:test';
import {emptyScheduleFilters, filterSchedule, schedulePageNumber, sortSchedule} from '../src/BLL/services/scheduleViewService.ts';

const row = (patch = {}) => ({sessionId:1,classId:10,className:'Lớp 2',subjectId:20,subjectName:'Synthetic',
  sessionDate:'2026-12-28',startTime:'18:00:00',endTime:'20:00:00',teachers:[],teachingAssistants:[],
  room:null,status:'scheduled',scheduleId:null,hasAttendance:false,...patch});

test('teammate jump rejects fractional, blank, nonnumeric and out-of-bounds pages', () => {
  for (const value of ['',' ','0','-1','1.5','NaN','Infinity','999','1e2'])
    assert.equal(schedulePageNumber(value,7),null,value);
  assert.equal(schedulePageNumber('1',7),1);
  assert.equal(schedulePageNumber('7',7),7);
  assert.equal(schedulePageNumber(' 3 ',7),3);
});
test('teammate weekday filter derives the day from SessionDate within the chosen real week', () => {
  const sessions=[row(),row({sessionId:2,sessionDate:'2027-01-04'}),row({sessionId:3,sessionDate:'2027-01-01'})];
  assert.deepEqual(filterSchedule(sessions,'2026-12-28','2027-01-04',{...emptyScheduleFilters(),weekday:'0'}).map(s=>s.sessionId),[1]);
  assert.deepEqual(filterSchedule(sessions,'2026-12-28','2027-01-04',{...emptyScheduleFilters(),weekday:'4'}).map(s=>s.sessionId),[3]);
});
test('table header sorting uses calendar date and time without changing the source array', () => {
  const data=[row(),row({sessionId:2,sessionDate:'2027-01-01',startTime:'07:00:00',className:'Lớp 10'})];
  assert.deepEqual(sortSchedule(data,'dayOfWeek:desc').map(s=>s.sessionId),[2,1]);
  assert.deepEqual(sortSchedule(data,'time:asc').map(s=>s.sessionId),[2,1]);
  assert.deepEqual(sortSchedule(data,'className:asc').map(s=>s.sessionId),[1,2]);
  assert.deepEqual(data.map(s=>s.sessionId),[1,2]);
});
