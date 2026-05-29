import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'

const API = 'http://localhost:3001'

function Field({ label, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label className="field-label">{label}</label>
      {children}
      {error && <p className="field-error">{error}</p>}
    </div>
  )
}

const inp = {
  width: '100%', background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(168,85,247,0.3)', color: 'white',
  padding: '13px 16px', borderRadius: '8px', fontSize: '0.9rem',
  outline: 'none', fontFamily: 'inherit',
}

export default function QuotePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const defaultType = searchParams.get('service') || (searchParams.get('type') === 'sen' ? 'SEN / Care Transport' : '')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [refId, setRefId] = useState(null)

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { serviceInterest: defaultType },
  })

  const onSubmit = async (data) => {
    setSubmitting(true); setError(null)
    try {
      const res = await fetch(`${API}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, type: 'quote' }),
      })
      if (!res.ok) throw new Error()
      const result = await res.json()
      setRefId(result.id); setSubmitted(true)
    } catch {
      setError('Could not submit. Please call us on +44 20 0000 0000')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) return (
    <div style={{ minHeight: '100vh', background: '#0F0A1E', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', paddingTop: '90px' }}>
      <div style={{ maxWidth: '520px', width: '100%', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #F59E0B, #D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '2rem' }}>✓</div>
        <span className="badge badge-gold" style={{ marginBottom: '16px', display: 'inline-block' }}>Quote Request Received</span>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'white', marginBottom: '12px' }}>We'll Be in Touch!</h1>
        {refId && <p style={{ color: '#94A3B8', marginBottom: '8px' }}>Reference: <span style={{ color: '#F59E0B', fontWeight: 700 }}>QUO-{String(refId).padStart(5,'0')}</span></p>}
        <p style={{ color: '#94A3B8', lineHeight: 1.8, marginBottom: '32px' }}>
          Your quote request has been received. A member of our team will contact you within <strong style={{ color: 'white' }}>2 hours</strong> with pricing and availability.
        </p>
        <button className="btn-primary" onClick={() => navigate('/')}>Back to Homepage</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0F0A1E', paddingTop: '90px', paddingBottom: '60px' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="badge badge-gold" style={{ marginBottom: '14px', display: 'inline-block' }}>2-Hour Response Guaranteed</span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: 'white', marginBottom: '10px' }}>Get a Quick Quote</h1>
          <p style={{ color: '#94A3B8', fontSize: '0.95rem', lineHeight: 1.7 }}>Leave your details and we will call you back with pricing. No obligation.</p>
        </div>

        <div className="glass-card" style={{ padding: '36px' }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Field label="First Name *" error={errors.firstName?.message}>
                <input {...register('firstName', { required: 'Required' })} style={inp} placeholder="First name" />
              </Field>
              <Field label="Last Name *" error={errors.lastName?.message}>
                <input {...register('lastName', { required: 'Required' })} style={inp} placeholder="Last name" />
              </Field>
            </div>
            <Field label="Email Address *" error={errors.email?.message}>
              <input {...register('email', { required: 'Required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })} type="email" style={inp} placeholder="your@email.com" />
            </Field>
            <Field label="Mobile Number *" error={errors.phone?.message}>
              <input {...register('phone', { required: 'Required' })} type="tel" style={inp} placeholder="+44 7700 000000" />
            </Field>
            <Field label="Best Time to Call">
              <select {...register('callTime')} style={inp}>
                <option value="">— No preference —</option>
                <option>Morning (8am – 12pm)</option>
                <option>Afternoon (12pm – 5pm)</option>
                <option>Evening (5pm – 9pm)</option>
                <option>Any time</option>
              </select>
            </Field>
            <Field label="Service Required *" error={errors.serviceInterest?.message}>
              <select {...register('serviceInterest', { required: 'Please select a service' })} style={inp}>
                <option value="">— Select service —</option>
                <option>SEN / Care Transport</option>
                <option>Airport Transfer</option>
                <option>Concierge Chauffeur</option>
                <option>Wedding Transport</option>
                <option>Corporate / Events</option>
                <option>Night & Entertainment</option>
                <option>Regular Contract</option>
                <option>Other</option>
              </select>
            </Field>
            <Field label="Journey Details / Requirements">
              <textarea {...register('journeyDetails')} style={{ ...inp, minHeight: '100px', resize: 'vertical' }}
                placeholder="Tell us about your journey — dates, locations, passengers, any special requirements..." />
            </Field>
            <Field label="How Did You Hear About Us?">
              <select {...register('referralSource')} style={inp}>
                <option value="">— Select —</option>
                <option>Google Search</option>
                <option>Local Authority / Council</option>
                <option>School or Care Provider</option>
                <option>Hotel Concierge</option>
                <option>Word of Mouth</option>
                <option>Social Media</option>
                <option>Returning Customer</option>
                <option>Other</option>
              </select>
            </Field>
            {error && (
              <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '8px', padding: '14px', color: '#F87171', fontSize: '0.875rem' }}>
                ⚠ {error}
              </div>
            )}
            <button type="submit" className="btn-gold" style={{ fontSize: '1rem', padding: '16px', opacity: submitting ? 0.6 : 1 }} disabled={submitting}>
              {submitting ? 'Sending…' : '💬 Send My Quote Request →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}