import { useLocation, useNavigate } from 'react-router-dom'

export function ConfirmPage() {
  const { state }  = useLocation()
  const navigate   = useNavigate()
  const { id, name, type } = state || {}
  const isQuote    = type === 'quote'
  const prefix     = isQuote ? 'QUO' : 'BKG'
  const ref        = id ? `${prefix}-${String(id).padStart(5,'0')}` : null

  return (
    <div style={{ minHeight:'100vh', background:'#0F0A1E', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 24px', paddingTop:'90px' }}>
      <div style={{ maxWidth:'540px', width:'100%', textAlign:'center' }}>
        <div style={{ width:'80px', height:'80px', borderRadius:'50%', background:'linear-gradient(135deg, #6B21A8, #A855F7)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', fontSize:'2.2rem', boxShadow:'0 0 32px rgba(107,33,168,0.5)' }}>✓</div>
        <span className={`badge ${isQuote ? 'badge-gold' : 'badge-purple'}`} style={{ marginBottom:'16px', display:'inline-block' }}>
          {isQuote ? 'Quote Request Received' : 'Booking Confirmed'}
        </span>
        <h1 style={{ fontSize:'clamp(2rem,5vw,3rem)', fontWeight:900, color:'white', marginBottom:'12px' }}>
          Thank You{name ? `, ${name}` : ''}!
        </h1>
        {ref && <p style={{ color:'#94A3B8', marginBottom:'8px' }}>
          Reference: <span style={{ color: isQuote ? '#F59E0B' : '#A855F7', fontWeight:700, fontSize:'1.05rem' }}>{ref}</span>
        </p>}
        <p style={{ color:'#94A3B8', lineHeight:1.8, marginBottom:'32px', fontSize:'0.95rem' }}>
          {isQuote
            ? 'Your quote request is with our team. We will call you within 2 hours with pricing and availability.'
            : 'Your booking is received. We will confirm within 2 hours and send driver details 24hrs before your journey.'}
        </p>
        <div className="glass-card" style={{ padding:'24px', textAlign:'left', marginBottom:'24px' }}>
          <h3 style={{ fontSize:'1rem', fontWeight:600, color:'white', marginBottom:'18px' }}>What happens next?</h3>
          {[
            { n:'01', t: isQuote ? 'Team Reviews Request' : 'Booking Reviewed',     d: isQuote ? 'We check availability and prepare your quote.' : 'We verify availability for your date and time.' },
            { n:'02', t:'We Contact You Within 2hrs', d:'Call or email to confirm and provide your price.' },
            { n:'03', t: isQuote ? 'Journey Confirmed' : 'Driver Assigned',          d: isQuote ? 'Once you approve the quote, your booking is locked in.' : 'Driver details sent to you 24 hours before travel.' },
          ].map(({ n, t, d }) => (
            <div key={n} style={{ display:'flex', gap:'14px', marginBottom:'14px' }}>
              <span style={{ fontSize:'1.2rem', fontWeight:800, color:'rgba(168,85,247,0.35)', flexShrink:0 }}>{n}</span>
              <div>
                <div style={{ fontSize:'0.875rem', fontWeight:600, color:'rgba(255,255,255,0.85)', marginBottom:'3px' }}>{t}</div>
                <div style={{ fontSize:'0.8rem', color:'#94A3B8' }}>{d}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background:'rgba(168,85,247,0.06)', border:'1px solid rgba(168,85,247,0.2)', borderRadius:'10px', padding:'16px', marginBottom:'24px' }}>
          <p style={{ fontSize:'0.85rem', color:'#94A3B8' }}>
            Need help? Call us anytime on{' '}
            <a href="tel:+442000000000" style={{ color:'#F59E0B', fontWeight:700 }}>+44 20 0000 0000</a>
          </p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/')}>Back to Homepage</button>
      </div>
    </div>
  )
}