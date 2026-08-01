import { Link } from 'react-router-dom'
import { COMPANY } from '../config/company'

const links = [
  { label: 'Terms & Conditions',        to: '/terms' },
  { label: 'Privacy',                   to: '/privacy' },
  { label: 'Complaints',                to: '/complaints' },
  { label: 'Safeguarding',              to: '/safeguarding' },
  { label: 'Accessibility',             to: '/accessibility' },
  { label: 'Fares',                     to: '/fares' },
  { label: 'Lost Property',             to: '/lost-property' },
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
    <footer style={{
      borderTop: '1px solid rgba(168,85,247,0.15)',
      background: 'rgba(10,7,20,0.9)',
      padding: '40px 24px 28px',
      marginTop: '40px',
    }}>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>

      <div style={{ maxWidth: '960px', margin: '0 auto', color: 'var(--silver)', fontSize: '0.82rem', lineHeight: 1.9 }}>
        <p style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>
          {COMPANY.legalName}
        </p>
        <p>Trading as: {COMPANY.tradingNames.join(' · ')}</p>
        <p>Licensed by Transport for London</p>
        <p>{licenceLine}</p>
        <p>Trading address: {COMPANY.tradingAddress}</p>
        <p>Bookings: {COMPANY.phone}</p>
        <p>Email: <a href={`mailto:${COMPANY.email}`} style={{ color: '#A855F7' }}>{COMPANY.email}</a></p>
        <p>Registered in {COMPANY.registeredIn}, company number {COMPANY.companyNumber}</p>
        <p>Registered office: {COMPANY.registeredOffice}</p>
        <p>ICO registration: {COMPANY.icoRegistration}</p>

        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '8px 20px',
          margin: '20px 0 16px', paddingTop: '16px',
          borderTop: '1px solid rgba(168,85,247,0.1)',
        }}>
          {links.map((l) => (
            <Link key={l.to} to={l.to} style={{ color: 'var(--silver)', textDecoration: 'none', fontSize: '0.78rem' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#A855F7')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--silver)')}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <p style={{ fontSize: '0.72rem', color: 'rgba(148,163,184,0.7)' }}>
          All journeys are pre-booked. Haraka Transport does not accept street hails.
        </p>
      </div>
    </footer>
  )
}
