import fs from 'fs'
import path from 'path'

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true })
}

function removeIfExists(p) {
  try {
    fs.rmSync(p, { recursive: true, force: true })
  } catch {
    // ignore
  }
}

function isSymlink(p) {
  try {
    return fs.lstatSync(p).isSymbolicLink()
  } catch {
    return false
  }
}

function safeUnlinkSymlink(p) {
  if (!isSymlink(p)) return
  fs.unlinkSync(p)
}

function copyFileSync(src, dst) {
  ensureDir(path.dirname(dst))
  fs.copyFileSync(src, dst)
}

function copyDirRecursive(srcDir, dstDir) {
  if (!fs.existsSync(srcDir)) return { files: 0 }
  const st = fs.statSync(srcDir)
  if (!st.isDirectory()) return { files: 0 }

  let files = 0
  const entries = fs.readdirSync(srcDir, { withFileTypes: true })
  for (const e of entries) {
    const src = path.join(srcDir, e.name)
    const dst = path.join(dstDir, e.name)
    if (e.isDirectory()) {
      const r = copyDirRecursive(src, dst)
      files += r.files
      continue
    }
    if (e.isFile()) {
      copyFileSync(src, dst)
      files++
    }
  }
  return { files }
}

function materializeCopyDir({ src, dst }) {
  if (!fs.existsSync(src)) {
    console.log(`SKIP\tmissing\t${src}`)
    return 0
  }

  // Make destination deterministic: never keep symlinks, never keep stale files
  if (isSymlink(dst)) safeUnlinkSymlink(dst)
  if (fs.existsSync(dst)) removeIfExists(dst)
  ensureDir(dst)

  const r = copyDirRecursive(src, dst)
  console.log(`COPY\t${r.files}\t${src} -> ${dst}`)
  return r.files
}

function main() {
  const ROOT = process.cwd()
  const drawingsRoot = path.join(ROOT, 'public', 'custom_logos', 'drawings')

  const originalsStripe = path.join(drawingsRoot, 'images_originals', 'stripe')
  const thumbsGrid = path.join(drawingsRoot, 'images_grid')

  const placeholdersGrid = path.join(ROOT, 'public', 'placeholders', 'images_grid')

  let total = 0

  // 1) Placeholders grid (used by current UI): make it a real directory in prod
  total += materializeCopyDir({ src: thumbsGrid, dst: placeholdersGrid })

  // 2) Legacy drawing paths used by overlay/calibration code
  // simple collections
  total += materializeCopyDir({ src: path.join(originalsStripe, 'the_human_inside'), dst: path.join(drawingsRoot, 'the_human_inside') })
  total += materializeCopyDir({ src: path.join(originalsStripe, 'cube'), dst: path.join(drawingsRoot, 'cube') })
  total += materializeCopyDir({ src: path.join(originalsStripe, 'first_contact'), dst: path.join(drawingsRoot, 'first_contact') })
  total += materializeCopyDir({ src: path.join(originalsStripe, 'miscel·lania'), dst: path.join(drawingsRoot, 'miscel·lania') })

  // Austen legacy layout: /austen/samarreta/<category>
  const austenLegacyBase = path.join(drawingsRoot, 'austen', 'samarreta')
  total += materializeCopyDir({ src: path.join(originalsStripe, 'austen', 'quotes'), dst: path.join(austenLegacyBase, 'quotes') })
  total += materializeCopyDir({ src: path.join(originalsStripe, 'austen', 'keep_calm'), dst: path.join(austenLegacyBase, 'keep_calm') })
  total += materializeCopyDir({ src: path.join(originalsStripe, 'austen', 'looking_for_my_darcy'), dst: path.join(austenLegacyBase, 'looking_for_my_darcy') })
  total += materializeCopyDir({ src: path.join(originalsStripe, 'austen', 'pemberley_house'), dst: path.join(austenLegacyBase, 'pemberley_house') })

  // encreuats (legacy) was previously mapped to crosswords
  total += materializeCopyDir({ src: path.join(originalsStripe, 'austen', 'crosswords'), dst: path.join(austenLegacyBase, 'encreuats') })

  console.log(`DONE\tfiles=${total}`)
}

main()
