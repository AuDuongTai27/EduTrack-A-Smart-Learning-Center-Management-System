import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "edutrack-sidebar-collapsed";
const BODY_CLASS = "sidebar-collapsed";
const EVENT_NAME = "edutrack:sidebar-toggle";

function readInitialCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function applyBodyClass(collapsed: boolean) {
  if (typeof document === "undefined") return;
  document.body.classList.toggle(BODY_CLASS, collapsed);
}

export function toggleGlobalSidebar() {
  if (typeof window === "undefined") return;
  const next = !document.body.classList.contains(BODY_CLASS);
  applyBodyClass(next);
  try {
    window.localStorage.setItem(STORAGE_KEY, String(next));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent<boolean>(EVENT_NAME, { detail: next }));
}

export function toggleMobileSidebar() {
  if (typeof document === "undefined") return;
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  if (!sidebar) return;
  const isShowing = sidebar.classList.toggle("show");
  if (overlay) {
    overlay.classList.toggle("show", isShowing);
  }
}

export function closeMobileSidebar() {
  if (typeof document === "undefined") return;
  document.getElementById("sidebar")?.classList.remove("show");
  document.getElementById("sidebarOverlay")?.classList.remove("show");
}

export function useSidebarToggle() {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    const initial = readInitialCollapsed();
    applyBodyClass(initial);
    return initial;
  });

  useEffect(() => {
    applyBodyClass(collapsed);
  }, [collapsed]);

  useEffect(() => {
    const handleEvent = (e: Event) => {
      const detail = (e as CustomEvent<boolean>).detail;
      if (typeof detail === "boolean") {
        setCollapsed(detail);
      } else {
        setCollapsed(document.body.classList.contains(BODY_CLASS));
      }
    };
    window.addEventListener(EVENT_NAME, handleEvent);
    return () => window.removeEventListener(EVENT_NAME, handleEvent);
  }, []);

  const toggleSidebar = useCallback(() => {
    toggleGlobalSidebar();
  }, []);

  return {
    collapsed,
    toggleSidebar,
    toggleMobileSidebar,
    closeMobileSidebar,
  };
}
