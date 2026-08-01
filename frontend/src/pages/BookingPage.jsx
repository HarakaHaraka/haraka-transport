import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'

/* ─── shared styles ─────────────────────────────────────────── */
const card = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(168,85,247,0.15)',
  borderRadius: '16px',
  padding: '28px',
  marginBottom: '20px',
}
const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: 'rgba(255,255,255,0.6)',
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}
const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(168,85,247,0.25)',
  borderRadius: '8px',
  padding: '12px 14px',
  color: '#fff',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box',
}
const errStyle = { color: '#F87171', fontSize: '0.78rem', marginTop: '4px' }

const SERVICE_TYPES = [
  'Airport Transfer',
  'City / Point-to-Point',
  'SEN / Care Transport',
  'Corporate Travel',
  'Events & Weddings',
  'Hourly / As-Directed',
  'Other',
]

/* ─── Step 1 — Journey Details ───────────────────────────────── */
function Step1({ onNext, defaultService }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { serviceType: defaultService }
  })

  return (
    <form onSubmit={handleSubmit(onNext)}>
      <div style={card}>
        <h2 style={{ color: '#fff', marginTop: 0, marginBottom: '20px', fontSize: '1.2rem' }}>
          Journey Details
        </h2>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle} htmlFor="bk-serviceType">Service Type *</label>
          <select
            id="bk-serviceType"
            style={{ ...inputStyle, cursor: 'pointer' }}
            {...register('serviceType', { required: 'Please select a service type' })}
          >
            <option value="">— Select —</option>
            {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.serviceType && <p style={errStyle}>{errors.serviceType.message}</p>}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle} htmlFor="bk-pickupAddress">Pickup Address *</label>
          <input
            id="bk-pickupAddress"
            style={inputStyle}
            placeholder="Full pickup address"
            {...register('pickupAddress', { required: 'Pickup address is required' })}
          />
          {errors.pickupAddress && <p style={errStyle}>{errors.pickupAddress.message}</p>}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle} htmlFor="bk-dropoffAddress">Drop-off Address *</label>
          <input
            id="bk-dropoffAddress"
            style={inputStyle}
            placeholder="Full destination address"
            {...register('dropoffAddress', { required: 'Drop-off address is required' })}
          />
          {errors.dropoffAddress && <p style={errStyle}>{errors.dropoffAddress.message}</p>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle} htmlFor="bk-pickupDate">Date *</label>
            <input
              id="bk-pickupDate"
              type="date"
              style={inputStyle}
              {...register('pickupDate', { required: 'Date is required' })}
            />
            {errors.pickupDate && <p style={errStyle}>{errors.pickupDate.message}</p>}
          </div>
          <div>
            <label style={labelStyle} htmlFor="bk-pickupTime">Time *</label>
            <input
              id="bk-pickupTime"
              type="time"
              style={inputStyle}
              {...register('pickupTime', { required: 'Time is required' })}
            />
            {errors.pickupTime && <p style={errStyle}>{errors.pickupTime.message}</p>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle} htmlFor="bk-passengers">Passengers *</label>
            <input
              id="bk-passengers"
              type="number" min="1" max="16"
              style={inputStyle}
              placeholder="1"
              {...register('passengers', {
                required: 'Required',
                min: { value: 1, message: 'At least 1' },
                max: { value: 16, message: 'Max 16' },
              })}
            />
            {errors.passengers && <p style={errStyle}>{errors.passengers.message}</p>}
          </div>
          <div>
            <label style={labelStyle} htmlFor="bk-luggage">Luggage Items</label>
            <input
              id="bk-luggage"
              type="number" min="0"
              style={inputStyle}
              placeholder="0"
              {...register('luggage')}
            />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle} htmlFor="bk-flightNumber">Flight Number (if airport)</label>
          <input
            id="bk-flightNumber"
            style={inputStyle}
            placeholder="e.g. BA0123"
            {...register('flightNumber')}
          />
        </div>

        <div>
          <label style={labelStyle} htmlFor="bk-specialRequirements">Special Requirements</label>
          <textarea
            id="bk-specialRequirements"
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
            placeholder="Wheelchair access, child seats, meet & greet…"
            {...register('specialRequirements')}
          />
        </div>
      </div>

      <button className="btn-primary" type="submit" style={{ width: '100%' }}>
        Next — Your Details →
      </button>
    </form>
  )
}

