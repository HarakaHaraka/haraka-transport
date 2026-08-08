import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { COMPANY } from '../config/company'

function Counter({ target, suffix = '', label }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      let start = 0
      const step = target / 60
      const t = setInterval(() => {
        start += step
        if (start >= target) { setCount(target); clearInterval(t) }
        else setCount(Math.floor(start))
      }, 16)
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [target])
  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div style={{
        fontSize: '2.8rem', fontWeight: 900, lineHeight: 1,
        background: 'linear-gradient(135deg, #F59E0B, #A855F7)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      }}>{count.toLocaleString()}{suffix}</div>
      <div style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#94A3B8', marginTop: '6px' }}>{label}</div>
    </div>
  )
}

const SERVICES = [
  { icon: '🧒', title: 'SEN School & Care Transport',  colour: '#F59E0B', tag: 'Specialist', desc: 'Safe, consistent transport for children and adults with special educational needs. DBS-checked drivers, WAV vehicles, local authority approved.', quoteParam: 'SEN / Care Transport' },
  { icon: '✈️', title: 'Airport Transfers',             colour: '#A855F7', tag: '',          desc: 'All major London airports including Heathrow, Gatwick, City, Luton and Stansted. Flight tracking, meet and greet, 24/7 availability.', quoteParam: 'Airport Transfer' },
  { icon: '🥂', title: 'Concierge Chauffeur',           colour: '#F59E0B', tag: 'Premium',   desc: 'Executive door-to-door service with discretion guaranteed. Mercedes, Range Rover and ultra-luxury vehicles available.', quoteParam: 'Concierge Chauffeur' },
  { icon: '🎪', title: 'Events & Wedding Transport',    colour: '#A855F7', tag: '',          desc: 'Full fleet coordination for weddings, galas, premieres and corporate events. Multi-vehicle packages with branded options.', quoteParam: 'Wedding Transport' },
  { icon: '🏢', title: 'Corporate Accounts',            colour: '#F59E0B', tag: 'Business',  desc: 'Dedicated account management, monthly invoicing and priority booking for corporate clients and roadshows.', quoteParam: 'Corporate / Business Transfer' },
  { icon: '🌙', title: 'Night & Entertainment',         colour: '#A855F7', tag: '',          desc: 'Theatre, opera, private members clubs and late-night transfers. Punctual, professional, always discreet.', quoteParam: 'Night & Entertainment' },
]

