import { Link } from 'react-router-dom'
import { COMPANY } from '../config/company'

const links = [
  { label: 'Terms & Conditions',         to: '/terms' },
  { label: 'Privacy',                    to: '/privacy' },
  { label: 'Complaints',                 to: '/complaints' },
  { label: 'Safeguarding',               to: '/safeguarding' },
  { label: 'Accessibility',              to: '/accessibility' },
  { label: 'Fares',                      to: '/fares' },
  { label: 'Lost Property',              to: '/lost-property' },
  { label: 'Verify a Driver or Vehicle', to: '/verify' },
]

export default function Footer() {
  const licenceLine = COMPANY.operatorLicenceNumber
    ? `TfL private hire operator's licence number: ${COMPANY.operatorLicenceNumber}`
    : COMPANY.operatorLicencePendingText

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    legalName: COMPANY.legalName,
    name: COMPANY.tradingNames[0],
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY.registeredOffice,
      addressCountry: 'GB',
    },
    telephone: COMPANY.phone,
    email: COMPANY.email,
    identifier: COMPANY.companyNumber,
  }

  return (
    <footer className="hk-footer">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>

      <div className="hk-footer__cols">
        <div>
          <p className="hk-footer__name">{COMPANY.legalName}</p>
          <p>Trading as: {COMPANY.tradingNames.join(' · ')}</p>
          <p>Licensed by Transport for London</p>
          <p className="hk-footer__licence">{licenceLine}</p>
        </div>
        <div>
          <p>Trading address: {COMPANY.tradingAddress}</p>
          <p>
            Bookings: <a href={`tel:${COMPANY.phone.replace(/\s+/g, '')}`}>{COMPANY.phone}</a> · {COMPANY.bookingsLineHours}
          </p>
          <p>Email: <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></p>
          <p>Registered in {COMPANY.registeredIn}, company number {COMPANY.companyNumber}</p>
          <p>Registered office: {COMPANY.registeredOffice}</p>
          <p>ICO registration: {COMPANY.icoRegistration}</p>
        </div>
      </div>

      <nav className="hk-footer__legal" aria-label="Legal">
        {links.map((l) => (
          <Link key={l.to} to={l.to}>{l.label}</Link>
        ))}
      </nav>

      <p className="hk-footer__close">
        All journeys are pre-booked. {COMPANY.tradingNames[0]} does not accept street hails.
      </p>
    </footer>
  )
}