/* ─── Step 2 — Passenger Details ────────────────────────────── */
function Step2({ onNext, onBack }) {
  const { register, handleSubmit, formState: { errors } } = useForm()

  return (
    <form onSubmit={handleSubmit(onNext)}>
      <div style={card}>
        <h2 style={{ color: '#fff', marginTop: 0, marginBottom: '20px', fontSize: '1.2rem' }}>
          Your Details
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle} htmlFor="bk-firstName">First Name *</label>
            <input
              id="bk-firstName"
              style={inputStyle}
              placeholder="Jane"
              {...register('firstName', { required: 'Required' })}
            />
            {errors.firstName && <p style={errStyle}>{errors.firstName.message}</p>}
          </div>
          <div>
            <label style={labelStyle} htmlFor="bk-lastName">Last Name *</label>
            <input
              id="bk-lastName"
              style={inputStyle}
              placeholder="Smith"
              {...register('lastName', { required: 'Required' })}
            />
            {errors.lastName && <p style={errStyle}>{errors.lastName.message}</p>}
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle} htmlFor="bk-email">Email Address *</label>
          <input
            id="bk-email"
            type="email"
            style={inputStyle}
            placeholder="jane@example.com"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
            })}
          />
          {errors.email && <p style={errStyle}>{errors.email.message}</p>}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle} htmlFor="bk-phone">Phone Number *</label>
          <input
            id="bk-phone"
            type="tel"
            style={inputStyle}
            placeholder="+44 7700 000000"
            {...register('phone', { required: 'Phone is required' })}
          />
          {errors.phone && <p style={errStyle}>{errors.phone.message}</p>}
        </div>

        <div>
          <label style={labelStyle} htmlFor="bk-referralSource">How did you hear about us?</label>
          <select id="bk-referralSource" style={{ ...inputStyle, cursor: 'pointer' }} {...register('referralSource')}>
            <option value="">— Select (optional) —</option>
            {['Google', 'Social Media', 'Referral / Word of Mouth', 'Returning Customer', 'Other'].map(r =>
              <option key={r} value={r}>{r}</option>
            )}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '10px',
            color: '#fff',
            padding: '14px',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          ← Back
        </button>
        <button className="btn-primary" type="submit">Review Booking →</button>
      </div>
    </form>
  )
}

