import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

const API = 'https://harakatransport.co.uk'

const inp = {
  width: '100%', background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(168,85,247,0.3)', color: 'white',
  padding: '13px 16px', borderRadius: '8px', fontSize: '0.9rem',
  outline: 'none', fontFamily: 'inherit',
}

function Field({ label, error, children, required }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label className="field-label">{label}{required && ' *'}</label>
      {children}
      {error && <p className="field-error">{error}</p>}
    </div>
  )
}

const ROLES = [
  {
    id: 'pco-driver',
    title: 'PCO Licensed Driver',
    icon: '🚗',
    colour: '#A855F7',
    desc: 'Executive and private hire driving across London. Flexible hours, competitive rates.',
    requirements: [
      'Valid TFL PCO Driver Licence',
      'Valid DVLA driving licence (max 3 points)',
      'Enhanced DBS check (we can assist)',
      'Right to work in the UK',
      'Smart professional appearance',
      'Excellent knowledge of London',
      'Customer service experience preferred',
    ],
  },
  {
    id: 'sen-driver',
    title: 'SEN Transport Driver & School Run Driver',
    icon: '🧒',
    colour: '#F59E0B',
    tag: 'SPROC DPS',
    desc: 'Specialist school run and care transport for children and adults with Special Educational Needs. Must be patient, caring and reliable.',
    requirements: [
      'Valid TFL PCO Driver Licence',
      'Valid DVLA driving licence (max 3 points)',
      'Enhanced DBS check on DBS Update Service (mandatory)',
      'SEN awareness training (or willingness to complete)',
      'Safeguarding training Level 1 minimum',
      'First Aid certificate (paediatric preferred)',
      'MIDAS training (or willingness to complete)',
      'Right to work in the UK',
      'Patient, calm and professional manner',
      'Experience with SEN passengers preferred',
    ],
    sproc: [
      'Must be registered on DBS Update Service',
      'Annual safeguarding refresher required',
      'Comply with London borough SPROC DPS standards',
      'Subject to local authority spot checks',
      'Vehicle must meet accessibility standards where required',
    ],
  },
  {
    id: 'passenger-assistant',
    title: 'Passenger Assistant',
    icon: '🤝',
    colour: '#22C55E',
    tag: 'SPROC DPS',
    desc: 'Support and assist SEN children and adults during transport. Work alongside our drivers on school run and care routes across London boroughs.',
    requirements: [
      'Enhanced DBS check on DBS Update Service (mandatory)',
      'Safeguarding training Level 1 minimum',
      'First Aid certificate (paediatric preferred)',
      'Moving & Handling training certificate',
      'SEN awareness training',
      'Autism awareness training',
      'Epilepsy awareness (some boroughs require)',
      'Right to work in the UK',
      'Minimum 2 professional references',
      'Experience with SEN children/adults preferred',
    ],
    sproc: [
      'Must be registered on DBS Update Service',
      'Annual safeguarding and first aid refresher required',
      'Comply with Adams SPROC DPS platform standards',
      'Subject to London borough compliance checks',
      'Must complete borough-specific induction where required',
      'Food hygiene Level 2 may be required by certain boroughs',
    ],
  },
]

