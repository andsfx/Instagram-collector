// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VercelRequest {
  method?: string
}

interface VercelResponse {
  setHeader(name: string, value: string): VercelResponse
  status(code: number): VercelResponse
  json(body: Record<string, unknown>): VercelResponse
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const DEFAULT_DASHBOARD_DATA_URL =
  'https://raw.githubusercontent.com/andsfx/Instagram-collector/main/dashboard/data.json'

const DASHBOARD_DATA_URL = process.env.DASHBOARD_DATA_URL || DEFAULT_DASHBOARD_DATA_URL

const FETCH_TIMEOUT_MS = 8000

const FRESH_THRESHOLD = 86400       // 24 hours in seconds
const STALE_THRESHOLD = 172800      // 48 hours in seconds

// ---------------------------------------------------------------------------
// Security Headers
// ---------------------------------------------------------------------------

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
}

function applySecurityHeaders(response: VercelResponse): void {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.setHeader(key, value)
  }
}

// ---------------------------------------------------------------------------
// Freshness Classification
// ---------------------------------------------------------------------------

function classifyFreshness(ageSeconds: number): 'fresh' | 'stale' | 'critical' {
  if (ageSeconds <= FRESH_THRESHOLD) return 'fresh'
  if (ageSeconds <= STALE_THRESHOLD) return 'stale'
  return 'critical'
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export default async function handler(request: VercelRequest, response: VercelResponse) {
  // Apply security headers on every response
  applySecurityHeaders(response)

  // Method validation
  if (request.method && request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    response.status(405).json({ error: 'Method not allowed' })
    return
  }

  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    const upstreamResponse = await fetch(DASHBOARD_DATA_URL, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!upstreamResponse.ok) {
      response.status(502).json({
        error: `Upstream returned HTTP ${upstreamResponse.status}`,
      })
      return
    }

    const text = await upstreamResponse.text()
    let payload: Record<string, unknown>

    try {
      payload = JSON.parse(text)
    } catch {
      response.status(502).json({ error: 'Upstream response is not valid JSON' })
      return
    }

    // Validate generated_at field
    const generatedAt = payload.generated_at
    if (typeof generatedAt !== 'string') {
      response.status(502).json({ error: 'Upstream payload missing generated_at field' })
      return
    }

    const generatedDate = new Date(generatedAt)
    if (isNaN(generatedDate.getTime())) {
      response.status(502).json({ error: 'Upstream payload has invalid generated_at timestamp' })
      return
    }

    // Compute age and classify
    const nowMs = Date.now()
    const ageSeconds = Math.floor((nowMs - generatedDate.getTime()) / 1000)

    const accounts = Array.isArray(payload.accounts) ? payload.accounts : []
    const accountsCount = accounts.length

    response.status(200).json({
      status: classifyFreshness(ageSeconds),
      generated_at: generatedAt,
      age_seconds: ageSeconds,
      accounts_count: accountsCount,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upstream data source unavailable'
    response.status(502).json({ error: message })
  }
}
