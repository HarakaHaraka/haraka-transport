import { COMPANY } from '../config/company'
import { PolicyPage, PolicySection, PolicyNote, Prose } from '../components/PolicyPage'

export default function VerifyPage() {
  return (
    <PolicyPage
      title="Check our drivers and vehicles yourself"
      badge="Verify"
      intro="Every driver we assign holds a current Transport for London private hire driver licence, and every vehicle holds a current TfL private hire vehicle licence, a valid MOT and hire and reward insurance. We verify these before any assignment and monitor them for expiry, with automated alerts 30 days before any document lapses. You do not have to take our word for it."
    >
      <PolicySection>
        <div className="hk-cards">

          <div className="hk-cell hk-card">
            <h2 className="hk-card__title">Check a driver's licence</h2>
            <Prose text="Use the driver's private hire driver licence number, which appears on the badge they wear and in your booking confirmation." />
            <a href="https://tfl.gov.uk/info-for/taxis-and-private-hire/licensing/licence-checker" target="_blank" rel="noopener noreferrer" className="hk-btn hk-btn--secondary">
              Open TfL licence checker
            </a>
          </div>

          <div className="hk-cell hk-card">
            <h2 className="hk-card__title">Check a vehicle's licence</h2>
            <Prose text="Use the vehicle registration mark from your booking confirmation." />
            <a href="https://tfl.gov.uk/info-for/taxis-and-private-hire/licensing/licence-checker" target="_blank" rel="noopener noreferrer" className="hk-btn hk-btn--secondary">
              Open TfL licence checker
            </a>
          </div>

          <div className="hk-cell hk-card">
            <h2 className="hk-card__title">Check a vehicle's MOT</h2>
            <Prose text="Use the vehicle registration mark from your booking confirmation on the official government MOT history check." />
            <a href="https://www.gov.uk/check-mot-history" target="_blank" rel="noopener noreferrer" className="hk-btn hk-btn--secondary">
              Check MOT history
            </a>
          </div>
        </div>
      </PolicySection>

      <PolicySection>
        <PolicyNote strong>
          If anything you check does not match what we told you, contact us immediately on {COMPANY.phone}.
        </PolicyNote>
      </PolicySection>
    </PolicyPage>
  )
}
