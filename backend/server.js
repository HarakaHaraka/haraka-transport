require('dotenv').config()
const express  = require('express')
const cors     = require('cors')
const path     = require('path')
const jwt      = require('jsonwebtoken')
const bcrypt   = require('bcrypt')
const multer   = require('multer')
const fs       = require('fs')
const db       = require('./db')

const app        = express()
const PORT       = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'haraka-change-this-secret-2025'

// ── CORS ──────────────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET','POST','PATCH','DELETE'],
  allowedHeaders: ['Content-Type','Authorization'],
}))

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
    res.json(rows)
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
    res.json(rows)
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
  params.push(req.params.id)
  db.run(`UPDATE routes SET ${updates.join(',')} WHERE id=?`, params, function(err) {
    if (err)           return res.status(500).json({ error: err.message })
    if (!this.changes) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  })
})

app.delete('/api/admin/routes/:id', requireAuth, (req, res) => {
  db.run('DELETE FROM routes WHERE id=?', [req.params.id], function(err) {
    if (err)           return res.status(500).json({ error: err.message })
    if (!this.changes) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  })
})

// ── ALERTS + STATS ────────────────────────────────────────────────
app.get('/api/admin/alerts', requireAuth, (req, res) => {
  const days = parseInt(req.query.days) || 30
  db.getExpiryAlerts(days, (alerts) => {
    res.json(alerts || [])
  })
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

// ── Error handler ──────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.message)
  res.status(500).json({ error: err.message })
})
// ... all your routes above ...

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'))
  })
}

app.listen(PORT, () => console.log(`Haraka API running on port ${PORT}`))

app.listen(PORT, () => {
  console.log(`\n  ◆  Haraka API running on port ${PORT}`)
  console.log(`  ◆  Health: http://localhost:${PORT}/api/health\n`)
})