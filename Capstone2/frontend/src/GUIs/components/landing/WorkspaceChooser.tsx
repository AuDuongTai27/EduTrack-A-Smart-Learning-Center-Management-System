import { BrandIcon } from "../Common/BrandIcon";
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from './LandingUI';
import { authApi } from '../../../api/authApi';
import { applyLoggedInUser } from '../../../BLL/services/userSelection';
import { clearNotificationInbox } from '../../hooks/useNotificationInbox';

export function WorkspaceChooser({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    const previous = document.activeElement as HTMLElement | null;
    const element = dialog.current;
    element?.showModal();
    return () => {
      element?.close();
      previous?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your phone number, email, or user code.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

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

      onClose();
      navigate(loggedInUser.redirectPath || '/student/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid credentials. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog
      ref={dialog}
      className="et-workspace-dialog"
      aria-labelledby="workspace-title"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === dialog.current) {
          const r = dialog.current.getBoundingClientRect();
          if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
            onClose();
          }
        }
      }}
    >
      <div className="et-workspace-brand"><BrandIcon size={40} /><span>EduTrack</span></div>
      <div className="et-dialog-heading">
        <div>
          <h2 id="workspace-title">Sign In to EduTrack</h2>
        </div>
        <button
          className="et-menu-toggle"
          aria-label="Close dialog"
          onClick={onClose}
          type="button"
          autoFocus
        >
          <Icon name="close" />
        </button>
      </div>

      <p style={{ marginTop: '8px', marginBottom: '18px', color: '#557062', fontSize: '13.5px' }}>
        Enter your registered phone number, email, or account code to access your learning portal.
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
            Phone Number, Email, or User Code
          </label>
          <input
            id="login-identifier"
            type="text"
            required
            autoComplete="username"
            placeholder="e.g. 0956789012 or TC001"
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
