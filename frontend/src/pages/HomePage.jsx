import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Accessibility, ArrowRight, Baby, Brain, Building2, Check, Clock,
  Martini, Moon, Plane, Shield, Tent,
} from 'lucide-react'
import { COMPANY } from '../config/company'

import imgSen       from '../assets/hero-sen.webp'
import imgChauffeur from '../assets/hero-events.webp'
import imgWedding   from '../assets/hero-events-weddings.webp'
import imgAirport   from '../assets/hero-airport.webp'
import imgLondon    from '../assets/hero-london.webp'
import imgNight     from '../assets/hero-night.webp'

// Seconds each hero slide stays up before the next one fades in.
const HERO_SECONDS = 6

const telHref = `tel:${COMPANY.phone.replace(/\s+/g, '')}`

// Hero slides and booking tabs share one order: SEN → Concierge → Events → Airport.
// `service` must match an option in the Booking page's "Service Type" list,
// so the booking form opens with the right one already selected.
const JOURNEYS = [
  {
    label: 'SEN',
    caption: 'Calm, consistent school journeys',
    img: imgSen,
    alt: 'Wheelchair-accessible vehicle with its rear lift lowered',
    title: 'School & SEN transport',
    note: 'Regular home-to-school or care journeys with a consistent, DBS-checked driver.',
    toLabel: 'School or setting', toHint: 'School, college or care setting',
    extraLabel: 'Passenger needs', extraHint: 'e.g. wheelchair, PA',
    service: 'SEN / Care Transport',
  },
  {
    label: 'Concierge',
    caption: 'Discreet door-to-door chauffeurs',
    img: imgChauffeur,
    alt: 'Black Mercedes V-Class waiting outside an office building in Canary Wharf',
    title: 'Concierge chauffeur',
    note: 'Executive door-to-door service with discretion guaranteed.',
    toLabel: 'Destination', toHint: 'Address or venue',
    extraLabel: 'Vehicle', extraHint: 'e.g. Mercedes, Range Rover',
    service: 'Hourly / As-Directed',
  },
  {
    label: 'Events',
    caption: 'Arrivals that set the tone',
    img: imgWedding,
    alt: 'Wedding car dressed with white flowers',
    title: 'Events & weddings',
    note: 'Full fleet coordination for weddings, galas, premieres and corporate events.',
    toLabel: 'Venue', toHint: 'Venue or address',
    extraLabel: 'Guests', extraHint: 'Number of guests',
    service: 'Events & Weddings',
  },
  {
    label: 'Airport',
    caption: 'Met at arrivals, on time',
    img: imgAirport,
    alt: 'Black Mercedes saloon waiting at an airport terminal pick-up point',
    title: 'Airport transfer',
    note: 'Heathrow, Gatwick, City, Luton and Stansted, with flight tracking and meet and greet.',
    toLabel: 'Airport', toHint: 'e.g. Heathrow T5',
    extraLabel: 'Flight no.', extraHint: 'e.g. BA117',
    service: 'Airport Transfer',
  },
]

const CREDENTIALS = [
  { Icon: Shield,        title: 'Enhanced DBS',      sub: 'Every driver checked' },
  { Icon: Brain,         title: 'SEN-trained',       sub: 'Autism, ADHD, mobility' },
  { Icon: Accessibility, title: 'Wheelchair access', sub: 'WAVs with ramps' },
  { Icon: Clock,         title: COMPANY.bookingsLineHours, sub: 'Bookings line, pre-booked only' },
]

