import { useState, useRef } from 'react'
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
      'Enhanced DBS check',
      'Right to work in the UK',
      'Smart professional appearance',
      'Excellent knowledge of London',
    ],
  },
  {
    id: 'sen-driver',
    title: 'SEN Transport & School Run Driver',
    icon: '🧒',
    colour: '#F59E0B',
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
    icon: '🤝',
    colour: '#22C55E',
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
      setError('Could not submit. Please email your application to [INSERT RECRUITMENT EMAIL]')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) return (
    <div style={{ minHeight:'100vh', background:'#0F0A1E', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 20px', paddingTop:'90px' }}>
      <div style={{ maxWidth:'480px', width:'100%', textAlign:'center' }}>
        <div style={{ width:'70px', height:'70px', borderRadius:'50%', background:'linear-gradient(135deg,#6B21A8,#A855F7)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', fontSize:'2rem' }}>✓</div>
        <span className="badge badge-purple" style={{ marginBottom:'14px', display:'inline-block' }}>Application Received</span>
        <h1 style={{ fontSize:'clamp(1.6rem,5vw,2.4rem)', fontWeight:900, color:'white', marginBottom:'12px' }}>Thank You!</h1>
        <p style={{ color:'#94A3B8', lineHeight:1.8, marginBottom:'28px', fontSize:'0.95rem' }}>
          Your application has been received. We will be in touch within 5 working days.
        </p>
        <button className="btn-primary" onClick={() => navigate('/')}>Back to Homepage</button>
      </div>
    </div>
  )

  return (
    <div style={{ background:'#0F0A1E', minHeight:'100vh', paddingTop:'80px', paddingBottom:'60px' }}>
      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'0 16px' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:'32px', padding:'0 8px' }}>
          <span className="badge badge-gold" style={{ marginBottom:'12px', display:'inline-block' }}>We Are Hiring</span>
          <h1 style={{ fontSize:'clamp(1.8rem,6vw,3rem)', fontWeight:900, color:'white', marginBottom:'10px', lineHeight:1.15 }}>
            Join Haraka Transport
          </h1>
          <p style={{ color:'#94A3B8', fontSize:'clamp(0.85rem,2.5vw,1rem)', maxWidth:'500px', margin:'0 auto', lineHeight:1.7 }}>
            Select a role below then complete the application form.
          </p>
        </div>

        {/* Role cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'14px', marginBottom:'32px' }}>
          {ROLES.map(role => (
            <div key={role.id}
              style={{
                border:`2px solid ${selectedRole===role.id ? role.colour : 'rgba(168,85,247,0.2)'}`,
                borderRadius:'16px', background: selectedRole===role.id
                  ? `rgba(${role.colour==='#A855F7'?'168,85,247':role.colour==='#F59E0B'?'245,158,11':'34,197,94'},0.1)`
                  : 'rgba(26,16,51,0.7)',
                overflow:'hidden', transition:'all 0.3s ease',
              }}>
              {/* Card top */}
              <div style={{ padding:'22px 20px 16px' }}>
                <div style={{ fontSize:'2.4rem', marginBottom:'10px' }}>{role.icon}</div>
                <h3 style={{ fontSize:'clamp(0.95rem,2.5vw,1.1rem)', fontWeight:800, color:'white', marginBottom:'8px', lineHeight:1.3 }}>
                  {role.title}
                </h3>
                <p style={{ fontSize:'0.82rem', color:'#94A3B8', lineHeight:1.6, marginBottom:'14px' }}>
                  {role.desc}
                </p>

                {/* Requirements */}
                <div style={{ marginBottom:'16px' }}>
                  {role.requirements.map((r, i) => (
                    <div key={i} style={{ display:'flex', gap:'8px', marginBottom:'5px', alignItems:'flex-start' }}>
                      <span style={{ color:role.colour, flexShrink:0, fontSize:'0.85rem', marginTop:'1px' }}>✓</span>
                      <span style={{ fontSize:'0.78rem', color:'#94A3B8', lineHeight:1.5 }}>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Apply button — large and clear */}
              <button
                onClick={() => selectRole(role.id)}
                style={{
                  width:'100%', padding:'16px',
                  background: selectedRole===role.id
                    ? `linear-gradient(135deg, ${role.colour}, ${role.colour}dd)`
                    : 'rgba(255,255,255,0.06)',
                  border:'none', cursor:'pointer',
                  color: selectedRole===role.id ? (role.colour==='#F59E0B'?'#0F0A1E':'white') : role.colour,
                  fontSize:'0.95rem', fontWeight:800,
                  letterSpacing:'0.04em',
                  borderTop:`1px solid ${role.colour}33`,
                  transition:'all 0.3s ease',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                }}>
                {selectedRole===role.id
                  ? '✓ Selected — Fill Form Below ↓'
                  : `Apply for This Role →`}
              </button>
            </div>
          ))}
        </div>

        {/* Application form */}
        <div ref={formRef} className="glass-card" style={{ padding:'clamp(20px,5vw,36px)', scrollMarginTop:'90px' }}>
          <div style={{ marginBottom:'24px', paddingBottom:'16px', borderBottom:'1px solid rgba(168,85,247,0.15)' }}>
            <h2 style={{ fontSize:'clamp(1.1rem,3vw,1.4rem)', fontWeight:800, color:'white', marginBottom:'6px' }}>
              Application Form
            </h2>
            <p style={{ color:'#94A3B8', fontSize:'0.85rem' }}>
              {selectedRole
                ? `Applying for: ${ROLES.find(r=>r.id===selectedRole)?.title}`
                : '⬆ Select a role above to apply'}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

            {/* Personal details */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'14px' }}>
              <Field label="First Name" required error={errors.firstName?.message}>
                <input {...register('firstName',{required:'Required'})} style={inp} placeholder="First name" />
              </Field>
              <Field label="Last Name" required error={errors.lastName?.message}>
                <input {...register('lastName',{required:'Required'})} style={inp} placeholder="Last name" />
              </Field>
            </div>

            <Field label="Email Address" required error={errors.email?.message}>
              <input {...register('email',{required:'Required',pattern:{value:/\S+@\S+\.\S+/,message:'Invalid email'}})} type="email" style={inp} placeholder="your@email.com" />
            </Field>

            <Field label="Phone Number" required error={errors.phone?.message}>
              <input {...register('phone',{required:'Required'})} type="tel" style={inp} placeholder="+44 7700 000000" />
            </Field>

            <Field label="Full Address" required error={errors.address?.message}>
              <input {...register('address',{required:'Required'})} style={inp} placeholder="Full address including postcode" />
            </Field>

            <Field label="Right to Work in UK" required error={errors.rightToWork?.message}>
              <select {...register('rightToWork',{required:'Required'})} style={inp}>
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
                  <input {...register('pcoLicence',{required:'Required for this role'})} style={inp} placeholder="e.g. 123456789" />
                </Field>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'14px' }}>
                  <Field label="DVLA Licence Number" required error={errors.dvlaLicence?.message}>
                    <input {...register('dvlaLicence',{required:'Required'})} style={inp} placeholder="e.g. SMITH901234AB" />
                  </Field>
                  <Field label="Penalty Points">
                    <select {...register('dvlaPoints')} style={inp}>
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
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'14px' }}>
                  <Field label="DBS Certificate Number">
                    <input {...register('dbsNumber')} style={inp} placeholder="Leave blank if not held" />
                  </Field>
                  <Field label="DBS Update Service">
                    <select {...register('dbsUpdateService')} style={inp}>
                      <option value="">— Select —</option>
                      <option>Yes — registered</option>
                      <option>No — willing to register</option>
                      <option>Not yet obtained</option>
                    </select>
                  </Field>
                </div>
                <Field label="Safeguarding Training">
                  <select {...register('safeguardingTraining')} style={inp}>
                    <option value="">— Select —</option>
                    <option>Level 1 — completed</option>
                    <option>Level 2 — completed</option>
                    <option>Not completed — willing to complete</option>
                  </select>
                </Field>
                <Field label="First Aid Certificate">
                  <select {...register('firstAid')} style={inp}>
                    <option value="">— Select —</option>
                    <option>Paediatric First Aid — valid</option>
                    <option>Emergency First Aid — valid</option>
                    <option>Expired — willing to renew</option>
                    <option>Not held — willing to complete</option>
                  </select>
                </Field>
                <Field label="SEN Experience">
                  <textarea {...register('senExperience')} style={{...inp,minHeight:'80px',resize:'vertical'}}
                    placeholder="Describe any experience with SEN children or adults…" />
                </Field>
              </>
            )}

            {/* PA specific */}
            {selectedRole==='passenger-assistant' && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'14px' }}>
                <Field label="Moving & Handling Training">
                  <select {...register('movingHandling')} style={inp}>
                    <option value="">— Select —</option>
                    <option>Completed — valid</option>
                    <option>Expired — willing to renew</option>
                    <option>Not held — willing to complete</option>
                  </select>
                </Field>
                <Field label="Autism Awareness">
                  <select {...register('autismAwareness')} style={inp}>
                    <option value="">— Select —</option>
                    <option>Completed</option>
                    <option>Willing to complete</option>
                  </select>
                </Field>
              </div>
            )}

            {/* Common fields */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'14px' }}>
              <Field label="Employment Status">
                <select {...register('employmentStatus')} style={inp}>
                  <option value="">— Select —</option>
                  <option>Employed full time</option>
                  <option>Employed part time</option>
                  <option>Self employed</option>
                  <option>Seeking work</option>
                </select>
              </Field>
              <Field label="Availability">
                <select {...register('availability')} style={inp}>
                  <option value="">— Select —</option>
                  <option>Full time — any days</option>
                  <option>Part time — weekdays</option>
                  <option>School hours only</option>
                  <option>Flexible</option>
                </select>
              </Field>
            </div>

            <Field label="How Did You Hear About Us?">
              <select {...register('referralSource')} style={inp}>
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
              <textarea {...register('additionalInfo')} style={{...inp,minHeight:'90px',resize:'vertical'}}
                placeholder="Tell us anything else relevant to your application…" />
            </Field>

            {/* Document uploads */}
            <div style={{ borderTop:'1px solid rgba(168,85,247,0.15)', paddingTop:'20px' }}>
              <p style={{ fontSize:'0.9rem', fontWeight:700, color:'white', marginBottom:'6px' }}>Document Uploads</p>
              <p style={{ fontSize:'0.78rem', color:'#94A3B8', marginBottom:'16px', lineHeight:1.6 }}>
                PDF and Word (.docx) only · Max 5MB per file
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
                <div key={name} style={{ marginBottom:'12px' }}>
                  <label className="field-label">{label}{required?' *':' (optional)'}</label>
                  <input type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={e => handleFileChange(name, e.target.files[0])}
                    style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(168,85,247,0.3)', color:'white', padding:'10px 14px', borderRadius:'8px', fontSize:'0.85rem', cursor:'pointer' }}
                  />
                  {fileErrors[name] && <p className="field-error">{fileErrors[name]}</p>}
                  {uploadedFiles[name] && (
                    <p style={{ fontSize:'0.75rem', color:'#22C55E', marginTop:'4px' }}>✓ {uploadedFiles[name].name}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Declaration */}
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'8px', padding:'14px' }}>
              <label style={{ display:'flex', gap:'10px', alignItems:'flex-start', cursor:'pointer' }}>
                <input type="checkbox" {...register('declaration',{required:'You must confirm this declaration'})} style={{ marginTop:'3px', flexShrink:0 }} />
                <span style={{ fontSize:'0.78rem', color:'#94A3B8', lineHeight:1.7 }}>
                  I confirm all information provided is true and accurate. I consent to Haraka Transport Ltd processing my personal data for recruitment purposes.
                </span>
              </label>
              {errors.declaration && <p className="field-error">{errors.declaration.message}</p>}
            </div>

            {error && (
              <div style={{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.3)', borderRadius:'8px', padding:'14px', color:'#F87171', fontSize:'0.875rem' }}>
                ⚠ {error}
              </div>
            )}

            <button type="submit" className="btn-primary"
              style={{ fontSize:'1rem', padding:'18px', opacity:submitting?0.6:1, width:'100%' }}
              disabled={submitting||!selectedRole}>
              {submitting ? 'Submitting…' : 'Submit Application →'}
            </button>

            {!selectedRole && (
              <p style={{ textAlign:'center', fontSize:'0.8rem', color:'#94A3B8' }}>
                ⬆ Please select a role at the top before submitting
              </p>
            )}
          </form>
        </div>

        <div style={{ display:'flex', justifyContent:'center', marginTop:'20px' }}>
          <button className="btn-outline" onClick={() => navigate('/')} style={{ fontSize:'0.85rem' }}>
            Back to Homepage
          </button>
        </div>
      </div>
    </div>
  )
}