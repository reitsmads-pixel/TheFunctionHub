// Shared request/response helpers for every Netlify Function.

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

export function requireMethod(req: Request, method: 'GET' | 'POST'): void {
  if (req.method !== method) throw new HttpError(405, `Use ${method}.`);
}

/** Parses a JSON object body, rejecting anything else or anything oversized. */
export async function readJsonBody(req: Request, maxBytes = 64 * 1024): Promise<Record<string, unknown>> {
  const text = await req.text();
  if (text.length > maxBytes) throw new HttpError(413, 'Request body is too large.');
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new HttpError(400, 'Request body must be JSON.');
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new HttpError(400, 'Request body must be a JSON object.');
  }
  return parsed as Record<string, unknown>;
}

export function requireString(body: Record<string, unknown>, key: string, pattern: RegExp): string {
  const value = body[key];
  if (typeof value !== 'string' || !pattern.test(value)) {
    throw new HttpError(400, `Invalid or missing "${key}".`);
  }
  return value;
}

/** Reads a required environment variable, failing loudly (server-side) when it is missing. */
export function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new HttpError(500, `Server is missing the ${name} setting.`);
  return value;
}

/**
 * Wraps a handler so every error becomes a JSON response. Our own HttpErrors pass their message
 * through; Google API errors pass through their status and message (they never contain secrets);
 * anything else is logged and reported generically.
 */
export function handler(fn: (req: Request) => Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    try {
      return await fn(req);
    } catch (err) {
      if (err instanceof HttpError) return json({ error: err.message }, err.status);
      const google = googleError(err);
      if (google) {
        console.error('Google API error', google.status, google.message);
        return json({ error: `Google API: ${google.message}` }, google.status >= 500 ? 502 : google.status);
      }
      console.error(err);
      return json({ error: 'Unexpected server error.' }, 500);
    }
  };
}

function googleError(err: unknown): { status: number; message: string } | null {
  if (typeof err !== 'object' || err === null) return null;
  const e = err as { status?: unknown; code?: unknown; message?: unknown };
  const status = typeof e.status === 'number' ? e.status : typeof e.code === 'number' ? e.code : null;
  if (status === null || status < 400 || status > 599) return null;
  return { status, message: typeof e.message === 'string' ? e.message : 'Request failed.' };
}
