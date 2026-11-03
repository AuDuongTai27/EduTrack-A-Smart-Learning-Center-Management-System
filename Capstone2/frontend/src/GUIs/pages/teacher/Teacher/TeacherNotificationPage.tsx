import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import Pagination from "../../../components/Common/Pagination";
import teachingDAL from "../../../../DAL/teachingDAL";
import type { TeachingNotificationDto } from "../../../../BLL/models/teaching/TeachingNotificationDto";

const DEFAULT_TEACHER_ID = 3; // ThS. Hoàng Quốc Việt

const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  announcement: "Thông báo chung",
  academic: "Học vụ",
  schedule: "Lịch giảng dạy",
  reminder: "Nhắc nhở",
  tuition: "Học phí",
  leave: "Đơn từ & Nghỉ phép",
  system: "Hệ thống",
};

function getTypeLabel(type: string): string {
  const key = (type || "").toLowerCase();
  return NOTIFICATION_TYPE_LABELS[key] || type || "Thông báo";
}

function formatDateShort(dateStr: string, fallback?: string): string {
  if (!dateStr) return fallback || "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return fallback || dateStr;
  return d.toLocaleDateString("vi-VN");
}

function formatDateTimeFull(dateStr: string, fallback?: string): string {
  if (!dateStr) return fallback || "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return fallback || dateStr;
  return d.toLocaleString("vi-VN");
}

