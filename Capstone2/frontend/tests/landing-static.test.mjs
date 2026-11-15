import assert from 'node:assert/strict';
import { before, after, test } from 'node:test';
import { createServer } from 'vite';
let server, data;
before(async () => {
  server = await createServer({ configFile: false, server: { middlewareMode: true, watch: null }, appType: 'custom' });
  data = await server.ssrLoadModule('/src/GUIs/components/landing/landingStaticData.ts');
});
after(async () => { await server?.close(); });

test('snapshot keeps two verified classes and stable subject relationships', () => {
  assert.deepEqual(data.classes.map(c => [c.classId, c.className, c.subjectId, c.tuitionFee, c.teacherName]), [
    [2, 'Class 9 - Intensive Physics', 2, 1400000, 'ThS. Huỳnh Khánh Duy'],
    [3, 'Class 8 - English Foundation', 4, 1800000, 'ThS. Hoàng Quốc Việt'],
  ]);
  assert.equal(new Set(data.subjects.map(s => s.subjectId)).size, 4);
  for (const course of data.classes) {
    assert.ok(data.subjects.some(s => s.subjectId === course.subjectId && s.subjectCode === course.subjectCode));
    assert.deepEqual(course.upcomingSessions, []);
  }
  assert.deepEqual(data.teachers.map(t => t.fullName), ['ThS. Hoàng Quốc Việt', 'ThS. Huỳnh Khánh Duy', 'Âu Dương Tài']);
  assert.equal(data.contactInfo.hotline, '1900 6868');
  assert.equal(data.contactInfo.email, '');
});

test('local filtering and cumulative pagination work offline, with empty results and no duplicates', () => {
  const original = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('No network allowed'); };
  try {
    assert.deepEqual(data.getLocalClasses(2).items.map(c => c.classId), [2]);
    assert.deepEqual(data.getLocalClasses(1), { items: [], totalCount: 0, hasMore: false });
    assert.equal(data.getLocalClasses(null).totalCount, 2);
    const source = Array.from({ length: 7 }, (_, i) => ({ ...data.classes[0], classId: 100 + i }));
    source.splice(1, 0, data.classes[1]);
    for (const [page, count, hasMore] of [[1, 3, true], [2, 6, true], [3, 7, false], [4, 7, false]]) {
      const result = data.getLocalClasses(2, page, source);
      assert.equal(result.items.length, count);
      assert.equal(result.totalCount, 7);
      assert.equal(result.hasMore, hasMore);
      assert.equal(new Set(result.items.map(c => c.classId)).size, count);
      assert.ok(result.items.every(c => c.subjectId === 2));
    }
    assert.equal(source.length, 8);
  } finally { globalThis.fetch = original; }
});
