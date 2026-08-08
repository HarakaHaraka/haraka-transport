import { COMPANY } from '../config/company'
import { PolicyPage, PolicySection, Prose } from '../components/PolicyPage'

export default function VerifyPage() {
  return (
    <PolicyPage
      title="Check our drivers and vehicles yourself"
      badge="Verify"
      intro="Every driver we assign holds a current Transport for London private hire driver licence, and every vehicle holds a current TfL private hire vehicle licence, a valid MOT and hire and reward insurance. We verify these before any assignment and monitor them for expiry, with automated alerts 30 days before any document lapses. You do not have to take our word for it."
    >
      <PolicySection>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>

          <div className="glass-card" style={{ padding: '24px' }}>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A855F7', marginBottom: '10px', fontWeight: 700 }}>
              Check a driver's licence
            </p>
            <Prose text="Use the driver's private hire driver licence number, which appears on the badge they wear and in your booking confirmation." />
            <a href="https://tfl.gov.uk/info-for/taxis-and-private-hire/licensing/licence-checker"
               target="_blank" rel="noopener noreferrer" className="btn-outline"
               style={{ display: 'inline-block', marginTop: '10px', textDecoration: 'none', textAlign: 'center' }}>
              Open TfL licence checker →
            </a>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A855F7', marginBottom: '10px', fontWeight: 700 }}>
              Check a vehicle's licence
            </p>
            <Prose text="Use the vehicle registration mark from your booking confirmation." />
            <a href="https://tfl.gov.uk/info-for/taxis-and-private-hire/licensing/licence-checker"
               target="_blank" rel="noopener noreferrer" className="btn-outline"
               style={{ display: 'inline-block', marginTop: '10px', textDecoration: 'none', textAlign: 'center' }}>
              Open TfL licence checker →
            </a>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A855F7', marginBottom: '10px', fontWeight: 700 }}>
              Check a vehicle's MOT
            </p>
            <Prose text="Use the vehicle registration mark from your booking confirmation on the official government MOT history check." />
            <a href="https://www.gov.uk/check-mot-history"
               target="_blank" rel="noopener noreferrer" className="btn-outline"
               style={{ display: 'inline-block', marginTop: '10px', textDecoration: 'none', textAlign: 'center' }}>
              Check MOT history →
            </a>
          </div>
        </div>
      </PolicySection>

      <PolicySection>
        <div style={{
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: '12px', padding: '16px 20px', color: '#FCD34D', fontSize: '0.9rem',
        }}>
          If anything you check does not match what we told you, contact us immediately on {COMPANY.phone}.
        </div>
      </PolicySection>
    </PolicyPage>
  )
}
