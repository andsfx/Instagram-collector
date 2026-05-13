import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import handler from './health'

function createResponse() {
  return {
    headers: {} as Record<string, string>,
    statusCode: 200,
    body: null as Record<string, unknown> | null,
    setHeader(key: string, value: string) {
      this.headers[key] = value
      return this
    },
    status(code: number) {
      this.statusCode = code
      return this
    },
    json(payload: Record<string, unknown>) {
      this.body = payload
      return this
    },
  }
}

function makePayload(generatedAt: string, accounts: string[] = ['acc1', 'acc2']) {
  return JSON.stringify({
    version: 2,
    generated_at: generatedAt,
    accounts,
  })
}

describe('/api/health', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('returns fresh status when data is less than 24 hours old', async () => {
    const now = new Date('2025-01-15T12:00:00Z')
    vi.setSystemTime(now)

    const generatedAt = new Date('2025-01-15T00:00:00Z').toISOString() // 12 hours ago
    const response = createResponse()

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: async () => makePayload(generatedAt),
    } as Response)

    await handler({}, response as any)

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      status: 'fresh',
      generated_at: generatedAt,
      age_seconds: 43200, // 12 hours
      accounts_count: 2,
    })
  })

  it('returns stale status when data is between 24 and 48 hours old', async () => {
    const now = new Date('2025-01-15T12:00:00Z')
    vi.setSystemTime(now)

    const generatedAt = new Date('2025-01-14T00:00:00Z').toISOString() // 36 hours ago
    const response = createResponse()

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: async () => makePayload(generatedAt),
    } as Response)

    await handler({}, response as any)

    expect(response.statusCode).toBe(200)
    expect(response.body!.status).toBe('stale')
    expect(response.body!.age_seconds).toBe(129600) // 36 hours
  })

  it('returns critical status when data is older than 48 hours', async () => {
    const now = new Date('2025-01-15T12:00:00Z')
    vi.setSystemTime(now)

    const generatedAt = new Date('2025-01-12T12:00:00Z').toISOString() // 72 hours ago
    const response = createResponse()

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: async () => makePayload(generatedAt),
    } as Response)

    await handler({}, response as any)

    expect(response.statusCode).toBe(200)
    expect(response.body!.status).toBe('critical')
    expect(response.body!.age_seconds).toBe(259200) // 72 hours
  })

  it('returns accounts_count from payload accounts array', async () => {
    const now = new Date('2025-01-15T12:00:00Z')
    vi.setSystemTime(now)

    const generatedAt = now.toISOString()
    const response = createResponse()

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: async () => makePayload(generatedAt, ['a', 'b', 'c', 'd', 'e']),
    } as Response)

    await handler({}, response as any)

    expect(response.statusCode).toBe(200)
    expect(response.body!.accounts_count).toBe(5)
  })

  it('returns 502 when upstream is unavailable', async () => {
    const response = createResponse()

    vi.mocked(fetch).mockRejectedValue(new Error('network error'))

    await handler({}, response as any)

    expect(response.statusCode).toBe(502)
    expect(response.body).toEqual({ error: 'network error' })
  })

  it('returns 502 when upstream returns non-2xx', async () => {
    const response = createResponse()

    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => 'Not Found',
    } as Response)

    await handler({}, response as any)

    expect(response.statusCode).toBe(502)
    expect(response.body).toEqual({ error: 'Upstream returned HTTP 404' })
  })

  it('returns 502 when upstream response is not valid JSON', async () => {
    const response = createResponse()

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: async () => '<html>not json</html>',
    } as Response)

    await handler({}, response as any)

    expect(response.statusCode).toBe(502)
    expect(response.body).toEqual({ error: 'Upstream response is not valid JSON' })
  })

  it('returns 502 when generated_at field is missing', async () => {
    const response = createResponse()

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ version: 2, accounts: [] }),
    } as Response)

    await handler({}, response as any)

    expect(response.statusCode).toBe(502)
    expect(response.body).toEqual({ error: 'Upstream payload missing generated_at field' })
  })

  it('returns 405 for non-GET methods', async () => {
    const response = createResponse()

    await handler({ method: 'POST' }, response as any)

    expect(response.statusCode).toBe(405)
    expect(response.headers['Allow']).toBe('GET')
    expect(response.body).toEqual({ error: 'Method not allowed' })
  })

  it('includes security headers on every response', async () => {
    const now = new Date('2025-01-15T12:00:00Z')
    vi.setSystemTime(now)

    const response = createResponse()

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: async () => makePayload(now.toISOString()),
    } as Response)

    await handler({}, response as any)

    expect(response.headers['X-Content-Type-Options']).toBe('nosniff')
    expect(response.headers['X-Frame-Options']).toBe('DENY')
    expect(response.headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
  })

  it('includes security headers even on error responses', async () => {
    const response = createResponse()

    vi.mocked(fetch).mockRejectedValue(new Error('fail'))

    await handler({}, response as any)

    expect(response.headers['X-Content-Type-Options']).toBe('nosniff')
    expect(response.headers['X-Frame-Options']).toBe('DENY')
    expect(response.headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
  })

  it('returns fresh at exactly 24 hours boundary', async () => {
    const now = new Date('2025-01-15T12:00:00Z')
    vi.setSystemTime(now)

    // Exactly 86400 seconds ago
    const generatedAt = new Date(now.getTime() - 86400 * 1000).toISOString()
    const response = createResponse()

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: async () => makePayload(generatedAt),
    } as Response)

    await handler({}, response as any)

    expect(response.statusCode).toBe(200)
    expect(response.body!.status).toBe('fresh')
    expect(response.body!.age_seconds).toBe(86400)
  })

  it('returns stale at exactly 48 hours boundary', async () => {
    const now = new Date('2025-01-15T12:00:00Z')
    vi.setSystemTime(now)

    // Exactly 172800 seconds ago
    const generatedAt = new Date(now.getTime() - 172800 * 1000).toISOString()
    const response = createResponse()

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: async () => makePayload(generatedAt),
    } as Response)

    await handler({}, response as any)

    expect(response.statusCode).toBe(200)
    expect(response.body!.status).toBe('stale')
    expect(response.body!.age_seconds).toBe(172800)
  })
})
