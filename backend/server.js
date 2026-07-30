require('dotenv').config()
const express  = require('express')
const cors     = require('cors')
const path     = require('path')
const jwt      = require('jsonwebtoken')
const bcrypt   = require('bcrypt')
const multer   = require('multer')
const fs       = require('fs')
const db       = require('./db')
const { runExpiryCheck } = require('./expiryAlerts')
const dvsaMot  = require('./dvsaMot')

const app        = express()
const PORT       = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'haraka-change-this-secret-2025'

// ── Email notifications (Resend) ──────────────────────────────────
// Uses Node's built-in fetch — no npm package needed.
// Requires env vars: RESEND_API_KEY, NOTIFY_TO (your inbox).
const NOTIFY_FROM = process.env.NOTIFY_FROM || 'Haraka Transport <notifications@harakatransport.co.uk>'
const NOTIFY_TO   = process.env.NOTIFY_TO   || 'info@harakatransport.co.uk'

async function notifyMe(subject, data) {
  if (!process.env.RESEND_API_KEY) {
    console.log('  ◆  Email skipped (no RESEND_API_KEY set)')
    return
  }
  try {
    const rows = Object.entries(data)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) =>
        `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;vertical-align:top">${k}</td>` +
        `<td style="padding:4px 0">${String(v)}</td></tr>`)
      .join('')

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: NOTIFY_FROM,
        to: [NOTIFY_TO],
        subject,
        html: `<h2>${subject}</h2><table>${rows}</table>` +
              `<p style="color:#888;font-size:12px">Sent automatically by the Haraka API</p>`,
      }),
    })
    if (!r.ok) {
      console.error('  ◆  Email notify failed:', r.status, await r.text())
    } else {
      console.log(`  ◆  Email sent: ${subject}`)
    }
  } catch (e) {
    // Never let an email failure break the customer's submission
    console.error('  ◆  Email notify error:', e.message)
  }
}

// ── Customer confirmation email (Resend) ──────────────────────────
// Sends the customer a confirmation when they submit a booking or quote.
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
        from: NOTIFY_FROM,
        to: [booking.email],
        subject: isQuote
          ? 'We\u2019ve received your quote request \u2014 Haraka Transport'
          : `Your booking request is confirmed \u2014 Haraka Transport (ref #${refId})`,
        html: `<h2>Thank you, ${booking.firstName || ''}</h2>
          <p>${isQuote
            ? 'We\u2019ve received your quote request and will get back to you shortly with a price.'
            : `We\u2019ve received your booking request. Your reference is <b>#${refId}</b>.`}</p>
          <table>
            ${booking.serviceType    ? `<tr><td style="padding:3px 12px 3px 0"><b>Service</b></td><td>${booking.serviceType}</td></tr>` : ''}
            ${booking.pickupAddress  ? `<tr><td style="padding:3px 12px 3px 0"><b>Pick-up</b></td><td>${booking.pickupAddress}</td></tr>` : ''}
            ${booking.dropoffAddress ? `<tr><td style="padding:3px 12px 3px 0"><b>Drop-off</b></td><td>${booking.dropoffAddress}</td></tr>` : ''}
            ${booking.pickupDate     ? `<tr><td style="padding:3px 12px 3px 0"><b>Date</b></td><td>${booking.pickupDate} ${booking.pickupTime || ''}</td></tr>` : ''}
          </table>
          <p>If anything is wrong, reply to this email or call us on 07849 549740.</p>
          <p style="color:#888;font-size:12px">Haraka Transport Limited \u00b7 TfL Licensed Private Hire \u00b7 harakatransport.co.uk</p>`,
      }),
    })
    console.log(`  ◆  Customer confirmation sent to ${booking.email}`)
  } catch (e) {
    console.error('  ◆  Customer email error:', e.message)  // never breaks the booking
  }
}

// ── CORS ──────────────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET','POST','PATCH','DELETE'],
  allowedHeaders: ['Content-Type','Authorization'],
}))
app.options('*', cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: false }))

// ── File uploads ───────────────────────────────────────────────────
const UPLOAD_DIR = path.join(__dirname, 'uploads')
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  // Separate folder for recruitment documents
const RECRUIT_DIR = path.join(__dirname, 'uploads', 'recruitment')
if (!fs.existsSync(RECRUIT_DIR)) fs.mkdirSync(RECRUIT_DIR, { recursive: true })

const recruitStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, RECRUIT_DIR),
  filename:    (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random()*1e6)}`
    cb(null, `${unique}-${file.originalname.replace(/\s+/g,'_')}`)
  },
})

