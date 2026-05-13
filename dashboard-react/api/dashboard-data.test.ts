import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
}))

import { readFile } from 'node:fs/promises'
import handler from './dashboard-data'

function createResponse() {
  return {
    headers: {} as Record<string, string>,
    statusCode: 200,
    body: '' as string | Record<string, unknown>,
    setHeader(key: string, value: string) {
      this.headers[key] = value
      return this
    },
    status(code: number) {
      this.statusCode = code
      return this
    },
    send(payload: string) {
      this.body = payload
      return this
    },
    json(payload: Record<string, unknown>) {
      this.body = payload
      return this
    },
  }
}

const VALID_PAYLOAD = JSON.stringify({ version: 2, accounts: ['test'], generated_at: '2025-01-15T10:00:00Z' })

describe('/api/dashboard-data', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  it('returns remote payload when fetch succeeds and payload is valid', async () => {
    const response = createResponse()

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: async () => VALID_PAYLOAD,
    } as Response)

    await handler({}, response as any)

    expect(response.statusCode).toBe(200)
    expect(response.body).toBe(VALID_PAYLOAD)
  })

  it('falls back to local file when remote fetch fails', async () => {
    const response = createResponse()

    vi.mocked(fetch).mockRejectedValue(new Error('network down'))
    vi.mocked(readFile).mockResolvedValue(VALID_PAYLOAD)

    await handler({}, response as any)

    expect(response.statusCode).toBe(200)
    expect(response.body).toBe(VALID_PAYLOAD)
    expect(vi.mocked(readFile)).toHaveBeenCalled()
  })

  it('returns 422 when upstream response is not valid JSON', async () => {
    const response = createResponse()

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: async () => '<html>not json</html>',
    } as Response)

    await handler({}, response as any)

    expect(response.statusCode).toBe(422)
    expect(response.body).toEqual({ error: 'Upstream response is not valid JSON' })
  })

  it('returns 502 when payload validation fails (missing version)', async () => {
    const response = createResponse()

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ accounts: ['test'], generated_at: '2025-01-15T10:00:00Z' }),
    } as Response)

    await handler({}, response as any)

    expect(response.statusCode).toBe(502)
    expect(response.body).toEqual({ error: 'Upstream payload failed schema validation' })
  })

  it('returns 405 for non-GET methods', async () => {
    const response = createResponse()

    await handler({ method: 'POST' }, response as any)

    expect(response.statusCode).toBe(405)
    expect(response.headers['Allow']).toBe('GET')
    expect(response.body).toEqual({ error: 'Method not allowed' })
  })

  it('returns 502 when all sources fail', async () => {
    const response = createResponse()

    vi.mocked(fetch).mockRejectedValue(new Error('network down'))
    vi.mocked(readFile).mockRejectedValue(new Error('file not found'))

    await handler({}, response as any)

    expect(response.statusCode).toBe(502)
    expect(response.body).toEqual({ error: 'Upstream data source unavailable after 3 attempts' })
  })

  it('includes security headers on every response', async () => {
    const response = createResponse()

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: async () => VALID_PAYLOAD,
    } as Response)

    await handler({}, response as any)

    expect(response.headers['X-Content-Type-Options']).toBe('nosniff')
    expect(response.headers['X-Frame-Options']).toBe('DENY')
    expect(response.headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
  })

  it('sets Cache-Control header on success', async () => {
    const response = createResponse()

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: async () => VALID_PAYLOAD,
    } as Response)

    await handler({}, response as any)

    expect(response.headers['Cache-Control']).toBe('public, s-maxage=60, stale-while-revalidate=300')
  })

  it('writes structured JSON log to stdout', async () => {
    const response = createResponse()
    const stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: async () => VALID_PAYLOAD,
    } as Response)

    await handler({}, response as any)

    expect(stdoutSpy).toHaveBeenCalled()
    const logLine = stdoutSpy.mock.calls[0][0] as string
    const logEntry = JSON.parse(logLine.trim())
    expect(logEntry).toHaveProperty('timestamp')
    expect(logEntry).toHaveProperty('level')
    expect(logEntry).toHaveProperty('event')
    expect(logEntry).toHaveProperty('duration_ms')
    expect(logEntry).toHaveProperty('upstream_source')
    expect(logEntry).toHaveProperty('status_code')

    stdoutSpy.mockRestore()
  })
})
