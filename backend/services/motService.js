// ============================================================
// services/motService.js — Haraka Transport
// DVSA MOT History API integration. Replaces manually-typed MOT expiry
// dates with real data, and backs the public MOT-check widget on /verify.
//
// Setup: apply at https://documentation.history.mot.api.gov.uk/ (free,
// DVSA manually approves each application). Once approved you get a
// client ID + secret (OAuth2 client-credentials), a scope, a token URL,
// and a separate API key sent as X-API-Key on every request. Put these
// in Render env vars — see backend/.env.example:
//   MOT_CLIENT_ID, MOT_CLIENT_SECRET, MOT_API_KEY, MOT_SCOPE_URL, MOT_TOKEN_URL
//
// None of these credentials ever reach the browser — every call here runs
// server-side only. Tokens last ~60 minutes; cached in memory and
// refreshed at 55 minutes so we never request a new one per call.
// ============================================================

const MOT_CLIENT_ID     = process.env.MOT_CLIENT_ID
const MOT_CLIENT_SECRET = process.env.MOT_CLIENT_SECRET
const MOT_API_KEY       = process.env.MOT_API_KEY
const MOT_SCOPE_URL     = process.env.MOT_SCOPE_URL
const MOT_TOKEN_URL     = process.env.MOT_TOKEN_URL
const MOT_API_BASE_URL  = process.env.MOT_API_BASE_URL || 'https://history.mot.api.gov.uk/v1/trade/vehicles/registration'

const isConfigured = () =>
  !!(MOT_CLIENT_ID && MOT_CLIENT_SECRET && MOT_API_KEY && MOT_SCOPE_URL && MOT_TOKEN_URL)

class MotApiError extends Error {
  constructor(code, message) {
    super(message)
    this.code = code // 'NOT_FOUND' | 'RATE_LIMITED' | 'UPSTREAM_ERROR'
  }
}

let cachedToken = null // { accessToken, expiresAt }

async function getAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.accessToken

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: MOT_CLIENT_ID,
    client_secret: MOT_CLIENT_SECRET,
    scope: MOT_SCOPE_URL,
  })
  const r = await fetch(MOT_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!r.ok) throw new MotApiError('UPSTREAM_ERROR', `MOT token request failed: ${r.status}`)
  const data = await r.json()
  // Refresh at 55 minutes regardless of the token's actual TTL, per DVSA guidance.
  cachedToken = { accessToken: data.access_token, expiresAt: Date.now() + 55 * 60 * 1000 }
  return cachedToken.accessToken
}

