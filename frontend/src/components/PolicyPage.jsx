import { Link } from 'react-router-dom'
import { COMPANY } from '../config/company'

// Shared shell for the compliance/policy pages so ~10 pages share one
// layout instead of each re-implementing the same container/heading markup.

export function PolicyPage({ title, badge, intro, children }) {
  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh', paddingTop: '90px', paddingBottom: '60px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 24px' }}>
        {badge && (
          <span className="badge badge-purple" style={{ marginBottom: '14px', display: 'inline-block' }}>{badge}</span>
        )}
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.6rem)', fontWeight: 900, color: 'white', marginBottom: '8px' }}>{title}</h1>
        <div className="gold-line" />
        {intro && (
          <p style={{ color: 'var(--silver)', fontSize: '1rem', lineHeight: 1.8, marginBottom: '32px', maxWidth: '680px' }}>{intro}</p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export function PolicySection({ heading, children }) {
  return (
    <section>
      {heading && (
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#A855F7', marginBottom: '12px' }}>{heading}</h2>
      )}
      <div style={{ color: '#CBD5E1', fontSize: '0.92rem', lineHeight: 1.85, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {children}
      </div>
    </section>
  )
}

// Splits on blank lines into paragraphs; single newlines become <br/>.
export function Prose({ text }) {
  const paragraphs = text.trim().split(/\n\s*\n/)
  return paragraphs.map((p, i) => (
    <p key={i}>
      {p.split('\n').map((line, j, arr) => (
        <span key={j}>{line}{j < arr.length - 1 && <br />}</span>
      ))}
    </p>
  ))
}

export function PolicyTable({ headers, rows }) {
  return (
    <div style={{ overflowX: 'auto', border: '1px solid rgba(168,85,247,0.25)', borderRadius: '12px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{
                textAlign: 'left', padding: '10px 14px', background: 'rgba(168,85,247,0.12)',
                color: '#A855F7', fontWeight: 700, whiteSpace: 'normal', borderBottom: '1px solid rgba(168,85,247,0.25)',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderTop: i > 0 ? '1px solid rgba(168,85,247,0.12)' : 'none' }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '10px 14px', color: '#CBD5E1', whiteSpace: 'normal', verticalAlign: 'top' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function PolicyReference({ policyName, reference }) {
  return (
    <p style={{
      marginTop: '8px', fontSize: '0.78rem', color: 'var(--silver)',
      borderTop: '1px solid rgba(168,85,247,0.15)', paddingTop: '20px', lineHeight: 1.7,
    }}>
      This summary reflects our full {policyName}, reference {reference}, version {COMPANY.policyVersion},
      approved {COMPANY.policyApproved}. The full policy is available on request from{' '}
      <a href={`mailto:${COMPANY.email}`} style={{ color: '#A855F7' }}>{COMPANY.email}</a>.
    </p>
  )
}

export function PolicyLink({ to, children }) {
  return <Link to={to} style={{ color: '#A855F7', textDecoration: 'underline' }}>{children}</Link>
}
