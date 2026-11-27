/** Validate the existing API envelope. An invalid response is never an empty list. */
function unwrap(json: unknown): unknown {
  if (json && typeof json === 'object' && 'success' in json && json.success !== true) {
    throw new Error('The server did not confirm this operation. Please retry.');
  }
  return json && typeof json === 'object' && 'data' in json ? json.data : json;
}

export function realRecord<T>(json: unknown, required: string[] = []): T {
  const value = unwrap(json);
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      required.some(key => {
        const field = (value as Record<string, unknown>)[key];
        return field == null || ((key === 'id' || key.endsWith('Id')) &&
          (typeof field !== 'number' || !Number.isSafeInteger(field) || field <= 0));
      })) {
    throw new Error('The server returned incomplete data. Please retry.');
  }
  return value as T;
}

export function realList<T>(json: unknown): T[] {
  const value = unwrap(json);
  if (!Array.isArray(value)) throw new Error('The server returned an invalid list. Please retry.');
  return value;
}

export function confirmedUpload<T extends { success: boolean; fileUrl: string }>(result: T): T {
  if (result?.success !== true || !result.fileUrl?.trim()) {
    throw new Error('Upload was not confirmed. Please select the file and retry.');
  }
  return result;
}
