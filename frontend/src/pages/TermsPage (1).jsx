import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const sections = [
  {
    title: '1. Company Information',
    content: `Haraka Transport Ltd is a TFL licensed private hire operator registered in England and Wales.

Company Registration Number: [INSERT COMPANIES HOUSE NUMBER]
TFL Operator Licence Number: [INSERT TFL OPERATOR LICENCE NUMBER]
Registered Address: [INSERT REGISTERED BUSINESS ADDRESS]
Email: info@harakatransport.co.uk
Voice Contact: [INSERT VCR VOICE CONTACT NUMBER]

Haraka Transport Ltd operates under the authority of Transport for London (TFL) and complies with all applicable private hire legislation including the Private Hire Vehicles (London) Act 1998.`,
  },
  {
    title: '2. Acceptance of Terms',
    content: `By using our website (harakatransport.co.uk), submitting a booking or quote request, or engaging our services in any way, you agree to be bound by these Terms and Conditions in full.

If you do not agree with any part of these terms, please do not use our services. These terms apply to all passengers, clients, and account holders.`,
  },
  {
    title: '3. Services Provided',
    content: `Haraka Transport Ltd provides TFL licensed private hire transport services including but not limited to:

• Airport Transfers — all major London airports including Heathrow, Gatwick, Stansted, Luton, and London City
• SEN & Care Transport — specialist transport for children and adults with special educational needs, disabilities, and care requirements
• Concierge Chauffeur Services — premium point-to-point and as-directed services
• Corporate Account Transport — managed business travel for organisations
• Events & Wedding Transport — group and individual transport for special occasions
• School Run & Local Authority Contracted Transport — SPROC and DPS compliant services

All journeys are pre-booked. Haraka Transport Ltd does not operate as a hackney carriage and cannot accept street hail bookings. All bookings must be made in advance through our website, by phone, or through an authorised account.`,
  },
  {
    title: '4. Booking & Confirmation',
    content: `Bookings can be submitted via our website at harakatransport.co.uk, by telephone, or through a corporate account arrangement.

• All bookings are subject to availability and are not confirmed until you receive a written or verbal confirmation from Haraka Transport Ltd.
• We aim to confirm all bookings within 2 hours of submission during business hours.
• A booking reference will be provided upon confirmation — please retain this for your records.
• It is the passenger's responsibility to ensure all booking details (pickup address, time, destination, passenger count) are accurate.
• Haraka Transport Ltd reserves the right to decline any booking at its discretion.`,
  },
  {
    title: '5. Pricing & Payment',
    content: `All prices are quoted in pounds sterling (GBP) inclusive of any applicable charges unless otherwise stated.

• Quotes provided via our website are estimates based on the information provided and are subject to final confirmation.
• Fixed prices are agreed at the time of booking for standard routes. Variable pricing may apply for as-directed or hourly hire.
• Payment methods accepted: bank transfer, card payment, and approved corporate account invoice.
• Corporate account invoices are issued monthly and are payable within 30 days of the invoice date.
• Haraka Transport Ltd is not currently VAT registered. If our VAT status changes, we will update these terms accordingly.
• Waiting time charges may apply beyond the agreed grace period — details will be confirmed at the time of booking.
• Additional charges may apply for out-of-hours bookings, excess luggage, or additional stops.`,
  },
  {
    title: '6. Cancellation Policy',
    content: `Cancellations must be made directly with Haraka Transport Ltd by telephone or email using the contact details provided in your booking confirmation.

• Cancellations made more than 24 hours before the scheduled pickup time: No charge.
• Cancellations made 12–24 hours before the scheduled pickup time: 50% of the agreed fare may be charged.
• Cancellations made less than 12 hours before the scheduled pickup time: Up to 100% of the agreed fare may be charged.
• No-shows (driver attended but passenger did not board within the agreed waiting period): Full fare charged.
• Local authority, school, and SEN contract cancellations are subject to the terms of the relevant contract.

Force Majeure: In circumstances beyond our reasonable control (severe weather, civil emergencies, national incidents), cancellation fees may be waived at our discretion.`,
  },
  {
    title: '7. Refunds',
    content: `For full details of our refund procedure please refer to our Refunds & Complaints Policy.

In summary:
• Refunds for eligible cancellations are processed within 10 working days.
• Refunds are made to the original payment method where possible.
• Disputes regarding charges should be raised within 14 days of the journey date.

Please refer to our Refunds & Complaints Policy page for the complete refund schedule and complaint process.`,
  },
  {
    title: '8. SEN & Vulnerable Passengers',
    content: `Haraka Transport Ltd takes its safeguarding responsibilities extremely seriously. All drivers and passenger assistants operating SEN and care transport routes hold:

• Enhanced DBS certificates registered on the DBS Update Service
• SEN awareness training
• Safeguarding and child protection training
• First aid certification (where required by contract)

We operate a strict safeguarding policy compliant with the relevant statutory guidance. Drivers are not permitted to transport unaccompanied minors without written consent from the commissioning authority or parent/guardian.

Any concerns regarding the welfare of a passenger must be reported immediately to:
Safeguarding Lead: [INSERT SAFEGUARDING LEAD NAME]
Contact: [INSERT CONTACT DETAILS]

We are compliant with the SPROC Dynamic Purchasing System (DPS) framework for SEN transport and school runs.`,
  },
  {
    title: '9. Passenger Conduct',
    content: `Passengers are expected to behave in a respectful and safe manner throughout their journey. Haraka Transport Ltd reserves the right to terminate a journey without refund if a passenger:

• Behaves in a threatening, abusive, or violent manner toward the driver or other passengers
• Is in a condition that poses a risk to the driver or vehicle
• Causes or threatens to cause damage to the vehicle
• Refuses to comply with reasonable instructions from the driver

Any damage caused to a vehicle by a passenger will be charged to the passenger or the booking account holder.`,
  },
  {
    title: '10. Liability',
    content: `Haraka Transport Ltd holds valid motor insurance and public liability insurance as required by TFL licensing conditions.

• We accept liability for loss or injury caused directly by our negligence or that of our drivers.
• We do not accept liability for delays caused by traffic, road conditions, adverse weather, or circumstances beyond our reasonable control.
• We do not accept liability for loss or damage to luggage or personal belongings left in a vehicle, though we will make reasonable efforts to recover and return lost property.
• Our liability for any claim shall not exceed the value of the journey fare paid unless required by law.
• Nothing in these terms limits our liability for death or personal injury caused by negligence, or for fraud or fraudulent misrepresentation.`,
  },
  {
    title: '11. Data Protection',
    content: `Haraka Transport Ltd is registered with the Information Commissioner's Office (ICO).
ICO Registration Number: [INSERT ICO REGISTRATION NUMBER]

We collect and process personal data in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.

Data we collect includes: name, contact details, journey information, and payment records. This data is used solely for the purpose of providing our transport services, managing bookings, and complying with legal obligations.

We do not sell or share personal data with third parties for marketing purposes. Data is retained for the period required by our TFL licence and applicable legislation.

You have the right to access, correct, or request deletion of your personal data. To exercise these rights, contact us at info@harakatransport.co.uk.`,
  },
  {
    title: '12. Governing Law',
    content: `These Terms and Conditions are governed by the laws of England and Wales. Any disputes arising from these terms or from the use of our services shall be subject to the exclusive jurisdiction of the courts of England and Wales.

If any provision of these terms is found to be unenforceable, the remaining provisions shall continue in full force and effect.`,
  },
  {
    title: '13. Changes to Terms',
    content: `Haraka Transport Ltd reserves the right to update these Terms and Conditions at any time without prior notice. Changes will be posted on this page with the date of last update.

Continued use of our services after changes are posted constitutes your acceptance of the updated terms. We recommend reviewing this page periodically.

Last updated: June 2026`,
  },
]

