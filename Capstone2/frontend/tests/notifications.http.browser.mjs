import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const origin = process.env.EDUTRACK_NOTIFICATION_TEST_ORIGIN;
const actors = {'center-manager':501,'admin-staff':502,'teacher':503,'teaching-assistant':504};
assert.match(origin ?? '', /^http:\/\/127\.0\.0\.1:\d+$/);
const output = fs.mkdtempSync(path.join(os.tmpdir(), 'edutrack-notifications-browser-'));
const summary = [], requests = [], failures = []; let mutationFailure = 0, snapshotFailure = 0;
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
    const notification = url.pathname.startsWith('/api/user-selection') || url.pathname.startsWith('/api/notifications') || url.pathname.startsWith('/api/management/notifications') || url.pathname.startsWith('/api/teaching/notifications');
    requests.push({ method: event.request.method, path: url.pathname, notification });
    if (!notification) {
      assert.equal(event.request.method, 'GET', 'Actual app must not write outside Notifications');
      await send('Fetch.fulfillRequest', { requestId: event.requestId, responseCode: 503, body: Buffer.from('{}').toString('base64') }); return;
    }
    const fail = event.request.method !== 'GET' && mutationFailure > 0 ? (mutationFailure--, true)
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
        await input('[aria-label="Gửi thông báo"] select:nth-of-type(1)', 'announcement');
        const scopeSelect = '[aria-label="Gửi thông báo"] label:nth-of-type(4) select';
        await input(scopeSelect, 'role'); await until(q('[aria-label="Gửi thông báo"] label:nth-of-type(5) select'), 'recipient role selector');
        await input('[aria-label="Gửi thông báo"] label:nth-of-type(5) select', 'teacher'); await button('Gửi');
        await until('document.body.innerText.includes("Đã gửi thông báo.")&&document.querySelector(".ntf-layout")?.innerText.includes("UI send verified")', 'confirmed send and Sent history');
        await button('Đã gửi'); await delay(50); assert.ok(await evaluate('document.querySelector(".ntf-layout").innerText.includes("UI send verified")'), 'Reselecting Sent never hangs');
      }
      await containment('.ntf-page');
      fs.writeFileSync(path.join(output, actor + '-' + width + '.png'), Buffer.from((await send('Page.captureScreenshot', { format: 'png' })).data, 'base64'));
      summary.push({ actor, width, scope: 'notification page/bell', passed: true });
    }
    for (const actor of ['center-manager', 'admin-staff']) {
      await navigate(actor, '/dashboard'); await until(q('.ntf-dashboard'), 'actual dashboard card');
      await containment('.ntf-dashboard'); await click('[aria-label^="Thông báo ("]');
      const links = '.ntf-dashboard .ntf-quick-list a';
      assert.deepEqual(await evaluate(`Array.from(document.querySelectorAll(${JSON.stringify(links)})).map(a=>a.href)`), await evaluate('Array.from(document.querySelectorAll(".ntf-popover .ntf-quick-list a")).map(a=>a.href)'), 'Dashboard and bell share exact eligible set');
      const writes = requests.filter(r => r.notification && r.method !== 'GET').length;
      await evaluate('window.ntfAdvance(300001)'); await delay(50);
      const current = await api(actor);
      const expected = current.inbox.filter(n => !n.isRead).sort((a,b) => Date.parse(b.createdAt)-Date.parse(a.createdAt)||b.notificationId-a.notificationId).slice(0,5).map(n=>n.notificationId);
      assert.deepEqual(await evaluate(`Array.from(document.querySelectorAll(${JSON.stringify(links)})).map(a=>Number(new URL(a.href).searchParams.get('notificationId')))`), expected, 'Automatic grace expiry refills from all older unread');
      assert.equal(requests.filter(r => r.notification && r.method !== 'GET').length, writes, 'Expiry never updates DeletedAt');
      if (!expected.length) assert.ok(await evaluate('document.querySelector(".ntf-dashboard").getBoundingClientRect().height<200'), 'Empty quick card has natural compact height');
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      await evaluate('document.querySelector(".ntf-dashboard").scrollIntoView({block:"center"})');
      await delay(150);
      fs.writeFileSync(path.join(output, actor + '-dashboard-' + width + '.png'), Buffer.from((await send('Page.captureScreenshot', { format: 'png' })).data, 'base64'));
      if (expected.length) { await click(links); await until(q('.ntf-detail h4'), 'dashboard deep link'); assert.equal(await evaluate('new URLSearchParams(location.search).get("notificationId")'), String(expected[0])); }
      summary.push({ actor, width, scope: 'actual dashboard/grace', passed: true });
    }
  }
  await navigate('center-manager', '/dashboard');
  const delivery = await fetch(origin + '/api/management/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ senderId: 502, title: 'Focus delivery', content: 'New delivery becomes visible on focus', type: 'announcement', targetScope: 'user', userId: 501 }) });
  assert.equal(delivery.status, 201); await evaluate('window.dispatchEvent(new Event("focus"))');
  await until('document.querySelector(".ntf-dashboard").innerText.includes("Focus delivery")', 'new recipient data arrives on focus without reload');
  await navigate('center-manager', '/notifications');
  await evaluate('history.pushState({},"","/admin-staff/notifications");window.dispatchEvent(new PopStateEvent("popstate"))');
  await until('document.querySelector(".ntf-page")?.innerText.includes("AD private")', 'SPA account/role transition loads AD-only Inbox');
  assert.equal(await evaluate('document.querySelector(".ntf-page").innerText.includes("Legacy read without ReadAt")'), false, 'No CM Inbox retained after role transition');
  await navigate('center-manager', '/notifications'); await click('[aria-label="Tài khoản"]');
  await input('.ntf-account-menu select', '505');
  await until(q('[aria-label^="Thông báo ("]') + '.getAttribute("aria-label").includes("(0 chưa đọc)")', 'select second CM account from real database');
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
