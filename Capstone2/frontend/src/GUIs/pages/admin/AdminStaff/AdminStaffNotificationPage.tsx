import { useState, useEffect, useMemo } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import StatusBadge from "../../../components/Common/StatusBadge";
import Pagination from "../../../components/Common/Pagination";
import notificationDAL from "../../../../DAL/notificationDAL";
import type { NotificationDto } from "../../../../BLL/models/NotificationDto";

export default function AdminStaffNotificationPage() {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedSort, setSelectedSort] = useState<string>("newest");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const entriesPerPage = 5;

  // Selected Notification (GetById)
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<NotificationDto | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  // Modal create state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    type: "Announcement",
    targetAudience: "Entire Center",
    content: "",
  });
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchNotifications() {
      try {
        setLoading(true);
        const res = await notificationDAL.getAllNotifications();
        if (isMounted && res.data) {
          setNotifications(res.data);
          if (res.data.length > 0) {
            setSelectedId(res.data[0].notificationId);
            setSelectedNotification(res.data[0]);
          }
        }
      } catch (err) {
        console.warn("Lỗi tải thông báo admin staff:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchNotifications();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter & Search logic
  const filteredNotifications = useMemo(() => {
    return notifications
      .filter((n) => {
        const matchSearch =
          searchTerm === "" ||
          n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (n.content && n.content.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchType = selectedType === "All" || n.type === selectedType;

        return matchSearch && matchType;
      })
      .sort((a, b) => {
        if (selectedSort === "newest") {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
        if (selectedSort === "oldest") {
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        }
        if (selectedSort === "title-asc") {
          return a.title.localeCompare(b.title);
        }
        if (selectedSort === "title-desc") {
          return b.title.localeCompare(a.title);
        }
        return 0;
      });
  }, [notifications, searchTerm, selectedType, selectedSort]);

  // Paginated list
  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredNotifications.slice(start, start + entriesPerPage);
  }, [filteredNotifications, currentPage, entriesPerPage]);

  // Handle select item (GetById)
  const handleSelectNotification = async (item: NotificationDto) => {
    setSelectedId(item.notificationId);
    setLoadingDetail(true);
    try {
      const detail = await notificationDAL.getNotificationById(item.notificationId);
      setSelectedNotification(detail || item);
    } catch {
      setSelectedNotification(item);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Handle create announcement submit
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title.trim() || !createForm.content.trim()) {
      alert("Vui lòng điền tiêu đề và nội dung thông báo!");
      return;
    }

    const newNotif: NotificationDto = {
      notificationId: Date.now(),
      title: createForm.title,
      type: createForm.type,
      content: createForm.content,
      isRead: false,
      createdAt: new Date().toISOString(),
      className: createForm.targetAudience,
    };

    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    setSelectedId(newNotif.notificationId);
    setSelectedNotification(newNotif);
    setShowCreateModal(false);
    setCreateForm({
      title: "",
      type: "Announcement",
      targetAudience: "Entire Center",
      content: "",
    });
    setActionSuccessMsg(`Đã tạo và gửi thông báo "${newNotif.title}" thành công!`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  return (
    <>
      {/* Breadcrumb and Quick Access */}
      <PageHeader
        title="Notifications & Announcements"
        breadcrumbItems={[
          { label: "Admin Staff", path: "/admin-staff" },
          { label: "Notifications" },
        ]}
        action={
          <button
            type="button"
            className="btn btn-primary d-flex align-items-center shadow-sm"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="bi bi-plus-square me-2" />
            New Notification
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

      {/* Filter */}
      <div className="card user-list-card mb-4 border-0 shadow-sm">
        <div className="card-header user-list-header bg-white py-3">
          <div className="row g-3 align-items-center">
            <div className="col-xl-6 col-lg-6">
              <div className="user-search position-relative">
                <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                <input
                  type="text"
                  className="form-control ps-5"
                  placeholder="Search notifications by title or content..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
            <div className="col-xl-3 col-lg-3 col-md-6">
              <select
                className="form-select"
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Types</option>
                <option value="Announcement">Announcement</option>
                <option value="System">System</option>
                <option value="Reminder">Reminder</option>
                <option value="Tuition">Tuition</option>
                <option value="Academic">Academic</option>
              </select>
            </div>
            <div className="col-xl-3 col-lg-3 col-md-6">
              <select
                className="form-select"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
              >
                <option value="newest">Sort by Newest</option>
                <option value="oldest">Sort by Oldest</option>
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Content */}
      <div className="row g-4">
        {/* Notification List (Left col) */}
        <div className="col-xl-5">
          <div className="card notification-card border-0 shadow-sm h-100">
            <div className="notification-card-header d-flex align-items-center justify-content-between p-3 border-bottom bg-white">
              <div>
                <h5 className="mb-0 fw-bold">Notification List</h5>
                <small className="text-muted">{filteredNotifications.length} notifications found</small>
              </div>
            </div>

            <div className="notification-list p-2" style={{ maxHeight: "600px", overflowY: "auto" }}>
              {loading ? (
                <div className="text-center py-5 text-muted">
                  <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                  Đang tải thông báo...
                </div>
              ) : paginatedNotifications.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-bell-slash fs-2 d-block mb-2 text-secondary" />
                  Không có thông báo nào phù hợp.
                </div>
              ) : (
                paginatedNotifications.map((n) => {
                  const isSelected = selectedId === n.notificationId;
                  const dateStr = n.createdAt
                    ? new Date(n.createdAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "—";

                  return (
                    <div
                      key={n.notificationId}
                      className={`notification-item p-3 mb-2 rounded-3 border transition-all cursor-pointer ${
                        isSelected ? "bg-primary-subtle border-primary" : "bg-white hover-shadow"
                      }`}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSelectNotification(n)}
                    >
                      <div className="notification-item-top d-flex align-items-center justify-content-between mb-2">
                        <h6 className={`mb-0 fw-bold text-truncate ${isSelected ? "text-primary" : "text-dark"}`} style={{ maxWidth: "230px" }}>
                          {n.title}
                        </h6>
                        <span className={`badge ${isSelected ? "bg-primary text-white" : "bg-light text-dark border"}`}>
                          {n.type || "Notice"}
                        </span>
                      </div>
                      <p className="notification-summary text-muted small mb-2 text-truncate">
                        {n.content || "Không có nội dung mô tả."}
                      </p>
                      <div className="notification-meta d-flex align-items-center justify-content-between small text-muted">
                        <span>
                          <i className="bi bi-people me-1" />
                          {n.className || "Entire Center"}
                        </span>
                        <span>
                          <i className="bi bi-clock me-1" />
                          {dateStr}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-3 border-top mt-auto bg-white">
              <Pagination
                currentPage={currentPage}
                totalItems={filteredNotifications.length}
                entriesPerPage={entriesPerPage}
                itemLabel="notifications"
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>

        {/* Notification Preview (Right col - GetById) */}
        <div className="col-xl-7">
          <div className="card notification-card border-0 shadow-sm h-100">
            {loadingDetail ? (
              <div className="text-center py-5 text-muted">
                <div className="spinner-border text-primary mb-3" role="status" />
                <p>Đang tải chi tiết thông báo...</p>
              </div>
            ) : selectedNotification ? (
              <>
                <div className="notification-preview-header d-flex align-items-start justify-content-between p-4 border-bottom bg-white">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <h4 className="mb-0 fw-bold text-dark">{selectedNotification.title}</h4>
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                        {selectedNotification.type || "Notice"}
                      </span>
                    </div>
                    <small className="text-muted">
                      Created on:{" "}
                      {selectedNotification.createdAt
                        ? new Date(selectedNotification.createdAt).toLocaleString("vi-VN")
                        : "—"}
                    </small>
                  </div>
                </div>

                <div className="notification-preview-body p-4 flex-grow-1">
                  <div className="row g-3 mb-4">
                    <div className="col-sm-6 col-md-3">
                      <div className="p-3 bg-light rounded-3 text-center">
                        <small className="text-muted d-block mb-1">Loại thông báo</small>
                        <strong className="text-dark">{selectedNotification.type || "Announcement"}</strong>
                      </div>
                    </div>
                    <div className="col-sm-6 col-md-3">
                      <div className="p-3 bg-light rounded-3 text-center">
                        <small className="text-muted d-block mb-1">Người gửi</small>
                        <strong className="text-dark">{selectedNotification.userName || "Admin Staff"}</strong>
                      </div>
                    </div>
                    <div className="col-sm-6 col-md-3">
                      <div className="p-3 bg-light rounded-3 text-center">
                        <small className="text-muted d-block mb-1">Đối tượng nhận</small>
                        <strong className="text-dark">{selectedNotification.className || "Toàn trung tâm"}</strong>
                      </div>
                    </div>
                    <div className="col-sm-6 col-md-3">
                      <div className="p-3 bg-light rounded-3 text-center">
                        <small className="text-muted d-block mb-1">Trạng thái</small>
                        <span className="badge bg-success-subtle text-success border border-success-subtle">Đã gửi</span>
                      </div>
                    </div>
                  </div>

                  <hr className="my-4" />

                  <div className="notification-message">
                    <h6 className="fw-bold text-dark mb-3">Nội dung thông báo:</h6>
                    <div className="p-4 bg-light rounded-3 border text-secondary" style={{ whiteSpace: "pre-line", minHeight: "150px", lineHeight: "1.7" }}>
                      {selectedNotification.content || "Không có nội dung thông báo."}
                    </div>
                  </div>

                  <hr className="my-4" />

                  <div>
                    <h6 className="fw-bold text-dark mb-2">Tệp đính kèm liên quan:</h6>
                    <div className="d-flex align-items-center justify-content-between p-3 border rounded-3 bg-white shadow-sm" style={{ maxWidth: "380px" }}>
                      <div className="d-flex align-items-center gap-3">
                        <i className="bi bi-file-earmark-pdf-fill fs-3 text-danger" />
                        <div>
                          <strong className="d-block text-dark">thong-bao-trung-tam.pdf</strong>
                          <small className="text-muted">184 KB - PDF Document</small>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => alert("Đang tải xuống tệp đính kèm...")}
                        title="Tải xuống tệp đính kèm"
                      >
                        <i className="bi bi-download" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="notification-preview-footer p-4 border-top bg-light d-flex justify-content-between align-items-center">
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => {
                      if (window.confirm("Bạn có chắc chắn muốn xóa thông báo này?")) {
                        const remaining = notifications.filter((x) => x.notificationId !== selectedNotification.notificationId);
                        setNotifications(remaining);
                        if (remaining.length > 0) {
                          setSelectedId(remaining[0].notificationId);
                          setSelectedNotification(remaining[0]);
                        } else {
                          setSelectedId(null);
                          setSelectedNotification(null);
                        }
                        setActionSuccessMsg("Đã xóa thông báo thành công!");
                        setTimeout(() => setActionSuccessMsg(null), 3000);
                      }
                    }}
                  >
                    <i className="bi bi-trash me-1" />
                    Xóa thông báo
                  </button>

                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => alert("Tính năng chỉnh sửa thông báo đã lưu nháp.")}
                    >
                      <i className="bi bi-pencil me-1" />
                      Chỉnh sửa
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        setActionSuccessMsg(`Đã phát lại thông báo "${selectedNotification.title}" tới đối tượng nhận!`);
                        setTimeout(() => setActionSuccessMsg(null), 4000);
                      }}
                    >
                      <i className="bi bi-send-check me-1" />
                      Gửi lại ngay
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-5 text-muted p-4">
                <i className="bi bi-bell fs-1 d-block mb-3 text-secondary" />
                <h5>Chưa chọn thông báo nào</h5>
                <p>Vui lòng chọn một thông báo từ danh sách bên trái để xem chi tiết.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CREATE NEW NOTIFICATION MODAL */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-megaphone-fill me-2" />
                  Tạo thông báo & thông cáo mới
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowCreateModal(false)}
                />
              </div>
              <form onSubmit={handleCreateSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Loại thông báo <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        value={createForm.type}
                        onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                        required
                      >
                        <option value="Announcement">Announcement (Thông báo chung)</option>
                        <option value="Tuition">Tuition (Nhắc nhở học phí)</option>
                        <option value="Academic">Academic (Lịch thi & Học vụ)</option>
                        <option value="Reminder">Reminder (Nhắc nhở lịch học)</option>
                        <option value="System">System (Hệ thống bảo trì)</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold">Đối tượng nhận <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        value={createForm.targetAudience}
                        onChange={(e) => setCreateForm({ ...createForm, targetAudience: e.target.value })}
                        required
                      >
                        <option value="Entire Center">Toàn trung tâm (Tất cả vai trò)</option>
                        <option value="Parents">Chỉ Phụ huynh học sinh</option>
                        <option value="Students">Chỉ Học sinh</option>
                        <option value="Teachers & TAs">Giáo viên & Trợ giảng</option>
                        <option value="Class 7">Học sinh Lớp 7</option>
                        <option value="Class 8">Học sinh Lớp 8</option>
                        <option value="Class 9">Học sinh Lớp 9</option>
                      </select>
                    </div>

                    <div className="col-md-12">
                      <label className="form-label fw-bold">Tiêu đề thông báo <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ví dụ: Thông báo lịch nghỉ lễ Quốc Khánh và lịch học bù..."
                        value={createForm.title}
                        onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-12">
                      <label className="form-label fw-bold">Nội dung thông báo <span className="text-danger">*</span></label>
                      <textarea
                        className="form-control"
                        rows={5}
                        placeholder="Nhập nội dung thông báo đầy đủ gửi tới các học viên/phụ huynh/giáo viên..."
                        value={createForm.content}
                        onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Hủy bỏ
                  </button>
                  <button type="submit" className="btn btn-primary px-4">
                    <i className="bi bi-send-fill me-1" />
                    Phát hành thông báo
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
