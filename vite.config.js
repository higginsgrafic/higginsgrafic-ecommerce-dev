import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { execSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const IS_PROD_BUILD = process.env.VITE_PROD_MODE === 'true'

function readGitBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { cwd: __dirname }).toString().trim()
  } catch {
    return 'unknown'
  }
}

function componentCatalogDevApi() {
  const CONFIG_REL_PATH = 'public/component-catalog.config.json'

  return {
    name: 'component-catalog-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          if (!req.url) return next()

          const url = new URL(req.url, 'http://localhost')
          if (url.pathname !== '/__dev/component-catalog') return next()

          const configPath = path.resolve(__dirname, CONFIG_REL_PATH)

          if (req.method === 'GET') {
            const raw = fs.readFileSync(configPath, 'utf8')
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(raw)
            return
          }

          if (req.method === 'POST') {
            let body = ''
            req.on('data', (chunk) => {
              body += chunk
            })
            req.on('end', () => {
              const payload = JSON.parse(body || '{}')

              if (!payload || typeof payload !== 'object') {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json; charset=utf-8')
                res.end(JSON.stringify({ ok: false, error: 'Invalid payload' }))
                return
              }

              const nextConfig = {
                ...payload,
                version: payload.version ?? 1,
              }

              fs.mkdirSync(path.dirname(configPath), { recursive: true })
              fs.writeFileSync(configPath, JSON.stringify(nextConfig, null, 2) + '\n', 'utf8')

              const doCommit = url.searchParams.get('commit') === '1'
              const commitMessage = url.searchParams.get('message') || 'chore(catalog): update component catalog config'

              let git = { didCommit: false }
              if (doCommit) {
                execSync(`git add ${CONFIG_REL_PATH}`, { cwd: __dirname, stdio: 'ignore' })
                execSync(`git commit -m "${commitMessage.replace(/\"/g, '\\"')}"`, { cwd: __dirname, stdio: 'ignore' })
                git = { didCommit: true }
              }

              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.end(JSON.stringify({ ok: true, path: CONFIG_REL_PATH, ...git }))
            })
            return
          }

          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ ok: false, error: 'Method not allowed' }))
        } catch (err) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ ok: false, error: err?.message || 'Internal error' }))
        }
      })
    },
  }
}

function prodDevHtml() {
  if (!IS_PROD_BUILD) return { name: 'prod-dev-html-noop' }

  return {
    name: 'prod-dev-html',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url !== '/' || req.method !== 'GET') return next()

        const htmlPath = path.resolve(__dirname, 'index-prod.html')
        let html = fs.readFileSync(htmlPath, 'utf-8')

        // Injecta el client HMR de Vite i converteix l'HTML per Vite
        html = await server.transformIndexHtml('/', html, req.originalUrl)

        res.statusCode = 200
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.end(html)
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), componentCatalogDevApi(), prodDevHtml()],
  define: {
    __HG_GIT_BRANCH__: JSON.stringify(readGitBranch()),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.js', '.jsx', '.json'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/unit/**/*.test.{js,jsx}', 'tests/unit/**/*.spec.{js,jsx}'],
  },
  server: {
    host: '0.0.0.0',
    port: 3003,
    strictPort: true,
    headers: {
      'Cache-Control': 'no-store',
    },
    middlewareMode: false,
  },
  preview: {
    host: '0.0.0.0',
    port: 3003,
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    copyPublicDir: true,
    ...(IS_PROD_BUILD && {
      rollupOptions: {
        input: path.resolve(__dirname, 'index-prod.html'),
      },
    }),
  },
  assetsInclude: ['**/*.zip', '**/*.tar.gz'],
})