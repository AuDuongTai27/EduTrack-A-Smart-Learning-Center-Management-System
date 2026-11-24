import { announceTopbarPanel, useTopbarDismiss } from '../../hooks/useTopbarDismiss';
import { LearnerNotificationBell } from './notifications/LearnerNotificationBell';
import '../../../assets/css/unified-topbar.css';
import { useId, useRef, useState, useSyncExternalStore } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi, getAuthUser, subscribeAuth } from '../../../api/authApi';
import { BrandIcon } from '../Common/BrandIcon';
import CenterManagerTopbarAvatar from '../admin/CenterManager/CenterManagerTopbarAvatar';
import '../../../assets/css/learner-topbar.css';

/** One responsive account presentation for the Student and Parent shells. */
export function LearnerTopbar({ role, onOpenMenu, accountDetail, selectedChildId, parentLoading }: {
  role: 'student' | 'parent';
  onOpenMenu: () => void;
  accountDetail?: string;
  selectedChildId?: number;
  parentLoading?: boolean;
}) {
  const authUser = useSyncExternalStore(subscribeAuth, getAuthUser);
  const user = authUser?.primaryRole === role || authUser?.roles?.includes(role) ? authUser : null;
  const displayName = user?.fullName?.trim() || 'Account';
  const roleLabel = role === 'student' ? 'Student' : 'Parent';
  const subtitle = user?.userCode?.trim() || roleLabel;
  const detail = role === 'student' && user?.gradeName ? `Student · ${user.gradeName}` : accountDetail || roleLabel;
  const [openKey, setOpenKey] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const location = useLocation();
  const navigate = useNavigate();
  const accountKey = `${location.key}:${user?.userId ?? ''}`;
  const open = openKey === accountKey;

  useTopbarDismiss(open, () => setOpenKey(null), containerRef, triggerRef);

  return (
    <header className="learner-topbar et-unified-topbar">
      <div className="learner-topbar-mobile">
        <button className="btn-hamburger" type="button" onClick={onOpenMenu} aria-label="Open menu" aria-controls="mobileSidebar">
          <i className="bi bi-list fs-5" aria-hidden="true" />
        </button>
        <Link to={`/${role}/dashboard`} className="learner-topbar-brand" aria-label="EduTrack dashboard">
          <BrandIcon size={28} />
          <span>EduTrack</span>
        </Link>
      </div>
      <div className="learner-topbar-actions">
        <LearnerNotificationBell role={role} selectedChildId={selectedChildId} parentLoading={parentLoading} />
      <div className="learner-account" ref={containerRef}
        onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpenKey(null); }}
        onKeyDown={event => {
          if (event.key === 'Escape' && open) {
            event.preventDefault();
            setOpenKey(null);
            triggerRef.current?.focus();
          }
        }}>
        <button type="button" className="learner-account-trigger" ref={triggerRef}
          onClick={() => { if (!open) announceTopbarPanel(containerRef); setOpenKey(open ? null : accountKey); }} aria-expanded={open} aria-controls={open ? panelId : undefined}
          aria-label={`${roleLabel} account: ${displayName}`}>
          <span className="learner-account-avatar" aria-hidden="true">
            <CenterManagerTopbarAvatar name={user?.fullName} url={user?.avatarUrl} />
          </span>
          <span className="learner-account-label">
            <strong title={displayName}>{displayName}</strong>
          </span>
          <i className="bi bi-chevron-down learner-account-chevron" aria-hidden="true" />
        </button>
        {open && (
          <div className="learner-account-panel" id={panelId} role="region" aria-label={`${roleLabel} account options`}>
            <div className="learner-account-summary">
              <strong>{displayName}</strong>
              {user?.email && <span>{user.email}</span>}
              <span>{subtitle}</span>
              {detail !== subtitle && <span>{detail}</span>}
            </div>
            <Link to={`/${role}/profile`} onClick={() => setOpenKey(null)}>
              <i className="bi bi-person" aria-hidden="true" /> Profile
            </Link>
            <button type="button" className="learner-account-logout" onClick={() => {
              setOpenKey(null);
              authApi.logout();
              navigate('/');
            }}><i className="bi bi-box-arrow-right" aria-hidden="true" /> Logout</button>
          </div>
        )}
      </div>
      </div>
    </header>
  );
}
