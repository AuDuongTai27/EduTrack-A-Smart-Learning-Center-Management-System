import assert from 'node:assert/strict';
import { test, after } from 'node:test';
import { createServer } from 'vite';
const server = await createServer({ configFile: false, server: { middlewareMode: true, watch: null }, appType: 'custom' });
const selection = await server.ssrLoadModule('/src/BLL/services/userSelection.ts');
const original = globalThis.fetch;
after(async () => { globalThis.fetch = original; await server.close(); });
const values = new Map();
globalThis.localStorage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
const user = (id, role) => ({ userId: id, userCode: 'DB-' + id, fullName: 'Database account ' + id, status: 'active', roles: [role] });
test('role selection discovers database IDs without seed IDs, credentials or principal', async () => {
  const calls = []; values.set('edutrack-selected-user:teacher', '3');
  globalThis.window = { location: { pathname: '/teacher/schedule' } };
  globalThis.fetch = async (url, options) => { calls.push({ url, options }); return Response.json([user(701, 'teacher'), user(905, 'teacher')]); };
  await selection.loadSelection('teacher');
  assert.equal((await selection.currentSelectedUser()).userId, 701);
  assert.equal(calls.length, 1); assert.equal(calls[0].options.credentials, 'omit');
  assert.equal(calls[0].options.headers, undefined);
  selection.chooseUser('teacher', 905);
  assert.equal(await selection.selectedUrl('/api/schedule/sessions?from=2027-01-01'), '/api/schedule/sessions?from=2027-01-01&userId=905');
});
test('role-specific data choices do not retain the preceding role account', async () => {
  globalThis.window.location.pathname = '/admin-staff/notifications';
  globalThis.fetch = async () => Response.json([user(811, 'admin_staff')]);
  assert.equal((await selection.currentSelectedUser()).userId, 811);
  assert.equal(selection.getSelection('teacher').user.userId, 905);
  assert.equal(await selection.selectedUrl('/api/management/notifications/sent', 'senderId'), '/api/management/notifications/sent?senderId=811');
});
test('API errors, empty roles and malformed role data never produce a seed fallback', async () => {
  globalThis.fetch = async () => new Response('{}', { status: 500 });
  await selection.loadSelection('center_manager'); assert.equal(selection.getSelection('center_manager').user, undefined);
  assert.match(selection.getSelection('center_manager').error, /500/);
  globalThis.fetch = async () => Response.json([]); await selection.loadSelection('center_manager', true);
  assert.equal(selection.getSelection('center_manager').user, undefined);
  globalThis.fetch = async () => Response.json([user(1, 'student')]); await selection.loadSelection('center_manager', true);
  assert.equal(selection.getSelection('center_manager').user, undefined);
});