function RoleCard({ role, selected, onSelect }) {
  return (
    <div
      onClick={() => onSelect(role.id)}
      style={{
        border: `2px solid ${selected ? role.colour : 'rgba(168,85,247,0.2)'}`,
        borderRadius: '16px', padding: '24px', cursor: 'pointer',
        background: selected ? `rgba(${role.colour === '#A855F7' ? '168,85,247' : role.colour === '#F59E0B' ? '245,158,11' : '34,197,94'},0.08)` : 'rgba(26,16,51,0.6)',
        transition: 'all 0.3s ease',
      }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
        <div style={{ fontSize: '2rem' }}>{role.icon}</div>
        <div>
          {role.tag && (
            <span style={{ fontSize: '0.65rem', padding: '3px 8px', borderRadius: '20px', background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '6px', display: 'inline-block' }}>
              {role.tag}
            </span>
          )}
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>{role.title}</h3>
        </div>
      </div>
      <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.6, marginBottom: '16px' }}>{role.desc}</p>

      <div style={{ marginBottom: role.sproc ? '14px' : 0 }}>
        <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: role.colour, marginBottom: '8px' }}>Requirements</p>
        {role.requirements.map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
            <span style={{ color: role.colour, flexShrink: 0 }}>✓</span>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{r}</span>
          </div>
        ))}
      </div>

      {role.sproc && (
        <div style={{ marginTop: '14px', padding: '12px', borderRadius: '8px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#F59E0B', marginBottom: '8px' }}>SPROC DPS Compliance</p>
          {role.sproc.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
              <span style={{ color: '#F59E0B', flexShrink: 0 }}>◆</span>
              <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{r}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: selected ? role.colour : '#94A3B8', fontWeight: selected ? 700 : 400 }}>
          {selected ? '✓ Selected — complete form below' : 'Click to apply for this role'}
        </span>
      </div>
    </div>
  )
}

