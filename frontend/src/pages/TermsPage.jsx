import { useNavigate } from 'react-router-dom'

export default function TermsPage() {
  const navigate = useNavigate()

  const sections = [
    {
      title: '1. Company Information',
      content: `Haraka Transport Ltd is a TFL licensed private hire operator registered in England and Wales.

Company Registration Number: [INSERT COMPANIES HOUSE NUMBER]
TFL Operator Licence Number: [INSERT TFL OPERATOR LICENCE NUMBER]
Registered Address: [INSERT REGISTERED BUSINESS ADDRESS]
Email: [INSERT BUSINESS EMAIL]
Voice Contact: [INSERT VCR VOICE CONTACT NUMBER]`
    },
    {
      title: '2. Acceptance of Terms',
      content: `By using our website, submitting a booking or quote request, or engaging our services, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.`
    },
    {
      title: '3. Services Provided',
      content: `Haraka Transport Ltd provides TFL licensed private hire transport services including but not limited to:
- Airport transfers
- SEN and care transport
- Concierge chauffeur services
- Corporate account transport
- Events and wedding transport
- School run and local authority contracted transport

All journeys are pre-booked. We do not operate as a hackney carriage and cannot accept street hail bookings.`
    },
    {
      title: '4. Booking and Confirmation',
      content: `[INSERT YOUR BOOKING TERMS HERE]

Include:
- How bookings are confirmed
- Confirmation timeframes
- What constitutes a confirmed booking
- Driver allocation process`
    },
    {
      title: '5. Pricing and Payment',
      content: `[INSERT YOUR PRICING AND PAYMENT TERMS HERE]

Include:
- How quotes are calculated
- Payment methods accepted
- When payment is due
- Invoice terms for corporate accounts
- VAT status`
    },
    {
      title: '6. Cancellation Policy',
      content: `[INSERT YOUR CANCELLATION POLICY HERE]

Include:
- Notice period required for cancellation
- Cancellation fees by notice period
- No-show policy
- Force majeure circumstances`
    },
    {
      title: '7. Refunds',
      content: `Please refer to our Refunds and Complaints Policy for full details of our refund procedure.

[INSERT SUMMARY REFUND TERMS HERE]`
    },
    {
      title: '8. SEN and Vulnerable Passengers',
      content: `Haraka Transport Ltd takes its safeguarding responsibilities extremely seriously. All drivers operating SEN and care transport routes hold:
- Enhanced DBS certificates registered on the DBS Update Service
- SEN awareness training
- Safeguarding training

We operate a strict safeguarding policy. Any concerns regarding the welfare of passengers should be reported immediately to [INSERT SAFEGUARDING LEAD NAME AND CONTACT].`
    },
    {
      title: '9. Liability',
      content: `[INSERT YOUR LIABILITY TERMS HERE]

Include:
- Limitation of liability
- Insurance coverage details
- What you are and are not liable for
- Force majeure clause`
    },
    {
      title: '10. Data Protection',
      content: `Haraka Transport Ltd is registered with the Information Commissioner's Office (ICO). Registration Number: [INSERT ICO REGISTRATION NUMBER]

We collect and process personal data in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.

[INSERT PRIVACY POLICY SUMMARY OR LINK TO FULL PRIVACY POLICY]`
    },
    {
      title: '11. Governing Law',
      content: `These Terms and Conditions are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.`
    },
    {
      title: '12. Changes to Terms',
      content: `Haraka Transport Ltd reserves the right to update these Terms and Conditions at any time. Changes will be posted on this page with the date of last update. Continued use of our services after changes constitutes acceptance of the updated terms.

Last updated: [INSERT DATE]`
    },
  ]

  return (
    <div style={{ background: '#0F0A1E', minHeight: '100vh', paddingTop: '90px', paddingBottom: '60px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="badge badge-purple" style={{ marginBottom: '14px', display: 'inline-block' }}>Legal</span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: 'white', marginBottom: '12px' }}>
            Terms & Conditions
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
            Haraka Transport Ltd · Last updated: [INSERT DATE]
          </p>
        </div>

        {/* Notice box */}
        <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '12px', padding: '20px 24px', marginBottom: '36px' }}>
          <p style={{ color: '#F59E0B', fontSize: '0.875rem', lineHeight: 1.7 }}>
            Please read these Terms and Conditions carefully before using our services.
            By making a booking with Haraka Transport Ltd you agree to these terms in full.
          </p>
        </div>

        {/* Sections */}
        {sections.map((s, i) => (
          <div key={i} className="glass-card" style={{ padding: '28px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#A855F7', marginBottom: '14px' }}>{s.title}</h2>
            <div style={{ width: '32px', height: '2px', background: 'linear-gradient(to right, #F59E0B, #A855F7)', borderRadius: '1px', marginBottom: '14px' }} />
            <p style={{ color: '#94A3B8', lineHeight: 1.85, fontSize: '0.9rem', whiteSpace: 'pre-line' }}>{s.content}</p>
          </div>
        ))}

        {/* Footer nav */}
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', marginTop: '40px', flexWrap: 'wrap' }}>
          <button className="btn-outline" onClick={() => navigate('/complaints')} style={{ fontSize: '0.85rem' }}>
            Refunds & Complaints Policy
          </button>
          <button className="btn-primary" onClick={() => navigate('/')} style={{ fontSize: '0.85rem' }}>
            Back to Homepage
          </button>
        </div>
      </div>
    </div>
  )
}