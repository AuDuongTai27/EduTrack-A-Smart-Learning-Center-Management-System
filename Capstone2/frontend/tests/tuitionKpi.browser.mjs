import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

// Run from Capstone2/frontend after npm run build. No live API or database is used.
const root = process.cwd();
const dist = path.join(root, 'dist');
const output = fs.mkdtempSync(path.join(os.tmpdir(), 'edutrack-tuition-kpi-'));
const profile = path.join(output, 'chrome-profile');
const bootstrap = fs.readFileSync(path.join(root, 'src/assets/css/bootstrap.min.css'));
const icons = fs.readFileSync(path.join(root, 'src/assets/css/bootstrap-icons.css'));
const mime = {'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.png':'image/png', '.woff2':'font/woff2'};
const server = http.createServer((req, res) => {
  const requested = path.resolve(dist, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if (!requested.startsWith(dist + path.sep) && requested !== dist) { res.writeHead(403).end(); return; }
  const file = fs.existsSync(requested) && fs.statSync(requested).isFile() ? requested : path.join(dist, 'index.html');
  res.writeHead(200, {'Content-Type': mime[path.extname(file)] ?? 'application/octet-stream'});
  res.end(fs.readFileSync(file));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let chrome;
let socket;
let sequence = 0;
let session;
const pending = new Map();
let state;
const frozen = '2026-11-06T08:00:00Z';
const held = new Set();
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
function send(method, params = {}, target = session) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 20000);
    pending.set(id, {resolve, reject, timer});
    socket.send(JSON.stringify({id, method, params, ...(target ? {sessionId:target} : {})}));
  });
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', {expression, returnByValue:true, awaitPromise:true});
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
  return result.result.value;
}
async function until(expression, description) {
  const end = Date.now() + 15000;
  while (Date.now() < end) { if (await evaluate(expression)) return; await delay(30); }
  throw new Error(`Timed out: ${description}`);
}
const invoice = (overrides = {}) => ({
  invoiceId: 10, studentId: 6, studentName: 'Current Student', studentCode: 'QA',
  classId: 12, className: 'Current Class', periodMonth: 11, periodYear: 2026,
  amountDue: 3_000_000, dueDate: '2026-12-06', status: 'unpaid', ...overrides,
});
const payment = (amount, overrides = {}) => ({
  paymentId: 1, invoiceId: 10, amount, paidAt: '2026-11-03T08:00:00Z', ...overrides,
});
const cases = [
  {name:'unpaid', invoices:[invoice()], payments:[], expected:[3_000_000,0,3_000_000,0], monthly:0, unpaid:1, overdueCount:0},
  {name:'partial', invoices:[invoice()], payments:[payment(1_000_000)], expected:[3_000_000,1_000_000,2_000_000,0], monthly:1_000_000, unpaid:1, overdueCount:0},
  {name:'multiple', invoices:[invoice()], payments:[payment(1_000_000),payment(2_000_000,{paymentId:2})], expected:[3_000_000,3_000_000,0,0], monthly:3_000_000, unpaid:0, overdueCount:0},
  {name:'old-debt', invoices:[invoice({periodMonth:10,amountDue:2_000_000,dueDate:'2026-11-01'})], payments:[payment(2_000_000)], expected:[2_000_000,2_000_000,0,0], monthly:2_000_000, unpaid:0, overdueCount:0},
  {name:'overdue', invoices:[invoice({dueDate:'2026-11-05'})], payments:[payment(2_000_000)], expected:[3_000_000,2_000_000,1_000_000,1_000_000], monthly:2_000_000, unpaid:1, overdueCount:1},
  {name:'boundaries', invoices:[invoice()], payments:[payment(100,{paidAt:'2026-10-31T16:59:59Z'}),payment(200,{paymentId:2,paidAt:'2026-10-31T17:00:00Z'}),payment(400,{paymentId:3,paidAt:'2026-11-30T16:59:59Z'}),payment(800,{paymentId:4,paidAt:'2026-11-30T17:00:00Z'})], expected:[3_000_000,1500,2_998_500,0], monthly:600, unpaid:1, overdueCount:0},
  {name:'invalid-paid-at', invoices:[invoice()], payments:[payment(1_000_000,{paidAt:'invalid'})], expected:[3_000_000,1_000_000,2_000_000,0], monthly:null, unpaid:1, overdueCount:0},
  {name:'pending-adjustment', invoices:[invoice({status:'pending_adjustment',dueDate:'2026-10-01'})], payments:[], expected:[3_000_000,0,3_000_000,0], monthly:0, unpaid:1, overdueCount:0},
  {name:'empty', invoices:[], payments:[], expected:[0,0,0,0], monthly:0, unpaid:0, overdueCount:0},
  {name:'large', invoices:[invoice({amountDue:125_500_000})], payments:[], expected:[125_500_000,0,125_500_000,0], monthly:0, unpaid:1, overdueCount:0},
  {name:'payments503', mode:'payments503', invoices:[invoice()], payments:[], expected:[3_000_000,null,null,null], monthly:null, unpaid:null, overdueCount:null},
  {name:'invoices503', mode:'invoices503', invoices:[], payments:[payment(1_000_000)], expected:[null,null,null,null], monthly:1_000_000, unpaid:null, overdueCount:null},
  {name:'payments-loading', mode:'payments-loading', invoices:[invoice()], payments:[], expected:[3_000_000,null,null,null], monthly:null, unpaid:null, overdueCount:null},
  {name:'invoices-loading', mode:'invoices-loading', invoices:[], payments:[payment(1_000_000)], expected:[null,null,null,null], monthly:1_000_000, unpaid:null, overdueCount:null},
  {name:'both-loading', mode:'both-loading', invoices:[], payments:[], expected:[null,null,null,null], monthly:null, unpaid:null, overdueCount:null},
];
const cohort = {name:'mixed-cohort', invoices:[
  invoice({invoiceId:20,classId:11,className:'Old Class',studentName:'Old Student',periodMonth:10,amountDue:2_000_000,dueDate:'2026-11-01'}),
  invoice({dueDate:'2026-11-05'}),
],payments:[payment(2_000_000,{invoiceId:20}),payment(1_000_000,{paymentId:2,paidAt:'2026-10-15T08:00:00Z'}),payment(1_000_000,{paymentId:3})],expected:[5_000_000,4_000_000,1_000_000,1_000_000],monthly:3_000_000,unpaid:1,overdueCount:1};

