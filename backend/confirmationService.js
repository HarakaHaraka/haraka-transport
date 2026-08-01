// ============================================================
// confirmationService.js — Haraka Transport
// Assembles the TfL-required booking confirmation (driver first name,
// PCO licence number, vehicle registration, photo where available) and
// sends it by email (Resend, inline cid photo) and SMS (smsService).
// ============================================================

const fs = require('fs')
const path = require('path')
const photoService = require('./photoService')
const { sendSms } = require('./smsService')
const { COMPANY } = require('./companyConfig')

const NOTIFY_FROM = process.env.NOTIFY_FROM || 'Haraka Transport <notifications@harakatransport.co.uk>'
const REPLY_TO    = process.env.REPLY_TO    || 'Admin@harakatransport.co.uk'

function getRow(db, sql, params) {
  return new Promise((resolve, reject) => db.get(sql, params, (err, row) => err ? reject(err) : resolve(row)))
}
function runSql(db, sql, params) {
  return new Promise((resolve, reject) => db.run(sql, params, function (err) { err ? reject(err) : resolve(this) }))
}

// Builds the confirmation payload from a booking or a route. Throws
// (fail loudly) if the assigned driver has no PCO licence number, or the
// assigned vehicle has no registration — we never send a confirmation
// that's missing the details TfL requires it to carry.
async function assembleConfirmation(db, { source, id }) {
  let row, driver, vehicle, assistant, booking

  if (source === 'booking') {
    row = await getRow(db, 'SELECT * FROM bookings WHERE id=?', [id])
    if (!row) throw new Error('Booking not found')
    booking = row
    if (row.assignedDriverId)    driver    = await getRow(db, 'SELECT * FROM drivers WHERE id=?', [row.assignedDriverId])
    if (row.assignedVehicleId)   vehicle   = await getRow(db, 'SELECT * FROM vehicles WHERE id=?', [row.assignedVehicleId])
    if (row.assignedAssistantId) assistant = await getRow(db, 'SELECT * FROM drivers WHERE id=?', [row.assignedAssistantId])
  } else {
    row = await getRow(db, 'SELECT * FROM routes WHERE id=?', [id])
    if (!row) throw new Error('Route not found')
    if (row.driverId)    driver    = await getRow(db, 'SELECT * FROM drivers WHERE id=?', [row.driverId])
    if (row.vehicleId)   vehicle   = await getRow(db, 'SELECT * FROM vehicles WHERE id=?', [row.vehicleId])
    if (row.assistantId) assistant = await getRow(db, 'SELECT * FROM drivers WHERE id=?', [row.assistantId])
    if (row.bookingId)   booking   = await getRow(db, 'SELECT * FROM bookings WHERE id=?', [row.bookingId])
  }

  if (!driver)  throw new Error('No driver assigned — cannot assemble a confirmation')
  if (!vehicle) throw new Error('No vehicle assigned — cannot assemble a confirmation')
  if (!driver.pcoLicenceNumber) throw new Error(`Driver #${driver.id} has no PCO licence number on file — refusing to send an incomplete confirmation`)
  if (!vehicle.registration)    throw new Error(`Vehicle #${vehicle.id} has no registration on file — refusing to send an incomplete confirmation`)

  const pickupDateTime = source === 'booking'
    ? [row.pickupDate, row.pickupTime].filter(Boolean).join(' ')
    : [row.routeDate, row.departureTime].filter(Boolean).join(' ')

  const endDateTime = source === 'route' && row.expectedReturnTime
    ? [row.routeDate, row.expectedReturnTime].filter(Boolean).join(' ')
    : pickupDateTime

  return {
    source, id,
    passengerName: source === 'booking'
      ? `${row.firstName} ${row.lastName}`
      : (row.passengerName || (booking && `${booking.firstName} ${booking.lastName}`) || 'Passenger'),
    pickupAddress: row.pickupAddress,
    destinationAddress: row.dropoffAddress,
    pickupDateTime,
    endDateTime,
    driverFirstName: driver.firstName,
    driverId: driver.id,
    driverPcoLicenceNumber: driver.pcoLicenceNumber,
    driverPhotoPath: driver.photo_path || null,
    vehicleMake: vehicle.make,
    vehicleModel: vehicle.model,
    vehicleColour: vehicle.colour,
    vehicleRegistrationMark: vehicle.registration,
    passengerAssistantFirstName: assistant ? assistant.firstName : null,
    operatorContactPhone: COMPANY.phone,
    bookingReference: source === 'booking' ? row.id : (booking ? booking.id : row.id),
    recipientEmail: booking ? booking.email : (source === 'booking' ? row.email : null),
    recipientPhone: booking ? booking.phone : (source === 'booking' ? row.phone : null),
  }
}