const recruitUpload = multer({
  storage: recruitStorage,
  limits: { fileSize: 5 * 1024 * 1024 },  // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = /pdf|doc|docx/i
    const ext = path.extname(file.originalname)
    if (!allowed.test(ext)) {
      return cb(new Error('Only PDF and Word (.docx) files accepted'))
    }
    cb(null, true)
  },
})
app.use('/uploads', express.static(UPLOAD_DIR))

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename:    (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g,'_')}`),
})
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })

// ── Auth middleware ────────────────────────────────────────────────
const requireAuth = (req, res, next) => {
  const header = req.headers['authorization'] || ''
  if (!header.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorised' })
  try {
    req.admin = jwt.verify(header.slice(7), JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

// ── Compliance gate ─────────────────────────────────────────────────
// Shared by every endpoint that assigns a driver and/or vehicle to a job
// (bookings + routes). Blocks the write if the pairing isn't compliant,
// unless an active override already covers it — or the caller supplies
// `complianceOverrideReason`, in which case an override is created on the
// fly (audited under the logged-in admin) and the write proceeds.
function gateAssignment(req, res, { driverId, vehicleId }, proceed) {
  if (!driverId && !vehicleId) return proceed()

  db.getAssignmentCompliance({ driverId, vehicleId }, (err, cStatus) => {
    if (err) return res.status(500).json({ error: err.message })
    if (cStatus.available) return proceed()

    const reason = req.body.complianceOverrideReason
    if (!reason) {
      return res.status(409).json({
        error: 'Driver/vehicle is not compliant for assignment',
        blockers: cStatus.blockers,
      })
    }

    const entities = [...new Set(cStatus.blockers.map(b => `${b.entityType}:${b.entityId}`))]
    let remaining = entities.length
    entities.forEach(key => {
      const [entityType, entityId] = key.split(':')
      db.run(
        `INSERT INTO compliance_overrides (entityType, entityId, reason, overriddenBy) VALUES (?,?,?,?)`,
        [entityType, entityId, reason, req.admin.username],
        (insErr) => {
          if (insErr) console.error('  ◆  Override insert error:', insErr.message)
          if (--remaining === 0) proceed()
        }
      )
    })
  })
}

// ── Logger ─────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// ════════════════════════════════════════
// PUBLIC ROUTES
// ════════════════════════════════════════

// Customer submits booking or quote
app.post('/api/bookings', (req, res) => {
  const d = req.body
  if (!d.firstName || !d.lastName || !d.email || !d.phone) {
    return res.status(400).json({ error: 'First name, last name, email and phone are required' })
  }
  db.run(
    `INSERT INTO bookings
     (type,pickupDate,pickupTime,pickupAddress,dropoffAddress,
      serviceType,vehiclePreference,passengers,luggage,
      flightNumber,specialRequirements,
      firstName,lastName,email,phone,
      contractType,companyName,referralSource,
      serviceInterest,journeyDetails,callTime)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [d.type||'booking',d.pickupDate,d.pickupTime,d.pickupAddress,d.dropoffAddress,
     d.serviceType,d.vehiclePreference,d.passengers,d.luggage,
     d.flightNumber,d.specialRequirements,
     d.firstName,d.lastName,d.email,d.phone,
     d.contractType,d.companyName,d.referralSource,
     d.serviceInterest,d.journeyDetails,d.callTime],
    function(err) {
      if (err) return res.status(500).json({ error: err.message })
      console.log(`  ◆  New ${d.type||'booking'} #${this.lastID}: ${d.firstName} ${d.lastName}`)

      // Email notification to admin (fire-and-forget — does not delay the response)
      notifyMe(
        `New ${d.type||'booking'} #${this.lastID} — ${d.firstName} ${d.lastName}`,
        {
          reference: `#${this.lastID}`,
          name: `${d.firstName} ${d.lastName}`,
          email: d.email,
          phone: d.phone,
          serviceType: d.serviceType,
          pickupDate: d.pickupDate,
          pickupTime: d.pickupTime,
          pickupAddress: d.pickupAddress,
          dropoffAddress: d.dropoffAddress,
          passengers: d.passengers,
          luggage: d.luggage,
          vehiclePreference: d.vehiclePreference,
          flightNumber: d.flightNumber,
          specialRequirements: d.specialRequirements,
          contractType: d.contractType,
          companyName: d.companyName,
          serviceInterest: d.serviceInterest,
          journeyDetails: d.journeyDetails,
          callTime: d.callTime,
          referralSource: d.referralSource,
        }
      )

      // Confirmation email to the customer (fire-and-forget)
      emailCustomer(d, this.lastID)

      res.status(201).json({ id: this.lastID, success: true })
    }
  )
})

// Admin login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' })
  db.get('SELECT * FROM admin_users WHERE username = ?', [username], async (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '12h' })
    console.log(`  ◆  Admin login: ${username}`)
    res.json({ token, expiresIn: '12h' })
  })
})

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Haraka API', timestamp: new Date().toISOString() })
})

// Manual trigger / external-cron endpoint for the daily expiry check
app.get('/api/run-expiry-check', (req, res) => {
  runExpiryCheck()
  res.json({ ok: true, message: 'Expiry check triggered' })
})

