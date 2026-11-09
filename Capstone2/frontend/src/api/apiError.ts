/** Preserve both domain errors and ASP.NET validation messages. */
export async function apiError(response: Response, fallback: string): Promise<Error> {
  const body = await response.json().catch(() => null);
  const validation = body?.errors && typeof body.errors === "object"
    ? Object.values(body.errors).flat().filter(value => typeof value === "string").join(" ") : "";
  return new Error(`${validation || body?.message || body?.title || fallback} (HTTP ${response.status})`);
}
