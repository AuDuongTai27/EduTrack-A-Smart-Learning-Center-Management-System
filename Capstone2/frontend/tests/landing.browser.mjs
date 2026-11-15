import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';

// Static landing QA defaults to a disabled backend. Historical API fixtures
// remain available only with --legacy-api-fixtures; they are not public data.
// --optimize converts generated source PNGs into responsive WebP assets via Chrome.
const root = process.cwd();
const optimize = process.argv.includes('--optimize');
const staticQa = !optimize && !process.argv.includes('--statistics-hover') && !process.argv.includes('--legacy-api-fixtures');
const output = path.resolve(root, process.env.LANDING_QA_OUTPUT || (staticQa ? '../../docs/kan50-static/screenshots' : '../../docs/kan50-refinement/screenshots'));
fs.mkdirSync(output, { recursive: true });
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'edutrack-landing-chrome-'));
const dist = path.join(root, optimize ? 'public' : 'dist');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp' };
let mode = 'ready';
let calls = 0;
const apiRequests = [];
const browserErrors = [];
let harness;
if (staticQa) {
  const { build } = await import('vite');
  const result = await build({ configFile: false, logLevel: 'error', define: { 'process.env.NODE_ENV': '"production"' }, build: {
    write: false, lib: { entry: path.join(root, 'tests/landing.static-harness.tsx'), formats: ['es'], fileName: 'harness' },
    rolldownOptions: { output: { codeSplitting: false } },
  } });
  harness = (Array.isArray(result) ? result : [result]).flatMap(bundle => bundle.output).find(file => file.type === 'chunk').code;
}
const subjects = [
  { subjectId: 1, subjectCode: 'MATH', subjectName: 'Toán học' },
  { subjectId: 2, subjectCode: 'PHYS', subjectName: 'Vật lý' },
  { subjectId: 3, subjectCode: 'CHEM', subjectName: 'Hóa học' },
  { subjectId: 4, subjectCode: 'ENG', subjectName: 'Tiếng Anh' },
  ...['Biology', 'Computer Science', 'Literature', 'History', 'Geography', 'Music', 'Economics', 'Robotics'].map((name, i) => ({ subjectId: i + 5, subjectCode: ['BIO', 'IT', 'LIT', 'HIST', 'GEO', 'MUSIC', 'ECON', 'ROBOT'][i], subjectName: name })),
];
const courses = [1, 2, 4, ...Array(7).fill(12)].map((id, i) => ({
  classId: 91 + i, className: 'Lớp kiểm thử', subjectCode: subjects.find(s => s.subjectId === id).subjectCode,
  subjectName: subjects.find(s => s.subjectId === id).subjectName, subjectId: id, tuitionFee: 1_234_567,
  teacherName: 'QA Educator', gradeName: 'Khối 10',
  upcomingSessions: i === 1 ? [] : [
    { date: '2026-11-16', startTime: '18:00', endTime: '19:30' },
    { date: '2026-11-19', startTime: '19:00', endTime: '20:30' },
  ],
}));
const fixture = {
  centerInfo: { email: 'consultation@example.test', hotline: '+84 123 456 789', address: '' },
  stats: { totalStudents: 0, totalCourses: 0, totalTrainers: 0 }, subjects,
  courses: courses.slice(0, 3),
  trainers: [
    { userId: 1, fullName: 'Photo Rendering Test', roleTitle: 'Teacher', specialty: 'Focuses on conceptual understanding and practical applications.', avatarUrl: '/qa/portrait.jpg', subjects: [subjects[0]] },
    { userId: 2, fullName: 'Long Name Rendering Test for Teacher Card Wrapping', roleTitle: 'Teacher', specialty: '', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test', subjects: [subjects[1]] },
    { userId: 3, fullName: 'Image Error Rendering Test', roleTitle: 'Teaching Assistant', specialty: '', avatarUrl: '/missing-avatar.png', subjects: [] },
  ],
};
const held = new Set();
const server = http.createServer((req, res) => {
  const parsed = new URL(req.url, 'http://localhost');
  const pathname = parsed.pathname;
  if (staticQa && pathname === '/qa/static-harness.js') {
    res.writeHead(200, { 'Content-Type': 'text/javascript' }).end(harness); return;
  }
  if (staticQa && pathname === '/qa/static-harness') {
    const css = fs.readdirSync(path.join(dist, 'assets')).filter(file => file.endsWith('.css'));
    res.writeHead(200, { 'Content-Type': 'text/html' }).end(`<!doctype html><html lang="en"><head>${css.map(file => `<link rel="stylesheet" href="/assets/${file}">`).join('')}</head><body><div id="root"></div><script type="module" src="/qa/static-harness.js"></script></body></html>`); return;
  }
  if (pathname === '/qa/portrait.jpg') {
    // Only a synthetic QA record uses this image. Never attached to a real DB teacher.
    res.writeHead(200, { 'Content-Type': 'image/jpeg' }).end(fs.readFileSync(path.join(root, 'public/assets/img/trainer-1.jpg'))); return;
  }
  if (pathname.startsWith('/api/')) {
    if (staticQa) { calls++; res.writeHead(503).end('Backend disabled for static QA'); return; }
    assert.equal(req.method, 'GET', 'Browser QA never writes business data');
    if (mode === 'live') {
      fetch('http://127.0.0.1:5048' + pathname + parsed.search).then(async upstream => {
        res.writeHead(upstream.status, { 'Content-Type': 'application/json' }).end(await upstream.text());
      }).catch(() => res.writeHead(503).end('Read-only QA backend unavailable')); return;
    }
    calls++;
    if (mode === 'loading') { held.add(res); req.on('close', () => held.delete(res)); return; }
    if (mode === 'error') { res.writeHead(503).end('Unavailable'); return; }
    if (mode === 'page-error' && pathname === '/api/landing/classes' && Number(parsed.searchParams.get('page')) > 1) { res.writeHead(503).end('Next page unavailable'); return; }
    let data;
    if (pathname === '/api/landing/classes') {
      const id = Number(parsed.searchParams.get('subjectId')) || null;
      const page = Number(parsed.searchParams.get('page')) || 1;
      const filtered = mode === 'empty' ? [] : courses.filter(c => !id || c.subjectId === id);
      data = { items: filtered.slice((page - 1) * 3, page * 3), page, pageSize: 3, totalCount: filtered.length, hasMore: page * 3 < filtered.length };
    } else data = mode === 'empty' ? { ...fixture, subjects: [], courses: [], trainers: [], centerInfo: {} }
      : mode === 'missing-avatar' ? { ...fixture, trainers: fixture.trainers.map(t => ({ ...t, avatarUrl: '' })) } : fixture;
    const respond = () => res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ success: true, data }));
    if (mode === 'delay-physics' && pathname === '/api/landing/classes' && parsed.searchParams.get('subjectId') === '2') setTimeout(respond, 350);
    else respond();
    return;
  }
  const requested = path.resolve(dist, '.' + decodeURIComponent(pathname));
  if (requested !== dist && !requested.startsWith(dist + path.sep)) { res.writeHead(403).end(); return; }
  const exists = fs.existsSync(requested) && fs.statSync(requested).isFile();
  if (!exists && pathname.includes('.')) { res.writeHead(404).end(); return; }
  const file = exists ? requested : path.join(dist, 'index.html');
  if (!fs.existsSync(file)) { res.writeHead(200, { 'Content-Type': 'text/html' }).end('<!doctype html><title>Image optimization</title>'); return; }
  res.writeHead(200, { 'Content-Type': mime[path.extname(file)] ?? 'application/octet-stream' }).end(fs.readFileSync(file));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let chrome, socket, session, sequence = 0;
