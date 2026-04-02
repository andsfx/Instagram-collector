import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const RAW_GITHUB_URL = 'https://raw.githubusercontent.com/andsfx/Instagram-collector/main/dashboard/data.json'

export default async function handler(_request: any, response: any) {
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
      response.status(200).send(await remoteResponse.text())
      return
    }
  } catch {
    // Fall back to bundled repo file below.
  }

  try {
    const localPath = resolve(process.cwd(), '../dashboard/data.json')
    const localData = await readFile(localPath, 'utf8')
    response.status(200).send(localData)
    return
  } catch (error) {
    response.status(500).send(JSON.stringify({ error: error instanceof Error ? error.message : 'Unable to load dashboard data' }))
  }
}
