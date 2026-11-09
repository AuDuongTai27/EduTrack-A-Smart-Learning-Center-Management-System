import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {build} from 'vite';
import react from '@vitejs/plugin-react';

// Test the Schedule-owned component and then the actual Schedule workspaces.
// The six owner page hooks remain untouched. APIs use only isolated HTTP/MySQL.
const origin=process.env.EDUTRACK_SCHEDULE_TEST_ORIGIN;
const actors={'teacher':501,'other-teacher':502,'teaching-assistant':503,'student':504,'center-manager':505,'admin-staff':506};
assert.match(origin??'',/^http:\/\/127\.0\.0\.1:\d+$/);
const output=fs.mkdtempSync(path.join(os.tmpdir(),'edutrack-schedule-change-browser-')),root=process.cwd(),src=f=>path.join(root,f).replaceAll('\\','/');
fs.writeFileSync(path.join(output,'index.html'),'<!doctype html><html><meta name="viewport" content="width=device-width,initial-scale=1"><div id="root"></div><script type="module" src="./entry.tsx"></script></html>');
fs.writeFileSync(path.join(output,'entry.tsx'),`import React from 'react';import{createRoot}from'react-dom/client';import{BrowserRouter}from'react-router-dom';import{ScheduleChangeRequests}from${JSON.stringify(src('src/GUIs/components/shared/schedule/ScheduleChangeRequests.tsx'))};import ${JSON.stringify(src('src/assets/css/bootstrap.min.css'))};import ${JSON.stringify(src('src/GUIs/components/shared/schedule/schedule.css'))};const q=new URLSearchParams(location.search);const session=q.get('session')?await fetch('/api/schedule/sessions/'+q.get('session')+'?userId='+({teacher:501,'admin-staff':506,'center-manager':505}[location.pathname.split('/')[1]]||501),{credentials:'omit'}).then(r=>{if(!r.ok)throw Error(r.status);return r.json()}):undefined;window.appliedEvents=0;window.addEventListener('edutrack:schedule-applied',()=>window.appliedEvents++);createRoot(document.getElementById('root')).render(<BrowserRouter><main style={{padding:12}}><ScheduleChangeRequests mode={q.get('mode')==='reviewer'?'reviewer':'teacher'} session={session}/></main></BrowserRouter>);`);
await build({configFile:false,root:output,plugins:[react()],logLevel:'warn',resolve:{alias:[{find:'react-router-dom',replacement:src('node_modules/react-router-dom')},{find:'react-dom',replacement:src('node_modules/react-dom')},{find:'react',replacement:src('node_modules/react')}]},build:{target:'esnext',outDir:path.join(output,'dist'),emptyOutDir:true}});
const requests=[],failures=[],summary=[],workspaces=[];
const faults={capFailure:0,capDelay:0,listFailure:0};
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://127.0.0.1');if(url.pathname.startsWith('/api/')){
    if(!url.pathname.startsWith('/api/schedule/')&&!url.pathname.startsWith('/api/user-selection')){res.writeHead(404).end();return;}
    requests.push({method:req.method,path:url.pathname});const proxy=http.request(origin+req.url,{method:req.method,headers:{...req.headers,host:new URL(origin).host}},r=>{res.writeHead(r.statusCode,r.headers);r.pipe(res);});proxy.on('error',e=>{failures.push(e.message);res.writeHead(502).end();});req.pipe(proxy);return;
  }
  const file=!url.pathname.startsWith('/assets/')?path.join(output,'dist/index.html'):path.join(output,'dist',url.pathname);
  if(!file.startsWith(path.join(output,'dist'))||!fs.existsSync(file)){res.writeHead(404).end();return;}
  res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const ui='http://127.0.0.1:'+server.address().port;
