import { afterEach, describe, expect, it, vi } from 'vitest'
import { api, ApiError, BACKEND_UNAVAILABLE } from './http'

const reply = (body: string, status: number, type: string) =>
  vi.fn(async () => new Response(body, { status, headers: { 'Content-Type': type } }))

afterEach(() => vi.unstubAllGlobals())

describe('api() without a backend (e.g. static hosting)', () => {
  it('index.html answered with 200 is not data: BACKEND_UNAVAILABLE', async () => {
    vi.stubGlobal('fetch', reply('<!doctype html><html></html>', 200, 'text/html'))
    await expect(api('/api/auth/me')).rejects.toMatchObject({ status: 503, code: BACKEND_UNAVAILABLE })
  })

  it('a network failure becomes BACKEND_UNAVAILABLE', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new TypeError('Failed to fetch')
    }))
    const err = await api('/api/auth/me').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect((err as ApiError).code).toBe(BACKEND_UNAVAILABLE)
  })

  it('JSON still works, and a JSON 401 stays a 401', async () => {
    vi.stubGlobal('fetch', reply('{"id":1,"username":"a"}', 200, 'application/json'))
    await expect(api('/api/auth/me')).resolves.toEqual({ id: 1, username: 'a' })
    vi.stubGlobal('fetch', reply('{"code":"UNAUTHORIZED","message":"x"}', 401, 'application/json'))
    await expect(api('/api/auth/me')).rejects.toMatchObject({ status: 401, code: 'UNAUTHORIZED' })
  })
})
