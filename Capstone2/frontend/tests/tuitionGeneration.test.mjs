import assert from 'node:assert/strict';
import { before, after, test } from 'node:test';
import { createServer } from 'vite';
let server, filter, api;
const original = globalThis.fetch;
before(async () => {
  server = await createServer({ configFile: false, server: { middlewareMode: true, watch: null, ws: false }, appType: 'custom' });
  ({ filterTuitionInvoices: filter } = await server.ssrLoadModule('/src/BLL/services/tuitionFilterService.ts'));
  ({ tuitionGenerationApi: api } = await server.ssrLoadModule('/src/api/tuitionGenerationApi.ts'));
});
after(async () => { globalThis.fetch = original; await server?.close(); });
const defaults = { grade: 'All', classId: 'All', month: '', year: '', search: '', status: 'All' };
const rows = [{ invoiceId: 1, classId: 10, classGradeId: 70, studentName: 'Historical Student', studentCode: 'STU1', periodMonth: 11, periodYear: 2026, amountDue: 100, status: 'paid', gradeId: 80 },
  { invoiceId: 2, classId: 20, classGradeId: 80, studentName: 'Other Student', studentCode: 'STU2', periodMonth: 10, periodYear: 2026, amountDue: 200, status: 'unpaid' }];
test('Grade classification follows Class and preserves historical Student Grade changes', () => {
  assert.deepEqual(filter(rows, [], { ...defaults, grade: '70' }).map(r => r.invoiceId), [1]);
  assert.deepEqual(filter(rows, [{ classId: 10, gradeId: 90 }], { ...defaults, grade: '90' }).map(r => r.invoiceId), [1]);
  assert.equal(filter(rows, [{ classId: 10, gradeId: null }], { ...defaults, grade: '70' }).length, 0, 'an explicitly unclassified Class cannot inherit a stale Grade');
  assert.equal(filter(rows, [], defaults).length, 2);
});
test('Class, billing month/year, Student code and status filters intersect before pagination', () => {
  assert.equal(filter(rows, [], { ...defaults, classId: '10', month: '11', year: '2026', search: 'stu1', status: 'Paid' }).length, 1);
  assert.equal(filter(rows, [], { ...defaults, month: '10', search: 'stu1' }).length, 0);
  assert.equal(filter(rows, [], { ...defaults, year: '2027' }).length, 0);
});
const request = { mode: 'grade', gradeId: 70, periodMonth: 11, periodYear: 2026 };
const response = { ...request, billingPolicy: 'monthly-fixed-v1', previewToken: 'real', rows: [], classes: [], created: 0, eligibleCount: 0, alreadyExists: 0, ineligible: 0, failed: 0, classCount: 0, studentCount: 0, totalAmount: 0 };
test('Preview and Confirm use separate real endpoints and preserve server totals', async () => {
  const calls = []; globalThis.fetch = async (url, init) => { calls.push({ url, body: JSON.parse(init.body) }); return Response.json(response); };
  assert.deepEqual(await api.preview(request), response);
  await api.confirm({ ...request, previewToken: 'real' });
  assert.ok(calls[0].url.endsWith('/generation/preview')); assert.ok(calls[1].url.endsWith('/generation/confirm'));
  assert.equal(calls[1].body.previewToken, 'real');
});
test('Mismatched period or invalid monetary totals are never treated as confirmed success', async () => {
  globalThis.fetch = async () => Response.json({ ...response, periodMonth: 12 }); await assert.rejects(api.confirm(request));
  globalThis.fetch = async () => Response.json({ ...response, totalAmount: -1 }); await assert.rejects(api.preview(request));
});
test('Stale Preview and ambiguous connection failures require inspection before retry', async () => {
  globalThis.fetch = async () => Response.json({ message: 'Preview đã cũ' }, { status: 409 }); await assert.rejects(api.confirm(request), /Preview/);
  globalThis.fetch = async () => { throw new TypeError('connection lost'); }; await assert.rejects(api.confirm(request), /Preview/);
});
test('Monthly Preview exposes monthly fee, invoice amount and billing-period deadline without session evidence', async () => {
  const data = { ...response, rows: [{ classId: 10, studentId: 1, outcome: 'eligible', amountDue: 900000, monthlyFee: 1000000, dueDate: '2026-11-10' }] };
  globalThis.fetch = async () => Response.json(data);
  const actual = await api.preview(request);
  assert.equal(actual.rows[0].monthlyFee, 1000000);
  assert.equal(actual.rows[0].amountDue, 900000);
  assert.equal(actual.rows[0].dueDate, '2026-11-10');
});
test('Retired session-based backend cannot be mistaken for current monthly policy', async () => {
  globalThis.fetch = async () => Response.json({ ...response, billingPolicy: 'sessions-v1' });
  await assert.rejects(api.preview(request), /Backend/);
  globalThis.fetch = async () => Response.json({ ...response, rows: [{ outcome: 'estimated', amountDue: 0 }] });
  await assert.rejects(api.preview(request), /Backend/);
});
test('Individual manual fee is explicit in the request and never silently recalculated by frontend', async () => {
  const individual = { ...request, mode: 'individual', classId: 10, studentId: 1, amountDue: 300000 };
  let sent;
  globalThis.fetch = async (url, init) => { sent = JSON.parse(init.body); return Response.json({ ...response, mode: 'individual' }); };
  await api.preview(individual);
  assert.equal(sent.amountDue, 300000);
  assert.equal(sent.periodMonth, 11);
});
