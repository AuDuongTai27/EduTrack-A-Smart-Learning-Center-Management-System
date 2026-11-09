import { useEffect, useMemo, useState, type FormEvent } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import Pagination from "../../../components/Common/Pagination";
import notificationDAL from "../../../../DAL/notificationDAL";
import { userApi } from "../../../../api/userApi";
import { classApi } from "../../../../api/classApi";
import type { NotificationDto } from "../../../../BLL/models/NotificationDto";
import type { UserDto } from "../../../../BLL/models/UserDto";
import type { ClassDto } from "../../../../BLL/models/ClassDto";
import type {
  NotificationTargetScope,
  NotificationType,
} from "../../../../api/notificationApi";

// Local testing account (Center Manager). Replace with server-side authenticated identity before deployment.
const CENTER_MANAGER_ID = 1;

const NOTIFICATION_TYPES: { value: NotificationType; label: string }[] = [
  { value: "announcement", label: "Announcement (Thông báo chung)" },
  { value: "academic", label: "Academic (Học vụ)" },
  { value: "tuition", label: "Tuition (Học phí)" },
  { value: "reminder", label: "Reminder (Nhắc nhở)" },
  { value: "schedule", label: "Schedule (Lịch học)" },
  { value: "system", label: "System (Hệ thống)" },
];

const RECIPIENT_ROLES = [
  { value: "student", label: "Students (Học sinh)" },
  { value: "teacher", label: "Teachers (Giáo viên)" },
  { value: "teaching_assistant", label: "Teaching Assistants (Trợ giảng)" },
  { value: "parent", label: "Parents (Phụ huynh)" },
  { value: "admin_staff", label: "Admin Staff (Nhân viên giáo vụ)" },
  { value: "center_manager", label: "Center Managers (Quản lý trung tâm)" },
];

type NotificationTab = "sent" | "inbox";
type NewNotificationForm = {
  title: string;
  content: string;
  type: NotificationType;
  targetScope: NotificationTargetScope;
  targetRole: string;
  classId: string;
  userId: string;
};

const emptyForm = (): NewNotificationForm => ({
  title: "",
  content: "",
  type: "announcement",
  targetScope: "all",
  targetRole: "",
  classId: "",
  userId: "",
});

const isActive = (status: string) => status.toLowerCase() === "active";
const hasSupportedRole = (user: UserDto) =>
  (user.roles ?? []).some((role) =>
    RECIPIENT_ROLES.some((allowed) => allowed.value === role.toLowerCase())
  );

