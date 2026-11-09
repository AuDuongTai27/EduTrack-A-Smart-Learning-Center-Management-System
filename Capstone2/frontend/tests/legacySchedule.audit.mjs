import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import Module, {createRequire} from 'node:module';

const root=process.cwd(), baseline=process.env.EDUTRACK_SCHEDULE_LEGACY_BASE;
assert.ok(baseline,'Explicit baseline frontend path required');
const requireLocal=createRequire(path.join(root,'package.json'));
const ts=requireLocal('typescript'), React=requireLocal('react');
const {renderToStaticMarkup}=requireLocal('react-dom/server');
const cache=new Map();
function load(frontend,relative) {
  const absolute=path.resolve(frontend,relative);
  if(cache.has(absolute))return cache.get(absolute).exports;
  const instance=new Module(absolute); cache.set(absolute,instance); instance.filename=absolute;
  instance.require=specifier=>{
    if(!specifier.startsWith('.'))return requireLocal(specifier);
    const target=path.resolve(path.dirname(absolute),specifier);
    const resolved=[target,target+'.tsx',target+'.ts',path.join(target,'index.ts')].find(file=>fs.existsSync(file)&&fs.statSync(file).isFile());
    assert.ok(resolved,'Known import '+specifier);
    return load(frontend,path.relative(frontend,resolved));
  };
  instance._compile(ts.transpileModule(fs.readFileSync(absolute,'utf8'),{fileName:absolute,compilerOptions:{
    module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,esModuleInterop:true,
  }}).outputText,absolute);
  return instance.exports;
}
const file='src/GUIs/components/student/schedule/ScheduleTimetableCard.tsx';
const Before=load(baseline,file).ScheduleTimetableCard, After=load(root,file).ScheduleTimetableCard;
const days=Array.from({length:7},(_,i)=>new Date(Date.UTC(2026,11,28+i,12)));
const props={days,todayIdx:0,weekOffset:0,todayDate:new Date('2026-12-28T05:00:00Z')};
const legacy={id:'legacy',className:'Legacy class',subject:'Legacy subject',startH:8,startM:0,endH:10,endM:0,
  teacher:'Legacy teacher',initials:'LT',avatarBg:'#2563EB',room:'Legacy room',day:0,status:'upcoming'};
for(const sessions of [undefined,[],[legacy],[{...legacy,status:'cancelled'}]]) {
  const input={...props,...(sessions===undefined?{}:{sessions})};
  assert.equal(renderToStaticMarkup(React.createElement(After,input)),renderToStaticMarkup(React.createElement(Before,input)));
}
const legend='src/GUIs/components/student/schedule/ScheduleLegendStrip.tsx';
assert.equal(renderToStaticMarkup(React.createElement(load(root,legend).ScheduleLegendStrip)),
  renderToStaticMarkup(React.createElement(load(baseline,legend).ScheduleLegendStrip)));
const official={sessionId:1,classId:1,className:'Actual class',subjectId:1,subjectName:'Actual subject',
  sessionDate:'2026-12-28',startTime:'18:00:00',endTime:'20:00:00',teachers:[],teachingAssistants:[],
  room:null,status:'scheduled',scheduleId:null,hasAttendance:false};
const html=renderToStaticMarkup(React.createElement(After,{official:{sessions:[
  official,{...official,sessionId:2,status:'completed'},{...official,sessionId:3,status:'cancelled'},
  {...official,sessionId:4,status:'unknown'},{...official,sessionId:5,sessionDate:'2027-01-04'}],
  monday:'2026-12-28',now:new Date('2026-12-28T12:00:00Z'),onOpen:()=>{}}}));
for(const visual of ['ongoing','completed','cancelled','unknown'])assert.ok(html.includes('session-card-'+visual));
assert.ok(!html.includes('data-session-id="5"'));
assert.ok(!html.includes('Lớp Toán A1'));
console.log('PASS: 4 legacy timetable cases and default legend match baseline HTML exactly; official date/status rendering verified.');
