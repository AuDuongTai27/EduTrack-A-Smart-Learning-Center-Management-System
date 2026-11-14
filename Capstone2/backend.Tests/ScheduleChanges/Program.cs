using System.Diagnostics;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using EduTrack.API.Controllers.Schedule;
using EduTrack.API.Models.DTOs.Schedule;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Implementation;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Interfaces;
using EduTrack.API.Services.Implementation;
using EduTrack.API.Services.Management.Interfaces;
using EduTrack.API.Services.Management.Implementation;
using EduTrack.API.Services.Learning.Implementation;
using EduTrack.API.Services.Schedule;
using EduTrack.API.Services.Teaching.Implementation;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.Extensions.FileProviders;
using MySqlConnector;
using static EduTrack.API.Services.Schedule.ScheduleManagementPolicy;

var checks=0;var ct=CancellationToken.None;var clock=new FixtureClock();
void Check(bool ok,string label){if(!ok)throw new Exception("FAIL "+label);checks++;Console.WriteLine("PASS "+label);}
int SelectedUser(int id) => id;
var sample=new ClassSession{SessionId=1,ClassId=1,ScheduleId=1,ScheduleVersionId=1,PlannedOccurrenceDate=new(2027,1,4),SessionDate=new(2027,1,5),StartTime=Time("18:00"),EndTime=Time("20:00"),Status="cancelled"};
var fingerprint=ScheduleChangeRequestService.SessionFingerprint(sample);sample.SessionDate=new(2027,2,5);
Check(fingerprint!=ScheduleChangeRequestService.SessionFingerprint(sample),"Stale fingerprint detects actual move while planned identity stays separate");
sample.SessionDate=new(2027,1,5);sample.StartTime+=TimeSpan.FromTicks(1234560);
Check(fingerprint!=ScheduleChangeRequestService.SessionFingerprint(sample),"Fingerprint preserves TIME(6) precision");
Check(!new ScheduleChangeIntegration().GenericRoutesGuarded&&!new ScheduleChangeIntegration().AttendanceWritesCoordinated,"Production integration gates default OFF");
if(!args.Contains("--mysql")){Console.WriteLine($"{checks} Phase 3 offline checks; no database or host accessed.");return;}

