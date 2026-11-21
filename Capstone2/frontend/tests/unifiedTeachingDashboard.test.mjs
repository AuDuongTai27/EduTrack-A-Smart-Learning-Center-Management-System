import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

const root = new URL('../src/GUIs/components/', import.meta.url);
const compiled = new Map();
// Load real presentation components; only the inbox hook is replaced with a controlled snapshot.
async function component(url) {
  if (compiled.has(url.href)) return compiled.get(url.href);
  let source = fs.readFileSync(url, 'utf8').replace(/import type[\s\S]*?;/g, '');
  const imports = [...source.matchAll(/(?:from\s*|import\s*)['"]([^'"]+)['"]/g)];
  for (const [, specifier] of imports) {
    let resolved;
    if (specifier.endsWith('.css')) { source = source.replace(new RegExp(`import ['"]${specifier.replaceAll('.', '\\.')}['"];?`), ''); continue; }
    if (specifier.includes('hooks/useNotificationInbox')) {
      resolved = 'data:text/javascript,' + encodeURIComponent('export function useNotificationInbox(){return globalThis.__teachingVisualInbox;}');
    } else if (specifier.endsWith('.svg')) {
      resolved = 'data:text/javascript,' + encodeURIComponent(`export default ${JSON.stringify(path.basename(specifier))}`);
    } else if (specifier.startsWith('.')) {
      const target = new URL(specifier, url);
      const extension = ['.tsx', '.ts'].find(ext => fs.existsSync(new URL(target.href + ext)));
      resolved = extension ? await moduleUrl(new URL(target.href + extension)) : target.href;
    } else { resolved = import.meta.resolve(specifier); }
    source = source.replaceAll(`'${specifier}'`, JSON.stringify(resolved)).replaceAll(`"${specifier}"`, JSON.stringify(resolved));
  }
  let output = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext } }).outputText;
  output = output.replaceAll('"react/jsx-runtime"', JSON.stringify(import.meta.resolve('react/jsx-runtime')));
  const result = `data:text/javascript;base64,${Buffer.from(output).toString('base64')}`;
  compiled.set(url.href, result);
  return result;
}
const moduleUrl = component;
const load = async file => import(await component(new URL(file, root)));
const render = (Component, props) => renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(Component, props)));

