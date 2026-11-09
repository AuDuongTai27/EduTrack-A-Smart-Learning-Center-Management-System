import assert from 'node:assert/strict';
import { before, after, test } from 'node:test';
import { createServer } from 'vite';
let server, actions, status;
before(async () => {
  server = await createServer({ configFile: false, server: { middlewareMode: true, watch: null, ws: false }, appType: 'custom' });
  ({ tuitionActions: actions } = await server.ssrLoadModule('/src/BLL/services/tuitionActionService.ts'));
  ({ tuitionPaymentStatus: status } = await server.ssrLoadModule('/src/BLL/services/tuitionPolicyService.ts'));
});
after(async () => { await server?.close(); });
const invoice = { invoiceId: 1, amountDue: 1000000, paidAmount: 0, dueDate: '2026-11-10', status: 'unpaid' };
test('Unpaid invoice without receipts permits edit/payment; stored Paid alone proves nothing', () => {
  const actual = actions({ ...invoice, status: 'paid' }, true, false);
  assert.equal(actual.canEdit, true); assert.equal(actual.canPay, true); assert.equal(actual.settled, false);
  assert.equal(status(1000000, 0, invoice.dueDate, 'paid', new Date('2026-11-01T00:00:00Z')), 'unpaid');
});
test('600000 of 1000000 is partial, with 400000 remaining and financial edits locked', () => {
  const actual = actions({ ...invoice, paidAmount: 600000 }, true, true);
  assert.equal(actual.remaining, 400000); assert.equal(actual.partiallyPaid, true);
  assert.equal(actual.canEdit, false); assert.equal(actual.canPay, true);
  assert.equal(status(1000000, 600000, invoice.dueDate, 'paid', new Date('2026-11-01T00:00:00Z')), 'unpaid');
  assert.equal(status(1000000, 600000, invoice.dueDate, 'unpaid', new Date('2026-11-10T17:00:00Z')), 'overdue');
});
test('Fully settled invoice cannot reopen Edit/Payment even with stale Unpaid status', () => {
  const actual = actions({ ...invoice, paidAmount: 1000000 }, true, true);
  assert.equal(actual.remaining, 0); assert.equal(actual.canEdit, false); assert.equal(actual.canPay, false);
  assert.equal(status(1000000, 1000000, invoice.dueDate, 'unpaid'), 'paid');
});
test('Pending adjustment is retained and cannot be entered or exited by the actions helper', () => {
  const actual = actions({ ...invoice, status: 'pending_adjustment', paidAmount: 600000 }, true, true);
  assert.equal(actual.canEdit, false); assert.equal(actual.canPay, true);
  assert.equal(status(1000000, 1000000, invoice.dueDate, 'pending_adjustment'), 'pending_adjustment');
});
test('Unknown payment data is not zero receipts, and any persisted receipt locks editing', () => {
  const unknown = actions(invoice, false, false);
  assert.equal(unknown.remaining, null); assert.equal(unknown.canEdit, false); assert.equal(unknown.canPay, false);
  assert.equal(actions(invoice, true, true).canEdit, false);
});
test('Invalid AmountDue never resolves Paid or enables ordinary Payment', () => {
  for (const amountDue of [0, -1, 0.001, NaN, 10000000000]) {
    assert.notEqual(status(amountDue, 100000000000, invoice.dueDate, 'paid'), 'paid');
    assert.equal(actions({ ...invoice, amountDue }, true, false).canPay, false);
  }
});
