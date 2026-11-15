import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from './LandingUI';
export function WorkspaceChooser({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const element = dialog.current;
    element?.showModal();
    return () => { element?.close(); previous?.focus(); };
  }, [isOpen]);
  if (!isOpen) return null;
  return <dialog ref={dialog} className="et-workspace-dialog" aria-labelledby="workspace-title" onCancel={onClose} onClick={e => { if (e.target === dialog.current) { const r = dialog.current.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onClose(); } }}><div className="et-dialog-heading"><div><h2 id="workspace-title">Choose Your Workspace</h2></div><button className="et-menu-toggle" aria-label="Close workspace chooser" onClick={onClose} autoFocus><Icon name="close"/></button></div><p>Continue to your learning workspace.</p><Link className="et-button et-primary et-student-link" to="/student/dashboard" onClick={onClose}><Icon name="user"/>Student Portal<Icon name="arrow"/></Link><div className="et-workspace-options">{[
    ['parent', 'Parent'], ['teacher', 'Teacher'], ['teaching-assistant', 'Teaching Assistant'], ['admin-staff', 'Academic Staff'], ['center-manager', 'Center Manager'],
  ].map(([route, label]) => <Link key={route} to={`/${route}/dashboard`} onClick={onClose}>{label}<Icon name="arrow"/></Link>)}</div><p className="et-demo-note">Demo access: sign-in is not enabled. Choose your workspace and an available demo account.</p></dialog>;
}