var cs=new MySqlConnectionStringBuilder{Server="127.0.0.1",Port=33308,UserID="root",Password="",Pooling=false,SslMode=MySqlSslMode.Disabled};
await using(var probe=new MySqlConnection(cs.ConnectionString))
{
    await probe.OpenAsync();await using var command=new MySqlCommand("SELECT @@port,@@datadir",probe);await using var reader=await command.ExecuteReaderAsync();await reader.ReadAsync();
    if(reader.GetInt32(0)!=33308||!reader.GetString(1).Replace('\\','/').Contains("/edutrack-enrollment-mysql-"))throw new Exception("Verified isolated MySQL required before writes");
}
cs.Database="edutrack_change_test_"+Guid.NewGuid().ToString("N");
var options=new DbContextOptionsBuilder<EduTrackDbContext>().UseMySql(cs.ConnectionString,new MySqlServerVersion(new Version(8,0,44))).Options;
EduTrackDbContext Db()=>new(options);
async Task<T> Use<T>(Func<ScheduleChangeRequestService,Task<T>> action,ScheduleChangeIntegration? flags=null){await using var db=Db();return await action(new(db,flags??new(true,true),clock));}
async Task Sql(string sql){await using var c=new MySqlConnection(cs.ConnectionString);await c.OpenAsync();await using var cmd=new MySqlCommand(sql,c);await cmd.ExecuteNonQueryAsync();}
async Task<string> Snapshot(){await using var db=Db();return Hash(new {Sessions=await db.ClassSessions.AsNoTracking().OrderBy(s=>s.SessionId).Select(s=>new{s.SessionId,s.ClassId,s.ScheduleId,s.ScheduleVersionId,s.PlannedOccurrenceDate,s.OccurrenceWeekStart,s.SessionDate,s.StartTime,s.EndTime,s.Room,s.Status}).ToListAsync(),Attendance=await db.Attendances.AsNoTracking().OrderBy(a=>a.AttendanceId).Select(a=>new{a.AttendanceId,a.SessionId,a.StudentId,a.Status,a.Note,a.RecordedBy,a.RecordedAt}).ToListAsync()});}
async Task<string> AttendanceEvidence(){await using var db=Db();return Hash(await db.Attendances.AsNoTracking().Where(a=>a.SessionId==9005).Select(a=>new{a.AttendanceId,a.SessionId,a.StudentId,a.Status,a.Note,a.RecordedBy,a.RecordedAt}).ToListAsync());}
async Task Denied(Func<Task> action,int status,string label){try{await action();throw new Exception("Expected denial "+label);}catch(ScheduleAccessException e){Check(e.StatusCode==status,label);}}
async Task InvalidSql(string sql,int code,string label){try{await Sql(sql);throw new Exception("Expected SQL rejection");}catch(MySqlException e){Check(e.Number==code,label);}}
ScheduleChangeInput Input(int id,string kind="reschedule",string date="2027-01-05",string start="10:00",string end="11:00",string? room="MOVE")=>new(){SessionId=id,ChangeKind=kind,ProposedSessionDate=kind=="cancel"?null:date,ProposedStartTime=kind=="cancel"?null:start,ProposedEndTime=kind=="cancel"?null:end,ProposedRoom=kind=="cancel"?null:room,Reason="Synthetic reviewed change",ClientRequestKey=Guid.NewGuid().ToString("D")};
async Task<ScheduleChangeDto> Submit(ScheduleChangeInput input){var p=await Use(s=>s.Preview(SelectedUser(501),input,ct));Check(p.Allowed,"Teacher Preview eligible Session "+input.SessionId);input.PreviewToken=p.PreviewToken;return await Use(s=>s.Submit(SelectedUser(501),input,ct));}
async Task<(ScheduleChangeDecisionInput Input,ScheduleChangePreview Preview)> Review(int id,string decision="approved",int actor=506){await Use(s=>s.Claim(SelectedUser(actor),id,ct));var input=new ScheduleChangeDecisionInput{Decision=decision,ReviewNotes=decision=="rejected"?"Rejected synthetic proposal":"Reviewed synthetic proposal"};var p=await Use(s=>s.DecisionPreview(SelectedUser(actor),id,input,ct));input.PreviewToken=p.PreviewToken;return(input,p);}
async Task NewSession(int id,DateTime planned,string status="scheduled") {await using var db=Db();db.ClassSessions.Add(new(){SessionId=id,ClassId=801,ScheduleId=201,ScheduleVersionId=301,PlannedOccurrenceDate=DateOnly.FromDateTime(planned),SessionDate=planned,StartTime=Time("18:00"),EndTime=Time("20:00"),Room="A",Status=status});await db.SaveChangesAsync();}
WebApplication? app=null;
try
{
    const string phase2="20261109005859_ScheduleVersionContract";
    await using(var db=Db())
    {
        await db.GetService<IMigrator>().MigrateAsync(phase2);
        db.Roles.AddRange(new Role{RoleId=101,RoleName="teacher"},new Role{RoleId=102,RoleName="teaching_assistant"},new Role{RoleId=103,RoleName="student"},new Role{RoleId=104,RoleName="center_manager"},new Role{RoleId=105,RoleName="admin_staff"},new Role{RoleId=106,RoleName="parent"});
        foreach(var(id,role) in new[]{(501,101),(502,101),(503,102),(504,103),(505,104),(506,105),(507,101),(508,106),(509,101)})db.Users.Add(new(){UserId=id,UserCode="CHANGE-QA-"+id,FullName="Synthetic "+id,PasswordHash="isolated-only",Status=id==507?"inactive":"active",UserRoles=[new(){RoleId=role}]});
        db.Subjects.Add(new(){SubjectId=701,SubjectName="Synthetic Math",SubjectCode="CHANGE_QA"});
        for(var id=801;id<=810;id++)db.Classes.Add(new(){ClassId=id,ClassName="CHANGE Class "+id,SubjectId=701,TuitionFee=800000,StartDate=new(2026,1,1),EndDate=new(2029,12,31),Status="active"});
        await db.SaveChangesAsync();
        foreach(var(c,t) in new[]{(801,501),(802,502),(803,501),(804,502),(805,502),(810,501)})db.TeacherClasses.Add(new(){ClassId=c,TeacherId=t,Status="active"});
        db.TaClasses.AddRange(new(){ClassId=801,TaId=503,Status="active"},new(){ClassId=804,TaId=503,Status="active"});
        db.StudentClasses.Add(new(){ClassId=801,StudentId=504,Status="active",EnrolledDate=new(2026,1,1)});
        foreach(var(id,c,day,start,end,room) in new[]{(201,801,"Monday","18:00","20:00","A"),(202,802,"Tuesday","18:00","20:00","B"),(203,803,"Thursday","10:00","12:00","C"),(204,804,"Friday","14:00","16:00","D"),(205,805,"Saturday","16:00","18:00","A")})
            db.ClassSchedules.Add(new(){ScheduleId=id,ClassId=c,DayOfWeek=day,StartTime=Time(start),EndTime=Time(end),Room=room,Versions=[new(){ScheduleVersionId=id+100,EffectiveFrom=new(2026,1,5),DayOfWeek=day,StartTime=Time(start),EndTime=Time(end),Room=room}]});
        db.ApprovalRequests.Add(new(){RequestId=7000,RequestCode="LEGACY-TEXT",RequestType="schedule_change",ClassId=801,RequestedBy=501,Description="Legacy text is not a typed command",Reason="Historical",Status="pending"});
        await db.SaveChangesAsync();
    }
    for(var i=0;i<15;i++)await NewSession(9001+i,new DateTime(2027,1,4).AddDays(i*7),i==2?"cancelled":i==3?"completed":"scheduled");
    await Sql("UPDATE class_sessions SET start_time='18:00:00.123456',end_time='20:00:00.654321' WHERE session_id=9001");
    await Sql("INSERT INTO attendance(session_id,student_id,recorded_by,recorded_at,status,note) VALUES(9005,504,501,'2026-11-09','present','Preserve original Attendance')");
    var beforeMigration=await Snapshot();
    var originalAttendance=await AttendanceEvidence();
    await using(var db=Db()){await db.Database.MigrateAsync();Check(!db.Database.HasPendingModelChanges(),"Phase 3 migration matches current EF model/snapshot");Check(await db.ScheduleChangeRequestDetails.CountAsync()==0,"Migration never infers typed detail from legacy text");}
    Check(beforeMigration==await Snapshot(),"Migration on populated Phase 2 preserves every Session/Attendance field");
    await using(var db=Db()){await db.GetService<IMigrator>().MigrateAsync(phase2);await db.Database.MigrateAsync();}
    Check(beforeMigration==await Snapshot(),"Empty-detail downgrade/reapply preserves Phase 2 records");
    await Denied(async()=>await Use(s=>s.Capabilities(0,ct)),400,"Missing user selector is rejected");
    foreach(var id in new[]{503,504,507,508})await Denied(async()=>await Use(s=>s.Capabilities(SelectedUser(id),ct)),400,"Role/inactive denied "+id);
    await Denied(async()=>await Use(s=>s.Preview(SelectedUser(509),Input(9001),ct)),404,"Unassigned Teacher cannot inspect another Class Session");
    await Denied(async()=>await Use(s=>s.Submit(SelectedUser(506),Input(9001),ct)),400,"Manager cannot submit as a Teacher");
    var disabled=await Use(s=>s.Capabilities(SelectedUser(501),ct),new());Check(!disabled.CanSubmit&&disabled.CanPreview,"Default production gate allows safe Preview only");
    await Denied(async()=>await Use(s=>s.Submit(SelectedUser(501),Input(9001),ct),new()),503,"Default production submit blocked while owner guards pending");
    foreach(var id in new[]{9004,9005})Check(!(await Use(s=>s.Preview(SelectedUser(501),Input(id),ct))).Allowed,"Completed/Attendance Preview blocked "+id);
    foreach(var(date,start,end,room,label)in new[]{("2027-01-11","18:30","19:30","A","Class"),("2027-01-07","10:30","11:30","Z","Teacher"),("2027-01-08","14:30","15:30","Z","TA"),("2027-01-09","16:30","17:30"," a ","Room")})
        Check(!(await Use(s=>s.Preview(SelectedUser(501),Input(9001,date:date,start:start,end:end,room:room),ct))).Allowed,label+" conflict blocks Preview");
    Check((await Use(s=>s.Preview(SelectedUser(501),Input(9001,date:"2027-01-05",start:"20:00",end:"21:00",room:"B"),ct))).Allowed,"Adjacent resource slots allowed");
    Check(!(await Use(s=>s.Preview(SelectedUser(501),Input(9001,date:"2030-01-01"),ct))).Allowed,"Destination outside Class dates blocked");
    var original=await Snapshot();var change=Input(9001);var request=await Submit(change);
    Check(await Snapshot()==original,"Pending submit changes no official Session/Attendance");
    Check(request.Original.StartTime=="18:00:00.1234560"&&request.Original.EndTime=="20:00:00.6543210","Original typed snapshot round-trips stored TIME(6) exactly");
    var replay=await Use(s=>s.Submit(SelectedUser(501),change,ct));Check(replay.RequestId==request.RequestId,"ClientRequestKey retry returns same header/detail");
    change.Reason="Different payload";await Denied(async()=>await Use(s=>s.Submit(SelectedUser(501),change,ct)),409,"Key reuse for different payload rejected");change.Reason="Synthetic reviewed change";
    await Denied(async()=>await Use(s=>s.Submit(SelectedUser(502),change,ct)),404,"Client key ownership does not leak another Teacher request");
    await Denied(async()=>await Use(s=>s.Get(SelectedUser(502),request.RequestId,ct)),404,"Request detail IDOR denied");
    await Denied(async()=>await Use(s=>s.Claim(SelectedUser(501),request.RequestId,ct)),400,"Teacher requester cannot claim own request");
    await Denied(async()=>await Use(s=>s.Get(SelectedUser(501),7000,ct)),404,"Legacy text-only request cannot become typed apply command");
    Check((await Use(s=>s.List(SelectedUser(502),ct))).Count==0,"Teacher lists only own requests");
    await Denied(async()=>await Use(s=>s.DecisionPreview(SelectedUser(506),request.RequestId,new(){Decision="approved"},ct)),409,"Decision requires explicit claim");
    var decision=await Review(request.RequestId);Check(decision.Preview.Allowed,"Claimed request decision eligible");
    await using(var db=Db())
    {
        var management=new ScheduleManagementService(db,clock);var root=await db.ClassSchedules.AsNoTracking().Include(r=>r.Versions).SingleAsync(r=>r.ScheduleId==201);
        var version=new ScheduleTemplateInput{ClassId=801,ScheduleId=201,Operation="replace",EffectiveFrom="2028-01-03",DayOfWeek="Wednesday",StartTime="19:00",EndTime="21:00",Room="FUTURE",Version=Version(root)};
        version.PreviewToken=(await management.PreviewTemplate(SelectedUser(505),version,ct)).PreviewToken;await management.ConfirmTemplate(SelectedUser(505),version,ct);
    }
    Check(await Snapshot()==original,"Phase 2 future version change leaves pending request and official Sessions untouched");
    await Denied(async()=>await Use(s=>s.Decide(SelectedUser(506),request.RequestId,decision.Input,ct)),409,"Timeline change invalidates old decision Preview");
    decision=await Review(request.RequestId);Check(decision.Preview.Allowed,"Fresh decision after timeline change still uses unchanged actual/source snapshot");
    await Denied(async()=>await Use(s=>s.Claim(SelectedUser(505),request.RequestId,ct)),409,"Second reviewer cannot steal claim");
    await Denied(async()=>await Use(s=>s.Decide(SelectedUser(506),request.RequestId,decision.Input,ct),new(true,false)),503,"Attendance integration gate blocks apply");
    var result=await Use(s=>s.Decide(SelectedUser(506),request.RequestId,decision.Input,ct));
    Check(result.Status=="approved"&&result.AppliedAt.HasValue&&result.Session.SessionId==9001&&result.Session.Actual.SessionDate=="2027-01-05","Approve applies same Session atomically with marker");
    Check(result.Session.ScheduleId==201&&result.Session.ScheduleVersionId==301&&result.Session.PlannedOccurrenceDate=="2027-01-04"&&result.Session.OccurrenceWeekStart=="2027-01-04","Reschedule preserves all planned/source identity");
    var afterApply=await Snapshot();var appliedRetry=await Use(s=>s.Decide(SelectedUser(505),request.RequestId,decision.Input,ct));Check(appliedRetry.AppliedAt==result.AppliedAt&&await Snapshot()==afterApply,"Lost-response retry by another authorized reviewer never reapplies");
    var rejected=await Submit(Input(9002,date:"2027-01-06",start:"08:00",end:"09:00"));var rejectedReview=await Review(rejected.RequestId,"rejected");var beforeReject=await Snapshot();
    var rejectedResult=await Use(s=>s.Decide(SelectedUser(506),rejected.RequestId,rejectedReview.Input,ct));Check(rejectedResult.Status=="rejected"&&!rejectedResult.AppliedAt.HasValue&&beforeReject==await Snapshot(),"Reject only changes request; official records unchanged");
    await Use(s=>s.Decide(SelectedUser(506),rejected.RequestId,rejectedReview.Input,ct));Check(beforeReject==await Snapshot(),"Rejected retry idempotent");
    var cancel=await Submit(Input(9006,"cancel"));var cancelDecision=await Review(cancel.RequestId);var cancelled=await Use(s=>s.Decide(SelectedUser(506),cancel.RequestId,cancelDecision.Input,ct));
    Check(cancelled.Session.Actual.Status=="cancelled"&&cancelled.Session.SessionId==9006,"Cancel retains same occurrence record");
    var makeup=await Submit(Input(9006,"makeup",date:"2027-03-02",start:"08:00",end:"09:00"));var makeupReview=await Review(makeup.RequestId);var madeUp=await Use(s=>s.Decide(SelectedUser(506),makeup.RequestId,makeupReview.Input,ct));
    Check(madeUp.Session.Actual.Status=="scheduled"&&madeUp.Session.SessionId==9006&&madeUp.Session.PlannedOccurrenceDate=="2027-02-08","Makeup restores cancelled Session, not a new occurrence");
    var stale=await Submit(Input(9007,date:"2027-04-01",start:"08:00",end:"09:00"));var staleReview=await Review(stale.RequestId);
    await Sql("UPDATE class_sessions SET room='Changed synthetic actual' WHERE session_id=9007");
    await Denied(async()=>await Use(s=>s.Decide(SelectedUser(506),stale.RequestId,staleReview.Input,ct)),409,"Stale actual snapshot cannot approve");
    Check(!(await Use(s=>s.DecisionPreview(SelectedUser(506),stale.RequestId,staleReview.Input,ct))).Allowed,"Fresh Preview explains stale original snapshot");
    var revoke=await Submit(Input(9008,date:"2027-04-02",start:"08:00",end:"09:00"));var revokeReview=await Review(revoke.RequestId);
    await Sql("UPDATE teacher_classes SET status='inactive' WHERE class_id=801 AND teacher_id=501");
    await Denied(async()=>await Use(s=>s.Decide(SelectedUser(506),revoke.RequestId,revokeReview.Input,ct)),409,"Revoked requester assignment blocks approval");
    await Sql("UPDATE teacher_classes SET status='active' WHERE class_id=801 AND teacher_id=501");
    var attend=await Submit(Input(9009,date:"2027-04-03",start:"08:00",end:"09:00"));var attendReview=await Review(attend.RequestId);
    await Sql("INSERT INTO attendance(session_id,student_id,recorded_by,recorded_at,status) VALUES(9009,504,501,'2026-11-09','present')");
    await Denied(async()=>await Use(s=>s.Decide(SelectedUser(506),attend.RequestId,attendReview.Input,ct)),409,"Attendance inserted before approval blocks apply; concurrent writer protocol still owner-dependent");
    var rollback=await Submit(Input(9010,date:"2027-04-04",start:"08:00",end:"09:00"));var rollbackReview=await Review(rollback.RequestId);var beforeRollback=await Snapshot();
    try{await using var db=new EduTrackDbContext(new DbContextOptionsBuilder<EduTrackDbContext>(options).AddInterceptors(new FailAfterApply()).Options);await new ScheduleChangeRequestService(db,new(true,true),clock).Decide(SelectedUser(506),rollback.RequestId,rollbackReview.Input,ct);throw new Exception("Expected injected rollback");}catch(InvalidOperationException e) when(e.Message=="Injected after SQL before COMMIT"){Check(true,"Injected failure after actual/header/marker SQL");}
    var rolled=await Use(s=>s.Get(SelectedUser(506),rollback.RequestId,ct));Check(beforeRollback==await Snapshot()&&rolled.Status=="pending"&&!rolled.AppliedAt.HasValue,"Rollback preserves Session and clears both approved/applied state");
    await Use(s=>s.Decide(SelectedUser(506),rollback.RequestId,rollbackReview.Input,ct));Check(true,"Retry after rollback recovers released named lock");
    var race=await Submit(Input(9011,date:"2027-04-05",start:"08:00",end:"09:00"));var raceReview=await Review(race.RequestId);
    var raceResults=await Task.WhenAll(Enumerable.Range(0,5).Select(_=>Use(s=>s.Decide(SelectedUser(506),race.RequestId,raceReview.Input,ct))));Check(raceResults.Select(x=>x.AppliedAt).Distinct().Count()==1&&raceResults.All(x=>x.Session.SessionId==9011),"Five concurrent confirms return same single applied result");
    var a=await Submit(Input(9012,date:"2027-04-06",start:"08:00",end:"09:00"));var b=await Submit(Input(9013,date:"2027-04-06",start:"08:00",end:"09:00"));var ar=await Review(a.RequestId);var br=await Review(b.RequestId);
    async Task<bool> TryDecision(int id,ScheduleChangeDecisionInput input){try{await Use(s=>s.Decide(SelectedUser(506),id,input,ct));return true;}catch(ScheduleAccessException e) when(e.StatusCode==409){return false;}}
    var destinationRace=await Task.WhenAll(TryDecision(a.RequestId,ar.Input),TryDecision(b.RequestId,br.Input));Check(destinationRace.Count(x=>x)==1,"Concurrent conflicting destinations cannot both commit");
    var self=await Submit(Input(9014,date:"2027-04-07",start:"08:00",end:"09:00"));await Sql("INSERT INTO user_roles(user_id,role_id) VALUES(501,104)");
    await Denied(async()=>await Use(s=>s.Claim(SelectedUser(501),self.RequestId,ct)),400,"Multi-role requester cannot self-review");await Sql("DELETE FROM user_roles WHERE user_id=501 AND role_id=104");
    await InvalidSql($"UPDATE schedule_change_request_details SET client_request_key='{change.ClientRequestKey}' WHERE request_id={self.RequestId}",1062,"DB ClientRequestKey unique rejects duplicate submission key");
    await InvalidSql($"UPDATE schedule_change_request_details SET change_kind='arbitrary' WHERE request_id={self.RequestId}",3819,"DB rejects unknown typed kind");
    await InvalidSql($"DELETE FROM class_sessions WHERE session_id=9001",1451,"FK RESTRICT preserves Session with typed audit detail");
    var staleSubmit=Input(9015,date:"2028-01-05",start:"08:00",end:"09:00");staleSubmit.PreviewToken=(await Use(s=>s.Preview(SelectedUser(501),staleSubmit,ct))).PreviewToken;
    await Sql("UPDATE classes SET start_date='2026-01-02' WHERE class_id=801");
    await Denied(async()=>await Use(s=>s.Submit(SelectedUser(501),staleSubmit,ct)),409,"Class validity change invalidates Teacher submit Preview");
    await Sql("UPDATE classes SET start_date='2026-01-01' WHERE class_id=801");
    try{await Use(s=>s.Preview(SelectedUser(501),Input(9015,start:"08:00:00.1234567"),ct));throw new Exception("Expected precision validation");}
    catch(ArgumentException){Check(true,"Reject sub-microsecond proposal instead of silently rounding TIME(6)");}
    var crossYear=await Submit(Input(9015,date:"2028-01-05",start:"08:00:00.1234560",end:"09:00:00.6543210"));var crossReview=await Review(crossYear.RequestId);var crossResult=await Use(s=>s.Decide(SelectedUser(506),crossYear.RequestId,crossReview.Input,ct));
    Check(crossResult.Session.Actual.SessionDate=="2028-01-05"&&crossResult.Session.PlannedOccurrenceDate=="2027-04-12"&&crossResult.Session.ScheduleVersionId==301,"Cross-year move preserves original source even with a new template version");
    Check(crossResult.Session.Actual.StartTime=="08:00:00.1234560"&&crossResult.Session.Actual.EndTime=="09:00:00.6543210","Proposed TIME(6) is not rounded when date/room alone changes");
    var claimRace=await Submit(Input(9015,date:"2028-01-06",start:"08:00",end:"09:00"));
    async Task<int?> TryClaim(int actor){try{await Use(s=>s.Claim(SelectedUser(actor),claimRace.RequestId,ct));return actor;}catch(ScheduleAccessException e)when(e.StatusCode==409){return null;}}
    var claims=await Task.WhenAll(TryClaim(505),TryClaim(506));Check(claims.Count(x=>x.HasValue)==1,"Two different reviewers claim concurrently; exactly one wins");
    var winner=claims.Single(x=>x.HasValue)!.Value;var winnerReview=await Review(claimRace.RequestId,actor:winner);await Use(s=>s.Decide(SelectedUser(winner),claimRace.RequestId,winnerReview.Input,ct));
    try{await using var db=Db();await db.GetService<IMigrator>().MigrateAsync(phase2);throw new Exception("Expected audit downgrade guard");}catch(MySqlException e){Check(e.Number==3819,"Downgrade refuses erasing typed request/apply history");}
    await using(var db=Db())
    {
        var source=new ScheduleManagementService(db,clock);var generated=await source.Preview(SelectedUser(501),new(){ClassId=801,Mode="single",ScheduleId=201,SessionDate="2027-01-04"},ct);
        Check(generated.Rows.Single().Outcome=="existing"&&generated.Rows.Single().SessionId==9001,"Generate moved occurrence returns original SessionId");
        var cancelledPreview=await source.Preview(SelectedUser(501),new(){ClassId=801,Mode="single",ScheduleId=201,SessionDate="2027-01-18"},ct);Check(cancelledPreview.Rows.Single().Outcome=="existing"&&cancelledPreview.Rows.Single().SessionId==9003,"Generate cancelled occurrence cannot recreate Session");
        Check(await db.Attendances.AnyAsync(x=>x.SessionId==9005&&x.Note=="Preserve original Attendance"),"Existing Attendance row and SessionId retained");
        Check(!await db.TuitionInvoices.AnyAsync()&&!await db.Payments.AnyAsync()&&await db.StudentClasses.CountAsync()==1,"No Tuition/enrollment side effects");
    }
    Check(originalAttendance==await AttendanceEvidence(),"Full original Attendance fingerprint unchanged after all Schedule requests");
    // Owner explicitly asked to keep the proposed six-file patch unapplied. Reproduce
    // the actual unguarded generic route, then restore ONLY this synthetic fixture.
    await using(var db=Db())
    {
        var generic=new ApprovalRequestRepository(db);var bypass=await generic.TryReviewPendingAsync(self.RequestId,"approved",506,"Legacy bypass reproduction",DateTime.UtcNow);
        Check(bypass,"REPRODUCED BLOCKER: current generic repository can bypass typed Schedule apply; production gate remains OFF");
    }
    await Denied(async()=>await Use(s=>s.Get(SelectedUser(506),self.RequestId,ct)),409,"Schedule read refuses inconsistent Approved without AppliedAt after generic bypass");
    await Sql($"UPDATE approval_requests SET status='pending',reviewed_by=NULL,reviewed_at=NULL,review_notes=NULL WHERE request_id={self.RequestId}");
    Check(!(await Use(s=>s.Capabilities(SelectedUser(506),ct),new())).CanReview,"Actual unguarded generic integration is not exposed as production-ready");
    // Dedicated untouched UI fixtures, distinct weekly ca and actual bookings.
    await using(var db=Db())
    {
        for(var i=0;i<4;i++){var root=220+i;db.ClassSchedules.Add(new(){ScheduleId=root,ClassId=810,DayOfWeek="Monday",StartTime=TimeSpan.FromHours(6+i*2),EndTime=TimeSpan.FromHours(7+i*2),Room="UI"+i,
            Versions=[new(){ScheduleVersionId=root+100,EffectiveFrom=new(2027,1,4),DayOfWeek="Monday",StartTime=TimeSpan.FromHours(6+i*2),EndTime=TimeSpan.FromHours(7+i*2),Room="UI"+i}]});
            db.ClassSessions.Add(new(){SessionId=9901+i,ClassId=810,ScheduleId=root,ScheduleVersionId=root+100,PlannedOccurrenceDate=new(2027,1,4),SessionDate=new(2027,1,4),StartTime=TimeSpan.FromHours(6+i*2)+(i==0?TimeSpan.FromTicks(1234560):TimeSpan.Zero),EndTime=TimeSpan.FromHours(7+i*2)+(i==0?TimeSpan.FromTicks(6543210):TimeSpan.Zero),Room="UI"+i,Status="scheduled"});}
        await db.SaveChangesAsync();
    }
    if(args.Contains("--http"))
    {
        var hostRoot=Path.Combine(Path.GetTempPath(),"edutrack-change-host-"+Guid.NewGuid().ToString("N"));Directory.CreateDirectory(hostRoot);
        var builder=WebApplication.CreateBuilder(new WebApplicationOptions{EnvironmentName="IsolatedPhase3",ContentRootPath=hostRoot});
        builder.Logging.ClearProviders();builder.WebHost.UseUrls("http://127.0.0.1:0");builder.Services.AddDbContext<EduTrackDbContext, EduTrackRuntimeDbContext>(o=>o.UseMySql(cs.ConnectionString,new MySqlServerVersion(new Version(8,0,44))));builder.Services.AddSingleton<TimeProvider>(clock);
        // Verify actual HTTP fail-closed behavior before the controlled lab opts in.
        builder.Configuration["ScheduleChangeRequests:GenericRoutesGuarded"]="false";builder.Configuration["ScheduleChangeRequests:AttendanceWritesCoordinated"]="false";
        // Register the unchanged generic controller/service only to reproduce its bypass
        // against this random schema. No production Program, Auth, Attendance or Seeder.
        builder.Services.AddScoped<IApprovalRequestRepository,ApprovalRequestRepository>();
        builder.Services.AddScoped<IUserRepository,UserRepository>();builder.Services.AddScoped<IClassRepository,ClassRepository>();
        builder.Services.AddScoped<ITuitionInvoiceRepository,TuitionInvoiceRepository>();builder.Services.AddScoped<IApprovalRequestService,ApprovalRequestService>();
        builder.Services.AddScoped<IManagementApprovalRequestService,ManagementApprovalRequestService>();
        builder.Services.AddControllers().AddApplicationPart(typeof(ScheduleChangeRequestsController).Assembly).ConfigureApplicationPartManager(m=>m.FeatureProviders.Add(new OnlyScheduleControllers()));
        app=builder.Build();var nonce=Guid.NewGuid().ToString("N");var actors=new Dictionary<string,int>{{"teacher",501},{"other-teacher",502},{"teaching-assistant",503},{"student",504},{"center-manager",505},{"admin-staff",506}};
        app.MapControllers();var frontend=Environment.GetEnvironmentVariable("EDUTRACK_TEST_FRONTEND_ROOT");if(!string.IsNullOrEmpty(frontend)){var dist=Path.GetFullPath(Path.Combine(frontend,"dist"));app.UseStaticFiles(new StaticFileOptions{FileProvider=new PhysicalFileProvider(dist)});app.MapFallback(async http=>{if(http.Request.Path.StartsWithSegments("/api")){http.Response.StatusCode=404;return;}http.Response.ContentType="text/html";await http.Response.SendFileAsync(Path.Combine(dist,"index.html"));}).WithMetadata(new Microsoft.AspNetCore.Routing.HttpMethodMetadata(["GET"]));}
        await app.StartAsync();var origin=app.Urls.Single();using var client=new HttpClient{BaseAddress=new Uri(origin)};
        async Task<HttpResponseMessage> Send(HttpMethod method,string path,object? body=null,string actor="admin-staff")
        {using var req=new HttpRequestMessage(method,path+(path.Contains('?')?"&":"?")+"userId="+actors[actor]);if(body!=null)req.Content=JsonContent.Create(body);return await client.SendAsync(req);}
        Check((await client.GetAsync("/api/schedule/change-requests")).StatusCode==HttpStatusCode.BadRequest,"HTTP anonymous typed reads denied");
        foreach(var role in new[]{"student","teaching-assistant"}){using var r=new HttpRequestMessage(HttpMethod.Post,"/api/schedule/change-requests/preview?userId=504"){Content=JsonContent.Create(Input(9901))};Check((await client.SendAsync(r)).StatusCode==HttpStatusCode.BadRequest,"HTTP forbidden actor "+role);}
        using(var r=new HttpRequestMessage(HttpMethod.Post,"/api/schedule/change-requests/preview"){Content=JsonContent.Create(new{sessionId=9901,changeKind="cancel",reason="Forged actor",clientRequestKey=Guid.NewGuid(),requestedBy=501})}){Check((await client.SendAsync(r)).StatusCode==HttpStatusCode.BadRequest,"HTTP rejects client-provided actor property");}
        var disabledSnapshot=await Snapshot();
        var httpCaps=await (await Send(HttpMethod.Get,"/api/schedule/change-requests/capabilities")).Content.ReadFromJsonAsync<ScheduleChangeCapabilities>();
        Check(httpCaps is {CurrentUserId:506,CanViewAll:true,CanReview:false,CanApply:false},"HTTP capabilities use server identity and keep both integration gates false");
        Check((await Send(HttpMethod.Post,"/api/schedule/change-requests",Input(9901),"teacher")).StatusCode==HttpStatusCode.ServiceUnavailable,"HTTP 503 submit when generic routes are unguarded");
        Check((await Send(HttpMethod.Post,$"/api/schedule/change-requests/{self.RequestId}/claim")).StatusCode==HttpStatusCode.ServiceUnavailable,"HTTP 503 claim while owner integration is disabled");
        Check((await Send(HttpMethod.Post,$"/api/schedule/change-requests/{self.RequestId}/decision",new{decision="approved",reviewNotes="Blocked"})).StatusCode==HttpStatusCode.ServiceUnavailable,"HTTP 503 approve before integration");
        Check((await Send(HttpMethod.Post,$"/api/schedule/change-requests/{self.RequestId}/claim",actor:"teacher")).StatusCode==HttpStatusCode.BadRequest,"HTTP Teacher claim stays 403 even with disabled feature flags");
        Check(disabledSnapshot==await Snapshot(),"Disabled HTTP writes preserve every official Session/Attendance field");
        // Negative security test: the actual unchanged generic HTTP route can still
        // approve a typed header without applying the Session. This is NOT a fix.
        var genericBefore=await Snapshot();
        Check((await Send(HttpMethod.Put,$"/api/approvalrequests/{self.RequestId}/review",new{reviewedBy=506,status="pending",reviewNotes="Negative fixture claim"})).IsSuccessStatusCode,"NEGATIVE: actual generic HTTP route accepts typed claim");
        Check((await Send(HttpMethod.Put,$"/api/approvalrequests/{self.RequestId}/review",new{reviewedBy=506,status="approved",reviewNotes="Negative fixture bypass"})).IsSuccessStatusCode,"REPRODUCED BLOCKER: generic HTTP can approve typed header outside Schedule apply");
        await using(var db=Db())Check((await db.ApprovalRequests.AsNoTracking().SingleAsync(r=>r.RequestId==self.RequestId)).Status=="approved"&&!(await db.ScheduleChangeRequestDetails.AsNoTracking().SingleAsync(d=>d.RequestId==self.RequestId)).AppliedAt.HasValue&&genericBefore==await Snapshot(),"Negative HTTP proof: approved header, NULL AppliedAt, unchanged Session");
        Check((await Send(HttpMethod.Get,$"/api/schedule/change-requests/{self.RequestId}")).StatusCode==HttpStatusCode.Conflict,"Schedule HTTP returns 409 for generic inconsistent approval");
        await Sql($"UPDATE approval_requests SET status='pending',reviewed_by=NULL,reviewed_at=NULL,review_notes=NULL WHERE request_id={self.RequestId}");
        // Only this controlled test host opts in; neither appsettings nor actual
        // generic/Attendance integration is changed or claimed complete.
        app.Configuration["ScheduleChangeRequests:GenericRoutesGuarded"]="true";app.Configuration["ScheduleChangeRequests:AttendanceWritesCoordinated"]="true";
        Check((await Send(HttpMethod.Post,$"/api/schedule/change-requests/{stale.RequestId}/decision",staleReview.Input)).StatusCode==HttpStatusCode.Conflict,"HTTP 409 rejects stale actual/decision Preview");
        if(!string.IsNullOrEmpty(frontend))
        {
            var info=new ProcessStartInfo("node"){WorkingDirectory=frontend,UseShellExecute=false,CreateNoWindow=true,RedirectStandardOutput=true,RedirectStandardError=true};info.ArgumentList.Add("tests/scheduleChanges.http.browser.mjs");info.Environment["EDUTRACK_SCHEDULE_TEST_ORIGIN"]=origin;info.Environment["EDUTRACK_SCHEDULE_TEST_NONCE"]=nonce;
            using var browser=Process.Start(info)!;var stdout=browser.StandardOutput.ReadToEndAsync();var stderr=browser.StandardError.ReadToEndAsync();await browser.WaitForExitAsync();Console.WriteLine(await stdout);Console.WriteLine(await stderr);Check(browser.ExitCode==0,"Schedule-owned browser forms use real isolated MySQL/HTTP; page-owner hooks remain unapplied");
        }
    }
    Console.WriteLine($"{checks} Phase 3 assertions; isolated database {cs.Database}. Owner guard bypass reproduced; production workflow gated, Attendance race not claimed resolved.");
}
catch(Exception e){Console.Error.WriteLine(e);Environment.ExitCode=1;}
finally{if(app!=null)await app.DisposeAsync();if(!cs.Database.StartsWith("edutrack_change_test_",StringComparison.Ordinal))throw new Exception("Refusing cleanup");await using var cleanup=Db();await cleanup.Database.EnsureDeletedAsync();}

