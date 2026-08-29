// Single source of truth for all legal/company details used across the
// public site and confirmation emails. Never hard-code these values in a
// component — import COMPANY instead, so a change here (e.g. the TfL
// operator licence number arriving) propagates everywhere at once.
export const COMPANY = {
  legalName: 'Haraka Transport Limited',
  tradingNames: ['Haraka Transport', 'harakatransport.co.uk'],
  companyNumber: '16766576',
  registeredIn: 'England and Wales',
  registeredOffice: '181 Barcombe Avenue, London, SW2 3BH',
  tradingAddress: '181 Barcombe Avenue, London, SW2 3BH',
  contactPerson: 'Zay Afrah',
  phone: '07849 549740',
  email: 'admin@harakatransport.co.uk',
  bookingsEmail: 'bookings@harakatransport.co.uk',
  icoRegistration: 'ZC092850',
  // TfL operator licence not yet granted. Render the pending notice until set.
  operatorLicenceNumber: null,
  operatorLicencePendingText:
    'Haraka Transport Limited has applied for a private hire vehicle operator’s licence from Transport for London. Our licence number will be published here as soon as it is issued. We do not accept bookings until our licence is granted.',
  // Insurer and cover limits not yet confirmed. Leave these null and the
  // public Terms page renders insurancePendingText instead of a specific
  // claim. Set all three together once the policy schedule is in hand.
  insurance: {
    insurer: null,
    publicLiability: null,
    employersLiability: null,
  },
  insurancePendingText:
    'Our insurance details will be published here once confirmed.',
  // No VAT registration. Do NOT render a VAT line at all. Do not print
  // "not VAT registered" anywhere.
  vatNumber: null,
  policyVersion: '1.0',
  policyApproved: '31 July 2026',
  policyNextReview: '31 July 2027',
  dataProtectionLead: 'Zainab Husein',
  safeguardingLead: 'Zainab Husein',
  operatingHours: 'Office hours: Monday–Friday, 9am–5:30pm. Booking phone line staffed 24/7.',
};

export default COMPANY;
