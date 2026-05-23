import { useNavigate } from 'react-router-dom'

export default function ComplaintsPage() {
  const navigate = useNavigate()

  return (
    <div style={{ background: '#0F0A1E', minHeight: '100vh', paddingTop: '90px', paddingBottom: '60px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 24px' }}>

        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="badge badge-purple" style={{ marginBottom: '14px', display: 'inline-block' }}>Policy</span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: 'white', marginBottom: '12px' }}>
            Refunds & Complaints
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
            Haraka Transport Ltd · Last updated: [INSERT DATE]
          </p>
        </div>

        {[
          {
            title: '1. Our Commitment',
            content: `Haraka Transport Ltd is committed to providing a professional and reliable service. If something goes wrong, we want to hear about it and put it right as quickly as possible.

We aim to resolve all complaints within [INSERT TIMEFRAME] working days.`
          },
          {
            title: '2. How to Make a Complaint',
            content: `You can make a complaint by:

- Email: [INSERT COMPLAINTS EMAIL ADDRESS]
- Phone: [INSERT VCR VOICE CONTACT NUMBER] (available [INSERT HOURS])
- In writing to: [INSERT REGISTERED BUSINESS ADDRESS]

Please include:
- Your name and contact details
- Your booking reference number
- Date and details of the journey
- Description of the issue
- What resolution you are seeking`
          },
          {
            title: '3. Complaint Investigation Process',
            content: `Step 1 — Acknowledgement
We will acknowledge your complaint within [INSERT TIMEFRAME] working days of receipt.

Step 2 — Investigation
We will investigate your complaint thoroughly. This may include reviewing journey records, speaking with the driver, and reviewing any relevant evidence.

Step 3 — Response
We will provide a full written response within [INSERT TIMEFRAME] working days.

Step 4 — Escalation
If you are not satisfied with our response, you may escalate your complaint to:
- Transport for London (TFL): tfl.gov.uk/contact
- Citizens Advice: citizensadvice.org.uk`
          },
          {
            title: '4. Refund Policy',
            content: `[INSERT YOUR FULL REFUND POLICY HERE]

Include:
- Circumstances where a full refund is issued
- Circumstances where a partial refund is issued
- Circumstances where no refund is issued
- Timeframe for refund processing
- Method of refund (original payment method)
- Any deductions that may apply`
          },
          {
            title: '5. Cancellation Refunds',
            content: `[INSERT YOUR CANCELLATION REFUND SCHEDULE HERE]

Example format:
- Cancelled more than 24 hours before journey: [INSERT REFUND %]
- Cancelled 12-24 hours before journey: [INSERT REFUND %]
- Cancelled less than 12 hours before journey: [INSERT REFUND %]
- No-show: [INSERT REFUND %]`
          },
          {
            title: '6. SEN and Local Authority Bookings',
            content: `For complaints relating to SEN transport, school run or local authority contracted journeys, please contact us using the details above and quote your contract reference number.

Complaints relating to safeguarding matters will be treated with the highest priority and referred to our Designated Safeguarding Lead immediately.

Safeguarding Lead: [INSERT NAME]
Contact: [INSERT CONTACT DETAILS]`
          },
          {
            title: '7. TFL Complaints',
            content: `As a TFL licensed private hire operator, you also have the right to raise concerns directly with Transport for London:

Transport for London
Private Hire Licensing
PO Box 77923
London
SW1P 9SH

Tel: 0343 222 4000
Web: tfl.gov.uk/contact`
          },
        ].map((s, i) => (
          <div key={i} className="glass-card" style={{ padding: '28px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#A855F7', marginBottom: '14px' }}>{s.title}</h2>
            <div style={{ width: '32px', height: '2px', background: 'linear-gradient(to right, #F59E0B, #A855F7)', borderRadius: '1px', marginBottom: '14px' }} />
            <p style={{ color: '#94A3B8', lineHeight: 1.85, fontSize: '0.9rem', whiteSpace: 'pre-line' }}>{s.content}</p>
          </div>
        ))}

        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', marginTop: '40px', flexWrap: 'wrap' }}>
          <button className="btn-outline" onClick={() => navigate('/terms')} style={{ fontSize: '0.85rem' }}>
            Terms & Conditions
          </button>
          <button className="btn-primary" onClick={() => navigate('/')} style={{ fontSize: '0.85rem' }}>
            Back to Homepage
          </button>
        </div>
      </div>
    </div>
  )
}