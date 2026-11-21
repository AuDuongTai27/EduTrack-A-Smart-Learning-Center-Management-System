import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { calculateTuitionMetrics } from '../src/BLL/services/tuitionMetricsService.ts';
import { countPendingIncomingRequests, getMyRequests, loadDashboardSection } from '../src/BLL/services/adminStaffDashboardService.ts';

const sourceRoot = new URL('../src/', import.meta.url);
const dataUrl = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
function compile(source) {
  let output = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext } }).outputText;
  for (const quote of ['"', "'"]) output = output.replaceAll(`${quote}react/jsx-runtime${quote}`, JSON.stringify(import.meta.resolve('react/jsx-runtime')));
  return output;
}
const cardSource = fs.readFileSync(new URL('GUIs/components/admin/ManagementDashboardKpi.tsx', sourceRoot), 'utf8');
const cardUrl = dataUrl(compile(cardSource).replace("'../../utils/formatCurrency'", JSON.stringify(new URL('GUIs/utils/formatCurrency.ts', sourceRoot).href)));

// Render the actual page KPI JSX with controlled query states, without fetching data or altering production code.
async function loadGrid(role) {
  const file = new URL(`GUIs/pages/admin/${role}/${role}DashboardPage.tsx`, sourceRoot);
  const source = ts.createSourceFile(file.pathname, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let grid;
  function visit(node) {
    if (ts.isJsxElement(node) && node.openingElement.attributes.properties.some(attribute =>
      ts.isJsxAttribute(attribute) && attribute.name.text === 'className' && attribute.initializer
      && ts.isStringLiteral(attribute.initializer) && /(?:cm-dashboard-kpis|staff-dashboard-kpis)/.test(attribute.initializer.text))) grid = node;
    ts.forEachChild(node, visit);
  }
  visit(source);
  assert.ok(grid, `${role} grid exists`);
  const jsx = ts.createPrinter().printNode(ts.EmitHint.Unspecified, grid, source);
  const module = await import(dataUrl(compile(`import KpiCard from ${JSON.stringify(cardUrl)};
    export default function Grid(props) {
      const { dashboard, pendingRequests, totalOutstanding, usersReady, classesReady, metrics, monthlyCollected, tuitionMetrics, pendingState } = props;
      return (${jsx});
    }`)));
  return props => renderToStaticMarkup(React.createElement(module.default, props));
}
const manager = await loadGrid('CenterManager');
const staff = await loadGrid('AdminStaff');
const managerData = {
  usersReady: true, classesReady: true, metrics: { studentCount: 14, activeClassesCount: 7, staffCount: 9 },
  monthlyCollected: 876543210, tuitionMetrics: { outstanding: 999999999999, overdueAmount: 123456789012 }, pendingState: { loading: false, error: null, requests: Array(8) },
};
const staffData = {
  dashboard: { students: { data: 14 }, tuition: { data: { unpaidCount: 3 } }, requests: { data: Array(7) }, incomingPending: { data: 3 } },
  totalOutstanding: 123456789012, pendingRequests: Array(2),
};
function assertDisplayOnly(html, count) {
  assert.equal((html.match(/class="card dashboard-kpi /g) || []).length, count);
  assert.equal((html.match(/class="kpi-icon /g) || []).length, count);
  assert.equal((html.match(/<h3/g) || []).length, count);
  assert.equal((html.match(/<p /g) || []).length, count);
  assert.doesNotMatch(html, /<a\b|<button\b|border-top|View (?:list|progress|tuition)|Awaiting your review/);
}

test('manager renders six display-only KPIs, including icons on both tuition cards', () => {
  const html = manager(managerData);
  assertDisplayOnly(html, 6);
  assert.match(html, /Monthly Tuition Collected/);
  assert.match(html, /Overdue Tuition/);
  assert.match(html, />8<\/h3>/);
  assert.equal((html.match(/class="cm-kpi-watermark" aria-hidden="true"/g) || []).length, 6);

});

test('staff renders four display-only KPIs and shows pending count rather than total sent', () => {
  const html = staff(staffData);
  assertDisplayOnly(html, 4);
  assert.equal((html.match(/class="cm-kpi-watermark" aria-hidden="true"/g) || []).length, 4);
  assert.match(html, /Pending Approval Requests/);
  assert.match(html, />2<\/h3>/);
  assert.doesNotMatch(html, />7<\/h3>/);
});

test('both dashboards retain every digit of VND amounts', () => {
  for (const html of [manager(managerData), staff(staffData)]) {
    assert.match(html, /123\.456\.789\.012/);
    assert.match(html, />VND<\/span>/);
    assert.doesNotMatch(html, /123\.4[MBK]/);
  }
});

test('missing query results remain unavailable, while a successful empty request list is zero', () => {
  const html = staff({ dashboard: null, pendingRequests: [], totalOutstanding: null });
  assert.equal((html.match(/—/g) || []).length, 4);
  assert.doesNotMatch(html, />0<\/h3>/);
  assert.match(staff({ ...staffData, dashboard: { ...staffData.dashboard, requests: { data: [] } }, pendingRequests: [] }), />0<\/h3>/);
  assert.match(manager({ ...managerData, pendingState: { loading: true, error: null, requests: [] } }), /Loading…/);
  assert.match(manager({ ...managerData, pendingState: { loading: false, error: 'HTTP 503', requests: [] } }), />—<\/h3>/);
});

test('final KPI names, semantic icon and color match across both roles', () => {
  const cm = manager(managerData), as = staff(staffData);
  for (const html of [cm, as]) {
    assert.match(html, /bg-primary-subtle text-primary-emphasis" data-kpi-icon="Graduation cap"/);
    assert.match(html, /bg-info-subtle text-info-emphasis" data-kpi-icon="Clipboard"/);
  }
  assert.match(cm, /bg-info-subtle text-info-emphasis" data-kpi-icon="Book"/);
  assert.match(cm, /bg-warning-subtle text-warning-emphasis" data-kpi-icon="Users"/);
  assert.match(cm, /bg-primary-subtle text-primary-emphasis" data-kpi-icon="Banknote"/);
  assert.match(cm, /bg-danger-subtle text-danger-emphasis" data-kpi-icon="Circle alert"/);
  assert.match(as, /bg-warning-subtle text-warning-emphasis" data-kpi-icon="Wallet"/);
  assert.match(as, /bg-warning-subtle text-warning-emphasis" data-kpi-icon="Message square"/);
  assert.match(as, /Pending Feedback &amp; Requests/);
  assert.doesNotMatch(as, /Tuition Invoices Due|Total Active Students/);
  assert.doesNotMatch(cm, /999\.999\.999\.999/); // outstanding must not feed Overdue Tuition
});

test('future invoices and invoices due today contribute to outstanding but not overdue', () => {
  const invoices = [
    { invoiceId: 1, amountDue: 800, dueDate: '2026-11-17', status: 'unpaid' },
    { invoiceId: 2, amountDue: 500, dueDate: '2026-11-18', status: 'unpaid' },
    { invoiceId: 3, amountDue: 1000, dueDate: '2026-11-19', status: 'unpaid' },
  ];
  const metrics = calculateTuitionMetrics(invoices, [{ invoiceId: 1, amount: 200, paidAt: '2026-11-18T05:00:00Z' }], new Date('2026-11-18T05:00:00Z'));
  assert.equal(metrics.outstanding, 2100);
  assert.equal(metrics.overdueAmount, 600);
  assert.equal(metrics.overdueCount, 1);
});

const incoming = (id, overrides = {}) => ({ requestId: id, requestedBy: 100 + id, requesterRole: 'student', requestType: 'class_transfer', status: 'pending', reviewedBy: null, createdAt: '2026-11-18', ...overrides });

test('incoming count includes Waiting and Under Review for all verified roles and aliases', () => {
  const roles = ['student', 'parent', 'teacher', 'ta', 'teaching_assistant', ' TeachingAssistant '];
  assert.equal(countPendingIncomingRequests(roles.map((requesterRole, i) => incoming(i, { requesterRole, reviewedBy: i % 2 ? 99 : null }))), 6);
});

test('resolved records and outgoing requests never increase incoming, irrespective of name, type or reviewer', () => {
  const rows = [incoming(1), incoming(2, { status: 'approved' }), incoming(3, { status: 'rejected' }),
    ...['admin_staff', 'center_manager', 'adminstaff', 'centermanager'].map((requesterRole, i) => incoming(i + 4, { requesterRole, requestType: 'feedback', requesterName: 'Student', reviewedBy: 77, requestedBy: 42 })),
  ];
  assert.equal(countPendingIncomingRequests(rows), 1);
  const outgoing = getMyRequests(rows, 42);
  assert.equal(outgoing.length, 4);
  assert.ok(outgoing.every(row => row.requestedBy === 42));
});

test('missing or unsupported pending requester roles produce unavailable instead of an inferred total', () => {
  for (const role of [null, '', 'unknown']) assert.throws(() => countPendingIncomingRequests([incoming(1, { requesterRole: role, requestedBy: 2, requesterName: 'Teacher' })]), /unavailable/);
  assert.equal(countPendingIncomingRequests([]), 0);
});

test('failed incoming API result is unavailable rather than zero', async () => {
  const result = await loadDashboardSection(Promise.reject(new Error('HTTP 503')));
  assert.equal(result.data, null);
  assert.match(result.error, /503/);
  const html = staff({ ...staffData, dashboard: { ...staffData.dashboard, incomingPending: result } });
  assert.match(html, /Pending Feedback &amp; Requests<\/p><h3 class="mb-0">—<\/h3>/);
});
