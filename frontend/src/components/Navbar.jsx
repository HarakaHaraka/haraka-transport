import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { COMPANY } from '../config/company'

const telHref = `tel:${COMPANY.phone.replace(/\s+/g, '')}`

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  // Close the mobile drawer whenever the route changes.
  useEffect(() => { setOpen(false) }, [location.pathname])

  // Central navigation handler.
  // - '/#sen' goes to the homepage and asks it to show the SEN hero slide
  //   and SEN booking tab (HomePage reads location.state.heroSlide).
  // - Other paths containing '#' scroll to a section on the homepage.
  // - All other paths navigate to a real page route.
  const go = (path) => {
    setOpen(false)
    if (path === '/#sen') {
      navigate('/', { state: { heroSlide: 0, at: Date.now() } })
      return
    }
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
      // Already on this page (e.g. Home clicked on the homepage): just go to the top.
      if (path === location.pathname) window.scrollTo({ top: 0, behavior: 'smooth' })
      navigate(path)
      // Scroll reset on a route change is handled globally by <ScrollToTop />.
    }
  }

  // Top navigation tabs, left to right.
  const links = [
    { label: 'Home',     path: '/' },
    { label: 'Services', path: '/#services' }, // scrolls to homepage section
    { label: 'SEN Care', path: '/#sen' },      // homepage hero, SEN slide
    { label: 'Join Us',  path: '/join-us' },
    { label: 'Contact',  path: '/contact' },
  ]

  const isActive = (path) =>
    !path.includes('#') && location.pathname === path

  // Real links (so they can be opened in a new tab and read by search
  // engines), handled in-app by go().
  const linkProps = (path) => ({
    href: path,
    onClick: (e) => { e.preventDefault(); go(path) },
  })

  return (
    <>
      {/* Utility strip */}
      <div className="hk-strip">
        <div>Bookings line {COMPANY.bookingsLineHours} · All journeys pre-booked</div>
        <div className="hk-strip__contact">
          <a className="hk-strip__phone" href={telHref}>{COMPANY.phone}</a>
          <a className="hk-strip__email" href={`mailto:${COMPANY.bookingsEmail}`}>{COMPANY.bookingsEmail}</a>
        </div>
      </div>

      <header className="hk-nav">
        {/* Brand */}
        <a className="hk-brand" {...linkProps('/')} aria-label={`${COMPANY.tradingNames[0]} home`}>
          <span className="hk-brand__mark" aria-hidden="true">H</span>
          <span>
            <span className="hk-brand__name">HARAKA <b>TRANSPORT</b></span>
            <span className="hk-brand__sub">Private Hire · London</span>
          </span>
        </a>

        {/* Desktop links + CTAs */}
        <div className="hk-nav__right">
          <nav className="hk-nav__links" aria-label="Main">
            {links.map((l) => (
              <a
                key={l.label}
                {...linkProps(l.path)}
                aria-current={isActive(l.path) ? 'page' : undefined}
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="hk-nav__cta">
            <a className="hk-btn hk-btn--secondary" {...linkProps('/quote')}>Quick Quote</a>
            <a className="hk-btn hk-btn--primary" {...linkProps('/booking')}>Book With Us</a>
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="hk-nav__toggle"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="hk-drawer"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
        </button>

        {/* Mobile drawer */}
        {open && (
          <nav id="hk-drawer" className="hk-drawer" aria-label="Main menu">
            {links.map((l) => (
              <a
                key={l.label}
                className="hk-drawer__link"
                {...linkProps(l.path)}
                aria-current={isActive(l.path) ? 'page' : undefined}
              >
                {l.label}
              </a>
            ))}
            <div className="hk-drawer__cta">
              <a className="hk-btn hk-btn--secondary" {...linkProps('/quote')}>Quick Quote</a>
              <a className="hk-btn hk-btn--primary" {...linkProps('/booking')}>Book With Us</a>
            </div>
          </nav>
        )}
      </header>
    </>
  )
}
