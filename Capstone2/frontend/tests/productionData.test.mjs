import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import ts from 'typescript';

// Execute the actual clients and DAL against controlled HTTP responses, with no server or database.
const modules = new Map();
const moduleUrl = source => 'data:text/javascript;base64,' + Buffer.from(source).toString('base64');
const authUrl = moduleUrl('export const getAuthUser=()=>globalThis.__kan94Auth; export const getAuthHeaders=()=>({Authorization:"Bearer fixture"});');
async function load(file) {
  if (modules.has(file)) return modules.get(file);
  let source = fs.readFileSync(new URL('../src/' + file, import.meta.url), 'utf8');
  source = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  source = source.replaceAll('import.meta.env.VITE_API_URL', 'undefined');
  for (const [, specifier] of [...source.matchAll(/from ['"]([^'"]+)['"]/g)]) {
    let url;
    if (specifier.endsWith('/authApi') || specifier === './authApi') url = authUrl;
    else if (specifier === './parentDAL') url = moduleUrl('export const DEFAULT_PARENT_ID=9;');
    else if (specifier.includes('BLL/models')) url = moduleUrl('');
    else {
      const resolved = new URL(specifier + '.ts', new URL('../src/' + file, import.meta.url));
      const relative = resolved.pathname.split('/src/')[1];
      url = await load(relative);
    }
    source = source.replaceAll(`'${specifier}'`, JSON.stringify(url)).replaceAll(`"${specifier}"`, JSON.stringify(url));
  }
  const url = moduleUrl(source); modules.set(file, url); return url;
}
globalThis.__kan94Auth = { userId: 801, primaryRole: 'student', roles: ['student'], fullName: 'Fixture Learner' };
globalThis.localStorage = { getItem: () => null, setItem: () => {} };
const { learningDAL } = await import(await load('DAL/learningDAL.ts'));
const { teachingDAL } = await import(await load('DAL/teachingDAL.ts'));
const { downloadFile } = await import(await load('api/downloadFile.ts'));
const requests = [];
let reply;
globalThis.fetch = async (url, init) => {
  requests.push({ url, init });
  if (reply instanceof Error) throw reply;
  return new Response(JSON.stringify(reply.body), { status: reply.status || 200, headers: { 'content-type': 'application/json' } });
};
const learningReads = [
  () => learningDAL.getStudentDashboard(), () => learningDAL.getStudentProfile(),
  () => learningDAL.getParentChildrenOverview(), () => learningDAL.getStudentClassDetail(41),
  () => learningDAL.getStudentAssignmentDetail(51), () => learningDAL.getLearnerFeedbacks(801, 'student', 'Fixture Learner'),
  () => learningDAL.getStudentNotifications(), () => learningDAL.getParentNotifications(),
  () => learningDAL.getStudentUnreadCount(), () => learningDAL.getParentUnreadCount(),
];
const teachingReads = [
  () => teachingDAL.getDashboard(3), () => teachingDAL.getMyClasses(3), () => teachingDAL.getClassById(41),
  () => teachingDAL.getClassStudents(41), () => teachingDAL.getClassSessions(41),
  () => teachingDAL.getClassAssignments(41), () => teachingDAL.getAssignmentById(51),
  () => teachingDAL.getAssignmentSubmissions(51), () => teachingDAL.getAttendanceSheet(41),
  () => teachingDAL.getProfile(3), () => teachingDAL.getRequests(3), () => teachingDAL.getStudentProgressDetail(41, 801),
];
for (const [label, response] of [
  ['HTTP 500', { status: 500, body: { success: false } }],
  ['network failure', new TypeError('Failed to fetch')],
  ['unauthorized', { status: 401, body: {} }], ['forbidden', { status: 403, body: {} }],
  ['invalid success payload', { body: { success: true, data: null } }],
  ['unconfirmed response', { body: { success: false, data: [] } }],
]) test(`all confirmed getters reject ${label} instead of manufacturing data`, async () => {
  reply = response;
  for (const read of [...learningReads, ...teachingReads]) await assert.rejects(read);
});

