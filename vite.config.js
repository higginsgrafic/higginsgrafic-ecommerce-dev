import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { execSync, execFileSync, execFile } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// EL NODE QUE CORRE EL SERVIDOR (01/10/2026).
//
// Els endpoints de captura cridaven `execFile('node', ...)`, que busca `node` al
// PATH del proces: si el servidor s'ha arrencat des d'un llancador que no hi te
// el PATH del sistema, l'execucio falla amb «Node was not found» i el boto de
// captura no fa res. `process.execPath` es el binari que ja esta corrent: sempre
// hi es i es el mateix Node.
const NODE_BIN = process.execPath

function readGitBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { cwd: __dirname }).toString().trim()
  } catch {
    return 'unknown'
  }
}

function renameProdHtmlPlugin() {
  return {
    name: 'rename-prod-html',
    apply: 'build',
    writeBundle() {
      const distDir = path.resolve(__dirname, 'dist')
      const from = path.join(distDir, 'index-prod.html')
      const to = path.join(distDir, 'index.html')
      if (fs.existsSync(from)) {
        fs.renameSync(from, to)
      }
    },
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
              // El missatge ve de la URL: traiem salts de línia i limitem la
              // longitud abans de passar-lo a git.
              const safeMessage = String(commitMessage).replace(/[\r\n]+/g, ' ').slice(0, 200)

              let git = { didCommit: false }
              if (doCommit) {
                // execFileSync amb arguments separats: no passa per cap shell,
                // així que el paràmetre `message` no pot injectar comandes.
                // (Abans s'usava execSync amb interpolació de la URL i només
                // s'escapaven les cometes dobles: $(...) i backticks s'executaven.)
                execFileSync('git', ['add', CONFIG_REL_PATH], { cwd: __dirname, stdio: 'ignore' })
                execFileSync('git', ['commit', '-m', safeMessage], { cwd: __dirname, stdio: 'ignore' })
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

/**
 * CONTACT SHEET: EL BOTO DE CAPTURA (01/10/2026).
 *
 * La pagina `/dev/contact-sheet` ensenya totes les pantalles en iframes i te un
 * boto per capturar-les. Capturar una pagina des del navegador no es pot fer
 * (el DOM d'un iframe no es pot rasteritzar des de JS), aixi que el boto demana
 * al servidor de desenvolupament que executi el guio de sempre
 * (`scripts/contact-sheet-capture.mjs`), el MATEIX que `npm run
 * contact-sheet:capture`. Nomes existeix en `serve` (mai al build).
 *
 *   POST /__dev/contact-sheet-capture   { "paths": ["/", "/austen", ...] }
 *     -> { ok, ms, log, error }
 */
function contactSheetCaptureDevApi() {
  return {
    name: 'contact-sheet-capture-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next()
        let url
        try { url = new URL(req.url, 'http://localhost') } catch { return next() }
        if (url.pathname !== '/__dev/contact-sheet-capture') return next()

        const resposta = (codi, cos) => {
          res.statusCode = codi
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify(cos))
        }
        if (req.method !== 'POST') return resposta(405, { ok: false, error: 'Method not allowed' })

        let body = ''
        req.on('data', (chunk) => { body += chunk })
        req.on('end', () => {
          let paths = []
          try {
            const json = JSON.parse(body || '{}')
            if (Array.isArray(json.paths)) paths = json.paths.filter((p) => typeof p === 'string' && p.startsWith('/'))
          } catch {
            return resposta(400, { ok: false, error: 'Invalid payload' })
          }
          if (!paths.length) return resposta(400, { ok: false, error: 'Sense rutes' })

          const args = ['scripts/contact-sheet-capture.mjs', `--only=${paths.join(',')}`]
          const t0 = Date.now()
          execFile(NODE_BIN, args, { cwd: __dirname, maxBuffer: 8 * 1024 * 1024 }, (err, stdout, stderr) => {
            resposta(err ? 500 : 200, {
              ok: !err,
              ms: Date.now() - t0,
              paths: paths.length,
              log: String(stdout || '').split('\n').slice(-14).join('\n'),
              error: err ? String(stderr || err.message || '').split('\n').slice(-14).join('\n') : null,
            })
          })
        })
      })
    },
  }
}

/**
 * CAPTURA DE VISTES DEL MOSAIC (01/10/2026).
 *
 * El boto «captura» de `public/browser-overlay.html` (el mosaic d'iframes) vol
 * una foto de cada vista activa, a la SEVA mida. Aixo des del navegador no es
 * pot fer, aixi que es demana al servidor de desenvolupament, que executa
 * `scripts/vistes-capture.mjs` amb la llista de vistes.
 *
 *   POST /__dev/vistes-capture  { "vistes": [{ nom, ample, alt, url }] }
 *     -> { ok, ms, vistes: [...], fitxers: [...], log, error }
 */