export default function CenterManagerNotificationPage() {
  const [activeTab, setActiveTab] = useState<NotificationTab>("inbox");
  const [sentNotifications, setSentNotifications] = useState<NotificationDto[]>([]);
  const [inboxNotifications, setInboxNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 5;

  const [selectedNotification, setSelectedNotification] =
    useState<NotificationDto | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [markingRead, setMarkingRead] = useState(false);
  const [deletingRead, setDeletingRead] = useState(false);

  const [users, setUsers] = useState<UserDto[]>([]);
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [lookupsLoading, setLookupsLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<NewNotificationForm>(emptyForm);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const notifications = activeTab === "sent" ? sentNotifications : inboxNotifications;
  const unreadCount = inboxNotifications.filter((notification) => !notification.isRead).length;


  const loadNotifications = async (tab: NotificationTab) => {
    setLoading(true);
    setError(null);
    try {
      if (tab === "sent") {
        const result = await notificationDAL.getSentNotifications(CENTER_MANAGER_ID);
        setSentNotifications(result.data);
      } else {
        const result = await notificationDAL.getInbox(CENTER_MANAGER_ID);
        setInboxNotifications(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được thông báo từ Backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications(activeTab);
  }, [activeTab]);

  const switchTab = (tab: NotificationTab) => {
    setSelectedNotification(null);
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const loadLookups = async () => {
    setLookupsLoading(true);
    setLookupError(null);
    try {
      const [allUsers, allClasses] = await Promise.all([
        userApi.getAll(),
        classApi.getAll(),
      ]);
      setUsers(allUsers.filter((u) => isActive(u.status) && hasSupportedRole(u)));
      setClasses(allClasses.filter((c) => isActive(c.status)));
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : "Không tải được học sinh hoặc lớp học.");
    } finally {
      setLookupsLoading(false);
    }
  };

  const openCreateModal = () => {
    setCreateForm(emptyForm());
    setUserSearch("");
    setFormError(null);
    setShowCreateModal(true);
    void loadLookups();
  };

  const changeScope = (scope: NotificationTargetScope) => {
    setCreateForm((prev) => ({
      ...prev,
      targetScope: scope,
      targetRole: "",
      classId: "",
      userId: "",
    }));
    setUserSearch("");
    setFormError(null);
  };

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLocaleLowerCase("vi-VN");
    const found = users.filter((u) =>
      u.userId !== CENTER_MANAGER_ID && (!query || [u.fullName, u.userCode, u.email ?? "", u.phone ?? ""]
        .some((value) => value.toLocaleLowerCase("vi-VN").includes(query)))
    );
    return found.slice(0, 30);
  }, [users, userSearch]);

  const selectedUser = users.find((u) => String(u.userId) === createForm.userId);

  const filteredNotifications = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase("vi-VN");
    return notifications
      .filter((n) =>
        (!query || [n.title, n.content].some((s) => s.toLocaleLowerCase("vi-VN").includes(query))) &&
        (selectedType === "all" || n.type.toLowerCase() === selectedType)
      )
      .sort((a, b) => {
        if (selectedSort === "oldest") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (selectedSort === "title-asc") return a.title.localeCompare(b.title);
        if (selectedSort === "title-desc") return b.title.localeCompare(a.title);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [notifications, searchTerm, selectedType, selectedSort]);

  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredNotifications.slice(start, start + entriesPerPage);
  }, [filteredNotifications, currentPage]);

  const scopeLabel = (n: NotificationDto) => {
    switch (n.targetScope) {
      case "all": return "Toàn trung tâm";
      case "role": return RECIPIENT_ROLES.find((r) => r.value === n.targetRole)?.label ?? n.targetRole ?? "Theo vai trò";
      case "class": return n.className ?? `Lớp #${n.classId ?? "?"}`;
      case "user": return "Một người nhận";
      default: return n.className ?? "Thông báo cũ";
    }
  };

  const selectNotification = async (notification: NotificationDto) => {
    setSelectedNotification(notification);
    // Inbox already contains this recipient's own read status. The legacy
    // GET-by-ID endpoint must not overwrite it with notifications.is_read.
    if (activeTab === "inbox") return;
    setLoadingDetail(true);
    try {
      // Sent details are safe to fetch from the shared notification table.
      const detail = await notificationDAL.getNotificationById(notification.notificationId);
      setSelectedNotification(detail);
    } catch {
      // Keep the real list item rather than substituting mock data.
      setSelectedNotification(notification);
    } finally {
      setLoadingDetail(false);
    }
  };

  const sendNotification = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;

    const title = createForm.title.trim();
    const content = createForm.content.trim();
    if (!title || !content) {
      setFormError("Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo.");
      return;
    }
    if (title.length > 200 || content.length > 4000) {
      setFormError("Tiêu đề tối đa 200 ký tự, nội dung tối đa 4000 ký tự.");
      return;
    }
    if (createForm.targetScope === "role" && !createForm.targetRole) {
      setFormError("Vui lòng chọn vai trò người nhận.");
      return;
    }
    if (createForm.targetScope === "class" && !createForm.classId) {
      setFormError("Vui lòng chọn lớp học.");
      return;
    }
    if (createForm.targetScope === "user" && !selectedUser) {
      setFormError("Vui lòng tìm và chọn một người nhận hợp lệ.");
      return;
    }

    // Dữ liệu hợp lệ: gửi ngay, không yêu cầu xác nhận lần hai.
    setSending(true);
    setFormError(null);
    try {
      const created = await notificationDAL.createNotification({
        senderId: CENTER_MANAGER_ID, // Development seed account only; do not use client-supplied IDs for authorization.
        title,
        content,
        type: createForm.type,
        targetScope: createForm.targetScope,
        targetRole: createForm.targetScope === "role" ? createForm.targetRole : null,
        classId: createForm.targetScope === "class" ? Number(createForm.classId) : null,
        userId: createForm.targetScope === "user" ? Number(createForm.userId) : null,
      });
      setSentNotifications((prev) => [created, ...prev.filter((n) => n.notificationId !== created.notificationId)]);
      // Do not automatically navigate away from the Inbox after sending.
      if (activeTab === "sent") {
        setSelectedNotification(created);
        setCurrentPage(1);
        setSearchTerm("");
        setSelectedType("all");
      }
      setShowCreateModal(false);
      setSuccessMsg(`Đã gửi "${created.title}" tới ${created.recipientCount ?? "các"} người nhận.`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Không thể gửi thông báo.");
    } finally {
      setSending(false);
    }
  };

  const markRead = async () => {
    if (!selectedNotification || markingRead || activeTab !== "inbox") return;
    setMarkingRead(true);
    try {
      const updated = await notificationDAL.markAsRead(selectedNotification.notificationId, CENTER_MANAGER_ID);
      setSelectedNotification(updated);
      setInboxNotifications((prev) => prev.map((item) =>
        item.notificationId === updated.notificationId ? { ...item, ...updated } : item
      ));
      setSuccessMsg("Đã đánh dấu thông báo là đã đọc.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không cập nhật được trạng thái đã đọc.");
    } finally {
      setMarkingRead(false);
    }
  };

  const deleteReadFromInbox = async () => {
    if (!selectedNotification || !selectedNotification.isRead || deletingRead || activeTab !== "inbox") return;
    const id = selectedNotification.notificationId;
    setDeletingRead(true);
    setError(null);
    try {
      await notificationDAL.deleteReadFromInbox(id, CENTER_MANAGER_ID);
      // Xóa khỏi hộp thư của tài khoản hiện tại; không xóa thông báo gốc.
      setInboxNotifications((prev) => prev.filter((n) => n.notificationId !== id));
      setSelectedNotification(null);
      setSuccessMsg("Đã xóa thông báo đã đọc khỏi Hộp thư đến.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa thông báo khỏi hộp thư.");
    } finally {
      setDeletingRead(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Notifications & Announcements"
        breadcrumbItems={[
          { label: "Center Manager", path: "/center-manager" },
          { label: "Notifications" },
        ]}
        action={
          <button type="button" className="btn btn-primary d-flex align-items-center shadow-sm" onClick={openCreateModal}>
            <i className="bi bi-plus-square me-2" /> New Notification
          </button>
        }
      />

      {successMsg && (
        <div className="alert alert-success alert-dismissible fade show d-flex align-items-center mb-3" role="alert">
          <i className="bi bi-check-circle-fill me-2" />
          <div className="flex-grow-1">{successMsg}</div>
          {successMsg.startsWith('Đã gửi "') && (
            <button type="button" className="btn btn-sm btn-outline-success me-2 fw-semibold"
              onClick={() => { switchTab("sent"); setSuccessMsg(null); }}>
              <i className="bi bi-send me-1" />Xem đã gửi
            </button>
          )}
          <button type="button" className="btn-close" onClick={() => setSuccessMsg(null)} aria-label="Close" />
        </div>
      )}
      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center mb-3" role="alert">
          <span>{error}</span>
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => void loadNotifications(activeTab)}>Thử lại</button>
        </div>
      )}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white py-3 border-bottom">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
            <div className="d-flex flex-wrap align-items-center gap-2" role="tablist" aria-label="Chế độ xem thông báo">
              <button type="button" role="tab" aria-selected={activeTab === "inbox"}
                className={`btn d-inline-flex align-items-center gap-2 px-3 fw-semibold ${activeTab === "inbox" ? "btn-primary shadow-sm" : "btn-outline-secondary"}`}
                onClick={() => switchTab("inbox")}>
                <i className="bi bi-inbox-fill" /> Hộp thư đến
                {unreadCount > 0 && (
                  <span className={`badge rounded-pill ${activeTab === "inbox" ? "bg-white text-primary" : "bg-primary text-white"}`}>
                    {unreadCount}
                  </span>
                )}
              </button>
              <button type="button" role="tab" aria-selected={activeTab === "sent"}
                className={`btn d-inline-flex align-items-center gap-2 px-3 fw-semibold ${activeTab === "sent" ? "btn-primary shadow-sm" : "btn-outline-secondary"}`}
                onClick={() => switchTab("sent")}>
                <i className="bi bi-send" /> Đã gửi
              </button>
            </div>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => void loadNotifications(activeTab)} disabled={loading}>
              <i className="bi bi-arrow-clockwise me-1" /> Refresh
            </button>
          </div>
          <p className="small text-muted mb-3">
            {activeTab === "inbox"
              ? "Xem những thông báo gửi đến bạn. Thông báo chưa đọc được đánh dấu rõ ràng."
              : "Danh sách thông báo bạn đã phát hành. Hãy kiểm tra kỹ người nhận trước khi gửi mới."}
          </p>
          <div className="row g-3">
            <div className="col-lg-6">
              <input className="form-control" placeholder="Search notifications by title or content..." value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
            </div>
            <div className="col-lg-3 col-md-6">
              <select className="form-select" value={selectedType} onChange={(e) => { setSelectedType(e.target.value); setCurrentPage(1); }}>
                <option value="all">All Types</option>
                {NOTIFICATION_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
              </select>
            </div>
            <div className="col-lg-3 col-md-6">
              <select className="form-select" value={selectedSort} onChange={(e) => setSelectedSort(e.target.value)}>
                <option value="newest">Sort by Newest</option>
                <option value="oldest">Sort by Oldest</option>
                <option value="title-asc">Title A–Z</option>
                <option value="title-desc">Title Z–A</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-xl-5">
          <div className="card notification-card border-0 shadow-sm h-100">
            <div className="notification-card-header d-flex align-items-center justify-content-between p-3 border-bottom bg-white">
              <div>
                <h5 className="mb-0 fw-bold">{activeTab === "sent" ? "Đã gửi" : "Hộp thư đến"}</h5>
                <small className="text-muted">{filteredNotifications.length} thông báo</small>
              </div>
            </div>
            <div className="notification-list p-2" style={{ maxHeight: 600, overflowY: "auto" }}>
              {loading ? (
                <div className="text-center text-muted py-5"><span className="spinner-border spinner-border-sm me-2" />Đang tải thông báo...</div>
              ) : paginatedNotifications.length === 0 ? (
                <div className="text-center text-muted py-5"><i className="bi bi-bell-slash fs-2 d-block mb-2" />Không có thông báo nào.</div>
              ) : paginatedNotifications.map((n) => {
                const selected = selectedNotification?.notificationId === n.notificationId;
                return (
                  <button key={n.notificationId} type="button" onClick={() => void selectNotification(n)}
                    className={`notification-item text-start d-block w-100 p-3 mb-2 rounded-3 border ${selected ? "bg-primary-subtle border-primary" : activeTab === "inbox" && !n.isRead ? "bg-light border-primary-subtle" : "bg-white"}`}
                    style={{ cursor: "pointer" }}>
                    <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                      <h6 className={`mb-0 fw-bold text-truncate ${selected ? "text-primary" : "text-dark"}`}>{n.title}</h6>
                      <span className="badge bg-light text-dark border">{n.type}</span>
                    </div>
                    <p className="text-muted small mb-2 text-truncate">{n.content}</p>
                    <div className="d-flex justify-content-between text-muted small gap-2">
                      <span className="text-truncate">
                        <i className="bi bi-people me-1" />{activeTab === "sent" ? scopeLabel(n) : n.senderName ?? "Hệ thống"}
                      </span>
                      <span>{new Date(n.createdAt).toLocaleDateString("vi-VN")}</span>
                    </div>
                    {activeTab === "inbox" && !n.isRead && <span className="badge bg-primary mt-2">Chưa đọc</span>}
                  </button>
                );
              })}
            </div>
            <div className="p-3 border-top mt-auto bg-white">
              <Pagination currentPage={currentPage} totalItems={filteredNotifications.length} entriesPerPage={entriesPerPage}
                itemLabel="thông báo" onPageChange={setCurrentPage} />
            </div>
          </div>
        </div>

        <div className="col-xl-7">
          <div className="card notification-card border-0 shadow-sm h-100">
            {loadingDetail ? (
              <div className="text-center py-5 text-muted"><span className="spinner-border spinner-border-sm me-2" />Đang tải chi tiết...</div>
            ) : selectedNotification ? (
              <>
                <div className="notification-preview-header p-4 border-bottom bg-white">
                  <div className="d-flex align-items-start justify-content-between gap-2">
                    <h4 className="mb-0 fw-bold text-dark">{selectedNotification.title}</h4>
                    <span className="badge bg-primary-subtle text-primary border">{selectedNotification.type}</span>
                  </div>
                  <small className="text-muted">Created on {new Date(selectedNotification.createdAt).toLocaleString("vi-VN")}</small>
                </div>
                <div className="notification-preview-body p-4 flex-grow-1">
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-3">
                        <small className="d-block text-primary fw-bold mb-2">Người gửi</small>
                        <strong>{selectedNotification.senderName ?? "Hệ thống"}</strong>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-3">
                        <small className="d-block text-primary fw-bold mb-2">{activeTab === "sent" ? "Phạm vi nhận" : "Trạng thái đọc"}</small>
                        <strong>{activeTab === "sent" ? scopeLabel(selectedNotification) : selectedNotification.isRead ? "Đã đọc" : "Chưa đọc"}</strong>
                      </div>
                    </div>
                    {activeTab === "sent" && (
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3">
                          <small className="d-block text-primary fw-bold mb-2">Số người nhận</small>
                          <strong>{selectedNotification.recipientCount ?? "—"}</strong>
                        </div>
                      </div>
                    )}
                  </div>
                  <h6 className="fw-bold text-dark fs-5 mb-3 border-start border-4 border-primary ps-3">Nội dung thông báo</h6>
                  <div className="p-4 bg-light rounded-3 border text-secondary" style={{ whiteSpace: "pre-line", minHeight: 150, lineHeight: 1.7 }}>
                    {selectedNotification.content}
                  </div>
                </div>
                <div className="p-4 border-top bg-light d-flex justify-content-end gap-2">
                  {activeTab === "inbox" && !selectedNotification.isRead && (
                    <button type="button" className="btn btn-primary" disabled={markingRead} onClick={() => void markRead()}>
                      {markingRead ? "Đang cập nhật..." : "Đánh dấu đã đọc"}
                    </button>
                  )}
                  {activeTab === "inbox" && selectedNotification.isRead && (
                    <button type="button" className="btn btn-outline-danger" disabled={deletingRead} onClick={() => void deleteReadFromInbox()}>
                      <i className="bi bi-trash me-1" />{deletingRead ? "Đang xóa..." : "Xóa khỏi hộp thư"}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-5 text-muted p-4"><i className="bi bi-bell fs-1 d-block mb-3" />Chọn một thông báo để xem chi tiết.</div>
            )}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)", overflowY: "auto" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold"><i className="bi bi-megaphone me-2" />Soạn thảo & phát hành thông báo – Center Manager</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCreateModal(false)} disabled={sending} />
              </div>
              <form onSubmit={sendNotification}>
                <div className="modal-body p-4">
                  {formError && <div className="alert alert-danger" role="alert">{formError}</div>}
                  <div className="row g-3">
                    <div className="col-12">
                      <div className="border-start border-4 border-primary ps-3 py-1 mb-1">
                        <h6 className="fs-5 fw-bold text-dark mb-1">1. Thông tin gửi</h6>
                        <p className="small text-muted mb-0">Chọn loại thông báo và đối tượng sẽ nhận.</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold text-dark fs-6 mb-2">Loại thông báo <span className="text-danger">*</span></label>
                      <select className="form-select" value={createForm.type} onChange={(e) => setCreateForm((p) => ({ ...p, type: e.target.value as NotificationType }))} required>
                        {NOTIFICATION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold text-dark fs-6 mb-2">Phạm vi nhận <span className="text-danger">*</span></label>
                      <select className="form-select" value={createForm.targetScope} onChange={(e) => changeScope(e.target.value as NotificationTargetScope)} required>
                        <option value="all">Toàn trung tâm</option>
                        <option value="role">Theo vai trò</option>
                        <option value="class">Theo lớp học</option>
                        <option value="user">Một người cụ thể</option>
                      </select>
                    </div>
                    {createForm.targetScope === "role" && (
                      <div className="col-12">
                        <label className="form-label fw-bold text-dark fs-6 mb-2">Vai trò người nhận <span className="text-danger">*</span></label>
                        <select className="form-select" value={createForm.targetRole} onChange={(e) => setCreateForm((p) => ({ ...p, targetRole: e.target.value }))} required>
                          <option value="">-- Chọn vai trò --</option>
                          {RECIPIENT_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                      </div>
                    )}
                    {createForm.targetScope === "class" && (
                      <div className="col-12">
                        <label className="form-label fw-bold text-dark fs-6 mb-2">Lớp học <span className="text-danger">*</span></label>
                        <select className="form-select" value={createForm.classId} onChange={(e) => setCreateForm((p) => ({ ...p, classId: e.target.value }))} required disabled={lookupsLoading || !!lookupError}>
                          <option value="">-- Chọn lớp đang hoạt động --</option>
                          {classes.map((c) => <option key={c.classId} value={c.classId}>{c.className} · #{c.classId}</option>)}
                        </select>
                      </div>
                    )}
                    {createForm.targetScope === "user" && (
                      <div className="col-12">
                        <label className="form-label fw-bold text-dark fs-6 mb-2">Người nhận <span className="text-danger">*</span></label>
                        {selectedUser ? (
                          <div className="border rounded-3 p-3 d-flex justify-content-between align-items-center gap-3">
                            <div>
                              <strong>{selectedUser.fullName}</strong>
                              <div className="text-muted small">{selectedUser.userCode} · {selectedUser.email ?? "Không có email"}</div>
                            </div>
                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setCreateForm((p) => ({ ...p, userId: "" }))}>Đổi người nhận</button>
                          </div>
                        ) : (
                          <>
                            <input type="search" className="form-control mb-2" value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                              placeholder="Tìm theo tên, mã người dùng, email hoặc SĐT..." disabled={lookupsLoading || !!lookupError} />
                            <div className="list-group" style={{ maxHeight: 180, overflowY: "auto" }}>
                              {filteredUsers.map((u) => (
                                <button key={u.userId} type="button" className="list-group-item list-group-item-action text-start" onClick={() => setCreateForm((p) => ({ ...p, userId: String(u.userId) }))}>
                                  <strong>{u.fullName}</strong><span className="small text-muted ms-2">{u.userCode} · {u.roles?.join(", ")}</span>
                                </button>
                              ))}
                              {!lookupsLoading && !filteredUsers.length && <div className="text-muted small p-2">Không tìm thấy người dùng.</div>}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    {(createForm.targetScope === "class" || createForm.targetScope === "user") && (
                      <div className="col-12">
                        {lookupsLoading && <div className="text-muted small">Đang tải dữ liệu người dùng và lớp học...</div>}
                        {lookupError && <div className="alert alert-warning mb-0">Không tải được danh sách: {lookupError} <button type="button" className="btn btn-link btn-sm" onClick={() => void loadLookups()}>Thử lại</button></div>}
                      </div>
                    )}
                    <div className="col-12">
                      <div className="d-flex align-items-start gap-2 bg-light rounded-3 border px-3 py-2 small text-secondary">
                        <i className="bi bi-people-fill text-primary fs-5" />
                        <span>
                          {createForm.targetScope === "all" && "Thông báo sẽ đến các tài khoản đang hoạt động trong trung tâm, ngoại trừ tài khoản người gửi."}
                          {createForm.targetScope === "role" && (createForm.targetRole ? `Thông báo sẽ đến các tài khoản đang hoạt động thuộc nhóm ${RECIPIENT_ROLES.find((r) => r.value === createForm.targetRole)?.label ?? createForm.targetRole}.` : "Chọn vai trò để xác định người nhận.")}
                          {createForm.targetScope === "class" && (createForm.classId ? `Thông báo sẽ đến những thành viên liên quan đến lớp ${classes.find((c) => String(c.classId) === createForm.classId)?.className ?? createForm.classId}.` : "Chọn lớp để xác định người nhận.")}
                          {createForm.targetScope === "user" && (selectedUser ? `Thông báo sẽ đến ${selectedUser.fullName}.` : "Tìm và chọn người nhận cụ thể.")}
                        </span>
                      </div>
                    </div>
                    <div className="col-12 mt-4">
                      <div className="border-start border-4 border-primary ps-3 py-1 mb-1">
                        <h6 className="fs-5 fw-bold text-dark mb-1">2. Nội dung thông báo</h6>
                        <p className="small text-muted mb-0">Viết tiêu đề ngắn gọn và nội dung dễ hiểu cho người nhận.</p>
                      </div>
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-bold text-dark fs-6 mb-2">Tiêu đề thông báo <span className="text-danger">*</span></label>
                      <input className="form-control" value={createForm.title} maxLength={200} required placeholder="Ví dụ: Thay đổi lịch học tuần tới..."
                        onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))} />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-bold text-dark fs-6 mb-2">Nội dung <span className="text-danger">*</span></label>
                      <textarea className="form-control" rows={5} value={createForm.content} maxLength={4000} required
                        placeholder="Nhập nội dung gửi đến người nhận..."
                        onChange={(e) => setCreateForm((p) => ({ ...p, content: e.target.value }))} />
                      <div className="d-flex justify-content-between form-text"><span>Các thông báo đã gửi sẽ xuất hiện trong mục “Đã gửi”.</span><span>{createForm.content.length}/4000 ký tự</span></div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light justify-content-between gap-3">
                  <div className="small text-muted"><i className="bi bi-info-circle me-1" />Nhấn Gửi thông báo để phát hành ngay.</div>
                  <div className="d-flex align-items-center gap-2">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowCreateModal(false)} disabled={sending}>Hủy bỏ</button>
                  <button type="submit" className="btn btn-primary px-4" disabled={sending}>
                    <i className="bi bi-send me-1" />{sending ? "Đang gửi..." : "Gửi thông báo"}
                  </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