for (const role of ['Teacher', 'TeachingAssistant']) {
  const { default: Kpis } = await load(`teacher/${role}/dashboard/${role}KpiCards.tsx`);
  const { default: Greeting } = await load(`teacher/${role}/dashboard/GreetingSection.tsx`);
  const { default: Classes } = await load(`teacher/${role}/dashboard/TodayClassesSection.tsx`);
  const prefix = role === 'Teacher' ? '/teacher' : '/teaching-assistant';

  test(`${role} preserves the four KPI titles and values without footer text or dividers`, () => {
    const html = render(Kpis, { activeAssignments: 12, assignmentsDueToday: 7, activeClasses: 4, classesToday: 3, totalStudents: 126, pendingAttendance: 2 });
    for (const text of ['Active Assignments', role === 'Teacher' ? 'Assigned Classes' : 'Active Classes', 'My Students', 'Pending Attendance']) assert.ok(html.includes(text), text);
    assert.deepEqual([...html.matchAll(/<h3[^>]*>(\d+)<\/h3>/g)].map(m => Number(m[1])), [12, 4, 126, 2]);
    assert.equal((html.match(/cm-kpi-watermark/g) || []).length, 4);
    assert.doesNotMatch(html, /<a\b|<button\b|onClick|teaching-kpi-support|border-top|need grading|classes today|across assigned classes|needs attendance/);
    assert.match(render(Kpis, { pendingAttendance: 1 }), />1<\/h3>/);
  });

  test(`${role} banner preserves caller greeting, actual name and subtitle without actions`, () => {
    const html = render(Greeting, { name: 'Trần Minh Anh', greeting: 'Welcome', message: 'Existing role-specific message' });
    assert.ok(html.includes('Welcome') && html.includes('Trần Minh Anh') && html.includes('Existing role-specific message'));
    assert.match(html, role === 'Teacher' ? /academy-books-cap\.svg/ : /staff-welcome\.svg/);
    assert.doesNotMatch(html, /<a\b|<button\b/);
  });

  test(`${role} banner formats the actual instant using the center date across midnight`, () => {
    const RealDate = globalThis.Date;
    try {
      for (const [instant, day, label] of [
        ['2026-11-20T16:59:59Z', '2026-11-20', 'Friday, November 20, 2026'],
        ['2026-11-20T17:00:00Z', '2026-11-21', 'Saturday, November 21, 2026'],
      ]) {
        globalThis.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : [instant])); } };
        const html = render(Greeting, { name: 'Trần Minh Anh', greeting: 'Welcome', message: 'Existing message' });
        assert.ok(html.includes(label));
        assert.ok(html.includes('dateTime="' + day + '"'));
        assert.equal((html.match(/bi-calendar3/g) || []).length, 1);
      }
    } finally { globalThis.Date = RealDate; }
  });

  test(`${role} keeps class actions, filtering, row limit and a single schedule arrow`, () => {
    const RealDate = globalThis.Date;
    globalThis.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : ['2026-11-20T12:00:00+07:00'])); } };
    try {
      const classes = Array.from({ length: 5 }, (_, i) => ({ id: i + 1, sessionId: i + 101, className: `Class ${i + 1}`, timePeriod: 'Today', startTime: i ? '23:00' : '00:00', endTime: '23:59', studentsCount: 26 }));
      classes.push({ id: 99, className: 'Completed class', status: 'Completed' });
      const html = render(Classes, { classes });
      assert.match(html, new RegExp(`href="${prefix}/schedule"`));
      assert.match(html, new RegExp(`href="${prefix}/classes/1/attendance\\?sessionId=101"`));
      assert.match(html, new RegExp(`href="${prefix}/classes/2"`));
      assert.ok(html.includes('Take Attendance') && html.includes('View Class') && html.includes('2 more class'));
      assert.doesNotMatch(html, /Completed class|Class 4|Class 5|→/);
      assert.equal((html.match(/class="bi bi-arrow-right"/g) || []).length, 1);
      const empty = render(Classes, { classes: [] });
      assert.ok(empty.includes('No classes scheduled for today.') && empty.includes('teaching-calendar-empty'));
    } finally { globalThis.Date = RealDate; }
  });
}

const { default: Notifications } = await load('shared/notifications/TeachingDashboardNotifications.tsx');
test('Teaching notifications preserve unread content, sender, date, count and destination', () => {
  globalThis.__teachingVisualInbox = { data: { unreadCount: 2 }, quick: [
    { notificationId: 7, title: 'Unread teaching notice', content: 'Existing message', senderName: 'Academic Team', type: 'schedule', isRead: false, createdAt: '2026-11-20T05:00:00Z' },
    { notificationId: 8, title: 'Read notice', content: 'Hidden by the existing rule', type: 'system', isRead: true, createdAt: '2026-11-20T05:00:00Z' },
  ], basePath: '/teacher/notifications', store: { refresh() {} } };
  const html = render(Notifications);
  for (const text of ['Unread teaching notice', 'Existing message', 'Academic Team', '2 new', 'New!']) assert.ok(html.includes(text), text);
  assert.match(html, /href="\/teacher\/notifications\?notificationId=7"/);
  assert.match(html, /dateTime="2026-11-20T05:00:00Z"/i);
  assert.doesNotMatch(html, /Read notice|Hidden by/);
  assert.equal((html.match(/class="bi bi-arrow-right"/g) || []).length, 1);
  globalThis.__teachingVisualInbox.error = 'Inbox unavailable';
  assert.ok(render(Notifications).includes('Inbox unavailable'));
  globalThis.__teachingVisualInbox = { ...globalThis.__teachingVisualInbox, error: null, data: null, loading: true };
  assert.ok(render(Notifications).includes('Loading notifications...'));
});
