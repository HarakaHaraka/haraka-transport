import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const [open, setOpen] = useState(false)

  const go = (path) => {
    setOpen(false)
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
    <>
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:500,
        padding:'14px 20px', display:'flex', alignItems:'center',
        justifyContent:'space-between',
        background:'rgba(15,10,30,0.96)',
        backdropFilter:'blur(24px)',
        borderBottom:'1px solid rgba(168,85,247,0.15)',
      }}>
        {/* Logo */}
        <div onClick={() => go('/')} style={{ cursor:'pointer', display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{
            width:'38px', height:'38px', borderRadius:'9px', flexShrink:0,
            background:'linear-gradient(135deg,#6B21A8,#A855F7)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontWeight:900, fontSize:'1.1rem', color:'white',
          }}>H</div>
          <div>
            <div style={{ fontWeight:800, fontSize:'1rem', letterSpacing:'0.06em', color:'white', lineHeight:1.1 }}>
              HARAKA<span style={{ color:'#F59E0B' }}> TRANSPORT</span>
            </div>
            <div style={{ fontSize:'0.5rem', letterSpacing:'0.16em', textTransform:'uppercase', color:'#94A3B8' }}>
              TFL Licensed · London
            </div>
          </div>
        </div>

        {/* Desktop links */}
        <div style={{ display:'flex', alignItems:'center', gap:'24px', '@media(max-width:768px)':{display:'none'} }}
          className="desktop-nav">
          {links.map(l => (
            <button key={l.label} onClick={() => go(l.path)} style={{
              background:'none', border:'none', cursor:'pointer',
              color: location.pathname===l.path ? '#A855F7' : '#94A3B8',
              fontSize:'0.78rem', letterSpacing:'0.08em',
              textTransform:'uppercase', fontWeight:600,
            }}
            onMouseEnter={e=>e.target.style.color='#A855F7'}
            onMouseLeave={e=>e.target.style.color= location.pathname===l.path?'#A855F7':'#94A3B8'}>
              {l.label}
            </button>
          ))}
        </div>

        {/* Desktop CTA */}
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }} className="desktop-nav">
          <button className="btn-outline" onClick={() => go('/quote')}
            style={{ padding:'9px 18px', fontSize:'0.76rem' }}>Quick Quote</button>
          <button className="btn-gold" onClick={() => go('/booking')}
            style={{ padding:'9px 18px', fontSize:'0.76rem' }}>Book Now</button>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} className="mobile-menu-btn" style={{
          background:'none', border:'1px solid rgba(168,85,247,0.3)', borderRadius:'8px',
          padding:'8px 10px', cursor:'pointer', color:'white', fontSize:'1.1rem',
        }}>
          {open ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div style={{
          position:'fixed', top:'66px', left:0, right:0, zIndex:499,
          background:'rgba(15,10,30,0.98)', backdropFilter:'blur(24px)',
          borderBottom:'1px solid rgba(168,85,247,0.2)',
          padding:'16px 20px 24px',
        }}>
          {links.map(l => (
            <button key={l.label} onClick={() => go(l.path)} style={{
              display:'block', width:'100%', textAlign:'left',
              background:'none', border:'none', cursor:'pointer',
              color:'white', fontSize:'1rem', fontWeight:600,
              padding:'14px 0', borderBottom:'1px solid rgba(168,85,247,0.08)',
              letterSpacing:'0.04em',
            }}>
              {l.label}
            </button>
          ))}
          <div style={{ display:'flex', gap:'10px', marginTop:'16px' }}>
            <button className="btn-outline" onClick={() => go('/quote')}
              style={{ flex:1, padding:'13px', fontSize:'0.9rem' }}>💬 Quick Quote</button>
            <button className="btn-gold" onClick={() => go('/booking')}
              style={{ flex:1, padding:'13px', fontSize:'0.9rem' }}>🚗 Book Now</button>
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