/* ─── Step 3 — Review & Submit ───────────────────────────────── */
function Step3({ data, onBack, onConfirm, submitting }) {
  const rows = [
    ['Service',      data.serviceType],
    ['Pickup',       data.pickupAddress],
    ['Drop-off',     data.dropoffAddress],
    ['Date & Time',  `${data.pickupDate} at ${data.pickupTime}`],
    ['Passengers',   data.passengers],
    ['Luggage',      data.luggage || '0'],
    ['Flight No.',   data.flightNumber || '—'],
    ['Requirements', data.specialRequirements || '—'],
    ['Name',         `${data.firstName} ${data.lastName}`],
    ['Email',        data.email],
    ['Phone',        data.phone],
  ]

  return (
    <div>
      <div style={card}>
        <h2 style={{ color: '#fff', marginTop: 0, marginBottom: '20px', fontSize: '1.2rem' }}>
          Review Your Booking
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {rows.map(([label, val]) => (
              <tr key={label} style={{ borderBottom: '1px solid rgba(168,85,247,0.08)' }}>
                <td style={{ padding: '10px 0', color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', width: '40%' }}>
                  {label}
                </td>
                <td style={{ padding: '10px 0', color: '#fff', fontSize: '0.9rem', wordBreak: 'break-word' }}>
                  {val}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '18px', marginBottom: 0 }}>
          By submitting you agree to our{' '}
          <a href="/terms" style={{ color: '#A855F7' }}>Terms & Conditions</a>.
          We will contact you within 2 hours to confirm availability and pricing.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '10px',
            color: '#fff',
            padding: '14px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            opacity: submitting ? 0.5 : 1,
          }}
        >
          ← Back
        </button>
        <button
          className="btn-primary"
          onClick={onConfirm}
          disabled={submitting}
          style={{ opacity: submitting ? 0.6 : 1 }}
        >
          {submitting ? 'Submitting…' : 'Confirm Booking →'}
        </button>
      </div>
    </div>
  )
}

/* ─── Step indicator ─────────────────────────────────────────── */
function StepBar({ current }) {
  const steps = ['Journey', 'Your Details', 'Review']
  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
      {steps.map((label, i) => (
        <div key={label} style={{ flex: 1, textAlign: 'center' }}>
          <div style={{
            height: '4px',
            borderRadius: '2px',
            background: i <= current ? '#A855F7' : 'rgba(255,255,255,0.1)',
            marginBottom: '6px',
            transition: 'background 0.3s',
          }} />
          <span style={{
            fontSize: '0.72rem',
            color: i === current ? '#A855F7' : i < current ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)',
            fontWeight: i === current ? 700 : 400,
          }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ─── Main BookingPage ───────────────────────────────────────── */
export default function BookingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const defaultService = searchParams.get('service') || ''

  const [step, setStep]       = useState(0)
  const [formData, setFormData] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]     = useState('')

  function next(data) {
    setFormData(prev => ({ ...prev, ...data }))
    setStep(s => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function back() {
    setStep(s => s - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function submit() {
    setSubmitting(true)
    setError('')
    try {
      // Field names match the backend db columns exactly
      const payload = {
        type:                'booking',
        firstName:           formData.firstName,
        lastName:            formData.lastName,
        email:               formData.email,
        phone:               formData.phone,
        serviceType:         formData.serviceType,
        pickupAddress:       formData.pickupAddress,
        dropoffAddress:      formData.dropoffAddress,
        pickupDate:          formData.pickupDate,
        pickupTime:          formData.pickupTime,
        passengers:          formData.passengers,
        luggage:             formData.luggage || 0,
        flightNumber:        formData.flightNumber || '',
        specialRequirements: formData.specialRequirements || '',
        vehiclePreference:   '',
        referralSource:      formData.referralSource || '',
      }

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Server error (${res.status})`)
      }

      const result = await res.json()
      navigate('/confirm', { state: { id: result.id, name: formData.firstName, type: 'booking' } })

    } catch (err) {
      setError(err.message || 'Something went wrong — please try again or call us on +44 20 0000 0000.')
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0F0A1E',
      padding: '80px 16px 60px',
      display: 'flex',
      justifyContent: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: '560px' }}>

        <div style={{ marginBottom: '28px' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(168,85,247,0.12)',
            border: '1px solid rgba(168,85,247,0.3)',
            borderRadius: '20px',
            padding: '4px 14px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#A855F7',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            TFL Licensed
          </div>
          <h1 style={{ color: '#fff', margin: '0 0 6px', fontSize: 'clamp(1.4rem,4vw,2rem)' }}>
            Book a Journey
          </h1>
          <p style={{ color: '#94A3B8', margin: 0, fontSize: '0.9rem' }}>
            We'll confirm availability & pricing within 2 hours.
          </p>
        </div>

        <StepBar current={step} />

        {error && (
          <div style={{
            background: 'rgba(248,113,113,0.1)',
            border: '1px solid rgba(248,113,113,0.3)',
            borderRadius: '10px',
            padding: '12px 16px',
            color: '#FCA5A5',
            fontSize: '0.875rem',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        {step === 0 && <Step1 onNext={next} defaultService={defaultService} />}
        {step === 1 && <Step2 onNext={next} onBack={back} />}
        {step === 2 && <Step3 data={formData} onBack={back} onConfirm={submit} submitting={submitting} />}
      </div>
    </div>
  )
}
