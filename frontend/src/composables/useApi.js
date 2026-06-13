import { useAuthStore } from '@/stores/auth'

const BASE = import.meta.env.VITE_API_URL ?? ''

export async function apiFetch(url, options = {}) {
  const auth = useAuthStore()

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  }

  if (auth.token) {
    headers['Authorization'] = `Bearer ${auth.token}`
  }

  const res = await fetch(`${BASE}${url}`, { ...options, headers })

  if (res.status === 401) {
    auth.logout()
    window.location.href = '/login'
    return
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail ?? `Error ${res.status}`)
  }

  if (res.status === 204) return null
  return res.json()
}