export default function TermsPage() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(null)

  return (
    <div style={{
      background: '#0F0A1E',
      minHeight: '100vh',
      paddingTop: '90px',
      paddingBottom: '60px',
    }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 16px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(168,85,247,0.12)',
            border: '1px solid rgba(168,85,247,0.3)',
            borderRadius: '20px',
            padding: '4px 14px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#A855F7',
            marginBottom: '14px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>Legal</div>
          <h1 style={{
            fontSize: 'clamp(1.8rem, 5vw, 3rem)',
            fontWeight: 900,
            color: '#fff',
            margin: '0 0 12px',
          }}>Terms & Conditions</h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', margin: 0 }}>
            Haraka Transport Ltd · Last updated: June 2026
          </p>
        </div>

        {/* Notice */}
        <div style={{
          background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: '12px',
          padding: '18px 22px',
          marginBottom: '32px',
        }}>
          <p style={{ color: '#F59E0B', fontSize: '0.875rem', lineHeight: 1.7, margin: 0 }}>
            Please read these Terms and Conditions carefully before using our services.
            By making a booking with Haraka Transport Ltd you agree to these terms in full.
            For queries contact us at <strong>info@harakatransport.co.uk</strong>.
          </p>
        </div>

        {/* Accordion sections */}
        {sections.map((s, i) => (
          <div
            key={i}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${open === i ? 'rgba(168,85,247,0.4)' : 'rgba(168,85,247,0.1)'}`,
              borderRadius: '12px',
              marginBottom: '10px',
              overflow: 'hidden',
              transition: 'border-color 0.2s',
            }}
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '18px 22px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                gap: '12px',
              }}
            >
              <span style={{
                fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                fontWeight: 700,
                color: open === i ? '#A855F7' : '#fff',
                transition: 'color 0.2s',
              }}>{s.title}</span>
              <span style={{
                fontSize: '1.2rem',
                color: '#A855F7',
                flexShrink: 0,
                transition: 'transform 0.2s',
                transform: open === i ? 'rotate(45deg)' : 'rotate(0deg)',
              }}>+</span>
            </button>

            {open === i && (
              <div style={{ padding: '0 22px 22px' }}>
                <div style={{
                  width: '32px',
                  height: '2px',
                  background: 'linear-gradient(to right, #F59E0B, #A855F7)',
                  borderRadius: '1px',
                  marginBottom: '14px',
                }} />
                <p style={{
                  color: '#94A3B8',
                  lineHeight: 1.85,
                  fontSize: '0.875rem',
                  whiteSpace: 'pre-line',
                  margin: 0,
                }}>{s.content}</p>
              </div>
            )}
          </div>
        ))}

        {/* Footer nav */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          marginTop: '40px',
          flexWrap: 'wrap',
        }}>
          <button
            onClick={() => navigate('/complaints')}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '10px',
              color: '#fff',
              padding: '12px 22px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            Refunds & Complaints →
          </button>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
              border: 'none',
              borderRadius: '10px',
              color: '#fff',
              padding: '12px 22px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            Back to Homepage
          </button>
        </div>
      </div>
    </div>
  )
}