test('valid empty lists remain empty across learner and teaching sections', async () => {
  reply = { body: { success: true, data: [] } };
  for (const read of [learningReads[2], learningReads[5], learningReads[6], learningReads[7],
    teachingReads[3], teachingReads[4], teachingReads[5], teachingReads[7]]) assert.deepEqual(await read(), []);
  assert.deepEqual((await teachingDAL.getMyClasses(3)).data, []);
  assert.equal(await learningDAL.getStudentUnreadCount(), 0);
  assert.equal(await learningDAL.getParentUnreadCount(), 0);
});

test('dashboard uses authenticated identity, real classes and confirmed zero KPIs', async () => {
  reply = { body: { success: true, data: { studentId: 801, studentCode: 'REAL801', fullName: 'Fixture Learner', enrolledClassesCount: 0, pendingAssignmentsCount: 0, classes: [] } } };
  const vm = await learningDAL.getStudentDashboard();
  assert.equal(vm.fullName, 'Fixture Learner'); assert.equal(vm.source, 'api');
  assert.equal(vm.enrolledClassesCount, 0); assert.deepEqual(vm.classes, []);
  assert.match(requests.at(-1).url, /student\/801\/dashboard$/);
  reply = { body: { success: true, data: { studentId: 801, studentName: 'Fixture Learner', totalUnpaidAmount: 0, unpaidInvoices: [], paymentHistory: [] } } };
  const tuition = await learningDAL.getStudentTuition();
  assert.deepEqual(tuition.bill.items, []);
  assert.equal(tuition.bill.dueDate, '');
  assert.doesNotMatch(tuition.bill.period, /October|2026/);
});

test('missing optional profile fields stay blank after load and confirmed update', async () => {
  reply = { body: { success: true, data: { userId: 801, fullName: 'Fixture Learner' } } };
  const profile = await learningDAL.getStudentProfile();
  for (const field of ['phone','email','address','dob','enrollDate','gender','avatarUrl']) assert.equal(profile[field], '');
  assert.deepEqual(await learningDAL.updateStudentProfile(profile), profile);
  reply = { body: { success: true, data: null } };
  await assert.rejects(() => learningDAL.updateStudentProfile(profile));
  await assert.rejects(() => teachingDAL.updateProfile(3, { fullName: 'Fixture Teacher' }));
});

test('upload failures and ambiguous upload responses never produce file URLs', async () => {
  const file = new File(['homework'], 'homework.pdf', { type: 'application/pdf' });
  for (const response of [{ status: 500, body: {} }, new TypeError('Offline'), { body: { success: false, fileUrl: '/fake.pdf' } }, { body: { success: true, fileUrl: '' } }]) {
    reply = response;
    await assert.rejects(() => learningDAL.uploadSubmissionFile(file));
    await assert.rejects(() => teachingDAL.uploadFile(file));
  }
  reply = { body: { success: true, fileUrl: '/uploads/confirmed.pdf', fileName: file.name } };
  assert.equal((await learningDAL.uploadSubmissionFile(file)).fileUrl, '/uploads/confirmed.pdf');
  assert.equal((await teachingDAL.uploadFile(file)).fileUrl, '/uploads/confirmed.pdf');
});

test('failed submissions, deletions, requests and evaluations reject without fake success', async () => {
  reply = { status: 500, body: { success: false } };
  await assert.rejects(() => learningDAL.submitHomework(51, 'real.pdf', '1', 6, '/uploads/real.pdf'));
  await assert.rejects(() => learningDAL.deleteSubmission(51));
  await assert.rejects(() => teachingDAL.createRequest({ title: 'Request', description: 'Details' }));
  await assert.rejects(() => teachingDAL.createStudentEvaluation(41, 801, { content: 'Feedback', evaluationType: 'attitude', rating: 'good' }));
  reply = { body: { success: true, data: null } };
  await assert.rejects(() => teachingDAL.createRequest({ title: 'Request', description: 'Details' }));
  await assert.rejects(() => teachingDAL.createStudentEvaluation(41, 801, { content: 'Feedback', evaluationType: 'attitude', rating: 'good' }));
  reply = { body: { success: false } }; await assert.rejects(() => learningDAL.deleteSubmission(51));
  const count = requests.length;
  await assert.rejects(() => learningDAL.submitHomework(51, 'real.pdf', '1'));
  assert.equal(requests.length, count, 'No constructed URL is submitted');
});

