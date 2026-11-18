import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { getManagerPendingRequests } from '../src/BLL/services/centerManagerDashboardService.ts';

const request = (id, overrides = {}) => ({ requestId: id, requestCode: `REQ-${id}`, title: `Request ${id}`, requestType: 'class_transfer', requestedBy: 42, requesterName: 'Staff Member', requesterRole: 'admin_staff', priority: 'medium', status: 'pending', createdAt: '2026-11-18T08:00:00', ...overrides });

test('manager scope uses API roles and pending status, including under-review requests', () => {
  const result = getManagerPendingRequests([
    request(1), request(2, { reviewedBy: 7 }), request(3, { status: 'approved' }),
    request(4, { requesterRole: 'teacher', requesterName: 'Admin Staff' }),
    request(5, { requesterRole: 'parent' }), request(6, { requestedBy: 7 }),
    request(7, { status: 'rejected' }), request(8, { requesterRole: ' ADMIN_STAFF ', status: ' Pending ' }),
  ], 7);
  assert.deepEqual(result.map(row => row.requestId), [1, 2, 8]);
});

test('priority sorts high to low, then oldest first without mutating API data', () => {
  const rows = [request(1, { priority: 'low' }), request(2, { priority: 'high' }), request(3, { priority: 'high', createdAt: '2026-11-01T08:00:00' }), request(4)];
  assert.deepEqual(getManagerPendingRequests(rows, 7).map(row => row.requestId), [3, 2, 4, 1]);
  assert.deepEqual(rows.map(row => row.requestId), [1, 2, 3, 4]);
});

test('missing role or manager identity yields an error instead of a fabricated count', () => {
  assert.throws(() => getManagerPendingRequests([request(1, { requesterRole: null, requestedBy: 2 })], 7), /requester roles/);
  assert.throws(() => getManagerPendingRequests([], 0), /Center Manager account/);
  assert.deepEqual(getManagerPendingRequests([], 7), []);
});

// Compile the real presentation component using the project's existing TypeScript dependency.
const componentUrl = new URL('../src/GUIs/components/admin/CenterManager/PendingApprovalRequestsCard.tsx', import.meta.url);
let compiled = ts.transpileModule(fs.readFileSync(componentUrl, 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext } }).outputText;
for (const specifier of ['react/jsx-runtime', 'react-router-dom']) {
  for (const quote of ['"', "'"]) compiled = compiled.replaceAll(`${quote}${specifier}${quote}`, JSON.stringify(import.meta.resolve(specifier)));
}
compiled = compiled.replace("'../../../../BLL/services/centerManagerDashboardService'", JSON.stringify(new URL('../src/BLL/services/centerManagerDashboardService.ts', import.meta.url).href));
const { default: Card } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const render = props => renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(Card, { requests: [], loading: false, error: null, retry() {}, ...props })));

test('loading, empty and failed states are distinct and include View All', () => {
  assert.match(render({ loading: true }), /Loading approval requests/);
  assert.doesNotMatch(render({ loading: true }), /No pending/);
  assert.match(render({}), /No pending approval requests/);
  const error = render({ error: 'HTTP 403' });
  assert.match(error, /Unable to load/);
  assert.match(error, /Retry/);
  assert.doesNotMatch(error, /No pending/);
  assert.match(error, /href="\/center-manager\/approval-requests"/);
});

test('the list shows at most five while the shared pending collection retains the full total', () => {
  const requests = getManagerPendingRequests(Array.from({ length: 8 }, (_, i) => request(i + 1)), 7);
  assert.equal(requests.length, 8);
  const html = render({ requests });
  assert.equal((html.match(/<li>/g) || []).length, 5);
  assert.doesNotMatch(html, /REQ-6/);
  for (const value of ['REQ-1', 'Request 1', 'Class Transfer', 'Staff Member', 'Submitted:', 'Pending', 'Medium priority']) assert.ok(html.includes(value), value);
});

test('long titles remain complete and HTML content is escaped', () => {
  const title = 'Long request '.repeat(50) + '<script>alert(1)</script>';
  const html = render({ requests: [request(1, { title })] });
  assert.ok(html.includes('Long request '.repeat(50)));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.doesNotMatch(html, /<script>/);
});
