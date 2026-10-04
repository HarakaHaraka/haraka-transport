import { useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { COMPANY } from '../config/company'
import PageHead from '../components/PageHead'
import CallUs from '../components/CallUs'

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
function Step1({ onNext, defaults }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: defaults,
  })

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate>
      <div className="hk-form">
        <h2 className="hk-form__title">Journey details</h2>

        <div className="hk-fieldset">
          <label className="hk-label" htmlFor="bk-serviceType">Service type *</label>
          <select
            id="bk-serviceType"
            className="hk-input"
            aria-invalid={!!errors.serviceType}
            {...register('serviceType', { required: 'Please select a service type' })}
          >
            <option value="">— Select —</option>
            {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.serviceType && <p className="hk-error">{errors.serviceType.message}</p>}
        </div>

        <div className="hk-fieldset">
          <label className="hk-label" htmlFor="bk-pickupAddress">Pick-up address *</label>
          <input
            id="bk-pickupAddress"
            className="hk-input"
            placeholder="Full pick-up address"
            aria-invalid={!!errors.pickupAddress}
            {...register('pickupAddress', { required: 'Pickup address is required' })}
          />
          {errors.pickupAddress && <p className="hk-error">{errors.pickupAddress.message}</p>}
        </div>

        <div className="hk-fieldset">
          <label className="hk-label" htmlFor="bk-dropoffAddress">Drop-off address *</label>
          <input
            id="bk-dropoffAddress"
            className="hk-input"
            placeholder="Full destination address"
            aria-invalid={!!errors.dropoffAddress}
            {...register('dropoffAddress', { required: 'Drop-off address is required' })}
          />
          {errors.dropoffAddress && <p className="hk-error">{errors.dropoffAddress.message}</p>}
        </div>

        <div className="hk-form__row">
          <div className="hk-fieldset">
            <label className="hk-label" htmlFor="bk-pickupDate">Date *</label>
            <input
              id="bk-pickupDate"
              type="date"
              className="hk-input"
              aria-invalid={!!errors.pickupDate}
              {...register('pickupDate', { required: 'Date is required' })}
            />
            {errors.pickupDate && <p className="hk-error">{errors.pickupDate.message}</p>}
          </div>
          <div className="hk-fieldset">
            <label className="hk-label" htmlFor="bk-pickupTime">Time *</label>
            <input
              id="bk-pickupTime"
              type="time"
              className="hk-input"
              aria-invalid={!!errors.pickupTime}
              {...register('pickupTime', { required: 'Time is required' })}
            />
            {errors.pickupTime && <p className="hk-error">{errors.pickupTime.message}</p>}
          </div>
        </div>

        <div className="hk-form__row">
          <div className="hk-fieldset">
            <label className="hk-label" htmlFor="bk-passengers">Passengers *</label>
            <input
              id="bk-passengers"
              type="number" min="1" max="16"
              className="hk-input"
              placeholder="1"
              aria-invalid={!!errors.passengers}
              {...register('passengers', {
                required: 'Required',
                min: { value: 1, message: 'At least 1' },
                max: { value: 16, message: 'Max 16' },
              })}
            />
            {errors.passengers && <p className="hk-error">{errors.passengers.message}</p>}
          </div>
          <div className="hk-fieldset">
            <label className="hk-label" htmlFor="bk-luggage">Luggage items</label>
            <input
              id="bk-luggage"
              type="number" min="0"
              className="hk-input"
              placeholder="0"
              {...register('luggage')}
            />
          </div>
        </div>

        <div className="hk-fieldset">
          <label className="hk-label" htmlFor="bk-flightNumber">Flight number (if airport)</label>
          <input
            id="bk-flightNumber"
            className="hk-input"
            placeholder="e.g. BA0123"
            {...register('flightNumber')}
          />
        </div>

        <div className="hk-fieldset">
          <label className="hk-label" htmlFor="bk-specialRequirements">Special requirements</label>
          <textarea
            id="bk-specialRequirements"
            rows={3}
            className="hk-input"
            placeholder="Wheelchair access, child seats, meet & greet…"
            {...register('specialRequirements')}
          />
        </div>
      </div>

      <div className="hk-form__actions" style={{ gridTemplateColumns: '1fr' }}>
        <button className="hk-btn hk-btn--primary hk-btn--lg hk-btn--split" type="submit">
          Next: your details
          <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </form>
  )
}

