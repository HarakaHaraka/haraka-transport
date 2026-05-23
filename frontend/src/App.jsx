import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar            from './components/Navbar'
import HomePage          from './pages/HomePage'
import QuotePage         from './pages/QuotePage'
import BookingPage       from './pages/BookingPage'
import { ConfirmPage }   from './pages/ConfirmPage'
import TermsPage         from './pages/TermsPage'
import ComplaintsPage    from './pages/ComplaintsPage'
import JoinUsPage        from './pages/JoinUsPage'
import ContactPage       from './pages/ContactPage'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"          element={<HomePage />} />
        <Route path="/quote"     element={<QuotePage />} />
        <Route path="/booking"   element={<BookingPage />} />
        <Route path="/confirm"   element={<ConfirmPage />} />
        <Route path="/terms"     element={<TermsPage />} />
        <Route path="/complaints"element={<ComplaintsPage />} />
        <Route path="/join-us"   element={<JoinUsPage />} />
        <Route path="/contact"   element={<ContactPage />} />
      </Routes>
    </BrowserRouter>
  )
}