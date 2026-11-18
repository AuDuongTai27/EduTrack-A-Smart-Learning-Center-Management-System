import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { MaterialItem, AssignmentItem } from './classDetailData';

export interface ClassCourseworkSectionProps {
  materials: MaterialItem[];
  assignments: AssignmentItem[];
  onDownload: (fileName: string, fileUrl?: string) => void;
  classId?: number;
}

export type CourseworkFilterType = 'all' | 'assignments' | 'materials';

export interface UnifiedCourseworkRow {
  id: number | string;
  kind: 'assignment' | 'material';
  title: string;
  description?: string;
  dateStr: string;
  timestamp: number;
  // Dành riêng cho assignment:
  assignment?: AssignmentItem;
  // Dành riêng cho material:
  material?: MaterialItem;
}

function parseDateStrToTime(dateStr?: string): number {
  if (!dateStr) return 0;
  const cleanStr = dateStr.trim();
  if (cleanStr.includes('/')) {
    const parts = cleanStr.split(/[\s,]+/);
    const datePart = parts[0];
    const timePart = parts[1] || '00:00';
    const [d, m, y] = datePart.split('/').map(Number);
    const [hh, mm] = timePart.split(':').map(Number);
    if (d && m && y) {
      return new Date(y, m - 1, d, hh || 0, mm || 0).getTime();
    }
  }
  const parsed = new Date(dateStr).getTime();
  return isNaN(parsed) ? 0 : parsed;
}

