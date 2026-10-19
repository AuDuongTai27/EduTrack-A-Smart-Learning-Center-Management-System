export function TeachingProfilePrimaryInfo() {
  return (
    <div className="d-flex align-items-center gap-3 pb-4 mb-4 border-bottom">
      <div className="profile-avatar-wrap" style={{ width: 80, height: 80 }}>
        <img
          src="/assets/img/profiles/avatar-27.jpg"
          alt="Henriques Morgan"
          className="profile-avatar-img"
        />
      </div>
      <div>
        <div className="d-flex align-items-center gap-2 mb-1">
          <h4 className="mb-0 text-dark fw-bold">Henriques Morgan</h4>
          <span className="badge bg-primary">Teaching Assistant</span>
          <span className="badge bg-primary-subtle text-primary">
            #T594651
          </span>
        </div>
        <p className="text-muted mb-0 small">
          <i className="bi bi-buildings me-1" />
          EduTrack Learning Center
        </p>
      </div>
    </div>
  );
}

export default TeachingProfilePrimaryInfo;
