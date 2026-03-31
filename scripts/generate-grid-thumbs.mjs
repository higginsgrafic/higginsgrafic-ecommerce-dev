import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

function parseArgs(argv) {
  const args = {
    inDir: 'public/placeholders/images_grid',
    outDir: '',
    kind: 'grid',
    width: 320,
    quality: 72,
    overwrite: true,
    incremental: false,
    force: false,
    dryRun: false,
    verbose: false,
  }

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--in' && argv[i + 1]) {
      args.inDir = argv[++i]
      continue
    }
    if (a === '--out' && argv[i + 1]) {
      args.outDir = argv[++i]
      continue
    }
    if (a === '--kind' && argv[i + 1]) {
      args.kind = argv[++i]
      continue
    }
    if (a === '--width' && argv[i + 1]) {
      args.width = Number(argv[++i])
      continue
    }
    if (a === '--quality' && argv[i + 1]) {
      args.quality = Number(argv[++i])
      continue
    }
    if (a === '--overwrite') {
      args.overwrite = true
      continue
    }
    if (a === '--no-overwrite') {
      args.overwrite = false
      continue
    }
    if (a === '--incremental') {
      args.incremental = true
      continue
    }
    if (a === '--force') {
      args.force = true
      continue
    }
    if (a === '--dry-run') {
      args.dryRun = true
      continue
    }
    if (a === '--verbose') {
      args.verbose = true
      continue
    }
  }

  return args
}

function listFilesRec(dir) {
  const out = []
  const stack = [dir]
  while (stack.length) {
    const cur = stack.pop()
    const entries = fs.readdirSync(cur, { withFileTypes: true })
    for (const e of entries) {
      const full = path.join(cur, e.name)
      if (e.isDirectory()) stack.push(full)
      else out.push(full)
    }
  }
  return out
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true })
}

function normalizeThumbRelPath(rel, kind) {
  const ext = path.extname(rel)
  const base = path.basename(rel, ext)
  const dir = path.dirname(rel)
  const normalizedBase = base.replace(/-(grid|stripe)$/i, '')
  const outBase = normalizedBase.endsWith(`-${kind}`) ? normalizedBase : `${normalizedBase}-${kind}`
  return path.join(dir, outBase + ext)
}