let chrome,socket,session,sequence=0;const pending=new Map(),delay=ms=>new Promise(r=>setTimeout(r,ms)),query=s=>'document.querySelector('+JSON.stringify(s)+')';
function send(method,params={},target=session){return new Promise((resolve,reject)=>{const id=++sequence,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method));},20000);pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params,...(target?{sessionId:target}:{})}));});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
async function until(expression,label){const end=Date.now()+15000;while(Date.now()<end){if(await evaluate('Boolean('+expression+')'))return;await delay(40);}throw Error('Timeout '+label+'\n'+await evaluate('document.body.innerText'));}
async function button(label,double=false){const b='Array.from(document.querySelectorAll("button")).find(b=>b.textContent.trim()==='+JSON.stringify(label)+')';assert.ok(await evaluate('Boolean('+b+')'),'Button '+label);await evaluate(b+'.click();'+(double?b+'.click();':''));}
async function input(label,value){await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify('[aria-label="'+label+'"]')});if(!el)throw Error('Missing ${label}');const proto=el.tagName==='SELECT'?HTMLSelectElement.prototype:el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(el,${JSON.stringify(value)});el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));})()`);}
async function api(path,actor='teacher',method='GET',body){const r=await fetch(origin+path+(path.includes('?')?'&':'?')+'userId='+actors[actor],{method,headers:{...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});assert.ok(r.ok,'HTTP '+r.status+' '+path);return r.json();}
async function paused(event){
  const url=new URL(event.request.url);
  if(url.origin!==origin){
    if(url.pathname.endsWith('/bootstrap.min.css')){await send('Fetch.fulfillRequest',{requestId:event.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'text/css'}],body:fs.readFileSync('src/assets/css/bootstrap.min.css').toString('base64')});return;}
    await send('Fetch.failRequest',{requestId:event.requestId,errorReason:'BlockedByClient'});return;
  }
  if(url.pathname.startsWith('/api/')){
    requests.push({scope:'workspace',method:event.request.method,path:url.pathname});
    if(!url.pathname.startsWith('/api/schedule/')&&!url.pathname.startsWith('/api/user-selection')){
      assert.equal(event.request.method,'GET','No non-Schedule writes from actual app');
      await send('Fetch.fulfillRequest',{requestId:event.requestId,responseCode:503,body:Buffer.from('{}').toString('base64')});return;
    }
    let fail=false;
    if(url.pathname==='/api/schedule/change-requests/capabilities'){
      if(faults.capDelay){const wait=faults.capDelay;faults.capDelay=0;await delay(wait);}
      if(faults.capFailure){faults.capFailure--;fail=true;}
    }
    if(url.pathname==='/api/schedule/change-requests'&&event.request.method==='GET'&&faults.listFailure){faults.listFailure--;fail=true;}
    if(fail){await send('Fetch.fulfillRequest',{requestId:event.requestId,responseCode:503,responseHeaders:[{name:'Content-Type',value:'application/json'}],body:Buffer.from(JSON.stringify({message:'Chức năng tạm thời không khả dụng (test 503).'})).toString('base64')});return;}
  }
  await send('Fetch.continueRequest',{requestId:event.requestId});
}
async function workspace(actor,route){
  const script=await send('Page.addScriptToEvaluateOnNewDocument',{source:'if(location.origin==='+JSON.stringify(origin)+')localStorage.setItem('+JSON.stringify('edutrack-selected-user:'+route.replaceAll('-','_'))+','+JSON.stringify(String(actors[actor]))+');'});

  await send('Page.navigate',{url:origin+'/'+route+'/schedule'});
  await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:script.identifier});
  await until('document.querySelector(".et-schedule-summary")&&!Array.from(document.querySelectorAll(".et-schedule-state")).some(e=>e.textContent.includes("Đang tải"))','actual Calendar/List ready');
}
async function openRequests(role){await button(role==='teacher'?'Lịch sử yêu cầu đổi lịch':'Xử lý yêu cầu đổi lịch');await until(query('#et-schedule-change-requests .schedule-change-requests h3'),'Schedule-owned workspace requests');}
const officialReads=()=>requests.filter(r=>r.scope==='workspace'&&r.path==='/api/schedule/sessions'&&r.method==='GET').length;
async function navigate(actor,mode,id){await send('Page.navigate',{url:ui+'/'+actor+'/schedule?mode='+mode+(id?'&session='+id:'')});await until(query('.schedule-change-requests h3'),'component capabilities');}
async function submit(id,kind,date,hour,keepTime=false){
  await navigate('teacher','teacher',id);await button('Dời / Hủy / Học bù');await input('Loại yêu cầu',kind);
  if(kind!=='cancel'){
    await input('Ngày đề xuất',date);
    if(!keepTime){await input('Giờ bắt đầu đề xuất',hour+':00');await input('Giờ kết thúc đề xuất',String(Number(hour)+1).padStart(2,'0')+':00');}
    await input('Phòng đề xuất','Browser '+id);
  }
  await input('Lý do đổi lịch','Browser '+kind+' '+id);
  const before=await api('/api/schedule/sessions/'+id);await button('Preview yêu cầu');await until(query('[data-change-preview]'),'submit Preview');
  assert.deepEqual(await api('/api/schedule/sessions/'+id),before,'Preview preserves official Session');
  const count=requests.filter(r=>r.method==='POST'&&r.path==='/api/schedule/change-requests').length;
  await button('Xác nhận gửi yêu cầu',true);await until('document.body.innerText.includes("lịch chính thức giữ nguyên")','submit pending');
  assert.equal(requests.filter(r=>r.method==='POST'&&r.path==='/api/schedule/change-requests').length,count+1,'Double click only submits once');
  assert.equal(await evaluate('window.appliedEvents'),0);assert.deepEqual(await api('/api/schedule/sessions/'+id),before,'Pending never changes official Session');
  return(await api('/api/schedule/change-requests')).filter(r=>r.session.sessionId===id&&r.status==='pending').at(-1);
}
async function decide(request,decision,actor='admin-staff'){await navigate(actor,'reviewer');await until(query('[data-change-request="'+request.requestId+'"]'),'typed request list');await button('Xem yêu cầu #'+request.requestId);await until(query('[data-change-detail]'),'typed detail');await button('Nhận xem xét');await until('Array.from(document.querySelectorAll("button")).some(b=>b.textContent.trim()==="Preview quyết định"&&!b.disabled)','claim completed');await input('Quyết định đổi lịch',decision);await input('Ghi chú review','Browser explicit '+decision);await button('Preview quyết định');await until(query('[data-decision-preview]'),'decision Preview');const before=await api('/api/schedule/sessions/'+request.session.sessionId);await button('Xác nhận quyết định',true);await until('document.querySelector("[data-change-detail] h4")?.textContent.includes('+JSON.stringify(decision)+')','decision applied');const result=await api('/api/schedule/change-requests/'+request.requestId,actor);if(decision==='rejected'){assert.deepEqual(await api('/api/schedule/sessions/'+request.session.sessionId),before);assert.equal(await evaluate('window.appliedEvents'),0);}else{assert.ok(result.appliedAt);assert.equal(await evaluate('window.appliedEvents'),1);}return result;}
try{
  const ws=await new Promise((resolve,reject)=>{chrome=spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless=new','--no-sandbox','--disable-gpu','--remote-debugging-port=0','--user-data-dir='+path.join(output,'chrome'),'about:blank'],{stdio:['ignore','ignore','pipe']});const timer=setTimeout(()=>reject(Error('Chrome startup timeout')),20000);chrome.stderr.on('data',d=>{const m=d.toString().match(/DevTools listening on (ws:\/\/[^\s]+)/);if(m){clearTimeout(timer);resolve(m[1]);}});});
  socket=new WebSocket(ws);await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});socket.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){clearTimeout(p.timer);pending.delete(m.id);if(m.error)p.reject(Error(JSON.stringify(m.error)));else p.resolve(m.result);}}else if(m.method==='Fetch.requestPaused')paused(m.params).catch(e=>failures.push(e.message));});
  const t=await send('Target.createTarget',{url:'about:blank'},null);({sessionId:session}=await send('Target.attachToTarget',{targetId:t.targetId,flatten:true},null));await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Emulation.setTimezoneOverride',{timezoneId:'America/Los_Angeles'});
  for(const [i,width,height]of [[0,1440,1000],[1,768,1024],[2,390,844],[3,360,780]]){
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<500});const id=9901+i,hour=String(6+i*2).padStart(2,'0'),original=await api('/api/schedule/sessions/'+id);
    const req=await submit(id,'reschedule','2027-01-06',hour,i===0);const moved=await decide(req,'approved',i===1?'center-manager':'admin-staff');
    for(const key of ['sessionId','scheduleId','scheduleVersionId','plannedOccurrenceDate','occurrenceWeekStart'])assert.equal(moved.session[key],original[key],key+' preserved');
    assert.equal(moved.session.actual.sessionDate,'2027-01-06');if(i===0){assert.equal(moved.session.actual.startTime,original.startTime);assert.equal(moved.session.actual.endTime,original.endTime);}
    const reject=await submit(id,'cancel');await decide(reject,'rejected');
    const cancel=await submit(id,'cancel');const cancelled=await decide(cancel,'approved');assert.equal(cancelled.session.actual.status,'cancelled');
    const makeup=await submit(id,'makeup','2027-01-08',hour);const restored=await decide(makeup,'approved');assert.equal(restored.session.actual.status,'scheduled');assert.equal(restored.session.plannedOccurrenceDate,'2027-01-04');
    assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth+2'),false,'Responsive containment '+width);await evaluate('document.querySelector("[data-change-detail]").scrollIntoView({behavior:"instant",block:"start"})');const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(output,'applied-'+width+'.png'),Buffer.from(shot.data,'base64'));
    summary.push({width,id,request:restored.requestId});console.log('PASS Schedule-owned UI '+width+': real Preview/Submit, Pending/Reject preserve Session, atomic reschedule/cancel/makeup, no double submit, unchanged identity');
  }
  await send('Fetch.enable',{patterns:[{urlPattern:'*'}]});
  await send('Page.addScriptToEvaluateOnNewDocument',{source:'(()=>{const D=Date,fixed=D.parse("2027-01-04T01:00:00Z");window.Date=class extends D{constructor(...args){super(...(args.length?args:[fixed]));}static now(){return fixed;}};})()'});
  for(const [i,width,height]of [[0,1440,1000],[1,768,1024],[2,390,844],[3,360,780]]){
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<500});const id=9901+i;
    await workspace('teacher','teacher');await openRequests('teacher');
    await until(query('#et-schedule-change-requests [data-change-request]'),'Teacher history in actual Schedule');
    await evaluate(query('.et-schedule-session[data-session-id="'+id+'"]')+'.click()');
    await until(query('dialog[open] .schedule-change-requests h3'),'real Session detail has Schedule request form');
    await button('Dời / Hủy / Học bù');await input('Loại yêu cầu','cancel');await input('Lý do đổi lịch','Actual workspace cancel '+id);
    const before=await api('/api/schedule/sessions/'+id);const readsBefore=officialReads();
    await button('Preview yêu cầu');await until(query('dialog [data-change-preview]'),'real Session Preview');await button('Xác nhận gửi yêu cầu',true);
    await until('document.querySelector("dialog")?.textContent.includes("lịch chính thức giữ nguyên")','actual pending submitted');
    await delay(100);assert.equal(officialReads(),readsBefore,'Pending does not refresh Calendar/List');assert.deepEqual(await api('/api/schedule/sessions/'+id),before);
    const pendingRequest=(await api('/api/schedule/change-requests')).find(r=>r.session.sessionId===id&&r.status==='pending');assert.ok(pendingRequest);
    await evaluate(query('dialog [aria-label="Đóng chi tiết phiên học"]')+'.click()');
    await until(query('#et-schedule-change-requests [data-change-request="'+pendingRequest.requestId+'"]'),'Teacher history updates after submit without official refresh');
    assert.equal(await evaluate('Array.from(document.querySelectorAll("#et-schedule-change-requests button")).some(b=>b.textContent.trim()==="Nhận xem xét")'),false,'Teacher history has no reviewer action');
    workspaces.push({role:'teacher',width});
    const reviewer=i%2?'admin-staff':'center-manager',other=i%2?'center-manager':'admin-staff';
    await workspace(reviewer,reviewer);await openRequests('reviewer');await until(query('[data-change-request="'+pendingRequest.requestId+'"]'),'reviewer sees actual pending request');
    await button('Xem yêu cầu #'+pendingRequest.requestId);await until(query('[data-change-detail]'),'actual reviewer detail');await button('Nhận xem xét');
    await until('document.querySelector("[data-change-detail] h4")?.textContent.includes("Claimed")','Claimed displayed');
    await input('Ghi chú review','Actual Schedule review '+width);await button('Preview quyết định');await until(query('[data-decision-preview]'),'actual decision Preview');
    const readBeforeApply=officialReads();await button('Xác nhận quyết định',true);
    await until('document.querySelector("[data-change-detail] h4")?.textContent.includes("approved")','actual approve/apply');
    // Poll the CDP request log from Node rather than page state for official refresh.
    for(let n=0;n<100&&officialReads()===readBeforeApply;n++)await delay(30);
    assert.ok(officialReads()>readBeforeApply,'Only successful apply refreshes actual Calendar/List');
    const applied=await api('/api/schedule/change-requests/'+pendingRequest.requestId,reviewer);assert.ok(applied.appliedAt);assert.equal(applied.session.actual.status,'cancelled');
    assert.equal(applied.session.sessionId,id);assert.equal(applied.session.plannedOccurrenceDate,before.plannedOccurrenceDate);
    assert.ok(await evaluate('document.querySelector("[data-applied-at]").dataset.appliedAt.length>0'),'AppliedAt visible');
    assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth+2'),false,'Actual Schedule containment '+width);
    await evaluate('document.querySelector("[data-change-detail]").scrollIntoView({behavior:"instant",block:"start"})');
    const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(output,'workspace-'+width+'.png'),Buffer.from(shot.data,'base64'));
    workspaces.push({role:reviewer,width});
    await workspace(other,other);await openRequests('reviewer');await until(query('[data-change-request="'+pendingRequest.requestId+'"]'),'other reviewer sees applied history');await button('Xem yêu cầu #'+pendingRequest.requestId);await until(query('[data-applied-at]'),'other reviewer applied audit');workspaces.push({role:other,width});
    for(const role of ['teaching-assistant','student']){
      await workspace(role,role);assert.equal(await evaluate('Array.from(document.querySelectorAll("button")).some(b=>["Xử lý yêu cầu đổi lịch","Lịch sử yêu cầu đổi lịch"].includes(b.textContent.trim()))'),false,'read-only '+role);
      const card=await evaluate('document.querySelector(".et-schedule-session")?.dataset.sessionId');if(card){await evaluate('document.querySelector(".et-schedule-session").click()');await until(query('dialog[open]'),'read-only detail');await delay(100);assert.equal(await evaluate('Boolean(document.querySelector(".schedule-change-requests form"))'),false);}
      workspaces.push({role,width});
    }
    console.log('PASS actual Schedule workspaces '+width+': Teacher real Session submit/history, CM/AD review/applied audit, TA/Student read-only, official refresh only after apply');
  }
  // Availability/loading/empty/error/retry are UI fault-injection cases; HTTP 503
  // gates themselves are also tested against the real controller in the harness.
  await workspace('other-teacher','teacher');faults.capDelay=400;await button('Lịch sử yêu cầu đổi lịch');
  await until('document.querySelector("#et-schedule-change-requests")?.textContent.includes("Đang tải quyền")','capability loading');
  await until('document.querySelector("#et-schedule-change-requests")?.textContent.includes("Chưa có yêu cầu")','empty own history, no mock rows');
  await workspace('teacher','teacher');faults.capFailure=1;await button('Lịch sử yêu cầu đổi lịch');await until(query('#et-schedule-change-requests [role=alert]'),'unavailable capabilities');await button('Thử lại quyền đổi lịch');await until(query('#et-schedule-change-requests h3'),'capability retry');
  await workspace('admin-staff','admin-staff');faults.listFailure=1;await button('Xử lý yêu cầu đổi lịch');await until(query('#et-schedule-change-requests [role=alert]'),'list error');assert.equal(await evaluate('document.querySelectorAll("#et-schedule-change-requests [data-change-request]").length'),0);await button('Tải lại yêu cầu');await until(query('#et-schedule-change-requests [data-change-request]'),'list retry without fallback');
  // Actual stale decision: another legitimate Phase 2 template write invalidates
  // the old allocation token, while leaving this Session and request pending.
  const change={sessionId:9002,changeKind:'reschedule',proposedSessionDate:'2027-01-12',proposedStartTime:'08:00',proposedEndTime:'09:00',proposedRoom:'STALE',reason:'Workspace stale decision',clientRequestKey:crypto.randomUUID()};
  const p=await api('/api/schedule/change-requests/preview','teacher','POST',change);assert.ok(p.allowed);const stale=await api('/api/schedule/change-requests','teacher','POST',{...change,previewToken:p.previewToken});
  await api('/api/schedule/change-requests/'+stale.requestId+'/claim','admin-staff','POST',{});
  await workspace('admin-staff','admin-staff');await openRequests('reviewer');await until(query('[data-change-request="'+stale.requestId+'"]'),'stale fixture listed');await button('Xem yêu cầu #'+stale.requestId);await until(query('[data-change-detail]'),'stale detail');await input('Ghi chú review','Preview before allocation change');await button('Preview quyết định');await until(query('[data-decision-preview]'),'stale decision initial Preview');
  const original=await api('/api/schedule/sessions/9002');const template={classId:810,operation:'create',effectiveFrom:'2027-03-01',dayOfWeek:'Tuesday',startTime:'12:00',endTime:'13:00',room:'STALE ALLOCATION'};
  const tp=await api('/api/schedule/management/templates/preview','center-manager','POST',template);await api('/api/schedule/management/templates/confirm','center-manager','POST',{...template,previewToken:tp.previewToken});
  const reads=officialReads();await button('Xác nhận quyết định');await until(query('#et-schedule-change-requests [role=alert]'),'409 shown without false success');assert.equal(await evaluate('Boolean(document.querySelector("[data-decision-preview]"))'),false,'stale token cleared');assert.deepEqual(await api('/api/schedule/sessions/9002'),original);assert.equal(officialReads(),reads);assert.equal((await api('/api/schedule/change-requests/'+stale.requestId,'admin-staff')).status,'pending');
  await workspace('teacher','teacher');await openRequests('teacher');await until(query('#et-schedule-change-requests h3'),'Anonymous selected-user requests load without login');
  assert.deepEqual(failures,[]);fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({summary,workspaces,requests,failures,pageOwnerHooks:'unapplied',productionReady:false},null,2));console.log('BROWSER RESULTS: '+summary.length+' component groups + '+workspaces.length+' actual Schedule role/viewport groups; loading/empty/503/retry/409/401 cases; owner page hooks unapplied. ARTIFACTS: '+output);
}finally{if(socket?.readyState===1){await send('Browser.close',{},null).catch(()=>{});socket.close();}chrome?.kill();for(const p of pending.values())clearTimeout(p.timer);await new Promise(resolve=>server.close(resolve));}
