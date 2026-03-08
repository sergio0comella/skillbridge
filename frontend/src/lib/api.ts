// ── API base URL ──────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

// ── Token storage ─────────────────────────────────────────────────────────────
let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────
async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include', // send cookies for refresh token
    headers,
  })

  if (res.status === 401 && path !== '/auth/refresh' && path !== '/auth/login') {
    // Attempt token refresh
    const refreshed = await tryRefresh()
    if (refreshed) {
      // Retry original request with new token
      headers['Authorization'] = `Bearer ${accessToken}`
      const retry = await fetch(`${BASE_URL}${path}`, {
        ...options,
        credentials: 'include',
        headers,
      })
      if (!retry.ok) {
        const err = await retry.json().catch(() => ({}))
        throw new ApiError(retry.status, err.message ?? 'Request failed', err.code)
      }
      return retry.json() as Promise<T>
    }
    // Refresh failed — clear token and bubble up
    accessToken = null
    throw new ApiError(401, 'Session expired', 'UNAUTHORIZED')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new ApiError(res.status, err.message ?? 'Request failed', err.code, err.errors)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

async function tryRefresh(): Promise<boolean> {
  try {
    const data = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    if (!data.ok) return false
    const json = await data.json()
    accessToken = json.data?.accessToken ?? null
    return !!accessToken
  } catch {
    return false
  }
}

// ── Custom error class ────────────────────────────────────────────────────────
export class ApiError extends Error {
  status: number
  code?: string
  errors?: { field: string; message: string }[]

  constructor(
    status: number,
    message: string,
    code?: string,
    errors?: { field: string; message: string }[],
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.errors = errors
  }
}

// ── HTTP verbs ────────────────────────────────────────────────────────────────
export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}

// ── API response types ────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}
