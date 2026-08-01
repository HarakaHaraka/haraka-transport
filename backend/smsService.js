// ============================================================
// smsService.js — Haraka Transport
// Sends booking-confirmation SMS. No provider was chosen yet, so both
// common UK-compatible options are wired behind SMS_PROVIDER — set that
// env var plus the matching credentials below and texts start sending;
// leave it unset and sendSms() no-ops safely (same pattern as Resend/DVSA).
//
//   SMS_PROVIDER=twilio   → TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER
//   SMS_PROVIDER=vonage   → VONAGE_API_KEY, VONAGE_API_SECRET, VONAGE_FROM_NUMBER
// ============================================================

const SMS_PROVIDER = (process.env.SMS_PROVIDER || '').toLowerCase()

async function sendViaTwilio(to, body) {
  const sid   = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from  = process.env.TWILIO_FROM_NUMBER
  const auth  = Buffer.from(`${sid}:${token}`).toString('base64')
  const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: to, From: from, Body: body }),
  })
  if (!r.ok) throw new Error(`Twilio send failed: ${r.status} ${await r.text()}`)
}

async function sendViaVonage(to, body) {
  const r = await fetch('https://rest.nexmo.com/sms/json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: process.env.VONAGE_API_KEY,
      api_secret: process.env.VONAGE_API_SECRET,
      from: process.env.VONAGE_FROM_NUMBER,
      to: to.replace(/^\+/, ''),
      text: body,
    }),
  })
  const data = await r.json()
  const status = data?.messages?.[0]?.status
  if (status !== '0') throw new Error(`Vonage send failed: ${data?.messages?.[0]?.['error-text'] || status}`)
}

function isConfigured() {
  if (SMS_PROVIDER === 'twilio') return !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER)
  if (SMS_PROVIDER === 'vonage') return !!(process.env.VONAGE_API_KEY && process.env.VONAGE_API_SECRET && process.env.VONAGE_FROM_NUMBER)
  return false
}

// Never throws — an SMS failure must not break a booking confirmation.
// Returns { sent: boolean, reason?: string }.
async function sendSms(to, body) {
  if (!to) return { sent: false, reason: 'no_recipient_number' }
  if (!isConfigured()) {
    console.log('  ◆  SMS skipped (no SMS_PROVIDER configured):', body.slice(0, 40) + '…')
    return { sent: false, reason: 'not_configured' }
  }
  try {
    if (SMS_PROVIDER === 'twilio') await sendViaTwilio(to, body)
    else if (SMS_PROVIDER === 'vonage') await sendViaVonage(to, body)
    console.log(`  ◆  SMS sent to ${to}`)
    return { sent: true }
  } catch (e) {
    console.error('  ◆  SMS send error:', e.message)
    return { sent: false, reason: e.message }
  }
}

module.exports = { sendSms, isConfigured }
