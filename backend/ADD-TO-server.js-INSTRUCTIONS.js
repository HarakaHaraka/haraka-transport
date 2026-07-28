// ============================================================
// WIRING INSTRUCTIONS — add these to your existing backend/server.js
// ============================================================
//
// You already have Resend notifications deployed ("Add email notifications
// for bookings, quotes and recruitment"). These two additions:
//   (A) run the daily document-expiry check
//   (B) send the CUSTOMER a confirmation when they submit a booking/quote
//
// ------------------------------------------------------------
// PART A — DAILY EXPIRY ALERTS
// ------------------------------------------------------------
//
// 1. Put the file  expiryAlerts.js  in your  backend/  folder
//    (same folder as server.js and db.js).
//
// 2. Near the TOP of server.js, with your other require() lines, add:

const { runExpiryCheck } = require('./expiryAlerts')

// 3. Near the BOTTOM of server.js, AFTER  app.listen(...), add this.
//    It runs the check once on startup, then every 24 hours.
//    (No extra library needed — plain setInterval.)

//   --- run once shortly after boot, then daily ---
setTimeout(runExpiryCheck, 20 * 1000)                 // 20s after start
setInterval(runExpiryCheck, 24 * 60 * 60 * 1000)      // every 24 hours

// 4. Add an on-demand route so you can trigger it manually / test it,
//    and so an external free scheduler can ping it once a day.
//    Put this with your other app.get(...) routes:

app.get('/api/run-expiry-check', (req, res) => {
  runExpiryCheck()
  res.json({ ok: true, message: 'Expiry check triggered' })
})

// NOTE ON RENDER FREE TIER: your free instance "spins down with inactivity",
// so setInterval may pause when the app sleeps. To guarantee a daily run,
// use a free external cron (e.g. cron-job.org) to GET this URL once a day:
//     https://haraka-transport.onrender.com/api/run-expiry-check
// That both wakes the app and runs the check. Set it for ~7am daily.
//
// ------------------------------------------------------------
// PART B — CUSTOMER BOOKING CONFIRMATION
// ------------------------------------------------------------
//
// You already email YOURSELF on new bookings via notifyMe(). This adds a
// confirmation email to the CUSTOMER too. Find your existing
//     app.post('/api/bookings', ...)
// route. Right AFTER the row is inserted and you call notifyMe(...),
// add a second send to the customer. Example using the same fetch pattern:

async function emailCustomer(booking, refId) {
  if (!process.env.RESEND_API_KEY || !booking.email) return
  const isQuote = booking.type === 'quote'
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM || 'Haraka Transport <notifications@harakatransport.co.uk>',
        to: [booking.email],
        subject: isQuote
          ? `We\u2019ve received your quote request — Haraka Transport`
          : `Your booking request is confirmed — Haraka Transport (ref #${refId})`,
        html: `
          <h2>Thank you, ${booking.firstName || ''}</h2>
          <p>${isQuote
            ? 'We\u2019ve received your quote request and will get back to you shortly with a price.'
            : `We\u2019ve received your booking request. Your reference is <b>#${refId}</b>.`}</p>
          <table>
            ${booking.serviceType   ? `<tr><td style="padding:3px 12px 3px 0"><b>Service</b></td><td>${booking.serviceType}</td></tr>` : ''}
            ${booking.pickupAddress ? `<tr><td style="padding:3px 12px 3px 0"><b>Pick-up</b></td><td>${booking.pickupAddress}</td></tr>` : ''}
            ${booking.dropoffAddress? `<tr><td style="padding:3px 12px 3px 0"><b>Drop-off</b></td><td>${booking.dropoffAddress}</td></tr>` : ''}
            ${booking.pickupDate    ? `<tr><td style="padding:3px 12px 3px 0"><b>Date</b></td><td>${booking.pickupDate} ${booking.pickupTime || ''}</td></tr>` : ''}
          </table>
          <p>If anything is wrong, reply to this email or call us on 07849 549740.</p>
          <p style="color:#888;font-size:12px">Haraka Transport Limited · TfL Licensed Private Hire · harakatransport.co.uk</p>`,
      }),
    })
  } catch (e) {
    console.error('  ◆  Customer email error:', e.message)  // never breaks the booking
  }
}

// Then inside your /api/bookings route, after the insert succeeds
// (where you already have `this.lastID` and call notifyMe), add:
//
//     emailCustomer(req.body, this.lastID)
//
// Full shape of that part of the route becomes:
//
//   function(err) {
//     if (err) return res.status(500).json({ error: err.message })
//     notifyMe(`New ${d.type||'booking'} #${this.lastID}`, req.body)  // you (existing)
//     emailCustomer(req.body, this.lastID)                            // customer (NEW)
//     res.status(201).json({ id: this.lastID, success: true })
//   }
//
// ------------------------------------------------------------
// DONE. Commit & push; Render auto-deploys.
//   git add .
//   git commit -m "Add expiry alerts + customer booking confirmation"
//   git push
// Then test: visit /api/run-expiry-check once to confirm the expiry email,
// and submit a test quote to confirm the customer confirmation email.
// ------------------------------------------------------------