function vistesCaptureDevApi() {
  return {
    name: 'vistes-capture-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next()
        let url
        try { url = new URL(req.url, 'http://localhost') } catch { return next() }
        if (url.pathname !== '/__dev/vistes-capture') return next()

        const resposta = (codi, cos) => {
          res.statusCode = codi
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify(cos))
        }
        if (req.method !== 'POST') return resposta(405, { ok: false, error: 'Method not allowed' })

        let body = ''
        req.on('data', (chunk) => { body += chunk })
        req.on('end', () => {
          let vistes = []
          try {
            const json = JSON.parse(body || '{}')
            if (Array.isArray(json.vistes)) {
              vistes = json.vistes
                .filter((v) => v && typeof v.url === 'string')
                .map((v) => ({
                  nom: String(v.nom || 'vista').slice(0, 60),
                  ample: Number(v.ample) || 1280,
                  alt: Number(v.alt) || 800,
                  url: v.url.startsWith('/') ? v.url : `/${v.url}`,
                  // 'vista' (la finestra) o 'pagina' (tota la tirada).
                  mode: v.mode === 'pagina' ? 'pagina' : 'vista',
                  // La pagina del megaslide (1..4): viu a sessionStorage i la
                  // captura s'obre en un navegador nou, aixi que s'hi ha de dir.
                  pagina: Math.min(4, Math.max(1, Math.round(Number(v.pagina) || 1))),
                }))
                .slice(0, 24)
            }
          } catch {
            return resposta(400, { ok: false, error: 'Invalid payload' })
          }
          if (!vistes.length) return resposta(400, { ok: false, error: 'Sense vistes' })

          const base64 = Buffer.from(JSON.stringify(vistes)).toString('base64')
          const t0 = Date.now()
          execFile(NODE_BIN, ['scripts/vistes-capture.mjs', `--vistes-base64=${base64}`], { cwd: __dirname, maxBuffer: 8 * 1024 * 1024 }, (err, stdout, stderr) => {
            let fitxers = []
            try {
              const raw = fs.readFileSync(path.resolve(__dirname, 'public/captures/index.json'), 'utf8')
              fitxers = JSON.parse(raw).vistes || []
            } catch { fitxers = [] }
            resposta(err ? 500 : 200, {
              ok: !err,
              ms: Date.now() - t0,
              vistes: vistes.length,
              fitxers,
              log: String(stdout || '').split('\n').slice(-16).join('\n'),
              error: err ? String(stderr || err.message || '').split('\n').slice(-16).join('\n') : null,
            })
          })
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), componentCatalogDevApi(), contactSheetCaptureDevApi(), vistesCaptureDevApi(), renameProdHtmlPlugin()],
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
    // Les funcions de servidor no les serveix Vite: les serveix `netlify dev`
    // al 8888. Amb aquest proxy, `/api/...` funciona DES DEL 3003, que és on
    // treballa l'amo. Si el 8888 no està aixecat, la petició dona error de
    // connexió, i prou: la web continua funcionant.
    proxy: {
      '/api': { target: 'http://127.0.0.1:8888', changeOrigin: true },
      '/.netlify/functions': { target: 'http://127.0.0.1:8888', changeOrigin: true },
    },
    // El 3003 de sempre. `strictPort: false` perquè, si el port està ocupat,
    // Vite passi al següent en comptes de petar: amb `npm run proves`, el
    // `netlify dev` també vol aixecar server i poden coincidir un moment.
    port: 3003,
    strictPort: false,
    // LA MEMORIA CAU DELS DIBUIXOS AL DESENVOLUPAMENT (28/09/2026)
    // -------------------------------------------------------------------------
    // Aixo era `no-store`, i amb `no-store` el navegador no pot guardar RES: a
    // cada canvi de colleccio tornava a baixar les ~100 imatges dels dibuixos
    // (mesurat: 99 peticions i 1.100 KB cada clic, tambe tornant a una
    // colleccio ja vista). Es el que feia que cambiar de colleccio semblés
    // travat.
    //
    // En produccio aixo ja esta be: `public/_headers` i `netlify.toml` donen
    // `/custom_logos/*` un any de memoria cau. Nome's fallava el 3003.
    //
    // `no-cache` es el valor que Vite ja posa per defecte a `send()`
    // (`isEtag ? "no-cache" : "no-store"`): el navegador GUARDA la resposta
    // pero la revalida sempre. Amb l'ETag que tambe envia Vite, si el fitxer no
    // ha canviat la resposta es un 304 sense cos, i si l'amo regenera un dibuix
    // arriba el nou de seguida. O sigui: mai no es veu un dibuix vell, i no es
    // torna a baixar el que ja es te.
    headers: {
      'Cache-Control': 'no-cache',
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
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      input: path.resolve(__dirname, 'index-prod.html'),
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase': ['@supabase/supabase-js'],
          'radix-ui': [
            '@radix-ui/react-toast',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-slot',
          ],
          'motion': ['framer-motion'],
          'lucide-icons': ['lucide-react'],
          'ui-utils': ['clsx', 'tailwind-merge', 'class-variance-authority'],
        },
      },
    },
  },
  assetsInclude: ['**/*.zip', '**/*.tar.gz'],
})