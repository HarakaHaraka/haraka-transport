import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [location])

  const links = [
    { label: 'HOME',     path: '/'         },
    { label: 'SERVICES', path: '/#services' },
    { label: 'SEN CARE', path: '/#sen'      },
    { label: 'JOIN US',  path: '/join-us'   },
    { label: 'CONTACT',  path: '/contact'   },
  ]

  function handleNav(path) {
    setMenuOpen(false)
    if (path.includes('#')) {
      const [route, hash] = path.split('#')
      if (location.pathname !== route && route !== '') {
        navigate(route)
        setTimeout(() => {
          document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
        }, 300)
      } else {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      navigate(path)
    }
  }

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: scrolled
          ? 'rgba(15,10,30,0.97)'
          : 'rgba(15,10,30,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(168,85,247,0.15)',
        transition: 'background 0.3s',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 16px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>

          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: 0,
            }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1.1rem',
              color: '#fff',
              flexShrink: 0,
            }}>H</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{
                fontWeight: 900,
                fontSize: '0.95rem',
                color: '#fff',
                letterSpacing: '0.05em',
                lineHeight: 1.1,
              }}>
                HARAKA <span style={{ color: '#F59E0B' }}>TRANSPORT</span>
              </div>
              <div style={{
                fontSize: '0.6rem',
                color: '#94A3B8',
                letterSpacing: '0.1em',
              }}>TFL LICENSED · LONDON</div>
            </div>
          </button>

          {/* Desktop links */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }} className="desktop-nav">
            {links.map(link => (
              <button
                key={link.label}
                onClick={() => handleNav(link.path)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94A3B8',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  transition: 'color 0.2s, background 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#fff'
                  e.currentTarget.style.background = 'rgba(168,85,247,0.1)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = '#94A3B8'
                  e.currentTarget.style.background = 'none'
                }}
              >
                {link.label}
              </button>
            ))}

            <button
              onClick={() => navigate('/quote')}
              style={{
                background: 'rgba(168,85,247,0.12)',
                border: '1px solid rgba(168,85,247,0.35)',
                borderRadius: '8px',
                color: '#A855F7',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '8px 14px',
                cursor: 'pointer',
                marginLeft: '4px',
              }}
            >
              QUICK QUOTE
            </button>

            <button
              onClick={() => navigate('/booking')}
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '8px 16px',
                cursor: 'pointer',
                marginLeft: '4px',
              }}
            >
              BOOK NOW
            </button>
          </div>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="hamburger"
            aria-label="Toggle menu"
            style={{
              background: 'none',
              border: '1px solid rgba(168,85,247,0.3)',
              borderRadius: '8px',
              padding: '8px 10px',
              cursor: 'pointer',
              display: 'none',
              flexDirection: 'column',
              gap: '5px',
            }}
          >
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                display: 'block',
                width: '20px',
                height: '2px',
                background: '#A855F7',
                borderRadius: '2px',
                transition: 'all 0.2s',
                transform: menuOpen
                  ? i === 0 ? 'rotate(45deg) translate(5px, 5px)'
                  : i === 2 ? 'rotate(-45deg) translate(5px, -5px)'
                  : 'scaleX(0)'
                  : 'none',
              }} />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div style={{
          position: 'fixed',
          top: '64px',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15,10,30,0.98)',
          backdropFilter: 'blur(16px)',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          padding: '32px 24px',
          overflowY: 'auto',
        }}>
          {links.map((link, i) => (
            <button
              key={link.label}
              onClick={() => handleNav(link.path)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: '1px solid rgba(168,85,247,0.1)',
                cursor: 'pointer',
                color: '#fff',
                fontSize: '1.1rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '18px 0',
                textAlign: 'left',
                transition: 'color 0.2s',
                animationDelay: `${i * 0.05}s`,
              }}
            >
              {link.label}
            </button>
          ))}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '28px' }}>
            <button
              onClick={() => { setMenuOpen(false); navigate('/quote') }}
              style={{
                background: 'rgba(168,85,247,0.12)',
                border: '1px solid rgba(168,85,247,0.35)',
                borderRadius: '12px',
                color: '#A855F7',
                fontSize: '0.9rem',
                fontWeight: 700,
                padding: '16px',
                cursor: 'pointer',
                letterSpacing: '0.08em',
              }}
            >
              QUICK QUOTE
            </button>
            <button
              onClick={() => { setMenuOpen(false); navigate('/booking') }}
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: 700,
                padding: '16px',
                cursor: 'pointer',
                letterSpacing: '0.08em',
              }}
            >
              BOOK NOW →
            </button>
          </div>
        </div>
      )}

      {/* CSS for responsive breakpoint */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: flex !important; }
        }
        @media (min-width: 769px) {
          .hamburger { display: none !important; }
          .desktop-nav { display: flex !important; }
        }
      `}</style>
    </>
  )
}
