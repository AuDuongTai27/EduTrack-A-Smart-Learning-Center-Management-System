import { Link } from "react-router-dom";
import PageHeader from "../../../components/Common/PageHeader";
import KpiCard from "../../../components/Common/KpiCard";

export default function CenterManagerDashboardPage() {
  return (
    <>
      {/* Breadcrumb and Quick Access */}
      <PageHeader
        title="Center Manager Dashboard"
        breadcrumbItems={[
          { label: "Center Manager", path: "/center-manager" },
          { label: " Dashboard" },
        ]}
        action={
          <div className="d-flex my-xl-auto right-content align-items-center flex-wrap gap-2">
            <div className="mb-2">
              <Link
                to="/center-manager/student/add-student"
                className="btn btn-primary d-flex align-items-center"
              >
                <i className="bi bi-plus-square me-2" />
                Add Student
              </Link>
            </div>
            <div className="mb-2">
              <Link
                to="/center-manager/tuition/tuition-detail"
                className="btn btn-outline-primary d-flex align-items-center"
              >
                <i className="bi bi-cash-stack me-2" />
                Tuition Details
              </Link>
            </div>
          </div>
        }
      />

      {/* Popup News and Hello Account */}
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="alert-message">
            <div
              className="alert alert-success rounded-pill d-flex align-items-center justify-content-between border-success mb-4"
              role="alert"
            >
              <div className="d-flex align-items-center">
                <span className="me-1 avatar avatar-sm flex-shrink-0">
                  <img
                    src="assets/img/profiles/avatar-27.jpg"
                    alt="Img"
                    className="img-fluid rounded-circle"
                  />
                </span>
                <p className="mb-0">
                  Fahed III,C has paid Fees for the
                  <strong className="mx-1">“Term1”</strong>
                </p>
              </div>
              <button
                type="button"
                className="btn-close p-0"
                data-bs-dismiss="alert"
                aria-label="Close"
              >
                <span>
                  <i className="bi bi-x" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Dashboard KPI Cards */}
      <div className="dashboard-kpis mb-4">
        {/* Active Students */}
        <KpiCard
          type="student"
          status="active"
          title="Active Students"
          value={3654}
          footerValue="2.4%"
          footerLabel="this month"
          trend="up"
        />

        {/* Active Classes */}
        <KpiCard
          type="class"
          title="Active Classes"
          value={24}
          footerValue={6}
          footerLabel="classes today"
        />

        {/* Active Staff */}
        <KpiCard
          type="staff"
          title="Active Staff"
          value={42}
          footerValue="Teachers, TAs & Staff"
        />

        {/* Tuition Collected */}
        <KpiCard
          type="tuition"
          status="collected"
          title="Tuition Collected"
          value="485M"
          footerValue="8.2%"
          footerLabel="this month"
          trend="up"
        />

        {/* Outstanding Tuition */}
        <KpiCard
          type="tuition"
          status="overdue"
          title="Outstanding Tuition"
          value="72M"
          footerLabel="Overdue"
          footerValue="18M"
          footerLayout="between"
        />
      </div>
      {/* Welcome */}
      <div className="card dashboard-welcome mb-4">
        <div className="card-body d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            <h4 className="mb-1 text-white">Welcome back, Center Manager</h4>
            <p className="mb-0">Here is today's center overview.</p>
          </div>
          <div className="welcome-date">
            <i className="bi bi-calendar3 me-2" />
            17 August 2026
          </div>
        </div>
      </div>
      {/* Dashboard Charts */}
      <div className="row g-4 mb-4">
        {/* Tuition Overview */}
        <div className="col-xl-6 d-flex">
          <div className="card dashboard-card flex-fill">
            <div className="card-header dashboard-card-header d-flex align-items-center justify-content-between">
              <div>
                <h5 className="mb-1">Tuition Overview</h5>
                <small className="text-muted">
                  Collected and outstanding tuition
                </small>
              </div>
              <select className="form-select form-select-sm chart-filter">
                <option>This Month</option>
                <option>Last Month</option>
                <option>This Week</option>
              </select>
            </div>
            <div className="card-body dashboard-card-body">
              <div className="chart-container">
                <canvas id="tuitionChart" />
              </div>
            </div>
          </div>
        </div>
        {/* Notice Board */}
        <div className="col-xl-6 d-flex">
          <div className="card dashboard-card flex-fill">
            <div className="card-header dashboard-card-header d-flex align-items-center justify-content-between">
              <div>
                <h5 className="mb-1">Notice Board</h5>
                <small className="text-muted">
                  Latest announcements and updates
                </small>
              </div>
              <Link
                to="/center-manager/notification/notice-board"
                className="dashboard-view-all"
              >
                View All
              </Link>
            </div>
            <div className="card-body dashboard-card-body">
              <div className="notice-list">
                {/* Notice 1 */}
                <div className="notice-item">
                  <div className="notice-icon bg-primary-subtle text-primary">
                    <i className="bi bi-book" />
                  </div>
                  <div className="notice-content">
                    <h6 className="mb-1">New Syllabus Instructions</h6>
                    <p className="mb-0 text-muted">
                      <i className="bi bi-calendar3 me-1" />
                      Added on : 11 Mar 2024
                    </p>
                  </div>
                  <span className="notice-day">20 Days</span>
                </div>
                {/* Notice 2 */}
                <div className="notice-item">
                  <div className="notice-icon bg-success-subtle text-success">
                    <i className="bi bi-megaphone" />
                  </div>
                  <div className="notice-content">
                    <h6 className="mb-1">World Environment Day Program</h6>
                    <p className="mb-0 text-muted">
                      <i className="bi bi-calendar3 me-1" />
                      Added on : 21 Apr 2024
                    </p>
                  </div>
                  <span className="notice-day">15 Days</span>
                </div>
                {/* Notice 3 */}
                <div className="notice-item">
                  <div className="notice-icon bg-danger-subtle text-danger">
                    <i className="bi bi-bell" />
                  </div>
                  <div className="notice-content">
                    <h6 className="mb-1">Exam Preparation Notification</h6>
                    <p className="mb-0 text-muted">
                      <i className="bi bi-calendar3 me-1" />
                      Added on : 13 Mar 2024
                    </p>
                  </div>
                  <span className="notice-day">12 Days</span>
                </div>
                {/* Notice 4 */}
                <div className="notice-item">
                  <div className="notice-icon bg-info-subtle text-info">
                    <i className="bi bi-laptop" />
                  </div>
                  <div className="notice-content">
                    <h6 className="mb-1">Online Classes Preparation</h6>
                    <p className="mb-0 text-muted">
                      <i className="bi bi-calendar3 me-1" />
                      Added on : 24 May 2024
                    </p>
                  </div>
                  <span className="notice-day">02 Days</span>
                </div>
                {/* Notice 5 */}
                <div className="notice-item">
                  <div className="notice-icon bg-warning-subtle text-warning">
                    <i className="bi bi-calendar-event" />
                  </div>
                  <div className="notice-content">
                    <h6 className="mb-1">Exam Time Table Release</h6>
                    <p className="mb-0 text-muted">
                      <i className="bi bi-calendar3 me-1" />
                      Added on : 24 May 2024
                    </p>
                  </div>
                  <span className="notice-day">06 Days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