// Raw DVSA lookup. Throws MotApiError with a distinct .code for 404/429/5xx
// so callers can handle each case — never let a raw DVSA error reach a user.
async function getMotHistory(registration) {
  if (!isConfigured()) return null
  const token = await getAccessToken()
  const r = await fetch(`${MOT_API_BASE_URL}/${encodeURIComponent(registration)}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-API-Key': MOT_API_KEY,
      'Accept': 'application/json',
    },
  })
  if (r.status === 404) throw new MotApiError('NOT_FOUND', 'No MOT record for this registration')
  if (r.status === 429) throw new MotApiError('RATE_LIMITED', 'DVSA API throttled this request')
  if (!r.ok) throw new MotApiError('UPSTREAM_ERROR', `DVSA MOT lookup failed: ${r.status}`)
  return r.json()
}

function latestPassedTest(data) {
  const tests = (data?.motTests || [])
    .slice()
    .sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate))
  return tests.find(t => (t.testResult || '').toUpperCase() === 'PASSED' && t.expiryDate) || null
}

// Normalized {motExpiry, testResult, checkedAt} for one registration, or
// null when DVSA has nothing conclusive (not found, or no passed test) —
// callers should leave any existing motExpiry untouched in that case.
async function fetchMotByRegistration(registration) {
  if (!isConfigured()) {
    console.log('  ◆  MOT lookup skipped (no MOT_* env vars set)')
    return null
  }
  let data
  try {
    data = await getMotHistory(registration)
  } catch (e) {
    if (e.code === 'NOT_FOUND') return null
    throw e
  }
  const pass = latestPassedTest(data)
  if (!pass) return null
  return {
    motExpiry: pass.expiryDate.split('T')[0],
    testResult: pass.testResult,
    checkedAt: new Date().toISOString(),
  }
}

// Nightly job: refresh motExpiry for every vehicle, and enforce the
// suspension rule — a vehicle whose MOT has lapsed (or has no valid test
// on DVSA's record) is withdrawn from assignment together with its driver.
// Only touches vehicles/drivers currently 'active' or 'suspended' so it
// never overrides a manually-set status like 'retired' or 'inactive'.
async function syncAllVehicles(db) {
  if (!isConfigured()) {
    console.log('  ◆  MOT sync skipped (no MOT_* env vars set)')
    return { checked: 0, updated: 0, suspended: 0, restored: 0, failed: 0, skipped: true }
  }

  const vehicles = await new Promise((resolve, reject) => {
    db.all(`SELECT id, registration, status, assignedDriverId FROM vehicles WHERE status IN ('active','suspended')`,
      [], (err, rows) => err ? reject(err) : resolve(rows || []))
  })

  console.log(`\n  ◆  MOT sync: checking ${vehicles.length} vehicle(s)…`)
  let updated = 0, suspended = 0, restored = 0, failed = 0

  for (const v of vehicles) {
    try {
      const result = await fetchMotByRegistration(v.registration)
      const today = new Date().toISOString().split('T')[0]
      const hasValidMot = !!result && result.motExpiry > today

      await new Promise((resolve, reject) => {
        if (result) {
          db.run(
            `UPDATE vehicles SET motExpiry=?, motSource='dvsa_api', motTestResult=?, motLastCheckedAt=CURRENT_TIMESTAMP WHERE id=?`,
            [result.motExpiry, result.testResult, v.id],
            (err) => err ? reject(err) : resolve()
          )
        } else {
          db.run(`UPDATE vehicles SET motLastCheckedAt=CURRENT_TIMESTAMP WHERE id=?`, [v.id], (err) => err ? reject(err) : resolve())
        }
      })
      if (result) updated++

      if (!hasValidMot && v.status === 'active') {
        await new Promise((resolve, reject) => {
          db.run(`UPDATE vehicles SET status='suspended' WHERE id=?`, [v.id], (err) => err ? reject(err) : resolve())
        })
        if (v.assignedDriverId) {
          await new Promise((resolve, reject) => {
            db.run(`UPDATE drivers SET status='suspended' WHERE id=? AND status='active'`, [v.assignedDriverId], (err) => err ? reject(err) : resolve())
          })
        }
        suspended++
        console.log(`  ◆  MOT sync: suspended vehicle ${v.registration} (expired/no valid MOT on record)`)
      } else if (hasValidMot && v.status === 'suspended') {
        await new Promise((resolve, reject) => {
          db.run(`UPDATE vehicles SET status='active' WHERE id=?`, [v.id], (err) => err ? reject(err) : resolve())
        })
        if (v.assignedDriverId) {
          await new Promise((resolve, reject) => {
            db.run(`UPDATE drivers SET status='active' WHERE id=? AND status='suspended'`, [v.assignedDriverId], (err) => err ? reject(err) : resolve())
          })
        }
        restored++
        console.log(`  ◆  MOT sync: restored vehicle ${v.registration} (valid MOT now on record)`)
      }
    } catch (e) {
      failed++
      console.error(`  ◆  MOT sync error for ${v.registration}:`, e.message)
    }
  }

  console.log(`  ◆  MOT sync done: ${updated} updated, ${suspended} suspended, ${restored} restored, ${failed} failed, ${vehicles.length} checked`)
  return { checked: vehicles.length, updated, suspended, restored, failed, skipped: false }
}

// Public-widget lookup (/api/public/mot-check) — 24h SQLite cache so an
// anonymous visitor checking the same plate repeatedly doesn't burn quota.
// Returns only a minimal summary, never the full history/mileage/notes.
async function checkMotCached(db, registration) {
  const reg = registration.toUpperCase().replace(/\s+/g, '')

  const cached = await new Promise((resolve, reject) => {
    db.get(`SELECT * FROM mot_cache WHERE registration=?`, [reg], (err, row) => err ? reject(err) : resolve(row))
  })
  const dayMs = 24 * 60 * 60 * 1000
  if (cached && (Date.now() - new Date(cached.checkedAt).getTime()) < dayMs) {
    return { motStatus: cached.motStatus, motExpiryDate: cached.motExpiry, testDate: cached.testDate }
  }

  let summary
  try {
    const data = await getMotHistory(reg)
    const pass = latestPassedTest(data)
    const today = new Date().toISOString().split('T')[0]
    summary = pass
      ? { motStatus: pass.expiryDate.split('T')[0] > today ? 'Valid' : 'Expired', motExpiryDate: pass.expiryDate.split('T')[0], testDate: pass.completedDate?.split('T')[0] || null }
      : { motStatus: 'No valid test on record', motExpiryDate: null, testDate: null }
  } catch (e) {
    if (e.code === 'NOT_FOUND') {
      summary = { motStatus: 'No details held for this registration', motExpiryDate: null, testDate: null }
    } else {
      throw e
    }
  }

  db.run(
    `INSERT INTO mot_cache (registration, motStatus, motExpiry, testDate, checkedAt) VALUES (?,?,?,?,CURRENT_TIMESTAMP)
     ON CONFLICT(registration) DO UPDATE SET motStatus=excluded.motStatus, motExpiry=excluded.motExpiry, testDate=excluded.testDate, checkedAt=CURRENT_TIMESTAMP`,
    [reg, summary.motStatus, summary.motExpiryDate, summary.testDate],
    () => {}
  )
  return summary
}

module.exports = {
  MotApiError, isConfigured, getAccessToken, getMotHistory,
  fetchMotByRegistration, syncAllVehicles, checkMotCached,
}
