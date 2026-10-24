import type { ClassDto } from "../../../../../BLL/models/ClassDto";

export interface LearningProgressHeaderProps {
  classes?: ClassDto[];
  selectedClassId?: number;
  onSelectClass?: (classId: number) => void;
}

export default function LearningProgressHeader({
  classes = [],
  selectedClassId,
  onSelectClass,
}: LearningProgressHeaderProps) {
  return (
    <div className="class-list-header d-flex align-items-center justify-content-between flex-wrap gap-3">
      <div>
        <h4 className="class-list-title mb-1">Student Progress List</h4>
        <small className="text-muted">Track attendance and assignment status by class</small>
      </div>
      <div className="d-flex align-items-center gap-3 flex-wrap">
        <div className="d-flex align-items-center gap-2">
          <label htmlFor="filterClassSelect" className="form-label mb-0 small fw-bold text-nowrap">
            Select Class:
          </label>
          <select
            className="form-select form-select-sm"
            id="filterClassSelect"
            style={{ minWidth: 200 }}
            value={selectedClassId || ""}
            onChange={(e) => onSelectClass && onSelectClass(Number(e.target.value))}
          >
            {classes.length > 0 ? (
              classes.map((cls) => (
                <option key={cls.classId} value={cls.classId}>
                  {cls.className}
                </option>
              ))
            ) : (
              <>
                <option value="1">[FE-Mock] Class 9 - Advanced Mathematics</option>
                <option value="2">[FE-Mock] Class 9 - Intensive Physics</option>
              </>
            )}
          </select>
        </div>
      </div>
    </div>
  );
}
