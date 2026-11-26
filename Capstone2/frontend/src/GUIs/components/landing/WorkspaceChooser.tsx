import { BrandIcon } from "../Common/BrandIcon";
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from './LandingUI';
import { authApi } from '../../../api/authApi';
import { applyLoggedInUser } from '../../../BLL/services/userSelection';
import { clearNotificationInbox } from '../../hooks/useNotificationInbox';

export function WorkspaceChooser({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const identifierInput = useRef<HTMLInputElement>(null);
  const authenticating = useRef(false);
  const navigating = useRef(false);
  const backdropPointer = useRef<{ id: number; x: number; y: number } | null>(null);
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    navigating.current = false;
    backdropPointer.current = null;
    const previous = document.activeElement as HTMLElement | null;
    const element = dialog.current;
    element?.showModal();
    identifierInput.current?.focus({ preventScroll: true });
    return () => {
      element?.close();
      backdropPointer.current = null;
      if (!navigating.current && previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const dismiss = () => {
    if (!authenticating.current) onClose();
  };

  const isBackdrop = (event: React.PointerEvent<HTMLDialogElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return event.target === event.currentTarget &&
      (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authenticating.current) return;
    if (!identifier.trim()) {
      setError('Please enter your email or phone number.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    authenticating.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await authApi.login(identifier.trim(), password);
      const loggedInUser = result.user!;
      clearNotificationInbox();

      applyLoggedInUser(loggedInUser.primaryRole, {
        userId: loggedInUser.userId,
        userCode: loggedInUser.userCode,
        fullName: loggedInUser.fullName,
        email: loggedInUser.email || undefined,
        phone: loggedInUser.phone || undefined,
        avatarUrl: loggedInUser.avatarUrl || undefined,
        status: loggedInUser.status,
        gradeId: loggedInUser.gradeId ?? null,
        gradeName: loggedInUser.gradeName ?? null,
        specialty: loggedInUser.specialty || undefined,
        createdAt: new Date().toISOString(),
        roles: loggedInUser.roles,
      });

      navigating.current = true;
      onClose();
      navigate(loggedInUser.redirectPath || '/student/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid credentials. Please try again.';
      setError(message);
    } finally {
      authenticating.current = false;
      setLoading(false);
    }
  };

  return (
    <dialog
      ref={dialog}
      className="et-workspace-dialog"
      aria-labelledby="workspace-title"
      onCancel={(event) => {
        event.preventDefault();
        dismiss();
      }}
      onPointerDown={(event) => {
        backdropPointer.current = event.isPrimary && event.button === 0 && isBackdrop(event)
          ? { id: event.pointerId, x: event.clientX, y: event.clientY }
          : null;
      }}
      onPointerMove={(event) => {
        const start = backdropPointer.current;
        // Reject a drag even if the pointer subsequently returns to its origin.
        if (start && start.id === event.pointerId && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) {
          backdropPointer.current = null;
        }
      }}
      onPointerUp={(event) => {
        const start = backdropPointer.current;
        backdropPointer.current = null;
        if (start?.id === event.pointerId && isBackdrop(event) && Math.hypot(event.clientX - start.x, event.clientY - start.y) <= 8) dismiss();
      }}
      onPointerCancel={() => { backdropPointer.current = null; }}
    >
      <div className="et-workspace-header">
        <div className="et-workspace-brand"><BrandIcon size={40} /><span>EduTrack</span></div>
        <button
          className="et-workspace-close"
          aria-label="Close dialog"
          onClick={dismiss}
          type="button"
          disabled={loading}
        >
          <Icon name="close" />
        </button>
      </div>
      <div className="et-dialog-heading">
        <div>
          <h2 id="workspace-title">Sign In to EduTrack</h2>
        </div>
      </div>

      <p style={{ marginTop: '8px', marginBottom: '18px', color: '#557062', fontSize: '13.5px' }}>
        Enter your registered email or phone number to access your learning portal.
      </p>

      {error && (
        <div
          role="alert"
          style={{
            marginBottom: '16px',
            padding: '10px 14px',
            borderRadius: '10px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: '13px',
            lineHeight: 1.4,
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '14px' }}>
          <label
            htmlFor="login-identifier"
            style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#132a1e' }}
          >
            Email or Phone Number
          </label>
          <input
            ref={identifierInput}
            id="login-identifier"
            type="text"
            required
            autoComplete="username"
            placeholder="e.g. name@gmail.com or 0912345678"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid #c8ded1',
              backgroundColor: '#fff',
              fontSize: '14px',
              color: '#132a1e',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor="login-password"
            style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#132a1e' }}
          >
            Password
          </label>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 42px 10px 14px',
                borderRadius: '10px',
                border: '1px solid #c8ded1',
                backgroundColor: '#fff',
                fontSize: '14px',
                color: '#132a1e',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              title={showPassword ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 6px',
                color: '#6b7280',
                fontSize: '14px',
              }}
            >
              <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="et-button et-primary et-student-link"
          disabled={loading}
          style={{
            justifyContent: 'center',
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
            padding: '12px 20px',
            fontSize: '14.5px',
          }}
        >
          {loading ? (
            'Authenticating...'
          ) : (
            <>
              <Icon name="user" />
              Sign In to EduTrack
              <Icon name="arrow" />
            </>
          )}
        </button>
      </form>
    </dialog>
  );
}

export default WorkspaceChooser;