// POST /api/recruitment — public, accepts application + file uploads
app.post('/api/recruitment',
  recruitUpload.fields([
    { name: 'cvFile',             maxCount: 1 },
    { name: 'dbsFile',            maxCount: 1 },
    { name: 'firstAidFile',       maxCount: 1 },
    { name: 'safeguardingFile',   maxCount: 1 },
    { name: 'pcoLicenceFile',     maxCount: 1 },
    { name: 'dvlaLicenceFile',    maxCount: 1 },
    { name: 'senTrainingFile',    maxCount: 1 },
    { name: 'movingHandlingFile', maxCount: 1 },
    { name: 'otherDocFile',       maxCount: 1 },
  ]),
  (req, res) => {
    const d = req.body
    const f = req.files || {}
    const get = (field) => f[field]?.[0]?.filename || null

    if (!d.firstName || !d.lastName || !d.email || !d.phone) {
      return res.status(400).json({ error: 'First name, last name, email and phone required' })
    }
    if (!get('cvFile')) {
      return res.status(400).json({ error: 'CV upload is required' })
    }

    db.run(
      `INSERT INTO bookings
       (type, firstName, lastName, email, phone,
        serviceInterest, journeyDetails, referralSource,
        specialRequirements)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      ['recruitment', d.firstName, d.lastName, d.email, d.phone,
       d.role, JSON.stringify({
         address: d.address, rightToWork: d.rightToWork,
         employmentStatus: d.employmentStatus, availability: d.availability,
         pcoLicence: d.pcoLicence, dvlaLicence: d.dvlaLicence,
         dvlaPoints: d.dvlaPoints, dbsNumber: d.dbsNumber,
         dbsUpdateService: d.dbsUpdateService,
         safeguardingTraining: d.safeguardingTraining,
         firstAid: d.firstAid, senExperience: d.senExperience,
         movingHandling: d.movingHandling, autismAwareness: d.autismAwareness,
         sprocDeclaration: d.sproc_declaration,
         additionalInfo: d.additionalInfo,
         // Document filenames
         cvFile:             get('cvFile'),
         dbsFile:            get('dbsFile'),
         firstAidFile:       get('firstAidFile'),
         safeguardingFile:   get('safeguardingFile'),
         pcoLicenceFile:     get('pcoLicenceFile'),
         dvlaLicenceFile:    get('dvlaLicenceFile'),
         senTrainingFile:    get('senTrainingFile'),
         movingHandlingFile: get('movingHandlingFile'),
         otherDocFile:       get('otherDocFile'),
       }),
       d.referralSource, d.declaration],
      function(err) {
        if (err) return res.status(500).json({ error: err.message })
        console.log(`  ◆  New recruitment application #${this.lastID}: ${d.firstName} ${d.lastName} — ${d.role}`)

        // Email notification (fire-and-forget)
        notifyMe(
          `New job application #${this.lastID} — ${d.firstName} ${d.lastName} (${d.role || 'role not specified'})`,
          {
            reference: `#${this.lastID}`,
            name: `${d.firstName} ${d.lastName}`,
            email: d.email,
            phone: d.phone,
            role: d.role,
            availability: d.availability,
            employmentStatus: d.employmentStatus,
            rightToWork: d.rightToWork,
            pcoLicence: d.pcoLicence,
            dvlaLicence: d.dvlaLicence,
            senExperience: d.senExperience,
            cvUploaded: get('cvFile') ? 'Yes — view in admin panel' : 'No',
            referralSource: d.referralSource,
          }
        )

        res.status(201).json({ id: this.lastID, success: true })
      }
    )
  }
)

// GET /api/admin/recruitment — admin only, list all applications
app.get('/api/admin/recruitment', requireAuth, (req, res) => {
  const { search } = req.query
  let sql = `SELECT * FROM bookings WHERE type='recruitment'`
  const params = []
  if (search) {
    sql += ` AND (firstName LIKE ? OR lastName LIKE ? OR email LIKE ? OR phone LIKE ?)`
    const q = `%${search}%`
    params.push(q, q, q, q)
  }
  sql += ' ORDER BY createdAt DESC'
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    // Parse journeyDetails JSON for each row
    rows = rows.map(r => {
      try { r.details = JSON.parse(r.journeyDetails) } catch { r.details = {} }
      return r
    })
    res.json(rows)
  })
})

// Serve recruitment documents (admin only)
app.use('/recruitment-docs', requireAuth, express.static(RECRUIT_DIR))

// ════════════════════════════════════════
// ADMIN ROUTES (all require login)
// ════════════════════════════════════════

