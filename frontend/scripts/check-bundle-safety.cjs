#!/usr/bin/env node
// ============================================================
// check-bundle-safety.js — Haraka Transport
// Runs after `vite build`. Two checks against the actual shipped output:
//   1. No banned trading-restriction words survived into the bundle
//      (belt-and-suspenders on top of check-banned-terms.js, which only
//      scans source — this catches anything reintroduced via a dependency
//      or string concatenation Vite inlined).
//   2. No backend secret ever ended up in frontend JavaScript. These
//      names must only ever exist in backend env vars — if one of these
//      literal strings appears in a file we're about to serve to a
//      browser, something imported/leaked server config into the client
//      bundle, and that is a release blocker.
// ============================================================

const fs = require('fs')
const path = require('path')

const DIST = path.join(__dirname, '..', 'dist')
const BANNED = /\b(taxi|taxis|cab|cabs|minicab|minicabs)\b/gi
const ALLOWLIST = [
  'https://tfl.gov.uk/info-for/taxis-and-private-hire/licensing/licence-checker',
]
const SECRET_NAMES = [
  'MOT_CLIENT_SECRET', 'MOT_API_KEY', 'MOT_CLIENT_ID',
  'PHOTO_TOKEN_SECRET', 'RESEND_API_KEY', 'JWT_SECRET',
  'TWILIO_AUTH_TOKEN', 'VONAGE_API_SECRET', 'DVSA_CLIENT_SECRET',
]

if (!fs.existsSync(DIST)) {
  console.error('✖ dist/ not found — run this after vite build')
  process.exit(1)
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, files)
    else files.push(full)
  }
  return files
}

let problems = []
for (const file of walk(DIST)) {
  if (!/\.(js|html|css|map)$/.test(file)) continue
  const content = fs.readFileSync(file, 'utf8')
  const rel = path.relative(DIST, file)

  BANNED.lastIndex = 0
  let m
  while ((m = BANNED.exec(content))) {
    const context = content.slice(Math.max(0, m.index - 60), m.index + 60)
    if (!ALLOWLIST.some(a => context.includes(a))) {
      problems.push(`${rel}: banned word "${m[0]}" — context: …${context.replace(/\s+/g, ' ')}…`)
    }
  }

  for (const secret of SECRET_NAMES) {
    if (content.includes(secret)) {
      problems.push(`${rel}: found secret env var name "${secret}" in shipped bundle`)
    }
  }
}

if (problems.length) {
  console.error('\n✖ Bundle safety check failed:\n')
  problems.forEach(p => console.error('  ' + p))
  console.error(`\n${problems.length} problem(s). Do not deploy this build.\n`)
  process.exit(1)
} else {
  console.log('✓ Bundle safety check passed — no banned words, no leaked secret names.')
}