function fixture(endpoint) {
  if (endpoint === '/api/centersettings') return [{settingId:1,settingKey:'center_name',settingValue:'EduTrack KPI QA'}];
  if (endpoint === '/api/users') return [{userId:6,fullName:'KPI QA Student',status:'active',roles:['student']}];
  if (endpoint === '/api/classes') return [{classId:11,className:'Old Class',status:'active'},{classId:12,className:'Current Class',status:'active'}];
  if (endpoint === '/api/tuitioninvoices') return state.invoices;
  if (endpoint === '/api/payments') return state.payments;
  return [];
}
async function paused(event) {
  const url = new URL(event.request.url);
  const fulfill = (body, type='application/json', code=200) => send('Fetch.fulfillRequest', {requestId:event.requestId,responseCode:code,responseHeaders:[{name:'Content-Type',value:type}],body:Buffer.from(body).toString('base64')},event.sessionId);
  if (url.origin === origin && url.pathname.startsWith('/api/')) {
    assert.equal(event.request.method, 'GET', 'Browser KPI tests must never write to the API');
    const paymentEndpoint = url.pathname === '/api/payments';
    const invoiceEndpoint = url.pathname === '/api/tuitioninvoices';
    if ((state.mode === 'payments-loading' && paymentEndpoint) || (state.mode === 'invoices-loading' && invoiceEndpoint) || (state.mode === 'both-loading' && (invoiceEndpoint || paymentEndpoint))) {held.add(event.requestId);return;}
    if ((state.mode === 'payments503' && paymentEndpoint) || (state.mode === 'invoices503' && invoiceEndpoint)) return fulfill(JSON.stringify({message:'KPI QA HTTP 503'}),'application/json',503);
    return fulfill(JSON.stringify(fixture(url.pathname)));
  }
  if (url.hostname === 'cdn.jsdelivr.net') {
    if (url.pathname.includes('bootstrap.min.css')) return fulfill(bootstrap,'text/css');
    if (url.pathname.includes('bootstrap-icons.min.css')) return fulfill(icons,'text/css');
    return fulfill('',url.pathname.endsWith('.js')?'text/javascript':'text/plain');
  }
  if (url.origin !== origin && url.protocol.startsWith('http')) return fulfill('','text/plain');
  return send('Fetch.continueRequest',{requestId:event.requestId},event.sessionId);
}
const pages = [
  ['/center-manager/dashboard',2],['/admin-staff/dashboard',1],
  ['/center-manager/tuition',4],['/admin-staff/tuition',4],
  ['/center-manager/reports',4],['/admin-staff/reports',4],
];
const summary = [];
const vnd = value => value == null ? '—' : `${value.toLocaleString('vi-VN')} VND`;
const cardValues = "[...document.querySelectorAll('.dashboard-kpi--currency h3')].map(n=>n.textContent.trim())";
function expectedValues(route, data) {
  if (route === '/center-manager/dashboard') return [data.monthly,data.expected[2]].map(vnd);
  if (route === '/admin-staff/dashboard') return [vnd(data.expected[2])];
  return [data.expected[0],data.expected[0]==null?null:data.monthly,data.expected[2],data.expected[3]].map(vnd);
}
async function checkValues(route,data,label) {
  const expected = expectedValues(route,data);
  await until(`${cardValues}.join('|') === ${JSON.stringify(expected.join('|'))}`,label+' values '+expected.join('|'));
  assert.deepEqual(await evaluate(cardValues),expected,label);
  const cards = await evaluate(`(() => [...document.querySelectorAll('.dashboard-kpi--currency')].map(card=>{
    const v=card.querySelector('h3'),icon=card.querySelector('.kpi-icon');
    const r=v.getBoundingClientRect(),c=card.getBoundingClientRect(),i=icon?.getBoundingClientRect(),s=getComputedStyle(v);
    return {text:v.textContent.trim(),fits:v.scrollWidth<=v.clientWidth+1&&r.left>=c.left&&r.right<=c.right+1&&r.bottom<=c.bottom+1,
      overlap:!!i&&r.right>i.left+1&&r.left<i.right&&r.bottom>i.top&&r.top<i.bottom,ellipsis:s.textOverflow==='ellipsis'};
  }))()`);
  for(const card of cards) assert.ok(card.fits&&!card.overlap&&!card.ellipsis,label+' layout '+JSON.stringify(card));
  if(route === '/center-manager/dashboard') {
    const extra=await evaluate("[...document.querySelectorAll('h4.kpi-currency-value, .dashboard-kpi--currency .border-top strong')].map(n=>n.textContent.trim())");
    assert.deepEqual(extra,[vnd(data.expected[3]),vnd(data.monthly),vnd(data.expected[2])],label+' overview/overdue');
    assert.equal(await evaluate("document.body.innerText.includes('Tháng 11/2026')"),true,label+' monthly label');
    assert.deepEqual(await evaluate(`(() => {
      const cards=[...document.querySelectorAll('.dashboard-kpi')];
      const card=cards.find(c=>c.querySelector('p').textContent.trim()==='Tuition Collected');
      const footer=card.querySelector('.border-top'),period=footer.querySelector('span');
      const reference=cards[2].querySelector('.border-top span');
      const textStyle=node=>{const s=getComputedStyle(node);return [s.fontFamily,s.fontSize,s.fontWeight,s.lineHeight,s.color].join('|');};
      const f=footer.getBoundingClientRect(),p=period.getBoundingClientRect(),v=card.querySelector('h3').getBoundingClientRect();
      return {title:card.querySelector('p').textContent.trim(),period:period.textContent.trim(),
        footer:footer.textContent.trim(),icons:card.querySelectorAll('i').length,
        sameFooterStyle:textStyle(period)===textStyle(reference),
        sameTitleStyle:textStyle(card.querySelector('p'))===textStyle(cards[2].querySelector('p')),
        fits:footer.scrollWidth<=footer.clientWidth+1&&p.right<=f.right+1&&p.top>=v.bottom,
        oldLabel:card.textContent.includes('Đã thu trong tháng')};
    })()`),{title:'Tuition Collected',period:'Tháng 11/2026',footer:'Tháng 11/2026',icons:0,
      sameFooterStyle:true,sameTitleStyle:true,fits:true,oldLabel:false},label+' monthly note matches adjacent KPI typography without icons or a date range');
  }
  if(route === '/admin-staff/dashboard') {
    await until("document.querySelector('.dashboard-kpi h3').textContent.trim() === '1'",label+' unrelated student metric ready');
    const counts=await evaluate("[...document.querySelectorAll('.dashboard-kpi h3')].map(n=>n.textContent.trim())");
    assert.equal(counts[0],'1',label+' unrelated student metric');
    assert.equal(counts[1],String(data.unpaid??'—'),label+' unpaid invoice count');
  }
  if(!route.endsWith('/dashboard')) {
    const overview=await evaluate(`(() => {
      const group=document.querySelector('.tuition-kpis');
      const cards=[...group.querySelectorAll('.dashboard-kpi')];
      return {hasOuterCard:group.classList.contains('card'),scope:cards[0].querySelector('.border-top').textContent.trim(),
        outstandingScope:cards[2].querySelector('.border-top').textContent.trim(),
        collectionMonth:cards[1].querySelector('.border-top').textContent.trim(),
        titles:cards.map(c=>c.querySelector('p').textContent.trim()),
        count:cards[3].querySelector('.border-top').textContent.trim(),
        hasPercent:group.textContent.includes('%'),
        columns:cards.filter(c=>Math.abs(c.getBoundingClientRect().top-cards[0].getBoundingClientRect().top)<1).length,
        expectedColumns:innerWidth>=1200?4:innerWidth>=768?2:1,
        units:cards.map(c=>c.querySelector('.kpi-currency-unit')?.textContent.trim()??''),
        unitsBelow:cards.every(c=>{const unit=c.querySelector('.kpi-currency-unit');return !unit||
          (getComputedStyle(unit).display==='block'&&unit.getBoundingClientRect().top>c.querySelector('h3').getBoundingClientRect().top);}),
        originalStyle:cards.every(c=>{const icon=c.querySelector('.kpi-icon'),style=getComputedStyle(c);
          return style.boxShadow!=='none'&&style.borderTopWidth==='0px'&&getComputedStyle(icon).width==='46px';})};
    })()`);
    assert.equal(overview.hasOuterCard,false,label+' no added outer card');
    assert.match(overview.scope,/Tất cả kỳ học phí/,label+' single scope label');
    assert.equal(overview.outstandingScope,overview.scope,label+' Outstanding uses the same scope footer as Total Tuition Due');
    assert.equal(overview.collectionMonth,'Tháng 11/2026',label+' Collected month footer');
    assert.deepEqual(overview.titles,['Total Tuition Due','Collected','Outstanding','Overdue'],label+' consistent English titles');
    assert.equal(overview.count,data.overdueCount==null?'—':`${data.overdueCount} hóa đơn`,label+' overdue count');
    assert.equal(overview.hasPercent,false,label+' compact cards have no percentage footers');
    assert.equal(overview.columns,overview.expectedColumns,label+' responsive columns');
    assert.deepEqual(overview.units,expected.map(value=>value==='—'?'':'VND'),label+' currency units on a separate row');
    assert.equal(overview.unitsBelow,true,label+' VND below the amount');
    assert.equal(overview.originalStyle,true,label+' original KPI shadows, borders and colored icon size');
  }
}
async function inspect(route,count,data,viewport) {
  state=data;
  await send('Page.navigate',{url:origin+route});
  await until(`document.querySelectorAll('.dashboard-kpi--currency').length === ${count}`,route+' cards');
  const label=`${viewport} ${route} ${data.name}`;
  if(data.mode?.endsWith('503')) await until("document.body.innerText.includes('503')",label+' API error');
  await checkValues(route,data,label);
  if(data.name==='invalid-paid-at'&&route!=='/admin-staff/dashboard') assert.equal(await evaluate("document.body.innerText.includes('ngày thu')"),true,label+' invalid payment date warning');
  if(data.mode?.includes('loading')) await delay(100);
  if(data.name==='large') {
    const clip=await evaluate(`(() => {
      const cards=[...document.querySelectorAll('.dashboard-kpi')].map(n=>n.getBoundingClientRect());
      const x=Math.max(0,Math.min(...cards.map(r=>r.left))-8),y=Math.max(0,Math.min(...cards.map(r=>r.top))+scrollY-8);
      return {x,y,width:Math.max(...cards.map(r=>r.right))-x+8,height:Math.max(...cards.map(r=>r.bottom))+scrollY-y+8,scale:1};
    })()`);
    const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip});
    fs.writeFileSync(path.join(output,`${viewport}-${route.slice(1).replaceAll('/','-')}.png`),Buffer.from(shot.data,'base64'));
  }
  summary.push({viewport,route,case:data.name,values:await evaluate(cardValues)});
  for(const requestId of held) await send('Fetch.failRequest',{requestId,errorReason:'Aborted'}).catch(()=>{});
  held.clear();
}
try {
  const ws = await new Promise((resolve,reject) => {
    chrome = spawn(process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', ['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'], {windowsHide:true,stdio:['ignore','ignore','pipe']});
    const timer = setTimeout(()=>reject(new Error('Chrome startup timed out')),10000);
    chrome.on('error',reject);
    chrome.stderr.on('data', chunk => { const match = chunk.toString().match(/DevTools listening on (ws:\/\/\S+)/); if(match) {clearTimeout(timer); resolve(match[1]);} });
  });
  socket = new WebSocket(ws);
  await new Promise((resolve,reject) => {socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id) { const task=pending.get(message.id);if(task){clearTimeout(task.timer);pending.delete(message.id);message.error?task.reject(new Error(JSON.stringify(message.error))):task.resolve(message.result);} }
    else if (message.method === 'Fetch.requestPaused') paused({...message.params, sessionId:message.sessionId}).catch(error=>{ console.error(error.message); });
  });
  const target = await send('Target.createTarget',{url:'about:blank'},null);
  ({sessionId:session}=await send('Target.attachToTarget',{targetId:target.targetId,flatten:true},null));
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Fetch.enable',{patterns:[{urlPattern:'*'}]});

  await send('Emulation.setTimezoneOverride',{timezoneId:'America/Los_Angeles'});
  await send('Page.addScriptToEvaluateOnNewDocument',{source:`{const NativeDate=Date;const instant=NativeDate.parse(${JSON.stringify(frozen)});globalThis.Date=class extends NativeDate{constructor(...args){super(...(args.length?args:[instant]));}static now(){return instant;}};}`});
  for(const [name,width,height] of [['desktop',1440,1000],['tablet',768,1024],['mobile',390,844]]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
    for(const data of cases) for(const [route,count] of pages) await inspect(route,count,data,name);
    console.log('PASS '+name+': all six pages, 15 data/loading/error cases, exact KPI values and layout');
    for(const [route,count] of pages.filter(([route])=>!route.endsWith('/dashboard'))) {
      await inspect(route,count,cohort,name);
      const filtered={...cohort,expected:[3_000_000,2_000_000,1_000_000,1_000_000],monthly:1_000_000};
      if(route==='/admin-staff/tuition') {
        await evaluate(`(()=>{const input=document.querySelector('.user-search input');const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;setter.call(input,'Current Student');input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
      } else {
        await evaluate(`(()=>{const select=[...document.querySelectorAll('select')].find(s=>[...s.options].some(o=>o.value==='12'));select.value='12';select.dispatchEvent(new Event('change',{bubbles:true}));})()`);
      }
      await checkValues(route,filtered,name+' '+route+' filtered cohort');
      summary.push({viewport:name,route,case:'filtered-cohort',values:await evaluate(cardValues)});
    }
    console.log('PASS '+name+': all four tuition/report pages preserve the original KPI cards with VND below the amount');
  }
  await send('Emulation.setDeviceMetricsOverride',{width:320,height:812,deviceScaleFactor:1,mobile:false});
  for(const [route,count] of pages) await inspect(route,count,{...cases.find(c=>c.name==='large'),name:'large',invoices:[invoice({amountDue:10_010_899_999})],expected:[10_010_899_999,0,10_010_899_999,0]},'small-mobile');
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(summary,null,2));
  console.log('RESULTS: '+summary.length+' page scenarios passed. Browser timezone: America/Los_Angeles; KPI month: Vietnam.');
  console.log('ARTIFACTS: '+output);
} finally {
  if(socket?.readyState===1){await send('Browser.close',{},null).catch(()=>{});socket.close();}
  chrome?.kill();
  for (const task of pending.values()) clearTimeout(task.timer);
  server.closeAllConnections();
  await new Promise(resolve=>server.close(resolve));
}
