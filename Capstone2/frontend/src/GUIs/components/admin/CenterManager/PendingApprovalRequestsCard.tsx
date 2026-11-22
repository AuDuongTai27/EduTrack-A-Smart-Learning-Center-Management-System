import { Link } from 'react-router-dom';
import approvalIllustration from '../../../../assets/illustrations/manager-approvals-empty.svg';
import type { ApprovalRequestDto } from '../../../../BLL/models/ApprovalRequestDto';
import { requestTypeLabel } from '../../../../BLL/services/centerManagerDashboardService';

export interface PendingRequestsState {
  requests: ApprovalRequestDto[];
  loading: boolean;
  error: string | null;
}

export default function PendingApprovalRequestsCard({ requests, loading, error, retry }: PendingRequestsState & { retry: () => void }) {
  return <section className="card dashboard-card cm-pending-card border-0 shadow-sm" aria-label="Pending Approval Requests" aria-busy={loading}>
    <div className="cm-pending-heading">
      <h5><i className="bi bi-clipboard-check" aria-hidden="true" /> Pending Approval Requests</h5>
      <Link className="academy-dashboard-link" to="/center-manager/approval-requests">View All <i className="bi bi-arrow-right" aria-hidden="true" /></Link>
    </div>
    {loading ? <p className="p-4 mb-0 text-muted" role="status">Loading approval requests...</p>
      : error ? <div className="p-4" role="alert"><p className="text-danger">Unable to load pending approval requests. {error}</p><button type="button" className="btn btn-sm btn-outline-primary" onClick={retry}>Retry</button></div>
      : requests.length === 0 ? <div className="p-4 text-center cm-approval-empty"><img src={approvalIllustration} alt="" aria-hidden="true" /><p className="mt-2 mb-1">No pending approval requests.</p><small className="text-muted">Admin Staff requests awaiting your review will appear here.</small></div>
      : <ul className="cm-pending-list">{requests.slice(0, 5).map(request => <li key={request.requestId}>
        <div className="cm-request-copy">
          <small className="text-muted">{requestTypeLabel(request.requestType)}</small>
          <strong className="cm-request-title">{request.title?.trim() || request.reason?.trim() || requestTypeLabel(request.requestType)}</strong>
          <small className="text-muted">{request.requesterName || 'Name unavailable'} · Admin Staff</small>
          <small className="text-muted">Submitted: <time dateTime={request.createdAt}>{Number.isNaN(Date.parse(request.createdAt)) ? 'Date unavailable' : new Date(request.createdAt).toLocaleDateString('en-GB')}</time></small>
        </div>
        <div className="cm-request-badges">
          <span className="badge bg-warning-subtle text-warning-emphasis">Pending</span>
          <small className={request.priority.trim().toLowerCase() === 'high' ? 'text-danger fw-semibold' : 'text-muted'}>{requestTypeLabel(request.priority)} priority</small>
        </div>
      </li>)}</ul>}
  </section>;
}