export function ClassCourseworkSection({
  materials,
  assignments,
  onDownload,
  classId,
}: ClassCourseworkSectionProps) {
  const [filterType, setFilterType] = useState<CourseworkFilterType>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 1. Gom chung cả assignments và materials vào một danh sách thống nhất
  const unifiedList: UnifiedCourseworkRow[] = useMemo(() => {
    const asgRows: UnifiedCourseworkRow[] = assignments.map((asg) => ({
      id: `asg-${asg.id}`,
      kind: 'assignment',
      title: asg.title,
      description: `Due date: ${asg.dueDate}`,
      dateStr: asg.dueDate,
      timestamp: parseDateStrToTime(asg.dueDate),
      assignment: asg,
    }));

    const matRows: UnifiedCourseworkRow[] = materials.map((mat) => ({
      id: `mat-${mat.id}`,
      kind: 'material',
      title: mat.fileName,
      description: mat.description,
      dateStr: mat.uploadDate,
      timestamp: parseDateStrToTime(mat.uploadDate),
      material: mat,
    }));

    // Gom hết lại và sắp xếp CÁI MỚI NHẤT HIỆN LÊN ĐẦU
    return [...asgRows, ...matRows].sort((a, b) => b.timestamp - a.timestamp);
  }, [assignments, materials]);

  // 2. Lọc theo FilterType và SearchTerm
  const filteredList = useMemo(() => {
    return unifiedList.filter((item) => {
      // Lọc theo loại
      if (filterType === 'assignments' && item.kind !== 'assignment') return false;
      if (filterType === 'materials' && item.kind !== 'material') return false;

      // Lọc theo từ khóa tìm kiếm
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(term);
        const matchDesc = item.description?.toLowerCase().includes(term);
        return matchTitle || matchDesc;
      }
      return true;
    });
  }, [unifiedList, filterType, searchTerm]);

  const handleDownloadAllZip = () => {
    const targetClassId = classId || (materials.length > 0 ? materials[0].classId : undefined);
    if (!targetClassId) return;
    window.open(`/api/learning/student/classes/${targetClassId}/materials/download-all`, '_blank');
  };

  const asgCounts = {
    submitted: assignments.filter((a) => a.status === 'Đã nộp').length,
    pending: assignments.filter((a) => a.status === 'Chưa nộp').length,
    overdue: assignments.filter((a) => a.status === 'Quá hạn').length,
  };

  return (
    <details className="card class-list-card border-0 mb-4">
      {/* Master Section Header */}
      <summary className="class-list-header d-flex align-items-center justify-content-between py-3 px-4 flex-wrap gap-2 cursor-pointer">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-collection-play-fill text-primary fs-5" />
          <h4 className="class-list-title mb-0">
            Coursework &amp; Learning Materials ({unifiedList.length})
          </h4>
        </div>

        {/* Quick Actions (e.g. Download All ZIP) + Toggle Chevron */}
        <div className="d-flex align-items-center gap-3 flex-wrap">
          {materials.length > 0 && (
            <button
              type="button"
              className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-2 fw-medium shadow-xs"
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadAllZip();
              }}
              title="Download all lecture materials for this class as a .zip file"
              style={{ fontSize: '13px' }}
            >
              <i className="bi bi-file-earmark-zip-fill fs-6 text-primary"></i>
              <span>Download All Materials (.zip)</span>
            </button>
          )}

          <i className="bi bi-chevron-down details-chevron text-muted" />
        </div>
      </summary>

      {/* Toolbar: Filter Pills (All / Assignments / Materials) & Search Input */}
        <div className="px-4 py-2.5 border-bottom bg-light bg-opacity-40 d-flex align-items-center justify-content-between flex-wrap gap-2.5">
          {/* Filter Pills */}
          <div className="d-flex align-items-center gap-1.5 flex-wrap">
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 py-1 fw-medium d-inline-flex align-items-center gap-1.5 transition-all ${
                filterType === 'all'
                  ? 'btn-primary shadow-xs'
                  : 'btn-outline-secondary bg-white text-secondary border'
              }`}
              style={{ fontSize: '13px' }}
              onClick={() => setFilterType('all')}
            >
              <i className="bi bi-grid-fill" style={{ fontSize: '12px' }} />
              <span>All ({unifiedList.length})</span>
            </button>

            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 py-1 fw-medium d-inline-flex align-items-center gap-1.5 transition-all ${
                filterType === 'assignments'
                  ? 'btn-primary shadow-xs'
                  : 'btn-outline-secondary bg-white text-secondary border'
              }`}
              style={{ fontSize: '13px' }}
              onClick={() => setFilterType('assignments')}
            >
              <i className="bi bi-journal-check" style={{ fontSize: '12px' }} />
              <span>Assignments ({assignments.length})</span>
            </button>

            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 py-1 fw-medium d-inline-flex align-items-center gap-1.5 transition-all ${
                filterType === 'materials'
                  ? 'btn-primary shadow-xs'
                  : 'btn-outline-secondary bg-white text-secondary border'
              }`}
              style={{ fontSize: '13px' }}
              onClick={() => setFilterType('materials')}
            >
              <i className="bi bi-file-earmark-text-fill" style={{ fontSize: '12px' }} />
              <span>Materials ({materials.length})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="input-group input-group-sm" style={{ width: 280 }}>
            <span className="input-group-text bg-white border-end-0 text-muted rounded-start-2">
              <i className="bi bi-search" style={{ fontSize: '12px' }} />
            </span>
            <input
              type="search"
              className="form-control form-control-sm border-start-0 ps-1 rounded-end-2"
              placeholder="Search coursework, materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: '13px' }}
            />
          </div>
        </div>

        {/* Content Stream List */}
        <div className="p-4 bg-white d-flex flex-column gap-2.5">
          {filteredList.length > 0 ? (
            filteredList.map((item) => {
              if (item.kind === 'assignment' && item.assignment) {
                const asg = item.assignment;
                let statusBadge = (
                  <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2.5 py-1 rounded-pill fw-medium d-inline-flex align-items-center gap-1">
                    <i className="bi bi-clock" /> Not Submitted
                  </span>
                );
                if (asg.status === 'Đã nộp') {
                  statusBadge = (
                    <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1 rounded-pill fw-medium d-inline-flex align-items-center gap-1">
                      <i className="bi bi-check-circle-fill" /> Submitted
                    </span>
                  );
                } else if (asg.status === 'Quá hạn') {
                  statusBadge = (
                    <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2.5 py-1 rounded-pill fw-medium d-inline-flex align-items-center gap-1">
                      <i className="bi bi-x-circle-fill" /> Overdue
                    </span>
                  );
                }

                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-3 border bg-white d-flex align-items-center justify-content-between flex-wrap gap-3 hover-shadow-sm transition-all"
                    style={{ borderColor: '#E2E8F0' }}
                  >
                    {/* Left: Icon & Info */}
                    <div className="d-flex align-items-center gap-3 min-w-0 flex-grow-1">
                      {/* Unified Assignment Icon Box (Blue/Primary) */}
                      <div
                        className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                          width: 44,
                          height: 44,
                          backgroundColor: '#EFF6FF',
                          color: '#2563EB',
                          border: '1px solid #BFDBFE',
                        }}
                      >
                        <i className="bi bi-journal-check fs-5" />
                      </div>

                      <div className="min-w-0 flex-grow-1">
                        <div className="d-flex align-items-center gap-2 flex-wrap mb-0.5">
                          {/* Assignment Badge */}
                          <span
                            className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2 py-0.5 fw-semibold"
                            style={{ fontSize: '11px' }}
                          >
                            Assignment
                          </span>
                          <span className="fw-bold text-dark text-break" style={{ fontSize: '14.5px' }}>
                            {asg.title}
                          </span>
                        </div>
                        <div className="d-flex align-items-center gap-2 text-muted small" style={{ fontSize: '12.5px' }}>
                          <span className="d-inline-flex align-items-center gap-1 text-danger fw-medium">
                            <i className="bi bi-clock" /> Due: {asg.dueDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Status & Action Button */}
                    <div className="d-flex align-items-center gap-2.5 flex-shrink-0">
                      {statusBadge}
                      <Link
                        to={`/student/assignments/${asg.id}`}
                        className="btn btn-sm btn-outline-primary rounded-2 px-3 py-1.5 fw-medium d-inline-flex align-items-center gap-1 shadow-xs"
                        style={{ fontSize: '12.5px' }}
                      >
                        <span>View Task</span>
                        <i className="bi bi-chevron-right" style={{ fontSize: '11px' }} />
                      </Link>
                    </div>
                  </div>
                );
              }

              // Material Item
              if (item.kind === 'material' && item.material) {
                const mat = item.material;
                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-3 border bg-white d-flex align-items-center justify-content-between flex-wrap gap-3 hover-shadow-sm transition-all"
                    style={{ borderColor: '#E2E8F0' }}
                  >
                    {/* Left: Icon & Info */}
                    <div className="d-flex align-items-center gap-3 min-w-0 flex-grow-1">
                      {/* Unified Material Icon Box (Rose/Danger) */}
                      <div
                        className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                          width: 44,
                          height: 44,
                          backgroundColor: '#FFF1F2',
                          color: '#E11D48',
                          border: '1px solid #FECDD3',
                        }}
                      >
                        <i className="bi bi-file-earmark-text-fill fs-5" />
                      </div>

                      <div className="min-w-0 flex-grow-1">
                        <div className="d-flex align-items-center gap-2 flex-wrap mb-0.5">
                          {/* Material Badge */}
                          <span
                            className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2 py-0.5 fw-semibold"
                            style={{ fontSize: '11px' }}
                          >
                            Material &middot; {mat.type}
                          </span>
                          <span className="fw-bold text-dark text-break" style={{ fontSize: '14.5px' }}>
                            {mat.fileName}
                          </span>
                        </div>
                        <div className="d-flex align-items-center gap-3 text-muted small flex-wrap" style={{ fontSize: '12.5px' }}>
                          {mat.description && (
                            <span className="text-truncate text-secondary" style={{ maxWidth: 450 }}>
                              {mat.description}
                            </span>
                          )}
                          <span>
                            <i className="bi bi-calendar3 opacity-50 me-1" />
                            {mat.uploadDate} &middot; by {mat.uploadedBy} &middot; {mat.sizeMb} MB
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Download Action Button */}
                    <div className="d-flex align-items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary rounded-2 px-3 py-1.5 fw-medium d-inline-flex align-items-center gap-1.5 shadow-xs"
                        onClick={() => onDownload(mat.fileName, mat.fileUrl)}
                        style={{ fontSize: '12.5px' }}
                      >
                        <i className="bi bi-download" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                );
              }

              return null;
            })
          ) : (
            <div className="py-5 text-center text-muted">
              <i className="bi bi-inbox fs-1 d-block mb-2 text-secondary opacity-50" />
              <h6 className="fw-semibold text-dark mb-1">No coursework or materials found</h6>
              <small className="text-muted">
                {searchTerm
                  ? 'Try adjusting your search keywords or clear the filter.'
                  : 'No assignments or study resources have been posted for this class yet.'}
              </small>
            </div>
          )}
        </div>
    </details>
  );
}

export default ClassCourseworkSection;