// Get all bookings/quotes
app.get('/api/admin/bookings', requireAuth, (req, res) => {
  const { status, type, search } = req.query
  let sql = `SELECT b.*,
    d.firstName||' '||d.lastName AS driverName,
    v.make||' '||v.model||' ('||v.registration||')' AS vehicleName
    FROM bookings b
    LEFT JOIN drivers  d ON b.assignedDriverId  = d.id
    LEFT JOIN vehicles v ON b.assignedVehicleId = v.id`
  const params = [], where = []
  if (status && status !== 'all') { where.push('b.status=?');  params.push(status) }
  if (type   && type   !== 'all') { where.push('b.type=?');    params.push(type) }
  if (search) {
    where.push(`(b.firstName LIKE ? OR b.lastName LIKE ? OR b.email LIKE ?
      OR b.phone LIKE ? OR b.companyName LIKE ? OR b.pickupAddress LIKE ?
      OR b.dropoffAddress LIKE ? OR b.serviceType LIKE ? OR b.contractType LIKE ?)`)
    const q = `%${search}%`
    params.push(...Array(9).fill(q))
  }
  if (where.length) sql += ' WHERE ' + where.join(' AND ')
  sql += ' ORDER BY b.createdAt DESC'
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(rows)
  })
})

app.get('/api/admin/bookings/:id', requireAuth, (req, res) => {
  db.get(`SELECT b.*,
    d.firstName||' '||d.lastName AS driverName,
    v.make||' '||v.model||' ('||v.registration||')' AS vehicleName
    FROM bookings b
    LEFT JOIN drivers  d ON b.assignedDriverId  = d.id
    LEFT JOIN vehicles v ON b.assignedVehicleId = v.id
    WHERE b.id=?`, [req.params.id], (err, row) => {
    if (err)  return res.status(500).json({ error: err.message })
    if (!row) return res.status(404).json({ error: 'Not found' })
    res.json(row)
  })
})

app.patch('/api/admin/bookings/:id', requireAuth, (req, res) => {
  const { status, adminNotes, quotedPrice, assignedDriverId, assignedVehicleId } = req.body

  const applyUpdate = () => {
    db.run(
      `UPDATE bookings SET
       status=COALESCE(?,status), adminNotes=COALESCE(?,adminNotes),
       quotedPrice=COALESCE(?,quotedPrice),
       assignedDriverId=COALESCE(?,assignedDriverId),
       assignedVehicleId=COALESCE(?,assignedVehicleId)
       WHERE id=?`,
      [status,adminNotes,quotedPrice,assignedDriverId,assignedVehicleId,req.params.id],
      function(err) {
        if (err)           return res.status(500).json({ error: err.message })
        if (!this.changes) return res.status(404).json({ error: 'Not found' })
        res.json({ success: true })
      }
    )
  }

  if (assignedDriverId === undefined && assignedVehicleId === undefined) return applyUpdate()

  db.get('SELECT assignedDriverId, assignedVehicleId FROM bookings WHERE id=?', [req.params.id], (err, existing) => {
    if (err)       return res.status(500).json({ error: err.message })
    if (!existing) return res.status(404).json({ error: 'Not found' })
    const driverId  = assignedDriverId  !== undefined ? assignedDriverId  : existing.assignedDriverId
    const vehicleId = assignedVehicleId !== undefined ? assignedVehicleId : existing.assignedVehicleId
    gateAssignment(req, res, { driverId, vehicleId }, applyUpdate)
  })
})

app.delete('/api/admin/bookings/:id', requireAuth, (req, res) => {
  db.run('DELETE FROM bookings WHERE id=?', [req.params.id], function(err) {
    if (err)           return res.status(500).json({ error: err.message })
    if (!this.changes) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  })
})

// ── DRIVERS ───────────────────────────────────────────────────────
app.get('/api/admin/drivers', requireAuth, (req, res) => {
  const { search, status } = req.query
  let sql = 'SELECT * FROM drivers'
  const params = [], where = []
  if (status && status !== 'all') { where.push('status=?'); params.push(status) }
  if (search) {
    where.push(`(firstName LIKE ? OR lastName LIKE ? OR phone LIKE ?
      OR email LIKE ? OR dvlaLicenceNumber LIKE ? OR pcoLicenceNumber LIKE ?)`)
    const q = `%${search}%`
    params.push(...Array(6).fill(q))
  }
  if (where.length) sql += ' WHERE ' + where.join(' AND ')
  sql += ' ORDER BY firstName'
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    const today = new Date().toISOString().split('T')[0]
    db.all(
      `SELECT entityId FROM compliance_overrides
       WHERE entityType='driver' AND active=1 AND (expiresAt IS NULL OR expiresAt>=?)`,
      [today],
      (oErr, overrides) => {
        const overridden = new Set((overrides || []).map(o => o.entityId))
        rows = rows.map(r => {
          const blockers = db.driverBlockers(r, today)
          return { ...r, complianceBlockers: blockers.length, available: blockers.length === 0 || overridden.has(r.id) }
        })
        res.json(rows)
      }
    )
  })
})