const SERVICES = [
  {
    Icon: Baby, title: 'SEN School & Care Transport', tag: 'Specialist', img: imgSen,
    desc: 'Safe, consistent transport for children and adults with special educational needs. DBS-checked drivers and wheelchair-accessible vehicles.',
    points: ['Enhanced DBS-checked drivers', 'SEN awareness training', `Safeguarding lead: ${COMPANY.safeguardingLead}`],
    service: 'SEN / Care Transport',
  },
  {
    Icon: Martini, title: 'Concierge Chauffeur', tag: 'Premium', img: imgChauffeur,
    desc: 'Executive door-to-door service with discretion guaranteed. Mercedes, Range Rover and ultra-luxury vehicles available.',
    points: ['Discretion guaranteed', 'Executive vehicles', 'Door-to-door'],
    service: 'Hourly / As-Directed',
  },
  {
    Icon: Tent, title: 'Events & Wedding Transport', tag: '', img: imgWedding,
    desc: 'Full fleet coordination for weddings, galas, premieres and corporate events. Multi-vehicle packages with branded options.',
    points: ['Multi-vehicle packages', 'Coordinated arrivals', 'Branded options'],
    service: 'Events & Weddings',
  },
  {
    Icon: Plane, title: 'Airport Transfers', tag: '', img: imgAirport,
    desc: 'All major London airports including Heathrow, Gatwick, City, Luton and Stansted. Flight tracking, meet and greet.',
    points: ['Flight tracking', 'Meet and greet', 'All London airports'],
    service: 'Airport Transfer',
  },
  {
    Icon: Building2, title: 'Corporate Accounts', tag: 'Business', img: imgLondon,
    desc: 'Dedicated account management, monthly invoicing and priority booking for corporate clients and roadshows.',
    points: ['Monthly invoicing', 'Account manager', 'Priority booking'],
    service: 'Corporate Travel',
  },
  {
    Icon: Moon, title: 'Night & Entertainment', tag: '', img: imgNight,
    desc: 'Theatre, opera, private members clubs and late-night transfers. Punctual, professional, always discreet.',
    points: ['Theatre and opera', 'Private members clubs', 'Late-night transfers'],
    service: 'City / Point-to-Point',
  },
]

// True when the visitor's device asks for reduced motion.
function usePrefersReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)'
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  )
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

const today = () => new Date().toISOString().slice(0, 10)

