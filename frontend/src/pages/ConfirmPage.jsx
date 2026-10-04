import { useLocation, useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { COMPANY } from '../config/company'

export function ConfirmPage() {
  const { state }  = useLocation()
  const navigate   = useNavigate()
  const { id, name, type } = state || {}
  const isQuote    = type === 'quote'
  const prefix     = isQuote ? 'QUO' : 'BKG'
  const ref        = id ? `${prefix}-${String(id).padStart(5,'0')}` : null

  const steps = [
    {
      t: isQuote ? 'Team reviews your request' : 'Booking reviewed',
      d: isQuote ? 'We check availability and prepare your quote.' : 'We verify availability for your date and time.',
    },
    {
      t: 'We contact you',
      d: 'By phone or email, to confirm and give you your price.',
    },
    {
      t: isQuote ? 'Journey confirmed' : 'Driver assigned',
      d: isQuote ? 'Once you approve the quote, your booking is locked in.' : 'Driver details sent to you 24 hours before travel.',
    },
  ]

  return (
    <main className="hk-page">
      <div className="hk-done">
        <div className="hk-done__mark" aria-hidden="true"><Check size={30} strokeWidth={2.5} /></div>
        <p className="hk-kicker">{isQuote ? 'Quote request received' : 'Booking received'}</p>
        <h1 className="hk-pagehead__title">Thank you{name ? `, ${name}` : ''}.</h1>
        {ref && <p className="hk-done__ref">Reference: <b>{ref}</b></p>}
        <p className="hk-pagehead__intro">
          {isQuote
            ? 'Your quote request is with our team. We will be in touch with pricing and availability.'
            : 'Your booking is received. We will be in touch to confirm it, and send driver details 24 hours before your journey.'}
        </p>

        <h2 className="hk-form__title" style={{ marginTop: '16px' }}>What happens next</h2>
        <ol className="hk-next">
          {steps.map(({ t, d }, i) => (
            <li key={t}>
              <span className="hk-next__num">{String(i + 1).padStart(2, '0')}</span>
              <span className="hk-next__title">{t}</span>
              <span className="hk-next__desc">{d}</span>
            </li>
          ))}
        </ol>

        <p>
          Need help? Call{' '}
          <a href={`tel:${COMPANY.phone.replace(/\s+/g, '')}`}>{COMPANY.phone}</a>
          {' '}— bookings line open {COMPANY.bookingsLineHours}.
        </p>
        <button type="button" className="hk-btn hk-btn--primary hk-btn--lg" onClick={() => navigate('/')}>
          Back to homepage
        </button>
      </div>
    </main>
  )
}