app.post('/api/admin/drivers', requireAuth,
  upload.fields([
    { name: 'dvlaLicenceFile', maxCount: 1 },
    { name: 'pcoLicenceFile',  maxCount: 1 },
    { name: 'dbsCertificateFile', maxCount: 1 },
    { name: 'photoFile',       maxCount: 1 },
  ]),
  (req, res) => {
    const d = req.body
    const f = req.files || {}
    const get = (field) => f[field]?.[0]?.filename || null
    db.run(
      `INSERT INTO drivers
       (firstName,lastName,phone,email,address,dateOfBirth,
        dvlaLicenceNumber,dvlaExpiry,pcoLicenceNumber,pcoExpiry,
        dbsNumber,dbsExpiry,dbsIssueDate,status,notes,
        dvlaLicenceFile,pcoLicenceFile,dbsCertificateFile,photoFile)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [d.firstName,d.lastName,d.phone,d.email,d.address,d.dateOfBirth,
       d.dvlaLicenceNumber,d.dvlaExpiry,d.pcoLicenceNumber,d.pcoExpiry,
       d.dbsNumber,d.dbsExpiry,d.dbsIssueDate,d.status||'active',d.notes,
       get('dvlaLicenceFile'),get('pcoLicenceFile'),get('dbsCertificateFile'),get('photoFile')],
      function(err) {
        if (err) return res.status(500).json({ error: err.message })
        res.status(201).json({ id: this.lastID, success: true })
      }
    )
  }
)

app.patch('/api/admin/drivers/:id', requireAuth,
  upload.fields([
    { name: 'dvlaLicenceFile', maxCount: 1 },
    { name: 'pcoLicenceFile',  maxCount: 1 },
    { name: 'dbsCertificateFile', maxCount: 1 },
    { name: 'photoFile',       maxCount: 1 },
  ]),
  (req, res) => {
    const d = req.body
    const f = req.files || {}
    const get = (field) => f[field]?.[0]?.filename || undefined
    const updates = [], params = []
    const fields = {
      firstName:d.firstName, lastName:d.lastName, phone:d.phone, email:d.email,
      address:d.address, dateOfBirth:d.dateOfBirth,
      dvlaLicenceNumber:d.dvlaLicenceNumber, dvlaExpiry:d.dvlaExpiry,
      pcoLicenceNumber:d.pcoLicenceNumber, pcoExpiry:d.pcoExpiry,
      dbsNumber:d.dbsNumber, dbsExpiry:d.dbsExpiry, dbsIssueDate:d.dbsIssueDate,
      status:d.status, notes:d.notes,
      dvlaLicenceFile:get('dvlaLicenceFile'), pcoLicenceFile:get('pcoLicenceFile'),
      dbsCertificateFile:get('dbsCertificateFile'), photoFile:get('photoFile'),
    }
    Object.entries(fields).forEach(([k,v]) => {
      if (v !== undefined && v !== null) { updates.push(`${k}=?`); params.push(v) }
    })
    if (!updates.length) return res.status(400).json({ error: 'Nothing to update' })
    params.push(req.params.id)
    db.run(`UPDATE drivers SET ${updates.join(',')} WHERE id=?`, params, function(err) {
      if (err)           return res.status(500).json({ error: err.message })
      if (!this.changes) return res.status(404).json({ error: 'Not found' })
      res.json({ success: true })
    })
  }
)

app.delete('/api/admin/drivers/:id', requireAuth, (req, res) => {
  db.run('DELETE FROM drivers WHERE id=?', [req.params.id], function(err) {
    if (err)           return res.status(500).json({ error: err.message })
    if (!this.changes) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  })
})

// ── VEHICLES ──────────────────────────────────────────────────────
app.get('/api/admin/vehicles', requireAuth, (req, res) => {
  const { search, status } = req.query
  let sql = `SELECT v.*, d.firstName||' '||d.lastName AS driverName
             FROM vehicles v LEFT JOIN drivers d ON v.assignedDriverId=d.id`
  const params = [], where = []
  if (status && status !== 'all') { where.push('v.status=?'); params.push(status) }
  if (search) {
    where.push(`(v.registration LIKE ? OR v.make LIKE ? OR v.model LIKE ?
      OR v.colour LIKE ? OR v.pcoPlateNumber LIKE ?)`)
    const q = `%${search}%`
    params.push(...Array(5).fill(q))
  }
  if (where.length) sql += ' WHERE ' + where.join(' AND ')
  sql += ' ORDER BY v.make'
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    const today = new Date().toISOString().split('T')[0]
    db.all(
      `SELECT entityId FROM compliance_overrides
       WHERE entityType='vehicle' AND active=1 AND (expiresAt IS NULL OR expiresAt>=?)`,
      [today],
      (oErr, overrides) => {
        const overridden = new Set((overrides || []).map(o => o.entityId))
        rows = rows.map(r => {
          const blockers = db.vehicleBlockers(r, today)
          return { ...r, complianceBlockers: blockers.length, available: blockers.length === 0 || overridden.has(r.id) }
        })
        res.json(rows)
      }
    )
  })
})

app.post('/api/admin/vehicles', requireAuth,
  upload.fields([
    { name: 'motCertFile',   maxCount: 1 },
    { name: 'insuranceFile', maxCount: 1 },
    { name: 'pcoPlateFile',  maxCount: 1 },
    { name: 'logbookFile',   maxCount: 1 },
  ]),
  (req, res) => {
    const d = req.body
    const f = req.files || {}
    const get = (field) => f[field]?.[0]?.filename || null
    db.run(
      `INSERT INTO vehicles
       (registration,make,model,year,colour,vehicleType,seats,isWAV,
        motExpiry,taxExpiry,insuranceExpiry,pcoPlateExpiry,pcoPlateNumber,
        motCertFile,insuranceFile,pcoPlateFile,logbookFile,
        status,assignedDriverId,notes)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [d.registration,d.make,d.model,d.year,d.colour,d.vehicleType,d.seats,d.isWAV||0,
       d.motExpiry,d.taxExpiry,d.insuranceExpiry,d.pcoPlateExpiry,d.pcoPlateNumber,
       get('motCertFile'),get('insuranceFile'),get('pcoPlateFile'),get('logbookFile'),
       d.status||'active',d.assignedDriverId||null,d.notes],
      function(err) {
        if (err) return res.status(500).json({ error: err.message })
        res.status(201).json({ id: this.lastID, success: true })
      }
    )
  }
)

