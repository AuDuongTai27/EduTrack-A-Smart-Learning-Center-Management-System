import React from "react";

export interface LearningProgressHeaderProps {
  classes?: Array<{ classId: number; className: string }>;
  selectedClassId?: number;
  onSelectClass?: (classId: number) => void;
  classNameTitle?: string;
  totalStudents?: number;
}

export default function LearningProgressHeader({
  classes = [],
  selectedClassId,
  onSelectClass,
  classNameTitle,
  totalStudents,
}: LearningProgressHeaderProps) {
  return (
    <div className="class-list-header d-flex align-items-center justify-content-between flex-wrap gap-3 p-3 border-bottom">
      <div>
        <h4 className="class-list-title mb-1">
          {classNameTitle ? `Tiến Độ: ${classNameTitle}` : "Tiến Độ Học Tập & Chuyên Cần"}
        </h4>
        <small className="text-muted">
          Theo dõi sát sao tình hình làm bài và hỗ trợ học viên theo lớp
        </small>
      </div>
      <div className="d-flex align-items-center gap-3 flex-wrap">
        <div className="d-flex align-items-center gap-2">
          <label htmlFor="filterClassSelect" className="form-label mb-0 small fw-bold text-nowrap">
            Chọn lớp trợ giảng:
          </label>
          <select
            className="form-select form-select-sm"
            id="filterClassSelect"
            style={{ minWidth: 220 }}
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
                <option value="1">Lớp 9A1 - Toán Nâng Cao</option>
                <option value="2">Lớp 9B1 - Vật Lý Chuyên Sâu</option>
              </>
            )}
          </select>
        </div>
      </div>
    </div>
  );
}
