import PageHeader from "../../../components/Common/PageHeader";

export default function AdminStaffTeachingMonitoring() {
  return (
    <>
      {/* Breadcrumb and Quick Access */}
      <PageHeader
        title="Teaching Monitoring"
        breadcrumbItems={[
          { label: "Admin Staff", path: "/admin-staff" },
          { label: "Teaching Monitoring" },
        ]}
      />
      {/* Monitoring Filters */}
      <div className="card user-list-card mb-4">
        <div className="card-header user-list-header">
          <div className="row g-3 align-items-center">
            {/* Time Range */}
            <div className="col-xl col-lg-4 col-md-6">
              <select className="form-select">
                <option>Today</option>
                <option>This Week</option>
                <option selected>This Month</option>
                <option>Last Month</option>
                <option>This Semester</option>
              </select>
            </div>
            {/* Class */}
            <div className="col-xl col-lg-4 col-md-6">
              <select className="form-select">
                <option selected>All Classes</option>
                <option>Class 7</option>
                <option>Class 8</option>
                <option>Class 9</option>
              </select>
            </div>
            {/* Subject */}
            <div className="col-xl col-lg-4 col-md-6">
              <select className="form-select">
                <option selected>All Subjects</option>
                <option>Mathematics</option>
                <option>Physics</option>
                <option>Chemistry</option>
                <option>English</option>
                <option>Biology</option>
              </select>
            </div>
            {/* Teacher */}
            <div className="col-xl col-lg-4 col-md-6">
              <select className="form-select">
                <option selected>All Teachers</option>
                <option>Nguyen Van An</option>
                <option>Tran Minh Hoa</option>
                <option>Le Thu Trang</option>
                <option>Pham Minh Duc</option>
              </select>
            </div>
            {/* Attention Status */}
            <div className="col-xl col-lg-4 col-md-6">
              <select className="form-select">
                <option selected>All Statuses</option>
                <option>Good</option>
                <option>Needs Attention</option>
                <option>Critical</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      {/* Monitoring Tabs */}
      <div className="card monitoring-card">
        <div className="monitoring-tabs">
          <ul className="nav nav-tabs" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className="nav-link active"
                data-bs-toggle="tab"
                data-bs-target="#teacher-monitoring"
                type="button"
              >
                By Teacher
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className="nav-link"
                data-bs-toggle="tab"
                data-bs-target="#class-subject-monitoring"
                type="button"
              >
                By Class &amp; Subject
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className="nav-link"
                data-bs-toggle="tab"
                data-bs-target="#student-progress"
                type="button"
              >
                Student Progress
              </button>
            </li>
          </ul>
        </div>
        <div className="tab-content">
          {/* By Teacher */}
          <div className="tab-pane fade show active" id="teacher-monitoring">
            <div className="monitoring-tab-header">
              <div>
                <h5>Teacher Activity</h5>
                <p>Teaching activity summary for August 2026.</p>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table user-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Teacher</th>
                    <th>Class &amp; Subject</th>
                    <th>Scheduled</th>
                    <th>Completed</th>
                    <th>Attendance Recorded</th>
                    <th>Assignments</th>
                    <th>Avg. Attendance</th>
                    <th>Status</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>
                      <strong>Nguyen Van An</strong>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        <span className="specialty-badge">Mathematics - 7</span>
                        <span className="specialty-badge">Mathematics - 8</span>
                      </div>
                    </td>
                    <td>16</td>
                    <td>14</td>
                    <td>14</td>
                    <td>8</td>
                    <td>
                      <strong>94%</strong>
                    </td>
                    <td>
                      <span className="monitoring-status monitoring-good">
                        Good
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        className="btn table-action-btn"
                        title="View Details"
                      >
                        <i className="bi bi-eye" />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>
                      <strong>Tran Minh Hoa</strong>
                    </td>
                    <td>
                      <span className="specialty-badge"> Physics - 8 </span>
                    </td>
                    <td>14</td>
                    <td>12</td>
                    <td>10</td>
                    <td>5</td>
                    <td>
                      <strong>81%</strong>
                    </td>
                    <td>
                      <span className="monitoring-status monitoring-attention">
                        Needs Attention
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        className="btn table-action-btn"
                        title="View Details"
                      >
                        <i className="bi bi-eye" />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td>
                      <strong>Le Thu Trang</strong>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        <span className="specialty-badge"> English - 7 </span>
                        <span className="specialty-badge"> English - 9 </span>
                      </div>
                    </td>
                    <td>18</td>
                    <td>17</td>
                    <td>17</td>
                    <td>10</td>
                    <td>
                      <strong>92%</strong>
                    </td>
                    <td>
                      <span className="monitoring-status monitoring-good">
                        Good
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        className="btn table-action-btn"
                        title="View Details"
                      >
                        <i className="bi bi-eye" />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td>4</td>
                    <td>
                      <strong>Pham Minh Duc</strong>
                    </td>
                    <td>
                      <span className="specialty-badge"> Chemistry - 9 </span>
                    </td>
                    <td>15</td>
                    <td>11</td>
                    <td>8</td>
                    <td>3</td>
                    <td>
                      <strong>69%</strong>
                    </td>
                    <td>
                      <span className="monitoring-status monitoring-critical">
                        Critical
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        className="btn table-action-btn"
                        title="View Details"
                      >
                        <i className="bi bi-eye" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          {/* By Class & Subject */}
          <div className="tab-pane fade" id="class-subject-monitoring">
            <div className="monitoring-tab-header">
              <div>
                <h5>Class &amp; Subject Activity</h5>
                <p>Monitor learning activities for each class subject.</p>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table user-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Class &amp; Subject</th>
                    <th>Teacher</th>
                    <th>Teaching Assistant</th>
                    <th>Students</th>
                    <th>Sessions Completed</th>
                    <th>Attendance Rate</th>
                    <th>Assignment Completion</th>
                    <th>Status</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>
                      <strong>Mathematics - 7</strong>
                    </td>
                    <td>Nguyen Van An</td>
                    <td>Le Minh Khoa</td>
                    <td>25</td>
                    <td>14</td>
                    <td>
                      <strong>95%</strong>
                    </td>
                    <td>
                      <strong>91%</strong>
                    </td>
                    <td>
                      <span className="monitoring-status monitoring-good">
                        Good
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        className="btn table-action-btn"
                        title="View Details"
                      >
                        <i className="bi bi-eye" />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>
                      <strong>Physics - 8</strong>
                    </td>
                    <td>Tran Minh Hoa</td>
                    <td>Nguyen Thanh Nam</td>
                    <td>28</td>
                    <td>12</td>
                    <td>
                      <strong>82%</strong>
                    </td>
                    <td>
                      <strong>75%</strong>
                    </td>
                    <td>
                      <span className="monitoring-status monitoring-attention">
                        Needs Attention
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        className="btn table-action-btn"
                        title="View Details"
                      >
                        <i className="bi bi-eye" />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td>
                      <strong>English - 9</strong>
                    </td>
                    <td>Le Thu Trang</td>
                    <td>Tran Gia Bao</td>
                    <td>24</td>
                    <td>17</td>
                    <td>
                      <strong>92%</strong>
                    </td>
                    <td>
                      <strong>89%</strong>
                    </td>
                    <td>
                      <span className="monitoring-status monitoring-good">
                        Good
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        className="btn table-action-btn"
                        title="View Details"
                      >
                        <i className="bi bi-eye" />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td>4</td>
                    <td>
                      <strong>Chemistry - 9</strong>
                    </td>
                    <td>Pham Minh Duc</td>
                    <td>Hoang Gia Huy</td>
                    <td>23</td>
                    <td>11</td>
                    <td>
                      <strong>68%</strong>
                    </td>
                    <td>
                      <strong>62%</strong>
                    </td>
                    <td>
                      <span className="monitoring-status monitoring-critical">
                        Critical
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        className="btn table-action-btn"
                        title="View Details"
                      >
                        <i className="bi bi-eye" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          {/* Student Progress */}
          <div className="tab-pane fade" id="student-progress">
            <div className="monitoring-tab-header">
              <div>
                <h5>Student Progress</h5>
                <p>Identify classes and students that require attention.</p>
              </div>
            </div>
            {/* Progress Chart */}
            <div className="p-3 border-bottom">
              <div className="card dashboard-card">
                <div className="dashboard-card-header">
                  <div>
                    <h5>Classes Requiring Attention</h5>
                    <small>Average learning performance by class subject</small>
                  </div>
                </div>
                <div className="dashboard-card-body">
                  <div className="student-progress-chart">
                    <canvas id="studentProgressChart" />
                  </div>
                </div>
              </div>
            </div>
            {/* Students Requiring Attention */}
            <div className="monitoring-subsection-header">
              <div>
                <h5>Students Requiring Attention</h5>
                <p>Students with low attendance or incomplete assignments.</p>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table user-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Student</th>
                    <th>Class &amp; Subject</th>
                    <th>Attendance Rate</th>
                    <th>Incomplete Assignments</th>
                    <th>Learning Status</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>
                      <strong>Le Minh Long</strong>
                    </td>
                    <td>
                      <span className="specialty-badge"> Physics - 9 </span>
                    </td>
                    <td>
                      <strong className="text-danger">62%</strong>
                    </td>
                    <td>4</td>
                    <td>
                      <span className="monitoring-status monitoring-critical">
                        Critical
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        className="btn table-action-btn"
                        title="View Student Progress"
                      >
                        <i className="bi bi-eye" />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>
                      <strong>Pham Hoang Nam</strong>
                    </td>
                    <td>
                      <span className="specialty-badge"> Chemistry - 8 </span>
                    </td>
                    <td>
                      <strong className="text-warning">74%</strong>
                    </td>
                    <td>3</td>
                    <td>
                      <span className="monitoring-status monitoring-attention">
                        Needs Attention
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        className="btn table-action-btn"
                        title="View Student Progress"
                      >
                        <i className="bi bi-eye" />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td>
                      <strong>Tran Minh Khang</strong>
                    </td>
                    <td>
                      <span className="specialty-badge">Mathematics - 7</span>
                    </td>
                    <td>
                      <strong className="text-warning">78%</strong>
                    </td>
                    <td>2</td>
                    <td>
                      <span className="monitoring-status monitoring-attention">
                        Needs Attention
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        className="btn table-action-btn"
                        title="View Student Progress"
                      >
                        <i className="bi bi-eye" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
