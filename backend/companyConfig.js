// CommonJS mirror of frontend/src/config/company.js — the frontend is an
// ES module Vite build the backend can't import directly, so the handful
// of fields needed for the confirmation-email footer are duplicated here.
// Keep in sync with the frontend copy if company details change.
const COMPANY = {
  legalName: 'Haraka Transport Limited',
  tradingNames: ['Haraka Transport', 'harakatransport.co.uk'],
  companyNumber: '16766576',
  registeredOffice: '181 Barcombe Avenue, London, SW2 3BH',
  phone: '07849 549740',
  email: 'admin@harakatransport.co.uk',
  icoRegistration: 'ZC092850',
  operatorLicenceNumber: null,
  operatorLicencePendingText:
    'TfL operator licence application pending — licence number to follow.',
  siteUrl: 'https://harakatransport.co.uk',
}

module.exports = { COMPANY }
