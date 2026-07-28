import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ── API base URL ──────────────────────────────────────────────
// This is the fix for the "couldn't fetch/submit" error.
// The live site (Netlify) must call the Render backend by its full URL.
// This is hardcoded so it works with no Netlify environment variable needed.
// IMPORTANT: this must match the URL your working Book With Us form uses.
const API = 'https://haraka-transport.onrender.com'

export default function QuotePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    serviceType: '', pickupAddress: '', dropoffAddress: '',
    pickupDate: '', pickupTime: '', passengers: '', notes: '',
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
      setErrorMsg('Sorry, we couldn\u2019t submit your quote right now. Please try again, or call us on 07849 549740.')
    }
  }

  return (
    <div style={page}>
      <div style={card}>
        <h1 style={{ color: 'white', fontSize: '1.8rem', marginBottom: '6px' }}>Quick Quote</h1>
        <p style={{ color: '#94a3b8', marginBottom: '24px', fontSize: '0.95rem' }}>
          Tell us about your journey and we\u2019ll get back to you with a price. All bookings are pre-arranged.
        </p>

        <div style={grid}>
          <Field label="First name*" name="firstName" value={form.firstName} onChange={update} />
          <Field label="Last name*"  name="lastName"  value={form.lastName}  onChange={update} />
          <Field label="Email*"      name="email"     value={form.email}     onChange={update} type="email" />
          <Field label="Phone*"      name="phone"     value={form.phone}     onChange={update} type="tel" />
        </div>

        <Select label="Service type" name="serviceType" value={form.serviceType} onChange={update}
          options={['', 'Airport transfer', 'Wedding / event', 'Group travel', 'SEN transport', 'Corporate / concierge', 'Other']} />

        <div style={grid}>
          <Field label="Pick-up address"  name="pickupAddress"  value={form.pickupAddress}  onChange={update} />
          <Field label="Drop-off address" name="dropoffAddress" value={form.dropoffAddress} onChange={update} />
          <Field label="Date"  name="pickupDate" value={form.pickupDate} onChange={update} type="date" />
          <Field label="Time"  name="pickupTime" value={form.pickupTime} onChange={update} type="time" />
          <Field label="Passengers" name="passengers" value={form.passengers} onChange={update} type="number" />
        </div>

        <label style={lbl}>Notes / special requirements</label>
        <textarea name="notes" value={form.notes} onChange={update} rows={3} style={{ ...input, resize: 'vertical' }} />

        {status === 'error' && (
          <div style={{ color: '#fca5a5', marginTop: '14px', fontSize: '0.9rem' }}>{errorMsg}</div>
        )}
        {status === 'ok' && (
          <div style={{ color: '#86efac', marginTop: '14px', fontSize: '0.9rem' }}>
            Thank you — your quote request has been received. We\u2019ll be in touch shortly.
          </div>
        )}

        <button onClick={submit} disabled={status === 'sending'} style={{ ...submitBtn, opacity: status === 'sending' ? 0.6 : 1 }}>
          {status === 'sending' ? 'Sending…' : 'Request Quote'}
        </button>
      </div>
    </div>
  )
}

function Field({ label, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={lbl}>{label}</label>
      <input {...props} style={input} />
    </div>
  )
}

function Select({ label, options, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', margin: '4px 0 12px' }}>
      <label style={lbl}>{label}</label>
      <select {...props} style={input}>
        {options.map((o) => <option key={o} value={o}>{o || 'Select…'}</option>)}
      </select>
    </div>
  )
}

const page = {
  minHeight: '100vh', paddingTop: '100px', paddingBottom: '60px',
  background: 'radial-gradient(circle at 20% 10%, #1a1030, #0b0f1e 60%)',
  display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
}
const card = {
  width: '100%', maxWidth: '640px', margin: '0 20px',
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(168,85,247,0.18)',
  borderRadius: '16px', padding: '32px',
}
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '12px', marginBottom: '4px' }
const lbl = { color: '#cbd5e1', fontSize: '0.78rem', marginBottom: '4px' }
const input = {
  padding: '11px 12px', borderRadius: '9px',
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(168,85,247,0.2)',
  color: 'white', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box',
}
const submitBtn = {
  marginTop: '22px', width: '100%', padding: '14px',
  background: 'linear-gradient(135deg,#8b2f8b,#a855f7)', border: 'none',
  borderRadius: '10px', color: 'white', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
}
