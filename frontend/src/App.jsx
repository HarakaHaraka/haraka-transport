import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar         from './components/Navbar'
import HomePage       from './pages/HomePage'
import QuotePage      from './pages/QuotePage'
import BookingPage    from './pages/BookingPage'
import { ConfirmPage } from './pages/ConfirmPage'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"        element={<HomePage />} />
        <Route path="/quote"   element={<QuotePage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/confirm" element={<ConfirmPage />} />
      </Routes>
    </BrowserRouter>
  )
}