import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Pagination from "../../components/Common/Pagination";
import { LearnerPageLoader } from "../../components/student/common/LearnerPageLoader";
import type { NotificationItem } from "../../components/student/notifications/notificationsData";
import { NotificationsPreferencesModal } from "../../components/student/notifications/NotificationsPreferencesModal";
import { learningDAL, DEFAULT_STUDENT_ID } from "../../../DAL/learningDAL";

type StudentFilterCategory = "all" | "unread" | "class" | "payment" | "system";

interface CategoryStyle {
  label: string;
  sender: string;
  icon: string;
  badgeBg: string;
  badgeText: string;
  circleBg: string;
  circleText: string;
  tip: string;
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  class: {
    label: "Classes & Assignments",
    sender: "Teachers & Academic Affairs",
    icon: "bi-journal-bookmark-fill",
    badgeBg: "bg-primary-subtle",
    badgeText: "text-primary",
    circleBg: "bg-primary-subtle",
    circleText: "text-primary",
    tip: "Tip: You can visit Classes or Schedule to see material details, makeup classes, and assignment deadlines!",
  },
  payment: {
    label: "Tuition",
    sender: "EduTrack Accounting Office",
    icon: "bi-wallet2",
    badgeBg: "bg-warning-subtle",
    badgeText: "text-warning-emphasis",
    circleBg: "bg-warning-subtle",
    circleText: "text-warning-emphasis",
    tip: "Tip: You or your Parent can check invoice details in the Tuition section on the menu.",
  },
  achievement: {
    label: "Academic Achievement",
    sender: "EduTrack Evaluation System",
    icon: "bi-trophy-fill",
    badgeBg: "bg-success-subtle",
    badgeText: "text-success",
    circleBg: "bg-success-subtle",
    circleText: "text-success",
    tip: "Great job! Keep maintaining attendance and completing assignments on time to achieve even better results.",
  },
  message: {
    label: "Messages from Teacher",
    sender: "Class Teacher",
    icon: "bi-chat-heart-fill",
    badgeBg: "bg-info-subtle",
    badgeText: "text-info-emphasis",
    circleBg: "bg-info-subtle",
    circleText: "text-info-emphasis",
    tip: "Direct message from your teacher. Please prepare lessons before coming to class!",
  },
  system: {
    label: "System & Center",
    sender: "EduTrack Center",
    icon: "bi-shield-check",
    badgeBg: "bg-secondary-subtle",
    badgeText: "text-secondary-emphasis",
    circleBg: "bg-secondary-subtle",
    circleText: "text-secondary-emphasis",
    tip: "Notification from EduTrack learning management system.",
  },
};

function getCategoryStyle(category: string): CategoryStyle {
  return CATEGORY_STYLES[category] || CATEGORY_STYLES.system;
}

