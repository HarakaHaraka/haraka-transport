import { useState, useRef, cloneElement } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { ArrowDown, ArrowRight, Baby, Car, Check, HeartHandshake } from 'lucide-react'
import { COMPANY } from '../config/company'
import PageHead from '../components/PageHead'

const API = 'https://harakatransport.co.uk'

function Field({ label, error, children, required }) {
  const id = `ju-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`
  return (
    <div className="hk-fieldset">
      <label className="hk-label" htmlFor={id}>{label}{required && ' *'}</label>
      {cloneElement(children, { id, className: 'hk-input', 'aria-invalid': !!error })}
      {error && <p className="hk-error">{error}</p>}
    </div>
  )
}

const ROLES = [
  {
    id: 'pco-driver',
    title: 'PCO Licensed Driver',
    Icon: Car,
    desc: 'Executive and private hire driving across London. Flexible hours, competitive rates.',
    requirements: [
      'Valid TFL PCO Driver Licence',
      'Valid DVLA driving licence (max 3 points)',
      'Enhanced DBS check',
      'Right to work in the UK',
      'Smart professional appearance',
      'Excellent knowledge of London',
    ],
  },
  {
    id: 'sen-driver',
    title: 'SEN Transport & School Run Driver',
    Icon: Baby,
    desc: 'Specialist school run and care transport for children and adults with Special Educational Needs.',
    requirements: [
      'Valid TFL PCO Driver Licence',
      'Valid DVLA driving licence (max 3 points)',
      'Enhanced DBS on DBS Update Service',
      'SEN awareness training',
      'Safeguarding training Level 1',
      'First Aid certificate',
      'Patient, calm and professional manner',
    ],
  },
  {
    id: 'passenger-assistant',
    title: 'Passenger Assistant',
    Icon: HeartHandshake,
    desc: 'Support SEN children and adults during transport. Work alongside our drivers on school run routes.',
    requirements: [
      'Enhanced DBS on DBS Update Service',
      'Safeguarding training Level 1',
      'First Aid certificate',
      'Moving & Handling training',
      'SEN awareness training',
      'Right to work in the UK',
      'Minimum 2 professional references',
    ],
  },
]

