import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const origin = process.env.EDUTRACK_NOTIFICATION_TEST_ORIGIN;
const actors = {'center-manager':501,'admin-staff':502,'teacher':503,'teaching-assistant':504,'student':507,'parent':601};
assert.match(origin ?? '', /^http:\/\/127\.0\.0\.1:\d+$/);
const output = fs.mkdtempSync(path.join(os.tmpdir(), 'edutrack-notifications-browser-'));
console.log('Browser artifacts: ' + output);
const summary = [], requests = [], failures = []; let mutationFailure = 0, snapshotFailure = 0, searchFailure = 0, holdSend = false, heldSend = null, delaySearch = false;
let chrome, socket, session, sequence = 0; const pending = new Map();
const delay = ms => new Promise(r => setTimeout(r, ms));
function send(method, params = {}, target = session) {
  return new Promise((resolve, reject) => {
    const id = ++sequence, timer = setTimeout(() => { pending.delete(id); reject(Error('CDP timeout ' + method)); }, 20000);
    pending.set(id, { resolve, reject, timer }); socket.send(JSON.stringify({ id, method, params, ...(target ? { sessionId: target } : {}) }));
  });
}
async function evaluate(expression) {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value;
}
async function until(expression, label) {
  const end = Date.now() + 15000;
  while (Date.now() < end) { if (await evaluate('Boolean(' + expression + ')')) return; await delay(40); }
  throw Error('Timeout ' + label + '\n' + await evaluate('document.body.innerText'));
}
const q = selector => 'document.querySelector(' + JSON.stringify(selector) + ')';
async function click(selector) { await evaluate(q(selector) + '.click()'); }
async function input(selector, value) {
  await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});const proto=el.tagName==='SELECT'?HTMLSelectElement.prototype:el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(el,${JSON.stringify(value)});el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));})()`);
}
async function button(label) {
  const expression = 'Array.from(document.querySelectorAll("button")).find(b=>b.textContent.trim()===' + JSON.stringify(label) + ')';
  assert.ok(await evaluate('Boolean(' + expression + ')'), 'Button ' + label); await evaluate(expression + '.click()');
}
async function api(actor, endpoint = '/api/notifications/inbox/snapshot') {
  const response = await fetch(origin + endpoint + (endpoint.includes('?') ? '&' : '?') + 'userId=' + actors[actor]);
  assert.ok(response.ok, 'HTTP ' + response.status + ' ' + endpoint); return response.json();
}
async function paused(event) {
  const url = new URL(event.request.url);
  if (url.origin !== origin) {
    if (url.pathname.endsWith('/bootstrap.min.css')) {
      await send('Fetch.fulfillRequest', { requestId: event.requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'text/css' }], body: fs.readFileSync('src/assets/css/bootstrap.min.css').toString('base64') }); return;
    }
    await send('Fetch.failRequest', { requestId: event.requestId, errorReason: 'BlockedByClient' }); return;
  }
  if (url.pathname.startsWith('/api/')) {
    const notification = url.pathname.startsWith('/api/user-selection') || url.pathname.startsWith('/api/notifications') || url.pathname.startsWith('/api/management/notifications') || url.pathname.startsWith('/api/teaching/notifications') || url.pathname === '/api/classes';
    requests.push({ method: event.request.method, path: url.pathname, notification });
    if (!notification) {
      assert.equal(event.request.method, 'GET', 'Actual app must not write outside Notifications');
      await send('Fetch.fulfillRequest', { requestId: event.requestId, responseCode: 503, body: Buffer.from('{}').toString('base64') }); return;
    }
    if (holdSend && url.pathname === '/api/management/notifications' && event.request.method === 'POST') { heldSend = event; return; }
    if (delaySearch && url.pathname.endsWith('/recipients')) { delaySearch = false; await delay(900); await send('Fetch.continueRequest', { requestId: event.requestId }).catch(() => {}); return; }
    const fail = url.pathname.endsWith('/recipients') && searchFailure > 0 ? (searchFailure--, true) : event.request.method !== 'GET' && mutationFailure > 0 ? (mutationFailure--, true)
      : url.pathname.endsWith('/snapshot') && snapshotFailure > 0 ? (snapshotFailure--, true) : false;
    if (fail) {
      await send('Fetch.fulfillRequest', { requestId: event.requestId, responseCode: 500, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }], body: Buffer.from(JSON.stringify({ message: 'Actual test API failure' })).toString('base64') }); return;
    }
  }
  await send('Fetch.continueRequest', { requestId: event.requestId });
}
async function navigate(actor, endpoint) {
  await send('Page.navigate', { url: origin + '/' + actor + endpoint });
  await until(q('[aria-label^="Thông báo ("]') + ' && !' + q('[aria-label^="Thông báo ("]') + '.getAttribute("aria-label").includes("chưa tải")', 'verified own Inbox');
}
async function containment(selector) {
  assert.ok(await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)return false;const r=e.getBoundingClientRect();return r.left>=-1&&r.right<=innerWidth+1;})()`), 'Containment ' + selector);
}
async function key(key, code = key, windowsVirtualKeyCode = 0, modifiers = 0) {
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode, modifiers });
}
async function composeAcceptance(actor, width) {
  const full = actor === 'center-manager' && width === 1440;
  await evaluate('Array.from(document.querySelectorAll("button")).find(b=>b.textContent.trim()==="Gửi thông báo").focus()');
  await button('Gửi thông báo'); await until('document.querySelector("dialog")?.open', 'compose modal');
  await containment('dialog');
  assert.equal(await evaluate('document.activeElement.id'), 'ntf-title');
  assert.equal(await evaluate('document.querySelector("dialog [type=submit]").disabled'), true, 'Invalid draft disabled');
  assert.ok(await evaluate('Array.from(document.querySelectorAll("dialog label[for]")).every(l=>document.getElementById(l.htmlFor))'), 'Labels resolve to inputs');
  assert.ok(await evaluate('document.querySelector("#ntf-title").required&&document.querySelector("#ntf-content").required'));
  await evaluate('document.querySelector(".ntf-tabs button").focus()');
  assert.ok(await evaluate('document.querySelector("dialog").contains(document.activeElement)'), 'Native modal keeps background inert');
  await input('#ntf-title', '   '); await input('#ntf-content', '\n ');
  await evaluate('document.querySelector("#ntf-title").focus();document.querySelector("#ntf-content").focus();document.querySelector("#ntf-type").focus()');
  assert.ok(await evaluate('document.querySelector("#ntf-title").getAttribute("aria-invalid")==="true"&&document.querySelector("dialog [type=submit]").disabled'), 'Whitespace rejected near input');
  const title = `Student propagation UI ${actor} ${width}`;
  await input('#ntf-title', title); await input('#ntf-content', 'Notification sent by actual UI to one student and linked parents.');
  assert.equal(await evaluate('document.querySelector("#ntf-title").maxLength'), 200);
  assert.equal(await evaluate('document.querySelector("#ntf-content").maxLength'), 4000);
  assert.deepEqual(await evaluate('Array.from(document.querySelectorAll("#ntf-type option")).map(o=>o.textContent)'), ['Thông báo chung','Học tập','Học phí','Nhắc nhở','Lịch học','Hệ thống','Bài tập','Lớp học']);
  await input('#ntf-scope', 'role');
  assert.deepEqual(await evaluate('Array.from(document.querySelectorAll("#ntf-target option")).slice(1).map(o=>o.value)'), ['center_manager','admin_staff','teacher','teaching_assistant','student']);
  assert.equal(await evaluate(q('#ntf-target option[value="student"]')+'.textContent'), 'Học viên / Phụ huynh (Student / Parent)');
  await input('#ntf-target', 'student');
  assert.ok(await evaluate('document.querySelector("#ntf-student-parent-help").innerText.includes("Thông báo gửi đến học viên cũng được gửi cho phụ huynh liên kết.")'));
  await containment('#ntf-student-parent-help');
  fs.writeFileSync(path.join(output, actor+'-student-parent-role-'+width+'.png'), Buffer.from((await send('Page.captureScreenshot', {format:'png'})).data,'base64'));
  await input('#ntf-target', '');
  assert.ok(await evaluate('document.querySelector("label[for=ntf-target]").innerText.includes("Vai trò nhận")'));
  assert.equal(await evaluate('document.querySelector("dialog [type=submit]").disabled'), true);
  await input('#ntf-scope', 'class'); await until(q('#ntf-target option[value="701"]'), 'real class lookup');
  assert.ok(await evaluate('document.querySelector("label[for=ntf-target]").innerText.includes("Lớp học")'));
  await input('#ntf-target', '701'); assert.equal(await evaluate('document.querySelector("dialog [type=submit]").disabled'), false);
  await input('#ntf-scope', 'user'); await until(q('[role=combobox]'), 'searchable recipient');
  assert.equal(await evaluate('document.querySelector("[role=combobox]").value'), '', 'No default first user');
  await input('[role=combobox]', 'Search Recipient');
  assert.ok(await evaluate('document.querySelector("dialog").innerText.includes("Đang tìm")'), 'Search loading state');
  await until('document.querySelectorAll("[role=option]").length===20', 'bounded real search results');
  await input('[role=combobox]', 'Search Recipient ');
  await until('document.querySelectorAll("[role=option]").length===20&&!document.querySelector("[role=listbox]").getAttribute("aria-busy").includes("true")', 'trailing-space search never hangs');
  assert.equal(await evaluate('document.querySelector("[role=combobox]").hasAttribute("aria-activedescendant")'), false, 'Search never selects first result');
  await input('[role=combobox]', 'no-such-account'); await until('document.querySelector("dialog").innerText.includes("Không tìm thấy")', 'empty search state');
  if (full) {
    searchFailure = 1; await input('[role=combobox]', 'SEARCH-QA-824');
    await until('document.querySelector("dialog").innerText.includes("Không tải được người nhận")', 'search error state');
    await evaluate('Array.from(document.querySelectorAll("dialog button")).find(b=>b.textContent.trim()==="Thử lại").click()');
    await until('document.querySelector("[role=listbox]").innerText.includes("SEARCH-QA-824")', 'retry real recipient search');
    delaySearch = true; await input('[role=combobox]', 'SEARCH-QA-800'); await delay(370);
    await input('[role=combobox]', 'SEARCH-QA-824');
    await until('document.querySelector("[role=listbox]").innerText.includes("SEARCH-QA-824")', 'latest request result'); await delay(700);
    assert.equal(await evaluate('document.querySelector("[role=listbox]").innerText.includes("SEARCH-QA-800")'), false, 'Stale response discarded');
    const before = requests.filter(r=>r.path.endsWith('/recipients')).length;
    await input('[role=combobox]', 'NOT'); await input('[role=combobox]', 'NOTIFY'); await input('[role=combobox]', 'NOTIFY-QA-507');
    await until('document.querySelector("[role=listbox]").innerText.includes("NOTIFY-QA-507")', 'debounced final query');
    assert.equal(requests.filter(r=>r.path.endsWith('/recipients')).length, before+1, 'One request for burst typing');
  } else { await input('[role=combobox]', 'NOTIFY-QA-507'); await until('document.querySelector("[role=listbox]").innerText.includes("NOTIFY-QA-507")', 'real student search'); }
  await evaluate('document.querySelector("[role=combobox]").focus()');
  await key('ArrowDown', 'ArrowDown', 40); await key('ArrowUp', 'ArrowUp', 38); await key('Enter', 'Enter', 13);
  await until('document.querySelector("[role=combobox]").readOnly', 'keyboard selection');
  assert.ok(await evaluate('document.querySelector("dialog").innerText.includes("Học viên (Student)")'));
  await click('.ntf-clear-recipient');
  assert.equal(await evaluate('document.querySelector("dialog [type=submit]").disabled'), true, 'Clearing requires another explicit selection');
  await input('[role=combobox]', 'NOTIFY-QA-507'); await until('document.querySelector("[role=listbox]").innerText.includes("NOTIFY-QA-507")', 'reselect student');
  await evaluate('document.querySelector("[role=combobox]").focus()'); await key('Escape','Escape',27);
  assert.equal(await evaluate('document.querySelector("[role=combobox]").getAttribute("aria-expanded")'), 'false');
  assert.equal(await evaluate('document.querySelector("dialog").open'), true, 'First Escape dismisses results');
  await key('ArrowDown','ArrowDown',40); await key('Enter','Enter',13);
  await key('Escape','Escape',27); await until('!document.querySelector("dialog").open', 'Escape closes modal');
  assert.equal(await evaluate('document.activeElement.textContent.trim()'), 'Gửi thông báo', 'Focus restored to trigger');
  await button('Gửi thông báo');
  assert.equal(await evaluate('document.querySelector("#ntf-title").value'), title, 'Escape keeps draft');
  await evaluate('Array.from(document.querySelectorAll("dialog button")).find(b=>b.textContent.trim()==="Hủy").click()');
  await until('!document.querySelector("dialog").open', 'Cancel closes'); await button('Gửi thông báo');
  assert.equal(await evaluate('document.querySelector("#ntf-title").value'), title, 'Cancel keeps draft');
  // Tab navigation stays within the modal at either boundary.
  await evaluate('document.querySelector("dialog [type=submit]").focus()'); await key('Tab','Tab',9);
  assert.ok(await evaluate('document.querySelector("dialog").contains(document.activeElement)'), 'Tab cannot escape dialog');
  fs.writeFileSync(path.join(output, actor+'-compose-'+width+'.png'),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
  if (full) {
    mutationFailure = 1; await click('dialog [type=submit]');
    await until('document.querySelector("dialog").innerText.includes("Actual test API failure")', 'send error is visible');
    assert.equal(await evaluate('document.querySelector("dialog").open'), true);
    assert.equal(await evaluate('document.querySelector("#ntf-title").value'), title);
    holdSend = true;
  }
  const posts = requests.filter(r=>r.path==='/api/management/notifications'&&r.method==='POST').length;
  await evaluate('document.querySelector("dialog form").requestSubmit();document.querySelector("dialog form").requestSubmit()');
  if (full) {
    await until('document.querySelector("dialog [type=submit]").disabled', 'submit busy');
    for(let i=0;i<50&&!heldSend;i++) await delay(20); assert.ok(heldSend);
    await key('Escape','Escape',27); assert.equal(await evaluate('document.querySelector("dialog").open'), true, 'Cannot close during send');
    assert.equal(await evaluate(q('[aria-label="Đóng form gửi thông báo"]')+'.disabled'), true);
    holdSend = false; const event=heldSend;heldSend=null;await send('Fetch.continueRequest',{requestId:event.requestId});
  }
  await until('!document.querySelector("dialog").open&&document.body.innerText.includes("Đã gửi thông báo.")', 'confirmed modal send');
  assert.equal(requests.filter(r=>r.path==='/api/management/notifications'&&r.method==='POST').length, posts+1, 'Double submit creates one HTTP request');
  const student = await api('student'), parent = await api('parent');
  const delivered=student.inbox.find(n=>n.title===title); assert.ok(delivered);
  assert.ok(parent.inbox.some(n=>n.notificationId===delivered.notificationId), 'UI sends same NotificationId to parent');
  assert.equal((await api(actor)).inbox.some(n=>n.notificationId===delivered.notificationId), false);
  await button('Gửi thông báo'); assert.equal(await evaluate('document.querySelector("#ntf-title").value'), '', 'Success clears draft');
  await click('[aria-label="Đóng form gửi thông báo"]');
  summary.push({actor,width,scope:'compose/search/validation/keyboard/draft/real Student-Parent delivery',passed:true});
}
try {
  const ws = await new Promise((resolve, reject) => {
    chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', ['--headless=new', '--no-sandbox', '--disable-gpu', '--remote-debugging-port=0', '--user-data-dir=' + path.join(output, 'chrome'), 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
    const timer = setTimeout(() => reject(Error('Chrome startup timeout')), 20000);
    chrome.stderr.on('data', data => { const match = data.toString().match(/DevTools listening on (ws:\/\/[^\s]+)/); if (match) { clearTimeout(timer); resolve(match[1]); } });
  });
  socket = new WebSocket(ws); await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  socket.addEventListener('message', event => {
    const m = JSON.parse(event.data);
    if (m.id) { const p = pending.get(m.id); if (p) { clearTimeout(p.timer); pending.delete(m.id); if (m.error) p.reject(Error(JSON.stringify(m.error))); else p.resolve(m.result); } }
    else if (m.method === 'Fetch.requestPaused') paused(m.params).catch(e => failures.push(e.message));
  });
  const target = await send('Target.createTarget', { url: 'about:blank' }, null);
  ({ sessionId: session } = await send('Target.attachToTarget', { targetId: target.targetId, flatten: true }, null));
  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
  await send('Emulation.setTimezoneOverride', { timezoneId: 'America/Los_Angeles' });
  await send('Fetch.enable', { patterns: [{ urlPattern: '*' }] });
  // Test-only timer acceleration; the production API, persisted ReadAt and components are unchanged.
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `(()=>{const realNow=performance.now.bind(performance),realSet=window.setTimeout.bind(window),realClear=window.clearTimeout.bind(window);let offset=0,seq=10000000;const timers=new Map();Object.defineProperty(performance,'now',{value:()=>realNow()+offset});window.setTimeout=(fn,ms,...args)=>{if(ms>=10000&&ms<=400000){const id=++seq;timers.set(id,{fn,args,due:performance.now()+ms});return id;}return realSet(fn,ms,...args);};window.clearTimeout=id=>{timers.delete(id);realClear(id);};window.ntfAdvance=ms=>{offset+=ms;for(const[id,t]of [...timers])if(t.due<=performance.now()){timers.delete(id);t.fn(...t.args);}};})()` });
  for (const width of [1440, 768, 390, 360]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: width < 500 });
    for (const actor of ['center-manager', 'admin-staff', 'teacher', 'teaching-assistant']) {
      const before = await api(actor); await navigate(actor, '/notifications');
      const writes = requests.filter(r => r.notification && r.method !== 'GET').length;
      await click('[aria-label^="Thông báo ("]'); await until(q('.ntf-popover .ntf-quick-list'), 'bell dropdown');
      assert.ok(await evaluate('document.querySelectorAll(".ntf-popover .ntf-quick-list li").length<=5'));
      assert.equal(requests.filter(r => r.notification && r.method !== 'GET').length, writes, 'Opening bell never marks read');
      await containment('.ntf-popover');
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      await until('!document.querySelector(".ntf-popover")', 'Escape closes bell');
      assert.ok(await evaluate('document.activeElement.getAttribute("aria-label").startsWith("Thông báo (")'), 'Escape returns focus');
      await click('[aria-label^="Thông báo ("]'); await evaluate('document.body.dispatchEvent(new PointerEvent("pointerdown",{bubbles:true}))');
      await until('!document.querySelector(".ntf-popover")', 'outside closes');
      await click('[aria-label^="Thông báo ("]');
      const selectedLink = await evaluate('document.querySelector(".ntf-popover .ntf-quick-list a")?.href');
      if (selectedLink) {
        const linkedId = new URL(selectedLink).searchParams.get('notificationId');
        await click('.ntf-popover .ntf-quick-list a'); await until(q('.ntf-detail h4'), 'bell opens exact detail');
        assert.equal(await evaluate('new URLSearchParams(location.search).get("notificationId")'), linkedId);
        assert.equal(await evaluate('Boolean(document.querySelector(".ntf-popover"))'), false, 'Selecting bell item closes dropdown');
      }
      if (actor === 'teacher' || actor === 'teaching-assistant') assert.equal(await evaluate('document.body.innerText.includes("Thùng rác")'), false, 'No teacher Trash mutation');
      if (actor === 'center-manager' || actor === 'admin-staff') {
        await click('[aria-label="Tài khoản"]'); await until(q('.ntf-account-menu'), 'account dropdown');
        assert.ok(await evaluate('document.querySelector(".ntf-account-menu").innerText.includes(' + JSON.stringify(before.identity.userCode) + ')'));
        await containment('.ntf-account-menu'); await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      }
      if (width === 1440 && actor === 'center-manager') {
        const adBefore = await api('admin-staff');
        mutationFailure = 1; await navigate(actor, '/notifications?notificationId=20');
        await until('document.body.innerText.includes("Actual test API failure")', 'real mark-read error');
        assert.equal((await api(actor)).inbox.find(n => n.notificationId === 20).isRead, false, 'Failure cannot fake mark read');
        await button('Đánh dấu đã đọc'); await until('!Array.from(document.querySelectorAll("button")).some(b=>b.textContent.trim()==="Chuyển vào Thùng rác"&&b.disabled)', 'mark read confirmed');
        const persisted = (await api(actor)).inbox.find(n => n.notificationId === 20).readAt; assert.ok(persisted);
        await send('Page.reload'); await until(q('.ntf-detail h4'), 'F5 exact detail');
        assert.equal((await api(actor)).inbox.find(n => n.notificationId === 20).readAt, persisted, 'F5/reopen do not restart ReadAt');
        await button('Chuyển vào Thùng rác'); await until('document.body.innerText.includes("Đã chuyển vào Thùng rác.")', 'delete success');
        assert.ok((await api(actor)).trash.some(n => n.notificationId === 20));
        mutationFailure = 1; await button('Hoàn tác'); await until('document.body.innerText.includes("Actual test API failure")', 'restore failure is visible');
        assert.ok((await api(actor)).trash.some(n => n.notificationId === 20), 'Failed restore leaves Trash intact');
        await button('Hoàn tác'); await until('document.body.innerText.includes("Đã khôi phục vào Hộp thư đến.")', 'undo success');
        await navigate(actor, '/notifications?notificationId=20'); await until(q('.ntf-detail h4'), 'detail 20'); await button('Chuyển vào Thùng rác');
        await until('document.body.innerText.includes("Đã chuyển vào Thùng rác.")', 'delete second'); await button('Thùng rác');
        await until(q('.ntf-list-button'), 'trash list'); await click('.ntf-list-button'); await button('Khôi phục');
        await until('document.body.innerText.includes("Đã khôi phục vào Hộp thư đến.")', 'Trash restore');
        assert.equal((await api(actor)).inbox.find(n => n.notificationId === 20).readAt, persisted);
        assert.deepEqual((await api('admin-staff')).inbox, adBefore.inbox, 'CM actions leave AD unchanged');
        await navigate(actor, '/notifications?notificationId=100'); await until('document.querySelector(".ntf-detail").innerText.includes("Không tìm thấy")', 'foreign detail does not open');
        await navigate(actor, '/notifications?notificationId=20'); await until(q('.ntf-detail h4'), 'exact deep link independent of pagination');
        await button('Đọc tất cả'); await until(q('[aria-label^="Thông báo ("]') + '.getAttribute("aria-label").includes("(0 chưa đọc)")', 'read-all sync');
        await navigate(actor, '/notifications'); snapshotFailure = 1; await button('Tải lại');
        await until('document.body.innerText.includes("Actual test API failure")', 'snapshot failure clears verified personal data');
        await button('Thử lại'); await until(q('[aria-label^="Thông báo ("]') + '.getAttribute("aria-label").includes("(0 chưa đọc)")', 'refresh recovery');
        await button('Gửi thông báo'); await until(q('[aria-label="Gửi thông báo"] form'), 'preserved compose form');
        await input('[name="title"]', 'UI send verified'); await input('[name="content"]', 'Manual notification workflow retained');
        await input('#ntf-type', 'announcement');
        await input('#ntf-scope', 'role'); await until(q('#ntf-target'), 'recipient role selector');
        await input('#ntf-target', 'teacher'); await click('dialog [type=submit]');
        await until('document.body.innerText.includes("Đã gửi thông báo.")&&document.querySelector(".ntf-layout")?.innerText.includes("UI send verified")', 'confirmed send and Sent history');
        await button('Đã gửi'); await delay(50); assert.ok(await evaluate('document.querySelector(".ntf-layout").innerText.includes("UI send verified")'), 'Reselecting Sent never hangs');
      }
      if (actor === 'center-manager' || actor === 'admin-staff') await composeAcceptance(actor, width);
      await containment('.ntf-page');
      fs.writeFileSync(path.join(output, actor + '-' + width + '.png'), Buffer.from((await send('Page.captureScreenshot', { format: 'png' })).data, 'base64'));
      summary.push({ actor, width, scope: 'notification page/bell', passed: true });
    }
    for (const actor of ['center-manager', 'admin-staff', 'teacher', 'teaching-assistant']) {
      const beforeDashboard = await api(actor);
      await navigate(actor, '/dashboard'); await until(q('.ntf-dashboard'), 'actual dashboard card');
      assert.deepEqual((await api(actor)).inbox, beforeDashboard.inbox, 'Opening Dashboard never marks read');
      await containment('.ntf-dashboard'); await click('[aria-label^="Thông báo ("]');
      const links = '.ntf-dashboard .ntf-quick-list a';
      assert.deepEqual(await evaluate(`Array.from(document.querySelectorAll(${JSON.stringify(links)})).map(a=>a.href)`), await evaluate('Array.from(document.querySelectorAll(".ntf-popover .ntf-quick-list a")).map(a=>a.href)'), 'Dashboard and bell share exact eligible set');
      if (actor === 'teacher' || actor === 'teaching-assistant') {
        assert.ok(await evaluate('Boolean(document.querySelector(".ntf-teaching-item .ntf-sender-avatar"))'), 'Circular avatar preserved');
        const id = await evaluate('Number(new URL(document.querySelector(".ntf-teaching-item").href).searchParams.get("notificationId"))');
        const row = beforeDashboard.inbox.find(n=>n.notificationId===id);
        if (row.senderAvatarUrl) {
          await until('document.querySelector(".ntf-teaching-item img")?.naturalWidth>0', 'real sender avatar image');
          assert.equal(await evaluate('document.querySelector(".ntf-teaching-item img").getAttribute("src")'), row.senderAvatarUrl);
        }
        await containment('.ntf-teaching-item');
        await key('Escape','Escape',27);
        await evaluate('document.querySelector(".ntf-teaching-item").scrollIntoView({block:"center",behavior:"instant"})');
        const point = await evaluate('(()=>{const r=document.querySelector(".ntf-teaching-item").getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()');
        await send('Input.dispatchMouseEvent',{type:'mouseMoved',...point});
        await until('getComputedStyle(document.querySelector(".ntf-teaching-item")).backgroundColor==="rgb(240, 245, 255)"', 'hover transition completes');
        assert.equal(await evaluate('getComputedStyle(document.querySelector(".ntf-teaching-item")).backgroundColor'),'rgb(240, 245, 255)', 'Whole row hover styling');
        await key('Tab','Tab',9);
        await evaluate('document.querySelector(".ntf-teaching-item").focus()');
        assert.ok(await evaluate('document.querySelector(".ntf-teaching-item").matches(":focus-visible")'), 'Whole row focus visible');
        if (width === 768) await key(' ','Space',32);
        else if (width === 390) await key('Enter','Enter',13);
        else await click(width === 1440 ? '.ntf-teaching-item .ntf-sender-avatar' : '.ntf-teaching-item .notice-content p');
        await until(q('.ntf-detail h4'), 'Teaching entire item/keyboard deep-link');
        assert.equal(await evaluate('new URLSearchParams(location.search).get("notificationId")'), String(id));
        const afterOpen = (await api(actor)).inbox.find(n=>n.notificationId===id);
        assert.equal(afterOpen.isRead, true); assert.ok(afterOpen.readAt);
        if (row.isRead) assert.equal(afterOpen.readAt, row.readAt, 'Reopen does not reset ReadAt');
        await navigate(actor, '/dashboard'); await until(q('.ntf-dashboard'), 'Teaching return to dashboard');
        assert.equal(await evaluate(`document.querySelector('.ntf-teaching-item[href$="notificationId=${id}"] .ntf-new-badge')!==null`), false, 'Read row loses New badge during grace');
        await click('[aria-label^="Thông báo ("]');
      }
      const writes = requests.filter(r => r.notification && r.method !== 'GET').length;
      await evaluate('window.ntfAdvance(300001)'); await delay(50);
      const current = await api(actor);
      const expected = current.inbox.filter(n => !n.isRead).sort((a,b) => Date.parse(b.createdAt)-Date.parse(a.createdAt)||b.notificationId-a.notificationId).slice(0,5).map(n=>n.notificationId);
      assert.deepEqual(await evaluate(`Array.from(document.querySelectorAll(${JSON.stringify(links)})).map(a=>Number(new URL(a.href).searchParams.get('notificationId')))`), expected, 'Automatic grace expiry refills from all older unread');
      assert.equal(requests.filter(r => r.notification && r.method !== 'GET').length, writes, 'Expiry never updates DeletedAt');
      if (!expected.length) assert.ok(await evaluate('document.querySelector(".ntf-dashboard").getBoundingClientRect().height<380'), 'Empty quick card has natural compact height');
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      await evaluate('document.querySelector(".ntf-dashboard").scrollIntoView({block:"center",behavior:"instant"})');
      await delay(150);
      fs.writeFileSync(path.join(output, actor + '-dashboard-' + width + '.png'), Buffer.from((await send('Page.captureScreenshot', { format: 'png' })).data, 'base64'));
      if (expected.length) { await click(links); await until(q('.ntf-detail h4'), 'dashboard deep link'); assert.equal(await evaluate('new URLSearchParams(location.search).get("notificationId")'), String(expected[0])); }
      summary.push({ actor, width, scope: 'actual dashboard/grace', passed: true });
    }
  }
  // A zero unread count still has read items during grace. Empty only after expiry.
  for (const width of [1440, 768, 390]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height:1000, deviceScaleFactor:1, mobile:width<500 });
    for (const actor of ['center-manager','admin-staff','teacher','teaching-assistant']) {
      const delivered = await fetch(origin+'/api/management/notifications', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({
        senderId:actors[actor]===501?502:501, title:`Empty state acceptance ${actor} ${width}`,
        content:'Real isolated delivery before read-all and grace expiry', type:'system', targetScope:'user', userId:actors[actor],
      })});
      assert.equal(delivered.status,201);
      const before = await api(actor);
      assert.ok(before.unreadCount>0, 'Known unread delivery before testing zero-count transition');
      await navigate(actor, '/dashboard'); await until(q('.ntf-dashboard'), 'supplement dashboard');
      assert.deepEqual((await api(actor)).inbox, before.inbox, 'Dashboard mounting performs no read');
      const marked = await fetch(origin+'/api/notifications/read-all?userId='+actors[actor], {method:'PATCH'});
      assert.equal(marked.status,200); const readState = await marked.json();
      assert.equal(readState.unreadCount,0); assert.ok(readState.inbox.length>5);
      await evaluate('window.dispatchEvent(new Event("focus"))');
      await until(q('.ntf-dashboard [aria-label="Số thông báo chưa đọc"]')+'?.textContent.startsWith("0")', 'zero unread confirmed');
      const links = '.ntf-dashboard .ntf-quick-list a';
      assert.equal(await evaluate(`document.querySelectorAll(${JSON.stringify(links)}).length`),5, 'Zero unread still shows five eligible read rows');
      assert.equal(await evaluate('Boolean(document.querySelector(".ntf-dashboard .ntf-empty"))'),false);
      assert.equal(await evaluate('document.querySelectorAll(".ntf-dashboard .ntf-new-badge").length'),0);
      await evaluate('window.ntfAdvance(299000)'); await delay(30);
      assert.equal(await evaluate(`document.querySelectorAll(${JSON.stringify(links)}).length`),5, 'Read rows remain before five minutes');
      const writes=requests.filter(r=>r.notification&&r.method!=='GET').length;
      await evaluate('window.ntfAdvance(1001)');
      await until(q('.ntf-dashboard .ntf-empty'), 'actual eligible list is empty');
      assert.equal(await evaluate('document.querySelector(".ntf-empty h6").textContent'),'Bạn đã đọc hết thông báo');
      assert.equal(await evaluate('document.querySelector(".ntf-empty p").textContent'),'Không có thông báo mới nào chưa đọc vào lúc này.');
      assert.equal(await evaluate('getComputedStyle(document.querySelector(".ntf-empty-icon")).color'),'rgb(25, 135, 84)');
      const height=await evaluate('document.querySelector(".ntf-dashboard").getBoundingClientRect().height');
      assert.ok(height>=150&&height<380, 'Compact centered card height '+height);
      assert.equal(requests.filter(r=>r.notification&&r.method!=='GET').length,writes, 'Empty expiry never writes recipient state');
      assert.deepEqual((await api(actor)).inbox,readState.inbox,'Expiry preserves every Inbox/ReadAt field');
      await containment('.ntf-dashboard');
      await evaluate('document.querySelector(".ntf-dashboard").scrollIntoView({block:"center",behavior:"instant"})'); await delay(80);
      assert.ok(await evaluate('(()=>{const r=document.querySelector(".ntf-dashboard").getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight+1})()'), 'Empty card fully visible for responsive screenshot');
      fs.writeFileSync(path.join(output,actor+'-dashboard-empty-'+width+'.png'), Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
      summary.push({actor,width,scope:'supplement empty state/zero unread grace/five-minute expiry',passed:true});
    }
  }
  // Student and legacy Parent use real recipient snapshots, independently of child selector.
  for (const width of [1440, 768, 390]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: width < 500 });
    for (const actor of ['student', 'parent']) {
      await evaluate('localStorage.setItem('+JSON.stringify('edutrack-selected-user:')+'+'+JSON.stringify(actor)+','+JSON.stringify(String(actors[actor]))+')');
      const own = await api(actor); assert.equal(own.identity.userId, actors[actor]);
      await send('Page.navigate', { url: origin+'/'+actor+'/notifications' });
      await until('document.querySelector("#ntf-selected-account")?.value==='+JSON.stringify(String(actors[actor]))+' && document.querySelector(".ntf-list-button")', actor+' real Inbox');
      const id = own.inbox[0].notificationId;
      const peer = await api(actor === 'student' ? 'parent' : 'student');
      await send('Page.navigate', { url: origin+'/'+actor+'/notifications?notificationId='+id });
      await until(q('.ntf-detail h4'), actor+' deep-link');
      await until('document.querySelector(".ntf-detail small")?.textContent.startsWith("Đã đọc:")', actor+' server-confirmed read');
      assert.ok((await api(actor)).inbox.find(n=>n.notificationId===id).isRead);
      assert.deepEqual((await api(actor === 'student' ? 'parent' : 'student')).inbox, peer.inbox, 'Reading own account never changes peer Inbox');
      const confirmed = await api(actor);
      const badgeSelector = `a[href="/${actor}/notifications"] .sidebar-badge`;
      assert.ok(await evaluate(`Array.from(document.querySelectorAll(${JSON.stringify(badgeSelector)})).every(b=>Number(b.textContent)===${confirmed.unreadCount})`), 'Sidebar badge shares confirmed recipient count');
      if (confirmed.unreadCount) assert.ok(await evaluate('Boolean('+q(badgeSelector)+')'), 'Real unread badge is present');
      assert.equal(await evaluate('Boolean(document.querySelector("dialog"))'), false);
      await containment('.ntf-page'); await containment('.ntf-detail');
      fs.writeFileSync(path.join(output, actor+'-'+width+'.png'), Buffer.from((await send('Page.captureScreenshot', {format:'png'})).data,'base64'));
      if (width === 1440) {
        const nextId = actor === 'student' ? 508 : 602;
        const nextSnapshot = await (await fetch(origin+'/api/notifications/inbox/snapshot?userId='+nextId)).json();
        await input('#ntf-selected-account', String(nextId));
        await until('document.querySelector(".ntf-tabs").innerText.includes('+JSON.stringify('('+nextSnapshot.unreadCount+' chưa đọc)')+')', 'recipient account switch updates Inbox count');
        assert.ok(await evaluate(`Array.from(document.querySelectorAll(${JSON.stringify(badgeSelector)})).every(b=>Number(b.textContent)===${nextSnapshot.unreadCount})`), 'Sidebar follows selected-user switch');
      }
      summary.push({actor,width,scope:'real recipient Inbox/deep-link/independent read',passed:true});
    }
  }
  await navigate('center-manager', '/dashboard');
  const delivery = await fetch(origin + '/api/management/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ senderId: 502, title: 'Focus delivery', content: 'New delivery becomes visible on focus', type: 'announcement', targetScope: 'user', userId: 501 }) });
  assert.equal(delivery.status, 201); await evaluate('window.dispatchEvent(new Event("focus"))');
  await until('document.querySelector(".ntf-dashboard").innerText.includes("Focus delivery")', 'new recipient data arrives on focus without reload');
  await navigate('center-manager', '/notifications');
  await evaluate('history.pushState({},"","/admin-staff/notifications?notificationId=100");window.dispatchEvent(new PopStateEvent("popstate"))');
  await until('document.querySelector(".ntf-page")?.innerText.includes("AD private")', 'SPA account/role transition loads AD-only Inbox');
  assert.equal(await evaluate('document.querySelector(".ntf-page").innerText.includes("Legacy read without ReadAt")'), false, 'No CM Inbox retained after role transition');
  await navigate('center-manager', '/notifications'); await click('[aria-label="Tài khoản"]');
  await input('.ntf-account-menu select', '505');
  const secondCm = await (await fetch(origin+'/api/notifications/inbox/snapshot?userId=505')).json();
  await until(q('[aria-label^="Thông báo ("]') + '.getAttribute("aria-label").includes('+JSON.stringify('('+secondCm.unreadCount+' chưa đọc)')+')', 'select second CM account from real database');
  assert.equal(await evaluate('document.querySelector(".ntf-page").innerText.includes("Legacy read without ReadAt")'), false);
  await button('Về trang chủ');
  await until('location.pathname==="/"', 'home navigation without a logout/session action');
  await button('Chọn giao diện'); await until(q('[aria-label="Chọn giao diện"]'), 'workspace chooser instead of fake Login');
  assert.equal(await evaluate(q('[aria-label="Chọn giao diện"]') + '.querySelectorAll("a").length'), 6);
  assert.equal(await evaluate('document.querySelectorAll("input[type=password]").length'), 0);
  assert.deepEqual(failures, []); fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ summary, requests, failures, selection: 'Public userId data selection; no session, cookie, token or principal' }, null, 2));
  console.log(`${summary.length} browser groups PASS; artifacts ${output}`);
} catch (error) {
  fs.writeFileSync(path.join(output, 'failure.json'), JSON.stringify({ error: String(error), summary, requests, failures }, null, 2));
  if (session) fs.writeFileSync(path.join(output, 'failure.png'), Buffer.from((await send('Page.captureScreenshot', { format: 'png' })).data, 'base64'));
  throw error;
} finally {
  if (socket?.readyState === 1) { await send('Browser.close', {}, null).catch(() => {}); socket.close(); }
  chrome?.kill(); for (const p of pending.values()) clearTimeout(p.timer);
}
