import { useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { COMPANY } from '../config/company'
import PageHead from '../components/PageHead'
import CallUs from '../components/CallUs'

// ── API base URL ──────────────────────────────────────────────
// Matches ContactPage.jsx and JoinUsPage.jsx — the custom domain, not the
// raw Render subdomain, so all three forms hit the same origin.
const API = 'https://harakatransport.co.uk'

const SERVICE_OPTIONS = ['', 'Airport transfer', 'Wedding / event', 'Group travel', 'SEN transport', 'Corporate / concierge', 'Other']

// The homepage and Booking page name services slightly differently from
// this form. Translate, so a visitor arriving from the homepage finds the
// right option already chosen.
const SERVICE_FROM_HOMEPAGE = {
  'SEN / Care Transport':  'SEN transport',
  'Airport Transfer':      'Airport transfer',
  'Events & Weddings':     'Wedding / event',
  'Corporate Travel':      'Corporate / concierge',
  'Hourly / As-Directed':  'Corporate / concierge',
  'City / Point-to-Point': 'Other',
}

export default function QuotePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  // Anything typed into the homepage booking panel arrives in router state.
  const prefill = location.state?.prefill || {}
  const incomingService = prefill.serviceType || searchParams.get('service') || ''
  const startService = SERVICE_OPTIONS.includes(incomingService)
    ? incomingService
    : (SERVICE_FROM_HOMEPAGE[incomingService] || '')

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    serviceType: startService,
    pickupAddress: prefill.pickupAddress || '',
    dropoffAddress: prefill.dropoffAddress || '',
    pickupDate: prefill.pickupDate || '',
    pickupTime: '', passengers: '',
    notes: prefill.notes || '',
  })
  const [status, setStatus] = useState('idle') // idle | sending | ok | error
  const [errorMsg, setErrorMsg] = useState('')

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async () => {
    // basic validation
    if (!form.firstName || !form.lastName || !form.email || !form.phone) {
      setStatus('error')
      setErrorMsg('Please fill in your name, email and phone number.')
      return
    }
    setStatus('sending')
    setErrorMsg('')
    try {
      const res = await fetch(`${API}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type: 'quote' }),
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(text || `Server responded ${res.status}`)
      }
      const data = await res.json()
      setStatus('ok')
      // optional: go to a confirmation page with the reference
      navigate('/confirm', { state: { type: 'quote', id: data.id } })
    } catch (err) {
      console.error('Quote submit failed:', err)
      setStatus('error')
      setErrorMsg(`Sorry, we couldn’t submit your quote right now. Please try again, or call us on ${COMPANY.phone}.`)
    }
  }

  return (
    <main className="hk-page">
      <PageHead
        label="Quick quote"
        title="Get a price for your journey"
        intro="Tell us about your journey and we’ll get back to you with a price. All bookings are pre-arranged."
      />

      <div className="hk-body hk-split">
        <div className="hk-form">
          <div className="hk-form__row">
            <Field label="First name *" name="firstName" value={form.firstName} onChange={update} autoComplete="given-name" />
            <Field label="Last name *"  name="lastName"  value={form.lastName}  onChange={update} autoComplete="family-name" />
          </div>
          <div className="hk-form__row">
            <Field label="Email *" name="email" value={form.email} onChange={update} type="email" autoComplete="email" />
            <Field label="Phone *" name="phone" value={form.phone} onChange={update} type="tel" autoComplete="tel" />
          </div>

          <div className="hk-fieldset">
            <label className="hk-label" htmlFor="qt-serviceType">Service type</label>
            <select id="qt-serviceType" className="hk-input" name="serviceType" value={form.serviceType} onChange={update}>
              {SERVICE_OPTIONS.map((o) => <option key={o} value={o}>{o || 'Select…'}</option>)}
            </select>
          </div>

          <div className="hk-form__row">
            <Field label="Pick-up address"  name="pickupAddress"  value={form.pickupAddress}  onChange={update} />
            <Field label="Drop-off address" name="dropoffAddress" value={form.dropoffAddress} onChange={update} />
          </div>
          <div className="hk-form__row">
            <Field label="Date" name="pickupDate" value={form.pickupDate} onChange={update} type="date" />
            <Field label="Time" name="pickupTime" value={form.pickupTime} onChange={update} type="time" />
            <Field label="Passengers" name="passengers" value={form.passengers} onChange={update} type="number" min="1" />
          </div>

          <div className="hk-fieldset">
            <label className="hk-label" htmlFor="qt-notes">Notes / special requirements</label>
            <textarea id="qt-notes" className="hk-input" name="notes" value={form.notes} onChange={update} rows={3} />
          </div>

          {status === 'error' && <div className="hk-alert" role="alert">{errorMsg}</div>}
          {status === 'ok' && (
            <div className="hk-note">
              Thank you — your quote request has been received. We’ll be in touch shortly.
            </div>
          )}

          <button
            type="button"
            className="hk-btn hk-btn--primary hk-btn--lg hk-btn--block"
            onClick={submit}
            disabled={status === 'sending'}
          >
            {status === 'sending' ? 'Sending…' : 'Request quote'}
          </button>
        </div>

        <CallUs />
      </div>
    </main>
  )
}

function Field({ label, ...props }) {
  const id = `qt-${props.name}`
  return (
    <div className="hk-fieldset">
      <label className="hk-label" htmlFor={id}>{label}</label>
      <input id={id} className="hk-input" {...props} />
    </div>
  )
}
