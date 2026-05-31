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

  // Seed admin — runs once on fresh database
  db.get('SELECT id FROM admin_users WHERE username = ?', ['admin'], async (err, row) => {
    if (!row) {
      const hash = await bcrypt.hash('Haraka2025', 12)
      db.run(
        `INSERT INTO admin_users (username, password) VALUES (?, ?)`,
        ['admin', hash],
        (err) => {
          if (err) console.error('Admin seed error:', err.message)
          else console.log('  ◆  Admin created — username: admin  password: Haraka2025')
        }
      )
    } else {
      console.log('  ◆  Admin account exists')
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

module.exports = db