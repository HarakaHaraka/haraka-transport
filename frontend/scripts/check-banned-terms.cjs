#!/usr/bin/env node
// ============================================================
// check-banned-terms.cjs — Haraka Transport
// TfL prohibits a licensed private hire operator from using
// taxi/taxis/cab/cabs/minicab/minicabs in trading names, website
// addresses or adverts. This is a licence condition, not a style
// preference — fail the build if any of these words appear anywhere
// user-visible: source content, page titles, meta tags, filenames.
//
// The only allowed exception is a handful of exact strings explicitly
// allowlisted below (reviewed by hand) — currently the two genuine
// external tfl.gov.uk licence-checker URLs on /verify, which are TfL's
// own URL, not ours, and unavoidable if we link to it.
// ============================================================

const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const SCAN_DIRS = ['src', 'public', 'index.html']
const EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.json', '.md', '.txt'])
const BANNED = /\b(taxi|taxis|cab|cabs|minicab|minicabs)\b/gi

// Exact substrings that are allowed to contain a banned word — reviewed
// by hand. Keep this list short; every entry is a manual exception to a
// licence condition.
const ALLOWLIST = [
  'https://tfl.gov.uk/info-for/taxis-and-private-hire/licensing/licence-checker',
]

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue
      walk(full, files)
    } else {
      files.push(full)
    }
  }
  return files
}

function isAllowlisted(line) {
  return ALLOWLIST.some(allowed => line.includes(allowed))
}

let violations = []

for (const target of SCAN_DIRS) {
  const full = path.join(ROOT, target)
  if (!fs.existsSync(full)) continue
  const files = fs.statSync(full).isDirectory() ? walk(full) : [full]

  for (const file of files) {
    const rel = path.relative(ROOT, file)

    // Filename itself (incl. image filenames, URL slugs expressed as paths)
    if (BANNED.test(path.basename(file))) {
      violations.push(`${rel}: banned word in filename`)
    }
    BANNED.lastIndex = 0

    const ext = path.extname(file)
    if (!EXTENSIONS.has(ext)) continue

    const content = fs.readFileSync(file, 'utf8')
    const lines = content.split('\n')
    lines.forEach((line, i) => {
      BANNED.lastIndex = 0
      if (BANNED.test(line) && !isAllowlisted(line)) {
        violations.push(`${rel}:${i + 1}: ${line.trim().slice(0, 120)}`)
      }
    })
  }
}

if (violations.length) {
  console.error('\n✖ Banned trading-restriction words found (TfL licence condition):\n')
  violations.forEach(v => console.error('  ' + v))
  console.error(`\n${violations.length} violation(s). Fix the copy, or add an exact-string exception to ALLOWLIST in scripts/check-banned-terms.cjs after manual review.\n`)
  process.exit(1)
} else {
  console.log('✓ No banned trading-restriction words found.')
}
