/**
 * Tiny fetch wrapper.
 * - Sends the HttpOnly session cookie (credentials: 'include').
 * - Fetches the CSRF token from GET /api/auth/csrf once and sends it on every
 *   state-changing request; refreshes it once if the server rejects it.
 */

export const API_BASE: string = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fieldErrors?: Record<string, string>

  constructor(status: number, code: string, message: string, fieldErrors?: Record<string, string>) {
    super(message)
    this.status = status
    this.code = code
    this.fieldErrors = fieldErrors
  }
}

export const BACKEND_UNAVAILABLE = 'BACKEND_UNAVAILABLE'

/** The backend is unreachable or something else (e.g. a static host's index.html) answered instead. */
export function backendUnavailable(): ApiError {
  return new ApiError(503, BACKEND_UNAVAILABLE, 'Không kết nối được máy chủ. Thử lại sau nhé.')
}

const isJson = (res: Response) => (res.headers.get('Content-Type') ?? '').includes('json')

/** fetch() that turns network failures (not aborts) into BACKEND_UNAVAILABLE. */
async function fetchApi(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init)
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e
    throw backendUnavailable()
  }
}

let csrf: { header: string; token: string } | null = null
let csrfPromise: Promise<void> | null = null

export function resetCsrf(): void {
  csrf = null
  csrfPromise = null
}

async function loadCsrf(): Promise<void> {
  if (csrf) return
  if (!csrfPromise) {
    csrfPromise = fetchApi(`${API_BASE}/api/auth/csrf`, { credentials: 'include' })
      .then(async (r) => {
        if (!isJson(r)) throw backendUnavailable()
        if (!r.ok) throw new ApiError(r.status, 'CSRF', 'Could not start a secure session')
        const body = (await r.json()) as { headerName: string; token: string }
        csrf = { header: body.headerName, token: body.token }
      })
      .finally(() => {
        csrfPromise = null
      })
  }
  await csrfPromise
}

export function csrfHeader(): Record<string, string> {
  return csrf ? { [csrf.header]: csrf.token } : {}
}

export async function ensureCsrf(): Promise<Record<string, string>> {
  await loadCsrf()
  return csrfHeader()
}

type Options = { method?: string; body?: unknown; form?: FormData; signal?: AbortSignal }

export async function api<T>(path: string, opts: Options = {}, retried = false): Promise<T> {
  const method = opts.method ?? 'GET'
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (method !== 'GET') {
    Object.assign(headers, await ensureCsrf())
  }
  let body: BodyInit | undefined
  if (opts.form) {
    body = opts.form
  } else if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(opts.body)
  }
  const res = await fetchApi(`${API_BASE}${path}`, {
    method,
    headers,
    body,
    credentials: 'include',
    signal: opts.signal,
  })
  if (res.status === 403 && method !== 'GET' && !retried) {
    // Token may have been rotated (login/logout) or the session expired: refresh once.
    resetCsrf()
    return api<T>(path, opts, true)
  }
  if (!res.ok) {
    // An error page that is not our JSON error body means the backend did not answer.
    if (res.status !== 401 && res.status !== 403 && !isJson(res)) throw backendUnavailable()
    let code = 'HTTP_' + res.status
    let message = 'Đã có lỗi xảy ra, thử lại sau nhé.'
    let fieldErrors: Record<string, string> | undefined
    try {
      const err = (await res.json()) as { code?: string; message?: string; fieldErrors?: Record<string, string> }
      code = err.code ?? code
      message = err.message ?? message
      fieldErrors = err.fieldErrors ?? undefined
    } catch {
      // non-JSON error body
    }
    throw new ApiError(res.status, code, message, fieldErrors)
  }
  if (res.status === 204) return undefined as T
  // Every /api endpoint answers JSON; anything else (e.g. index.html from a SPA rewrite) is not our backend.
  if (!isJson(res)) throw backendUnavailable()
  return (await res.json()) as T
}

/** Absolute URL for a backend path (used by <img src>, which sends cookies automatically). */
export function apiUrl(path: string): string {
  return `${API_BASE}${path}`
}

/** ws:// or wss:// URL of the STOMP endpoint. */
export function wsUrl(): string {
  if (API_BASE) {
    return API_BASE.replace(/^http/, 'ws') + '/ws'
  }
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
  return `${proto}://${window.location.host}/ws`
}
