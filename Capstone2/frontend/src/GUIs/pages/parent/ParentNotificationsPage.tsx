import { useEffect, useMemo, useState } from "react";
import Pagination from "../../components/Common/Pagination";
import { LearnerPageLoader } from "../../components/student/common/LearnerPageLoader";
import { useParent } from "../../../contexts/ParentContext";
import { learningDAL, DEFAULT_STUDENT_ID } from "../../../DAL/learningDAL";
import { DEFAULT_PARENT_ID } from "../../../DAL/parentDAL";
import type { LearnerNotificationItemApiDto } from "../../../api/learningApi";

type ParentFilterCategory = "all" | "unread" | "class" | "payment" | "system";

interface ParentNotificationItem {
  id: number;
  category: "payment" | "class" | "system";
  badgeLabel: string;
  sender: string;
  icon: string;
  title: string;
  snippet: string;
  meta: string;
  timestamp: string;
  unread: boolean;
}

interface ParentCategoryStyle {
  label: string;
  badgeBg: string;
  badgeText: string;
  circleBg: string;
  circleText: string;
  tip: string;
}

const PARENT_CATEGORY_STYLES: Record<
  ParentNotificationItem["category"],
  ParentCategoryStyle
> = {
  payment: {
    label: "Học phí & Thanh toán",
    badgeBg: "bg-warning-subtle",
    badgeText: "text-warning-emphasis",
    circleBg: "bg-warning-subtle",
    circleText: "text-warning-emphasis",
    tip: "Quý phụ huynh có thể kiểm tra hóa đơn chi tiết và thanh toán trực tuyến tại mục Học phí trên thanh menu.",
  },
  class: {
    label: "Học tập & Điểm danh",
    badgeBg: "bg-primary-subtle",
    badgeText: "text-primary",
    circleBg: "bg-primary-subtle",
    circleText: "text-primary",
    tip: "Quý phụ huynh có thể theo dõi chuyên cần và điểm số bài tập của con tại mục Tiến độ & Điểm danh.",
  },
  system: {
    label: "Thông báo Trung tâm",
    badgeBg: "bg-info-subtle",
    badgeText: "text-info-emphasis",
    circleBg: "bg-info-subtle",
    circleText: "text-info-emphasis",
    tip: "Thông báo chính thức từ Ban quản lý Trung tâm EduTrack gửi tới Quý phụ huynh.",
  },
};

function mapLearnerDtoToParentItem(
  dto: LearnerNotificationItemApiDto
): ParentNotificationItem {
  let category: ParentNotificationItem["category"] = "system";
  let badgeLabel = "Trung tâm";
  let sender = "Ban Quản lý EduTrack";
  let icon = "bi-megaphone-fill";

  const typeLower = (dto.type || "").toLowerCase();
  if (
    typeLower.includes("tuition") ||
    typeLower.includes("payment") ||
    typeLower.includes("fee")
  ) {
    category = "payment";
    badgeLabel = "Học phí";
    sender = "Phòng Tài vụ EduTrack";
    icon = "bi-wallet2";
  } else if (
    typeLower.includes("class") ||
    typeLower.includes("homework") ||
    typeLower.includes("assignment") ||
    typeLower.includes("schedule") ||
    typeLower.includes("achievement") ||
    typeLower.includes("academic")
  ) {
    category = "class";
    badgeLabel = dto.className || "Lớp học";
    sender = "Giáo viên & Ban đào tạo";
    icon = typeLower.includes("achievement") ? "bi-trophy-fill" : "bi-journal-check";
  }

  let timestamp = "Vừa xong";
  if (dto.createdAt) {
    try {
      const d = new Date(dto.createdAt);
      if (!isNaN(d.getTime())) {
        timestamp = `${String(d.getDate()).padStart(2, "0")}/${String(
          d.getMonth() + 1
        ).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(
          2,
          "0"
        )}:${String(d.getMinutes()).padStart(2, "0")}`;
      }
    } catch {
      timestamp = dto.createdAt;
    }
  }

  return {
    id: dto.notificationId,
    category,
    badgeLabel,
    sender,
    icon,
    title: dto.title,
    snippet: dto.content,
    meta: dto.className ? dto.className : badgeLabel,
    timestamp,
    unread: !dto.isRead,
  };
}

