// ============================================================
// expiryAlerts.js  —  Haraka Transport
// Daily check of all licence / DBS / MOT / insurance / tax expiry
// dates. Emails the ADMIN a summary, and emails each DRIVER about
// their own expiring documents. Uses the same Resend setup as
// server.js. Nothing here can break your booking flow — it only
// reads the database and sends email.
// ============================================================

const db = require('./db')

// --- Resend sender (same pattern as server.js) ---
const NOTIFY_FROM = process.env.NOTIFY_FROM || 'Haraka Transport <notifications@harakatransport.co.uk>'
const ADMIN_EMAIL = process.env.NOTIFY_TO   || 'admin@harakatransport.co.uk'
const WARN_DAYS   = parseInt(process.env.EXPIRY_WARN_DAYS || '30', 10) // 30-day advance warning

async function sendEmail(to, subject, html) {
  if (!process.env.RESEND_API_KEY) {
    console.log('  ◆  Expiry email skipped (no RESEND_API_KEY):', subject)
    return
  }
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: NOTIFY_FROM, to: [to], subject, html }),
    })
    if (!r.ok) console.error('  ◆  Expiry email failed:', r.status, await r.text())
    else console.log('  ◆  Expiry email sent:', subject, '->', to)
  } catch (e) {
    console.error('  ◆  Expiry email error:', e.message)
  }
}

// --- helpers ---
// A document is "expiring soon" if its date is between today and today+WARN_DAYS,
// OR already in the past (overdue). Dates are stored as text (YYYY-MM-DD).
function daysUntil(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d)) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  return Math.round((d - today) / 86400000)
}

function flag(label, dateStr) {
  const n = daysUntil(dateStr)
  if (n === null) return null                 // no date on file
  if (n < 0)  return { label, dateStr, n, status: `OVERDUE by ${-n} day(s)` }
  if (n <= WARN_DAYS) return { label, dateStr, n, status: `expires in ${n} day(s)` }
  return null                                  // still valid, far off
}

function rowsHtml(items) {
  return items.map(i =>
    `<tr>
       <td style="padding:4px 12px 4px 0;font-weight:bold">${i.label}</td>
       <td style="padding:4px 12px 4px 0">${i.dateStr}</td>
       <td style="padding:4px 0;color:${i.n < 0 ? '#b00020' : '#9a6700'}">${i.status}</td>
     </tr>`
  ).join('')
}

// --- main check ---
function runExpiryCheck() {
  console.log(`\n  ◆  Running expiry check (warning window: ${WARN_DAYS} days)…`)

  // 1) DRIVERS
  db.all('SELECT * FROM drivers', [], async (err, drivers) => {
    if (err) { console.error('Expiry check drivers error:', err.message); return }

    const adminDriverBlocks = []

    for (const d of drivers || []) {
      const items = [
        flag('DVLA licence',    d.dvlaExpiry),
        flag('PCO/TfL licence', d.pcoExpiry),
        flag('Enhanced DBS',    d.dbsExpiry),
      ].filter(Boolean)

      if (items.length) {
        const name = `${d.firstName || ''} ${d.lastName || ''}`.trim() || `Driver #${d.id}`

        // Email the driver about their own documents
        if (d.email) {
          await sendEmail(
            d.email,
            `Action needed: your documents are expiring — Haraka Transport`,
            `<h2>Document renewal reminder</h2>
             <p>Hi ${d.firstName || 'there'}, the following document(s) on your Haraka Transport record need attention:</p>
             <table>${rowsHtml(items)}</table>
             <p>Please renew and send updated evidence to ${ADMIN_EMAIL} as soon as possible. Until valid evidence is on file, you cannot be assigned journeys.</p>
             <p style="color:#888;font-size:12px">Automated reminder from Haraka Transport Limited.</p>`
          )
        }

        // Add to the admin summary
        adminDriverBlocks.push(
          `<tr><td colspan="3" style="padding:10px 0 2px;font-weight:bold;border-top:1px solid #ddd">
             ${name} ${d.email ? `(${d.email})` : ''} ${d.phone ? '· ' + d.phone : ''}
           </td></tr>${rowsHtml(items)}`
        )
      }
    }

    // 2) VEHICLES
    db.all('SELECT * FROM vehicles', [], async (err2, vehicles) => {
      if (err2) { console.error('Expiry check vehicles error:', err2.message); return }

      const adminVehicleBlocks = []

      for (const v of vehicles || []) {
        const items = [
          flag('MOT',          v.motExpiry),
          flag('Road tax',     v.taxExpiry),
          flag('Insurance',    v.insuranceExpiry),
          flag('PCO plate',    v.pcoPlateExpiry),
        ].filter(Boolean)

        if (items.length) {
          const veh = `${v.make || ''} ${v.model || ''} (${v.registration || 'no reg'})`.trim()
          adminVehicleBlocks.push(
            `<tr><td colspan="3" style="padding:10px 0 2px;font-weight:bold;border-top:1px solid #ddd">
               Vehicle: ${veh}
             </td></tr>${rowsHtml(items)}`
          )
        }
      }

      // 3) ADMIN SUMMARY EMAIL
      const hasDrivers  = adminDriverBlocks.length > 0
      const hasVehicles = adminVehicleBlocks.length > 0

      if (!hasDrivers && !hasVehicles) {
        console.log('  ◆  Expiry check: nothing expiring within window. No admin email sent.')
        return
      }

      const html = `
        <h2>Haraka Transport — documents expiring within ${WARN_DAYS} days</h2>
        ${hasDrivers ? `<h3>Drivers / Passenger Assistants</h3><table>${adminDriverBlocks.join('')}</table>` : ''}
        ${hasVehicles ? `<h3>Vehicles</h3><table>${adminVehicleBlocks.join('')}</table>` : ''}
        <p style="color:#888;font-size:12px">Automated daily check. Overdue items in red — suspend from assignment until renewed.</p>`

      await sendEmail(ADMIN_EMAIL, `Haraka Transport: document expiry summary`, html)
    })
  })
}

module.exports = { runExpiryCheck }
