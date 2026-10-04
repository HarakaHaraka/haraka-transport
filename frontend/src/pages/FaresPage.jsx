import { COMPANY } from '../config/company'
import { PolicyPage, PolicySection, Prose, PolicyNote } from '../components/PolicyPage'
import FaresTable from '../components/FaresTable'

export default function FaresPage() {
  return (
    <PolicyPage
      title="Fares"
      badge="Pricing"
      intro="We publish how we price so you can see what to expect before you book, and to reduce any dispute about the fare."
    >
      <PolicySection heading="How we price">
        <Prose text="Every fare is quoted before the journey and confirmed in writing. Our quotes are based on:" />
        <FaresTable />
      </PolicySection>

      <PolicySection heading="What is included">
        <Prose text="The quoted fare includes the driver, the vehicle, fuel, insurance and normal waiting time." />
      </PolicySection>

      <PolicySection heading="What may be charged in addition">
        <Prose text="Waiting time beyond the included allowance, additional stops added after booking, cleaning as a result of damage or soiling, and changes you make to the booking. Any additional charge is explained to you before it is applied." />
      </PolicySection>

      <PolicySection heading="Contracted local-authority journeys">
        <Prose text="Fares are as agreed with the commissioning authority. No charge falls to the passenger or family." />
      </PolicySection>

      <PolicySection heading="Getting a quote">
        <Prose text={`Contact ${COMPANY.phone} or ${COMPANY.email}. We provide a fare or an accurate fare estimate before the journey begins and confirm it to you in writing.`} />
      </PolicySection>

      <PolicySection>
        <PolicyNote strong>
          We do not use surge or dynamic pricing.
        </PolicyNote>
      </PolicySection>
    </PolicyPage>
  )
}
