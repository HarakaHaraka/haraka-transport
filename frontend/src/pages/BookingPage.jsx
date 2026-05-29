import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useSearchParams } from 'react-router-dom'

const API = 'http://localhost:3001'

const inp = {
  width: '100%', background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(168,85,247,0.3)', color: 'white',
  padding: '13px 16px', borderRadius: '8px', fontSize: '0.9rem',
  outline: 'none', fontFamily: 'inherit',
}

function Field({ label, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label className="field-label">{label}</label>
      {children}
      {error && <p className="field-error">{error}</p>}
    </div>
  )
}

function Step1({ onNext, defaultService }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { serviceType: defaultService }
  })
  const today = new Date().toISOString().split('T')[0]
  return (
    <form onSubmit={handleSubmit(onNext)} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Field label="Pick-up Date *" error={errors.pickupDate?.message}>
          <input {...register('pickupDate', { required: 'Required' })} type="date" min={today} style={inp} />
        </Field>
        <Field label="Pick-up Time *" error={errors.pickupTime?.message}>
          <input {...register('pickupTime', { required: 'Required' })} type="time" style={inp} />
        </Field>
      </div>
      <Field label="Pick-up Address *" error={errors.pickupAddress?.message}>
        <input {...register('pickupAddress', { required: 'Required' })} style={inp} placeholder="Full address or postcode" />
      </Field>
      <Field label="Drop-off Address *" error={errors.dropoffAddress?.message}>
        <input {...register('dropoffAddress', { required: 'Required' })} style={inp} placeholder="Destination address, postcode or airport" />
      </Field>
      <Field label="Service Type *" error={errors.serviceType?.message}>
        <select {...register('serviceType', { required: 'Required' })} style={inp}>
          <option value="">— Select service —</option>
          <option>SEN / Care Transport</option>
          <option>Airport Transfer — Departure</option>
          <option>Airport Transfer — Arrival</option>
          <option>Concierge Chauffeur</option>
          <option>Corporate / Business Transfer</option>
          <option>Wedding Transport</option>
          <option>Events & Gala</option>
          <option>Night & Entertainment</option>
          <option>Group / Minibus</option>
          <option>Other</option>
        </select>
      </Field>
      <Field label="Vehicle Preference">
        <select {...register('vehiclePreference')} style={inp}>
          <option value="">— No preference —</option>
          <option>Standard Saloon</option>
          <option>Executive Saloon (Mercedes S-Class, BMW 7)</option>
          <option>Premium SUV (Range Rover, Cayenne)</option>
          <option>Ultra Luxury (Rolls-Royce, Bentley)</option>
          <option>Wheelchair Accessible Vehicle (WAV)</option>
          <option>MPV / VIP Van (Mercedes V-Class)</option>
          <option>Minibus (up to 16 seats)</option>
        </select>
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Field label="Passengers *" error={errors.passengers?.message}>
          <select {...register('passengers', { required: 'Required' })} style={inp}>
            <option value="">—</option>
            {Array.from({length:16},(_,i)=>i+1).map(n=><option key={n}>{n}</option>)}
          </select>
        </Field>
        <Field label="Luggage Items">
          <select {...register('luggage')} style={inp}>
            {Array.from({length:9},(_,i)=>i).map(n=><option key={n}>{n}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Flight Number (airport transfers only)">
        <input {...register('flightNumber')} style={inp} placeholder="e.g. BA0123" />
      </Field>
      <Field label="Special Requirements">
        <textarea {...register('specialRequirements')} style={{...inp, minHeight:'80px', resize:'vertical'}}
          placeholder="Wheelchair access, child seats, meet & greet sign, SEN needs, carer accompanying..." />
      </Field>
      <button type="submit" className="btn-primary" style={{ padding: '16px', fontSize: '0.95rem', marginTop: '8px' }}>
        Next: Your Details →
      </button>
    </form>
  )
}

function Step2({ onNext, onBack }) {
  const { register, handleSubmit, formState: { errors } } = useForm()
  return (
    <form onSubmit={handleSubmit(onNext)} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
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
      <Field label="Contract / Account Type *" error={errors.contractType?.message}>
        <select {...register('contractType', { required: 'Required' })} style={inp}>
          <option value="">— Select —</option>
          <option>One-off Booking</option>
          <option>Corporate Account</option>
          <option>Local Authority Contract</option>
          <option>School / Care Provider</option>
          <option>Hotel Concierge Account</option>
          <option>Monthly Retainer</option>
          <option>Event Package</option>
          <option>Wedding Package</option>
        </select>
      </Field>
      <Field label="Company / Organisation Name">
        <input {...register('companyName')} style={inp} placeholder="Company, school or care provider name" />
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
      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <button type="button" onClick={onBack} className="btn-outline" style={{ flex: 1 }}>← Back</button>
        <button type="submit" className="btn-primary" style={{ flex: 2 }}>Review & Confirm →</button>
      </div>
    </form>
  )
}

function Step3({ formData, onBack, onSubmit, isSubmitting }) {
  const sections = [
    { title: '🗺 Journey Details', rows: [
      ['Date', formData.pickupDate], ['Time', formData.pickupTime],
      ['Pick-up', formData.pickupAddress], ['Drop-off', formData.dropoffAddress],
      ['Service', formData.serviceType], ['Vehicle', formData.vehiclePreference || 'No preference'],
      ['Passengers', formData.passengers], ['Luggage', formData.luggage || 0],
      ['Flight No.', formData.flightNumber || 'N/A'],
    ]},
    { title: '👤 Your Details', rows: [
      ['Name', `${formData.firstName} ${formData.lastName}`],
      ['Email', formData.email], ['Phone', formData.phone],
      ['Contract', formData.contractType], ['Company', formData.companyName || 'N/A'],
    ]},
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Please review your details before confirming.</p>
      {sections.map(({ title, rows }) => (
        <div key={title} style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(168,85,247,0.15)' }}>
          <div style={{ background: 'rgba(107,33,168,0.15)', padding: '10px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#A855F7' }}>{title}</div>
          {rows.map(([k,v], i) => (
            <div key={k} style={{ display: 'grid', gridTemplateColumns: '130px 1fr', padding: '9px 16px', background: i%2===0?'transparent':'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'rgba(168,85,247,0.7)' }}>{k}</span>
              <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>{v}</span>
            </div>
          ))}
        </div>
      ))}
      {formData.specialRequirements && (
        <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', padding: '12px 16px' }}>
          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#F59E0B' }}>Special Requirements: </span>
          <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)' }}>{formData.specialRequirements}</span>
        </div>
      )}
      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '14px', border: '1px solid rgba(255,255,255,0.07)' }}>
        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
          By confirming you agree to our terms and conditions. We will contact you within 2 hours to confirm availability and provide your quote.
        </p>
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button type="button" onClick={onBack} className="btn-outline" style={{ flex: 1 }}>← Back</button>
        <button onClick={onSubmit} disabled={isSubmitting} className="btn-gold" style={{ flex: 2, opacity: isSubmitting ? 0.5 : 1 }}>
          {isSubmitting ? 'Submitting…' : 'Confirm Booking ✓'}
        </button>
      </div>
    </div>
  )
}

