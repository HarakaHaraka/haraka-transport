import { Link } from 'react-router-dom'
import { COMPANY } from '../config/company'
import PageHead from './PageHead'

// Shared shell for the compliance/policy pages so ~10 pages share one
// layout instead of each re-implementing the same container/heading markup.

export function PolicyPage({ title, badge, intro, children }) {
  return (
    <main className="hk-page">
      <PageHead label={badge} title={title} intro={intro} />
      <div className="hk-policy">
        {children}
      </div>
    </main>
  )
}

// With a heading: heading on the left, text on the right.
// Without one: the content runs the full width.
export function PolicySection({ heading, children }) {
  return (
    <section className={`hk-policy__section${heading ? '' : ' hk-policy__section--full'}`}>
      {heading && <h2 className="hk-policy__heading">{heading}</h2>}
      <div className="hk-policy__text">
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
    <div className="hk-tablewrap">
      <table className="hk-table">
        <thead>
          <tr>
            {headers.map((h, i) => <th key={i} scope="col">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => <td key={j}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Plain or emphasised call-out box for a policy page.
export function PolicyNote({ strong = false, children }) {
  return <div className={`hk-note${strong ? ' hk-note--strong' : ''}`}>{children}</div>
}

export function PolicyReference({ policyName, reference }) {
  return (
    <p className="hk-policy__ref">
      This summary reflects our full {policyName}, reference {reference}, version {COMPANY.policyVersion},
      approved {COMPANY.policyApproved}. The full policy is available on request from{' '}
      <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
    </p>
  )
}

export function PolicyLink({ to, children }) {
  return <Link className="hk-link" to={to}>{children}</Link>
}
