import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn } from 'node:child_process';

// Every API is intercepted. This suite never contacts a Backend or database.
const output = path.resolve('../../tmp/kan94/browser-' + Date.now());
fs.mkdirSync(output, { recursive: true });
const dist = path.resolve('dist');
const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.png':'image/png', '.woff2':'font/woff2' };
const server = http.createServer((req, res) => {
  const requested = path.resolve(dist, '.' + new URL(req.url, 'http://localhost').pathname);
  if (!requested.startsWith(dist + path.sep)) return res.writeHead(403).end();
  const file = fs.existsSync(requested) && fs.statSync(requested).isFile() ? requested : path.join(dist, 'index.html');
  res.writeHead(200, { 'content-type': mime[path.extname(file)] || 'application/octet-stream' });
  res.end(fs.readFileSync(file));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser, socket, session, sequence = 0, actor, mode = 'empty', actionMode = '', scriptId;
const pending = new Map(), results = [], writes = [], exceptions = [], interceptionErrors = [];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
function send(method, params = {}, target = session) {
  return new Promise((resolve, reject) => {
    const id = ++sequence, timer = setTimeout(() => { pending.delete(id); reject(Error('CDP timeout: ' + method)); }, 20000);
    pending.set(id, { resolve, reject, timer });
    socket.send(JSON.stringify({ id, method, params, ...(target ? { sessionId: target } : {}) }));
  });
}
async function evaluate(expression) {
  const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (response.exceptionDetails) throw Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
  return response.result.value;
}
async function until(expression, label) {
  const end = Date.now() + 12000;
  while (Date.now() < end) { if (await evaluate('Boolean(' + expression + ')')) return; await delay(40); }
  throw Error('Timeout: ' + label + '\n' + await evaluate('document.body.innerText'));
}
const text = () => evaluate('document.body.innerText');
const profile = () => ({ userId: actor.userId, userCode: 'REAL' + actor.userId, fullName: actor.fullName, role: actor.primaryRole, roleTitle: actor.primaryRole, email: '', phone: '', dateOfBirth: '', address: '', specialty: '', activeClassesCount: 0, totalStudentsCount: 0 });
const cls = () => ({ classId: 41, className: 'API Class 41', subjectId: 1, subjectName: 'Science', status: 'active', studentCount: 0, totalLessons: 0, attendedLessons: 0, myRoleInClass: actor.primaryRole, teacherName: '', taName: '' });
const assignment = () => ({ assignmentId: 51, classId: 41, title: 'API Assignment 51', className: 'API Class 41', dueDate: '2099-12-01T12:00:00Z', maxScore: 10, description: '', submission: actionMode === 'has-submission' ? { submissionId: 71, assignmentId: 51, studentId: actor.userId, fileName: 'persisted.pdf', fileUrl: '/uploads/persisted.pdf', submittedAt: '2026-11-27T03:00:00Z' } : null });
const child = id => ({ id, code: 'CHILD' + id, name: 'API Child ' + id, avatar: 'CH', grade: '', school: '', dob: '', phone: '', classesCount: 1, attendanceRate: 0, averageScore: 0, unpaidAmount: 0, classes: [{ id: 41, name: 'API Class 41', subject: 'Science', subjectClass: '', badge: 'Science', teacher: '', teacherInitials: 'TC', schedule: '', room: '', attendedLessons: 0, totalLessons: 0, notes: '' }] });
function fixture(url) {
  const p = url.pathname;
  if (p === '/api/auth/me') return { success: true, user: actor };
  if (p === '/api/user-selection') return [actor];
  if (p === '/api/centersettings') return [];
  if (p.includes('/notifications/inbox/snapshot')) return { identity: { ...actor, email: null, avatarUrl: null }, serverNowUtc: new Date().toISOString(), inbox: [], trash: [], unreadCount: 0 };
  if (p.endsWith('/children-overview')) return { success: true, data: mode === 'empty' ? [] : [child(801), child(802)] };
  if (p.includes('/learning/feedback/')) return { success: true, data: [] };
  if (p.includes('/learning/') && p.endsWith('/dashboard')) return { success: true, data: { studentId: actor.userId, studentCode: actor.userCode, fullName: actor.fullName, enrolledClassesCount: mode === 'data' ? 1 : 0, pendingAssignmentsCount: 0, classes: mode === 'data' ? [cls()] : [] } };
  if (p.endsWith('/teaching/dashboard')) return { success: true, data: { profile: profile(), kpis: { activeAssignments: 0, activeClasses: 0, totalStudents: 0, pendingAttendance: 0 }, todayClasses: [], notifications: [] } };
  if (p.includes('/learning/') && /\/classes\/41$/.test(p)) return { success: true, data: { ...cls(), materials: [], assignments: [], sessions: [], attendedLessons: 0, totalLessons: 0, latestTeacherNote: '' } };
  if (p.includes('/learning/') && /\/assignment\/51$/.test(p)) return { success: true, data: assignment() };
  if (p.endsWith('/profile') || /\/teaching\/profile\/\d+$/.test(p)) return { success: true, data: profile() };
  if (p.includes('/learning/') && p.endsWith('/progress')) return { success: true, data: { studentId: actor.userId, studentName: actor.fullName, currentClasses: [], overallAttendanceRate: 0, totalSessionsCount: 0, attendedSessionsCount: 0 } };
  if (p.includes('/tuition/')) return { success: true, data: { studentId: 801, studentName: 'API Child 801', totalUnpaidAmount: 0, unpaidInvoices: [], paymentHistory: [], period: 'Current term', dueDate: '' } };
  if (p.endsWith('/my-classes')) return { success: true, data: mode === 'empty' ? [] : [cls()] };
  if (p.endsWith('/progress-detail')) return { success: true, data: { studentId: 801, studentCode: 'CHILD801', fullName: 'API Child 801', className: 'API Class 41', subjectName: 'Science', presentDays: 0, absentDays: 0, totalDays: 0, attendancePercentage: 0, assignments: [], evaluations: [] } };
  if (p.endsWith('/attendance/sheet')) return { success: true, data: { ...cls(), students: [], currentSession: null, availableSessions: [], stats: { totalStudents: 0, presentCount: 0, absentCount: 0, lateCount: 0, excusedCount: 0, attendanceRate: 0 } } };
  if (/\/teaching\/assignments\/51$/.test(p)) return { success: true, data: assignment() };
  if (p.startsWith('/api/teaching/') || p.startsWith('/api/learning/')) return { success: true, data: [] };
  return [];
}
async function paused(event) {
  const url = new URL(event.request.url), p = url.pathname, method = event.request.method;
  const fulfill = (body, status = 200, type = 'application/json') => send('Fetch.fulfillRequest', { requestId: event.requestId, responseCode: status, responseHeaders: [{ name: 'content-type', value: type }], body: Buffer.from(typeof body === 'string' ? body : JSON.stringify(body)).toString('base64') }, event.sessionId);
  if (url.origin !== origin) {
    if (p.endsWith('/bootstrap.min.css')) return fulfill(fs.readFileSync('src/assets/css/bootstrap.min.css', 'utf8'), 200, 'text/css');
    return send('Fetch.failRequest', { requestId: event.requestId, errorReason: 'BlockedByClient' }, event.sessionId);
  }
  if (!p.startsWith('/api/') && !p.startsWith('/uploads/')) return send('Fetch.continueRequest', { requestId: event.requestId }, event.sessionId);
  if (method !== 'GET') {
    writes.push({ path: p, method, body: event.request.postData });
    if (actionMode === 'writes-ok') {
      if (p.endsWith('/upload')) return fulfill({ success: true, fileUrl: '/uploads/confirmed.pdf', fileName: 'homework.pdf' });
      if (p.endsWith('/submissions')) return fulfill({ success: true, data: { submissionId: 72, assignmentId: 51, studentId: actor.userId, fileName: 'homework.pdf', fileUrl: '/uploads/confirmed.pdf', submittedAt: new Date().toISOString() } });
      if (p.endsWith('/evaluations')) return fulfill({ success: true, data: { ...JSON.parse(event.request.postData), id: 73, createdAt: '27/11/2026' } });
      if (method === 'DELETE') return fulfill({ success: true });
    }
    if (actionMode === 'upload-ok-submit-fail' && p.endsWith('/upload')) return fulfill({ success: true, fileUrl: '/uploads/confirmed.pdf', fileName: 'homework.pdf' });
    return fulfill({ success: false, message: 'Controlled write failure' }, 500);
  }
  if (mode !== 'data' && mode !== 'empty' && (p.startsWith('/api/teaching/') || p.startsWith('/api/learning/'))) {
    if (mode === 'network') return send('Fetch.failRequest', { requestId: event.requestId, errorReason: 'ConnectionFailed' }, event.sessionId);
    return fulfill({ success: false }, Number(mode));
  }
  return fulfill(fixture(url));
}
async function setActor(role, id) {
  actor = { userId: id, userCode: 'REAL' + id, fullName: 'Current ' + role + ' ' + id, primaryRole: role.replaceAll('-', '_'), roles: [role.replaceAll('-', '_')], status: 'active', redirectPath: '/' + role + '/dashboard' };
  if (scriptId) await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: scriptId });
  const source = `localStorage.clear();localStorage.setItem('edutrack_auth_token','fixture-token');localStorage.setItem('edutrack_auth_user',${JSON.stringify(JSON.stringify(actor))});window.confirm=()=>true;`;
  ({ identifier: scriptId } = await send('Page.addScriptToEvaluateOnNewDocument', { source }));
}
async function visit(route, nextMode = 'data') {
  mode = nextMode;
  const before = exceptions.length;
  await send('Page.navigate', { url: origin + route });
  await until(`location.pathname === ${JSON.stringify(route.split('?')[0])} && document.querySelector('.app-container, .main-wrapper, .admin-layout, .sidebar, main') && document.body.innerText.length > 50`, route);
  await delay(170);
  const body = await text();
  assert.doesNotMatch(body, /\[MOCK\]|Lê Văn An|STU001|Hoang Quoc Viet|Hoàng Quốc Việt|Au Duong Tai|Âu Dương Tài|Room 201|Aug 11, 2026|Individual evaluation recorded/i, route);
  assert.equal(exceptions.length, before, route + ' runtime exceptions: ' + exceptions.slice(before).join('\n'));
  return body;
}
async function button(label) {
  const expression = `Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === ${JSON.stringify(label)})`;
  assert.ok(await evaluate('Boolean(' + expression + ')'), 'Button: ' + label);
  await evaluate(expression + '.click()');
}
async function input(selector, value) {
  await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});const proto=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(el,${JSON.stringify(value)});el.dispatchEvent(new Event('input',{bubbles:true}));})()`);
}
async function selectFile() {
  await evaluate(`(()=>{const input=document.querySelector('#fileInput');const transfer=new DataTransfer();transfer.items.add(new File(['homework'],'homework.pdf',{type:'application/pdf'}));input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));})()`);
}
try {
  const ws = await new Promise((resolve, reject) => {
    browser = spawn(process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', '--user-data-dir=' + path.join(output, 'profile'), 'about:blank'], { windowsHide: true, stdio: ['ignore','ignore','pipe'] });
    const timer = setTimeout(() => reject(Error('Chrome startup timeout')), 10000);
    browser.on('error', reject);
    browser.stderr.on('data', chunk => { const match = chunk.toString().match(/DevTools listening on (ws:\/\/\S+)/); if (match) { clearTimeout(timer); resolve(match[1]); } });
  });
  socket = new WebSocket(ws); await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
  socket.addEventListener('message', event => {
    const m = JSON.parse(event.data);
    if (m.id) { const task = pending.get(m.id); if (task) { clearTimeout(task.timer); pending.delete(m.id); m.error ? task.reject(Error(JSON.stringify(m.error))) : task.resolve(m.result); } }
    else if (m.method === 'Fetch.requestPaused') paused({ ...m.params, sessionId: m.sessionId }).catch(error => interceptionErrors.push(error.message));
    else if (m.method === 'Runtime.exceptionThrown') exceptions.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  });
  const target = await send('Target.createTarget', { url: 'about:blank' }, null);
  ({ sessionId: session } = await send('Target.attachToTarget', { targetId: target.targetId, flatten: true }, null));
  await send('Page.enable'); await send('Runtime.enable'); await send('Fetch.enable', { patterns: [{ urlPattern: '*' }] });
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });

  // Read every registered page declaration, including nested pages and legacy aliases.
  for (const [role, file] of [['center-manager','centerManager'], ['admin-staff','adminStaff'], ['teacher','teacher'], ['teaching-assistant','teachingAssistant'], ['student','student'], ['parent','parent']]) {
    if (process.env.KAN94_BROWSER_ACTIONS_ONLY) break;
    await setActor(role, 900 + results.length);
    const routes = fs.readFileSync('src/routes/' + file + '.routes.tsx', 'utf8');
    const paths = [...routes.matchAll(/path:\s*["']([^"']+)["']/g)].map(m => m[1]).filter(p => !p.startsWith('/') && p !== '*' && p !== 'progress' && p !== 'learning-progress');
    for (const p of paths) {
      const route = '/' + role + '/' + p.replaceAll(':classId','41').replaceAll(':studentId','801').replaceAll(':assignmentId','51').replace(/:id/g, p.includes('assignment') ? '51' : '41');
      await visit(route);
      results.push(role + ' ' + p + ' data smoke');
    }
    console.log('PASS route smoke: ' + role + ' (' + paths.length + ' declarations)');
  }
  for (const role of ['teacher','teaching-assistant','student','parent']) {
    if (process.env.KAN94_BROWSER_ACTIONS_ONLY) break;
    await setActor(role, 1001);
    const paths = role === 'student' ? ['dashboard','classes','profile','classes/41','assignments/51','notifications','feedback']
      : role === 'parent' ? ['dashboard','notifications','feedback']
      : ['dashboard','classes','profile','classes/41','classes/41/assignment/51','classes/41/attendance','classes/41/student/801','request'];
    for (const p of paths) {
      const route = '/' + role + '/' + p;
      await visit(route, 'empty');
      for (const failure of ['500','network','401','403']) {
        await visit(route, failure);
        await until("document.querySelector('[role=alert]') !== null", route + ' ' + failure + ' error');
        const body = await text();
        assert.match(body, failure === '401' ? /sign in/i : failure === '403' ? /permission/i : /Unable|unavailable/i);
      }
      mode = 'data'; await button('Retry');
      await until("!Array.from(document.querySelectorAll('[role=alert]')).some(e=>/Unable to load/.test(e.textContent))", route + ' retry');
      results.push(route + ' empty/500/network/401/403/retry');
    }
    console.log('PASS data states: ' + role);
  }
  await setActor('student', 1201); actionMode = '';
  await visit('/student/assignments/51');
  await until("document.querySelector('#btnSubmitAssignment')", 'dropzone');
  assert.equal(await evaluate("document.querySelector('#btnSubmitAssignment').disabled"), true);
  await selectFile(); actionMode = 'upload-fail'; const beforeUpload = writes.length;
  await evaluate("document.querySelector('#btnSubmitAssignment').click();document.querySelector('#btnSubmitAssignment').click()");
  await until("document.querySelector('.alert-danger')", 'upload failure');
  assert.equal(writes.length - beforeUpload, 1, 'double click submits only one upload');
  assert.doesNotMatch(await text(), /submitted successfully/i);
  actionMode = 'upload-ok-submit-fail'; await evaluate("document.querySelector('#btnSubmitAssignment').click()");
  await until("document.querySelector('.alert-danger')", 'submit failure');
  await delay(100); assert.doesNotMatch(await text(), /submitted successfully/i);
  actionMode = 'has-submission'; await visit('/student/assignments/51');
  await until("document.querySelector('#viewSubmitted') || document.body.innerText.includes('persisted.pdf')", 'saved submission');
  const deleteButton = await evaluate("Array.from(document.querySelectorAll('button')).find(b=>/Delete|Withdraw/i.test(b.textContent))?.textContent.trim()");
  assert.ok(deleteButton); await button(deleteButton); await delay(150);
  assert.match(await text(), /persisted.pdf/); assert.doesNotMatch(await text(), /deleted successfully/i);
  results.push('Student failed upload/submit/delete; no-file validation; double-click guard');
  actionMode = 'writes-ok';
  await button(deleteButton);
  await until("document.body.innerText.includes('Submission deleted successfully')", 'confirmed deletion');
  await selectFile();
  await evaluate("document.querySelector('#btnSubmitAssignment').click()");
  await until("document.body.innerText.includes('Assignment submitted successfully')", 'confirmed submission');
  results.push('Student backend-confirmed upload, submission and deletion');
  actionMode = '';

  for (const role of ['teacher','teaching-assistant']) {
    await setActor(role, 1301); await visit('/' + role + '/classes/41/student/801');
    const label = await evaluate("Array.from(document.querySelectorAll('button')).find(b=>/Evaluation/i.test(b.textContent))?.textContent.trim()");
    assert.ok(label, 'evaluation action'); await button(label);
    await until("document.querySelector('.modal textarea')", 'evaluation form');
    await input('.modal textarea', 'Controlled evaluation failure');
    await evaluate("document.querySelector('.modal form').requestSubmit()");
    await until("document.querySelector('.modal')?.innerText.includes('not saved')", 'evaluation save error');
    assert.match(await evaluate("document.querySelector('.modal textarea').value"), /Controlled/);
    assert.doesNotMatch(await text(), /recorded\.|saved successfully/i);
    results.push(role + ' failed evaluation preserves form');
    actionMode = 'writes-ok';
    await evaluate("document.querySelector('.modal form').requestSubmit()");
    await until("!document.querySelector('.modal')", 'confirmed evaluation');
    assert.match(await text(), /Controlled evaluation failure/);
    actionMode = '';
    await visit('/' + role + '/request');
    await button('Create Request');
    await until("document.querySelector('#requestTitle')", 'request form');
    await input('#requestTitle', 'Controlled request failure');
    await input('#requestDescription', 'Keep this text after the API fails.');
    const beforeRequest = writes.length;
    await evaluate("document.querySelector('.modal form').requestSubmit(); document.querySelector('.modal form').requestSubmit()");
    await until("document.querySelector('.modal .alert-danger')", 'request save error');
    assert.equal(writes.length - beforeRequest, 1);
    assert.equal(await evaluate("document.querySelector('#requestTitle').value"), 'Controlled request failure');
    results.push(role + ' failed request preserves form and prevents duplicate writes');
  }
  // Account switch remounts all workspace state; Parent selector keeps two backend-linked children.
  await setActor('parent', 1401); await visit('/parent/dashboard');
  await until("document.body.innerText.includes('API Child 801')", 'child selector');
  await evaluate("document.querySelector('.sidebar-child-switcher button[aria-expanded]').click()");
  await until("Array.from(document.querySelectorAll('.sidebar-child-switcher button')).some(b=>b.textContent.includes('API Child 802'))", 'second linked child');
  await evaluate("Array.from(document.querySelectorAll('.sidebar-child-switcher button')).find(b=>b.textContent.includes('API Child 802')).click()");
  await until("document.querySelector('.sidebar-child-switcher button[aria-expanded]')?.textContent.includes('API Child 802')", 'selection changed');
  assert.doesNotMatch(await text(), /Current teacher|Current student/);
  await setActor('parent', 1402); await visit('/parent/dashboard', '500');
  assert.doesNotMatch(await text(), /API Child 801|API Child 802|1401/);
  results.push('Parent account isolation and failed child lookup');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false });
  await delay(100);
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), true, 'mobile error layout fits');
  const shot = await send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(output,'parent-error.png'), Buffer.from(shot.data,'base64'));
  assert.deepEqual(interceptionErrors, []);
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ results, writes, exceptions, interceptionErrors }, null, 2));
  console.log('PASS ' + results.length + ' browser scenario groups; API fixtures only. Artifacts: ' + output);
} catch (error) {
  fs.writeFileSync(path.join(output, 'failure.json'), JSON.stringify({ message: error.message, results, writes, exceptions, interceptionErrors }, null, 2));
  throw error;
} finally {
  if (socket?.readyState === 1) { await send('Browser.close', {}, null).catch(() => {}); socket.close(); }
  browser?.kill(); for (const p of pending.values()) clearTimeout(p.timer);
  server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
}
