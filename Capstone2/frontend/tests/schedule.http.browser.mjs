import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';

// Only the isolated ScheduleRead test host accepts these per-run test cookies.
const origin = process.env.EDUTRACK_SCHEDULE_TEST_ORIGIN, nonce = process.env.EDUTRACK_SCHEDULE_TEST_NONCE;
assert.match(origin ?? '', /^http:\/\/127\.0\.0\.1:\d+$/);
assert.match(nonce ?? '', /^[a-f0-9]{32}$/);
const output = process.env.EDUTRACK_SCHEDULE_SCREENSHOTS || fs.mkdtempSync(path.join(os.tmpdir(), 'edutrack-schedule-browser-'));
fs.mkdirSync(output, {recursive:true});
const bootstrap = fs.readFileSync(path.join(process.cwd(), 'src/assets/css/bootstrap.min.css'));
const icons = fs.readFileSync(path.join(process.cwd(), 'src/assets/css/bootstrap-icons.css'));
let chrome, socket, session, sequence = 0, mode = 'live';
const pending = new Map(), summary = [], failures = [], requests = [];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
function send(method, params = {}, target = session) {
  return new Promise((resolve, reject) => {
    const id = ++sequence, timer = setTimeout(() => {pending.delete(id); reject(new Error('CDP timeout: ' + method));}, 20000);
    pending.set(id, {resolve, reject, timer});
    socket.send(JSON.stringify({id, method, params, ...(target ? {sessionId: target} : {})}));
  });
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true});
  if (result.exceptionDetails) throw new Error((result.exceptionDetails.exception?.description ?? result.exceptionDetails.text) + '\nExpression: ' + expression);
  return result.result.value;
}
async function until(expression, label) {
  const end = Date.now() + 15000;
  while (Date.now() < end) {if (await evaluate('Boolean(' + expression + ')')) return; await delay(35);}
  throw new Error('Timed out: ' + label + '\n' + await evaluate('document.body.innerText.slice(-2500)'));
}
async function click(selector) {
  const expression = 'document.querySelector(' + JSON.stringify(selector) + ')';
  assert.ok(await evaluate('Boolean(' + expression + ')'), selector);
  await evaluate(expression + '.click()');
}
async function clickText(text, parent = 'body') {
  const expression = 'Array.from(document.querySelectorAll(' + JSON.stringify(parent + ' button') + ')).find(b=>b.textContent.trim()===' + JSON.stringify(text) + ')';
  assert.ok(await evaluate('Boolean(' + expression + ')'), 'Button ' + text);
  await evaluate(expression + '.click()');
}
async function setInput(selector, value) {
  await evaluate('(() => {const input=document.querySelector('+JSON.stringify(selector)+');input.focus();const setter=Object.getOwnPropertyDescriptor(input.tagName==="INPUT"?HTMLInputElement.prototype:HTMLSelectElement.prototype,"value").set;setter.call(input,'+JSON.stringify(value)+');input.dispatchEvent(new Event(input.tagName==="INPUT"?"input":"change",{bubbles:true}));})()');
}
async function filter(label, value) {
  if(await evaluate('(() => {const button=document.querySelector(".et-schedule-filter-toggle");return button.getBoundingClientRect().width>0&&button.getAttribute("aria-expanded")==="false";})()')) await click('.et-schedule-filter-toggle');
  const selector='.et-schedule-filters [aria-label="'+label+'"]';
  await evaluate('(() => {const input=document.querySelector('+JSON.stringify(selector)+');const details=input.closest("details");if(details) details.open=true;})()');
  await setInput(selector,value);
}
async function screenshot(name) {
  const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
  fs.writeFileSync(path.join(output,name+'.png'),Buffer.from(shot.data,'base64'));
}
async function jump(value, blur=false) {
  await setInput('.pagination-jump-input',value);
  if(blur) await evaluate('document.querySelector(".pagination-jump-input").blur()');
  else await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
}
async function ready() {
  await until('document.querySelector(".et-schedule-summary") && !document.querySelector(".et-schedule-error") && !document.querySelector(".et-schedule-state")?.textContent.includes("Đang tải")', 'Schedule loaded');
}
async function count() {return evaluate('document.querySelectorAll(".et-schedule-session").length');}
async function paused(event) {
  const url = new URL(event.request.url);
  if (url.origin !== origin) {
    if (url.pathname.endsWith('/bootstrap.min.css') || url.pathname.endsWith('/bootstrap-icons.min.css')) {
      await send('Fetch.fulfillRequest', {requestId:event.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'text/css'}],
        body:(url.pathname.endsWith('/bootstrap.min.css')?bootstrap:icons).toString('base64')}); return;
    }
    await send('Fetch.failRequest', {requestId: event.requestId, errorReason: 'BlockedByClient'}); return;
  }
  if (url.pathname.startsWith('/api/')) {
    requests.push({path: url.pathname, query: url.search, method: event.request.method});
    assert.equal(event.request.method, 'GET', 'Browser must never submit writes');
    if (url.pathname.startsWith('/api/schedule/sessions')) {
      assert.equal(url.searchParams.has('userId'), false); assert.equal(url.searchParams.has('studentId'), false);
      if (mode === 'held') await delay(400);
      if (mode === 'empty' || mode === 'failure') {
        await send('Fetch.fulfillRequest', {requestId: event.requestId, responseCode: mode === 'failure' ? 503 : 200,
          responseHeaders: [{name: 'Content-Type', value: 'application/json'}], body: Buffer.from(mode === 'empty' ? '[]' : '{}').toString('base64')}); return;
      }
      await send('Fetch.continueRequest', {requestId: event.requestId}); return;
    }
    // Surrounding legacy layout APIs are outside the test host's controller allow-list.
    await send('Fetch.fulfillRequest', {requestId: event.requestId, responseCode: 503, body: Buffer.from('{}').toString('base64')}); return;
  }
  await send('Fetch.continueRequest', {requestId: event.requestId});
}
try {
  const ws = await new Promise((resolve, reject) => {
    chrome = spawn(process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      ['--headless=new', '--disable-gpu', '--no-sandbox', '--disable-extensions', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', '--user-data-dir=' + path.join(output, 'profile'), ...JSON.parse(process.env.CHROME_ARGS_JSON || '[]'), 'about:blank'],
      {windowsHide: true, stdio: ['ignore', 'ignore', 'pipe']});
    const timer = setTimeout(() => reject(new Error('Chrome startup timeout')), 10000);
    chrome.on('error', reject);
    chrome.stderr.on('data', chunk => {const match = chunk.toString().match(/DevTools listening on (ws:\/\/\S+)/); if (match) {clearTimeout(timer); resolve(match[1]);}});
  });
  socket = new WebSocket(ws);
  await new Promise((resolve, reject) => {socket.addEventListener('open', resolve, {once: true}); socket.addEventListener('error', reject, {once: true});});
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const item = pending.get(message.id);
      if (item) {clearTimeout(item.timer); pending.delete(message.id); if(message.error) item.reject(new Error(JSON.stringify(message.error))); else item.resolve(message.result);}
    } else if (message.method === 'Fetch.requestPaused') paused(message.params).catch(error => failures.push(error.message));
  });
  const target = await send('Target.createTarget', {url: 'about:blank'}, null);
  ({sessionId: session} = await send('Target.attachToTarget', {targetId: target.targetId, flatten: true}, null));
  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
  await send('Fetch.enable', {patterns: [{urlPattern: '*'}]});
  await send('Emulation.setTimezoneOverride', {timezoneId: 'America/Los_Angeles'});
  await send('Page.addScriptToEvaluateOnNewDocument', {source: '(() => {const OriginalDate=Date;const fixed=OriginalDate.parse("2026-12-31T17:01:00Z");window.Date=class extends OriginalDate {constructor(...args){super(...(args.length?args:[fixed]));}static now(){return fixed;}};})()'});
  for (const [viewport, width, height] of [['desktop',1440,1000], ['tablet',768,1024], ['mobile',390,844], ['small-mobile',360,780]]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
    for(const [role,expected] of [['center-manager',19],['admin-staff',19],['teacher',15],['teaching-assistant',2],['student',16]]) {
      mode='live';
      await send('Network.setCookie',{name:'schedule_test_actor',value:nonce+':'+role,url:origin,httpOnly:true});
      await send('Page.navigate',{url:origin+'/'+role+'/schedule'}); await ready();
      assert.match(await evaluate('document.querySelector(".et-schedule-range").textContent'),/28\/12\/2026.*03\/01\/2027/);
      assert.equal(await count(),expected);
      assert.equal(await evaluate('Array.from(document.querySelectorAll("[data-session-id]")).some(e=>["9003","9004"].includes(e.dataset.sessionId))'),false);
      assert.ok(await evaluate('document.querySelector(".et-schedule-day-heading.et-today").textContent.includes("01/01/2027")'));
      if(role!=='teaching-assistant') {
        assert.equal(await evaluate('Array.from(document.querySelectorAll("[data-session-id]")).find(e=>e.dataset.sessionId==="9001").dataset.lanes'),role==='teacher'?'2':'3');
        assert.ok(await evaluate('(() => {const e=Array.from(document.querySelectorAll("[data-session-id]"));const a=e.find(e=>e.dataset.sessionId==="9001").getBoundingClientRect(),b=e.find(e=>e.dataset.sessionId==="9002").getBoundingClientRect();return a.right<=b.left||b.right<=a.left;})()'));
      }
      // Check real status colors from the teammate CSS, without inventing completion.
      if(role==='teacher') assert.equal(await evaluate('getComputedStyle(document.querySelector(".session-card-upcoming")).backgroundColor'),'rgb(239, 246, 255)');
      const firstId=await evaluate('document.querySelector(".et-schedule-session").dataset.sessionId');
      await click('.et-schedule-session'); await until('document.querySelector("dialog[open]")','Session detail');
      const title=await evaluate('document.querySelector("dialog h2").textContent'); await click('dialog button');
      await evaluate('document.querySelector(".et-schedule-scroll").scrollTop=720');
      await screenshot(role+'-calendar-'+viewport);
      await clickText('List');
      assert.equal(await evaluate('document.querySelectorAll(".et-schedule-table tbody [data-session-id]").length'),Math.min(10,expected));
      await click('.et-schedule-table [data-session-id="'+firstId+'"] button');
      assert.equal(await evaluate('document.querySelector("dialog h2").textContent'),title); await click('dialog button');
      assert.ok(await evaluate('document.querySelector(".et-schedule-table").textContent.includes("Chưa có dữ liệu")'));
      assert.ok(await evaluate('document.querySelector("[data-sort=studentCount]").disabled'));
      await screenshot(role+'-list-'+viewport);
      if(expected>10) {
        await clickText('Next','.et-schedule-pagination'); await clickText('Calendar'); assert.equal(await count(),expected);
        await clickText('List'); assert.match(await evaluate('document.querySelector(".et-schedule-pagination").textContent'),/Trang 2/);
      }
      await click('[data-sort=time]'); await click('[data-sort=time]');
      const times=await evaluate('Array.from(document.querySelectorAll("tbody [data-session-id]")).map(r=>r.children[4].textContent.trim().slice(0,5))');
      assert.ok(times.every((t,index)=>index===0||times[index-1]>=t),'Time sorting uses real time');
      await click('[data-sort=dayOfWeek]');
      const dates=await evaluate('Array.from(document.querySelectorAll("tbody [data-session-id]")).map(r=>r.children[3].textContent.trim().split("/").reverse().join("-"))');
      assert.ok(dates.every((d,index)=>index===0||dates[index-1]<=d),'Date sorting uses real year/month/day');
      await filter('Status','scheduled'); await clickText('Calendar');
      const filtered=await count(); await clickText('List');
      assert.equal(await evaluate('document.querySelector("[aria-label=Status]").value'),'scheduled');
      assert.equal(await evaluate('Number(document.querySelector(".et-schedule-summary strong").textContent)'),filtered);
      await filter('Thứ trong tuần','0'); await clickText('Calendar');
      assert.ok(await evaluate('Array.from(document.querySelectorAll(".et-schedule-session")).every(e=>e.closest("[data-date]").dataset.date==="2026-12-28")'));
      await clickText('Xóa bộ lọc');
      // The next week contains many real synthetic sessions for pagination tests.
      await click('[aria-label="Tuần sau"]'); await ready();
      assert.equal(await count(),role==='teaching-assistant'?60:61);
      await clickText('List');
      const pages=role==='teaching-assistant'?6:7;
      for(const page of [2,3,pages-1,pages,1]) {
        await jump(String(page));
        assert.match(await evaluate('document.querySelector(".et-schedule-pagination").textContent'),new RegExp('Trang '+page+'/'+pages));
      }
      await jump('4',true);
      assert.match(await evaluate('document.querySelector(".et-schedule-pagination").textContent'),/Trang 4/);
      for(const invalid of ['0','-1','999','1.5','']) {
        await jump(invalid);
        assert.match(await evaluate('document.querySelector(".et-schedule-pagination").textContent'),/Trang 4/);
      }
      // Filtering while on a later page resets/clamps the real shared page.
      await filter('Tìm kiếm','NO SUCH SESSION');
      assert.equal(await evaluate('document.querySelectorAll(".et-schedule-table tbody [data-session-id]").length'),0);
      assert.match(await evaluate('document.querySelector(".et-schedule-pagination").textContent'),/Trang 1\/1/);
      await clickText('Xóa bộ lọc'); await clickText('Calendar'); await clickText('Hôm nay'); await ready();
      assert.equal(await count(),expected);
      await filter('Tìm kiếm','NO SUCH SESSION'); await until('document.querySelector(".et-schedule-state")?.textContent.includes("Chưa có lịch học")','Empty after search');
      await clickText('List'); assert.equal(await evaluate('document.querySelectorAll(".et-schedule-table tbody [data-session-id]").length'),0);
      await clickText('Xóa bộ lọc'); await clickText('Calendar');
      if(await evaluate('(() => {const b=document.querySelector(".et-schedule-filter-toggle");return b.getBoundingClientRect().width>0&&b.getAttribute("aria-expanded")==="true";})()')) await click('.et-schedule-filter-toggle');
      const geometry=await evaluate('(() => {const s=document.querySelector(".et-schedule-scroll");return {scroll:s.scrollWidth,client:s.clientWidth,overflow:document.documentElement.scrollWidth>innerWidth+2};})()');
      if(geometry.overflow) {
        await screenshot('overflow-'+role+'-'+viewport);
        console.log('OVERFLOW '+JSON.stringify(await evaluate('Array.from(document.querySelectorAll("body *")).map(e=>({cls:e.className,right:e.getBoundingClientRect().right})).filter(e=>e.right>innerWidth+2).slice(0,12)')));
      }
      assert.equal(geometry.overflow,false,role+'/'+viewport+' page fits');
      if(width<=768) assert.ok(geometry.scroll>geometry.client,'Calendar owns horizontal scroll');
      await evaluate('document.querySelector(".et-schedule-scroll").scrollLeft=220');
      const aligned=await evaluate('(() => {const root=document.querySelector(".et-schedule"),head=root.querySelector(".day-header-col").getBoundingClientRect(),body=root.querySelector(".grid-day-col").getBoundingClientRect();return Math.abs(head.left-body.left)<1&&Math.abs(head.width-body.width)<1;})()');
      assert.ok(aligned,'Header/body stay aligned after horizontal scroll');
      summary.push(role+'/'+viewport); console.log('PASS integrated teammate UI '+role+'/'+viewport);
    }
  }
  // Explicit fault injection, then recovery through real HTTP.
  for (const current of ['empty', 'failure', 'held']) {
    mode = current; await send('Page.navigate', {url: origin + '/student/schedule'});
    if (current === 'empty') {await ready(); assert.equal(await count(),0); assert.match(await evaluate('document.querySelector(".et-schedule-state").textContent'), /Chưa có lịch học/);}
    if (current === 'failure') {
      await until('document.querySelector(".et-schedule-error")', 'HTTP error visible'); assert.equal(await count(),0);
      mode = 'live'; await clickText('Thử lại'); await ready(); assert.equal(await count(),16);
    }
    if (current === 'held') {await until('document.querySelector(".et-schedule-state")?.textContent.includes("Đang tải")', 'Loading visible'); await ready();}
  }
  mode='live'; await send('Network.deleteCookies',{name:'schedule_test_actor',url:origin});
  await send('Page.navigate',{url:origin+'/student/schedule'});
  await until('document.querySelector(".et-schedule-error")?.textContent.includes("Chưa xác thực")', 'Unauthenticated view fails closed');
  assert.equal(await count(),0); assert.deepEqual(failures,[]);
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({summary,requests,failures},null,2));
  console.log('BROWSER RESULTS: '+summary.length+' role/viewport groups; empty/error/retry/loading/401; no Schedule writes. ARTIFACTS: '+output);
} finally {
  if(socket?.readyState===1){await send('Browser.close',{},null).catch(()=>{});socket.close();}
  chrome?.kill(); for(const item of pending.values())clearTimeout(item.timer);
}
