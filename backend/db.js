const sqlite3 = require('sqlite3').verbose()
const path    = require('path')
const bcrypt  = require('bcrypt')

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'haraka.sqlite')

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) { console.error('DB error:', err.message); process.exit(1) }
  console.log('  ◆  SQLite connected')
})

db.run('PRAGMA journal_mode = WAL')
db.run('PRAGMA foreign_keys = ON')

db.serialize(() => {

  db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    type                 TEXT    DEFAULT 'booking',
    pickupDate           TEXT,
    pickupTime           TEXT,
    pickupAddress        TEXT,
    dropoffAddress       TEXT,
    serviceType          TEXT,
    vehiclePreference    TEXT,
    passengers           INTEGER,
    luggage              INTEGER,
    flightNumber         TEXT,
    specialRequirements  TEXT,
    firstName            TEXT    NOT NULL,
    lastName             TEXT    NOT NULL,
    email                TEXT    NOT NULL,
    phone                TEXT    NOT NULL,
    contractType         TEXT,
    companyName          TEXT,
    referralSource       TEXT,
    serviceInterest      TEXT,
    journeyDetails       TEXT,
    callTime             TEXT,
    status               TEXT    DEFAULT 'pending',
    adminNotes           TEXT,
    quotedPrice          TEXT,
    assignedDriverId     INTEGER,
    assignedVehicleId    INTEGER,
    createdAt            DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS drivers (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName            TEXT    NOT NULL,
    lastName             TEXT    NOT NULL,
    phone                TEXT    NOT NULL,
    email                TEXT,
    address              TEXT,
    dateOfBirth          TEXT,
    dvlaLicenceNumber    TEXT,
    dvlaExpiry           TEXT,
    pcoLicenceNumber     TEXT,
    pcoExpiry            TEXT,
    dbsNumber            TEXT,
    dbsExpiry            TEXT,
    dbsIssueDate         TEXT,
    dbsCertificateFile   TEXT,
    dvlaLicenceFile      TEXT,
    pcoLicenceFile       TEXT,
    photoFile            TEXT,
    status               TEXT    DEFAULT 'active',
    notes                TEXT,
    createdAt            DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS vehicles (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    registration         TEXT    NOT NULL UNIQUE,
    make                 TEXT    NOT NULL,
    model                TEXT    NOT NULL,
    year                 INTEGER,
    colour               TEXT,
    vehicleType          TEXT,
    seats                INTEGER,
    isWAV                INTEGER DEFAULT 0,
    motExpiry            TEXT,
    taxExpiry            TEXT,
    insuranceExpiry      TEXT,
    pcoPlateExpiry       TEXT,
    pcoPlateNumber       TEXT,
    motCertFile          TEXT,
    insuranceFile        TEXT,
    pcoPlateFile         TEXT,
    logbookFile          TEXT,
    status               TEXT    DEFAULT 'active',
    assignedDriverId     INTEGER,
    notes                TEXT,
    createdAt            DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS routes (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    routeName            TEXT,
    routeDate            TEXT    NOT NULL,
    departureTime        TEXT    NOT NULL,
    expectedReturnTime   TEXT,
    pickupAddress        TEXT    NOT NULL,
    dropoffAddress       TEXT    NOT NULL,
    viaPoints            TEXT,
    driverId             INTEGER,
    vehicleId            INTEGER,
    bookingId            INTEGER,
    serviceType          TEXT,
    passengerName        TEXT,
    passengerCount       INTEGER,
    specialNotes         TEXT,
    status               TEXT    DEFAULT 'scheduled',
    actualDepartureTime  TEXT,
    actualArrivalTime    TEXT,
    adminNotes           TEXT,
    distanceMiles        REAL,
    fareCharged          TEXT,
    createdAt            DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS admin_users (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    username  TEXT    UNIQUE NOT NULL,
    password  TEXT    NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)

  // Driver photo pipeline (Part 3). photo_consent is not decoration — the
  // admin UI must refuse to save a photo unless it's set, since the photo
  // is the driver's personal data held under the provider agreement.
  db.all('PRAGMA table_info(drivers)', [], (err, cols) => {
    if (err) return
    const have = new Set((cols || []).map(c => c.name))
    if (!have.has('photo_path'))        db.run(`ALTER TABLE drivers ADD COLUMN photo_path TEXT`)
    if (!have.has('photo_uploaded_at')) db.run(`ALTER TABLE drivers ADD COLUMN photo_uploaded_at TEXT`)
    if (!have.has('photo_consent'))     db.run(`ALTER TABLE drivers ADD COLUMN photo_consent INTEGER DEFAULT 0`)
    if (!have.has('photo_consent_at'))  db.run(`ALTER TABLE drivers ADD COLUMN photo_consent_at TEXT`)
  })

  // Booking-confirmation support (Part 4): an optional passenger assistant
  // (recorded as a second drivers-table row) and a sent-flag so a
  // commissioned route gets one confirmation at start plus change
  // notifications, rather than a fresh message every daily run.
  db.all('PRAGMA table_info(routes)', [], (err, cols) => {
    if (err) return
    const have = new Set((cols || []).map(c => c.name))
    if (!have.has('assistantId'))       db.run(`ALTER TABLE routes ADD COLUMN assistantId INTEGER`)
    if (!have.has('confirmation_sent')) db.run(`ALTER TABLE routes ADD COLUMN confirmation_sent INTEGER DEFAULT 0`)
  })
  db.all('PRAGMA table_info(bookings)', [], (err, cols) => {
    if (err) return
    const have = new Set((cols || []).map(c => c.name))
    if (!have.has('assignedAssistantId')) db.run(`ALTER TABLE bookings ADD COLUMN assignedAssistantId INTEGER`)
    if (!have.has('confirmation_sent'))   db.run(`ALTER TABLE bookings ADD COLUMN confirmation_sent INTEGER DEFAULT 0`)
  })

  // Explicit, audited operator overrides of the compliance gate.
  // entityType/entityId is polymorphic (a driver or a vehicle) rather than
  // a single boolean flag on drivers/vehicles, so each override carries who
  // did it, why, and — optionally — when it stops applying. Revocation is
  // recorded rather than deleting the row, so the audit trail survives.
  db.run(`CREATE TABLE IF NOT EXISTS compliance_overrides (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    entityType   TEXT    NOT NULL CHECK(entityType IN ('driver','vehicle')),
    entityId     INTEGER NOT NULL,
    reason       TEXT    NOT NULL,
    overriddenBy TEXT,
    expiresAt    TEXT,
    active       INTEGER DEFAULT 1,
    createdAt    DATETIME DEFAULT CURRENT_TIMESTAMP,
    revokedAt    DATETIME,
    revokedBy    TEXT
  )`)

  // Seed admin — runs once on fresh database
  db.get('SELECT id FROM admin_users LIMIT 1', (_err, row) => {

  if (!row) {

    db.run(

      `INSERT INTO admin_users (username, password) VALUES (?,?)`,

      ['admin', '$2b$12$ggr9.Uh6t7MWbVRSorzifeTrQFYzjky5iGj/zT/feWSzyCHfueOU2'],

      () => console.log('  ◆  Admin created')

    )

  } else {

    db.run(

      `UPDATE admin_users SET password=? WHERE username=?`,

      ['$2b$12$ggr9.Uh6t7MWbVRSorzifeTrQFYzjky5iGj/zT/feWSzyCHfueOU2', 'admin'],

      () => console.log('  ◆  Admin password synced')

    )

  }

})

  console.log('  ◆  All tables ready')
})

db.getExpiryAlerts = (daysAhead = 30, callback) => {
  const cutoff    = new Date()
  cutoff.setDate(cutoff.getDate() + daysAhead)
  const cutoffStr = cutoff.toISOString().split('T')[0]
  const today     = new Date().toISOString().split('T')[0]
  const alerts    = []

  db.all(`SELECT id, firstName, lastName, dvlaExpiry, pcoExpiry, dbsExpiry
    FROM drivers WHERE status = 'active'`, [], (err, drivers) => {
    if (!err && drivers) {
      drivers.forEach(d => {
        const name = `${d.firstName} ${d.lastName}`
        ;[['DVLA Licence', d.dvlaExpiry], ['PCO Licence', d.pcoExpiry], ['DBS Check', d.dbsExpiry]]
          .forEach(([field, expiry]) => {
            if (!expiry) return
            const isExpired    = expiry <= today
            const expiringSoon = expiry <= cutoffStr && !isExpired
            if (isExpired || expiringSoon) {
              const daysLeft = Math.ceil((new Date(expiry) - new Date(today)) / 86400000)
              alerts.push({
                category: 'driver', id: d.id, name, field, expiry, daysLeft,
                severity: isExpired ? 'expired' : daysLeft <= 7 ? 'critical' : 'warning',
              })
            }
          })
      })
    }

    db.all(`SELECT id, registration, make, model, motExpiry, taxExpiry, insuranceExpiry, pcoPlateExpiry
      FROM vehicles WHERE status = 'active'`, [], (err2, vehicles) => {
      if (!err2 && vehicles) {
        vehicles.forEach(v => {
          const name = `${v.make} ${v.model} (${v.registration})`
          ;[['MOT', v.motExpiry], ['Road Tax', v.taxExpiry], ['Insurance', v.insuranceExpiry], ['PCO Plate', v.pcoPlateExpiry]]
            .forEach(([field, expiry]) => {
              if (!expiry) return
              const isExpired    = expiry <= today
              const expiringSoon = expiry <= cutoffStr && !isExpired
              if (isExpired || expiringSoon) {
                const daysLeft = Math.ceil((new Date(expiry) - new Date(today)) / 86400000)
                alerts.push({
                  category: 'vehicle', id: v.id, name, field, expiry, daysLeft,
                  severity: isExpired ? 'expired' : daysLeft <= 7 ? 'critical' : 'warning',
                })
              }
            })
        })
      }
      if (typeof callback === 'function') callback(alerts)
    })
  })
}

// ────────────────────────────────────────────────────────────────
// Compliance gating
// A driver's availability for assignment depends on their own licence/DBS
// expiries AND — since they'll be driving it — the expiries of whichever
// vehicle they're paired with for that job. Either side can be unblocked
// with an explicit, audited override (see compliance_overrides above).
// ────────────────────────────────────────────────────────────────

const isExpired = (dateStr, today) => !!dateStr && dateStr <= today

db.driverBlockers = (driver, today = new Date().toISOString().split('T')[0]) => {
  const blockers = []
  if (driver.status && driver.status !== 'active') {
    blockers.push({ entityType: 'driver', entityId: driver.id, field: 'status',
      message: `Driver status is '${driver.status}', not active` })
  }
  ;[['dvlaExpiry', 'DVLA Licence'], ['pcoExpiry', 'PCO/TfL Licence'], ['dbsExpiry', 'Enhanced DBS']]
    .forEach(([field, label]) => {
      if (isExpired(driver[field], today)) {
        blockers.push({ entityType: 'driver', entityId: driver.id, field, label,
          expiry: driver[field], message: `${label} expired on ${driver[field]}` })
      }
    })
  return blockers
}

db.vehicleBlockers = (vehicle, today = new Date().toISOString().split('T')[0]) => {
  const blockers = []
  if (vehicle.status && vehicle.status !== 'active') {
    blockers.push({ entityType: 'vehicle', entityId: vehicle.id, field: 'status',
      message: `Vehicle status is '${vehicle.status}', not active` })
  }
  ;[['motExpiry', 'MOT'], ['taxExpiry', 'Road Tax'], ['insuranceExpiry', 'Insurance'], ['pcoPlateExpiry', 'PCO Plate']]
    .forEach(([field, label]) => {
      if (isExpired(vehicle[field], today)) {
        blockers.push({ entityType: 'vehicle', entityId: vehicle.id, field, label,
          expiry: vehicle[field], message: `${label} expired on ${vehicle[field]}` })
      }
    })
  return blockers
}

// Latest still-in-force override for one entity (null if none / expired / revoked).
db.getActiveOverride = (entityType, entityId, callback) => {
  if (!entityId) return callback(null, null)
  const today = new Date().toISOString().split('T')[0]
  db.get(
    `SELECT * FROM compliance_overrides
     WHERE entityType=? AND entityId=? AND active=1
       AND (expiresAt IS NULL OR expiresAt >= ?)
     ORDER BY createdAt DESC LIMIT 1`,
    [entityType, entityId, today],
    (err, row) => callback(err, row || null)
  )
}

// Full compliance picture for a driver+vehicle pairing (either id may be
// omitted). `blockers` is always the raw, un-overridden list; `available`
// is the actual gating decision (compliant, or fully covered by overrides).
db.getAssignmentCompliance = ({ driverId, vehicleId }, callback) => {
  const today = new Date().toISOString().split('T')[0]

  const fetchDriver = (cb) => driverId
    ? db.get('SELECT * FROM drivers WHERE id=?', [driverId], cb)
    : cb(null, null)
  const fetchVehicle = (cb) => vehicleId
    ? db.get('SELECT * FROM vehicles WHERE id=?', [vehicleId], cb)
    : cb(null, null)

  fetchDriver((dErr, driver) => {
    if (dErr) return callback(dErr)
    fetchVehicle((vErr, vehicle) => {
      if (vErr) return callback(vErr)

      const blockers = [
        ...(driver  ? db.driverBlockers(driver, today)   : []),
        ...(vehicle ? db.vehicleBlockers(vehicle, today) : []),
      ]

      const finish = (driverOverride, vehicleOverride) => {
        const uncovered = blockers.filter(b =>
          (b.entityType === 'driver'  && !driverOverride) ||
          (b.entityType === 'vehicle' && !vehicleOverride)
        )
        callback(null, {
          driver:  driver  ? { id: driver.id,  name: `${driver.firstName} ${driver.lastName}` } : null,
          vehicle: vehicle ? { id: vehicle.id, registration: vehicle.registration } : null,
          blockers,
          compliant: blockers.length === 0,
          overridden: blockers.length > 0 && uncovered.length === 0,
          available: uncovered.length === 0,
          driverOverride,
          vehicleOverride,
        })
      }

      if (!blockers.length) return finish(null, null)

      db.getActiveOverride('driver', driverId, (_e1, dOverride) => {
        db.getActiveOverride('vehicle', vehicleId, (_e2, vOverride) => {
          finish(dOverride, vOverride)
        })
      })
    })
  })
}

module.exports = db