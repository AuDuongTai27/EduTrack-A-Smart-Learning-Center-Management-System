import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createServer } from 'vite';

const vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
after(() => vite.close());
const { learnerNotificationScope, loadLearnerNotificationPreview } = await vite.ssrLoadModule('/src/GUIs/components/shared/notifications/learnerNotificationPreview.ts');
const { quickNotifications } = await vite.ssrLoadModule('/src/BLL/services/notificationInbox.ts');
const user = (role, userId = 417) => ({ userId, primaryRole: role, roles: [role] });
const row = (notificationId, isRead = false) => ({ notificationId, title: `Notification ${notificationId}`, content: 'API content', type: 'system', isRead, createdAt: '2026-11-21T03:00:00Z' });

test('scope requires a real matching account and never substitutes demo IDs', () => {
  for (const invalid of [null, user('teacher'), user('student', 0), user('student', -1)]) assert.equal(learnerNotificationScope('student', invalid), null);
  assert.deepEqual(learnerNotificationScope('student', user('student')), { role: 'student', userId: 417 });
});
test('Parent scope waits for context and carries only the actual selected child', () => {
  assert.equal(learnerNotificationScope('parent', user('parent'), 73, true), null);
  assert.equal(learnerNotificationScope('parent', user('parent'), 0), null);
  assert.deepEqual(learnerNotificationScope('parent', user('parent'), 73), { role: 'parent', userId: 417, studentId: 73 });
  assert.deepEqual(learnerNotificationScope('parent', user('parent')), { role: 'parent', userId: 417 });
});
test('Student adapter requests current account; all returned unread rows count beyond preview size', async () => {
  const calls = [], rows = Array.from({ length: 8 }, (_, i) => row(100 + i));
  const result = await loadLearnerNotificationPreview({ role: 'student', userId: 417 }, new Set(), {
    getStudentNotifications: async id => { calls.push(id); return rows; },
    getParentNotifications: () => assert.fail('Wrong endpoint'),
  });
  assert.deepEqual(calls, [417]); assert.equal(result.unreadCount, 8);
  assert.deepEqual(result.items.map(n => n.notificationId), rows.map(n => n.notificationId));
});
test('Parent adapter preserves parent-only inbox and selected-child query scopes', async () => {
  const calls = [], api = { getParentChildrenOverview: async id => { assert.equal(id, 417); return [{ id: 73 }, { id: 74 }]; }, getParentNotifications: async (...args) => { calls.push(args); return [row(args[1] ?? 99)]; } };
  for (const studentId of [73, 74, undefined]) await loadLearnerNotificationPreview({ role: 'parent', userId: 417, studentId }, new Set(), api);
  assert.deepEqual(calls, [[417, 73], [417, 74], [417, undefined]]);
});
test('unverified or unavailable child scope never issues a child notification request', async () => {
  for (const getParentChildrenOverview of [async () => [], async () => [{ id: 99 }], async () => { throw Error('HTTP 503'); }]) {
    await assert.rejects(loadLearnerNotificationPreview({ role: 'parent', userId: 417, studentId: 73 }, new Set(), {
      getParentChildrenOverview, getParentNotifications: () => assert.fail('Unverified child inbox was queried'),
    }));
  }
});
test('server read flags and per-account local reads both remove unread badge contributions', async () => {
  const rows = [row(1), row(2, true), row(3)];
  const result = await loadLearnerNotificationPreview({ role: 'student', userId: 417 }, new Set([1]), { getStudentNotifications: async () => rows });
  assert.equal(result.unreadCount, 1); assert.deepEqual(result.items.map(n => n.isRead), [true, true, false]);
  assert.equal(rows[0].isRead, false, 'No mutation of API state');
});
test('network failure propagates without invented notifications; empty API inbox has zero unread', async () => {
  const scope = { role: 'student', userId: 417 };
  await assert.rejects(loadLearnerNotificationPreview(scope, new Set(), { getStudentNotifications: async () => { throw Error('HTTP 503'); } }), /503/);
  assert.deepEqual(await loadLearnerNotificationPreview(scope, new Set(), { getStudentNotifications: async () => [] }), { items: [], unreadCount: 0 });
});
test('malformed notification rows fail closed', async () => {
  for (const data of [null, [{}], [row(-1)], [{ ...row(1), isRead: null }], [{ ...row(1), createdAt: 'invalid' }]]) {
    await assert.rejects(loadLearnerNotificationPreview({ role: 'student', userId: 417 }, new Set(), { getStudentNotifications: async () => data }), /unavailable/);
  }
});

test('Bell keeps five newest unread rows, counts all unread and preserves read history', async () => {
  const rows = Array.from({ length: 12 }, (_, i) => ({ ...row(i + 1), createdAt: `2026-11-${String(i + 1).padStart(2, '0')}T03:00:00Z` }));
  rows.unshift(row(99, true), { ...row(100), deletedAt: '2026-11-21T03:00:00Z' });
  const result = await loadLearnerNotificationPreview({ role: 'student', userId: 417 }, new Set(), { getStudentNotifications: async () => rows });
  assert.equal(result.unreadCount, 12);
  assert.deepEqual(quickNotifications(result.items).map(n => n.notificationId), [12, 11, 10, 9, 8]);
  assert(result.items.some(n => n.notificationId === 99 && n.isRead), 'Read history remains in full inbox data');
  assert(!result.items.some(n => n.notificationId === 100), 'Deleted row is ineligible');
});

test('zero unread with read history never backfills the Bell; local reads remove rows immediately', async () => {
  for (const rows of [[], [row(1, true), row(2, true)]]) {
    const result = await loadLearnerNotificationPreview({ role: 'student', userId: 417 }, new Set(), { getStudentNotifications: async () => rows });
    assert.equal(result.unreadCount, 0); assert.deepEqual(quickNotifications(result.items), []);
    assert.equal(result.items.length, rows.length);
  }
  const result = await loadLearnerNotificationPreview({ role: 'parent', userId: 417 }, new Set([1, 2]), { getParentNotifications: async () => [row(1), row(2)] });
  assert.equal(result.unreadCount, 0); assert.deepEqual(quickNotifications(result.items), []);
});
