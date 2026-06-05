import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const sections = [
  {
    title: '1. Our Commitment',
    content: `Haraka Transport Ltd is committed to providing a professional, safe, and reliable service. If something goes wrong, we want to hear about it and resolve it as quickly as possible.

We treat all complaints seriously and aim to:
• Acknowledge your complaint within 2 working days
• Investigate thoroughly and fairly
• Provide a full written response within 10 working days
• Learn from complaints to improve our service

Our complaints process is compliant with TFL licensing requirements and applicable consumer protection legislation.`,
  },
  {
    title: '2. How to Make a Complaint',
    content: `You can submit a complaint by any of the following methods:

Email: info@harakatransport.co.uk
Phone: [INSERT VCR VOICE CONTACT NUMBER]
In writing: [INSERT REGISTERED BUSINESS ADDRESS]

When making a complaint please include:
• Your full name and contact details
• Your booking reference number (if applicable)
• The date, time, and details of the journey
• A clear description of the issue or concern
• Any supporting evidence (photos, messages, receipts)
• What resolution you are seeking

All complaints are treated confidentially.`,
  },
  {
    title: '3. Complaint Investigation Process',
    content: `Step 1 — Acknowledgement
We will acknowledge receipt of your complaint within 2 working days. You will be given a complaint reference number.

Step 2 — Investigation
We will investigate your complaint thoroughly. This may include reviewing journey records, vehicle data, dashcam footage (where applicable), and speaking with the driver or passenger assistant involved.

Step 3 — Response
We will provide a full written response within 10 working days of acknowledgement. In complex cases we may require additional time and will keep you informed.

Step 4 — Resolution
Where a complaint is upheld, we will offer an appropriate remedy which may include an apology, a refund, a service credit, or a combination of these.

Step 5 — Escalation
If you are not satisfied with our response, you may escalate your complaint to:
• Transport for London (TFL): tfl.gov.uk/contact
• Citizens Advice: citizensadvice.org.uk
• The Motor Ombudsman: themotorombudsman.org`,
  },
  {
    title: '4. Refund Policy',
    content: `We will issue a full or partial refund where:

• The journey was not completed due to a fault on our part
• The vehicle did not arrive within a reasonable period of the agreed time without prior notice
• The service provided was materially different from what was agreed
• A cancellation was made within the eligible period (see Section 5)

Refunds are processed within 10 working days of a decision being made. Refunds are returned to the original payment method where possible.

We reserve the right to deduct any costs already incurred (driver attendance, toll fees, airport charges) from the refund amount where applicable.`,
  },
  {
    title: '5. Cancellation Refund Schedule',
    content: `The following cancellation refund schedule applies to standard bookings:

• Cancelled more than 24 hours before scheduled pickup: Full refund — no charge
• Cancelled 12–24 hours before scheduled pickup: 50% refund — 50% cancellation fee applies
• Cancelled less than 12 hours before scheduled pickup: No refund — full fare charged
• No-show (driver attended but passenger not present): No refund — full fare charged

SEN, school run, and local authority contract cancellations are subject to the terms of the individual contract and may differ from the above schedule.

Force majeure circumstances (severe weather, civil emergencies, national incidents) will be assessed on a case-by-case basis and cancellation fees may be waived at our discretion.`,
  },
  {
    title: '6. SEN & Local Authority Bookings',
    content: `For complaints relating to SEN transport, school run, or local authority contracted journeys:

• Please contact us using the details in Section 2 and quote your contract reference number
• Complaints will be escalated to the relevant local authority or commissioning body where required by the contract
• We will cooperate fully with any investigation conducted by the local authority or SPROC framework manager

Complaints relating to safeguarding matters will be treated with the highest priority and referred to our Designated Safeguarding Lead immediately upon receipt.

Safeguarding Lead: [INSERT NAME]
Contact: [INSERT CONTACT DETAILS]
Available: [INSERT HOURS]

If you believe a child or vulnerable adult is at immediate risk, contact the emergency services on 999.`,
  },
  {
    title: '7. Driver Conduct Complaints',
    content: `We take complaints about driver conduct extremely seriously. All complaints of this nature are investigated fully and may result in:

• A formal warning to the driver
• Additional training requirements
• Suspension pending investigation
• Termination of the driver's engagement with Haraka Transport Ltd
• Referral to TFL's Taxi & Private Hire licensing team where appropriate

Drivers operating under Haraka Transport Ltd are expected to maintain the highest standards of professional conduct at all times in accordance with TFL licensing requirements.`,
  },
  {
    title: '8. Complaints Relating to TFL Compliance',
    content: `Haraka Transport Ltd operates under a TFL Private Hire Operator Licence. Complaints that relate to potential breaches of TFL licensing conditions may also be referred directly to:

Transport for London — Taxi & Private Hire
Contact: tfl.gov.uk/contact
Phone: 0343 222 4000

We are required to cooperate fully with TFL in any investigation and to maintain records of all complaints for the duration required by our licence conditions.`,
  },
]

export default function ComplaintsPage() {
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
          }}>Policy</div>
          <h1 style={{
            fontSize: 'clamp(1.8rem, 5vw, 3rem)',
            fontWeight: 900,
            color: '#fff',
            margin: '0 0 12px',
          }}>Refunds & Complaints</h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', margin: 0 }}>
            Haraka Transport Ltd · Last updated: June 2026
          </p>
        </div>

        {/* Quick contact strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '32px',
        }}>
          {[
            { label: 'Email us', value: 'info@harakatransport.co.uk', icon: '✉️' },
            { label: 'Call us', value: '[INSERT NUMBER]', icon: '📞' },
            { label: 'Response time', value: 'Within 2 working days', icon: '⏱' },
          ].map(item => (
            <div key={item.label} style={{
              background: 'rgba(168,85,247,0.06)',
              border: '1px solid rgba(168,85,247,0.15)',
              borderRadius: '12px',
              padding: '16px 18px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.4rem', marginBottom: '6px' }}>{item.icon}</div>
              <div style={{ fontSize: '0.75rem', color: '#A855F7', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
              <div style={{ fontSize: '0.82rem', color: '#fff' }}>{item.value}</div>
            </div>
          ))}
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
            We aim to resolve all complaints fairly and promptly. If your complaint relates to a safeguarding concern, please contact us immediately by phone.
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
            onClick={() => navigate('/terms')}
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
            Terms & Conditions →
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
