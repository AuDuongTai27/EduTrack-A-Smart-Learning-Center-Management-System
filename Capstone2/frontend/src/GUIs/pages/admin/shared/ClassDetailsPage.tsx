import { useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../../../components/Common/PageHeader";
import DotStatusBadge from "../../../components/Common/DotStatusBadge";
import SubjectBadge from "../../../components/Common/SubjectBadge";
import { useClassDetails } from "../../../hooks/useClassManagement";
import type { ClassQuery, ManagementRole } from "../../../../BLL/models/ClassManagement";
import { classDate, classGradeLabel } from "../../../../BLL/services/classManagementService";
import { formatVND } from "../../../utils/formatCurrency";
import ClassStaffAssignments from "../../../components/management/classes/ClassStaffAssignments";

function DataList<T>({query, empty, children}: {query: ClassQuery<T[]>; empty: string; children: (data: T[]) => ReactNode}) {
  if (query.loading) return <div className="text-muted py-3" role="status"><span className="spinner-border spinner-border-sm me-2" />Loading...</div>;
  if (query.error) return <div className="alert alert-danger mb-0" role="alert">{query.error}</div>;
  if (!query.data?.length) return <p className="text-muted py-3 mb-0">{empty}</p>;
  return children(query.data);
}
export default function ClassDetailsPage({role}: {role: ManagementRole}) {
  const {id} = useParams();
  const classId = id && /^\d+$/.test(id) ? Number(id) : NaN;
  const {sections, refresh} = useClassDetails(classId);
  const [tab, setTab] = useState("Overview");
  const [assignmentNotice, setAssignmentNotice] = useState<{classId: number; message: string} | null>(null);
  const item = sections.overview.data;
  const time = (value: string) => value?.slice(0, 5) || "—";
  return (
    <>
      <PageHeader title="Class Details" breadcrumbItems={[
        {label: role === "center-manager" ? "Center Manager" : "Admin Staff", path: `/${role}`},
        {label: "Classes", path: `/${role}/classes`}, {label: item?.className || "Class Details"},
      ]} action={<div className="d-flex flex-wrap gap-2"><Link className="btn btn-outline-secondary" to={`/${role}/classes`}>Back to List</Link>
        <button type="button" className="btn btn-outline-primary" disabled={sections.overview.loading} onClick={refresh}><i className="bi bi-arrow-clockwise me-1" />Refresh</button></div>} />
      {sections.overview.loading ? <div className="card border-0 shadow-sm p-4 text-muted" role="status"><span className="spinner-border spinner-border-sm me-2" />Loading class details...</div>
        : sections.overview.error ? <div className="alert alert-danger" role="alert">{sections.overview.error} <button type="button" className="btn btn-sm btn-outline-danger" onClick={refresh}>Retry</button></div>
          : item && <>
            <div className="card border-0 shadow-sm mb-4"><div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div><span className="badge bg-light text-primary border mb-2">#CLS{item.classId}</span><span className="badge bg-light text-secondary border ms-2">{classGradeLabel(item)}</span><h4 className="fw-bold text-dark mb-0 text-break">{item.className}</h4></div>
              <DotStatusBadge status={item.status} />
            </div></div>
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white"><div className="nav nav-tabs flex-wrap border-0" role="tablist" aria-label="Class details">
                {["Overview", "Subjects", "Students", "Schedule"].map(name => <button key={name} type="button" role="tab" aria-selected={tab === name}
                  className={`nav-link${tab === name ? " active" : ""}`} onClick={() => setTab(name)}>{name}</button>)}
              </div></div>
              <div className="card-body p-4" role="tabpanel" aria-label={tab}>
                {tab === "Overview" && <div className="row g-3">
                  {[["Class Name", item.className], ["Grade", classGradeLabel(item)], ["Status", item.status], ["Start Date", classDate(item.startDate)],
                    ["Expected End Date", item.endDate ? classDate(item.endDate) : "Not set"], ["Room", item.room || "No room assigned"],
                    ["Monthly Tuition Fee", formatVND(item.tuitionFee)]].map(([label, value]) => <div className="col-md-6" key={label}><div className="bg-light rounded-3 p-3 h-100">
                      <small className="text-muted d-block mb-1">{label}</small><strong className="text-break">{value}</strong>
                    </div></div>)}
                </div>}
                {tab === "Subjects" && <>
                  <h5 className="fw-bold">Class Subjects</h5>
                  <p className="small text-muted">Currently the class has one subject. Tuition fee and assignments below are saved per class; subject-specific assignments are not yet available.</p>
                  <div className="table-responsive mb-4"><table className="table user-table align-middle"><thead><tr><th>Subject</th><th>Subject Code</th><th>Monthly Tuition Fee</th></tr></thead>
                    <tbody><tr><td><div className="d-flex flex-wrap gap-2"><SubjectBadge subject={item.subjectName || `Subject #${item.subjectId}`} /></div></td><td>{item.subjectCode || "—"}</td><td>{formatVND(item.tuitionFee)}</td></tr></tbody>
                  </table></div>
                  {assignmentNotice?.classId === classId && <div className="alert alert-success" role="status">{assignmentNotice.message}</div>}
                  <ClassStaffAssignments key={item.classId} item={item} teachers={sections.teachers} assistants={sections.assistants}
                    onSaved={message => {setAssignmentNotice({classId, message}); refresh();}} />
                </>}
                {tab === "Students" && <>
                  <h5 className="fw-bold">Enrolled Students</h5>
                  <p className="small text-muted">Student list is saved per class. Subject-specific enrollment data is not yet available; students are not assumed to take all subjects.</p>
                  <DataList query={sections.students} empty="No students enrolled in this class.">{data => <div className="table-responsive"><table className="table user-table align-middle"><thead><tr><th>Student</th><th>Student Code</th><th>Enrolled Date</th><th>Status</th><th>Enrolled Subjects</th></tr></thead><tbody>
                    {data.map(student => <tr key={student.scId}><td>{student.studentName || `#${student.studentId}`}</td><td>{student.studentCode || "—"}</td><td>{classDate(student.enrolledDate)}</td><td><DotStatusBadge status={student.status} /></td><td className="text-muted small">No subject-specific data</td></tr>)}
                  </tbody></table></div>}</DataList>
                </>}
                {tab === "Schedule" && <>
                  <h5 className="fw-bold">Current Schedule</h5>
                  <p className="small text-muted">Schedule is linked to class, not separated by subject. Showing only recorded weekly schedules and sessions.</p>
                  <h6 className="fw-bold">Weekly Schedule</h6>
                  <DataList query={sections.schedules} empty="No weekly schedule configured.">{data => <div className="table-responsive"><table className="table user-table align-middle"><thead><tr><th>Day of Week</th><th>Start Time</th><th>End Time</th><th>Room</th></tr></thead><tbody>
                    {data.map(schedule => <tr key={schedule.scheduleId}><td>{schedule.dayOfWeek}</td><td>{time(schedule.startTime)}</td><td>{time(schedule.endTime)}</td><td>{schedule.room || "No room assigned"}</td></tr>)}
                  </tbody></table></div>}</DataList>
                  <h6 className="fw-bold mt-4">Created Sessions</h6>
                  <DataList query={sections.sessions} empty="No sessions created.">{data => <div className="table-responsive"><table className="table user-table align-middle"><thead><tr><th>Date</th><th>Time</th><th>Room</th><th>Status</th></tr></thead><tbody>
                    {[...data].sort((a, b) => b.sessionDate.localeCompare(a.sessionDate)).map(session => <tr key={session.sessionId}><td>{classDate(session.sessionDate)}</td><td>{time(session.startTime)} – {time(session.endTime)}</td><td>{session.room || "No room assigned"}</td><td><DotStatusBadge status={session.status} /></td></tr>)}
                  </tbody></table></div>}</DataList>
                </>}
              </div>
            </div>
          </>}
    </>
  );
}