app.patch('/api/admin/vehicles/:id', requireAuth,
  upload.fields([
    { name: 'motCertFile', maxCount:1 }, { name: 'insuranceFile', maxCount:1 },
    { name: 'pcoPlateFile', maxCount:1 }, { name: 'logbookFile', maxCount:1 },
  ]),
  (req, res) => {
    const d = req.body
    const f = req.files || {}
    const get = (field) => f[field]?.[0]?.filename || undefined
    const updates = [], params = []
    const fields = {
      registration:d.registration, make:d.make, model:d.model, year:d.year,
      colour:d.colour, vehicleType:d.vehicleType, seats:d.seats, isWAV:d.isWAV,
      motExpiry:d.motExpiry, taxExpiry:d.taxExpiry,
      insuranceExpiry:d.insuranceExpiry, pcoPlateExpiry:d.pcoPlateExpiry,
      pcoPlateNumber:d.pcoPlateNumber, status:d.status,
      assignedDriverId:d.assignedDriverId, notes:d.notes,
      motCertFile:get('motCertFile'), insuranceFile:get('insuranceFile'),
      pcoPlateFile:get('pcoPlateFile'), logbookFile:get('logbookFile'),
    }
    Object.entries(fields).forEach(([k,v]) => {
      if (v !== undefined && v !== null) { updates.push(`${k}=?`); params.push(v) }
    })
    if (!updates.length) return res.status(400).json({ error: 'Nothing to update' })
    params.push(req.params.id)
    db.run(`UPDATE vehicles SET ${updates.join(',')} WHERE id=?`, params, function(err) {
      if (err)           return res.status(500).json({ error: err.message })
      if (!this.changes) return res.status(404).json({ error: 'Not found' })
      res.json({ success: true })
    })
  }
)

app.delete('/api/admin/vehicles/:id', requireAuth, (req, res) => {
  db.run('DELETE FROM vehicles WHERE id=?', [req.params.id], function(err) {
    if (err)           return res.status(500).json({ error: err.message })
    if (!this.changes) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  })
})

// ── ROUTES ────────────────────────────────────────────────────────
app.get('/api/admin/routes', requireAuth, (req, res) => {
  const { search, status, dateFrom, dateTo } = req.query
  let sql = `SELECT r.*,
    d.firstName||' '||d.lastName AS driverName,
    v.make||' '||v.model||' ('||v.registration||')' AS vehicleName
    FROM routes r
    LEFT JOIN drivers  d ON r.driverId  = d.id
    LEFT JOIN vehicles v ON r.vehicleId = v.id`
  const params = [], where = []
  if (status   && status !== 'all') { where.push('r.status=?');     params.push(status) }
  if (dateFrom) { where.push('r.routeDate>=?'); params.push(dateFrom) }
  if (dateTo)   { where.push('r.routeDate<=?'); params.push(dateTo) }
  if (search) {
    where.push(`(r.routeName LIKE ? OR r.pickupAddress LIKE ? OR r.dropoffAddress LIKE ?
      OR r.passengerName LIKE ? OR r.serviceType LIKE ? OR r.fareCharged LIKE ?)`)
    const q = `%${search}%`
    params.push(...Array(6).fill(q))
  }
  if (where.length) sql += ' WHERE ' + where.join(' AND ')
  sql += ' ORDER BY r.routeDate DESC, r.departureTime DESC'
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(rows)
  })
})

