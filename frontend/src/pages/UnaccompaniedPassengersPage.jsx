import { PolicyPage, PolicySection, Prose, PolicyTable, PolicyReference } from '../components/PolicyPage'

export default function UnaccompaniedPassengersPage() {
  return (
    <PolicyPage title="Unaccompanied Passengers" badge="Legal">
      <PolicySection>
        <PolicyTable
          headers={['', 'Commissioned transport', 'Private hire and concierge']}
          rows={[
            ['Minimum age for an unaccompanied passenger', 'No minimum age', '16 years'],
            ['Who specifies the requirement', 'The commissioning local authority', 'The person making the booking'],
            ['Individual risk assessment', 'Required before the first journey', 'Not applicable'],
            ['Passenger assistant', 'Assigned where the specification or risk assessment requires; presumed for passengers under 8', 'Not provided'],
            ['Named handover', 'Required, to a person named on the route plan', 'Not applicable'],
            ['Written consent', 'Route Confirmation and Consent Form', 'Not applicable'],
          ]}
        />
      </PolicySection>

      <PolicySection heading="Commissioned transport">
        <Prose text="We do not apply a minimum age to passengers travelling under a contract with a local authority. Age is not the control — the controls are the commissioner's specification, the individual risk assessment, the assignment of a passenger assistant where one is needed, the vetting standard applied to every driver and assistant, and the named handover rule." />
        <p>Before any commissioned unaccompanied passenger travels, all of the following must be satisfied:</p>
        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>Written specification from the authority.</li>
          <li>Individual risk assessment completed with authority, school and family.</li>
          <li>Signed Route Confirmation and Consent Form.</li>
          <li>Named authorised persons on the route plan.</li>
          <li>Passenger assistant assigned where required — presumed under age 8.</li>
          <li>Driver and assistant confirm they have read the risk assessment.</li>
        </ul>
        <Prose text="Where any condition is not satisfied, the passenger does not travel and we notify the commissioning authority promptly." />
      </PolicySection>

      <PolicySection heading="Private hire">
        <Prose text="We do not carry an unaccompanied passenger under 16 on a private booking. A passenger under 16 may travel accompanied by a responsible adult aged 18 or over named on the booking. Child seats and boosters must be requested at booking." />
      </PolicySection>

      <PolicyReference policyName="Unaccompanied Passengers Policy" reference="HTL-POL-19" />
    </PolicyPage>
  )
}
