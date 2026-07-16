// Base URL for the Laravel backend, e.g. http://127.0.0.1:8000/api.
// Must always point at the Laravel server directly — the React dev
// server (localhost:5173) never serves API responses itself.
const API_BASE = import.meta.env.VITE_API_URL
if (!API_BASE) {
  throw new Error('VITE_API_URL is not set. Add it to .env or .env.local, e.g. VITE_API_URL=http://127.0.0.1:8000/api')
}

// Origin of the Laravel app (API_BASE minus the trailing /api), used to
// resolve storage/asset URLs returned as relative paths (e.g. "products/x.jpg").
export const APP_ORIGIN = API_BASE.replace(/\/api\/?$/, '')

const TOKEN_KEY = 'vitmart_token'
const REQUEST_TIMEOUT_MS = 15000

export class ApiError extends Error {
  status: number
  errors?: Record<string, string[]>

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

const STATUS_MESSAGES: Record<number, string> = {
  401: 'Your session has expired. Please sign in again.',
  403: "You don't have permission to do that.",
  404: 'The requested resource was not found.',
  422: 'Please check the form for errors.',
  500: 'Something went wrong on the server. Please try again.',
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  if (!(options.body instanceof FormData) && options.body) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers, signal: controller.signal })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError(0, 'The request timed out. Is the Laravel server running?')
    }
    throw new ApiError(0, 'Could not reach the server. Check your connection and that the Laravel backend is running.')
  } finally {
    clearTimeout(timeout)
  }

  const contentType = res.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await res.json().catch(() => null) : null

  if (!res.ok) {
    if (res.status === 401) setToken(null)
    const fallback = STATUS_MESSAGES[res.status] || `Request failed (${res.status}).`
    const message = data?.message || (data?.errors ? Object.values(data.errors).flat().join(' ') : fallback)
    throw new ApiError(res.status, message, data?.errors)
  }
  return data as T
}

export const apiGet = <T>(path: string) => request<T>(path)
export const apiPost = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body ?? {}) })
export const apiPut = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: 'PUT', body: JSON.stringify(body ?? {}) })
export const apiPatch = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: 'PATCH', body: JSON.stringify(body ?? {}) })
export const apiDelete = <T>(path: string) => request<T>(path, { method: 'DELETE' })