app.post('/api/admin/routes', requireAuth, (req, res) => {
  const d = req.body

  const insert = () => {
    db.run(
      `INSERT INTO routes
       (routeName,routeDate,departureTime,expectedReturnTime,
        pickupAddress,dropoffAddress,viaPoints,
        driverId,vehicleId,bookingId,serviceType,
        passengerName,passengerCount,specialNotes,
        status,fareCharged,distanceMiles,adminNotes)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [d.routeName,d.routeDate,d.departureTime,d.expectedReturnTime,
       d.pickupAddress,d.dropoffAddress,d.viaPoints,
       d.driverId||null,d.vehicleId||null,d.bookingId||null,d.serviceType,
       d.passengerName,d.passengerCount,d.specialNotes,
       d.status||'scheduled',d.fareCharged,d.distanceMiles,d.adminNotes],
      function(err) {
        if (err) return res.status(500).json({ error: err.message })
        res.status(201).json({ id: this.lastID, success: true })
      }
    )
  }

  gateAssignment(req, res, { driverId: d.driverId || null, vehicleId: d.vehicleId || null }, insert)
})

app.patch('/api/admin/routes/:id', requireAuth, (req, res) => {
  const d = req.body
  const fields = {
    routeName:d.routeName, routeDate:d.routeDate, departureTime:d.departureTime,
    expectedReturnTime:d.expectedReturnTime, pickupAddress:d.pickupAddress,
    dropoffAddress:d.dropoffAddress, viaPoints:d.viaPoints,
    driverId:d.driverId, vehicleId:d.vehicleId, bookingId:d.bookingId,
    serviceType:d.serviceType, passengerName:d.passengerName,
    passengerCount:d.passengerCount, specialNotes:d.specialNotes,
    status:d.status, actualDepartureTime:d.actualDepartureTime,
    actualArrivalTime:d.actualArrivalTime, adminNotes:d.adminNotes,
    distanceMiles:d.distanceMiles, fareCharged:d.fareCharged,
  }
  const updates = [], params = []
  Object.entries(fields).forEach(([k,v]) => {
    if (v !== undefined && v !== null) { updates.push(`${k}=?`); params.push(v) }
  })
  if (!updates.length) return res.status(400).json({ error: 'Nothing to update' })

  const applyUpdate = () => {
    params.push(req.params.id)
    db.run(`UPDATE routes SET ${updates.join(',')} WHERE id=?`, params, function(err) {
      if (err)           return res.status(500).json({ error: err.message })
      if (!this.changes) return res.status(404).json({ error: 'Not found' })
      res.json({ success: true })
    })
  }

  if (d.driverId === undefined && d.vehicleId === undefined) return applyUpdate()

  db.get('SELECT driverId, vehicleId FROM routes WHERE id=?', [req.params.id], (err, existing) => {
    if (err)       return res.status(500).json({ error: err.message })
    if (!existing) return res.status(404).json({ error: 'Not found' })
    const driverId  = d.driverId  !== undefined ? d.driverId  : existing.driverId
    const vehicleId = d.vehicleId !== undefined ? d.vehicleId : existing.vehicleId
    gateAssignment(req, res, { driverId, vehicleId }, applyUpdate)
  })
})

app.delete('/api/admin/routes/:id', requireAuth, (req, res) => {
  db.run('DELETE FROM routes WHERE id=?', [req.params.id], function(err) {
    if (err)           return res.status(500).json({ error: err.message })
    if (!this.changes) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  })
})

// ── COMPLIANCE ────────────────────────────────────────────────────

// Compliance status for a driver. If ?vehicleId isn't given, falls back to
// whichever vehicle is currently assigned to that driver.
app.get('/api/admin/compliance/driver/:id', requireAuth, (req, res) => {
  const driverId = req.params.id
  const resolveVehicleId = (cb) => {
    if (req.query.vehicleId) return cb(req.query.vehicleId)
    db.get('SELECT id FROM vehicles WHERE assignedDriverId=?', [driverId], (_err, v) => cb(v ? v.id : null))
  }
  resolveVehicleId((vehicleId) => {
    db.getAssignmentCompliance({ driverId, vehicleId }, (err, cStatus) => {
      if (err) return res.status(500).json({ error: err.message })
      if (!cStatus.driver) return res.status(404).json({ error: 'Driver not found' })
      res.json(cStatus)
    })
  })
})

// Compliance status for a vehicle on its own (no driver context).
app.get('/api/admin/compliance/vehicle/:id', requireAuth, (req, res) => {
  db.getAssignmentCompliance({ vehicleId: req.params.id }, (err, cStatus) => {
    if (err) return res.status(500).json({ error: err.message })
    if (!cStatus.vehicle) return res.status(404).json({ error: 'Vehicle not found' })
    res.json(cStatus)
  })
})

// Audit log of overrides (most recent first)
app.get('/api/admin/compliance/overrides', requireAuth, (req, res) => {
  db.all(`SELECT * FROM compliance_overrides ORDER BY createdAt DESC LIMIT 200`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(rows)
  })
})

// Create an explicit operator override for a driver or vehicle
app.post('/api/admin/compliance/override', requireAuth, (req, res) => {
  const { entityType, entityId, reason, expiresAt } = req.body
  if (!['driver', 'vehicle'].includes(entityType) || !entityId || !reason) {
    return res.status(400).json({ error: 'entityType (driver|vehicle), entityId and reason are required' })
  }
  db.run(
    `INSERT INTO compliance_overrides (entityType, entityId, reason, overriddenBy, expiresAt) VALUES (?,?,?,?,?)`,
    [entityType, entityId, reason, req.admin.username, expiresAt || null],
    function(err) {
      if (err) return res.status(500).json({ error: err.message })
      console.log(`  ◆  Compliance override created: ${entityType} #${entityId} by ${req.admin.username}`)
      res.status(201).json({ id: this.lastID, success: true })
    }
  )
})