export function StudentNotificationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [readIds, setReadIds] = useState<Set<number>>(() =>
    learningDAL.getLocalReadIds(DEFAULT_STUDENT_ID)
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [prefsOpen, setPrefsOpen] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] =
    useState<StudentFilterCategory>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedSort, setSelectedSort] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const entriesPerPage = 5;

  const [selectedNotification, setSelectedNotification] =
    useState<NotificationItem | null>(null);
  const [markingRead, setMarkingRead] = useState<boolean>(false);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const items = await learningDAL.getStudentNotifications(
        DEFAULT_STUDENT_ID
      );
      const localReads = learningDAL.getLocalReadIds(DEFAULT_STUDENT_ID);
      setReadIds(localReads);
      setNotifications(items);
      const paramId = Number(searchParams.get("notificationId"));
      setSelectedNotification((prev) => {
        if (Number.isInteger(paramId) && paramId > 0) {
          const found = items.find((item) => item.id === paramId);
          if (found) return found;
        }
        if (!prev) return items[0] || null;
        return items.find((item) => item.id === prev.id) || null;
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Notifications – EduTrack";
    void loadNotifications();
  }, []);

  const isItemUnread = (item: NotificationItem): boolean =>
    item.unread && !readIds.has(item.id);

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread && !readIds.has(n.id)).length,
    [notifications, readIds]
  );

  const handleMarkRead = async (id: number, silent = false) => {
    if (markingRead) return;
    setMarkingRead(true);
    try {
      setReadIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
      );
      setSelectedNotification((prev) =>
        prev && prev.id === id ? { ...prev, unread: false } : prev
      );
      await learningDAL.markNotificationRead(id, DEFAULT_STUDENT_ID);
      if (!silent) {
        setSuccessMsg("Notification marked as read.");
      }
    } finally {
      setMarkingRead(false);
    }
  };

  const handleSelectNotification = (item: NotificationItem) => {
    setSelectedNotification(item);
    if (searchParams.has("notificationId")) {
      setSearchParams({});
    }
    if (isItemUnread(item)) {
      void handleMarkRead(item.id, true);
    }
  };

  const handleMarkAllRead = async () => {
    const allIds = notifications.map((n) => n.id);
    setReadIds(new Set(allIds));
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    setSelectedNotification((prev) =>
      prev ? { ...prev, unread: false } : null
    );
    await learningDAL.markAllNotificationsRead(
      DEFAULT_STUDENT_ID,
      DEFAULT_STUDENT_ID,
      allIds
    );
    setSuccessMsg("Great! You have marked all notifications as read.");
  };

  const filteredNotifications = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase("vi-VN");
    const list = notifications.filter((n) => {
      const unread = n.unread && !readIds.has(n.id);
      const matchesCat =
        activeCategory === "all" ||
        (activeCategory === "unread" && unread) ||
        (activeCategory === "class" &&
          (n.category === "class" ||
            n.category === "message" ||
            n.category === "achievement")) ||
        (activeCategory === "payment" && n.category === "payment") ||
        (activeCategory === "system" && n.category === "system");

      const matchesQuery =
        !query ||
        [n.title, n.summary, getCategoryStyle(n.category).label].some((s) =>
          s.toLocaleLowerCase("vi-VN").includes(query)
        );

      return matchesCat && matchesQuery;
    });

    return [...list].sort((a, b) => {
      if (selectedSort === "oldest") return a.id - b.id;
      if (selectedSort === "title-asc")
        return a.title.localeCompare(b.title, "vi");
      if (selectedSort === "title-desc")
        return b.title.localeCompare(a.title, "vi");
      return b.id - a.id;
    });
  }, [notifications, readIds, activeCategory, searchTerm, selectedSort]);

  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredNotifications.slice(start, start + entriesPerPage);
  }, [filteredNotifications, currentPage]);

  const selectedStyle = selectedNotification
    ? getCategoryStyle(selectedNotification.category)
    : null;
  const selectedIsUnread = selectedNotification
    ? isItemUnread(selectedNotification)
    : false;

  if (loading && notifications.length === 0) {
    return (
      <LearnerPageLoader
        title="Loading notifications..."
        message="The system is synchronizing your notification inbox."
        containerClassName="notifications-container"
      />
    );
  }

  return (
    <main className="main-content">
      <div className="content-container notifications-container">
        {/* Header thân thiện dành cho Học sinh */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-4 bg-primary-subtle text-primary d-flex align-items-center justify-content-center shadow-xs"
              style={{ width: 52, height: 52, flexShrink: 0 }}
            >
              <i className="bi bi-bell-fill fs-4" />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <h1 className="h3 fw-bold mb-0 text-dark">Notifications</h1>
                {unreadCount > 0 ? (
                  <span className="badge rounded-pill bg-danger px-3 py-1">
                    {unreadCount} new
                  </span>
                ) : (
                  <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-3 py-1">
                    All read
                  </span>
                )}
              </div>
              <p className="text-muted small mb-0 mt-1">
                Updates on assignments, schedule, academic results, and teacher messages
              </p>
            </div>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-semibold"
                onClick={() => void handleMarkAllRead()}
              >
                <i className="bi bi-check2-all me-1" /> Mark all as read
              </button>
            )}
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm rounded-pill px-3"
              onClick={() => void loadNotifications()}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise me-1" /> Refresh
            </button>
            <button
              type="button"
              className="btn btn-light border btn-sm rounded-pill px-3"
              onClick={() => setPrefsOpen(true)}
            >
              <i className="bi bi-sliders me-1" /> Preferences
            </button>
          </div>
        </div>

        {successMsg && (
          <div
            className="alert alert-success alert-dismissible fade show d-flex align-items-center rounded-4 border-0 shadow-xs mb-3"
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

        {/* Thanh tìm kiếm & Bộ lọc chủ đề thân thiện */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-3 p-md-4">
            <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
              {(
                [
                  {
                    key: "all",
                    label: "All",
                    icon: "bi-grid-fill",
                  },
                  {
                    key: "unread",
                    label: `Unread (${unreadCount})`,
                    icon: "bi-envelope-exclamation-fill",
                  },
                  {
                    key: "class",
                    label: "Classes & Assignments",
                    icon: "bi-journal-bookmark-fill",
                  },
                  {
                    key: "payment",
                    label: "Tuition",
                    icon: "bi-wallet2",
                  },
                  {
                    key: "system",
                    label: "System",
                    icon: "bi-shield-check",
                  },
                ] as { key: StudentFilterCategory; label: string; icon: string }[]
              ).map((tab) => {
                const active = activeCategory === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setActiveCategory(tab.key);
                      setCurrentPage(1);
                    }}
                    className={`btn btn-sm rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2 fw-semibold ${
                      active
                        ? "btn-primary shadow-xs"
                        : "btn-light border text-secondary"
                    }`}
                  >
                    <i className={`bi ${tab.icon}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="row g-3">
              <div className="col-lg-8">
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <i className="bi bi-search" />
                  </span>
                  <input
                    className="form-control border-start-0 bg-light"
                    placeholder="Search by subject, assignment, schedule, or notification content..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>
              <div className="col-lg-4">
                <select
                  className="form-select bg-light"
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                >
                  <option value="newest">Sort: Newest first</option>
                  <option value="oldest">Sort: Oldest first</option>
                  <option value="title-asc">Title: A – Z</option>
                  <option value="title-desc">Title: Z – A</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Bố cục 2 cột thân thiện */}
        <div className="row g-4">
          {/* Cột trái: Danh sách thông báo */}
          <div className="col-xl-5">
            <div className="card notification-card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
              <div className="notification-card-header d-flex align-items-center justify-content-between p-3 border-bottom bg-white">
                <div>
                  <h5 className="mb-0 fw-bold text-dark">Learning Inbox</h5>
                  <small className="text-muted">
                    Showing {filteredNotifications.length} notifications
                  </small>
                </div>
                {unreadCount > 0 && (
                  <span className="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle">
                    {unreadCount} unread
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
                    Loading notifications...
                  </div>
                ) : paginatedNotifications.length === 0 ? (
                  <div className="text-center text-muted py-5 px-3">
                    <i className="bi bi-bell-slash fs-2 d-block mb-2 text-secondary" />
                    <p className="mb-0 fw-semibold">
                      No matching notifications found
                    </p>
                    <small>
                      Try changing filters or search keywords.
                    </small>
                  </div>
                ) : (
                  paginatedNotifications.map((item) => {
                    const selected = selectedNotification?.id === item.id;
                    const unread = isItemUnread(item);
                    const style = getCategoryStyle(item.category);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectNotification(item)}
                        className={`notification-item text-start d-block w-100 p-3 mb-2 rounded-3 border transition-all ${
                          selected
                            ? "bg-primary-subtle border-primary shadow-xs"
                            : unread
                            ? "bg-light border-primary-subtle"
                            : "bg-white"
                        }`}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="d-flex align-items-start gap-3">
                          <div
                            className={`rounded-circle d-flex align-items-center justify-content-center ${style.circleBg} ${style.circleText}`}
                            style={{ width: 40, height: 40, flexShrink: 0 }}
                          >
                            <i className={`bi ${style.icon} fs-6`} />
                          </div>

                          <div
                            className="flex-grow-1 overflow-hidden"
                            style={{ minWidth: 0 }}
                          >
                            <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
                              <h6
                                className={`mb-0 fw-bold text-truncate ${
                                  selected ? "text-primary" : "text-dark"
                                }`}
                                style={{ minWidth: 0, flex: 1 }}
                              >
                                {item.title}
                              </h6>
                              <span
                                className={`badge rounded-pill border ${style.badgeBg} ${style.badgeText}`}
                                style={{ flexShrink: 0, whiteSpace: "nowrap" }}
                              >
                                {style.label}
                              </span>
                            </div>

                            <p className="text-muted small mb-2 text-truncate">
                              {item.summary}
                            </p>

                            <div className="d-flex align-items-center justify-content-between text-muted small gap-2">
                              <span className="text-truncate" style={{ minWidth: 0 }}>
                                <i className="bi bi-clock me-1" />
                                {item.timestamp}
                              </span>
                              {unread && (
                                <span
                                  className="badge rounded-pill bg-primary"
                                  style={{ flexShrink: 0 }}
                                >
                                  Unread
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
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
                  itemLabel="notifications"
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          </div>

          {/* Cột phải: Khung đọc chi tiết thông báo */}
          <div className="col-xl-7">
            <div className="card notification-card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
              {selectedNotification && selectedStyle ? (
                <>
                  <div className="notification-preview-header p-4 border-bottom bg-white">
                    <div className="d-flex align-items-start justify-content-between gap-3">
                      <div
                        className="d-flex align-items-start gap-3"
                        style={{ minWidth: 0, flex: 1 }}
                      >
                        <div
                          className={`rounded-4 d-flex align-items-center justify-content-center ${selectedStyle.circleBg} ${selectedStyle.circleText}`}
                          style={{ width: 48, height: 48, flexShrink: 0 }}
                        >
                          <i className={`bi ${selectedStyle.icon} fs-4`} />
                        </div>
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
                            <i className="bi bi-calendar3 me-1" />
                            Received: {selectedNotification.timestamp}
                          </small>
                        </div>
                      </div>

                      <div
                        className="d-flex align-items-center gap-2"
                        style={{ flexShrink: 0 }}
                      >
                        <span
                          className={`badge rounded-pill border px-3 py-2 ${selectedStyle.badgeBg} ${selectedStyle.badgeText}`}
                          style={{ whiteSpace: "nowrap" }}
                        >
                          {selectedStyle.label}
                        </span>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary rounded-pill px-3 d-inline-flex align-items-center gap-1"
                          onClick={() => setSelectedNotification(null)}
                          title="Close notification details"
                        >
                          <i className="bi bi-x-lg" /> Close
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="notification-preview-body p-4 flex-grow-1">
                    <div className="row g-3 mb-4">
                      <div className="col-md-4">
                        <div className="p-3 bg-light rounded-3 h-100">
                          <small className="d-block text-primary fw-bold mb-1">
                            Sender
                          </small>
                          <strong className="text-dark text-break">
                            {selectedStyle.sender}
                          </strong>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3 bg-light rounded-3 h-100">
                          <small className="d-block text-primary fw-bold mb-1">
                            Category
                          </small>
                          <strong className="text-dark text-break">
                            {selectedStyle.label}
                          </strong>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3 bg-light rounded-3 h-100">
                          <small className="d-block text-primary fw-bold mb-1">
                            Read Status
                          </small>
                          <strong
                            className={
                              selectedIsUnread ? "text-primary" : "text-success"
                            }
                          >
                            {selectedIsUnread ? "Unread" : "Read"}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <h6 className="fw-bold text-dark fs-5 mb-3 border-start border-4 border-primary ps-3">
                      Notification Content
                    </h6>
                    <div
                      className="p-4 bg-light rounded-4 border text-dark text-break mb-3"
                      style={{
                        whiteSpace: "pre-line",
                        overflowWrap: "anywhere",
                        wordBreak: "break-word",
                        minHeight: 150,
                        lineHeight: 1.75,
                      }}
                    >
                      {selectedNotification.summary}
                    </div>

                    <div className="p-3 rounded-3 bg-primary-subtle bg-opacity-50 border border-primary-subtle d-flex align-items-start gap-2 small text-primary-emphasis">
                      <i className="bi bi-lightbulb-fill text-primary mt-1" />
                      <span>{selectedStyle.tip}</span>
                    </div>
                  </div>

                  <div className="p-4 border-top bg-light d-flex justify-content-between align-items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary rounded-pill px-3"
                      onClick={() => setSelectedNotification(null)}
                    >
                      <i className="bi bi-arrow-left me-1" /> Close Details
                    </button>
                    {selectedIsUnread ? (
                      <button
                        type="button"
                        className="btn btn-primary rounded-pill px-4"
                        disabled={markingRead}
                        onClick={() =>
                          void handleMarkRead(selectedNotification.id)
                        }
                      >
                        <i className="bi bi-check2-circle me-1" />
                        {markingRead ? "Updating..." : "Mark as Read"}
                      </button>
                    ) : (
                      <span className="text-success small fw-semibold d-inline-flex align-items-center">
                        <i className="bi bi-check-circle-fill me-1" />
                        You have read this notification
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-5 text-muted p-4 my-auto">
                  <i className="bi bi-bell fs-1 d-block mb-3 text-primary" />
                  <h6 className="fw-bold text-dark mb-1">
                    Select a notification to view details
                  </h6>
                  <p className="small mb-0">
                    Click on any notification in the left list to read its full content!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Tùy chỉnh thông báo */}
      <NotificationsPreferencesModal
        isOpen={prefsOpen}
        onClose={() => setPrefsOpen(false)}
      />
    </main>
  );
}

export default StudentNotificationsPage;
