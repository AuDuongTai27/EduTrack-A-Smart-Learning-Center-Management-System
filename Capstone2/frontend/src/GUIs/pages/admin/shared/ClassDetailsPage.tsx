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
  if (query.loading) return <div className="text-muted py-3" role="status"><span className="spinner-border spinner-border-sm me-2" />Đang tải...</div>;
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
      ]} action={<div className="d-flex flex-wrap gap-2"><Link className="btn btn-outline-secondary" to={`/${role}/classes`}>Quay lại danh sách</Link>
        <button type="button" className="btn btn-outline-primary" disabled={sections.overview.loading} onClick={refresh}><i className="bi bi-arrow-clockwise me-1" />Tải lại</button></div>} />
      {sections.overview.loading ? <div className="card border-0 shadow-sm p-4 text-muted" role="status"><span className="spinner-border spinner-border-sm me-2" />Đang tải chi tiết lớp...</div>
        : sections.overview.error ? <div className="alert alert-danger" role="alert">{sections.overview.error} <button type="button" className="btn btn-sm btn-outline-danger" onClick={refresh}>Thử lại</button></div>
          : item && <>
            <div className="card border-0 shadow-sm mb-4"><div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div><span className="badge bg-light text-primary border mb-2">#CLS{item.classId}</span><span className="badge bg-light text-secondary border ms-2">{classGradeLabel(item)}</span><h4 className="fw-bold text-dark mb-0 text-break">{item.className}</h4></div>
              <DotStatusBadge status={item.status} />
            </div></div>
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white"><div className="nav nav-tabs flex-wrap border-0" role="tablist" aria-label="Chi tiết lớp học">
                {["Overview", "Subjects", "Students", "Schedule"].map(name => <button key={name} type="button" role="tab" aria-selected={tab === name}
                  className={`nav-link${tab === name ? " active" : ""}`} onClick={() => setTab(name)}>{name}</button>)}
              </div></div>
              <div className="card-body p-4" role="tabpanel" aria-label={tab}>
                {tab === "Overview" && <div className="row g-3">
                  {[["Tên lớp học", item.className], ["Khối lớp (Grade)", classGradeLabel(item)], ["Trạng thái", item.status], ["Ngày khai giảng", classDate(item.startDate)],
                    ["Kết thúc dự kiến", item.endDate ? classDate(item.endDate) : "Chưa xác định"], ["Phòng học", item.room || "Chưa xếp phòng"],
                    ["Học phí/tháng của lớp", formatVND(item.tuitionFee)]].map(([label, value]) => <div className="col-md-6" key={label}><div className="bg-light rounded-3 p-3 h-100">
                      <small className="text-muted d-block mb-1">{label}</small><strong className="text-break">{value}</strong>
                    </div></div>)}
                </div>}
                {tab === "Subjects" && <>
                  <h5 className="fw-bold">Môn học của lớp</h5>
                  <p className="small text-muted">Hiện lớp có một môn. Học phí và phân công dưới đây được lưu theo lớp; chưa có phân công riêng từng môn.</p>
                  <div className="table-responsive mb-4"><table className="table user-table align-middle"><thead><tr><th>Môn học</th><th>Mã môn</th><th>Học phí/tháng của lớp</th></tr></thead>
                    <tbody><tr><td><div className="d-flex flex-wrap gap-2"><SubjectBadge subject={item.subjectName || `Môn #${item.subjectId}`} /></div></td><td>{item.subjectCode || "—"}</td><td>{formatVND(item.tuitionFee)}</td></tr></tbody>
                  </table></div>
                  {assignmentNotice?.classId === classId && <div className="alert alert-success" role="status">{assignmentNotice.message}</div>}
                  <ClassStaffAssignments key={item.classId} item={item} teachers={sections.teachers} assistants={sections.assistants}
                    onSaved={message => {setAssignmentNotice({classId, message}); refresh();}} />
                </>}
                {tab === "Students" && <>
                  <h5 className="fw-bold">Học sinh tham gia lớp</h5>
                  <p className="small text-muted">Danh sách hiện được lưu theo lớp. Chưa có dữ liệu đăng ký riêng từng môn; không mặc định học sinh tham gia tất cả môn.</p>
                  <DataList query={sections.students} empty="Chưa có học sinh đăng ký lớp này.">{data => <div className="table-responsive"><table className="table user-table align-middle"><thead><tr><th>Học sinh</th><th>Mã học sinh</th><th>Ngày đăng ký</th><th>Trạng thái</th><th>Môn đã đăng ký</th></tr></thead><tbody>
                    {data.map(student => <tr key={student.scId}><td>{student.studentName || `#${student.studentId}`}</td><td>{student.studentCode || "—"}</td><td>{classDate(student.enrolledDate)}</td><td><DotStatusBadge status={student.status} /></td><td className="text-muted small">Chưa có dữ liệu theo môn</td></tr>)}
                  </tbody></table></div>}</DataList>
                </>}
                {tab === "Schedule" && <>
                  <h5 className="fw-bold">Lịch học hiện có</h5>
                  <p className="small text-muted">Lịch đang gắn với lớp, chưa tách theo từng môn. Chỉ hiển thị lịch tuần và buổi học đã được ghi nhận.</p>
                  <h6 className="fw-bold">Lịch tuần</h6>
                  <DataList query={sections.schedules} empty="Chưa thiết lập lịch tuần.">{data => <div className="table-responsive"><table className="table user-table align-middle"><thead><tr><th>Thứ</th><th>Bắt đầu</th><th>Kết thúc</th><th>Phòng</th></tr></thead><tbody>
                    {data.map(schedule => <tr key={schedule.scheduleId}><td>{schedule.dayOfWeek}</td><td>{time(schedule.startTime)}</td><td>{time(schedule.endTime)}</td><td>{schedule.room || "Chưa xếp phòng"}</td></tr>)}
                  </tbody></table></div>}</DataList>
                  <h6 className="fw-bold mt-4">Các buổi học đã tạo</h6>
                  <DataList query={sections.sessions} empty="Chưa có buổi học được tạo.">{data => <div className="table-responsive"><table className="table user-table align-middle"><thead><tr><th>Ngày</th><th>Thời gian</th><th>Phòng</th><th>Trạng thái</th></tr></thead><tbody>
                    {[...data].sort((a, b) => b.sessionDate.localeCompare(a.sessionDate)).map(session => <tr key={session.sessionId}><td>{classDate(session.sessionDate)}</td><td>{time(session.startTime)} – {time(session.endTime)}</td><td>{session.room || "Chưa xếp phòng"}</td><td><DotStatusBadge status={session.status} /></td></tr>)}
                  </tbody></table></div>}</DataList>
                </>}
              </div>
            </div>
          </>}
    </>
  );
}
