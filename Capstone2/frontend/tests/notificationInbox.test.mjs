import assert from 'node:assert/strict';
import { test, after } from 'node:test';
import { createServer } from 'vite';
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
after(() => vite.close());
const policy = await vite.ssrLoadModule('/src/BLL/services/notificationInbox.ts');
const { NotificationInboxStore } = await vite.ssrLoadModule('/src/BLL/services/notificationInboxStore.ts');
const origin = Date.parse('2026-11-09T03:02:00Z');
const row = (id, more = {}) => ({ notificationId: id, title: `N${id}`, content: 'Actual content', type: 'system', isRead: false, createdAt: '2026-01-01T00:00:00Z', readAt: null, deletedAt: null, ...more });
const snapshot = (rows, more = {}) => ({ identity: { userId: 501, fullName: 'Verified CM', userCode: 'QA501', roles: ['center_manager'], email: null, avatarUrl: null }, serverNowUtc: new Date(origin).toISOString(), inbox: rows, trash: [], unreadCount: rows.filter(n => !n.isRead).length, ...more });
test('unread never expires; read hides at exactly ReadAt + five minutes and remains in Inbox', () => {
  const rows = [row(1), row(2, { isRead: true, readAt: new Date(origin).toISOString() })];
  assert.deepEqual(policy.quickNotifications(rows, origin + 299999).map(n => n.notificationId), [2, 1]);
  assert.deepEqual(policy.quickNotifications(rows, origin + 300000).map(n => n.notificationId), [1]);
  assert.equal(rows.length, 2); assert.equal(rows[1].deletedAt, null);
});
test('filter full eligible set before top five, tie-break ID, and refill with older unread', () => {
  const rows = Array.from({ length: 20 }, (_, i) => row(i + 1));
  rows.push(...Array.from({ length: 6 }, (_, i) => row(21 + i, { isRead: true, readAt: new Date(origin).toISOString() })));
  assert.deepEqual(policy.quickNotifications(rows, origin).map(n => n.notificationId), [26, 25, 24, 23, 22]);
  assert.deepEqual(policy.quickNotifications(rows, origin + 300000).map(n => n.notificationId), [20, 19, 18, 17, 16]);
});
test('reload/reopen/restore use original server timestamp; read legacy NULL is never invented', () => {
  const rows = [row(1, { isRead: true }), row(2, { isRead: true, readAt: new Date(origin).toISOString() }), row(3, { deletedAt: new Date(origin).toISOString() })];
  assert.deepEqual(policy.quickNotifications(structuredClone(rows), origin + 180000).map(n => n.notificationId), [2]);
  assert.deepEqual(policy.quickNotifications(structuredClone(rows), origin + 300000), []);
  assert.equal(policy.notificationTime('2026-11-09T03:02:00Z').includes('10:02'), true);
});
test('malformed dates, duplicate IDs, wrong unread count and deleted Inbox fail closed', () => {
  for (const bad of [snapshot([row(1), row(1)]), snapshot([row(1, { createdAt: '2026-11-09T03:02:00' })]), snapshot([row(1)], { unreadCount: 6 }), snapshot([row(1, { deletedAt: new Date(origin).toISOString() })])])
    assert.throws(() => policy.validateSnapshot(bad));
  assert.equal(policy.validateSnapshot(snapshot([row(1)])).unreadCount, 1);
});
function globals() {
  globalThis.window = new EventTarget(); globalThis.document = new EventTarget(); document.visibilityState = 'visible';
  globalThis.localStorage = { setItem() {} };
}
const flush = () => new Promise(resolve => setImmediate(resolve));
test('shared timer expires without network, unread refills, cleanup stops timer', async t => {
  globals(); t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] }); let elapsed = 0, calls = 0;
  const rows = [row(1), row(2, { isRead: true, readAt: new Date(origin).toISOString() })];
  const api = { snapshot: async () => { calls++; return snapshot(rows); } };
  const store = new NotificationInboxStore('center_manager', api, () => elapsed);
  const unsub = store.subscribe(() => {}); await flush();
  assert.equal(store.getSnapshot().quick.length, 2);
  document.visibilityState = 'hidden';
  elapsed = 300000; t.mock.timers.tick(300000); await flush();
  assert.deepEqual(store.getSnapshot().quick.map(n => n.notificationId), [1]);
  unsub(); const before = calls; t.mock.timers.tick(600000); await flush(); assert.equal(calls, before);
});
test('failed mutation preserves confirmed read/delete state and reports real error', async () => {
  globals(); const store = new NotificationInboxStore('center_manager', { snapshot: async () => snapshot([row(1)]), mutate: async () => { throw Error('HTTP 500 actual failure'); } });
  const off = store.subscribe(() => {}); await flush();
  await assert.rejects(store.mutate('read', 1), /HTTP 500/);
  assert.equal(store.getSnapshot().data.unreadCount, 1); assert.equal(store.getSnapshot().data.inbox[0].readAt, null); off();
});
test('role mismatch, revoked identity and stale response after logout cannot expose old Inbox', async () => {
  globals(); let resolve;
  const store = new NotificationInboxStore('center_manager', { snapshot: () => new Promise(r => { resolve = r; }) });
  const off = store.subscribe(() => {}); off(); resolve(snapshot([row(1)])); await flush(); assert.equal(store.getSnapshot().data, null);
  const wrong = new NotificationInboxStore('teacher', { snapshot: async () => snapshot([row(1)]) });
  const stop = wrong.subscribe(() => {}); await flush(); assert.equal(wrong.getSnapshot().data, null); assert.match(wrong.getSnapshot().error, /vai trò/); stop();
});
test('server confirmation synchronizes counts/trash and next restore keeps elapsed grace', async () => {
  globals(); const old = new Date(origin - 300001).toISOString(); let rows = [row(1, { isRead: true, readAt: old })];
  const store = new NotificationInboxStore('center_manager', { snapshot: async () => snapshot(rows), mutate: async op => {
    rows = rows.map(n => ({ ...n, deletedAt: op === 'delete' ? new Date(origin).toISOString() : null }));
    return snapshot(rows.filter(n => !n.deletedAt), { trash: rows.filter(n => n.deletedAt) });
  } });
  const off = store.subscribe(() => {}); await flush(); await store.mutate('delete', 1); assert.equal(store.getSnapshot().data.trash.length, 1);
  await store.mutate('restore', 1); assert.equal(store.getSnapshot().data.inbox[0].readAt, old); assert.equal(store.getSnapshot().quick.length, 0); off();
});
