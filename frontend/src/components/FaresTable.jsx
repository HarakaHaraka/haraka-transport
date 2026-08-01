import { PolicyTable } from './PolicyPage'

// Shared by /fares and the Terms page's "Fares and payment" section.
export default function FaresTable({ compact = false }) {
  const headers = ['Factor', 'How it affects your fare']
  const rows = [
    ['Distance travelled', 'Longer routes cost more; every quote is based on the actual pick-up and destination.'],
    ['Time of day / duration', 'Journeys at unsociable hours or with a longer expected duration are reflected in the quote.'],
    ['Number of passengers', 'Group size can affect the vehicle required.'],
    ['Vehicle type', 'Standard, larger, or wheelchair accessible vehicles are priced according to the vehicle assigned.'],
    ['Passenger assistant', 'Where a passenger assistant is required, this is included in the quote.'],
    ['Waiting time / stops', 'Beyond the included allowance, extra waiting time or added stops may be charged — always explained to you first.'],
    ['Special requirements', 'Anything notified at booking (equipment, extra time, specific vehicle needs) is factored in.'],
  ]
  return <PolicyTable headers={headers} rows={compact ? rows.slice(0, 4) : rows} />
}
