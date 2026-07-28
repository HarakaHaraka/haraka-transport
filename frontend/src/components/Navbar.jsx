import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  // Central navigation handler.
  // - Paths containing '#' scroll to a section on the homepage.
  // - All other paths navigate to a real page route.
  const go = (path) => {
    setOpen(false)
    if (path.includes('#')) {
      const id = path.split('#')[1]
      if (location.pathname !== '/') {
        navigate('/')
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
        }, 120)
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      navigate(path)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Top navigation tabs, left to right.
  const links = [
    { label: 'Home',         path: '/' },
    { label: 'Services',     path: '/#services' }, // scrolls to homepage section
    { label: 'SEN Care',     path: '/#sen' },      // scrolls to homepage section
    { label: 'Join Us',      path: '/join-us' },
    { label: 'Contact',      path: '/contact' },
  ]

  const isActive = (path) =>
    !path.includes('#') && location.pathname === path

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500,
        padding: '14px 20px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(15,18,30,0.96)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(168,85,247,0.15)',
      }}>
        {/* Logo */}
        <div onClick={() => go('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '9px', flexShrink: 0,
            background: 'linear-gradient(135deg,#8b2f8b,#a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: '1.1rem', color: 'white',
          }}>H</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '0.06em', color: 'white', lineHeight: 1.1 }}>
              HARAKA<span style={{ color: '#a855f7' }}> TRANSPORT</span>
            </div>
            <div style={{ fontSize: '0.5rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#94a3b8' }}>
              TfL Licensed · London
            </div>
          </div>
        </div>

        {/* Desktop links */}
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {links.map((l) => (
            <button
              key={l.label}
              onClick={() => go(l.path)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: isActive(l.path) ? '#a855f7' : '#94a3b8',
                fontSize: '0.78rem', letterSpacing: '0.08em',
                textTransform: 'uppercase', fontWeight: 600,
              }}
              onMouseEnter={(e) => (e.target.style.color = '#a855f7')}
              onMouseLeave={(e) => (e.target.style.color = isActive(l.path) ? '#a855f7' : '#94a3b8')}
            >
              {l.label}
            </button>
          ))}

          {/* Desktop CTA buttons */}
          <button onClick={() => go('/quote')} style={ctaOutline}>Quick Quote</button>
          <button onClick={() => go('/booking')} style={ctaSolid}>Book With Us</button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="mobile-menu-btn"
          onClick={() => setOpen(!open)}
          style={{
            background: 'none', border: '1px solid rgba(168,85,247,0.4)',
            borderRadius: '8px', padding: '8px 14px', cursor: 'pointer',
            color: 'white', fontSize: '1.1rem',
          }}
        >
          {open ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div style={{
          position: 'fixed', top: '66px', left: 0, right: 0, zIndex: 499,
          background: 'rgba(15,18,30,0.98)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(168,85,247,0.2)',
          padding: '16px 20px 24px',
        }}>
          {links.map((l) => (
            <button
              key={l.label}
              onClick={() => go(l.path)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'white', fontSize: '1rem', fontWeight: 600,
                padding: '14px 0', borderBottom: '1px solid rgba(168,85,247,0.08)',
                letterSpacing: '0.04em',
              }}
            >
              {l.label}
            </button>
          ))}
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
            <button onClick={() => go('/quote')} style={{ ...ctaOutline, flex: 1, padding: '13px' }}>Quick Quote</button>
            <button onClick={() => go('/booking')} style={{ ...ctaSolid, flex: 1, padding: '13px' }}>Book With Us</button>
          </div>
        </div>
      )}

      <style>{`
        .desktop-nav { display: flex !important; }
        .mobile-menu-btn { display: none !important; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  )
}

const ctaOutline = {
  padding: '9px 18px', fontSize: '0.76rem',
  background: 'none', border: '1px solid #a855f7',
  borderRadius: '8px', color: '#a855f7', cursor: 'pointer',
  fontWeight: 700, letterSpacing: '0.04em',
}

const ctaSolid = {
  padding: '9px 18px', fontSize: '0.76rem',
  background: 'linear-gradient(135deg,#8b2f8b,#a855f7)',
  border: 'none', borderRadius: '8px', color: 'white',
  cursor: 'pointer', fontWeight: 700, letterSpacing: '0.04em',
}
