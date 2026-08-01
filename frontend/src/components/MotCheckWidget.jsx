import { useState } from 'react'

const API = 'https://harakatransport.co.uk'

// Public-facing MOT lookup on /verify. Posts to our own backend
// (POST /api/public/mot-check), which is rate-limited and returns only a
// minimal summary — never the full DVSA history to an anonymous visitor.
export default function MotCheckWidget() {
  const [registration, setRegistration] = useState('')
  const [state, setState] = useState('idle') // idle | loading | done | error
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!registration.trim()) return
    setState('loading'); setError(''); setResult(null)
    try {
      const res = await fetch(`${API}/api/public/mot-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration: registration.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not check that registration right now.')
      setResult(data)
      setState('done')
    } catch (err) {
      setError(err.message || 'Could not check that registration right now.')
      setState('error')
    }
  }

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <p style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A855F7', marginBottom: '10px', fontWeight: 700 }}>
        Check a vehicle's MOT
      </p>
      <form onSubmit={onSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          className="input-field"
          style={{ flex: '1 1 180px' }}
          placeholder="e.g. AB12 CDE"
          value={registration}
          onChange={(e) => setRegistration(e.target.value.toUpperCase())}
          maxLength={10}
        />
        <button type="submit" className="btn-outline" disabled={state === 'loading'}>
          {state === 'loading' ? 'Checking…' : 'Check'}
        </button>
      </form>

      {state === 'error' && (
        <p style={{ color: '#F87171', fontSize: '0.85rem', marginTop: '12px' }}>{error}</p>
      )}

      {state === 'done' && result && (
        <div style={{ marginTop: '14px', fontSize: '0.88rem', color: '#CBD5E1', lineHeight: 1.8 }}>
          <p><strong style={{ color: 'white' }}>Status:</strong> {result.motStatus || 'Unknown'}</p>
          {result.motExpiryDate && <p><strong style={{ color: 'white' }}>Expiry date:</strong> {result.motExpiryDate}</p>}
          {result.testDate && <p><strong style={{ color: 'white' }}>Last test date:</strong> {result.testDate}</p>}
        </div>
      )}

      <p style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '14px', lineHeight: 1.6 }}>
        Contains public sector information licensed under the Open Government Licence v3.0.
        MOT data supplied by the Driver and Vehicle Standards Agency.
      </p>
    </div>
  )
}