/* ─── Step 2 — Passenger Details ────────────────────────────── */
function Step2({ onNext, onBack }) {
  const { register, handleSubmit, formState: { errors } } = useForm()

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate>
      <div className="hk-form">
        <h2 className="hk-form__title">Your details</h2>

        <div className="hk-form__row">
          <div className="hk-fieldset">
            <label className="hk-label" htmlFor="bk-firstName">First name *</label>
            <input
              id="bk-firstName"
              className="hk-input"
              autoComplete="given-name"
              aria-invalid={!!errors.firstName}
              {...register('firstName', { required: 'Required' })}
            />
            {errors.firstName && <p className="hk-error">{errors.firstName.message}</p>}
          </div>
          <div className="hk-fieldset">
            <label className="hk-label" htmlFor="bk-lastName">Last name *</label>
            <input
              id="bk-lastName"
              className="hk-input"
              autoComplete="family-name"
              aria-invalid={!!errors.lastName}
              {...register('lastName', { required: 'Required' })}
            />
            {errors.lastName && <p className="hk-error">{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="hk-fieldset">
          <label className="hk-label" htmlFor="bk-email">Email address *</label>
          <input
            id="bk-email"
            type="email"
            className="hk-input"
            autoComplete="email"
            placeholder="name@example.com"
            aria-invalid={!!errors.email}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
            })}
          />
          {errors.email && <p className="hk-error">{errors.email.message}</p>}
        </div>

        <div className="hk-fieldset">
          <label className="hk-label" htmlFor="bk-phone">Phone number *</label>
          <input
            id="bk-phone"
            type="tel"
            className="hk-input"
            autoComplete="tel"
            placeholder="07700 900000"
            aria-invalid={!!errors.phone}
            {...register('phone', { required: 'Phone is required' })}
          />
          {errors.phone && <p className="hk-error">{errors.phone.message}</p>}
        </div>

        <div className="hk-fieldset">
          <label className="hk-label" htmlFor="bk-referralSource">How did you hear about us?</label>
          <select id="bk-referralSource" className="hk-input" {...register('referralSource')}>
            <option value="">— Select (optional) —</option>
            {['Google', 'Social Media', 'Referral / Word of Mouth', 'Returning Customer', 'Other'].map(r =>
              <option key={r} value={r}>{r}</option>
            )}
          </select>
        </div>
      </div>

      <div className="hk-form__actions">
        <button type="button" className="hk-btn hk-btn--secondary hk-btn--lg" onClick={onBack}>
          <ArrowLeft size={18} strokeWidth={2} aria-hidden="true" />
          Back
        </button>
        <button className="hk-btn hk-btn--primary hk-btn--lg hk-btn--split" type="submit">
          Review booking
          <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
        </button>
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
      <div className="hk-form">
        <h2 className="hk-form__title">Review your booking</h2>
        <table className="hk-review">
          <tbody>
            {rows.map(([label, val]) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                <td>{val}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="hk-small">
          By submitting you agree to our{' '}
          <a href="/terms" target="_blank" rel="noopener noreferrer">Terms & Conditions</a>.
          We will contact you to confirm availability and pricing.
        </p>
      </div>

      <div className="hk-form__actions">
        <button
          type="button"
          className="hk-btn hk-btn--secondary hk-btn--lg"
          onClick={onBack}
          disabled={submitting}
        >
          <ArrowLeft size={18} strokeWidth={2} aria-hidden="true" />
          Back
        </button>
        <button
          type="button"
          className="hk-btn hk-btn--primary hk-btn--lg hk-btn--split"
          onClick={onConfirm}
          disabled={submitting}
        >
          {submitting ? 'Submitting…' : 'Confirm booking'}
          <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

/* ─── Step indicator ─────────────────────────────────────────── */
function StepBar({ current }) {
  const steps = ['Journey', 'Your details', 'Review']
  return (
    <ol className="hk-steps">
      {steps.map((label, i) => (
        <li
          key={label}
          className={`hk-step${i === current ? ' is-on' : i < current ? ' is-done' : ''}`}
          aria-current={i === current ? 'step' : undefined}
        >
          {String(i + 1).padStart(2, '0')} {label}
        </li>
      ))}
    </ol>
  )
}

/* ─── Main BookingPage ───────────────────────────────────────── */
export default function BookingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  // Service type comes from the URL (?service=). Anything typed into the
  // homepage booking panel arrives in router state and fills Step 1.
  const prefill = location.state?.prefill || {}
  const step1Defaults = {
    serviceType:         searchParams.get('service') || prefill.serviceType || '',
    pickupAddress:       prefill.pickupAddress || '',
    dropoffAddress:      prefill.dropoffAddress || '',
    pickupDate:          prefill.pickupDate || '',
    flightNumber:        prefill.flightNumber || '',
    specialRequirements: prefill.flightNumber ? '' : (prefill.notes || ''),
  }

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
      setError(err.message || `Something went wrong — please try again or call us on ${COMPANY.phone}.`)
      setSubmitting(false)
    }
  }

  return (
    <main className="hk-page">
      <PageHead
        label={COMPANY.operatorLicenceNumber ? 'TfL licensed private hire' : 'Pre-booked private hire'}
        title="Book a journey"
        intro="Tell us about your journey and we’ll confirm availability and pricing."
      />

      <div className="hk-body hk-split">
        <div>
          <StepBar current={step} />

          {error && <div className="hk-alert" role="alert" style={{ marginBottom: '16px' }}>{error}</div>}

          {step === 0 && <Step1 onNext={next} defaults={step1Defaults} />}
          {step === 1 && <Step2 onNext={next} onBack={back} />}
          {step === 2 && <Step3 data={formData} onBack={back} onConfirm={submit} submitting={submitting} />}
        </div>

        <CallUs />
      </div>
    </main>
  )
}
