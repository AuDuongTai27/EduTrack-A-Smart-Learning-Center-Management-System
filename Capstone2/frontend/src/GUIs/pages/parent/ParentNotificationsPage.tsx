import React, { useState } from 'react';
import { useParent } from '../../../contexts/ParentContext';
import type { NotifTabType } from '../../components/student/notifications/NotificationsFilterTabs';
import { NotificationsFilterTabs } from '../../components/student/notifications/NotificationsFilterTabs';

interface ParentNotificationItem {
  id: number;
  category: 'payment' | 'class' | 'system';
  badgeLabel: string;
  badgeClass: string;
  icon: string;
  title: string;
  snippet: string;
  meta: string;
  timestamp: string;
  unread: boolean;
}

const INITIAL_PARENT_NOTIFS: ParentNotificationItem[] = [
  {
    id: 1,
    category: 'payment',
    badgeLabel: 'Học phí',
    badgeClass: 'badge-tuition',
    icon: 'bi-wallet2',
    title: 'Thông báo học phí kỳ mới tháng 10/2026',
    snippet:
      'Hóa đơn học phí kỳ 2 cho học sinh Nguyễn Minh Anh đã được phát hành. Quý phụ huynh vui lòng hoàn thành trước ngày 25/10/2026.',
    meta: 'Học phí · 2.400.000 ₫',
    timestamp: 'Hôm nay, 08:30',
    unread: true,
  },
  {
    id: 2,
    category: 'class',
    badgeLabel: 'Lớp học',
    badgeClass: 'badge-attendance',
    icon: 'bi-check-circle',
    title: 'Ghi nhận điểm danh buổi học Toán Nâng Cao',
    snippet:
      'Học sinh Nguyễn Minh Anh đã có mặt đúng giờ tại phòng P.201. Giáo viên đánh giá con tích cực tham gia phát biểu.',
    meta: 'Điểm danh · Toán Nâng Cao',
    timestamp: 'Hôm qua, 17:05',
    unread: true,
  },
  {
    id: 3,
    category: 'system',
    badgeLabel: 'Trung tâm',
    badgeClass: 'badge-notice',
    icon: 'bi-megaphone',
    title: 'Thông báo lịch nghỉ lễ và học bù của trung tâm',
    snippet:
      'EduTrack xin gửi tới Quý phụ huynh kế hoạch nghỉ lễ Quốc khánh và lịch học bù của các lớp trong tuần tới.',
    meta: 'Thông báo chung',
    timestamp: '3 ngày trước',
    unread: false,
  },
  {
    id: 4,
    category: 'class',
    badgeLabel: 'Đánh giá',
    badgeClass: 'badge-assignment',
    icon: 'bi-star',
    title: 'Báo cáo định kỳ tháng 9 từ Thầy Nguyễn Văn An',
    snippet:
      'Thầy An đã cập nhật phiếu nhận xét học tập tháng 9 cho con. Quý phụ huynh có thể vào mục Tiến độ để xem chi tiết.',
    meta: 'Nhận xét giáo viên',
    timestamp: '1 tuần trước',
    unread: false,
  },
];

export function ParentNotificationsPage() {
  const { selectedChild } = useParent();
  const [activeTab, setActiveTab] = useState<NotifTabType>('All');
  const [readIds, setReadIds] = useState<Set<number>>(new Set());

  const getUnreadCount = (): number => {
    return INITIAL_PARENT_NOTIFS.filter((n) => n.unread && !readIds.has(n.id)).length;
  };

  const handleMarkRead = (id: number) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const handleMarkAllRead = () => {
    setReadIds(new Set(INITIAL_PARENT_NOTIFS.map((n) => n.id)));
  };

  const filtered = INITIAL_PARENT_NOTIFS.filter((n) => {
    const isUnread = n.unread && !readIds.has(n.id);
    if (activeTab === 'Unread') return isUnread;
    if (activeTab === 'Class') return n.category === 'class';
    if (activeTab === 'System') return n.category === 'system' || n.category === 'payment';
    return true;
  });

  const unreadCount = getUnreadCount();

  return (
    <main className="main-content">
      <div className="content-container notifications-container">
        {/* Header */}
        <div className="page-header d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <h1 className="page-title mb-1">Thông báo phụ huynh</h1>
            <p className="page-subtitle text-muted mb-0">
              Nhận thông tin cập nhật về học phí, điểm danh và hoạt động học tập của con
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                className="btn btn-sm btn-outline-primary rounded-pill px-3"
                onClick={handleMarkAllRead}
              >
                <i className="bi bi-check2-all me-1"></i> Đánh dấu đã đọc tất cả
              </button>
            )}
            {selectedChild && (
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fw-semibold">
                {selectedChild.name}
              </span>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <NotificationsFilterTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          unreadCount={unreadCount}
        />

        {/* List */}
        <div className="notifications-list mt-3">
          {filtered.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-bell-slash fs-1 d-block mb-2 opacity-50"></i>
              <p>Không có thông báo nào trong mục này.</p>
            </div>
          ) : (
            filtered.map((item) => {
              const isUnread = item.unread && !readIds.has(item.id);
              return (
                <div
                  key={item.id}
                  className={`notif-card card border-0 shadow-xs rounded-4 p-3 mb-2.5 transition-all ${
                    isUnread ? 'bg-primary-subtle bg-opacity-25 border-start border-4 border-primary' : 'bg-white'
                  }`}
                  onClick={() => handleMarkRead(item.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-start gap-3">
                    <div
                      className={`notif-icon-circle rounded-circle d-flex align-items-center justify-content-center ${
                        item.category === 'payment'
                          ? 'bg-warning text-dark'
                          : item.category === 'class'
                          ? 'bg-primary text-white'
                          : 'bg-info text-white'
                      }`}
                      style={{ width: '40px', height: '40px', flexShrink: 0 }}
                    >
                      <i className={`bi ${item.icon} fs-5`}></i>
                    </div>

                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <h4 className="h6 fw-bold mb-0 text-dark">{item.title}</h4>
                        <small className="text-muted">{item.timestamp}</small>
                      </div>
                      <p className="small text-secondary mb-2">{item.snippet}</p>
                      <div className="d-flex align-items-center gap-2 small">
                        <span className="badge bg-light text-secondary border">
                          {item.meta}
                        </span>
                        {isUnread && (
                          <span className="badge bg-danger rounded-pill">Mới</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
};

export default ParentNotificationsPage;
