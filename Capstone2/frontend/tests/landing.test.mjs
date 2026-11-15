import assert from 'node:assert/strict';
import { before, after, test } from 'node:test';
import { createServer } from 'vite';
let server, dal, content;
const fetchOriginal = globalThis.fetch;
before(async () => {
  server = await createServer({ configFile: false, server: { middlewareMode: true, watch: null }, appType: 'custom' });
  ({ landingDAL: dal } = await server.ssrLoadModule('/src/DAL/landingDAL.ts'));
  content = await server.ssrLoadModule('/src/GUIs/components/landing/landingContent.ts');
});
after(async () => { globalThis.fetch = fetchOriginal; await server?.close(); });
test('offline and HTTP failure reject without mock business records', async () => {
  globalThis.fetch = async () => { throw new Error('Offline'); };
  await assert.rejects(dal.getLandingOverview(), /Offline/);
  globalThis.fetch = async () => new Response('Unavailable', { status: 503 });
  await assert.rejects(dal.getLandingOverview(), /HTTP 503/);
});
test('empty real collections stay empty and server counts cannot replace demo statistics', async () => {
  const data = { centerInfo: {}, stats: { totalStudents: 0 }, subjects: [], courses: [], trainers: [] };
  globalThis.fetch = async () => Response.json({ success: true, data });
  assert.deepEqual((await dal.getLandingOverview()).data, data);
  assert.deepEqual(content.DEMO_STATISTICS.map(s => [s.value, s.label]), [
    ['1,230+', 'Students'], ['64+', 'Classes'], ['24+', 'Teachers & Teaching Assistants'],
  ]);
});
test('malformed and unsuccessful responses are errors rather than empty success', async () => {
  for (const response of [{ success: false }, { data: { courses: [] } }, null]) {
    globalThis.fetch = async () => Response.json(response);
    await assert.rejects(dal.getLandingOverview());
  }
});
test('newsletter failure cannot claim success', async () => {
  globalThis.fetch = async () => new Response('Failed', { status: 500 });
  await assert.rejects(dal.subscribeNewsletter('qa@example.test'), /HTTP 500/);
});
test('requests carry cancellation and a timeout signal', async () => {
  const controller = new AbortController();
  let signal;
  globalThis.fetch = async (_, init) => { signal = init.signal; return Response.json({ subjects: [], courses: [], trainers: [] }); };
  await dal.getLandingOverview(controller.signal);
  assert.equal(signal.aborted, false);
  controller.abort();
  assert.equal(signal.aborted, true);
});
test('English presentation preserves record identity without invented curriculum', () => {
  assert.equal(content.subjectInfo('MATH').name, 'Mathematics');
  assert.equal(content.subjectInfo('PHYS').name, 'Physics');
  assert.equal(content.classTitle({ classId: 41, className: 'Lớp toán nâng cao', subjectCode: 'MATH' }), 'Mathematics · Class 41');
  assert.equal(content.classTitle({ classId: 42, className: 'Algebra Workshop', subjectCode: 'MATH' }), 'Algebra Workshop');
  assert.equal(content.specialtyLabel('Chuyên gia Toán học'), 'Mathematics');
  assert.equal(content.specialtyLabel('Thông tin chưa được dịch'), '');
});
test('unsafe image and contact links are not rendered', () => {
  assert.equal(content.safeImageUrl('javascript:alert(1)'), undefined);
  assert.equal(content.safeImageUrl('//external.test/image'), undefined);
  assert.equal(content.safeImageUrl('/uploads/teacher.png'), '/uploads/teacher.png');
  assert.equal(content.contactLinks({ email: 'bad?@example.test', hotline: 'not a phone' }).email, '');
  assert.equal(content.contactLinks({ email: 'advice@example.test', hotline: '+84 123 456 789' }).tel, '+84123456789');
});
test('default cartoon/emoji avatars are presentation-only placeholders', () => {
  for (const url of ['https://api.dicebear.com/7.x/avataaars/svg?seed=teacher', '/avatars/emoji-default.svg', 'https://robohash.org/teacher', '/assets/img/trainer-1.jpg'])
    assert.equal(content.teacherImageUrl(url), undefined);
  assert.equal(content.teacherImageUrl('/uploads/real-photo.jpg'), '/uploads/real-photo.jpg');
});
test('unknown subjects remain visible with a safe distinct label', () => {
  assert.equal(content.subjectInfo('ROBOT', 'Robotics', 12).name, 'Robotics');
  assert.equal(content.subjectInfo('NEW', 'Môn học mới', 13).name, 'Subject NEW');
  assert.equal(content.gradeLabel('Khối 10'), 'Grade 10');
});
test('schedule uses explicit dates and separate time windows without a fabricated weekly pattern', () => {
  const lines = content.scheduleLines([{ date: '2026-11-16', startTime: '18:00', endTime: '19:30' }, { date: '2026-11-19', startTime: '19:00', endTime: '20:30' }]);
  assert.match(lines[0], /Mon, Nov 16 · 6:00 PM–7:30 PM/);
  assert.match(lines[1], /Thu, Nov 19 · 7:00 PM–8:30 PM/);
  assert.deepEqual(content.scheduleLines(), []);
});
test('public class query sends the real subject and page instead of filtering the preview', async () => {
  let requested;
  globalThis.fetch = async url => { requested = String(url); return Response.json({ data: { items: [{ classId: 101, subjectId: 12 }], page: 2, pageSize: 3, totalCount: 7, hasMore: true } }); };
  const result = await dal.getClasses(12, 2);
  assert.match(requested, /landing\/classes\?page=2&pageSize=3&subjectId=12/);
  assert.equal(result.items[0].subjectId, 12);
  globalThis.fetch = async () => Response.json({ items: [], totalCount: 0 });
  await assert.rejects(dal.getClasses(12));
});
