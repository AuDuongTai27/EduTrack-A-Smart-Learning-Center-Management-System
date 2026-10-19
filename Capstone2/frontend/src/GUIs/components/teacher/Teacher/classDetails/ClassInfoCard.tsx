export default function ClassInfoCard() {
  return (
    <div className="card class-list-card border-0 mb-4">
      <div className="card-body p-4">
        <div className="row g-4 align-items-center">
          <div className="col-6 col-lg-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="avatar-box rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: 48, height: 48, backgroundColor: "#ede8ff", color: "#5d3fd3" }}
              >
                <i className="bi bi-mortarboard-fill fs-4" />
              </div>
              <div>
                <span className="text-muted small d-block">Class Name</span>
                <h4 className="fw-bold mb-0 text-dark">Class I-A</h4>
              </div>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="avatar-box rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: 48, height: 48, backgroundColor: "#e0f2fe", color: "#0284c7" }}
              >
                <i className="bi bi-journal-bookmark-fill fs-4" />
              </div>
              <div>
                <span className="text-muted small d-block">Subject</span>
                <h4 className="fw-bold mb-0 text-dark">Physics</h4>
              </div>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="avatar-box rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: 48, height: 48, backgroundColor: "#dcfce7", color: "#166534" }}
              >
                <i className="bi bi-person-badge-fill fs-4" />
              </div>
              <div>
                <span className="text-muted small d-block">Teacher</span>
                <h6 className="fw-bold mb-0 text-dark">Henriques Morgan</h6>
              </div>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="avatar-box rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: 48, height: 48, backgroundColor: "#fef3c7", color: "#d97706" }}
              >
                <i className="bi bi-person-workspace fs-4" />
              </div>
              <div>
                <span className="text-muted small d-block">Teaching Assistant</span>
                <h6 className="fw-bold mb-0 text-dark">Sarah Jenkins</h6>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