export default function HomePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const reducedMotion = usePrefersReducedMotion()

  const [heroIndex, setHeroIndex]         = useState(0)     // 0–3, which photo is showing
  const [heroPaused, setHeroPaused]       = useState(false) // true once the visitor picks a slide
  const [journeyTab, setJourneyTab]       = useState(0)     // 0–3, booking panel tab (defaults to SEN)
  const [activeService, setActiveService] = useState(0)     // 0–5
  const [fields, setFields] = useState({
    pickup: '', date: '',
    destination: ['', '', '', ''], // one per tab, so switching tabs keeps what was typed
    extra:       ['', '', '', ''],
  })

  const rotating = !heroPaused && !reducedMotion

  // Auto-rotate the hero. Restarts its timer on every slide change.
  useEffect(() => {
    if (!rotating) return
    const t = setTimeout(
      () => setHeroIndex((i) => (i + 1) % JOURNEYS.length),
      HERO_SECONDS * 1000
    )
    return () => clearTimeout(t)
  }, [heroIndex, rotating])

  // Slide-bar cell or booking tab clicked: show that slide, match the tab, stop rotating.
  const selectJourney = (i) => {
    setHeroIndex(i)
    setJourneyTab(i)
    setHeroPaused(true)
  }

  // "SEN Care" in the nav sends { heroSlide: 0 } in router state.
  useEffect(() => {
    const slide = location.state?.heroSlide
    if (typeof slide !== 'number') return
    selectJourney(slide)
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' })
    // Clear the state so a page refresh starts the rotation as normal.
    navigate('/', { replace: true, state: null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.at])

  const journey = JOURNEYS[journeyTab]

  const setField = (name) => (e) => {
    const value = e.target.value
    setFields((f) =>
      Array.isArray(f[name])
        ? { ...f, [name]: f[name].map((v, i) => (i === journeyTab ? value : v)) }
        : { ...f, [name]: value }
    )
  }

  // Go to the existing Quote / Booking page. The service type travels in the
  // URL (the Booking page already reads ?service=). Anything typed in the
  // panel travels in router state — not the URL — so addresses never end up
  // in browser history or server logs.
  const open = (path, service, prefill) =>
    navigate(`${path}?service=${encodeURIComponent(service)}`, prefill ? { state: { prefill } } : undefined)

  const panelPrefill = () => {
    const extra = fields.extra[journeyTab].trim()
    return {
      serviceType:    journey.service,
      pickupAddress:  fields.pickup.trim(),
      dropoffAddress: fields.destination[journeyTab].trim(),
      pickupDate:     fields.date,
      notes:          extra ? `${journey.extraLabel}: ${extra}` : '',
      // The Booking form has its own flight number box.
      flightNumber:   journey.label === 'Airport' ? extra : '',
    }
  }

  const service = SERVICES[activeService]

  return (
    <main className="hk-home">

      {/* ── HERO ── */}
      <section id="top" className="hk-hero" aria-label="Book a journey">
        <div className="hk-hero__backdrop">
          {JOURNEYS.map((j, i) => (
            <div
              key={j.label}
              className={`hk-hero__layer${i === heroIndex ? ' is-on' : ''}`}
              aria-hidden={i !== heroIndex}
            >
              {/* Blurred copy fills the frame so the full photo never shows empty bars. */}
              <div className="hk-hero__blur" style={{ backgroundImage: `url(${j.img})` }} />
              <img
                className="hk-hero__photo"
                src={j.img}
                alt={j.alt}
                fetchPriority={i === 0 ? 'high' : 'low'}
                decoding="async"
              />
            </div>
          ))}
        </div>

        <div className="hk-hero__content">
          <div className="hk-headline">
            <p className="hk-kicker">{COMPANY.tradingNames[0]} · London</p>
            <h1 className="hk-h1">
              From the school run
              <span>to the red carpet.</span>
            </h1>
            <p className="hk-lede">
              Specialist SEN transport, concierge chauffeurs, events and airport transfers.
              Professional, caring and always on time — across London and beyond.
            </p>
            <p className="hk-callus">
              <span>Bookings line {COMPANY.bookingsLineHours}:</span>
              <a href={telHref}>{COMPANY.phone}</a>
            </p>
          </div>

          <div id="concierge" className="hk-panel">
            <div className="hk-panel__tabs">
              {JOURNEYS.map((j, i) => (
                <button
                  key={j.label}
                  type="button"
                  className={`hk-panel__tab${i === journeyTab ? ' is-on' : ''}`}
                  aria-pressed={i === journeyTab}
                  onClick={() => selectJourney(i)}
                >
                  {j.label}
                </button>
              ))}
            </div>

            <div className="hk-panel__body">
              <div>
                <h2 className="hk-panel__title">{journey.title}</h2>
                <p className="hk-panel__note">{journey.note}</p>
              </div>

              <div className="hk-panel__fields">
                <label className="hk-field hk-field--wide">
                  <span>Pick-up</span>
                  <input
                    className="hk-input"
                    placeholder="Address or postcode"
                    autoComplete="off"
                    value={fields.pickup}
                    onChange={setField('pickup')}
                  />
                </label>
                <label className="hk-field hk-field--wide">
                  <span>{journey.toLabel}</span>
                  <input
                    className="hk-input"
                    placeholder={journey.toHint}
                    autoComplete="off"
                    value={fields.destination[journeyTab]}
                    onChange={setField('destination')}
                  />
                </label>
                <label className="hk-field">
                  <span>Date</span>
                  <input
                    className="hk-input"
                    type="date"
                    min={today()}
                    value={fields.date}
                    onChange={setField('date')}
                  />
                </label>
                <label className="hk-field">
                  <span>{journey.extraLabel}</span>
                  <input
                    className="hk-input"
                    placeholder={journey.extraHint}
                    autoComplete="off"
                    value={fields.extra[journeyTab]}
                    onChange={setField('extra')}
                  />
                </label>
              </div>

              <div className="hk-panel__actions">
                <button
                  type="button"
                  className="hk-btn hk-btn--secondary"
                  onClick={() => open('/quote', journey.service, panelPrefill())}
                >
                  Get My Quote
                </button>
                <button
                  type="button"
                  className="hk-btn hk-btn--primary hk-btn--split"
                  onClick={() => open('/booking', journey.service, panelPrefill())}
                >
                  Book My Journey
                  <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Slide selector bar */}
        <div className="hk-slidebar" style={{ '--hk-slide-ms': `${HERO_SECONDS * 1000}ms` }}>
          {JOURNEYS.map((j, i) => {
            const on = i === heroIndex
            return (
              <button
                key={j.label}
                type="button"
                className={`hk-cell hk-slide${on ? ' is-on' : ''}`}
                aria-pressed={on}
                onClick={() => selectJourney(i)}
              >
                {on && (
                  // key restarts the fill animation each time this slide comes round
                  <span
                    key={`${heroIndex}-${rotating}`}
                    className={`hk-slide__bar ${rotating ? 'is-running' : 'is-full'}`}
                  />
                )}
                <span className="hk-slide__label">{j.label}</span>
                <span className="hk-slide__caption">{j.caption}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── CREDENTIALS ── */}
      <section className="hk-creds" aria-label="Why families and businesses choose us">
        {CREDENTIALS.map(({ Icon, title, sub }) => (
          <div key={title} className="hk-cell hk-cred">
            <Icon size={26} strokeWidth={2} aria-hidden="true" />
            <span className="hk-cred__title">{title}</span>
            <span className="hk-cred__sub">{sub}</span>
          </div>
        ))}
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="hk-services">
        <div className="hk-services__head">
          <div className="hk-services__title">
            <p className="hk-services__kicker">What we do</p>
            <h2 className="hk-h2">Our services</h2>
          </div>
          <p className="hk-services__hint">Hover or select a service</p>
        </div>

        <div className="hk-svc">
          <div className="hk-cell hk-svc__list">
            {SERVICES.map((s, i) => (
              <button
                key={s.title}
                type="button"
                className={`hk-svc__row${i === activeService ? ' is-on' : ''}`}
                aria-pressed={i === activeService}
                onMouseEnter={() => setActiveService(i)}
                onFocus={() => setActiveService(i)}
                onClick={() => setActiveService(i)}
              >
                <span className="hk-svc__num">{String(i + 1).padStart(2, '0')}</span>
                <span className="hk-svc__name">{s.title}</span>
                <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
              </button>
            ))}
          </div>

          <div className="hk-svc__detail">
            <div className="hk-cell hk-svc__media">
              <div className="hk-svc__frame">
                {SERVICES.map((s, i) => (
                  <div key={s.title} className={`hk-svc__layer${i === activeService ? ' is-on' : ''}`}>
                    <div className="hk-hero__blur" style={{ backgroundImage: `url(${s.img})` }} />
                    <img className="hk-hero__photo" src={s.img} alt="" loading="lazy" decoding="async" />
                  </div>
                ))}
              </div>
            </div>

            {/* key replays the fade when the service changes */}
            <div key={service.title} className="hk-svc__text">
              <div className="hk-svc__meta">
                <service.Icon size={28} strokeWidth={2} aria-hidden="true" />
                {service.tag && <span className="hk-tag">{service.tag}</span>}
              </div>
              <h3 className="hk-h3">{service.title}</h3>
              <p className="hk-svc__desc">{service.desc}</p>
              <ul className="hk-svc__points">
                {service.points.map((pt) => (
                  <li key={pt}>
                    <Check size={16} strokeWidth={2} aria-hidden="true" />
                    {pt}
                  </li>
                ))}
              </ul>
              <div className="hk-svc__actions">
                <button
                  type="button"
                  className="hk-btn hk-btn--secondary"
                  onClick={() => open('/quote', service.service)}
                >
                  Get Quote
                </button>
                <button
                  type="button"
                  className="hk-btn hk-btn--primary"
                  onClick={() => open('/booking', service.service)}
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