test('request and evaluation writes use the logged-in teacher or assistant', async () => {
  for (const role of ['teacher', 'teaching_assistant']) {
    globalThis.__kan94Auth = { userId: 888, fullName: 'Current ' + role, primaryRole: role, roles: [role] };
    reply = { body: { success: true, data: { requestId: 76 } } };
    assert.equal((await teachingDAL.createRequest({ title: 'Request', description: 'Details', requestedBy: 3 })).data.requestId, 76);
    assert.equal(JSON.parse(requests.at(-1).init.body).requestedBy, 888);
    reply = { body: { success: true, data: { id: 77 } } };
    assert.equal((await teachingDAL.createStudentEvaluation(41, 801, { content: 'Feedback', evaluationType: 'attitude', rating: 'good', evaluatorName: 'Wrong account' })).data.id, 77);
    const sent = JSON.parse(requests.at(-1).init.body);
    assert.equal(sent.evaluatorName, 'Current ' + role);
    assert.equal(sent.evaluatorRole, role === 'teacher' ? 'Teacher' : 'Teaching Assistant');
  }
});

test('account-mismatched records are rejected and progress uses the existing currentClasses contract', async () => {
  globalThis.__kan94Auth = { userId: 801, primaryRole: 'student', roles: ['student'], fullName: 'Fixture Learner' };
  reply = { body: { success: true, data: { studentId: 801, currentClasses: [], presentCount: 0, absentCount: 0, lateCount: 0 } } };
  assert.deepEqual((await learningDAL.getStudentProgress()).currentClasses, []);
  reply = { body: { success: true, data: { userId: 999, fullName: 'Another account' } } };
  await assert.rejects(() => learningDAL.getStudentProfile());
  await assert.rejects(() => learningDAL.updateStudentProfile({ fullName: 'Fixture Learner' }));
  await assert.rejects(() => teachingDAL.getProfile(3));
  await assert.rejects(() => teachingDAL.updateProfile(3, { fullName: 'Fixture Teacher' }));
});

test('signed-out DAL requests cannot silently use demo account IDs', async () => {
  globalThis.__kan94Auth = null;
  const count = requests.length;
  await assert.rejects(() => learningDAL.getStudentDashboard());
  await assert.rejects(() => learningDAL.getParentChildrenOverview());
  await assert.rejects(() => teachingDAL.getMyClasses(3));
  assert.equal(requests.length, count);
});

test('downloads reject missing URLs, errors and HTML instead of announcing a file', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.window = { location: { origin: 'http://localhost' } };
  let downloaded = 0;
  globalThis.document = { createElement: () => ({ click() { downloaded++; } }) };
  try {
    await assert.rejects(() => downloadFile(undefined, 'material'));
    for (const [status, type] of [[404,'application/json'], [200,'text/html'], [200,'application/json']]) {
      globalThis.fetch = async () => new Response('No file', { status, headers: { 'content-type': type } });
      await assert.rejects(() => downloadFile('/uploads/material', 'material'));
    }
    assert.equal(downloaded, 0);
    globalThis.fetch = async () => new Response('PDF content', { headers: { 'content-type': 'application/pdf' } });
    await downloadFile('/uploads/material.pdf', 'material.pdf');
    assert.equal(downloaded, 1);
  } finally {
    globalThis.fetch = originalFetch;
    delete globalThis.window;
    delete globalThis.document;
  }
});