function complianceFooterHtml() {
  const licenceLine = COMPANY.operatorLicenceNumber
    ? `TfL private hire operator's licence number: ${COMPANY.operatorLicenceNumber}`
    : COMPANY.operatorLicencePendingText
  return `
    <div style="margin-top:24px;padding-top:16px;border-top:1px solid #ddd;color:#888;font-size:11px;line-height:1.7">
      <p><strong>${COMPANY.legalName}</strong> · Licensed by Transport for London</p>
      <p>${licenceLine}</p>
      <p>Registered office: ${COMPANY.registeredOffice} · Company number: ${COMPANY.companyNumber}</p>
      <p>ICO registration: ${COMPANY.icoRegistration}</p>
      <p><a href="${COMPANY.siteUrl}/terms">Terms</a> · <a href="${COMPANY.siteUrl}/privacy">Privacy</a> · <a href="${COMPANY.siteUrl}/complaints">Complaints</a></p>
    </div>`
}

function buildEmailHtml(payload, hasPhoto) {
  return `
    <h2>${payload.source === 'route' ? 'Journey confirmation' : 'Booking confirmation'} — ref #${payload.bookingReference}</h2>
    <p>Passenger: <strong>${payload.passengerName}</strong></p>
    <table>
      <tr><td style="padding:3px 12px 3px 0"><b>Pick-up</b></td><td>${payload.pickupAddress || ''}</td></tr>
      <tr><td style="padding:3px 12px 3px 0"><b>Destination</b></td><td>${payload.destinationAddress || ''}</td></tr>
      <tr><td style="padding:3px 12px 3px 0"><b>Date/time</b></td><td>${payload.pickupDateTime}</td></tr>
      <tr><td style="padding:3px 12px 3px 0"><b>Driver</b></td><td>${payload.driverFirstName} — PCO licence ${payload.driverPcoLicenceNumber}</td></tr>
      ${payload.passengerAssistantFirstName ? `<tr><td style="padding:3px 12px 3px 0"><b>Passenger assistant</b></td><td>${payload.passengerAssistantFirstName}</td></tr>` : ''}
      <tr><td style="padding:3px 12px 3px 0"><b>Vehicle</b></td><td>${payload.vehicleColour || ''} ${payload.vehicleMake} ${payload.vehicleModel} — ${payload.vehicleRegistrationMark}</td></tr>
    </table>
    ${hasPhoto ? `<p><img src="cid:driverphoto" alt="Photo of ${payload.driverFirstName}" style="max-width:200px;border-radius:8px;margin-top:12px" /></p>` : ''}
    <p style="margin-top:16px">Questions during your journey: call ${payload.operatorContactPhone}.</p>
    ${complianceFooterHtml()}`
}

function buildEmailText(payload) {
  return [
    `${payload.source === 'route' ? 'Journey confirmation' : 'Booking confirmation'} — ref #${payload.bookingReference}`,
    `Passenger: ${payload.passengerName}`,
    `Pick-up: ${payload.pickupAddress || ''}`,
    `Destination: ${payload.destinationAddress || ''}`,
    `Date/time: ${payload.pickupDateTime}`,
    `Driver: ${payload.driverFirstName} — PCO licence ${payload.driverPcoLicenceNumber}`,
    payload.passengerAssistantFirstName ? `Passenger assistant: ${payload.passengerAssistantFirstName}` : null,
    `Vehicle: ${payload.vehicleColour || ''} ${payload.vehicleMake} ${payload.vehicleModel} — ${payload.vehicleRegistrationMark}`,
    `Questions during your journey: call ${payload.operatorContactPhone}.`,
    '',
    COMPANY.legalName + ' · Licensed by Transport for London',
    COMPANY.operatorLicenceNumber ? `Operator licence: ${COMPANY.operatorLicenceNumber}` : COMPANY.operatorLicencePendingText,
  ].filter(Boolean).join('\n')
}