export default function BookingPage() {
  const [searchParams]  = useSearchParams()
const defaultService  = searchParams.get('service') || ''
const [step, setStep]               = useState(0)
  const [step, setStep]               = useState(0)
  const [formData, setFormData]       = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError]             = useState(null)
  const navigate = useNavigate()

  const next = (data) => {
    setFormData(prev => ({ ...prev, ...data }))
    setStep(s => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const back = () => { setStep(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  const submit = async () => {
    setIsSubmitting(true); setError(null)
    try {
      const res = await fetch(`${API}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, type: 'booking' }),
      })
      if (!res.ok) throw new Error()
      const result = await res.json()
      navigate('/confirm', { state: { id: result.id, name: formData.firstName, type: 'booking' } })
    } catch {
      setError('Unable to submit. Please call +44 20 0000 0000 directly.')
      setIsSubmitting(false)
    }
  }

  const STEPS = ['Journey Details', 'Your Details', 'Review & Confirm']

  return (
    <div style={{ minHeight: '100vh', background: '#0F0A1E', paddingTop: '90px', paddingBottom: '60px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="badge badge-purple" style={{ marginBottom: '14px', display: 'inline-block' }}>Confirmed Booking</span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: 'white', marginBottom: '8px' }}>Book Your Journey</h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>We confirm all bookings within 2 hours</p>
        </div>

        <div className="step-bar">
          {STEPS.map((s, i) => (
            <div key={s} className="step-item" style={{ paddingRight: i < STEPS.length-1 ? '8px' : 0 }}>
              <div className={`step-line ${i <= step ? 'active' : ''}`} />
              <div className={`step-label ${i === step ? 'active' : ''}`}>{s}</div>
            </div>
          ))}
        </div>

        <div className="glass-card" style={{ padding: '36px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(168,85,247,0.15)' }}>
            {STEPS[step]}
          </h2>
          {error && (
            <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '8px', padding: '14px', marginBottom: '20px', color: '#F87171', fontSize: '0.875rem' }}>⚠ {error}</div>
          )}
          {step === 0 && <Step1 onNext={next} defaultService={defaultService} />}
          {step === 1 && <Step2 onNext={next} onBack={back} />}
          {step === 2 && <Step3 formData={formData} onBack={back} onSubmit={submit} isSubmitting={isSubmitting} />}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
          {['🔒 Secure', '✓ TFL Licensed', '♿ WAV Available', '24/7 Support'].map(t => (
            <span key={t} style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}