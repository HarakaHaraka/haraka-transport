import { COMPANY } from '../config/company'
import { PolicyPage, PolicySection, Prose, PolicyTable, PolicyReference, PolicyLink } from '../components/PolicyPage'

export default function ComplaintsPage() {
  return (
    <PolicyPage
      title="Complaints"
      badge="Legal"
      intro="We welcome complaints. A complaint tells us something is wrong before it becomes serious — and the passengers whose journeys we arrange are frequently people who find it difficult to raise concerns themselves."
    >
      <PolicySection heading="How to complain">
        <PolicyTable
          headers={['Channel', 'Details']}
          rows={[
            ['Phone', COMPANY.phone],
            ['Email', COMPANY.email],
            ['Online', 'Our contact form'],
            ['Post', COMPANY.tradingAddress],
            ['In person', 'To any assigned driver or passenger assistant, who will record it and pass it to Haraka the same day.'],
          ]}
        />
        <Prose text={`We accept complaints from a passenger, parent, carer, school, social worker, commissioner or member of the public. We accept complaints made by a representative or advocate. We provide support to complain in an accessible format on request. We investigate anonymous complaints as far as is practicable.`} />
      </PolicySection>

      <PolicySection heading="Our process">
        <PolicyTable
          headers={['Stage', 'Action', 'Timescale']}
          rows={[
            ['Receipt', 'Complaint logged in the complaints register; unique reference issued', 'Same working day'],
            ['Acknowledgement', 'Written acknowledgement naming the investigating officer', 'Within 2 working days'],
            ['Investigation', 'Records, route data and provider account reviewed; driver or assistant interviewed where relevant', '—'],
            ['Response', 'Full written response: findings, decision, action taken, apology where due', 'Within 10 working days'],
            ['Extension', 'If more time is needed, you are told the reason and given a new date', 'Before day 10'],
            ['Review', 'If dissatisfied, escalation to the Director for review', 'Within 10 working days'],
            ['External escalation', 'You may escalate to the commissioning authority and the Local Government and Social Care Ombudsman', '—'],
          ]}
        />
      </PolicySection>

      <PolicySection heading="Urgent complaints">
        <Prose text={`Complaints involving safeguarding, passenger safety or discrimination are escalated to the Director and Designated Safeguarding Lead immediately, handled under our Safeguarding Policy where relevant, and are not held to the standard timescale.`} />
      </PolicySection>

      <PolicySection heading="Refunds and redress">
        <Prose text={`Where a complaint is upheld and you paid for the journey directly, we refund in full or in part depending on what went wrong, and we tell you the outcome in the written response. Refunds are paid by the method used for the original payment within 10 working days of the decision.

For journeys arranged and paid for by a local authority, no charge falls to you and any redress is agreed with the authority.`} />
        <p style={{ marginTop: '-8px' }}>Cancellation charges are set out in our <PolicyLink to="/terms">Terms & Conditions</PolicyLink>.</p>
      </PolicySection>

      <PolicySection heading="Compliments">
        <Prose text={`Recorded in the same register and shared with the provider concerned.`} />
      </PolicySection>

      <PolicySection heading="Learning">
        <Prose text={`The complaints register records the theme, outcome and action taken. The Director reviews the register monthly to identify patterns. Where a complaint reveals a systemic issue, the relevant policy is amended and the change recorded.`} />
      </PolicySection>

      <PolicyReference policyName="Complaints Policy" reference="HTL-POL-05" />
    </PolicyPage>
  )
}
