export default function AdminTopBar() {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="mobile-menu-btn"
          id="mobileMenuBtn"
          type="button"
          aria-label="Open menu"
        >
          <i className="bi bi-list" />
        </button>
        <div className="search-box">
          <i className="bi bi-search" />
          <input type="text" placeholder="Search" />
        </div>
      </div>
      <div className="topbar-actions">
        <button className="academic-year-btn" type="button">
          <i className="bi bi-calendar3" />
          <span>Academic Year : 2026 / 2027</span>
        </button>
        <button className="icon-btn" type="button" title="Language">
          <i className="bi bi-globe2" />
        </button>
        <button className="icon-btn" type="button" title="Theme">
          <i className="bi bi-moon-stars" />
        </button>
        <button
          className="icon-btn notification-btn"
          type="button"
          title="Notifications"
        >
          <i className="bi bi-bell" />
          <span className="status-dot" />
        </button>
        <button className="icon-btn" type="button" title="Fullscreen">
          <i className="bi bi-arrows-fullscreen" />
        </button>
        <button className="profile-btn" type="button">
          <span className="profile-avatar">CM</span>
        </button>
      </div>
    </header>
  );
}
