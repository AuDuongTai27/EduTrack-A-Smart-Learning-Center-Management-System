import assert from 'node:assert/strict';
import { test, after } from 'node:test';
import { createServer } from 'vite';
const vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
after(() => vite.close());
const ui = await vite.ssrLoadModule('/src/BLL/services/notificationPresentation.ts');
test('notification labels preserve eight API types, five primary roles and legacy Parent display', () => {
  assert.deepEqual(Object.keys(ui.notificationTypes), ['announcement', 'academic', 'tuition', 'reminder', 'schedule', 'system', 'homework', 'class']);
  assert.deepEqual(Object.keys(ui.notificationRoles), ['center_manager', 'admin_staff', 'teacher', 'teaching_assistant', 'student']);
  assert.equal(ui.notificationTypeLabel('announcement'), 'Thông báo chung');
  assert.equal(ui.notificationRoleLabel('parent'), 'Phụ huynh (tài khoản hiện có)');
  assert.equal(ui.notificationRoleLabel('teaching_assistant'), 'Trợ giảng (Teaching Assistant)');
  assert.deepEqual(Object.keys(ui.notificationRecipientRoles), Object.keys(ui.notificationRoles));
  assert.equal(ui.notificationRecipientRoles.student, 'Học viên / Phụ huynh (Student / Parent)');
  assert.equal(ui.notificationRoles.student, 'Học viên (Student)');
  for (const role of Object.keys(ui.notificationRoles).filter(role => role !== 'student'))
    assert.equal(ui.notificationRecipientRoles[role], ui.notificationRoles[role]);
  assert.equal(ui.studentParentNotificationHint, 'Thông báo gửi đến học viên cũng được gửi cho phụ huynh liên kết.');
});
test('compose rejects whitespace, missing scope target and over-limit input; exact limits remain valid', () => {
  const errors = ui.notificationDraftErrors('   ', '\n ', 'user', '');
  assert.ok(errors.title && errors.content && errors.target);
  assert.deepEqual(ui.notificationDraftErrors('a'.repeat(200), 'b'.repeat(4000), 'all', ''), { title: '', content: '', target: '' });
  assert.ok(ui.notificationDraftErrors('a'.repeat(201), 'b'.repeat(4001), 'all', '').title);
  assert.ok(ui.notificationDraftErrors('a'.repeat(201), 'b'.repeat(4001), 'all', '').content);
  for (const scope of ['role', 'class', 'user']) {
    assert.ok(ui.notificationDraftErrors('Title', 'Content', scope, '').target);
    assert.equal(ui.notificationDraftErrors('Title', 'Content', scope, '501').target, '');
  }
});
