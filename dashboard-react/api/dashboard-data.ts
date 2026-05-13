import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

// ---------------------------------------------------------------------------
// Inline payload validation (cannot import from ../src/ in Vercel serverless)
// ---------------------------------------------------------------------------

function validatePayloadBasic(payload: unknown): { valid: boolean; error?: string } {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'Payload is not an object' }
  }
  const p = payload as Record<string, unknown>
  if (typeof p.version !== 'number') {
    return { valid: false, error: 'Missing or invalid version field' }
  }
  if (!Array.isArray(p.accounts)) {
    return { valid: false, error: 'Missing or invalid accounts field' }
  }
  if (typeof p.generated_at !== 'string') {
    return { valid: false, error: 'Missing or invalid generated_at field' }
  }
  return { valid: true }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VercelRequest {
  method?: string
}

interface VercelResponse {
  setHeader(name: string, value: string): VercelResponse
  status(code: number): VercelResponse
  send(body: string): VercelResponse
  json(body: Record<string, unknown>): VercelResponse
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const DEFAULT_DASHBOARD_DATA_URL =
  'https://raw.githubusercontent.com/andsfx/Instagram-collector/main/dashboard/data.json'

const DASHBOARD_DATA_URL = process.env.DASHBOARD_DATA_URL || DEFAULT_DASHBOARD_DATA_URL

const FETCH_TIMEOUT_MS = 10_000

/** Ordered list of fallback sources to try */
const DATA_SOURCES: DataSource[] = [
  { label: 'env_url', url: DASHBOARD_DATA_URL },
  { label: 'github_raw', url: DEFAULT_DASHBOARD_DATA_URL },
  { label: 'local_snapshot', path: resolve(process.cwd(), '../data/dashboard-snapshot.json') },
  { label: 'local_file', path: resolve(process.cwd(), '../dashboard/data.json') },
]

interface DataSource {
  label: string
  url?: string
  path?: string
}

// ---------------------------------------------------------------------------
// Structured Logging
// ---------------------------------------------------------------------------

interface StructuredLog {
  timestamp: string
  level: 'info' | 'warn' | 'error'
  event: string
  duration_ms: number
  upstream_source: string
  status_code: number
}

function log(entry: StructuredLog): void {
  process.stdout.write(JSON.stringify(entry) + '\n')
}

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
  const commitSha = process.env.VERCEL_GIT_COMMIT_SHA
  if (commitSha) {
    response.setHeader('X-Dashboard-Commit', commitSha)
  }
}

// ---------------------------------------------------------------------------
// Data Fetching Helpers
// ---------------------------------------------------------------------------

async function fetchFromUrl(url: string): Promise<string> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} from ${url}`)
    }

    return await res.text()
  } catch (err) {
    clearTimeout(timeoutId)
    throw err
  }
}

async function fetchFromFile(filePath: string): Promise<string> {
  return await readFile(filePath, 'utf8')
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export default async function handler(request: VercelRequest, response: VercelResponse) {
  const startTime = Date.now()

  // Apply security headers on every response
  applySecurityHeaders(response)

  // Method validation
  if (request.method && request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    response.setHeader('Content-Type', 'application/json; charset=utf-8')
    log({
      timestamp: new Date().toISOString(),
      level: 'warn',
      event: 'method_not_allowed',
      duration_ms: Date.now() - startTime,
      upstream_source: '',
      status_code: 405,
    })
    response.status(405).json({ error: 'Method not allowed' })
    return
  }

  response.setHeader('Content-Type', 'application/json; charset=utf-8')

  // Deduplicate sources: if env URL equals default, skip the duplicate
  const sources = DASHBOARD_DATA_URL === DEFAULT_DASHBOARD_DATA_URL
    ? DATA_SOURCES.filter((s) => s.label !== 'github_raw')
    : DATA_SOURCES

  // Limit to 3 attempts as per requirements
  const sourcesToTry = sources.slice(0, 3)

  for (const source of sourcesToTry) {
    const sourceLabel = source.url || source.path || source.label
    try {
      let rawText: string

      if (source.url) {
        rawText = await fetchFromUrl(source.url)
      } else if (source.path) {
        rawText = await fetchFromFile(source.path)
      } else {
        continue
      }

      // Validate JSON parse
      let parsed: unknown
      try {
        parsed = JSON.parse(rawText)
      } catch {
        log({
          timestamp: new Date().toISOString(),
          level: 'error',
          event: 'json_parse_failed',
          duration_ms: Date.now() - startTime,
          upstream_source: sourceLabel,
          status_code: 422,
        })
        response.status(422).json({ error: 'Upstream response is not valid JSON' })
        return
      }

      // Validate payload structure
      const result = validatePayloadBasic(parsed)
      if (!result.valid) {
        log({
          timestamp: new Date().toISOString(),
          level: 'error',
          event: 'schema_validation_failed',
          duration_ms: Date.now() - startTime,
          upstream_source: sourceLabel,
          status_code: 502,
        })
        response.status(502).json({ error: 'Upstream payload failed schema validation' })
        return
      }

      // Success - set cache headers and return
      response.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')

      log({
        timestamp: new Date().toISOString(),
        level: 'info',
        event: 'fetch_success',
        duration_ms: Date.now() - startTime,
        upstream_source: sourceLabel,
        status_code: 200,
      })

      response.status(200).send(rawText)
      return
    } catch (err) {
      log({
        timestamp: new Date().toISOString(),
        level: 'warn',
        event: 'fetch_failed',
        duration_ms: Date.now() - startTime,
        upstream_source: sourceLabel,
        status_code: 0,
      })
      // Continue to next source
    }
  }

  // All sources failed
  log({
    timestamp: new Date().toISOString(),
    level: 'error',
    event: 'all_sources_failed',
    duration_ms: Date.now() - startTime,
    upstream_source: '',
    status_code: 502,
  })

  response.status(502).json({ error: 'Upstream data source unavailable after 3 attempts' })
}
