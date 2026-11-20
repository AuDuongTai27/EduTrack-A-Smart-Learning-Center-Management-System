import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

// Render the production presentation functions with a controlled inbox, without network/store effects.
const sourceUrl = new URL('../src/GUIs/components/shared/notifications/NotificationQuickViews.tsx', import.meta.url);
const source = ts.createSourceFile(sourceUrl.pathname, fs.readFileSync(sourceUrl, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const printer = ts.createPrinter();
const functions = source.statements.filter(node => ts.isFunctionDeclaration(node)
  && ['TypeIcon', 'QuickList', 'DashboardNotificationsCard'].includes(node.name?.text))
  .map(node => printer.printNode(ts.EmitHint.Unspecified, node, source)).join('\n');
const empty = fs.readFileSync(new URL('../src/GUIs/components/shared/notifications/NotificationEmptyState.tsx', import.meta.url), 'utf8').replace('export default ', '');
let compiled = ts.transpileModule(`import { Link } from 'react-router-dom';
  let inbox;
  export function setInbox(value) { inbox = value; }
  function useNotificationInbox() { return inbox; }
  const notificationTime = value => value;
  const notificationTypeLabel = value => value;
  ${empty}\n${functions}`, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext } }).outputText;
for (const specifier of ['react/jsx-runtime', 'react-router-dom']) {
  for (const quote of ['"', "'"]) compiled = compiled.replaceAll(`${quote}${specifier}${quote}`, JSON.stringify(import.meta.resolve(specifier)));
}
const { DashboardNotificationsCard, setInbox } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const render = (props, model) => {
  setInbox({ data: { unreadCount: 3 }, quick: [], store: { refresh() {} }, basePath: '/center-manager/notifications', ...model });
  return renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(DashboardNotificationsCard, props)));
};

test('Center Manager header link preserves notification count, destination and each inbox state', () => {
  for (const [model, expected] of [
    [{}, 'all caught up'],
    [{ data: null, loading: true }, 'Loading notifications...'],
    [{ error: 'Service unavailable' }, 'Service unavailable'],
    [{ quick: [{ notificationId: 7, title: 'Unread notice', content: 'Message', type: 'announcement', isRead: false, createdAt: '2026-11-18' }] }, 'Unread notice'],
  ]) {
    const html = render({ viewAllInHeader: true }, model);
    assert.ok(html.includes(expected));
    assert.equal((html.match(/>View All <i class="bi bi-arrow-right" aria-hidden="true"><\/i><\/a>/g) || []).length, 1);
    assert.match(html, /class="cm-panel-view-all academy-dashboard-link" href="\/center-manager\/notifications"/);
    assert.doesNotMatch(html, /class="ntf-view-all"/);
    assert.match(html, /aria-label="Unread notifications count"/);
    assert.ok(html.indexOf('>View All ') < html.indexOf(expected));
    if (model.quick) {
      assert.match(html, /href="\/center-manager\/notifications\?notificationId=7"/);
      assert.match(html, /ntf-unread/);
    }
  }
});

test('the default dashboard retains its footer link for other roles', () => {
  const html = render({}, { basePath: '/admin-staff/notifications' });
  assert.match(html, /class="ntf-view-all" href="\/admin-staff\/notifications"/);
  assert.doesNotMatch(html, /cm-panel-view-all|cm-panel-icon/);
  assert.ok(html.indexOf('>View All<') > html.indexOf('all caught up'));
  assert.match(html, /aria-label="Unread notifications count">3<\/span>/);
});
