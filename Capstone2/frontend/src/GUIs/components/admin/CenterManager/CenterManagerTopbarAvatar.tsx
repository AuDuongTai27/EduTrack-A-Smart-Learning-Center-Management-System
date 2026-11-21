import { useState } from 'react';
import { isManagerDefaultAvatar, managerInitials } from '../../../utils/centerManagerAvatar';

export default function CenterManagerTopbarAvatar({ name, url }: { name?: string | null; url?: string | null }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const source = url?.trim();
  return source && !isManagerDefaultAvatar(source) && source !== failedUrl
    ? <img src={source} alt="" onError={() => setFailedUrl(source)} />
    : <span className="ntf-avatar">{managerInitials(name)}</span>;
}
