import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// React Router doesn't reset scroll position on navigation — without
// this, clicking a link while scrolled down a page (e.g. Terms →
// Safeguarding from a mid-page cross-link) lands on the next page at
// the same pixel offset instead of its top. Renders nothing; just
// resets scroll whenever the route path changes.
export default function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}
