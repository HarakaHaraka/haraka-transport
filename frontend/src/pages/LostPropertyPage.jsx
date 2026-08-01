import { COMPANY } from '../config/company'
import { PolicyPage, PolicySection, Prose, PolicyReference } from '../components/PolicyPage'

export default function LostPropertyPage() {
  return (
    <PolicyPage title="Lost Property" badge="Legal">
      <PolicySection heading="Reporting a lost item">
        <Prose text={`Call ${COMPANY.phone} or email ${COMPANY.email}. We log every report the day it is received, identify the journey from the booking record, contact the assigned driver to search the vehicle, and tell you the outcome whether or not the item is found.`} />
      </PolicySection>

      <PolicySection heading="Storage and collection">
        <Prose text={`Items are stored securely and released only to a person who can identify them; for a passenger on a commissioned route, only to a parent, carer or member of school staff named on the route plan. Unclaimed items are disposed of after three months.`} />
      </PolicySection>

      <PolicySection heading="Items a passenger depends on">
        <div style={{
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: '12px', padding: '18px 20px', color: '#FCD34D', fontSize: '0.92rem', lineHeight: 1.8,
        }}>
          Where the item is one the passenger depends on — a communication device, hearing aid, glasses, mobility aid,
          medication or medical alert equipment — we treat it as urgent, notify the parent or carer and school
          immediately, and arrange same-day return.
        </div>
      </PolicySection>

      <PolicyReference policyName="Lost Property Policy" reference="HTL-POL-16" />
    </PolicyPage>
  )
}
