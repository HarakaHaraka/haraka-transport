import { COMPANY } from '../config/company'

// Side panel for the Booking and Quote pages: the phone route, for anyone
// who would rather talk than fill in a form.
export default function CallUs() {
  return (
    <aside className="hk-aside">
      <p className="hk-aside__label">Prefer to talk?</p>
      <a className="hk-aside__phone" href={`tel:${COMPANY.phone.replace(/\s+/g, '')}`}>{COMPANY.phone}</a>
      <p>Bookings line open {COMPANY.bookingsLineHours}.</p>
      <p>
        Or email <a href={`mailto:${COMPANY.bookingsEmail}`}>{COMPANY.bookingsEmail}</a>
      </p>
      <p>All journeys are pre-booked. We do not accept street hails.</p>
    </aside>
  )
}
