import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const [mobile, setMobile] = useState(false)

  const go = (path) => {
    setMobile(false)
    if (path.includes('#')) {
      navigate('/')
      setTimeout(() => {
        const id = path.split('#')[1]
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      navigate(path)
    }
  }

const links = [
  { label: 'Home',     path: '/'         },
  { label: 'Services', path: '/#services' },
  { label: 'SEN Care', path: '/#sen'      },
  { label: 'Join Us',  path: '/join-us'   },
  { label: 'Contact',  path: '/contact'   },
]

  return (
    <nav className="navbar">
      {/* Logo */}
      <div onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '42px', height: '42px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #6B21A8, #A855F7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, fontSize: '1.2rem', color: 'white',
          boxShadow: '0 4px 16px rgba(107,33,168,0.5)',
        }}>H</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.08em', color: 'white' }}>
            HARAKA<span style={{ color: '#F59E0B' }}> TRANSPORT</span>
          </div>
          <div style={{ fontSize: '0.55rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94A3B8' }}>
            TFL Licensed · London
          </div>
        </div>
      </div>

      {/* Desktop links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        {links.map(l => (
          <button key={l.label} onClick={() => go(l.path)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#94A3B8', fontSize: '0.8rem',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            fontWeight: 600, transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.target.style.color = '#A855F7'}
          onMouseLeave={e => e.target.style.color = '#94A3B8'}>
            {l.label}
          </button>
        ))}
      </div>

      {/* CTA buttons */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button className="btn-outline" onClick={() => navigate('/quote')}
          style={{ padding: '10px 20px', fontSize: '0.78rem' }}>
          Quick Quote
        </button>
        <button className="btn-gold" onClick={() => navigate('/booking')}
          style={{ padding: '10px 20px', fontSize: '0.78rem' }}>
          Book Now
        </button>
      </div>
    </nav>
  )
}