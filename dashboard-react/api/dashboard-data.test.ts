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
    body: '',
    setHeader(key: string, value: string) {
      this.headers[key] = value
    },
    status(code: number) {
      this.statusCode = code
      return this
    },
    send(payload: string) {
      this.body = payload
      return this
    },
  }
}

describe('/api/dashboard-data', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns remote payload when github raw fetch succeeds', async () => {
    const response = createResponse()

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: async () => '{"ok":true}',
    } as Response)

    await handler({}, response)

    expect(response.statusCode).toBe(200)
    expect(response.body).toBe('{"ok":true}')
    expect(vi.mocked(readFile)).not.toHaveBeenCalled()
  })

  it('falls back to local file when remote fetch fails', async () => {
    const response = createResponse()

    vi.mocked(fetch).mockRejectedValue(new Error('network down'))
    vi.mocked(readFile).mockResolvedValue('{"local":true}')

    await handler({}, response)

    expect(response.statusCode).toBe(200)
    expect(response.body).toBe('{"local":true}')
    expect(vi.mocked(readFile)).toHaveBeenCalledTimes(1)
  })
})
