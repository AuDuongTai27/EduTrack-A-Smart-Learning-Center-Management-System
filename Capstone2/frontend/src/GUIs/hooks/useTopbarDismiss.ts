import { useEffect, type RefObject } from 'react';

const openEvent = 'edutrack-topbar-panel-open';

export function announceTopbarPanel(root: RefObject<HTMLDivElement | null>) {
  document.dispatchEvent(new CustomEvent(openEvent, { detail: root.current }));
}

/** Disclosure dismissal shared by topbar account and notification controls. */
export function useTopbarDismiss(open: boolean, close: () => void, root: RefObject<HTMLDivElement | null>, trigger: RefObject<HTMLButtonElement | null>) {
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) close(); };
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); close(); trigger.current?.focus(); }
    };
    const otherPanel = (event: Event) => { if ((event as CustomEvent).detail !== root.current) close(); };
    const focusOutside = (event: FocusEvent) => { if (!root.current?.contains(event.target as Node)) close(); };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', keyboard);
    document.addEventListener('focusin', focusOutside);
    document.addEventListener(openEvent, otherPanel);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', keyboard);
      document.removeEventListener('focusin', focusOutside);
      document.removeEventListener(openEvent, otherPanel);
    };
  }, [open, close, root, trigger]);
}
