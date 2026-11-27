import { getAuthHeaders } from './authApi';

/** A download is acknowledged only after the server supplies a file. */
export async function downloadFile(fileUrl: string | null | undefined, fileName: string): Promise<void> {
  if (!fileUrl?.trim()) throw new Error('No downloadable file is available.');
  const url = new URL(fileUrl, window.location.origin);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('This file link is unavailable.');
  const response = await fetch(url, { headers: url.origin === window.location.origin ? getAuthHeaders() : {} });
  if (!response.ok) throw new Error(`Unable to download this file (HTTP ${response.status}).`);
  if (/application\/json|text\/html/.test(response.headers.get('content-type') || '')) {
    throw new Error('The server did not return a downloadable file.');
  }
  const blob = await response.blob();
  if (!blob.size) throw new Error('The file is empty or unavailable.');
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
