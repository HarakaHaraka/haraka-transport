import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar            from './components/Navbar'
import Footer            from './components/Footer'
import ScrollToTop       from './components/ScrollToTop'
import HomePage          from './pages/HomePage'
import QuotePage         from './pages/QuotePage'
import BookingPage       from './pages/BookingPage'
import { ConfirmPage }   from './pages/ConfirmPage'
import TermsPage         from './pages/TermsPage'
import ComplaintsPage    from './pages/ComplaintsPage'
import PrivacyPage       from './pages/PrivacyPage'
import SafeguardingPage  from './pages/SafeguardingPage'
import AccessibilityPage from './pages/AccessibilityPage'
import LostPropertyPage  from './pages/LostPropertyPage'
import FaresPage         from './pages/FaresPage'
import UnaccompaniedPassengersPage from './pages/UnaccompaniedPassengersPage'
import VerifyPage        from './pages/VerifyPage'
import JoinUsPage        from './pages/JoinUsPage'
import ContactPage       from './pages/ContactPage'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/"                          element={<HomePage />} />
        <Route path="/quote"                     element={<QuotePage />} />
        <Route path="/booking"                   element={<BookingPage />} />
        <Route path="/confirm"                   element={<ConfirmPage />} />
        <Route path="/terms"                     element={<TermsPage />} />
        <Route path="/complaints"                element={<ComplaintsPage />} />
        <Route path="/privacy"                   element={<PrivacyPage />} />
        <Route path="/safeguarding"               element={<SafeguardingPage />} />
        <Route path="/accessibility"             element={<AccessibilityPage />} />
        <Route path="/lost-property"             element={<LostPropertyPage />} />
        <Route path="/fares"                     element={<FaresPage />} />
        <Route path="/unaccompanied-passengers"  element={<UnaccompaniedPassengersPage />} />
        <Route path="/verify"                    element={<VerifyPage />} />
        <Route path="/join-us"                   element={<JoinUsPage />} />
        <Route path="/contact"                   element={<ContactPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}