import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function dashboardDataPlugin() {
  const rootDir = fileURLToPath(new URL('.', import.meta.url))
  const dataPath = resolve(rootDir, '../dashboard/data.json')

  async function handleRequest(res: any) {
    try {
      const raw = await readFile(dataPath, 'utf8')
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(raw)
    } catch (error) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Unable to read dashboard data' }))
    }
  }

  return {
    name: 'dashboard-data-runtime-endpoint',
    configureServer(server: any) {
      server.middlewares.use('/api/dashboard-data', (_req: any, res: any) => {
        void handleRequest(res)
      })
    },
    configurePreviewServer(server: any) {
      server.middlewares.use('/api/dashboard-data', (_req: any, res: any) => {
        void handleRequest(res)
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), dashboardDataPlugin()],
  server: {
    host: true,
  },
})
