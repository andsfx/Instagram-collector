import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'

interface VercelRequest {
  method?: string
}

interface VercelResponse {
  setHeader(name: string, value: string): VercelResponse
  status(code: number): VercelResponse
  send(body: string): VercelResponse
  json(body: Record<string, unknown>): VercelResponse
}

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || ''

const RAW_GITHUB_URL = process.env.DASHBOARD_DATA_URL
  || 'https://raw.githubusercontent.com/andsfx/Instagram-collector/main/dashboard/data.json'

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method && request.method !== 'GET') {
    response.status(405).json({ error: 'Method not allowed' })
    return
  }

  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'public, max-age=0, must-revalidate, s-maxage=60, stale-while-revalidate=300')
  response.setHeader('CDN-Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
  response.setHeader('Vercel-CDN-Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')

  // Strategy 1: Supabase dashboard_cache
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      })

      const { data, error } = await supabase
        .rpc('get_latest_dashboard')

      if (!error && data) {
        const text = typeof data === 'string' ? data : JSON.stringify(data)
        response.status(200).send(text)
        return
      }
    } catch {
      // Fall through to GitHub raw fallback
    }
  }

  // Strategy 2: GitHub raw (existing fallback)
  try {
    const remoteResponse = await fetch(RAW_GITHUB_URL, {
      headers: { Accept: 'application/json' },
    })

    if (remoteResponse.ok) {
      const text = await remoteResponse.text()
      JSON.parse(text)
      response.status(200).send(text)
      return
    }
  } catch {
    // Fall back to local file
  }

  // Strategy 3: Local file (last resort)
  try {
    const localPath = resolve(process.cwd(), '../dashboard/data.json')
    const localData = await readFile(localPath, 'utf8')
    JSON.parse(localData)
    response.status(200).send(localData)
    return
  } catch (error) {
    response.status(500).json({ error: error instanceof Error ? error.message : 'Unable to load dashboard data' })
  }
}
