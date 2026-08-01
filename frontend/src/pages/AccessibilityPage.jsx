import { COMPANY } from '../config/company'
import { PolicyPage, PolicySection, Prose, PolicyReference } from '../components/PolicyPage'

export default function AccessibilityPage() {
  return (
    <PolicyPage title="Accessibility" badge="Legal">
      <PolicySection heading="Our commitment">
        <Prose text={`We comply with the Equality Act 2010 and support commissioning authorities in meeting the Public Sector Equality Duty. We assign wheelchair accessible vehicles, specialist seating and harnesses, and allow additional transfer time where a passenger needs it.`} />
      </PolicySection>

      <PolicySection heading="Consistency of personnel">
        <Prose text={`We assign a regular, named driver and passenger assistant to each route wherever possible, and notify the school and family in advance of any planned change. Many SEND passengers experience changes of personnel as distressing, so we treat consistency as a core inclusion measure.`} />
      </PolicySection>

      <PolicySection heading="How we communicate">
        <Prose text={`We communicate in the format that works for the passenger — including easy-read, symbols, visual timetables, Makaton or other approaches identified in the individual risk assessment. We respect cultural and religious requirements including in relation to dress, physical contact and observance.`} />
      </PolicySection>

      <PolicySection heading="Assistance dogs">
        <Prose text={`Assistance dogs are carried at all times. Refusing an assistance dog is unlawful and every assigned provider is made aware of this.`} />
      </PolicySection>

      <PolicySection heading="Meeting the passenger's needs">
        <Prose text={`We do not assign a provider or vehicle that cannot meet the passenger's needs. Any allegation of discrimination is treated as a formal complaint and investigated by the Director.`} />
      </PolicySection>

      <PolicySection heading="Accessibility of this website">
        <Prose text={`We target WCAG 2.2 AA conformance across this website. If you find a page or feature that is difficult to use with a keyboard, screen reader, or assistive technology, please tell us — contact ${COMPANY.email} or ${COMPANY.phone} and describe the problem and the page it's on. We will investigate and respond.`} />
      </PolicySection>

      <PolicyReference policyName="Accessibility Policy" reference="HTL-POL-03" />
    </PolicyPage>
  )
}
