export function dataError(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  if (/401|sign in/i.test(message)) return 'Your session has expired. Please sign in again.';
  if (/403|forbidden/i.test(message)) return 'You do not have permission to view this information.';
  if (/404|not found/i.test(message)) return 'This information is unavailable or no longer exists.';
  if (/501|unavailable/i.test(message)) return 'This feature is currently unavailable.';
  return 'Unable to load this information. Please try again.';
}

export function DataState({ message, error = false, onRetry }: {
  message: string; error?: boolean; onRetry?: () => void;
}) {
  return <div className="card border-0 rounded-4 shadow-sm my-3" role={error ? 'alert' : 'status'}>
    <div className="card-body d-flex align-items-center gap-3 p-4">
      <span className="rounded-circle bg-success-subtle text-success p-3" aria-hidden="true">
        <i className={`bi ${error ? 'bi-exclamation-circle' : 'bi-inbox'} fs-5`} />
      </span>
      <p className="mb-0 text-secondary flex-grow-1">{message}</p>
      {onRetry && <button className="btn btn-outline-success btn-sm" onClick={onRetry}>Retry</button>}
    </div>
  </div>;
}