export function ParentNotificationsPage() {
  const { selectedChild, loading: parentLoading } = useParent();
  const targetStudentId = selectedChild?.id || DEFAULT_STUDENT_ID;
  const childName = selectedChild?.name || "Lê Văn An";

  const [notifications, setNotifications] =
    useState<ParentNotificationItem[]>([]);
  const [readIds, setReadIds] = useState<Set<number>>(() =>
    learningDAL.getLocalReadIds()
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] =
    useState<ParentFilterCategory>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedSort, setSelectedSort] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const entriesPerPage = 5;

  const [selectedNotification, setSelectedNotification] =
    useState<ParentNotificationItem | null>(null);
  const [markingRead, setMarkingRead] = useState<boolean>(false);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const list = await learningDAL.getParentNotifications(
        DEFAULT_PARENT_ID,
        targetStudentId
      );
      const localReads = learningDAL.getLocalReadIds(DEFAULT_PARENT_ID);
      setReadIds(localReads);
      const mapped = (list || []).map(mapLearnerDtoToParentItem);
      setNotifications(mapped);
      setSelectedNotification((prev) => {
        if (!prev) return null;
        return mapped.find((n) => n.id === prev.id) || null;
      });
    } catch (err) {
      console.warn("Lỗi khi tải thông báo phụ huynh:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Thông báo phụ huynh – EduTrack";
    setSelectedNotification(null);
    void loadNotifications();
  }, [targetStudentId]);

  const isItemUnread = (item: ParentNotificationItem): boolean =>
    item.unread && !readIds.has(item.id);

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread && !readIds.has(n.id)).length,
    [notifications, readIds]
  );

  const handleMarkRead = async (id: number) => {
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
      await learningDAL.markNotificationRead(id, DEFAULT_PARENT_ID);
      setSuccessMsg("Đã đánh dấu thông báo là đã đọc.");
    } finally {
      setMarkingRead(false);
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
      DEFAULT_PARENT_ID,
      targetStudentId,
      allIds
    );
    setSuccessMsg("Đã đánh dấu đọc tất cả thông báo của phụ huynh.");
  };

  const filteredNotifications = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase("vi-VN");
    const list = notifications.filter((n) => {
      const unread = n.unread && !readIds.has(n.id);
      const matchesCat =
        activeCategory === "all" ||
        (activeCategory === "unread" && unread) ||
        activeCategory === n.category;

      const matchesQuery =
        !query ||
        [n.title, n.snippet, n.meta, n.badgeLabel, n.sender].some((s) =>
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
    ? PARENT_CATEGORY_STYLES[selectedNotification.category]
    : null;
  const selectedIsUnread = selectedNotification
    ? isItemUnread(selectedNotification)
    : false;

  if (parentLoading || (loading && notifications.length === 0)) {
    return (
      <LearnerPageLoader
        title="Đang tải thông báo phụ huynh..."
        message="Hệ thống đang đồng bộ thông báo về học phí và kết quả học tập của con."
        containerClassName="notifications-container"
      />
    );
  }

  return (
    <main className="main-content">
      <div className="content-container notifications-container">
        {/* Header thân thiện dành cho Phụ huynh */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-4 bg-primary-subtle text-primary d-flex align-items-center justify-content-center shadow-xs"
              style={{ width: 52, height: 52, flexShrink: 0 }}
            >
              <i className="bi bi-envelope-paper-heart-fill fs-4" />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <h1 className="h3 fw-bold mb-0 text-dark">
                  Thông báo phụ huynh
                </h1>
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1 rounded-pill fw-semibold">
                  <i className="bi bi-person-heart me-1" />
                  Học sinh: {childName}
                </span>
                {unreadCount > 0 ? (
                  <span className="badge rounded-pill bg-danger px-3 py-1">
                    {unreadCount} chưa đọc
                  </span>
                ) : (
                  <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-3 py-1">
                    Đã xem hết
                  </span>
                )}
              </div>
              <p className="text-muted small mb-0 mt-1">
                Nhận thông tin cập nhật về học phí, chuyên cần và kết quả học tập của con tại trung tâm
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
                <i className="bi bi-check2-all me-1" /> Đánh dấu tất cả đã đọc
              </button>
            )}
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm rounded-pill px-3"
              onClick={() => void loadNotifications()}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise me-1" /> Làm mới
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

        {/* Bộ lọc chủ đề & Tìm kiếm */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-3 p-md-4">
            <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
              {(
                [
                  { key: "all", label: "Tất cả thông báo", icon: "bi-grid-fill" },
                  {
                    key: "unread",
                    label: `Chưa đọc (${unreadCount})`,
                    icon: "bi-envelope-exclamation-fill",
                  },
                  {
                    key: "class",
                    label: "Học tập & Điểm danh",
                    icon: "bi-journal-check",
                  },
                  {
                    key: "payment",
                    label: "Học phí",
                    icon: "bi-wallet2",
                  },
                  {
                    key: "system",
                    label: "Thông báo Trung tâm",
                    icon: "bi-megaphone-fill",
                  },
                ] as { key: ParentFilterCategory; label: string; icon: string }[]
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
                    placeholder="Tìm kiếm theo tiêu đề, học phí, lớp học hoặc nội dung..."
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
                  <option value="newest">Sắp xếp: Mới nhất trước</option>
                  <option value="oldest">Sắp xếp: Cũ nhất trước</option>
                  <option value="title-asc">Tiêu đề: A – Z</option>
                  <option value="title-desc">Tiêu đề: Z – A</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Bố cục 2 cột giống Center Manager nhưng thân thiện hơn cho Phụ huynh */}
        <div className="row g-4">
          {/* Cột trái: Danh sách thông báo */}
          <div className="col-xl-5">
            <div className="card notification-card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
              <div className="notification-card-header d-flex align-items-center justify-content-between p-3 border-bottom bg-white">
                <div>
                  <h5 className="mb-0 fw-bold text-dark">Danh sách thông báo</h5>
                  <small className="text-muted">
                    {filteredNotifications.length} thông báo của {childName}
                  </small>
                </div>
                {unreadCount > 0 && (
                  <span className="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle">
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
                  <div className="text-center text-muted py-5 px-3">
                    <i className="bi bi-bell-slash fs-2 d-block mb-2 text-secondary" />
                    <p className="mb-0 fw-semibold">
                      Không có thông báo nào trong mục này
                    </p>
                    <small>
                      Quý phụ huynh có thể chọn danh mục khác hoặc xóa bộ lọc tìm kiếm.
                    </small>
                  </div>
                ) : (
                  paginatedNotifications.map((item) => {
                    const selected = selectedNotification?.id === item.id;
                    const unread = isItemUnread(item);
                    const style = PARENT_CATEGORY_STYLES[item.category];

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedNotification(item)}
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
                            <i className={`bi ${item.icon} fs-6`} />
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
                                {item.badgeLabel}
                              </span>
                            </div>

                            <p className="text-muted small mb-2 text-truncate">
                              {item.snippet}
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
                                  Chưa đọc
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
                  itemLabel="thông báo"
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
                          <i className={`bi ${selectedNotification.icon} fs-4`} />
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
                            Thời gian gửi: {selectedNotification.timestamp}
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
                          <small className="d-block text-primary fw-bold mb-1">
                            Người gửi
                          </small>
                          <strong className="text-dark text-break">
                            {selectedNotification.sender}
                          </strong>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3 bg-light rounded-3 h-100">
                          <small className="d-block text-primary fw-bold mb-1">
                            Học sinh / Phạm vi
                          </small>
                          <strong className="text-dark text-break">
                            {childName} ({selectedNotification.meta})
                          </strong>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3 bg-light rounded-3 h-100">
                          <small className="d-block text-primary fw-bold mb-1">
                            Trạng thái đọc
                          </small>
                          <strong
                            className={
                              selectedIsUnread ? "text-primary" : "text-success"
                            }
                          >
                            {selectedIsUnread ? "Chưa đọc" : "Đã xem"}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <h6 className="fw-bold text-dark fs-5 mb-3 border-start border-4 border-primary ps-3">
                      Nội dung chi tiết
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
                      {selectedNotification.snippet}
                    </div>

                    <div className="p-3 rounded-3 bg-primary-subtle bg-opacity-50 border border-primary-subtle d-flex align-items-start gap-2 small text-primary-emphasis">
                      <i className="bi bi-info-circle-fill text-primary mt-1" />
                      <span>{selectedStyle.tip}</span>
                    </div>
                  </div>

                  <div className="p-4 border-top bg-light d-flex justify-content-between align-items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary rounded-pill px-3"
                      onClick={() => setSelectedNotification(null)}
                    >
                      <i className="bi bi-arrow-left me-1" /> Thoát xem chi tiết
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
                        {markingRead ? "Đang cập nhật..." : "Đánh dấu đã đọc"}
                      </button>
                    ) : (
                      <span className="text-success small fw-semibold d-inline-flex align-items-center">
                        <i className="bi bi-check-circle-fill me-1" />
                        Quý phụ huynh đã xem thông báo này
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-5 text-muted p-4 my-auto">
                  <i className="bi bi-bell fs-1 d-block mb-3 text-primary" />
                  <h6 className="fw-bold text-dark mb-1">
                    Chọn một thông báo để xem chi tiết
                  </h6>
                  <p className="small mb-0">
                    Quý phụ huynh vui lòng chọn một thông báo ở danh sách bên trái để xem nội dung chi tiết.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ParentNotificationsPage;
