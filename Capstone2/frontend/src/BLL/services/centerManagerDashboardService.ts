import type { ApprovalRequestDto } from '../models/ApprovalRequestDto';

const normalize = (value?: string | null) => value?.trim().toLowerCase() ?? '';
const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

/** The manager's existing Approval Requests page handles Admin Staff submissions. */
export function getManagerPendingRequests(requests: ApprovalRequestDto[], managerId: number) {
  if (!Number.isSafeInteger(managerId) || managerId <= 0) throw new Error('Select a Center Manager account to load approval requests.');
  const pending = requests.filter(request => normalize(request.status) === 'pending' && request.requestedBy !== managerId);
  // Do not silently undercount if an older API cannot identify the requester role.
  if (pending.some(request => !normalize(request.requesterRole))) {
    throw new Error('Approval Requests API did not provide requester roles. The pending total is unavailable.');
  }
  return pending.filter(request => normalize(request.requesterRole) === 'admin_staff')
    .sort((a, b) => (priorityOrder[normalize(a.priority)] ?? 3) - (priorityOrder[normalize(b.priority)] ?? 3)
      || (Date.parse(a.createdAt) || 0) - (Date.parse(b.createdAt) || 0)
      || a.requestId - b.requestId);
}

export function requestTypeLabel(type: string) {
  return type.trim().split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Other';
}
