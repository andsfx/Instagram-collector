import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

// Inline Vercel request/response types to avoid requiring @vercel/node as a dependency
interface VercelRequest {
  method?: string
}

interface VercelResponse {
  setHeader(name: string, value: string): VercelResponse
  status(code: number): VercelResponse
  send(body: string): VercelResponse
  json(body: Record<string, unknown>): VercelResponse
}

const RAW_GITHUB_URL = process.env.DASHBOARD_DATA_URL
  || 'https://raw.githubusercontent.com/andsfx/Instagram-collector/main/dashboard/data.json'

export default async function handler(request: VercelRequest, response: VercelResponse) {
  // Only allow GET requests
  if (request.method && request.method !== 'GET') {
    response.status(405).json({ error: 'Method not allowed' })
    return
  }

  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'public, max-age=0, must-revalidate, s-maxage=60, stale-while-revalidate=300')
  response.setHeader('CDN-Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
  response.setHeader('Vercel-CDN-Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')

  try {
    const remoteResponse = await fetch(RAW_GITHUB_URL, {
      headers: {
        Accept: 'application/json',
      },
    })

    if (remoteResponse.ok) {
      const text = await remoteResponse.text()
      // Validate that the response is valid JSON before serving
      JSON.parse(text)
      response.status(200).send(text)
      return
    }
  } catch {
    // Fall back to bundled repo file below.
  }

  try {
    const localPath = resolve(process.cwd(), '../dashboard/data.json')
    const localData = await readFile(localPath, 'utf8')
    // Validate that the local file is valid JSON
    JSON.parse(localData)
    response.status(200).send(localData)
    return
  } catch (error) {
    response.status(500).json({ error: error instanceof Error ? error.message : 'Unable to load dashboard data' })
  }
}
