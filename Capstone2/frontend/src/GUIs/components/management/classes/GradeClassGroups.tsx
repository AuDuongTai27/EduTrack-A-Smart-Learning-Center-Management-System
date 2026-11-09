import { Link } from "react-router-dom";
import type { ClassDto } from "../../../../BLL/models/ClassDto";
import type { ManagementRole } from "../../../../BLL/models/ClassManagement";
import { groupClassesByGrade } from "../../../../BLL/services/classManagementService";
import DotStatusBadge from "../../Common/DotStatusBadge";
import TableActionButton from "../../Common/TableActionButton";
import { formatVND } from "../../../utils/formatCurrency";

interface Props {
  items: ClassDto[];
  role: ManagementRole;
  onEdit: (item: ClassDto) => void;
  onDelete: (item: ClassDto) => void;
}

export default function GradeClassGroups({items, role, onEdit, onDelete}: Props) {
  return <div className="p-3 d-flex flex-column gap-3" aria-label="Lớp học theo khối">
    {groupClassesByGrade(items).map(group => <details key={group.gradeId ?? "unclassified"} open className="border rounded-3">
      <summary className="p-3 fw-bold bg-light rounded-3" style={{cursor: "pointer"}}>
        {group.label}<span className="badge bg-primary-subtle text-primary ms-2">{group.classes.length} lớp</span>
      </summary>
      <div className="row g-3 p-3">
        {group.classes.map(item => <div key={item.classId} className="col-12 col-lg-6 col-xxl-4">
          <div className="border rounded-3 p-3 h-100">
            <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
              <Link className="fw-bold text-decoration-none text-break" to={`/${role}/classes/${item.classId}`}>{item.className}</Link>
              <DotStatusBadge status={item.status} />
            </div>
            <div className="small text-muted text-break">#CLS{item.classId} · {item.subjectName || `Môn #${item.subjectId}`}</div>
            <div className="small mt-2">{item.room || "Chưa xếp phòng"} · {formatVND(item.tuitionFee)}/tháng</div>
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3">
              <Link className="btn btn-sm btn-outline-primary" to={`/${role}/classes/${item.classId}`}>Chi tiết lớp</Link>
              <div className="d-flex gap-1">
                <TableActionButton action="Edit" title={`Sửa ${item.className}`} onClick={() => onEdit(item)} />
                <TableActionButton action="Delete" title={`Xóa ${item.className}`} onClick={() => onDelete(item)} />
              </div>
            </div>
          </div>
        </div>)}
      </div>
    </details>)}
  </div>;
}