const pending = new Map();
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
function send(method, params = {}, target = session) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 20000);
    pending.set(id, { resolve, reject, timer });
    socket.send(JSON.stringify({ id, method, params, ...(target ? { sessionId: target } : {}) }));
  });
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
  return result.result.value;
}
async function until(expression, description) {
  const end = Date.now() + 15000;
  while (Date.now() < end) { if (await evaluate(`!!(${expression})`)) return; await delay(50); }
  throw new Error(`Timed out: ${description}`);
}
async function screenshot(name, selector) {
  const previousScroll = await evaluate('scrollY');
  if (selector === '#faq') {
    // A viewport capture avoids Chromium clipping the animated grid's heading
    // when capturing this section below the fold with captureBeyondViewport.
    await evaluate("window.scrollTo({top:document.querySelector('#faq').getBoundingClientRect().top+scrollY-100,behavior:'instant'})");
    await delay(80);
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(output, name + '.png'), Buffer.from(shot.data, 'base64'));
    await evaluate(`window.scrollTo({top:${previousScroll},behavior:'instant'})`);
    return;
  }
  if (selector) {
    // Capture a section from document coordinates without a sticky header or
    // floating control covering its first/last lines at the current scroll offset.
    await evaluate("window.scrollTo({top:0,behavior:'instant'})");
    await delay(80);
  }
  const clip = await evaluate(selector ? `(() => { const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return {x:r.x,y:r.y+scrollY,width:r.width,height:r.height,scale:1}; })()` : `({x:0,y:0,width:innerWidth,height:document.documentElement.scrollHeight,scale:1})`);
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip });
  fs.writeFileSync(path.join(output, name + '.png'), Buffer.from(shot.data, 'base64'));
  if (selector) await evaluate(`window.scrollTo({top:${previousScroll},behavior:'instant'})`);
}
const checks = [];
try {
  const ws = await new Promise((resolve, reject) => {
    chrome = spawn(process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-extensions', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank'], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
    const timer = setTimeout(() => reject(new Error('Chrome startup timed out')), 10000);
    chrome.on('error', reject);
    chrome.stderr.on('data', chunk => { const match = chunk.toString().match(/DevTools listening on (ws:\/\/\S+)/); if (match) { clearTimeout(timer); resolve(match[1]); } });
  });
  socket = new WebSocket(ws);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id) { const task = pending.get(message.id); if (task) { clearTimeout(task.timer); pending.delete(message.id); if (message.error) task.reject(new Error(JSON.stringify(message.error))); else task.resolve(message.result); } }
    else if (message.method === 'Runtime.exceptionThrown') { browserErrors.push(message.params.exceptionDetails.text); console.error('Browser exception:', message.params.exceptionDetails.exception?.description ?? message.params.exceptionDetails.text); }
    else if (message.method === 'Network.requestWillBeSent' && new URL(message.params.request.url).pathname.startsWith('/api/')) apiRequests.push(message.params.request.url);
    else if (message.method === 'Network.loadingFailed' && message.params.errorText !== 'net::ERR_ABORTED') console.error('Browser request failed:', message.params.errorText, message.params.blockedReason ?? '');
    else if (message.method === 'Fetch.requestPaused') {
      // Make screenshot typography independent of external font/CDN availability.
      const event = message.params;
      const url = new URL(event.request.url);
      let body = '';
      let type = 'text/plain';
      if (url.pathname.includes('bootstrap.min.css')) { body = fs.readFileSync(path.join(root, 'src/assets/css/bootstrap.min.css'), 'utf8'); type = 'text/css'; }
      send('Fetch.fulfillRequest', { requestId: event.requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: type }], body: Buffer.from(body).toString('base64') }, message.sessionId).catch(error => { if (!error.message.includes('Invalid InterceptionId')) console.error(error); });
    }
  });
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' }, null);
  ({ sessionId: session } = await send('Target.attachToTarget', { targetId, flatten: true }, null));
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  await send('Fetch.enable', { patterns: [{ urlPattern: 'https://*' }] });
  await send('Page.navigate', { url: origin + '/' });
  if (optimize) {
    await delay(250);
    for (const [name, width] of [['hero', 1200], ['mathematics', 640], ['physics', 640], ['english', 640]]) {
      for (const size of name === 'hero' ? [width, 700] : [width]) {
        const data = await evaluate(`(async()=>{const image=new Image();image.src=${JSON.stringify(origin + '/assets/landing/' + name + '.png')};await image.decode();const c=document.createElement('canvas');c.width=${size};c.height=Math.round(image.naturalHeight*c.width/image.naturalWidth);c.getContext('2d').drawImage(image,0,0,c.width,c.height);return c.toDataURL('image/webp',.84).split(',')[1];})()`);
        const file = path.join(root, 'public/assets/landing', name + (size === 700 ? '-mobile' : '') + '.webp');
        fs.writeFileSync(file, Buffer.from(data, 'base64')); console.log(path.basename(file), fs.statSync(file).size);
      }
    }
  } else if (staticQa) {
    async function key(key, code, windowsVirtualKeyCode) {
      await send('Page.bringToFront');
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode, ...(key === 'Enter' ? { text: '\r' } : {}) });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode });
    }
    async function mouseClick(selector) {
      await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);
      const point = await evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);
      await send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...point });
      await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 });
      await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 });
    }
    for (const width of [1440, 1280, 768, 390, 360]) {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
      await send('Page.navigate', { url: origin + '/' });
      await until("document.querySelectorAll('.et-class-card').length===2 && document.querySelectorAll('.et-teacher-card').length===3", 'static content');
      await evaluate("Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>{});})).then(()=>true)");
      assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'), true, `${width}: no overflow`);
      assert.equal(await evaluate("document.querySelectorAll('.et-skeleton-grid,[role=alert]').length"), 0);
      assert.equal(await evaluate("document.querySelectorAll('.et-program').length"), 4);
      assert.deepEqual(await evaluate("[...document.querySelectorAll('.et-class-card h3')].map(e=>e.textContent)"), ['Class 9 - Intensive Physics', 'Class 8 - English Foundation']);
      assert.equal(await evaluate("document.querySelectorAll('.et-initials').length"), 3);
      assert.equal(await evaluate("document.querySelector('a[href^=\"tel:\"]').getAttribute('href')"), 'tel:19006868');
      assert.equal(await evaluate("document.querySelectorAll('a[href^=\"mailto:\"]').length"), 0, 'no fabricated email');
      assert.equal(await evaluate("[...document.querySelectorAll('a[href^=\"#\"]')].every(a=>document.getElementById(a.hash.slice(1)))"), true);
      if (width >= 1200) assert.equal(await evaluate("(()=>{const r=document.createRange();r.selectNodeContents(document.querySelectorAll('.et-stat span')[2]);return r.getClientRects().length})()"), 1);
      await screenshot(`static-${width}-full`);
      // Every published subject filters correctly, including the two empty subjects.
      for (const [index, name] of [[0, null], [1, 'Physics'], [2, null], [3, 'English']]) {
        await evaluate(`document.querySelectorAll('.et-program')[${index}].click()`);
        await until(`document.querySelectorAll('.et-class-card').length===${name ? 1 : 0}`, 'local subject filter');
        if (name) assert.match(await evaluate("document.querySelector('.et-class-card').innerText"), new RegExp(name));
        else assert.match(await evaluate("document.querySelector('#classes').innerText"), /No classes are currently available/);
      }
      await evaluate("document.querySelector('.et-filters button').click()");
      await until("document.querySelectorAll('.et-class-card').length===2", 'all subjects');
      assert.equal(await evaluate("document.querySelectorAll('#classes .et-centered,#programs button').length"), 0, 'pagination controls only when needed');
      for (let i = 0; i < 3; i++) {
        await evaluate(`document.querySelectorAll('.et-profile-button')[${i}].focus();document.querySelectorAll('.et-profile-button')[${i}].click()`);
        await until("document.querySelector('.et-profile-dialog')?.open", 'profile');
        assert.equal(await evaluate("document.querySelector('#teacher-profile-title').textContent"), ['ThS. Hoàng Quốc Việt', 'ThS. Huỳnh Khánh Duy', 'Âu Dương Tài'][i]);
        await key('Escape', 'Escape', 27);
        await until("!document.querySelector('.et-profile-dialog')", 'close profile');
        assert.equal(await evaluate("document.activeElement.classList.contains('et-profile-button')"), true);
      }
      await mouseClick('.et-faq-toggle');
      await until("document.querySelector('.et-faq-toggle').getAttribute('aria-expanded')==='true'", 'FAQ mouse opens');
      assert.equal(await evaluate("getComputedStyle(document.querySelector('.et-faq-panel')).transitionDuration.split(',').every(t=>t.trim()==='0.26s')"), true);
      await evaluate("document.querySelector('.et-faq-toggle').focus()");
      await key('Enter', 'Enter', 13);
      await until("document.querySelector('.et-faq-toggle').getAttribute('aria-expanded')==='false'", 'FAQ keyboard closes');
      await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
      assert.equal(await evaluate("Number.parseFloat(getComputedStyle(document.querySelector('.et-faq-panel')).transitionDuration)<0.01"), true);
      await send('Emulation.setEmulatedMedia', { features: [] });
      if (width < 1200) await evaluate("document.querySelector('.et-header .et-menu-toggle').click()");
      await evaluate("[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Sign In')).click()");
      await until("document.querySelector('.et-workspace-dialog')?.open", 'workspace chooser');
      assert.ok(await evaluate("Boolean(document.querySelector('#login-identifier'))"));
      await key('Escape', 'Escape', 27);
      await until("!document.querySelector('dialog')", 'close workspace');
      await mouseClick('.et-card-bottom .et-primary');
      await until("location.hash==='#contact'", 'class contact CTA');
      await mouseClick('.et-contact-banner a');
      await until("location.hash==='#contact-details'", 'consultation CTA');
      await evaluate("window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'})");
      await until("document.querySelector('.et-back-to-top')", 'back to top');
      await evaluate("document.querySelector('.et-back-to-top').focus()");
      await key('Enter', 'Enter', 13);
      await until('scrollY<5', 'back to top keyboard');
      await evaluate("window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'})");
      await until("document.querySelector('.et-back-to-top')", 'back to top visible');
      await mouseClick('.et-back-to-top');
      await until('scrollY<5', 'back to top mouse');
      const columns = await evaluate("getComputedStyle(document.querySelector('.et-class-grid')).gridTemplateColumns.split(' ').length");
      assert.equal(columns, width >= 1200 ? 3 : width === 768 ? 2 : 1);
      checks.push({ width, sections: 'complete', overflow: false, columns, subjectFilters: 'passed', emptyState: 'passed', profiles: 'passed', faqMouseKeyboardReducedMotion: 'passed', workspaceChooser: 'passed', ctas: 'passed', backToTopMouseKeyboard: 'passed' });
    }
    // Boundary interactions use an isolated test bundle, never additional public demo records.
    await send('Page.navigate', { url: origin + '/qa/static-harness' });
    await until("document.querySelectorAll('.et-program').length===8 && document.querySelectorAll('.et-class-card').length===3", 'boundary harness');
    await evaluate("document.querySelector('#programs button').click()");
    await until("document.querySelectorAll('.et-program').length===9", 'show more');
    await evaluate("document.querySelector('#programs button').click()");
    await until("document.querySelectorAll('.et-program').length===8", 'show less');
    await evaluate("document.querySelector('#classes .et-centered button').click()");
    await until("document.querySelectorAll('.et-class-card').length===6", 'local page 2');
    await evaluate("document.querySelector('#classes .et-centered button').click()");
    await until("document.querySelectorAll('.et-class-card').length===7", 'local last page');
    assert.equal(await evaluate("document.querySelectorAll('#classes .et-centered button').length"), 0);
    await evaluate("(()=>{const s=document.querySelector('#class-subject');s.value='4';s.dispatchEvent(new Event('change',{bubbles:true}));})()");
    await until("document.querySelectorAll('.et-class-card').length===1", 'filter resets pagination');
    await evaluate("(()=>{const s=document.querySelector('#class-subject');s.value='';s.dispatchEvent(new Event('change',{bubbles:true}));})()");
    await until("document.querySelectorAll('.et-class-card').length===3", 'all resets pagination');
    assert.equal(calls, 0, 'zero backend requests including harness interactions');
    assert.deepEqual(apiRequests, []);
    assert.deepEqual(browserErrors, []);
    checks.push({ boundaryHarness: 'passed', showMoreLess: 'passed', loadMoreLocal: 'passed', filterResetsPagination: 'passed', backend: 'disabled (all /api/* return 503)', apiRequests, browserErrors });
    fs.writeFileSync(path.resolve(output, '../browser-results.json'), JSON.stringify(checks, null, 2));
    console.log(JSON.stringify(checks, null, 2));
  } else if (process.argv.includes('--statistics-hover')) {
    const baseline = process.env.LANDING_QA_BASELINE === '1';
    const inspectButton = () => evaluate(`(() => {
      const el=document.querySelector('.et-card-bottom .et-primary'),s=getComputedStyle(el),i=getComputedStyle(el.querySelector('svg'));
      return {background:s.backgroundColor,image:s.backgroundImage,color:s.color,icon:i.color,transform:s.transform,shadow:s.boxShadow,radius:s.borderRadius,transition:s.transitionDuration,focusVisible:el.matches(':focus-visible'),outline:s.outlineStyle,href:el.getAttribute('href')};
    })()`);
    async function captureButton(name) {
      const shot=await send('Page.captureScreenshot',{format:'png'});
      fs.writeFileSync(path.join(output,name+'.png'),Buffer.from(shot.data,'base64'));
    }
    for (const width of [1440,1280,768,390,360]) {
      await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
      await send('Emulation.setEmulatedMedia',{features:[]});
      await send('Page.navigate',{url:origin+'/'});
      await until("document.querySelectorAll('.et-class-card').length>0",'class cards');
      await send('Page.bringToFront');
      await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:0,y:0});
      const statistics=await evaluate(`(()=>[...document.querySelectorAll('.et-stat')].map(el=>{
        const label=el.querySelector('span'),s=getComputedStyle(label),r=document.createRange();r.selectNodeContents(label);
        const cell=el.getBoundingClientRect(),text=label.getBoundingClientRect(),icon=el.querySelector('svg').getBoundingClientRect();
        return{text:label.textContent,lines:r.getClientRects().length,font:s.fontSize,maxWidth:s.maxWidth,whiteSpace:s.whiteSpace,labelWidth:text.width,cellWidth:cell.width,iconWidth:icon.width,fits:text.right<=cell.right&&icon.left>=cell.left&&label.scrollWidth<=label.clientWidth};
      }))()`);
      await screenshot(`statistics-${width}`,'.et-statistics');
      await evaluate("document.querySelector('.et-card-bottom .et-primary').scrollIntoView({block:'center',behavior:'instant'})");
      await delay(250);
      const normal=await inspectButton();
      await captureButton(`button-${width}-normal`);
      const point=await evaluate("(()=>{const r=document.querySelector('.et-card-bottom .et-primary').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()");
      await send('Input.dispatchMouseEvent',{type:'mouseMoved',...point});
      await delay(35);
      const duringHover=await inspectButton();
      await delay(260);
      const hover=await inspectButton();
      await captureButton(`button-${width}-hover`);
      // Keyboard Tab must produce a visible focus indicator without changing CTA destination.
      await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:0,y:0});
      await evaluate("document.querySelector('.et-card-bottom .et-primary').focus()");
      await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
      await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
      await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9,modifiers:8});
      await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9,modifiers:8});
      await delay(240);
      const focus=await inspectButton();
      await captureButton(`button-${width}-focus`);
      await evaluate("document.querySelector('.et-card-bottom .et-primary').scrollIntoView({block:'center',behavior:'instant'})");
      await delay(100);
      const activePoint=await evaluate("(()=>{const r=document.querySelector('.et-card-bottom .et-primary').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()");
      await send('Input.dispatchMouseEvent',{type:'mouseMoved',...activePoint});
      await send('Input.dispatchMouseEvent',{type:'mousePressed',...activePoint,button:'left',clickCount:1});
      await delay(240);
      const active=await inspectButton();
      await send('Input.dispatchMouseEvent',{type:'mouseReleased',...activePoint,button:'left',clickCount:1});
      if (!baseline) {
        await until("location.hash==='#contact'",'mouse CTA reaches contact');
        await evaluate("history.replaceState(null,'',location.pathname);document.querySelector('.et-card-bottom .et-primary').focus()");
        await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r'});
        await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
        await until("location.hash==='#contact'",'keyboard CTA reaches contact');
      }
      const overflow=await evaluate('document.documentElement.scrollWidth>innerWidth');
      if (!baseline) {
        assert.equal(overflow,false,`${width}: no overflow`);
        assert.deepEqual(statistics.map(s=>s.text),['Students','Classes','Teachers & Teaching Assistants']);
        assert.ok(statistics.every(s=>s.fits),`${width}: stats fit their cells`);
        if(width>=1200) {assert.equal(statistics[2].lines,1);assert.equal(statistics[2].font,'14px');}
        assert.equal(normal.background,'rgb(7, 132, 68)');
        assert.equal(hover.background,'rgb(6, 118, 71)');
        for(const state of [normal,duringHover,hover,focus,active]) {
          assert.equal(state.image,'none');assert.equal(state.color,'rgb(255, 255, 255)');assert.equal(state.icon,'rgb(255, 255, 255)');
          assert.ok(!state.background.startsWith('rgba'),`${width}: opaque green throughout transition`);
        }
        assert.equal(focus.focusVisible,true);assert.notEqual(focus.outline,'none');
        assert.equal(active.background,'rgb(5, 100, 60)');
        assert.equal(normal.radius,'9px');assert.equal(normal.href,'#contact');
      }
      checks.push({width,statistics,normal,duringHover,hover,focus,active,overflow,mouseClick:baseline?'not asserted in baseline':'contact',keyboardClick:baseline?'not asserted in baseline':'contact'});
    }
    fs.writeFileSync(path.resolve(output,'../browser-results.json'),JSON.stringify(checks,null,2));
    console.log(JSON.stringify(checks,null,2));
  } else {
    for (const width of process.argv.includes('--actual') ? [] : [1440, 768, 390, 360]) {
      await send('Emulation.setEmulatedMedia', { features: [] });
      await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
      mode = 'ready'; await send('Page.navigate', { url: origin + '/' });
      await until("document.querySelectorAll('.et-class-card').length===3", 'ready cards');
      await evaluate('window.scrollTo(0,0)');
      await evaluate("Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>{});})).then(()=>true)");
      await delay(150);
      assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'), true, `${width}: no overflow`);
      assert.equal(await evaluate("document.querySelectorAll('.et-stat').length"), 3);
      assert.equal(await evaluate("document.documentElement.lang"), 'en');
      assert.equal(await evaluate("document.querySelectorAll('main .et-eyebrow,main .et-hero-note,main figcaption,main .et-class-disclaimer,.et-statistics>p').length"), 0, 'decorative microcopy removed');
      assert.equal(await evaluate("[...document.querySelectorAll('.et-teacher-content .et-pill')].every(el=>{const s=getComputedStyle(el);return s.whiteSpace==='nowrap'&&el.scrollWidth<=el.clientWidth;})"), true, 'role badges remain on one line');
      assert.deepEqual(await evaluate("[...document.querySelectorAll('.et-step-number')].map(el=>el.textContent)"), ['01','02','03']);
      assert.equal(await evaluate("[...document.querySelectorAll('.et-step-number')].every(el=>getComputedStyle(el).color==='rgb(6, 101, 54)'&&Number.parseFloat(getComputedStyle(el).fontSize)>=15)"), true, 'step indicators have strong contrast and readable size');
      assert.equal(await evaluate("[...document.querySelectorAll('a[href^=\"#\"]')].every(a=>document.getElementById(a.hash.slice(1)))"), true, 'all anchors have targets');
      assert.equal(await evaluate("document.querySelector('a[href^=\"mailto:\"]').getAttribute('href')"), 'mailto:consultation@example.test');
      assert.equal(await evaluate("document.querySelector('a[href^=\"tel:\"]').getAttribute('href')"), 'tel:+84123456789');
      assert.equal(await evaluate("document.body.innerText.includes('Open for Enrollment')"), false);
      assert.equal(await evaluate("document.body.innerText.includes('/month')"), false);
      assert.equal(await evaluate("document.querySelectorAll('.et-program').length"), 8);
      await evaluate("document.querySelector('#programs button').click()");
      assert.equal(await evaluate("document.querySelectorAll('.et-program').length"), 12);
      await evaluate("document.querySelector('#programs button').click()");
      assert.equal(await evaluate("document.querySelectorAll('.et-program').length"), 8);
      assert.equal(await evaluate("document.querySelector('#class-subject').options.length"), 13);
      assert.equal(await evaluate("document.querySelectorAll('.et-teacher-photo img').length"), 1);
      assert.equal(await evaluate("document.querySelectorAll('.et-teacher-photo .et-initials').length"), 2);
      assert.match(await evaluate("document.querySelector('#classes').innerText"), /Mon, Nov 16/);
      assert.match(await evaluate("document.querySelector('#classes').innerText"), /Contact for details/);
      assert.equal(await evaluate("[...document.querySelectorAll('.et-class-card')].some(c=>c.innerText.includes('Lớp'))"), false);
      await screenshot(`fixture-${width}-full`);
      if (width === 1440) for (const id of ['hero', 'about', 'programs', 'classes', 'teachers', 'enrollment', 'faq', 'contact']) await screenshot(`fixture-1440-${id}`, '#' + id);
      await evaluate("document.querySelector('.et-profile-button').focus();document.querySelector('.et-profile-button').click()");
      await until("document.querySelector('.et-profile-dialog')?.open", 'public profile modal');
      assert.match(await evaluate("document.querySelector('.et-profile-dialog').innerText"), /Photo Rendering Test/);
      assert.equal(await evaluate("document.querySelector('.et-profile-dialog').innerText.includes('example.test')"), false);
      if (width === 1440) await screenshot('fixture-profile-modal');
      await evaluate("document.querySelector('[aria-label=\"Close teacher profile\"]').click()");
      await until("document.activeElement.classList.contains('et-profile-button')", 'profile returns focus');
      const cols = await evaluate("getComputedStyle(document.querySelector('.et-class-grid')).gridTemplateColumns.split(' ').length");
      assert.equal(cols, width === 1440 ? 3 : width === 768 ? 2 : 1);
      const login = "[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Sign In'))";
      if (width < 1200) await evaluate("document.querySelector('.et-header .et-menu-toggle').click()");
      await evaluate(`${login}.click()`);
      await until("document.querySelector('dialog')?.open", 'workspace modal');
      assert.ok(await evaluate("Boolean(document.querySelector('#login-identifier'))"));
      assert.ok(await evaluate("Boolean(document.querySelector('#login-password'))"));
      if (width === 390) await screenshot('fixture-390-workspace');
      await send('Page.bringToFront');
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      await until("!document.querySelector('dialog')", 'Escape closes modal');
      await evaluate("document.querySelector('.et-faq-toggle').scrollIntoView({block:'center',behavior:'instant'})");
      const point = await evaluate("(()=>{const r=document.querySelector('.et-faq-toggle').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()");
      await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 });
      await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 });
      await until("document.querySelector('.et-faq-toggle').getAttribute('aria-expanded')==='true'", 'mouse opens FAQ');
      await delay(70);
      const intermediate = await evaluate("getComputedStyle(document.querySelector('.et-faq-panel')).opacity");
      assert.ok(Number(intermediate)>0 && Number(intermediate)<1, `FAQ opening animates: ${intermediate}`);
      await until("getComputedStyle(document.querySelector('.et-faq-panel')).opacity==='1'", 'FAQ opening settles');
      assert.equal(await evaluate("document.querySelector('.et-faq-panel').inert"), false);
      await screenshot(`fixture-${width}-faq-open`, '#faq');
      await evaluate("document.querySelector('.et-faq-toggle').focus()");
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
      await until("document.querySelector('.et-faq-toggle').getAttribute('aria-expanded')==='false'", 'keyboard closes FAQ');
      await delay(70);
      const closing = await evaluate("getComputedStyle(document.querySelector('.et-faq-panel')).opacity");
      assert.ok(Number(closing)>0 && Number(closing)<1, `FAQ closing animates: ${closing}`);
      await until("document.querySelector('.et-faq-panel').getBoundingClientRect().height===0", 'FAQ closed height');
      assert.equal(await evaluate("document.querySelector('.et-faq-panel').inert"), true);
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: ' ', code: 'Space', windowsVirtualKeyCode: 32 });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key: ' ', code: 'Space', windowsVirtualKeyCode: 32 });
      await until("document.querySelector('.et-faq-toggle').getAttribute('aria-expanded')==='true'", 'Space opens FAQ');
      await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
      assert.equal(await evaluate("getComputedStyle(document.querySelector('.et-faq-panel')).transitionDuration"), '0s');
      await evaluate("document.querySelector('.et-faq-toggle').click()");
      await evaluate("(()=>{const s=document.querySelector('#class-subject');s.value='2';s.dispatchEvent(new Event('change',{bubbles:true}));})()");
      await until("document.querySelectorAll('.et-class-card').length===1", 'subject filter');
      assert.match(await evaluate("document.querySelector('.et-class-card').innerText"), /Physics/);
      await evaluate("(()=>{const s=document.querySelector('#class-subject');s.value='3';s.dispatchEvent(new Event('change',{bubbles:true}));})()");
      await until("document.querySelector('#classes').innerText.includes('No classes')", 'empty filter');
      await evaluate("document.querySelector('#programs button').click()");
      await evaluate("[...document.querySelectorAll('.et-program')].find(a=>a.innerText.includes('Robotics')).click()");
      await until("document.querySelectorAll('.et-class-card').length===3", 'subject outside original preview');
      assert.equal(await evaluate("[...document.querySelectorAll('.et-class-card')].every(c=>/Robotics/i.test(c.innerText))"), true);
      if (width === 1440) mode = 'page-error';
      await evaluate("[...document.querySelectorAll('#classes button')].find(b=>b.textContent.includes('Load More')).click()");
      if (width === 1440) {
        await until("document.querySelector('.et-load-more-error')", 'next-page failure');
        assert.equal(await evaluate("document.querySelectorAll('.et-class-card').length"), 3);
        mode = 'ready';
        await evaluate("document.querySelector('.et-load-more-error button').click()");
      }
      await until("document.querySelectorAll('.et-class-card').length===6", 'second class page');
      await evaluate("[...document.querySelectorAll('#classes button')].find(b=>b.textContent.includes('Load More')).click()");
      await until("document.querySelectorAll('.et-class-card').length===7", 'last class page');
      if (width === 1440) {
        mode = 'delay-physics';
        await evaluate("(()=>{const s=document.querySelector('#class-subject');s.value='2';s.dispatchEvent(new Event('change',{bubbles:true}));})()");
        await delay(30);
        await evaluate("(()=>{const s=document.querySelector('#class-subject');s.value='12';s.dispatchEvent(new Event('change',{bubbles:true}));})()");
        await until("document.querySelectorAll('.et-class-card').length===3", 'latest filter wins');
        await delay(400);
        assert.equal(await evaluate("[...document.querySelectorAll('.et-class-card')].every(c=>/Robotics/i.test(c.innerText))"), true, 'stale physics request cannot replace robotics');
        mode = 'ready';
      }
      await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
      await evaluate("window.scrollTo(0,1500)");
      await delay(100);
      await until("document.querySelector('[aria-label=\"Back to top\"]')", 'floating button appears');
      await evaluate("document.querySelector('[aria-label=\"Back to top\"]').click()");
      await until('scrollY===0', 'mouse back to top');
      await evaluate("window.scrollTo(0,1500)");
      await delay(100);
      await until("document.querySelector('[aria-label=\"Back to top\"]')", 'button reappears');
      await evaluate("document.querySelector('[aria-label=\"Back to top\"]').focus()");
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
      await until('scrollY===0', 'keyboard back to top');
      const spacing = await evaluate("(()=>{const a=document.querySelector('#teachers .et-teacher-grid').getBoundingClientRect(),b=document.querySelector('#enrollment .et-heading').getBoundingClientRect();return b.top-a.bottom;})()");
      assert.ok(spacing >= 48 && spacing <= 88, `section gap: ${spacing}`);
      checks.push({ width, overflow: false, columns: cols, login: 'passed', filter: 'passed', faq: 'passed', teacherProfile: 'passed', twelveSubjects: 'passed', sevenClassPagination: 'passed', backToTopMouseAndKeyboard: 'passed', teachersEnrollmentGap: spacing });
    }
    for (const state of process.argv.includes('--actual') ? [] : ['empty', 'error', 'loading']) {
      mode = state;
      await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
      await send('Page.navigate', { url: origin + '/' });
      await until("document.querySelector('h1')", 'static hero');
      const expression = state === 'empty' ? "document.querySelector('#classes').innerText.includes('No classes')" : state === 'error' ? "document.querySelectorAll('[role=alert]').length===4" : "document.querySelectorAll('.et-skeleton-grid').length===4";
      await until(expression, state);
      assert.equal(await evaluate("document.querySelectorAll('.et-class-card,.et-teacher-card').length"), 0);
      await screenshot(state + '-1440-full');
      if (state === 'error') {
        mode = 'ready'; const before = calls;
        await evaluate("document.querySelector('#classes button').click()");
        await until("document.querySelectorAll('.et-class-card').length===3", 'retry success');
        assert.equal(calls, before + 1, 'class retry is independent of the overview');
      }
      if (state === 'loading') {
        await until("document.querySelectorAll('[role=alert]').length===4", 'timeout becomes retryable error');
        assert.equal(await evaluate("document.querySelectorAll('.et-skeleton-grid').length"), 0);
      }
      for (const res of held) res.destroy(); held.clear();
      checks.push({ state, noMockRecords: true, staticContentVisible: true });
    }
    mode = 'missing-avatar';
    await send('Page.navigate', { url: origin + '/' });
    await until("document.querySelectorAll('.et-teacher-photo .et-initials').length===3", 'missing avatars');
    await screenshot('fixture-missing-avatars', '#teachers');
    // Capture the production build against the isolated, verified READ ONLY DB host.
    mode = 'live';
    for (const width of process.argv.includes('--fixtures-only') ? [] : [1440, 768, 390, 360]) {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
      await send('Page.navigate', { url: origin + '/' });
      await until("document.querySelectorAll('.et-teacher-card').length>0 && document.querySelectorAll('.et-skeleton-grid').length===0", 'actual read-only DB data');
      await evaluate("Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>{});})).then(()=>true)");
      assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'), true);
      await screenshot('actual-readonly-db-' + width);
      if (width === 1440) { await screenshot('actual-teacher-cards', '#teachers'); await screenshot('actual-classes', '#classes'); }
    }
    fs.writeFileSync(path.resolve(output, '../browser-results.json'), JSON.stringify(checks, null, 2));
    console.log(JSON.stringify({ passed: checks, screenshots: output }, null, 2));
  }
} finally {
  if (socket?.readyState === 1) { await send('Browser.close', {}, null).catch(() => {}); socket.close(); }
  chrome?.kill();
  for (const res of held) res.destroy();
  server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
}
