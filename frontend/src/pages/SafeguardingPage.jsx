import { COMPANY } from '../config/company'
import { PolicyPage, PolicySection, Prose, PolicyReference } from '../components/PolicyPage'

export default function SafeguardingPage() {
  return (
    <PolicyPage
      title="Safeguarding"
      badge="Legal"
      intro="Safeguarding is the primary consideration in everything we do."
    >
      <PolicySection heading="Our standards">
        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', color: '#CBD5E1', fontSize: '0.92rem', lineHeight: 1.85 }}>
          <li>Every driver and passenger assistant assigned to carry a child or adult at risk holds a current enhanced DBS certificate with children's and adults' barred-list checks, verified before assignment and monitored for currency.</li>
          <li>Every driver holds a current TfL private hire driver licence; every vehicle holds a current TfL private hire vehicle licence, valid MOT and hire and reward insurance.</li>
          <li>Our Designated Safeguarding Lead is {COMPANY.safeguardingLead}, Director. A nominated deputy provides cover.</li>
        </ul>
      </PolicySection>

      <PolicySection heading="Safe operating standards">
        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', color: '#CBD5E1', fontSize: '0.92rem', lineHeight: 1.85 }}>
          <li>Only the commissioned passenger travels.</li>
          <li>A passenger is released only to a person named on the route plan.</li>
          <li>No personal contact details are exchanged and no social media connections made.</li>
          <li>No photography or filming of passengers.</li>
          <li>Intimate care is not provided.</li>
        </ul>
      </PolicySection>

      <PolicySection heading="If nobody is there at drop-off">
        <Prose text={`If nobody authorised is present at drop-off, the driver stays with the passenger and contacts our office. We contact the parent or carer. If contact is not made within 15 minutes we contact the commissioning authority and, where appropriate, social care. A passenger is never left unattended and is never taken to a driver's or assistant's home.`} />
      </PolicySection>

      <PolicySection heading="Raising a concern">
        <Prose text={`If you are worried about a child or adult at risk, contact us on ${COMPANY.phone} or ${COMPANY.email}. If someone is in immediate danger call 999. You can also contact the relevant local authority's social care team directly, or the NSPCC helpline on 0808 800 5000.`} />
      </PolicySection>

      <PolicyReference policyName="Safeguarding Policy" reference="HTL-POL-01" />
    </PolicyPage>
  )
}