export default function JoinUsPage() {
  const [selectedRole, setSelectedRole] = useState(null)
  const [submitted, setSubmitted]       = useState(false)
  const [submitting, setSubmitting]     = useState(false)
  const [error, setError]               = useState(null)
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    if (!selectedRole) { setError('Please select a role above before submitting.'); return }
    setSubmitting(true); setError(null)
    try {
      const res = await fetch(`${API}/api/recruitment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, role: selectedRole }),
      })
      if (!res.ok) throw new Error()
      setSubmitted(true)
    } catch {
      setError('Could not submit. Please email your application to [INSERT RECRUITMENT EMAIL]')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) return (
    <div style={{ minHeight: '100vh', background: '#0F0A1E', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', paddingTop: '90px' }}>
      <div style={{ maxWidth: '520px', width: '100%', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #6B21A8, #A855F7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '2.2rem' }}>✓</div>
        <span className="badge badge-purple" style={{ marginBottom: '16px', display: 'inline-block' }}>Application Received</span>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'white', marginBottom: '12px' }}>Thank You!</h1>
        <p style={{ color: '#94A3B8', lineHeight: 1.8, marginBottom: '32px' }}>
          Your application has been received. We will review it and be in touch within 5 working days.
        </p>
        <button className="btn-primary" onClick={() => navigate('/')}>Back to Homepage</button>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#0F0A1E', minHeight: '100vh', paddingTop: '90px', paddingBottom: '60px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="badge badge-gold" style={{ marginBottom: '14px', display: 'inline-block' }}>We Are Hiring</span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: 'white', marginBottom: '12px' }}>
            Join Haraka Transport
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '1rem', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>
            We are looking for professional, caring and reliable people to join our growing team.
            Select a role below and complete the application form.
          </p>
        </div>

        {/* Role cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '48px' }}>
          {ROLES.map(role => (
            <RoleCard key={role.id} role={role} selected={selectedRole === role.id} onSelect={setSelectedRole} />
          ))}
        </div>

        {/* Application form */}
        <div className="glass-card" style={{ padding: '36px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'white', marginBottom: '8px' }}>Application Form</h2>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem', marginBottom: '28px' }}>
            {selectedRole
              ? `Applying for: ${ROLES.find(r => r.id === selectedRole)?.title}`
              : 'Select a role above then complete the form below.'}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Field label="First Name" required error={errors.firstName?.message}>
                <input {...register('firstName', { required: 'Required' })} style={inp} placeholder="First name" />
              </Field>
              <Field label="Last Name" required error={errors.lastName?.message}>
                <input {...register('lastName', { required: 'Required' })} style={inp} placeholder="Last name" />
              </Field>
            </div>

            <Field label="Email Address" required error={errors.email?.message}>
              <input {...register('email', { required: 'Required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })} type="email" style={inp} placeholder="your@email.com" />
            </Field>

            <Field label="Phone Number" required error={errors.phone?.message}>
              <input {...register('phone', { required: 'Required' })} type="tel" style={inp} placeholder="+44 7700 000000" />
            </Field>

            <Field label="Address" required error={errors.address?.message}>
              <input {...register('address', { required: 'Required' })} style={inp} placeholder="Full address including postcode" />
            </Field>

            <Field label="Right to Work in UK" required error={errors.rightToWork?.message}>
              <select {...register('rightToWork', { required: 'Required' })} style={inp}>
                <option value="">— Select —</option>
                <option>British Citizen / Indefinite Leave to Remain</option>
                <option>EU Settled Status</option>
                <option>Work Visa (please specify in notes)</option>
                <option>Other (please specify in notes)</option>
              </select>
            </Field>

            {/* PCO Driver specific */}
            {(selectedRole === 'pco-driver' || selectedRole === 'sen-driver') && (
              <>
                <Field label="TFL PCO Driver Licence Number" required error={errors.pcoLicence?.message}>
                  <input {...register('pcoLicence', { required: 'Required for this role' })} style={inp} placeholder="e.g. 123456789" />
                </Field>
                <Field label="DVLA Licence Number" required error={errors.dvlaLicence?.message}>
                  <input {...register('dvlaLicence', { required: 'Required' })} style={inp} placeholder="e.g. SMITH901234AB1CD" />
                </Field>
                <Field label="DVLA Licence Points">
                  <select {...register('dvlaPoints')} style={inp}>
                    <option value="0">0 points</option>
                    <option value="1-3">1-3 points</option>
                    <option value="4-6">4-6 points</option>
                    <option value="6+">More than 6 points</option>
                  </select>
                </Field>
              </>
            )}

            {/* SEN/PA specific */}
            {(selectedRole === 'sen-driver' || selectedRole === 'passenger-assistant') && (
              <>
                <Field label="DBS Certificate Number (if held)">
                  <input {...register('dbsNumber')} style={inp} placeholder="Leave blank if not yet obtained" />
                </Field>
                <Field label="Are you on the DBS Update Service?">
                  <select {...register('dbsUpdateService')} style={inp}>
                    <option value="">— Select —</option>
                    <option>Yes — currently registered</option>
                    <option>No — but willing to register</option>
                    <option>No — not yet obtained DBS</option>
                  </select>
                </Field>
                <Field label="Safeguarding Training">
                  <select {...register('safeguardingTraining')} style={inp}>
                    <option value="">— Select —</option>
                    <option>Level 1 — completed</option>
                    <option>Level 2 — completed</option>
                    <option>Level 3 — completed</option>
                    <option>Not yet completed — willing to complete</option>
                  </select>
                </Field>
                <Field label="First Aid Certificate">
                  <select {...register('firstAid')} style={inp}>
                    <option value="">— Select —</option>
                    <option>Paediatric First Aid — valid</option>
                    <option>Emergency First Aid at Work — valid</option>
                    <option>Full First Aid at Work — valid</option>
                    <option>Expired — willing to renew</option>
                    <option>Not held — willing to complete</option>
                  </select>
                </Field>
                <Field label="SEN Experience">
                  <textarea {...register('senExperience')} style={{ ...inp, minHeight: '80px', resize: 'vertical' }}
                    placeholder="Please describe any experience working with SEN children or adults..." />
                </Field>
              </>
            )}

            {/* Passenger Assistant specific */}
            {selectedRole === 'passenger-assistant' && (
              <>
                <Field label="Moving & Handling Training">
                  <select {...register('movingHandling')} style={inp}>
                    <option value="">— Select —</option>
                    <option>Completed — valid certificate</option>
                    <option>Expired — willing to renew</option>
                    <option>Not held — willing to complete</option>
                  </select>
                </Field>
                <Field label="Autism Awareness Training">
                  <select {...register('autismAwareness')} style={inp}>
                    <option value="">— Select —</option>
                    <option>Completed</option>
                    <option>Not held — willing to complete</option>
                  </select>
                </Field>
              </>
            )}

            {/* Common fields */}
            <Field label="Current Employment Status">
              <select {...register('employmentStatus')} style={inp}>
                <option value="">— Select —</option>
                <option>Employed full time</option>
                <option>Employed part time</option>
                <option>Self employed</option>
                <option>Unemployed — seeking work</option>
                <option>Student</option>
              </select>
            </Field>

            <Field label="Availability">
              <select {...register('availability')} style={inp}>
                <option value="">— Select —</option>
                <option>Full time — any days</option>
                <option>Part time — weekdays only</option>
                <option>Part time — weekends only</option>
                <option>School hours only (term time)</option>
                <option>Flexible — discuss at interview</option>
              </select>
            </Field>

            <Field label="How did you hear about us?">
              <select {...register('referralSource')} style={inp}>
                <option value="">— Select —</option>
                <option>Indeed / Job board</option>
                <option>Google Search</option>
                <option>Word of mouth</option>
                <option>Social media</option>
                <option>Local authority / council referral</option>
                <option>Other</option>
              </select>
            </Field>

            <Field label="Additional Information">
              <textarea {...register('additionalInfo')} style={{ ...inp, minHeight: '100px', resize: 'vertical' }}
                placeholder="Tell us anything else relevant to your application..." />
            </Field>

            {/* SPROC declaration */}
            {(selectedRole === 'sen-driver' || selectedRole === 'passenger-assistant') && (
              <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', padding: '16px' }}>
                <p style={{ fontSize: '0.8rem', color: '#F59E0B', fontWeight: 700, marginBottom: '8px' }}>SPROC DPS Declaration</p>
                <p style={{ fontSize: '0.78rem', color: '#94A3B8', lineHeight: 1.7, marginBottom: '12px' }}>
                  This role may require you to be compliant with the Adams SPROC Dynamic Purchasing System used by London boroughs and local authorities.
                  By applying you confirm you understand the compliance requirements and are willing to meet them.
                </p>
                <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer' }}>
                  <input type="checkbox" {...register('sproc_declaration', { required: 'You must confirm this declaration' })}
                    style={{ marginTop: '3px', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                    I confirm I understand the SPROC DPS compliance requirements and am willing to meet them to work on local authority contracts.
                  </span>
                </label>
                {errors.sproc_declaration && <p className="field-error">{errors.sproc_declaration.message}</p>}
              </div>
            )}

            {/* General declaration */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '16px' }}>
              <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer' }}>
                <input type="checkbox" {...register('declaration', { required: 'You must confirm this declaration' })}
                  style={{ marginTop: '3px', flexShrink: 0 }} />
                <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                  I confirm that the information provided in this application is true and accurate.
                  I understand that providing false information may result in my application being rejected or employment being terminated.
                  I consent to Haraka Transport Ltd processing my personal data for recruitment purposes in accordance with their Privacy Policy.
                </span>
              </label>
              {errors.declaration && <p className="field-error">{errors.declaration.message}</p>}
            </div>

            {error && (
              <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '8px', padding: '14px', color: '#F87171', fontSize: '0.875rem' }}>
                ⚠ {error}
              </div>
            )}

            <button type="submit" className="btn-primary"
              style={{ fontSize: '1rem', padding: '16px', opacity: submitting ? 0.6 : 1 }}
              disabled={submitting || !selectedRole}>
              {submitting ? 'Submitting…' : 'Submit Application →'}
            </button>
          </form>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
          <button className="btn-outline" onClick={() => navigate('/')} style={{ fontSize: '0.85rem' }}>
            Back to Homepage
          </button>
        </div>
      </div>
    </div>
  )
}