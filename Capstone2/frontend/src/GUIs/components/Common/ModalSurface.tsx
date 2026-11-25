import { useId, useLayoutEffect, useRef, type HTMLAttributes } from 'react';
import ModalIcon, { type ModalIconName } from './ModalIcon';

const stack: HTMLElement[] = [];
const focusable = 'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

/** Presentation and keyboard behavior only; existing forms own all actions. */
export default function ModalSurface({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useLayoutEffect(() => {
    const surface = ref.current!;
    const overlay = surface.closest<HTMLElement>('.modal') ?? surface;
    const previous = document.activeElement as HTMLElement | null;
    const backdrop = overlay.previousElementSibling?.classList.contains('modal-backdrop') ? overlay.previousElementSibling : null;
    backdrop?.classList.add('edu-modal-backdrop');
    const title = surface.querySelector<HTMLElement>('.modal-title, h2, h3, h4, h5');
    if (title) { title.id ||= titleId; overlay.setAttribute('aria-labelledby', title.id); }
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.classList.add('edu-modal-overlay');
    surface.querySelectorAll('.btn-close').forEach(button => {
      if (!button.hasAttribute('aria-label')) button.setAttribute('aria-label', 'Close');
    });
    let fieldNumber = 0;
    const labelFields = () => surface.querySelectorAll<HTMLLabelElement>('label:not([for])').forEach(label => {
      const control = label.nextElementSibling;
      if (!label.control && control instanceof HTMLElement && control.matches('input, select, textarea')) {
        control.id ||= `${titleId}-field-${++fieldNumber}`;
        label.htmlFor = control.id;
      }
    });
    labelFields();
    const hidden: { element: HTMLElement; inert: boolean }[] = [];
    let branch: HTMLElement = overlay;
    while (branch.parentElement && branch !== document.body) {
      for (const sibling of branch.parentElement.children) {
        if (sibling instanceof HTMLElement && sibling !== branch && !sibling.classList.contains('modal-backdrop')) {
          hidden.push({ element: sibling, inert: sibling.inert }); sibling.inert = true;
        }
      }
      branch = branch.parentElement;
    }
    stack.push(surface);
    const controls = () => [...surface.querySelectorAll<HTMLElement>(focusable)].filter(node => node.getClientRects().length && !node.closest('[inert]'));
    // Existing workflows may already focus a specific input or error summary.
    if (!surface.contains(document.activeElement)) (controls()[0] ?? surface).focus({ preventScroll: true });
    const keydown = (event: KeyboardEvent) => {
      if (stack.at(-1) !== surface || event.defaultPrevented) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        // Clicking the existing close control retains workflow-specific guards.
        surface.querySelector<HTMLButtonElement>('.btn-close:not(:disabled)')?.click();
      }
      if (event.key === 'Tab') {
        const items = controls(), first = items[0], last = items.at(-1);
        if (!first) { event.preventDefault(); surface.focus(); }
        else if (event.shiftKey && (document.activeElement === first || !surface.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || !surface.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
      }
    };
    const focusin = (event: FocusEvent) => {
      if (stack.at(-1) === surface && !surface.contains(event.target as Node) && !document.querySelector('dialog[open]')) (controls()[0] ?? surface).focus();
    };
    // Retry/loading controls can disappear while focused. Keep focus in the dialog.
    const observer = new MutationObserver(() => {
      labelFields();
      if (surface.isConnected && stack.at(-1) === surface && !surface.contains(document.activeElement) && !document.querySelector('dialog[open]')) (controls()[0] ?? surface).focus({ preventScroll: true });
    });
    observer.observe(surface, { childList: true, subtree: true });
    document.addEventListener('keydown', keydown);
    document.addEventListener('focusin', focusin);
    return () => {
      stack.splice(stack.indexOf(surface), 1);
      observer.disconnect();
      backdrop?.classList.remove('edu-modal-backdrop');
      document.removeEventListener('keydown', keydown);
      document.removeEventListener('focusin', focusin);
      hidden.forEach(({ element, inert }) => { element.inert = inert; });
      if (previous?.isConnected && !previous.closest('[inert]')) previous.focus({ preventScroll: true });
    };
  }, [titleId]);
  return <div {...props} ref={ref} tabIndex={-1} className={`edu-modal ${className}`}>{children}</div>;
}

export function ModalHeader({ title, icon = 'file', subtitle, onClose, busy }: {
  title: string; icon?: ModalIconName; subtitle?: string; onClose: () => void; busy?: boolean;
}) {
  return <div className="modal-header">
    <div><h2 className="modal-title"><ModalIcon name={icon} />{title}</h2>
      {subtitle && <p className="edu-modal-subtitle">{subtitle}</p>}</div>
    <button type="button" className="btn-close" aria-label="Close" disabled={busy} onClick={onClose} />
  </div>;
}
