// ============================================================
// photoService.js — Haraka Transport
// Driver photo pipeline: validate → strip EXIF → resize → store outside
// any statically-served directory → serve only via signed, expiring,
// single-purpose tokens (never a guessable /uploads/-style URL).
// ============================================================

const fs     = require('fs')
const path   = require('path')
const crypto = require('crypto')
const sharp  = require('sharp')

const PHOTO_DIR = process.env.PHOTO_STORAGE_DIR || path.join(__dirname, 'driver-photos')
if (!fs.existsSync(PHOTO_DIR)) fs.mkdirSync(PHOTO_DIR, { recursive: true })

const PHOTO_TOKEN_SECRET = process.env.PHOTO_TOKEN_SECRET || ''
const MAX_BYTES = 5 * 1024 * 1024

// Magic-byte sniffing — never trust the client-supplied MIME type or
// filename extension for something we're about to re-encode and serve.
function detectImageType(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return 'image/jpeg'
  if (buffer.length >= 8 &&
      buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47 &&
      buffer[4] === 0x0D && buffer[5] === 0x0A && buffer[6] === 0x1A && buffer[7] === 0x0A) return 'image/png'
  return null
}

// Re-encodes to strip EXIF (phone photos carry GPS — a driver's home
// location must never end up in a file we hand to a customer), resizes,
// and writes under a random name so it can't be guessed from the
// driver's name. Returns the stored filename.
async function processAndSavePhoto(buffer) {
  const type = detectImageType(buffer)
  if (!type) throw new Error('File is not a valid JPEG or PNG image')
  if (buffer.length > MAX_BYTES) throw new Error('Image exceeds 5MB limit')

  const filename = `${crypto.randomUUID()}.jpg`
  await sharp(buffer)
    .rotate() // apply EXIF orientation before it gets stripped
    .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 82 })
    .toFile(path.join(PHOTO_DIR, filename))

  return filename
}

function deletePhoto(filename) {
  if (!filename) return
  const p = path.join(PHOTO_DIR, filename)
  fs.unlink(p, (err) => {
    if (err && err.code !== 'ENOENT') console.error('  ◆  Photo delete error:', err.message)
  })
}

function photoPath(filename) {
  return path.join(PHOTO_DIR, filename)
}

// ── Signed, single-purpose, expiring photo access tokens ──────────────
// Payload carries the driver id and the intended expiry (24h after the
// journey end time, computed by the caller). HMAC prevents forging a
// token for a different driver or extending its expiry.
function base64url(input) {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function base64urlDecode(input) {
  return Buffer.from(input.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
}

function signPhotoToken({ driverId, exp }) {
  if (!PHOTO_TOKEN_SECRET) throw new Error('PHOTO_TOKEN_SECRET is not configured')
  const payload = base64url(JSON.stringify({ d: driverId, exp }))
  const sig = crypto.createHmac('sha256', PHOTO_TOKEN_SECRET).update(payload).digest('hex')
  return `${payload}.${sig}`
}

// Returns { driverId } if the token is valid and unexpired, else null.
function verifyPhotoToken(token) {
  if (!PHOTO_TOKEN_SECRET || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [payload, sig] = parts
  // Buffer.from(str,'hex') silently truncates at the first non-hex char
  // rather than throwing, so reject anything that isn't a clean, exact
  // 64-char SHA-256 hex digest before it ever reaches timingSafeEqual.
  if (!/^[0-9a-f]{64}$/.test(sig)) return null
  const expected = crypto.createHmac('sha256', PHOTO_TOKEN_SECRET).update(payload).digest('hex')
  const a = Buffer.from(sig, 'hex')
  const b = Buffer.from(expected, 'hex')
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  try {
    const { d, exp } = JSON.parse(base64urlDecode(payload))
    if (typeof exp !== 'number' || Date.now() > exp) return null
    return { driverId: d }
  } catch {
    return null
  }
}

module.exports = {
  PHOTO_DIR, detectImageType, processAndSavePhoto, deletePhoto, photoPath,
  signPhotoToken, verifyPhotoToken,
}