sealed class FixtureClock:TimeProvider{public override DateTimeOffset GetUtcNow()=>new(2026,11,9,1,0,0,TimeSpan.Zero);}
sealed class OnlyScheduleControllers:IApplicationFeatureProvider<ControllerFeature>{public void PopulateFeature(IEnumerable<ApplicationPart> parts,ControllerFeature feature){foreach(var c in feature.Controllers.Where(c=>c.AsType()!=typeof(ScheduleChangeRequestsController)&&c.AsType()!=typeof(EduTrack.API.Controllers.Queries.UserSelectionController)&&c.AsType()!=typeof(ScheduleController)&&c.AsType()!=typeof(ScheduleManagementController)&&c.AsType()!=typeof(EduTrack.API.Controllers.Queries.ApprovalRequestsController)).ToList())feature.Controllers.Remove(c);}}
sealed class FailAfterApply:SaveChangesInterceptor{public override ValueTask<int> SavedChangesAsync(SaveChangesCompletedEventData data,int result,CancellationToken ct=default){if(data.Context!.ChangeTracker.Entries<ScheduleChangeRequestDetail>().Any(d=>d.Entity.AppliedAt.HasValue))throw new InvalidOperationException("Injected after SQL before COMMIT");return ValueTask.FromResult(result);}}