// Refresh MOT data for every vehicle from the DVSA MOT History API.
// No-ops safely (200 with skipped:true) if DVSA_* env vars aren't set yet.
app.post('/api/admin/compliance/mot-sync', requireAuth, async (req, res) => {
  try {
    const summary = await dvsaMot.syncAllVehicles(db)
    res.json(summary)
  } catch (err) {
    console.error('  ◆  DVSA MOT sync failed:', err.message)
    res.status(502).json({ error: err.message })
  }
})

// Refresh MOT data for a single vehicle by id
app.post('/api/admin/vehicles/:id/mot-sync', requireAuth, (req, res) => {
  db.get('SELECT id, registration FROM vehicles WHERE id=?', [req.params.id], async (err, vehicle) => {
    if (err)      return res.status(500).json({ error: err.message })
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' })
    try {
      const result = await dvsaMot.fetchMotByRegistration(vehicle.registration)
      if (!result) return res.json({ updated: false, message: 'DVSA has no passed MOT test on record for this registration' })
      db.run(
        `UPDATE vehicles SET motExpiry=?, motSource='dvsa_api', motTestResult=?, motLastCheckedAt=CURRENT_TIMESTAMP WHERE id=?`,
        [result.motExpiry, result.testResult, vehicle.id],
        (uErr) => {
          if (uErr) return res.status(500).json({ error: uErr.message })
          res.json({ updated: true, ...result })
        }
      )
    } catch (e) {
      res.status(502).json({ error: e.message })
    }
  })
})

// Revoke an active override
app.delete('/api/admin/compliance/override/:id', requireAuth, (req, res) => {
  db.run(
    `UPDATE compliance_overrides SET active=0, revokedAt=CURRENT_TIMESTAMP, revokedBy=?
     WHERE id=? AND active=1`,
    [req.admin.username, req.params.id],
    function(err) {
      if (err)           return res.status(500).json({ error: err.message })
      if (!this.changes) return res.status(404).json({ error: 'Active override not found' })
      res.json({ success: true })
    }
  )
})

// ── ALERTS + STATS ────────────────────────────────────────────────
app.get('/api/admin/alerts', requireAuth, (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30
    db.getExpiryAlerts(days, (alerts) => {
      res.json(alerts || [])
    })
  } catch (err) {
    console.error('Alerts error:', err)
    res.json([])
  }
})
app.get('/api/admin/stats', requireAuth, (_req, res) => {
  const stats = { totalBookings:0, totalQuotes:0, activeDrivers:0, activeVehicles:0 }
  let pending = 4
  const done = () => { pending--; if (pending === 0) res.json(stats) }
  db.get('SELECT COUNT(*) as c FROM bookings WHERE type="booking"', [], (_, r) => { stats.totalBookings  = r?.c||0; done() })
  db.get('SELECT COUNT(*) as c FROM bookings WHERE type="quote"',   [], (_, r) => { stats.totalQuotes    = r?.c||0; done() })
  db.get('SELECT COUNT(*) as c FROM drivers  WHERE status="active"',[], (_, r) => { stats.activeDrivers  = r?.c||0; done() })
  db.get('SELECT COUNT(*) as c FROM vehicles WHERE status="active"',[], (_, r) => { stats.activeVehicles = r?.c||0; done() })
})

// — Error handler ————————————————————————
app.use((err, _req, res, _next) => {
  console.error(err.message)
  res.status(500).json({ error: err.message })
})

// — Serve frontend in production (MUST be last) ——
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`\n  ◆  Haraka API running on port ${PORT}`)
  console.log(`  ◆  Health: http://localhost:${PORT}/api/health\n`)

  // Document-expiry check: run 20s after start, then every 24 hours.
  setTimeout(runExpiryCheck, 20 * 1000)
  setInterval(runExpiryCheck, 24 * 60 * 60 * 1000)

  // DVSA MOT sync: run 40s after start (offset from the expiry check),
  // then every 24 hours. No-ops until DVSA_* env vars are configured.
  setTimeout(() => dvsaMot.syncAllVehicles(db), 40 * 1000)
  setInterval(() => dvsaMot.syncAllVehicles(db), 24 * 60 * 60 * 1000)
})
