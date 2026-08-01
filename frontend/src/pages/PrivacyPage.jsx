import { COMPANY } from '../config/company'
import { PolicyPage, PolicySection, Prose, PolicyTable, PolicyReference } from '../components/PolicyPage'

export default function PrivacyPage() {
  return (
    <PolicyPage
      title="Privacy Policy"
      badge="Legal"
      intro={`${COMPANY.legalName} handles personal data about children, adults at risk, their families, and the drivers and passenger assistants we assign — including special category data relating to health and disability. We comply with the UK GDPR and the Data Protection Act 2018. Registered with the Information Commissioner's Office, registration number ${COMPANY.icoRegistration}.`}
    >
      <PolicySection heading="Who we are and our role">
        <Prose text={`In most commissioned work the local authority is the data controller and Haraka is a data processor acting on the authority's documented instructions. Haraka is a controller for its own provider records, business records and direct enquiries received through this website.`} />
      </PolicySection>

      <PolicySection heading="Data protection lead">
        <Prose text={`${COMPANY.dataProtectionLead}, ${COMPANY.email}.`} />
      </PolicySection>

      <PolicySection heading="What we collect and why">
        <PolicyTable
          headers={['Data', 'Category', 'Lawful basis']}
          rows={[
            ['Passenger name, address, contact details', 'Personal', 'Contract / public task (via controller)'],
            ['Route and journey details', 'Personal', 'Contract'],
            ['Medical conditions, disability, mobility and communication needs', 'Special category', 'Art. 9(2)(b)/(h) + DPA 2018 Sch. 1'],
            ['Safeguarding concerns and referrals', 'Special category', 'Art. 9(2)(b); DPA Sch. 1 Pt 2 para 18'],
            ['Driver and assistant records: identity, licences, DBS, training, insurance', 'Personal / special category / criminal offence data', 'Legal obligation; Art. 9(2)(b); DPA Sch. 1'],
            ['Website enquiry details', 'Personal', 'Consent / legitimate interests'],
            ["In-vehicle CCTV where a driver's vehicle is fitted", 'Personal', 'Legitimate interests / contract'],
          ]}
        />
      </PolicySection>

      <PolicySection heading="Data minimisation">
        <Prose text={`Assigned drivers and passenger assistants receive only the information necessary to deliver the journey safely — typically the passenger's name, pick-up and drop-off details, timings, and the relevant parts of the individual risk assessment. They do not receive full case files.`} />
      </PolicySection>

      <PolicySection heading="How long we keep it">
        <PolicyTable
          headers={['Record type', 'Retention']}
          rows={[
            ['Journey and booking records', '12 months from the date the booking was accepted'],
            ['Provider records', 'Duration of engagement plus 12 months'],
            ['Safeguarding records', "In line with statutory guidance and the commissioning authority's requirements"],
            ['Website enquiries', '12 months'],
            ['CCTV', '30 days unless required for an investigation'],
          ]}
        />
      </PolicySection>

      <PolicySection heading="Where your data is held">
        <Prose text={`Our booking and administration platform is hosted on Render with the database held in a European region within the European Economic Area. Transactional email is sent through a processor whose processing region for this domain is Ireland. Our public website is served as static content and is configured so that no passenger or provider personal data is submitted to or stored by it; all enquiry and booking submissions are posted directly to our own application. Where a supplier is established outside the UK or EEA we do not transfer personal data unless an appropriate safeguard is in place.`} />
      </PolicySection>

      <PolicySection heading="Your rights">
        <Prose text={`You have the right to be informed, of access, to rectification, to erasure, to restrict processing, to data portability, to object, and rights relating to automated decision-making. Requests concerning commissioned services are forwarded to the local authority as controller within 2 working days and we assist them in meeting the statutory one-month deadline. Requests concerning our own records are handled within one month. Contact ${COMPANY.email}.`} />
      </PolicySection>

      <PolicySection heading="Complaints to the ICO">
        <Prose text={`You have the right to complain to the Information Commissioner's Office at ico.org.uk or on 0303 123 1113.`} />
      </PolicySection>

      <PolicySection heading="Cookies">
        <Prose text={`This website does not set any cookies — not even strictly necessary ones — and does not use local browser storage. There is no analytics, advertising or tracking on this site, so no cookie consent banner is required. If that changes, this section will be updated before any cookie is set.`} />
      </PolicySection>

      <PolicyReference policyName="Privacy Policy" reference="HTL-POL-04" />
    </PolicyPage>
  )
}
