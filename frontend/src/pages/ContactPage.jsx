import { useState, cloneElement } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { Check, ClipboardList, Mail, MapPin, Phone, Scale } from 'lucide-react'
import { COMPANY } from '../config/company'
import PageHead from '../components/PageHead'

const API = 'https://harakatransport.co.uk'

function Field({ label, error, children }) {
  const id = `ct-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`
  return (
    <div className="hk-fieldset">
      <label className="hk-label" htmlFor={id}>{label}</label>
      {cloneElement(children, { id, className: 'hk-input', 'aria-invalid': !!error })}
      {error && <p className="hk-error">{error}</p>}
    </div>
  )
}

export default function ContactPage() {
  const [submitted, setSubmitted]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState(null)
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setSubmitting(true); setError(null)
    try {
      const res = await fetch(`${API}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, type: 'contact' }),
      })
      if (!res.ok) throw new Error()
      setSubmitted(true)
    } catch {
      setError(`Could not send message. Please call us directly on ${COMPANY.phone}.`)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) return (
    <main className="hk-page">
      <div className="hk-done">
        <div className="hk-done__mark" aria-hidden="true"><Check size={30} strokeWidth={2.5} /></div>
        <h1 className="hk-pagehead__title">Message sent.</h1>
        <p className="hk-pagehead__intro">Thank you. We will reply as soon as we can.</p>
        <button type="button" className="hk-btn hk-btn--primary hk-btn--lg" onClick={() => navigate('/')}>
          Back to homepage
        </button>
      </div>
    </main>
  )

  const emails = [
    { Icon: Mail,          label: 'General enquiries', value: COMPANY.email,         sub: `Contact: ${COMPANY.contactPerson}` },
    { Icon: ClipboardList, label: 'Bookings',          value: COMPANY.bookingsEmail, sub: 'Or use our online booking form' },
    { Icon: Scale,         label: 'Complaints',        value: COMPANY.email,         sub: 'See our Complaints policy for response timescales' },
  ]

  return (
    <main className="hk-page">
      <PageHead
        label="Get in touch"
        title="Contact us"
        intro={`Get in touch by phone, email or the form below. Our bookings line is open ${COMPANY.bookingsLineHours}.`}
      />

      <div className="hk-body hk-split hk-split--even">

        {/* Contact details */}
        <div className="hk-contact">
          <div className="hk-contact__item">
            <Phone size={24} strokeWidth={2} aria-hidden="true" />
            <span className="hk-card__label">
              {COMPANY.operatorLicenceNumber ? 'Bookings — TfL licensed private hire' : 'Bookings — pre-booked private hire'}
            </span>
            <a className="hk-contact__value hk-contact__value--big" href={`tel:${COMPANY.phone.replace(/\s+/g, '')}`}>
              {COMPANY.phone}
            </a>
            <div>
              <p>{COMPANY.operatingHours}</p>
              <p>
                Our office is not open to the public and we do not accept callers without an appointment.
                All bookings are made by phone, email or through this website.
              </p>
            </div>
          </div>

          {emails.map(({ Icon, label, value, sub }) => (
            <div key={label} className="hk-contact__item">
              <Icon size={24} strokeWidth={2} aria-hidden="true" />
              <span className="hk-card__label">{label}</span>
              <a className="hk-contact__value" href={`mailto:${value}`}>{value}</a>
              <p>{sub}</p>
            </div>
          ))}

          <div className="hk-contact__item">
            <MapPin size={24} strokeWidth={2} aria-hidden="true" />
            <span className="hk-card__label">Registered address</span>
            <span className="hk-contact__value">
              {COMPANY.legalName}<br />
              {COMPANY.registeredOffice}
            </span>
            <p>
              Company No: {COMPANY.companyNumber} · {COMPANY.operatorLicenceNumber
                ? `TfL Operator Licence: ${COMPANY.operatorLicenceNumber}`
                : 'TfL Operator Licence: application pending'}
            </p>
          </div>
        </div>

        {/* Contact form */}
        <form className="hk-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <h2 className="hk-form__title">Send a message</h2>
          <p className="hk-form__sub">We will reply as soon as we can.</p>

          <div className="hk-form__row">
            <Field label="First Name *" error={errors.firstName?.message}>
              <input {...register('firstName', { required: 'Required' })} autoComplete="given-name" />
            </Field>
            <Field label="Last Name *" error={errors.lastName?.message}>
              <input {...register('lastName', { required: 'Required' })} autoComplete="family-name" />
            </Field>
          </div>
          <Field label="Email *" error={errors.email?.message}>
            <input {...register('email', { required: 'Required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid' } })} type="email" autoComplete="email" placeholder="name@example.com" />
          </Field>
          <Field label="Phone *" error={errors.phone?.message}>
            <input {...register('phone', { required: 'Required' })} type="tel" autoComplete="tel" placeholder="07700 900000" />
          </Field>
          <Field label="Subject *" error={errors.subject?.message}>
            <select {...register('subject', { required: 'Required' })}>
              <option value="">— Select —</option>
              <option>General Enquiry</option>
              <option>Booking Enquiry</option>
              <option>SEN Transport Enquiry</option>
              <option>Corporate Account</option>
              <option>Local Authority / Contract</option>
              <option>Complaint</option>
              <option>Compliment</option>
              <option>Other</option>
            </select>
          </Field>
          <Field label="Message *" error={errors.message?.message}>
            <textarea {...register('message', { required: 'Required' })} rows={5} placeholder="How can we help you?" />
          </Field>

          {error && <div className="hk-alert" role="alert">{error}</div>}

          <button type="submit" className="hk-btn hk-btn--primary hk-btn--lg hk-btn--block" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send message'}
          </button>
          <p className="hk-small">
            By submitting this form you agree to our <Link to="/privacy">Privacy Policy</Link>.
            Enquiries submitted here are retained for 12 months.
          </p>
        </form>
      </div>
    </main>
  )
}
