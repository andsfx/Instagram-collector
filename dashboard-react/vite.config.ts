/// <reference types="vitest" />
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import type { ServerResponse } from 'node:http'

function dashboardDataPlugin() {
  const rootDir = fileURLToPath(new URL('.', import.meta.url))
  const dataPath = resolve(rootDir, '../dashboard/data.json')

  async function handleRequest(res: ServerResponse) {
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
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api/dashboard-data', (_req, res) => {
        void handleRequest(res as ServerResponse)
      })
    },
    configurePreviewServer(server: { middlewares: ViteDevServer['middlewares'] }) {
      server.middlewares.use('/api/dashboard-data', (_req, res) => {
        void handleRequest(res as ServerResponse)
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), dashboardDataPlugin()],
  server: {
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Keep the small downsample utility in the main bundle
          if (id.includes('downsample')) {
            return undefined
          }
          // Group recharts and its dependencies into a dedicated chunk
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-') || id.includes('node_modules/victory-vendor')) {
            return 'recharts'
          }
        },
      },
    },
  },
  test: {
    globals: false,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'api/**/*.test.ts'],
    testTimeout: 30_000,
  },
})
