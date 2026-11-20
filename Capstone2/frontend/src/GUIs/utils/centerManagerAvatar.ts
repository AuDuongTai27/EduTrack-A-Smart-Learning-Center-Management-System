/** Topbar presentation only; never changes the stored display name or avatar URL. */
export function managerInitials(displayName?: string | null): string {
  const words = displayName?.normalize('NFC').trim().split(/\s+/u).filter(Boolean) ?? [];
  return words.slice(-2).map(word => Array.from(word)[0]).join('').toLocaleUpperCase('vi-VN') || '?';
}

/** Known system artwork from the existing seed/profile defaults, not arbitrary personal photos. */
export function isManagerDefaultAvatar(avatarUrl?: string | null): boolean {
  if (!avatarUrl?.trim()) return true;
  try {
    const url = new URL(avatarUrl.trim(), 'https://edutrack.invalid');
    return (url.hostname.toLowerCase() === 'api.dicebear.com'
      && /^\/(?:\d+\.x\/)?avataaars(?:-neutral)?\/(?:svg|png|webp)\/?$/i.test(url.pathname))
      || url.pathname.toLowerCase() === '/assets/img/profiles/avatar-27.jpg';
  } catch {
    return false; // Invalid images follow the normal browser error fallback.
  }
}