function fmtBytes(n) {
  if (n < 1024) return `${n} B`
  const kb = n / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(2)} MB`
}

function effectiveWidthFor(relNormalized, kind, baseWidth) {
  try {
    if (kind !== 'stripe') return baseWidth
    const s = String(relNormalized || '').toLowerCase().replace(/\\/g, '/')
    const file = s.split('/').pop() || ''
    if (
      file === 'pemberley-house-multi-light-stripe.webp'
      || file === 'pemberley-house-multi-dark-stripe.webp'
      || s.endsWith('/austen/pemberley_house/multi/pemberley-house-multi-light-stripe.webp')
      || s.endsWith('/austen/pemberley_house/multi/pemberley-house-multi-dark-stripe.webp')
    ) {
      const bw = Number(baseWidth) || 0
      return bw > 0 ? bw * 2 : 1024
    }
    return baseWidth
  } catch {
    return baseWidth
  }
}

function shouldUseLosslessWebp(relNormalized, kind) {
  try {
    if (kind !== 'stripe') return false
    const s = String(relNormalized || '').toLowerCase().replace(/\\/g, '/')
    const file = s.split('/').pop() || ''
    return (
      file === 'pemberley-house-multi-light-stripe.webp'
      || file === 'pemberley-house-multi-dark-stripe.webp'
      || s.endsWith('/austen/pemberley_house/multi/pemberley-house-multi-light-stripe.webp')
      || s.endsWith('/austen/pemberley_house/multi/pemberley-house-multi-dark-stripe.webp')
    )
  } catch {
    return false
  }
}

async function processOne({ srcPath, dstPath, width, quality, lossless, dryRun }) {
  const before = fs.statSync(srcPath).size

  if (dryRun) {
    return { before, after: before, didWrite: false }
  }

  const input = sharp(srcPath, { failOn: 'none' })
  const meta = await input.metadata()

  let pipeline = input
  if (meta?.width && meta.width > width) {
    pipeline = pipeline.resize({ width, withoutEnlargement: true })
  }

  const outBuf = await pipeline.webp(lossless ? { lossless: true, effort: 6 } : { quality, effort: 6 }).toBuffer()
  ensureDir(path.dirname(dstPath))
  fs.writeFileSync(dstPath, outBuf)

  const after = outBuf.length
  return { before, after, didWrite: true }
}

async function main() {
  const args = parseArgs(process.argv)

  if (args.kind !== 'grid' && args.kind !== 'stripe') {
    console.error(`Invalid --kind: ${args.kind} (expected grid|stripe)`)
    process.exit(1)
  }

  const inDirAbs = path.resolve(process.cwd(), args.inDir)
  const outDirAbs = args.outDir ? path.resolve(process.cwd(), args.outDir) : ''

  if (!fs.existsSync(inDirAbs) || !fs.statSync(inDirAbs).isDirectory()) {
    console.log(`SKIP\tInput dir not found: ${args.inDir}`)
    console.log('FILES\t0')
    console.log('BEFORE\t0 B')
    console.log('AFTER\t0 B')
    console.log('DELTA\t0 B')
    return
  }

  if (!args.overwrite && !outDirAbs) {
    console.error('When using --no-overwrite you must provide --out')
    process.exit(1)
  }

  const candidates = listFilesRec(inDirAbs).filter((p) => {
    const ext = path.extname(p).toLowerCase()
    return ext === '.webp' || ext === '.png' || ext === '.jpg' || ext === '.jpeg'
  })

  let totalBefore = 0
  let totalAfter = 0
  let wrote = 0
  let skipped = 0

  for (const srcPath of candidates) {
    const rel = path.relative(inDirAbs, srcPath)
    const relNormalized = normalizeThumbRelPath(rel, args.kind)

    const width = effectiveWidthFor(relNormalized, args.kind, args.width)
    const lossless = shouldUseLosslessWebp(relNormalized, args.kind)

    const dstPath = outDirAbs
      ? path.join(outDirAbs, relNormalized).replace(/\.(png|jpe?g)$/i, '.webp')
      : srcPath

    const tmpPath = dstPath + '.tmp'

    if (outDirAbs && args.incremental && !args.force) {
      try {
        if (fs.existsSync(dstPath)) {
          const srcStat = fs.statSync(srcPath)
          const dstStat = fs.statSync(dstPath)
          if (dstStat.mtimeMs >= srcStat.mtimeMs && !lossless) {
            if (width === args.width) {
              skipped++
              if (args.verbose) {
                console.log(`SKIP\t${rel}`)
              }
              continue
            }
            const dstMeta = await sharp(dstPath, { failOn: 'none' }).metadata()
            const dstW = Number(dstMeta?.width) || 0
            if (dstW >= width) {
              skipped++
              if (args.verbose) {
                console.log(`SKIP\t${rel}`)
              }
              continue
            }
          }
        }
      } catch {
        // ignore
      }
    }

    const res = await processOne({
      srcPath,
      dstPath: args.overwrite && !outDirAbs ? tmpPath : dstPath,
      width,
      quality: args.quality,
      lossless,
      dryRun: args.dryRun,
    })

    totalBefore += res.before
    totalAfter += res.after
    wrote++

    if (!args.dryRun && args.overwrite && !outDirAbs) {
      fs.renameSync(tmpPath, dstPath)
    }

    if (args.verbose) {
      const saved = res.before - res.after
      const sign = saved >= 0 ? '-' : '+'
      console.log(`${rel}\t${fmtBytes(res.before)} -> ${fmtBytes(res.after)}\t(${sign}${fmtBytes(Math.abs(saved))})`)
    }
  }

  if (!args.dryRun && outDirAbs) {
    const outFiles = listFilesRec(outDirAbs)
    let removed = 0
    for (const p of outFiles) {
      const ext = path.extname(p).toLowerCase()
      if (ext !== '.webp') continue

      const file = path.basename(p)
      const shouldEnd = `-${args.kind}.webp`
      if (!file.toLowerCase().endsWith(shouldEnd)) {
        try {
          fs.unlinkSync(p)
          removed++
        } catch {
          // ignore
        }
      }
    }
    if (args.verbose && removed) {
      console.log(`CLEAN\tremoved=${removed}`)
    }
  }

  const diff = totalBefore - totalAfter
  const sign = diff >= 0 ? '-' : '+'

  console.log(`FILES\t${candidates.length}`)
  console.log(`WROTE\t${wrote}`)
  console.log(`SKIPPED\t${skipped}`)
  console.log(`BEFORE\t${fmtBytes(totalBefore)}`)
  console.log(`AFTER\t${fmtBytes(totalAfter)}`)
  console.log(`DELTA\t${fmtBytes(totalBefore - totalAfter)}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
