export default function NotificationEmptyState() {
  return <div className="ntf-empty" role="status">
    <svg className="ntf-empty-icon" aria-hidden="true" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="9" /><path d="m7.5 12 3 3 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <h6>Bạn đã đọc hết thông báo</h6>
    <p>Không có thông báo mới nào chưa đọc vào lúc này.</p>
  </div>;
}