const TESTIMONIALS = [
  { text: 'Haraka arranged SEN transport for my son weekly. The drivers are patient, trained and always on time. Cannot recommend highly enough.', name: 'Sarah M.', role: 'Parent, East London' },
  { text: 'We used Haraka for our corporate gala — 12 vehicles, flawlessly coordinated. Every guest arrived on time and in style.', name: 'James T.', role: 'Events Director, City of London' },
  { text: 'Airport pickup at 4am and the driver was there before me. Immaculate car, professional service. My go-to for all business travel.', name: 'Priya K.', role: 'Executive, Canary Wharf' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [activeT, setActiveT] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setActiveT(a => (a + 1) % TESTIMONIALS.length), 5000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ background: '#0F0A1E', color: 'white', paddingTop: '72px' }}>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh', position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px',
      }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 'min(600px, 80vw)', height: 'min(600px, 80vw)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,33,168,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: 'min(500px, 70vw)', height: 'min(500px, 70vw)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '900px', width: '100%' }}>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '28px' }}>
            <span className="badge badge-purple">✓ TFL Licensed</span>
            <span className="badge badge-gold">⭐ SEN Specialist</span>
            <span className="badge badge-green">🏆 5-Star Rated</span>
          </div>

          <h1 className="fade-in-up" style={{ fontSize: 'clamp(1.8rem, 7vw, 5.5rem)', fontWeight: 900, lineHeight: 1.08, marginBottom: '24px' }}>
            London's Most Trusted<br />
            <span className="gradient-text">Private Hire Service</span>
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: '#94A3B8', lineHeight: 1.8, maxWidth: '640px', width: '100%', margin: '0 auto 48px', padding: '0 8px' }}>
            Specialist SEN transport, concierge chauffeurs, events and airport transfers.
            Professional, caring and always on time — across London and beyond.
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-gold" onClick={() => navigate('/booking')} style={{ fontSize: '1rem', padding: '14px 24px' }}>
              🚗 Book My Journey
            </button>
            <button className="btn-outline" onClick={() => navigate('/quote')} style={{ fontSize: '1rem', padding: '14px 24px' }}>
              💬 Get a Quick Quote
            </button>
          </div>

          <div style={{ marginTop: '32px' }}>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
              Or call us 24/7: &nbsp;
              <a href="tel:02083144655" style={{ color: '#F59E0B', fontWeight: 700, fontSize: '1.1rem', textDecoration: 'none' }}>
                0208 314 4655
              </a>
            </p>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))',
            gap: '24px', maxWidth: '700px', margin: '64px auto 0',
            padding: '32px', borderRadius: '16px',
            background: 'rgba(26,16,51,0.7)', border: '1px solid rgba(168,85,247,0.2)',
          }}>
            <Counter target={5000}  suffix="+"  label="Journeys Completed" />
            <Counter target={98}    suffix="%"  label="On-Time Rate" />
            <Counter target={10}    suffix="+"  label="Years Experience" />
            <Counter target={24}    suffix="/7" label="Always Available" />
          </div>
        </div>
      </section>

      {/* ── TWO PATHWAYS ── */}
      <section style={{ background: '#1A1033', padding: '80px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#A855F7', marginBottom: '12px' }}>● How Can We Help? ●</p>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, marginBottom: '40px' }}>Choose Your Path</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div className="path-card gold" onClick={() => navigate('/quote')}>
              <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>💬</div>
              <div className="badge badge-gold" style={{ marginBottom: '14px' }}>2-Hour Response</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F59E0B', marginBottom: '12px' }}>Quick Quote</h3>
              <p style={{ color: '#94A3B8', lineHeight: 1.7, marginBottom: '20px' }}>
                Leave your details and journey requirements. We will call you back with a price within 2 hours.
              </p>
              <button className="btn-gold" style={{ width: '100%' }}>Get My Quote →</button>
            </div>

            <div className="path-card" onClick={() => navigate('/booking')}>
              <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🚗</div>
              <div className="badge badge-purple" style={{ marginBottom: '14px' }}>Confirmed Booking</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#A855F7', marginBottom: '12px' }}>Book Now</h3>
              <p style={{ color: '#94A3B8', lineHeight: 1.7, marginBottom: '20px' }}>
                Ready to go? Complete our full booking form with journey details and lock in your transport.
              </p>
              <button className="btn-primary" style={{ width: '100%' }}>Book My Journey →</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEN SECTION ── */}
      <section id="sen" style={{ background: '#0F0A1E', padding: '90px clamp(12px, 4vw, 24px)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '60px', alignItems: 'center' }}>
            <div>
              <span className="badge badge-gold" style={{ marginBottom: '16px', display: 'inline-block' }}>★ Specialist Service</span>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, marginBottom: '16px', lineHeight: 1.2 }}>
                SEN & Specialist<br /><span style={{ color: '#F59E0B' }}>Care Transport</span>
              </h2>
              <div className="gold-line" />
              <p style={{ color: '#94A3B8', lineHeight: 1.8, fontSize: '0.95rem', marginBottom: '20px' }}>
                We are proud specialists in transport for children and adults with Special Educational Needs and Disabilities.
                Our drivers are DBS-checked, trained in SEN awareness and experienced in providing calm, safe and dignified journeys.
              </p>
              <p style={{ color: '#94A3B8', lineHeight: 1.8, fontSize: '0.95rem', marginBottom: '32px' }}>
                We work with local authorities, schools, care providers and families across London —
                delivering consistency, reliability and genuine care on every journey.
              </p>
              <button className="btn-gold" onClick={() => navigate('/quote?type=sen')}>
                Enquire About SEN Transport
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { icon: '🛡️', title: 'DBS-Checked Drivers',           desc: 'All drivers hold enhanced DBS certificates with regular checks and detailed records.' },
                { icon: '🧠', title: 'SEN Awareness Training',         desc: 'Specialist training in autism, ADHD, physical disabilities and communication support.' },
                { icon: '♿', title: 'Wheelchair Accessible Vehicles',  desc: 'Fully equipped WAVs with ramps, restraint systems and space for carers.' },
                { icon: '📋', title: 'Local Authority Contracts',       desc: 'Active contracts with multiple London boroughs for home-to-school transport.' },
                { icon: '👨‍👩‍👧', title: 'Family-Centred Approach',       desc: 'We communicate directly with families, carers and schools on every journey.' },
                { icon: '🔒', title: 'Safeguarding Compliant',          desc: 'Full safeguarding policies, GDPR-compliant records and incident reporting.' },
              ].map(f => (
                <div key={f.title} style={{
                  display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '16px',
                  borderRadius: '12px', background: 'rgba(245,158,11,0.06)',
                  border: '1px solid rgba(245,158,11,0.2)',
                }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                    background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(168,85,247,0.2))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
                  }}>{f.icon}</div>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white', marginBottom: '4px' }}>{f.title}</h4>
                    <p style={{ fontSize: '0.78rem', color: '#94A3B8', lineHeight: 1.6 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" style={{ background: '#1A1033', padding: '90px clamp(12px, 4vw, 24px)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#A855F7', marginBottom: '12px' }}>● What We Do ●</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, marginBottom: '8px' }}>Our Services</h2>
            <div className="gold-line" style={{ margin: '12px auto' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {SERVICES.map(s => (
  <div key={s.title} className="glass-card" style={{ padding: '24px', borderTop: `3px solid ${s.colour}`, display:'flex', flexDirection:'column' }}>
    <div style={{ fontSize: '2.2rem', marginBottom: '12px' }}>{s.icon}</div>
    {s.tag && <span className="badge badge-purple" style={{ marginBottom: '10px', display: 'inline-block' }}>{s.tag}</span>}
    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white', marginBottom: '8px' }}>{s.title}</h3>
    <div style={{ width: '28px', height: '3px', background: s.colour, marginBottom: '10px', borderRadius: '2px' }} />
    <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.65, marginBottom: '16px', flex: 1 }}>{s.desc}</p>
    <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
      <button
        onClick={() => navigate(`/quote?service=${encodeURIComponent(s.quoteParam)}`)}
        style={{ flex:1, minWidth:'80px', padding:'10px 8px', background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.4)', color:'#F59E0B', borderRadius:'8px', cursor:'pointer', fontSize:'0.78rem', fontWeight:700, transition:'all 0.2s' }}
        onMouseEnter={e=>{e.target.style.background='rgba(245,158,11,0.22)'}}
        onMouseLeave={e=>{e.target.style.background='rgba(245,158,11,0.12)'}}>
        💬 Get Quote
      </button>
      <button
        onClick={() => navigate(`/booking?service=${encodeURIComponent(s.quoteParam)}`)}
        style={{ flex:1, minWidth:'80px', padding:'10px 8px', background:'rgba(168,85,247,0.12)', border:'1px solid rgba(168,85,247,0.4)', color:'#A855F7', borderRadius:'8px', cursor:'pointer', fontSize:'0.78rem', fontWeight:700, transition:'all 0.2s' }}
        onMouseEnter={e=>{e.target.style.background='rgba(168,85,247,0.22)'}}
        onMouseLeave={e=>{e.target.style.background='rgba(168,85,247,0.12)'}}>
        🚗 Book Now
      </button>
    </div>
  </div>
))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: '#0F0A1E', padding: '80px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#A855F7', marginBottom: '12px' }}>● Simple Process ●</p>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, marginBottom: '40px' }}>How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {[
              { step: '01', icon: '📝', title: 'Submit Your Request',    desc: 'Fill in our quick form online — takes under 3 minutes.' },
              { step: '02', icon: '📞', title: 'We Confirm Within 2hrs', desc: 'Our team reviews and calls or emails with confirmation.' },
              { step: '03', icon: '🚗', title: 'Driver Assigned',         desc: 'You receive driver details and vehicle info 24hrs before.' },
              { step: '04', icon: '✅', title: 'Travel in Comfort',       desc: 'Sit back and enjoy a professional, punctual journey.' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} style={{ padding: '28px 20px', borderRadius: '16px', background: 'rgba(26,16,51,0.7)', border: '1px solid rgba(168,85,247,0.15)' }}>
                <div style={{ fontSize: '0.65rem', letterSpacing: '0.2em', color: '#A855F7', marginBottom: '12px', fontWeight: 700 }}>{step}</div>
                <div style={{ fontSize: '2.2rem', marginBottom: '14px' }}>{icon}</div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white', marginBottom: '10px' }}>{title}</h4>
                <p style={{ fontSize: '0.8rem', color: '#94A3B8', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ background: '#1A1033', padding: '80px 24px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#A855F7', marginBottom: '12px' }}>● What Clients Say ●</p>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, marginBottom: '40px' }}>Trusted by Hundreds</h2>
          <div style={{ background: 'rgba(15,10,30,0.8)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '20px', padding: '40px 36px', marginBottom: '24px' }}>
            <div style={{ fontSize: '3rem', color: 'rgba(168,85,247,0.3)', marginBottom: '12px', lineHeight: 1 }}>"</div>
            <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.8, fontStyle: 'italic', marginBottom: '24px' }}>
              {TESTIMONIALS[activeT].text}
            </p>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#A855F7' }}>{TESTIMONIALS[activeT].name}</div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px' }}>{TESTIMONIALS[activeT].role}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setActiveT(i)} style={{
                width: i === activeT ? '28px' : '8px', height: '8px',
                borderRadius: '4px', border: 'none', cursor: 'pointer',
                background: i === activeT ? '#A855F7' : 'rgba(168,85,247,0.3)',
                transition: 'all 0.3s ease',
              }} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT CTA ── */}
      <section id="contact" style={{ padding: '90px clamp(12px, 4vw, 24px)', textAlign: 'center', background: 'linear-gradient(135deg, #1A1033, #0F0A1E)', borderTop: '1px solid rgba(168,85,247,0.15)' }}>
        <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, marginBottom: '16px' }}>Ready to Travel?</h2>
        <p style={{ color: '#94A3B8', fontSize: '1.05rem', maxWidth: '500px', width: '100%', margin: '0 auto 40px', lineHeight: 1.8 }}>
          Book online or get a quick quote. We respond within 2 hours and are available 24/7.
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-gold" onClick={() => navigate('/booking')} style={{ fontSize: '1rem', padding: '18px 48px' }}>Book Now</button>
          <button className="btn-outline" onClick={() => navigate('/quote')} style={{ fontSize: '1rem', padding: '18px 48px' }}>Get a Quote</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', marginTop: '60px', flexWrap: 'wrap' }}>
          {[
            { icon: '📞', label: 'Phone', value: COMPANY.phone, href: `tel:${COMPANY.phone.replace(/\s+/g, '')}` },
            { icon: '✉️', label: 'Email', value: COMPANY.bookingsEmail, href: `mailto:${COMPANY.bookingsEmail}` },
            { icon: '🕐', label: 'Hours', value: 'Bookings phone line: 24/7', href: null },
          ].map(({ icon, label, value, href }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{icon}</div>
              <div style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94A3B8', marginBottom: '6px' }}>{label}</div>
              {href
                ? <a href={href} style={{ color: '#F59E0B', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>{value}</a>
                : <div style={{ color: '#F59E0B', fontWeight: 600, fontSize: '0.9rem' }}>{value}</div>
              }
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}