export default function TeacherNotificationPage() {
  const [notifications, setNotifications] = useState<TeachingNotificationDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "unread" | "read">("all");
  const [selectedSort, setSelectedSort] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const entriesPerPage = 5;

  const [selectedNotification, setSelectedNotification] =
    useState<TeachingNotificationDto | null>(null);
  const [markingRead, setMarkingRead] = useState<boolean>(false);
  const [markingAllRead, setMarkingAllRead] = useState<boolean>(false);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await teachingDAL.getNotifications(DEFAULT_TEACHER_ID, "all");
      if (res.data) {
        setNotifications(res.data);
        setSelectedNotification((prev) => {
          if (!prev) return null;
          return res.data.find((n) => n.notificationId === prev.notificationId) || null;
        });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không tải được danh sách thông báo giảng dạy."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const availableTypes = useMemo(() => {
    const set = new Set<string>();
    notifications.forEach((n) => {
      if (n.type) set.add(n.type.toLowerCase());
    });
    return Array.from(set);
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase("vi-VN");
    return notifications
      .filter((n) => {
        const matchesQuery =
          !query ||
          [n.title, n.content, n.sender ?? "", n.className ?? ""].some((s) =>
            s.toLocaleLowerCase("vi-VN").includes(query)
          );
        const matchesType =
          selectedType === "all" || (n.type || "").toLowerCase() === selectedType;
        const matchesStatus =
          filterStatus === "all" ||
          (filterStatus === "unread" ? !n.isRead : n.isRead);
        return matchesQuery && matchesType && matchesStatus;
      })
      .sort((a, b) => {
        if (selectedSort === "oldest") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (selectedSort === "title-asc") {
          return a.title.localeCompare(b.title, "vi");
        }
        if (selectedSort === "title-desc") {
          return b.title.localeCompare(a.title, "vi");
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [notifications, searchTerm, selectedType, filterStatus, selectedSort]);

  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredNotifications.slice(start, start + entriesPerPage);
  }, [filteredNotifications, currentPage]);

  const handleMarkItemAsRead = async (notification: TeachingNotificationDto) => {
    if (notification.isRead || markingRead) return;
    setMarkingRead(true);
    try {
      await teachingDAL.markNotificationAsRead(notification.notificationId);
      const updated: TeachingNotificationDto = {
        ...notification,
        isRead: true,
        isNew: false,
      };
      setNotifications((prev) =>
        prev.map((item) =>
          item.notificationId === notification.notificationId ? updated : item
        )
      );
      setSelectedNotification((prev) =>
        prev?.notificationId === notification.notificationId ? updated : prev
      );
      setSuccessMsg("Đã đánh dấu thông báo là đã đọc.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không cập nhật được trạng thái đã đọc."
      );
    } finally {
      setMarkingRead(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || markingAllRead) return;
    setMarkingAllRead(true);
    try {
      await teachingDAL.markAllNotificationsAsRead(DEFAULT_TEACHER_ID);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, isNew: false }))
      );
      setSelectedNotification((prev) =>
        prev ? { ...prev, isRead: true, isNew: false } : null
      );
      setSuccessMsg("Đã đánh dấu tất cả thông báo là đã đọc.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể đánh dấu tất cả thông báo là đã đọc."
      );
    } finally {
      setMarkingAllRead(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Thông Báo Giảng Dạy"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teacher/dashboard" },
          { label: "Thông báo" },
        ]}
      />

      {successMsg && (
        <div
          className="alert alert-success alert-dismissible fade show d-flex align-items-center mb-3"
          role="alert"
        >
          <i className="bi bi-check-circle-fill me-2" />
          <div className="flex-grow-1">{successMsg}</div>
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccessMsg(null)}
            aria-label="Close"
          />
        </div>
      )}

      {error && (
        <div
          className="alert alert-danger d-flex justify-content-between align-items-center mb-3"
          role="alert"
        >
          <span>{error}</span>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => void loadNotifications()}
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Bộ lọc & Tìm kiếm */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white py-3 border-bottom">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
            <div>
              <p className="small text-muted mb-0">
                Xem những thông báo giảng dạy, lịch học và cập nhật gửi đến bạn. Thông báo chưa đọc được đánh dấu rõ ràng.
              </p>
            </div>
            <div className="d-flex align-items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => void handleMarkAllAsRead()}
                  disabled={markingAllRead}
                >
                  <i className="bi bi-check2-all me-1" />
                  {markingAllRead ? "Đang xử lý..." : "Đánh dấu tất cả đã đọc"}
                </button>
              )}
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => void loadNotifications()}
                disabled={loading}
              >
                <i className="bi bi-arrow-clockwise me-1" /> Làm mới
              </button>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-lg-5">
              <input
                className="form-control"
                placeholder="Tìm kiếm thông báo theo tiêu đề, nội dung hoặc người gửi..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="col-lg-3 col-md-4">
              <select
                className="form-select"
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Tất cả phân loại</option>
                {availableTypes.map((type) => (
                  <option key={type} value={type}>
                    {getTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-lg-2 col-md-4">
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value as "all" | "unread" | "read");
                  setCurrentPage(1);
                }}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="unread">Chưa đọc ({unreadCount})</option>
                <option value="read">Đã đọc</option>
              </select>
            </div>
            <div className="col-lg-2 col-md-4">
              <select
                className="form-select"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="title-asc">Tiêu đề A–Z</option>
                <option value="title-desc">Tiêu đề Z–A</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bố cục 2 cột: Danh sách bên trái - Chi tiết bên phải */}
      <div className="row g-4">
        <div className="col-xl-5">
          <div className="card notification-card border-0 shadow-sm h-100">
            <div className="notification-card-header d-flex align-items-center justify-content-between p-3 border-bottom bg-white">
              <div>
                <h5 className="mb-0 fw-bold">Danh sách thông báo</h5>
                <small className="text-muted">
                  {filteredNotifications.length} thông báo
                </small>
              </div>
              {unreadCount > 0 && (
                <span className="badge rounded-pill bg-primary">
                  {unreadCount} chưa đọc
                </span>
              )}
            </div>

            <div
              className="notification-list p-2"
              style={{ maxHeight: 600, overflowY: "auto" }}
            >
              {loading ? (
                <div className="text-center text-muted py-5">
                  <span className="spinner-border spinner-border-sm me-2" />
                  Đang tải thông báo...
                </div>
              ) : paginatedNotifications.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <i className="bi bi-bell-slash fs-2 d-block mb-2" />
                  Không có thông báo nào.
                </div>
              ) : (
                paginatedNotifications.map((n) => {
                  const selected =
                    selectedNotification?.notificationId === n.notificationId;
                  return (
                    <button
                      key={n.notificationId}
                      type="button"
                      onClick={() => setSelectedNotification(n)}
                      className={`notification-item text-start d-block w-100 p-3 mb-2 rounded-3 border ${
                        selected
                          ? "bg-primary-subtle border-primary"
                          : !n.isRead
                          ? "bg-light border-primary-subtle"
                          : "bg-white"
                      }`}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                        <h6
                          className={`mb-0 fw-bold text-truncate ${
                            selected ? "text-primary" : "text-dark"
                          }`}
                          style={{ minWidth: 0, flex: 1 }}
                        >
                          {n.title}
                        </h6>
                        <span
                          className="badge bg-light text-dark border"
                          style={{ flexShrink: 0, whiteSpace: "nowrap" }}
                        >
                          {getTypeLabel(n.type)}
                        </span>
                      </div>
                      <p className="text-muted small mb-2 text-truncate">
                        {n.content}
                      </p>
                      <div className="d-flex justify-content-between text-muted small gap-2">
                        <span className="text-truncate" style={{ minWidth: 0 }}>
                          <i className="bi bi-people me-1" />
                          {n.sender || "Hệ thống"}
                        </span>
                        <span style={{ flexShrink: 0 }}>
                          {formatDateShort(n.createdAt, n.timeAgo)}
                        </span>
                      </div>
                      {!n.isRead && (
                        <span className="badge bg-primary mt-2">Chưa đọc</span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            <div className="p-3 border-top mt-auto bg-white">
              <Pagination
                currentPage={currentPage}
                totalItems={filteredNotifications.length}
                entriesPerPage={entriesPerPage}
                itemLabel="thông báo"
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>

        <div className="col-xl-7">
          <div className="card notification-card border-0 shadow-sm h-100">
            {selectedNotification ? (
              <>
                <div className="notification-preview-header p-4 border-bottom bg-white">
                  <div className="d-flex align-items-start justify-content-between gap-2">
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h4
                        className="mb-1 fw-bold text-dark text-break"
                        style={{
                          overflowWrap: "anywhere",
                          wordBreak: "break-word",
                        }}
                      >
                        {selectedNotification.title}
                      </h4>
                      <small className="text-muted">
                        Thời gian nhận:{" "}
                        {formatDateTimeFull(
                          selectedNotification.createdAt,
                          selectedNotification.timeAgo
                        )}
                      </small>
                    </div>
                    <div
                      className="d-flex align-items-center gap-2"
                      style={{ flexShrink: 0 }}
                    >
                      <span
                        className="badge bg-primary-subtle text-primary border"
                        style={{ whiteSpace: "nowrap" }}
                      >
                        {getTypeLabel(selectedNotification.type)}
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                        onClick={() => setSelectedNotification(null)}
                        title="Đóng chi tiết thông báo"
                      >
                        <i className="bi bi-x-lg" /> Đóng
                      </button>
                    </div>
                  </div>
                </div>

                <div className="notification-preview-body p-4 flex-grow-1">
                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <div className="p-3 bg-light rounded-3 h-100">
                        <small className="d-block text-primary fw-bold mb-2">
                          Người gửi
                        </small>
                        <strong className="text-break">
                          {selectedNotification.sender || "Hệ thống"}
                        </strong>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 bg-light rounded-3 h-100">
                        <small className="d-block text-primary fw-bold mb-2">
                          Phạm vi / Lớp học
                        </small>
                        <strong className="text-break">
                          {selectedNotification.className || "Toàn trung tâm"}
                        </strong>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 bg-light rounded-3 h-100">
                        <small className="d-block text-primary fw-bold mb-2">
                          Trạng thái đọc
                        </small>
                        <strong>
                          {selectedNotification.isRead ? "Đã đọc" : "Chưa đọc"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <h6 className="fw-bold text-dark fs-5 mb-3 border-start border-4 border-primary ps-3">
                    Nội dung thông báo
                  </h6>
                  <div
                    className="p-4 bg-light rounded-3 border text-secondary text-break"
                    style={{
                      whiteSpace: "pre-line",
                      overflowWrap: "anywhere",
                      wordBreak: "break-word",
                      minHeight: 150,
                      lineHeight: 1.7,
                    }}
                  >
                    {selectedNotification.content}
                  </div>
                </div>

                <div className="p-4 border-top bg-light d-flex justify-content-between align-items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setSelectedNotification(null)}
                  >
                    <i className="bi bi-arrow-left me-1" /> Thoát xem chi tiết
                  </button>
                  {!selectedNotification.isRead ? (
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={markingRead}
                      onClick={() => void handleMarkItemAsRead(selectedNotification)}
                    >
                      {markingRead ? "Đang cập nhật..." : "Đánh dấu đã đọc"}
                    </button>
                  ) : (
                    <span className="text-muted small d-inline-flex align-items-center">
                      <i className="bi bi-check2-circle text-success me-1" />
                      Đã xem thông báo này
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-5 text-muted p-4">
                <i className="bi bi-bell fs-1 d-block mb-3" />
                Chọn một thông báo để xem chi tiết.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