export default function JoinUsPage() {
  const [selectedRole, setSelectedRole]   = useState(null)
  const [submitted, setSubmitted]         = useState(false)
  const [submitting, setSubmitting]       = useState(false)
  const [error, setError]                 = useState(null)
  const [uploadedFiles, setUploadedFiles] = useState({})
  const [fileErrors, setFileErrors]       = useState({})
  const formRef  = useRef(null)
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm()

  const selectRole = (id) => {
    setSelectedRole(id)
    // Scroll to form smoothly
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const handleFileChange = (fieldName, file) => {
    if (!file) return
    const allowed = ['application/pdf','application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowed.includes(file.type)) {
      setFileErrors(prev => ({ ...prev, [fieldName]: 'Only PDF and Word (.docx) files accepted' }))
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileErrors(prev => ({ ...prev, [fieldName]: 'File must be under 5MB' }))
      return
    }
    setFileErrors(prev => ({ ...prev, [fieldName]: null }))
    setUploadedFiles(prev => ({ ...prev, [fieldName]: file }))
  }

  const onSubmit = async (data) => {
    if (!selectedRole) { setError('Please select a role above.'); return }
    if (!uploadedFiles.cvFile) { setError('Please upload your CV before submitting.'); return }
    setSubmitting(true); setError(null)
    try {
      const formData = new FormData()
      Object.entries({ ...data, role: selectedRole }).forEach(([k, v]) => {
        if (v !== undefined && v !== null) formData.append(k, v)
      })
      Object.entries(uploadedFiles).forEach(([k, file]) => {
        if (file) formData.append(k, file)
      })
      const res = await fetch(`${API}/api/recruitment`, { method: 'POST', body: formData })
      if (!res.ok) throw new Error()
      setSubmitted(true)
    } catch {
      setError(`Could not submit. Please email your application to ${COMPANY.email}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) return (
    <main className="hk-page">
      <div className="hk-done">
        <div className="hk-done__mark" aria-hidden="true"><Check size={30} strokeWidth={2.5} /></div>
        <p className="hk-kicker">Application received</p>
        <h1 className="hk-pagehead__title">Thank you.</h1>
        <p className="hk-pagehead__intro">
          Your application has been received. We will be in touch within 5 working days.
        </p>
        <button type="button" className="hk-btn hk-btn--primary hk-btn--lg" onClick={() => navigate('/')}>
          Back to homepage
        </button>
      </div>
    </main>
  )

  return (
    <main className="hk-page">
      <PageHead
        label="We are hiring"
        title={`Join ${COMPANY.tradingNames[0]}`}
        intro="Select a role below, then complete the application form."
      />

      <div className="hk-body">

        {/* Role cards */}
        <div className="hk-cards" style={{ marginBottom: '40px' }}>
          {ROLES.map(role => {
            const on = selectedRole === role.id
            return (
              <div key={role.id} className={`hk-cell hk-card hk-role${on ? ' is-on' : ''}`}>
                <div className="hk-role__body">
                  <role.Icon className="hk-card__icon" size={28} strokeWidth={2} aria-hidden="true" />
                  <h2 className="hk-card__title">{role.title}</h2>
                  <p>{role.desc}</p>
                  <ul className="hk-role__reqs">
                    {role.requirements.map((r, i) => (
                      <li key={i}>
                        <Check size={14} strokeWidth={2.5} aria-hidden="true" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  className="hk-role__pick"
                  aria-pressed={on}
                  onClick={() => selectRole(role.id)}
                >
                  {on ? 'Selected — fill in the form below' : 'Apply for this role'}
                  {on
                    ? <ArrowDown size={18} strokeWidth={2} aria-hidden="true" />
                    : <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />}
                </button>
              </div>
            )
          })}
        </div>

        {/* Application form */}
        <div ref={formRef} style={{ maxWidth: '760px', scrollMarginTop: '96px' }}>
          <form className="hk-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <h2 className="hk-form__title">Application form</h2>
            <p className="hk-form__sub">
              {selectedRole
                ? `Applying for: ${ROLES.find(r=>r.id===selectedRole)?.title}`
                : 'Select a role above to apply'}
            </p>

            {/* Personal details */}
            <div className="hk-form__row">
              <Field label="First Name" required error={errors.firstName?.message}>
                <input {...register('firstName',{required:'Required'})} placeholder="First name" />
              </Field>
              <Field label="Last Name" required error={errors.lastName?.message}>
                <input {...register('lastName',{required:'Required'})} placeholder="Last name" />
              </Field>
            </div>

            <Field label="Email Address" required error={errors.email?.message}>
              <input {...register('email',{required:'Required',pattern:{value:/\S+@\S+\.\S+/,message:'Invalid email'}})} type="email" placeholder="your@email.com" />
            </Field>

            <Field label="Phone Number" required error={errors.phone?.message}>
              <input {...register('phone',{required:'Required'})} type="tel" placeholder="+44 7700 000000" />
            </Field>

            <Field label="Full Address" required error={errors.address?.message}>
              <input {...register('address',{required:'Required'})} placeholder="Full address including postcode" />
            </Field>

            <Field label="Right to Work in UK" required error={errors.rightToWork?.message}>
              <select {...register('rightToWork',{required:'Required'})}>
                <option value="">— Select —</option>
                <option>British Citizen / Indefinite Leave to Remain</option>
                <option>EU Settled Status</option>
                <option>Work Visa</option>
                <option>Other</option>
              </select>
            </Field>

            {/* PCO/SEN driver fields */}
            {(selectedRole==='pco-driver'||selectedRole==='sen-driver') && (
              <>
                <Field label="TFL PCO Driver Licence Number" required error={errors.pcoLicence?.message}>
                  <input {...register('pcoLicence',{required:'Required for this role'})} placeholder="e.g. 123456789" />
                </Field>
                <div className="hk-form__row">
                  <Field label="DVLA Licence Number" required error={errors.dvlaLicence?.message}>
                    <input {...register('dvlaLicence',{required:'Required'})} placeholder="e.g. SMITH901234AB" />
                  </Field>
                  <Field label="Penalty Points">
                    <select {...register('dvlaPoints')}>
                      <option value="0">0 points</option>
                      <option value="1-3">1-3 points</option>
                      <option value="4-6">4-6 points</option>
                      <option value="6+">More than 6</option>
                    </select>
                  </Field>
                </div>
              </>
            )}

            {/* SEN/PA fields */}
            {(selectedRole==='sen-driver'||selectedRole==='passenger-assistant') && (
              <>
                <div className="hk-form__row">
                  <Field label="DBS Certificate Number">
                    <input {...register('dbsNumber')} placeholder="Leave blank if not held" />
                  </Field>
                  <Field label="DBS Update Service">
                    <select {...register('dbsUpdateService')}>
                      <option value="">— Select —</option>
                      <option>Yes — registered</option>
                      <option>No — willing to register</option>
                      <option>Not yet obtained</option>
                    </select>
                  </Field>
                </div>
                <Field label="Safeguarding Training">
                  <select {...register('safeguardingTraining')}>
                    <option value="">— Select —</option>
                    <option>Level 1 — completed</option>
                    <option>Level 2 — completed</option>
                    <option>Not completed — willing to complete</option>
                  </select>
                </Field>
                <Field label="First Aid Certificate">
                  <select {...register('firstAid')}>
                    <option value="">— Select —</option>
                    <option>Paediatric First Aid — valid</option>
                    <option>Emergency First Aid — valid</option>
                    <option>Expired — willing to renew</option>
                    <option>Not held — willing to complete</option>
                  </select>
                </Field>
                <Field label="SEN Experience">
                  <textarea {...register('senExperience')} rows={3}
                    placeholder="Describe any experience with SEN children or adults…" />
                </Field>
              </>
            )}

            {/* PA specific */}
            {selectedRole==='passenger-assistant' && (
              <div className="hk-form__row">
                <Field label="Moving & Handling Training">
                  <select {...register('movingHandling')}>
                    <option value="">— Select —</option>
                    <option>Completed — valid</option>
                    <option>Expired — willing to renew</option>
                    <option>Not held — willing to complete</option>
                  </select>
                </Field>
                <Field label="Autism Awareness">
                  <select {...register('autismAwareness')}>
                    <option value="">— Select —</option>
                    <option>Completed</option>
                    <option>Willing to complete</option>
                  </select>
                </Field>
              </div>
            )}

            {/* Common fields */}
            <div className="hk-form__row">
              <Field label="Employment Status">
                <select {...register('employmentStatus')}>
                  <option value="">— Select —</option>
                  <option>Employed full time</option>
                  <option>Employed part time</option>
                  <option>Self employed</option>
                  <option>Seeking work</option>
                </select>
              </Field>
              <Field label="Availability">
                <select {...register('availability')}>
                  <option value="">— Select —</option>
                  <option>Full time — any days</option>
                  <option>Part time — weekdays</option>
                  <option>School hours only</option>
                  <option>Flexible</option>
                </select>
              </Field>
            </div>

            <Field label="How Did You Hear About Us?">
              <select {...register('referralSource')}>
                <option value="">— Select —</option>
                <option>Indeed / Job board</option>
                <option>Google Search</option>
                <option>Word of mouth</option>
                <option>Social media</option>
                <option>Council referral</option>
                <option>Other</option>
              </select>
            </Field>

            <Field label="Additional Information">
              <textarea {...register('additionalInfo')} rows={4}
                placeholder="Tell us anything else relevant to your application…" />
            </Field>

            {/* Document uploads */}
            <hr className="hk-form__rule" />
            <div>
              <h3 className="hk-form__title">Document uploads</h3>
              <p className="hk-small" style={{ marginBottom: '16px' }}>
                PDF and Word (.docx) only. Maximum 5MB per file.
              </p>

              {[
                {name:'cvFile',           label:'CV / Resume',                   required:true },
                {name:'dbsFile',          label:'DBS Certificate (if held)',      required:false},
                {name:'firstAidFile',     label:'First Aid Certificate (if held)',required:false},
                {name:'safeguardingFile', label:'Safeguarding Certificate',       required:false},
                {name:'pcoLicenceFile',   label:'PCO Licence (drivers only)',     required:false},
                {name:'dvlaLicenceFile',  label:'DVLA Licence (drivers only)',    required:false},
                {name:'senTrainingFile',  label:'SEN Training Certificate',       required:false},
                {name:'movingHandlingFile',label:'Moving & Handling Certificate', required:false},
                {name:'otherDocFile',     label:'Any Other Document',            required:false},
              ].map(({name,label,required}) => (
                <div key={name} className="hk-fieldset" style={{ marginBottom: '12px' }}>
                  <label className="hk-label" htmlFor={`ju-file-${name}`}>{label}{required?' *':' (optional)'}</label>
                  <input type="file"
                    id={`ju-file-${name}`}
                    className="hk-input"
                    accept=".pdf,.doc,.docx"
                    onChange={e => handleFileChange(name, e.target.files[0])}
                  />
                  {fileErrors[name] && <p className="hk-error">{fileErrors[name]}</p>}
                  {uploadedFiles[name] && (
                    <p className="hk-ok">Attached: {uploadedFiles[name].name}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Declaration */}
            <div className="hk-note">
              <label className="hk-check">
                <input type="checkbox" {...register('declaration',{required:'You must confirm this declaration'})} />
                <span>
                  I confirm all information provided is true and accurate. I consent to {COMPANY.legalName} processing my personal data for recruitment purposes.
                </span>
              </label>
              {errors.declaration && <p className="hk-error" style={{ marginTop: '8px' }}>{errors.declaration.message}</p>}
            </div>

            {error && <div className="hk-alert" role="alert">{error}</div>}

            <button type="submit" className="hk-btn hk-btn--primary hk-btn--lg hk-btn--block"
              disabled={submitting||!selectedRole}>
              {submitting ? 'Submitting…' : 'Submit application'}
            </button>

            {!selectedRole && (
              <p className="hk-small">Please select a role at the top before submitting.</p>
            )}
          </form>
        </div>

        <div style={{ marginTop: '24px' }}>
          <button type="button" className="hk-btn hk-btn--secondary" onClick={() => navigate('/')}>
            Back to homepage
          </button>
        </div>
      </div>
    </main>
  )
}
