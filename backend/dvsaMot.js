// ============================================================
// dvsaMot.js — Haraka Transport
// Replaces manually-typed MOT expiry dates with real data from DVSA's
// MOT History API, so a driver can't just tell you a date that isn't true.
//
// Setup (do this once, outside this codebase):
//   1. Apply for access at https://documentation.history.mot.api.gov.uk/
//      (free, but DVSA manually approves each application — takes a few
//      days). Describe the use case as "verifying MOT status for our own
//      licensed private hire fleet".
//   2. DVSA will issue: a client ID + client secret (for an OAuth2
//      client-credentials token exchange), a scope, a token URL, and a
//      separate API key sent as X-API-Key on every request.
//   3. Put those in backend/.env (see .env.example) as:
//        DVSA_CLIENT_ID, DVSA_CLIENT_SECRET, DVSA_TOKEN_URL, DVSA_SCOPE,
//        DVSA_API_KEY
//      DVSA_API_BASE_URL has a working default and normally doesn't need
//      to be set.
//   4. Confirm the exact request/response shape against the docs DVSA
//      sends you when approved — the fields read below (motTests[],
//      expiryDate, testResult) match the published Trade API schema at
//      the time this was written, but DVSA versions this API and it's
//      worth a quick diff against your onboarding docs before relying on it.
//
// Until those env vars are set, every function here is a no-op that logs
// and returns — it will never throw, and it will never overwrite a manually
// entered date with nothing.
// ============================================================

const DVSA_CLIENT_ID     = process.env.DVSA_CLIENT_ID
const DVSA_CLIENT_SECRET = process.env.DVSA_CLIENT_SECRET
const DVSA_TOKEN_URL     = process.env.DVSA_TOKEN_URL
const DVSA_SCOPE         = process.env.DVSA_SCOPE
const DVSA_API_KEY       = process.env.DVSA_API_KEY
const DVSA_API_BASE_URL  = process.env.DVSA_API_BASE_URL || 'https://history.mot.api.gov.uk/v1/trade/vehicles/registration'

const isConfigured = () =>
  !!(DVSA_CLIENT_ID && DVSA_CLIENT_SECRET && DVSA_TOKEN_URL && DVSA_API_KEY)

// Cached in memory — client-credentials tokens are valid for a while
// (DVSA typically issues ~1hr tokens); refresh a little before expiry.
let cachedToken = null // { accessToken, expiresAt }

async function getAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.accessToken
  }
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: DVSA_CLIENT_ID,
    client_secret: DVSA_CLIENT_SECRET,
    scope: DVSA_SCOPE || '',
  })
  const r = await fetch(DVSA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!r.ok) throw new Error(`DVSA token request failed: ${r.status} ${await r.text()}`)
  const data = await r.json()
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
  }
  return cachedToken.accessToken
}

// Looks up one registration. Returns { motExpiry, testResult, checkedAt }
// on a usable result, or null when DVSA has nothing conclusive to say
// (vehicle not found, or no passed test on record) — callers should leave
// the existing motExpiry untouched in that case rather than blank it.
async function fetchMotByRegistration(registration) {
  if (!isConfigured()) {
    console.log('  ◆  DVSA MOT lookup skipped (no DVSA_* env vars set)')
    return null
  }
  const token = await getAccessToken()
  const r = await fetch(`${DVSA_API_BASE_URL}/${encodeURIComponent(registration)}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-API-Key': DVSA_API_KEY,
      'Accept': 'application/json',
    },
  })
  if (r.status === 404) return null // no MOT history for this registration
  if (!r.ok) throw new Error(`DVSA MOT lookup failed for ${registration}: ${r.status} ${await r.text()}`)

  const data = await r.json()
  const tests = (data.motTests || [])
    .slice()
    .sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate))
  const latestPass = tests.find(t => (t.testResult || '').toUpperCase() === 'PASSED' && t.expiryDate)
  if (!latestPass) return null

  return {
    motExpiry: latestPass.expiryDate.split('T')[0],
    testResult: latestPass.testResult,
    checkedAt: new Date().toISOString(),
  }
}

// Refreshes motExpiry for every vehicle in the DB by registration.
// Never throws — a bad registration or a DVSA hiccup is logged and
// skipped so it can't take down the nightly job or another vehicle's sync.
async function syncAllVehicles(db) {
  if (!isConfigured()) {
    console.log('  ◆  DVSA MOT sync skipped (no DVSA_* env vars set)')
    return { checked: 0, updated: 0, failed: 0, skipped: true }
  }

  const vehicles = await new Promise((resolve, reject) => {
    db.all('SELECT id, registration FROM vehicles', [], (err, rows) => err ? reject(err) : resolve(rows || []))
  })

  console.log(`\n  ◆  DVSA MOT sync: checking ${vehicles.length} vehicle(s)…`)
  let updated = 0, failed = 0

  for (const v of vehicles) {
    try {
      const result = await fetchMotByRegistration(v.registration)
      if (!result) continue
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE vehicles SET motExpiry=?, motSource='dvsa_api', motTestResult=?, motLastCheckedAt=CURRENT_TIMESTAMP WHERE id=?`,
          [result.motExpiry, result.testResult, v.id],
          (err) => err ? reject(err) : resolve()
        )
      })
      updated++
    } catch (e) {
      failed++
      console.error(`  ◆  DVSA MOT sync error for ${v.registration}:`, e.message)
    }
  }

  console.log(`  ◆  DVSA MOT sync done: ${updated} updated, ${failed} failed, ${vehicles.length} checked`)
  return { checked: vehicles.length, updated, failed, skipped: false }
}

module.exports = { fetchMotByRegistration, syncAllVehicles, isConfigured }
