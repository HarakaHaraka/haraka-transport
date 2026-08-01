import { COMPANY } from '../config/company'
import { PolicyPage, PolicySection, Prose, PolicyReference, PolicyLink } from '../components/PolicyPage'
import FaresTable from '../components/FaresTable'

export default function TermsPage() {
  return (
    <PolicyPage title="Terms & Conditions" badge="Legal">
      <PolicySection heading="About these terms">
        <Prose text={`These terms govern all bookings made with ${COMPANY.legalName}, a private hire operator licensed by Transport for London. By making a booking — by telephone, email, our website, or through a commissioning authority — you accept these terms. Registered in England & Wales, company number ${COMPANY.companyNumber}, registered office ${COMPANY.registeredOffice}.

All journeys are pre-booked. We do not accept street hails or provide an on-demand service. We arrange journeys using Transport for London licensed private hire drivers and licensed private hire vehicles.`} />
        <p>{COMPANY.operatorLicenceNumber
          ? `TfL private hire operator's licence number: ${COMPANY.operatorLicenceNumber}`
          : COMPANY.operatorLicencePendingText}</p>
      </PolicySection>

      <PolicySection heading="Our contract with you">
        <Prose text={`When we accept your booking, Haraka enters into a contractual obligation with you, as principal, to provide the journey you have booked, in accordance with the Private Hire Vehicles (London) Act 1998. We then assign a licensed driver and vehicle to carry out that journey. Your contract for the journey is with Haraka. A booking is confirmed only once we have accepted it and provided you with a booking confirmation.`} />
      </PolicySection>

      <PolicySection heading="Our services">
        <Prose text={`We provide two service lines:`} />
        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>Contracted passenger transport — home-to-school and social care journeys for children and adults with special educational needs and disabilities, arranged on behalf of local authorities.</li>
          <li>Private hire and concierge — pre-booked journeys for private customers including weddings, celebrations, events and pre-arranged group travel.</li>
        </ul>
      </PolicySection>

      <PolicySection heading="Bookings">
        <Prose text={`Bookings may be made through our website, by telephone or email, or for contracted work through the commissioning authority. Give accurate details: passenger name, pick-up and destination addresses, date and time, number of passengers, and any special requirements. You are responsible for the accuracy of information provided.`} />
      </PolicySection>

      <PolicySection heading="What we tell you before your journey">
        <Prose text={`Before your journey we provide booking confirmation details, which for private hire bookings include the assigned driver's first name, their private hire driver licence number, the vehicle registration mark, a photograph of the assigned driver where you have asked for confirmation by a means that can display an image, and how to contact us during the journey.`} />
      </PolicySection>

      <PolicySection heading="Fares and payment">
        <Prose text={`Every fare is quoted before the journey and confirmed in writing. See our full fares information below.`} />
        <FaresTable compact />
        <Prose text={`Payment by bank transfer or card via invoice. Additional charges may apply for waiting time, additional stops, cleaning as a result of damage or soiling, or changes you make to the booking; any such charge will be explained to you.`} />
      </PolicySection>

      <PolicySection heading="Cancellations and changes">
        <Prose text={`Cancellations made with at least 24 hours' notice will not be charged. Cancellations made with between 12 and 24 hours' notice may incur a charge of 50 per cent of the quoted fare. No refund is due where less than 12 hours' notice is given, or where the passenger does not travel. Cancellations of contracted local-authority journeys are governed by the relevant contract terms. We may cancel where circumstances beyond our reasonable control prevent us providing the journey safely.`} />
      </PolicySection>

      <PolicySection heading="Punctuality and delays">
        <Prose text={`We cannot accept liability for delays caused by circumstances beyond our reasonable control including traffic, weather, road closures or events. Where a delay is likely we contact you as soon as we are aware.`} />
      </PolicySection>

      <PolicySection heading="Passenger conduct and safety">
        <Prose text={`Seatbelts must be worn; appropriate child seats or harnesses used as required by law and by any individual risk assessment. Assistance dogs are always carried — please tell us at the time of booking. No smoking, vaping, alcohol or illegal substances in the vehicle. The driver may refuse to carry, or end, a journey where a passenger behaves in a way that is unsafe, abusive or unlawful. You are responsible for damage caused beyond fair wear and tear.`} />
      </PolicySection>

      <PolicySection heading="Unaccompanied passengers">
        <p>See our full <PolicyLink to="/unaccompanied-passengers">Unaccompanied Passengers policy</PolicyLink> for the rules that apply to each of our service lines.</p>
      </PolicySection>

      <PolicySection heading="Luggage and property">
        <Prose text={`Tell us of significant luggage or equipment at booking. Property is carried at the owner's risk. Lost property is logged and retained.`} />
        <p style={{ marginTop: '-8px' }}>See our <PolicyLink to="/lost-property">Lost Property policy</PolicyLink>.</p>
      </PolicySection>

      <PolicySection heading="Accessibility">
        <p>See our <PolicyLink to="/accessibility">Accessibility policy</PolicyLink>.</p>
      </PolicySection>

      <PolicySection heading="Safeguarding">
        <Prose text={`All assigned drivers and passenger assistants carrying children or adults at risk hold enhanced DBS checks and appropriate training.`} />
        <p style={{ marginTop: '-8px' }}>See our <PolicyLink to="/safeguarding">Safeguarding policy</PolicyLink>.</p>
      </PolicySection>

      <PolicySection heading="Complaints">
        <p>See our <PolicyLink to="/complaints">Complaints policy</PolicyLink>.</p>
      </PolicySection>

      <PolicySection heading="Liability">
        <Prose text={`Nothing limits our liability for death or personal injury caused by negligence, for fraud, or for anything else that cannot lawfully be limited. Subject to that, our liability is limited to the price of the journey; we are not liable for indirect or consequential loss. We maintain public liability insurance with ${COMPANY.insurance.insurer} to a limit of ${COMPANY.insurance.publicLiability}, and employers' liability insurance to a limit of ${COMPANY.insurance.employersLiability}, and assign only drivers who hold valid motor insurance for hire and reward.`} />
      </PolicySection>

      <PolicySection heading="Data protection">
        <p>See our <PolicyLink to="/privacy">Privacy policy</PolicyLink>. ICO registration {COMPANY.icoRegistration}.</p>
      </PolicySection>

      <PolicySection heading="Governing law">
        <Prose text={`England and Wales, exclusive jurisdiction.`} />
      </PolicySection>

      <PolicySection heading="Changes">
        <Prose text={`The version published at the time of your booking applies. Last updated ${COMPANY.policyApproved}.`} />
      </PolicySection>

      <PolicyReference policyName="Terms and Conditions" reference="HTL-TC-01" />
    </PolicyPage>
  )
}