function buildSmsBody(payload, shortLink) {
  const lines = [
    `Haraka Transport booking ${payload.bookingReference}`,
    `${payload.pickupDateTime}, ${(payload.pickupAddress || '').slice(0, 40)}`,
    `Driver: ${payload.driverFirstName}, PCO ${payload.driverPcoLicenceNumber}`,
    `Vehicle: ${payload.vehicleColour || ''} ${payload.vehicleMake} ${payload.vehicleModel}, ${payload.vehicleRegistrationMark}`,
    shortLink ? `Driver photo: ${shortLink}` : null,
    `Questions: ${payload.operatorContactPhone}`,
  ].filter(Boolean)
  return lines.join('\n').slice(0, 320)
}

async function sendEmail(payload) {
  if (!payload.recipientEmail) return { sent: false, reason: 'no_recipient_email' }
  if (!process.env.RESEND_API_KEY) {
    console.log('  ◆  Confirmation email skipped (no RESEND_API_KEY)')
    return { sent: false, reason: 'resend_not_configured' }
  }

  let attachments
  let hasPhoto = false
  if (payload.driverPhotoPath) {
    try {
      const buf = fs.readFileSync(photoService.photoPath(payload.driverPhotoPath))
      attachments = [{ filename: 'driver.jpg', content: buf.toString('base64'), content_id: 'driverphoto' }]
      hasPhoto = true
    } catch (e) {
      console.error('  ◆  Could not attach driver photo, omitting:', e.message)
    }
  }

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: NOTIFY_FROM,
        to: [payload.recipientEmail],
        reply_to: REPLY_TO,
        subject: `Your journey confirmation — ref #${payload.bookingReference}`,
        html: buildEmailHtml(payload, hasPhoto),
        text: buildEmailText(payload),
        ...(attachments ? { attachments } : {}),
      }),
    })
    if (!r.ok) throw new Error(`Resend: ${r.status} ${await r.text()}`)
    return { sent: true }
  } catch (e) {
    console.error('  ◆  Confirmation email error:', e.message)
    return { sent: false, reason: e.message }
  }
}

function computePhotoTokenExpiry(payload) {
  const end = new Date(payload.endDateTime.replace(' ', 'T'))
  if (!isNaN(end)) return end.getTime() + 24 * 60 * 60 * 1000
  // Fallback if the stored date/time couldn't be parsed — don't leave the link open indefinitely.
  console.error('  ◆  Could not parse journey date/time for photo token expiry, using 48h fallback')
  return Date.now() + 48 * 60 * 60 * 1000
}

async function sendSmsConfirmation(payload) {
  if (!payload.recipientPhone) return { sent: false, reason: 'no_recipient_phone' }

  let shortLink = null
  if (payload.driverPhotoPath && process.env.PHOTO_TOKEN_SECRET) {
    try {
      const token = photoService.signPhotoToken({ driverId: payload.driverId, exp: computePhotoTokenExpiry(payload) })
      shortLink = `${COMPANY.siteUrl}/p/${token}`
    } catch (e) {
      console.error('  ◆  Could not build photo link for SMS:', e.message)
    }
  }
  return sendSms(payload.recipientPhone, buildSmsBody(payload, shortLink))
}

// Sends both channels for one booking/route. Never throws — assembly
// failures (missing PCO number/registration) are logged loudly and
// returned as `error`, since the assignment itself already succeeded and
// this is a non-blocking side effect of it.
async function sendBookingConfirmation(db, { source, id }) {
  let payload
  try {
    payload = await assembleConfirmation(db, { source, id })
  } catch (e) {
    console.error(`  ✖  CONFIRMATION NOT SENT (${source} #${id}):`, e.message)
    return { sent: false, error: e.message }
  }

  const [emailResult, smsResult] = await Promise.all([sendEmail(payload), sendSmsConfirmation(payload)])
  return { sent: emailResult.sent || smsResult.sent, email: emailResult, sms: smsResult }
}

module.exports = { assembleConfirmation, sendBookingConfirmation }
