import { useState, useEffect, useMemo } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import DotStatusBadge from "../../../components/Common/DotStatusBadge";
import SubjectBadge from "../../../components/Common/SubjectBadge";
import Pagination from "../../../components/Common/Pagination";
import TableToolbar from "../../../components/Common/TableToolbar";
import classDAL from "../../../../DAL/classDAL";
import type { ClassDto } from "../../../../BLL/models/ClassDto";

export default function CenterManagerClassPage() {
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedSort, setSelectedSort] = useState<string>("az");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);

  // Detail Modal state (GetById)
  const [selectedClass, setSelectedClass] = useState<ClassDto | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  // Add Class Modal state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [addForm, setAddForm] = useState({
    className: "",
    subjectName: "Mathematics",
    room: "Phòng 201",
    tuitionFee: 3000000,
  });
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchClasses() {
      try {
        setLoading(true);
        const res = await classDAL.getAllClasses();
        if (isMounted && res.data) {
          setClasses(res.data);
        }
      } catch (err) {
        console.warn("Lỗi tải danh sách lớp học center manager:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchClasses();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter & Search logic
  const filteredClasses = useMemo(() => {
    return classes
      .filter((c) => {
        const matchSearch =
          searchTerm === "" ||
          c.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.subjectName && c.subjectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (c.room && c.room.toLowerCase().includes(searchTerm.toLowerCase()));

        return matchSearch;
      })
      .sort((a, b) => {
        if (selectedSort === "az") return a.className.localeCompare(b.className);
        if (selectedSort === "za") return b.className.localeCompare(a.className);
        if (selectedSort === "newest") return b.classId - a.classId;
        if (selectedSort === "oldest") return a.classId - b.classId;
        return 0;
      });
  }, [classes, searchTerm, selectedSort]);

  // Paginated list
  const paginatedClasses = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredClasses.slice(start, start + entriesPerPage);
  }, [filteredClasses, currentPage, entriesPerPage]);

  // Handle View Details (GetById)
  const handleViewDetails = async (cls: ClassDto) => {
    setLoadingDetail(true);
    try {
      const detail = await classDAL.getClassById(cls.classId);
      setSelectedClass(detail || cls);
    } catch {
      setSelectedClass(cls);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Handle Add Class Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.className.trim()) return;

    const newId = classes.length > 0 ? Math.max(...classes.map((x) => x.classId)) + 1 : 10;
    const newClassObj: ClassDto = {
      classId: newId,
      className: addForm.className.trim(),
      subjectId: 1,
      subjectCode: "MATH",
      subjectName: addForm.subjectName,
      room: addForm.room,
      tuitionFee: Number(addForm.tuitionFee) || 3000000,
      startDate: new Date().toISOString().split("T")[0],
      status: "active",
    };

    setClasses([newClassObj, ...classes]);
    setShowAddModal(false);
    setAddForm({
      className: "",
      subjectName: "Mathematics",
      room: "Phòng 201",
      tuitionFee: 3000000,
    });
    setActionSuccessMsg(`Đã mở thêm lớp học mới: "${newClassObj.className}" thành công!`);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  return (
    <>
      {/* Breadcrumb and Quick Access */}
      <PageHeader
        title="Class Management"
        breadcrumbItems={[
          { label: "Center Manager", path: "/center-manager" },
          { label: "Classes" },
        ]}
        action={
          <button
            type="button"
            className="btn btn-primary d-flex align-items-center shadow-sm"
            onClick={() => setShowAddModal(true)}
          >
            <i className="bi bi-plus-square me-2" />
            Add Class
          </button>
        }
      />

      {/* Success Notification Alert */}
      {actionSuccessMsg && (
        <div className="alert alert-success alert-dismissible fade show d-flex align-items-center mb-4 shadow-sm" role="alert">
          <i className="bi bi-check-circle-fill fs-5 me-2" />
          <div>{actionSuccessMsg}</div>
          <button type="button" className="btn-close" onClick={() => setActionSuccessMsg(null)} aria-label="Close" />
        </div>
      )}

      {/* Class List */}
      <div className="card user-list-card border-0 shadow-sm">
        {/* Filter */}
        <div className="card-header user-list-header bg-white py-3 border-bottom">
          <div className="row g-3 align-items-center">
            <div className="col-xl-8 col-lg-8">
              <div className="user-search position-relative">
                <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                <input
                  type="text"
                  className="form-control ps-5"
                  placeholder="Search by class name, subject, room..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
            <div className="col-xl-4 col-lg-4">
              <select
                className="form-select"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
              >
                <option value="az">Sort by Name A-Z</option>
                <option value="za">Sort by Name Z-A</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Controls */}
        <TableToolbar
          totalItems={filteredClasses.length}
          totalLabel="Total classes"
          entriesPerPage={entriesPerPage}
          onEntriesPerPageChange={(value) => {
            setEntriesPerPage(value);
            setCurrentPage(1);
          }}
        />

        {/* Class Table */}
        <div className="table-responsive">
          <table className="table user-table align-middle mb-0 table-hover">
            <thead className="table-light">
              <tr>
                <th className="fw-bold">No.</th>
                <th className="fw-bold">Class Code / ID</th>
                <th className="fw-bold">Class Name</th>
                <th className="fw-bold">Subject</th>
                <th className="fw-bold">Room</th>
                <th className="fw-bold">Tuition Fee</th>
                <th className="fw-bold">Status</th>
                <th className="text-center fw-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    Đang nạp danh sách lớp học...
                  </td>
                </tr>
              ) : paginatedClasses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">
                    <i className="bi bi-collection fs-2 d-block mb-2 text-secondary" />
                    Không tìm thấy lớp học nào phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedClasses.map((cls, idx) => {
                  const itemIndex = (currentPage - 1) * entriesPerPage + idx + 1;

                  return (
                    <tr key={cls.classId}>
                      <td>{itemIndex}</td>
                      <td>
                        <span className="badge bg-light text-primary border font-monospace">
                          #{cls.classId}
                        </span>
                      </td>
                      <td>
                        <h6 className="mb-0 fw-bold text-dark">{cls.className}</h6>
                      </td>
                      <td>
                        <SubjectBadge subject={cls.subjectName || "Subject"} />
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          <i className="bi bi-geo-alt me-1 text-danger" />
                          {cls.room || "Room 101"}
                        </span>
                      </td>
                      <td>
                        <strong className="text-dark">
                          {(cls.tuitionFee || 3000000).toLocaleString("vi-VN")} VND
                        </strong>
                      </td>
                      <td>
                        <DotStatusBadge status={cls.status || "active"} />
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleViewDetails(cls)}
                          title="View Class Details"
                        >
                          <i className="bi bi-eye me-1" />
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 border-top bg-white">
          <Pagination
            currentPage={currentPage}
            totalItems={filteredClasses.length}
            entriesPerPage={entriesPerPage}
            itemLabel="classes"
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* ADD CLASS MODAL */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-collection-fill me-2" />
                  Mở lớp học mới (Center Manager)
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowAddModal(false)}
                />
              </div>
              <form onSubmit={handleAddSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Tên lớp học <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ví dụ: Toán 12 - Luyện thi Đại học..."
                        value={addForm.className}
                        onChange={(e) => setAddForm({ ...addForm, className: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Bộ môn</label>
                      <select
                        className="form-select"
                        value={addForm.subjectName}
                        onChange={(e) => setAddForm({ ...addForm, subjectName: e.target.value })}
                      >
                        <option value="Mathematics">Mathematics (Toán học)</option>
                        <option value="Physics">Physics (Vật lý)</option>
                        <option value="Chemistry">Chemistry (Hóa học)</option>
                        <option value="English">English (Tiếng Anh)</option>
                        <option value="Biology">Biology (Sinh học)</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Phòng học phân bổ</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ví dụ: Phòng 301 - Tầng 3..."
                        value={addForm.room}
                        onChange={(e) => setAddForm({ ...addForm, room: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Mức học phí / Khóa (VND)</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="3000000"
                        value={addForm.tuitionFee}
                        onChange={(e) => setAddForm({ ...addForm, tuitionFee: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    Hủy bỏ
                  </button>
                  <button type="submit" className="btn btn-primary px-4">
                    Khai giảng lớp
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL (GetById) */}
      {selectedClass && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-light border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-primary fs-6 font-monospace">
                    #{selectedClass.classId}
                  </span>
                  <h5 className="modal-title fw-bold mb-0 text-dark">
                    Chi tiết lớp học: {selectedClass.className}
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedClass(null)}
                />
              </div>

              <div className="modal-body p-4">
                {loadingDetail ? (
                  <div className="text-center py-4 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    Đang nạp chi tiết lớp học...
                  </div>
                ) : (
                  <>
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3">
                          <small className="text-muted d-block mb-1">Môn học phụ trách</small>
                          <h6 className="fw-bold text-dark mb-0">{selectedClass.subjectName || "Chưa xác định"}</h6>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3">
                          <small className="text-muted d-block mb-1">Phòng học</small>
                          <h6 className="fw-bold text-dark mb-0">{selectedClass.room || "Room 101"}</h6>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3">
                          <small className="text-muted d-block mb-1">Học phí định mức</small>
                          <h6 className="fw-bold text-success mb-0">
                            {(selectedClass.tuitionFee || 3000000).toLocaleString("vi-VN")} VND
                          </h6>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3">
                          <small className="text-muted d-block mb-1">Trạng thái lớp học</small>
                          <DotStatusBadge status={selectedClass.status || "active"} />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="modal-footer bg-light">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedClass(null)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
