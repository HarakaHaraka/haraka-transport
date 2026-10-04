// Header band shared by every inner page: small red-bar label, big title,
// optional intro line, 2px rule underneath.
export default function PageHead({ label, title, intro, children }) {
  return (
    <header className="hk-pagehead">
      {label && <p className="hk-kicker">{label}</p>}
      <h1 className="hk-pagehead__title">{title}</h1>
      {intro && <p className="hk-pagehead__intro">{intro}</p>}
      {children}
    </header>
  )
}
