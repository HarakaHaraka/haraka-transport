import { COMPANY } from '../config/company'
import { PolicyPage, PolicySection, Prose, PolicyNote, PolicyReference } from '../components/PolicyPage'

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
        <PolicyNote>
          Where the item is one the passenger depends on — a communication device, hearing aid, glasses, mobility aid,
          medication or medical alert equipment — we treat it as urgent, notify the parent or carer and school
          immediately, and arrange same-day return.
        </PolicyNote>
      </PolicySection>

      <PolicyReference policyName="Lost Property Policy" reference="HTL-POL-16" />
    </PolicyPage>
  )
}
