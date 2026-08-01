import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { COMPANY } from '../config/company'

const API = 'https://harakatransport.co.uk'

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
      setError('Could not send message. Please call us directly.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) return (
    <div style={{ minHeight: '100vh', background: '#0F0A1E', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', paddingTop: '90px' }}>
      <div style={{ maxWidth: '520px', width: '100%', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #6B21A8, #A855F7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '2.2rem' }}>✓</div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'white', marginBottom: '12px' }}>Message Sent!</h1>
        <p style={{ color: '#94A3B8', lineHeight: 1.8, marginBottom: '32px' }}>We will respond within 2 hours during business hours.</p>
        <button className="btn-primary" onClick={() => navigate('/')}>Back to Homepage</button>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#0F0A1E', minHeight: '100vh', paddingTop: '90px', paddingBottom: '60px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px' }}>

        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="badge badge-purple" style={{ marginBottom: '14px', display: 'inline-block' }}>Get In Touch</span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: 'white', marginBottom: '12px' }}>Contact Us</h1>
          <p style={{ color: '#94A3B8', fontSize: '1rem', maxWidth: '500px', width: '100%', margin: '0 auto', lineHeight: 1.7 }}>
            We are available 24 hours a day, 7 days a week. Get in touch by phone, email or the form below.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>

          {/* Contact details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Bookings phone */}
            <div style={{ background: 'rgba(245,158,11,0.08)', border: '2px solid rgba(245,158,11,0.3)', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '2rem' }}>📞</div>
                <div>
                  <p style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#F59E0B', marginBottom: '6px', fontWeight: 700 }}>
                    Bookings — TfL Licensed Private Hire
                  </p>
                  <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', marginBottom: '4px' }}>
                    {COMPANY.phone}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{COMPANY.operatingHours}</p>
                  <p style={{ fontSize: '0.72rem', color: 'rgba(245,158,11,0.7)', marginTop: '8px' }}>
                    Our office is not open to the public and we do not accept callers without an appointment.
                    All bookings are made by phone, email or through this website.
                  </p>
                </div>
              </div>
            </div>

            {[
              { icon: '✉️', label: 'General Enquiries', value: COMPANY.email, sub: `Contact: ${COMPANY.contactPerson}` },
              { icon: '📋', label: 'Bookings', value: COMPANY.bookingsEmail, sub: 'Or use our online booking form' },
              { icon: '⚖️', label: 'Complaints', value: COMPANY.email, sub: 'See our Complaints policy for response timescales' },
            ].map(({ icon, label, value, sub }) => (
              <div key={label} className="glass-card" style={{ padding: '20px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>{icon}</div>
                <div>
                  <p style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A855F7', marginBottom: '4px', fontWeight: 700 }}>{label}</p>
                  <p style={{ fontSize: '0.95rem', color: 'white', fontWeight: 600, marginBottom: '3px' }}>{value}</p>
                  <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{sub}</p>
                </div>
              </div>
            ))}

            {/* Address */}
            <div className="glass-card" style={{ padding: '20px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>📍</div>
              <div>
                <p style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A855F7', marginBottom: '4px', fontWeight: 700 }}>Registered Address</p>
                <p style={{ fontSize: '0.9rem', color: 'white', lineHeight: 1.7 }}>
                  {COMPANY.legalName}<br />
                  {COMPANY.registeredOffice}
                </p>
                <p style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '8px' }}>
                  Company No: {COMPANY.companyNumber} · {COMPANY.operatorLicenceNumber
                    ? `TfL Operator Licence: ${COMPANY.operatorLicenceNumber}`
                    : 'TfL Operator Licence: application pending'}
                </p>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="glass-card" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', marginBottom: '8px' }}>Send a Message</h2>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '24px' }}>We respond within 2 hours during business hours.</p>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <Field label="First Name *" error={errors.firstName?.message}>
                  <input {...register('firstName', { required: 'Required' })} style={inp} placeholder="First name" />
                </Field>
                <Field label="Last Name *" error={errors.lastName?.message}>
                  <input {...register('lastName', { required: 'Required' })} style={inp} placeholder="Last name" />
                </Field>
              </div>
              <Field label="Email *" error={errors.email?.message}>
                <input {...register('email', { required: 'Required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid' } })} type="email" style={inp} placeholder="your@email.com" />
              </Field>
              <Field label="Phone *" error={errors.phone?.message}>
                <input {...register('phone', { required: 'Required' })} type="tel" style={inp} placeholder="+44 7700 000000" />
              </Field>
              <Field label="Subject *" error={errors.subject?.message}>
                <select {...register('subject', { required: 'Required' })} style={inp}>
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
                <textarea {...register('message', { required: 'Required' })} style={{ ...inp, minHeight: '120px', resize: 'vertical' }}
                  placeholder="How can we help you?" />
              </Field>

              {error && (
                <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '8px', padding: '14px', color: '#F87171', fontSize: '0.875rem' }}>
                  ⚠ {error}
                </div>
              )}

              <button type="submit" className="btn-primary" style={{ padding: '14px', opacity: submitting ? 0.6 : 1 }} disabled={submitting}>
                {submitting ? 'Sending…' : 'Send Message →'}
              </button>
              <p style={{ fontSize: '0.72rem', color: '#94A3B8', lineHeight: 1.6 }}>
                By submitting this form you agree to our <Link to="/privacy" style={{ color: '#A855F7' }}>Privacy Policy</Link>.
                Enquiries submitted here are retained for 12 months.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}